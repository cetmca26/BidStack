-- 0034_blind_bids_extension.sql
-- Extends the auction system with Blind Bid support for regular players.
-- Adds a 'blind_reserved' player status and a 'blind_bid_round' auction phase.
-- Creates RPCs for starting the blind bid round and matching blind bid players.
-- Updates next_player to exclude blind_reserved players from normal draws.

-- 1. Add new enum values
ALTER TYPE public.player_status ADD VALUE IF NOT EXISTS 'blind_reserved';
ALTER TYPE public.auction_phase ADD VALUE IF NOT EXISTS 'blind_bid_round';

-- 2. RPC to start the blind bid round
create or replace function public.start_blind_bid_round(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  -- Authorization check
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can start blind bid round';
  end if;

  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction state not found for id %', p_auction_id;
  end if;

  -- Verify there are blind_reserved players
  if not exists (select 1 from public.players where auction_id = p_auction_id and status = 'blind_reserved') then
    raise exception 'No blind bid players have been reserved for this auction';
  end if;

  update public.auction_state
     set phase = 'blind_bid_round'::public.auction_phase,
         current_player_id = null,
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

-- 3. RPC to match a blind bid player to a team (mirrors match_captain_blind_bid)
create or replace function public.match_player_blind_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_player_id uuid,
  p_price numeric
)
returns void
language plpgsql
security definer
as $$
declare
  v_auction public.auctions;
  v_team public.teams;
  v_player public.players;
  v_base_price numeric(12,2);
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  -- Authorization check
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can assign blind bid players';
  end if;

  if p_price < 0 then
    raise exception 'Blind bid price cannot be negative';
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction % not found', p_auction_id;
  end if;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team % not found for auction %', p_team_id, p_auction_id;
  end if;

  select *
    into v_player
  from public.players
  where id = p_player_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Player % not found for auction %', p_player_id, p_auction_id;
  end if;

  -- Must be a blind_reserved player
  if v_player.status <> 'blind_reserved' then
    raise exception 'Player % is not marked as blind_reserved', v_player.name;
  end if;

  -- Cannot be a captain
  if v_player.is_captain then
    raise exception 'Captains cannot be assigned as blind bid players';
  end if;

  if v_team.slots_remaining <= 0 then
    raise exception 'Team % has no remaining slots', p_team_id;
  end if;

  if v_team.purse_remaining < p_price then
    raise exception 'Blind bid price exceeds team purse for team %', p_team_id;
  end if;

  -- Minimum squad constraint
  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_price) < v_required_money then
    raise exception 'Minimum squad rule violated for team % when assigning blind bid player', p_team_id;
  end if;

  -- Execute assignment
  update public.players
     set status = 'sold'::public.player_status,
         sold_price = p_price,
         sold_team_id = p_team_id
   where id = p_player_id;

  update public.teams
     set purse_remaining = v_team.purse_remaining - p_price,
         slots_remaining = v_team.slots_remaining - 1
   where id = p_team_id;
end;
$$;

-- 4. Update next_player to exclude blind_reserved players from draws
-- This re-creates next_player with the blind_reserved exclusion added
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
  v_unsold_count integer;
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

  -- Count available players (blind_reserved are excluded automatically by status filter)
  select count(*) into v_upcoming_count from public.players where auction_id = p_auction_id and status = 'upcoming' and is_captain = false;
  select count(*) into v_upcoming_phase2_count from public.players where auction_id = p_auction_id and status = 'upcoming_phase2';
  select count(*) into v_unsold_count from public.players where auction_id = p_auction_id and status = 'unsold';

  -- PHASE 1 Execution
  if v_state.phase in ('captain_round', 'idle', 'phase1', 'blind_bid_round') or 
     (v_state.phase::text like 'completed%' and v_upcoming_count > 0) or
     (v_state.phase::text like 'completed%' and v_upcoming_count = 0 and v_upcoming_phase2_count = 0 and v_unsold_count > 0) then

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

  -- PHASE 2 Execution
  elsif v_state.phase in ('phase_2_hype', 'phase2') or 
        (v_state.phase::text like 'completed%' and v_upcoming_phase2_count > 0) or
        (v_state.phase::text like 'completed%' and v_upcoming_count = 0 and v_upcoming_phase2_count = 0 and v_unsold_count = 0) then

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
  end if;

  if v_player_id is not null then
    update public.players
      set status = 'live'::public.player_status
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
  end if;

  return v_state;
end;
$$;
