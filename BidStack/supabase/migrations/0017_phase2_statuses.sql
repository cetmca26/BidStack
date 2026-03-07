-- 0017_phase2_statuses.sql
-- Expand player status to track Phase 2 eligibility natively to prevent infinite draw loops.

ALTER TYPE public.player_status ADD VALUE IF NOT EXISTS 'upcoming_phase2';

-- Modify start_phase2 to move all 'unsold' players into 'upcoming_phase2'
create or replace function public.start_phase2(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  -- Shift all unsold players into the Phase 2 queue
  update public.players
     set status = 'upcoming_phase2'
   where auction_id = p_auction_id
     and status = 'unsold';

  -- Trigger the hype screen phase
  update public.auction_state
     set phase = 'phase_2_hype'
   where auction_id = p_auction_id
   returning * into v_state;
   
  return v_state;
end;
$$;


-- Modify next_player to only pull from 'upcoming_phase2' during Phase 2
create or replace function public.next_player(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player_id uuid;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    insert into public.auction_state (auction_id, phase)
    values (p_auction_id, 'phase1')
    returning * into v_state;
  end if;

  if v_state.phase = 'captain_round' or v_state.phase = 'phase1' or v_state.phase = 'idle' or (v_state.phase::text like 'completed%' and not exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    -- Wait, the rule is if we were in phase 1, keep pulling from phase 1 upcoming
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
    order by random()
    limit 1;

    if not found then
      -- Phase 1 is complete
      update public.auction_state
         set phase = 'phase_1_complete',
             current_player_id = null,
             current_bid = null,
             leading_team_id = null,
             previous_bid = null,
             previous_leading_team_id = null
       where id = v_state.id
       returning * into v_state;
      return v_state;
    end if;

    update public.auction_state
       set phase = 'phase1'
     where id = v_state.id;

  elsif v_state.phase = 'phase_2_hype' or v_state.phase = 'phase2' or (v_state.phase::text like 'completed%' and exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    -- In phase 2, pull ONLY from upcoming_phase2
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming_phase2'
    order by random()
    limit 1;

    if not found then
      -- Phase 2 is complete.
      update public.auction_state
         set phase = 'phase_2_complete',
             current_player_id = null,
             current_bid = null,
             leading_team_id = null,
             previous_bid = null,
             previous_leading_team_id = null
       where id = v_state.id
       returning * into v_state;
      return v_state;
    end if;

    update public.auction_state
       set phase = 'phase2'
     where id = v_state.id;
  end if;

  update public.players
    set status = 'live'
  where id = v_player_id;

  update public.auction_state
     set 
         previous_player_id = v_state.current_player_id, 
         current_player_id = v_player_id,
         current_bid = null,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;


-- Rewrite undo_sale to use upcoming_phase2
create or replace function public.undo_sale(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player public.players;
  v_target_player_id uuid;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'No auction context available.';
  end if;

  if v_state.phase::text not in ('phase1', 'phase2', 'completed_sale', 'completed_unsold') then
    raise exception 'Undo Sale is not permitted in the current phase.';
  end if;

  if (v_state.phase::text = 'phase1' or v_state.phase::text = 'phase2') and v_state.current_bid is not null then
    raise exception 'Undo Sale is not permitted after a new bid has started.';
  end if;

  if v_state.phase::text like 'completed%' then
    v_target_player_id := v_state.current_player_id;
  else
    v_target_player_id := v_state.previous_player_id;
  end if;

  if v_target_player_id is null then
    raise exception 'No sold player context available for undo.';
  end if;

  select * into v_player from public.players where id = v_target_player_id for update;

  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  if v_state.phase::text like 'completed%' then
    -- SCENARIO A: Undoing during the 3.5s window
    update public.players
       set status = 'live',
           sold_price = null,
           sold_team_id = null
     where id = v_player.id;

    update public.auction_state
       set phase = case when v_state.phase::text = 'completed_unsold' or v_state.phase::text = 'completed_sale' then 
                     (case when exists(select 1 from public.players where status = 'upcoming_phase2' and auction_id=p_auction_id) then 'phase2' else 'phase1' end)
                   else 'phase1' end,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           current_player_id = v_target_player_id, 
           previous_player_id = null
     where id = v_state.id
     returning * into v_state;

  else
    -- SCENARIO B: Undoing AFTER next_player has been drawn
    update public.players
       set status = case when v_state.phase::text = 'phase2' then 'upcoming_phase2' else 'upcoming' end,
           sold_price = null,
           sold_team_id = null
     where id = v_player.id;

    update public.auction_state
       set previous_player_id = null
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;
