-- 0018_undo_sale_notice_and_first_bid.sql
-- 1. Add column to track undo notice
ALTER TABLE public.auction_state ADD COLUMN IF NOT EXISTS show_undo_notice boolean DEFAULT false;

-- 2. Update place_bid to ensure first bid = base price
create or replace function public.place_bid(p_auction_id uuid, p_team_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_auction public.auctions;
  v_team public.teams;
  v_base_price numeric(12,2);
  v_increment numeric(12,2);
  v_next_bid numeric(12,2);
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No active player for auction %', p_auction_id;
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;
  v_increment  := (v_auction.settings ->> 'increment')::numeric;

  if v_base_price is null or v_increment is null then
    raise exception 'Base price or increment not configured for auction %', p_auction_id;
  end if;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team % not found for auction %', p_team_id, p_auction_id;
  end if;

  -- THE FIX: If no leading team, next bid IS the current_bid (base_price).
  -- Otherwise, it's current_bid + increment.
  if v_state.leading_team_id is null then
    v_next_bid := coalesce(v_state.current_bid, v_base_price);
  else
    v_next_bid := v_state.current_bid + v_increment;
  end if;

  -- Purse check
  if v_team.purse_remaining < v_next_bid then
    raise exception 'Purse check failed for team %', p_team_id;
  end if;

  -- Slot check
  if v_team.slots_remaining <= 0 then
    raise exception 'Slot check failed for team %', p_team_id;
  end if;

  -- Minimum squad constraint
  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - v_next_bid) < v_required_money then
    raise exception 'Minimum squad rule failed for team %', p_team_id;
  end if;

  update public.auction_state
     set previous_bid = v_state.current_bid,
         previous_leading_team_id = v_state.leading_team_id,
         current_bid = v_next_bid,
         leading_team_id = p_team_id,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- 3. Update undo_sale to restore player and set notice
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
       set phase = case when v_state.phase::text = 'completed_unsold' or v_state.phase::text = 'completed_sale' then 
                     (case when exists(select 1 from public.players where status = 'upcoming_phase2' and auction_id=p_auction_id) then 'phase2' else 'phase1' end)
                   else 'phase1' end,
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

-- 4. Reset notice in other RPCs
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
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
    order by random()
    limit 1;

    if not found then
      update public.auction_state
         set phase = 'phase_1_complete',
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
       set phase = 'phase1'
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
         set phase = 'phase_2_complete',
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
         previous_leading_team_id = null,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

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
         phase = case when v_state.phase = 'phase1' or v_state.phase = 'idle' or v_state.phase = 'captain_round' then 'phase1' else 'phase2' end,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

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
       set phase = 'completed_sale',
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  else
    -- UNSOLD
    update public.players
       set status = case when v_state.phase = 'phase2' then 'unsold_final' else 'unsold' end
     where id = v_state.current_player_id;

    update public.auction_state
       set phase = 'completed_unsold',
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;

create or replace function public.undo_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'No auction context available.';
  end if;

  if v_state.previous_bid is null then
    raise exception 'No previous bid available to undo.';
  end if;

  update public.auction_state
     set current_bid = previous_bid,
         leading_team_id = previous_leading_team_id,
         previous_bid = null,
         previous_leading_team_id = null,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
