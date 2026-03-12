-- 0039_fix_next_player_phase2.sql
-- Fixes next_player transition at the end of Phase 2, and fixes undo_sale restoring incorrect phase.

create or replace function public.next_player(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player_id uuid;
  v_upcoming_count integer;
  v_upcoming_phase2_count integer;
begin
  -- Authorization check: only admins can call this function
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can draw next player';
  end if;

  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    insert into public.auction_state (auction_id, phase)
    values (p_auction_id, 'phase1'::public.auction_phase)
    returning * into v_state;
  end if;

  -- Count available players
  select count(*) into v_upcoming_count from public.players where auction_id = p_auction_id and status = 'upcoming' and is_captain = false;
  select count(*) into v_upcoming_phase2_count from public.players where auction_id = p_auction_id and status = 'upcoming_phase2';

  -- PHASE 2 Execution
  -- We are in Phase 2 if the specific phase is set OR if we're in completed state and there are markers that Phase 2 has started.
  if v_state.phase in ('phase_2_hype', 'phase2', 'phase_2_complete') or 
     (v_state.phase::text like 'completed%' and exists(select 1 from public.players where status in ('upcoming_phase2', 'unsold_final') and auction_id = p_auction_id)) then

    if v_upcoming_phase2_count = 0 then
      -- Finished Phase 2
      update public.auction_state
         set phase = 'phase_2_complete'::public.auction_phase,
             current_player_id = null,
             current_bid = null,
             leading_team_id = null,
             previous_bid = null,
             previous_leading_team_id = null,
             show_undo_notice = false
       where id = v_state.id
       returning * into v_state;
      return v_state;
    end if;

    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming_phase2'
    order by random()
    limit 1;

    update public.auction_state
       set phase = 'phase2'::public.auction_phase
     where id = v_state.id;

  -- PHASE 1 Execution
  else
    if v_upcoming_count = 0 then
      -- Finished Phase 1
      update public.auction_state
         set phase = 'phase_1_complete'::public.auction_phase,
             current_player_id = null,
             current_bid = null,
             leading_team_id = null,
             previous_bid = null,
             previous_leading_team_id = null,
             show_undo_notice = false
       where id = v_state.id
       returning * into v_state;
      return v_state;
    end if;

    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
      and is_captain = false
    order by random()
    limit 1;

    update public.auction_state
       set phase = 'phase1'::public.auction_phase
     where id = v_state.id;
  end if;

  -- Set new live player
  if v_player_id is not null then
    update public.players
      set status = 'live'::public.player_status
    where id = v_player_id;

    update public.auction_state
       set previous_player_id = v_state.current_player_id, 
           current_player_id = v_player_id,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;

-- Fix undo_sale logic to correctly determine Phase 1 vs Phase 2
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
  -- Authorization check: only admins can call this function
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can undo sales';
  end if;

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

  -- Restore Purse/Slots if it was sold
  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  -- Restore player to LIVE
  update public.players
     set status = 'live'::public.player_status,
         sold_price = null,
         sold_team_id = null
   where id = v_target_player_id;

  if v_state.phase::text like 'completed%' then
    -- SCENARIO A: Undoing during the 3.5s window
    update public.auction_state
       set phase = (case when exists(select 1 from public.players where status in ('upcoming_phase2', 'unsold_final') and auction_id = p_auction_id) then 'phase2' else 'phase1' end)::public.auction_phase,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           current_player_id = v_target_player_id, 
           previous_player_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;

  else
    -- SCENARIO B: Undoing AFTER next_player has been drawn
    -- If a new player was drawn, move them back to upcoming
    if v_state.current_player_id is not null then
      update public.players
         set status = (case when exists(select 1 from public.players where status in ('upcoming_phase2', 'unsold_final') and auction_id = p_auction_id) then 'upcoming_phase2' else 'upcoming' end)::public.player_status
       where id = v_state.current_player_id;
    end if;

    update public.auction_state
       set current_player_id = v_target_player_id,
           previous_player_id = null,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;
