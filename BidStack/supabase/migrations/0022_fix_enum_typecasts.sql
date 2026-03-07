-- 0022_fix_enum_typecasts.sql
-- This migration fixes the "column 'phase' is of type auction_phase but expression is of type text" error
-- by adding explicit casts to public.auction_phase for all CASE and literal assignments.

-- 1. Fix next_player
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
    values (p_auction_id, 'phase1'::public.auction_phase)
    returning * into v_state;
  end if;

  if v_state.phase = 'captain_round' or v_state.phase = 'phase1' or v_state.phase = 'idle' or (v_state.phase::text like 'completed%' and not exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
    order by random()
    limit 1;

    if not found then
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

    update public.auction_state
       set phase = 'phase1'::public.auction_phase
     where id = v_state.id;

  elsif v_state.phase = 'phase_2_hype' or v_state.phase = 'phase2' or (v_state.phase::text like 'completed%' and exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming_phase2'
    order by random()
    limit 1;

    if not found then
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

    update public.auction_state
       set phase = 'phase2'::public.auction_phase
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
         previous_leading_team_id = null,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- 2. Fix start_bid
create or replace function public.start_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_auction public.auctions;
  v_base_price numeric(12,2);
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No current player selected for auction %', p_auction_id;
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;
  if v_base_price is null then
    raise exception 'Base price not configured for auction %', p_auction_id;
  end if;

  update public.auction_state
     set current_bid = v_base_price,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null,
         phase = (case when v_state.phase::text in ('phase1', 'idle', 'captain_round') then 'phase1' else 'phase2' end)::public.auction_phase,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- 3. Fix undo_sale
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

  -- Restore Purse/Slots if it was sold
  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  -- Restore player to LIVE
  update public.players
     set status = 'live',
         sold_price = null,
         sold_team_id = null
   where id = v_target_player_id;

  if v_state.phase::text like 'completed%' then
    -- SCENARIO A: Undoing during the 3.5s window
    update public.auction_state
       set phase = (case when v_state.phase::text in ('completed_unsold', 'completed_sale') then 
                      (case when exists(select 1 from public.players where status = 'upcoming_phase2' and auction_id=p_auction_id) then 'phase2' else 'phase1' end)
                    else 'phase1' end)::public.auction_phase,
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
         set status = case when v_state.phase::text = 'phase2' then 'upcoming_phase2' else 'upcoming' end
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

-- 4. Fix end_bid
create or replace function public.end_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player public.players;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No active player for auction %', p_auction_id;
  end if;

  select * into v_player from public.players where id = v_state.current_player_id for update;

  if v_state.leading_team_id is not null then
    -- SOLD
    update public.players
       set status = 'sold',
           sold_price = v_state.current_bid,
           sold_team_id = v_state.leading_team_id
     where id = v_state.current_player_id;

    update public.teams
       set purse_remaining = purse_remaining - v_state.current_bid,
           slots_remaining = slots_remaining - 1
     where id = v_state.leading_team_id;

    update public.auction_state
       set phase = 'completed_sale'::public.auction_phase,
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  else
    -- UNSOLD
    update public.players
       set status = case when v_state.phase::text = 'phase2' then 'unsold_final' else 'unsold' end
     where id = v_state.current_player_id;

    update public.auction_state
       set phase = 'completed_unsold'::public.auction_phase,
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;
