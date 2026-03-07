-- 0030_refactor_execute_bid.sql
-- Consolidate all bidding validations into a single atomic RPC with row-level locking

drop function if exists public.execute_bid(uuid, uuid, numeric(12,2));

create or replace function public.execute_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_next_bid numeric(12,2)
)
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
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  -- 1. Lock the auction state to prevent race conditions
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction state not found for id %', p_auction_id;
  end if;

  -- 2. Validate active player
  if v_state.current_player_id is null then
    raise exception 'No active player for this auction';
  end if;

  -- 3. Get auction settings and status
  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if v_auction.status != 'live' then
    raise exception 'Auction is not in live status';
  end if;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;
  v_increment  := (v_auction.settings ->> 'increment')::numeric;

  if v_base_price is null or v_increment is null then
    raise exception 'Base price or increment not configured for auction';
  end if;

  -- 4. Validate team and leading status
  if v_state.leading_team_id = p_team_id then
    raise exception 'Team is already leading the bid';
  end if;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team not found or does not belong to this auction';
  end if;

  -- 5. Validate bid amount
  if v_state.leading_team_id is null then
    -- First bid
    if p_next_bid < v_base_price then
      raise exception 'First bid must be at least base price (%)', v_base_price;
    end if;
    if (p_next_bid - v_base_price) % v_increment != 0 then
      raise exception 'Initial bid must be in increments of % above base price', v_increment;
    end if;
  else
    -- Subsequent bids
    if p_next_bid <= coalesce(v_state.current_bid, 0) then
      raise exception 'Bid amount must be higher than current bid (%)', coalesce(v_state.current_bid, 0);
    end if;
    if (p_next_bid - coalesce(v_state.current_bid, 0)) % v_increment != 0 then
      raise exception 'Bid must be in increments of %', v_increment;
    end if;
  end if;

  -- 6. Purse and Slot checks
  if v_team.purse_remaining < p_next_bid then
    raise exception 'Insufficient purse remaining';
  end if;

  if v_team.slots_remaining <= 0 then
    raise exception 'No slots remaining';
  end if;

  -- 7. Minimum squad constraint
  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_next_bid) < v_required_money then
    raise exception 'Insufficient funds to maintain minimum squad requirement';
  end if;

  -- 8. Atomic update
  update public.auction_state
     set previous_bid = current_bid,
         previous_leading_team_id = leading_team_id,
         current_bid = p_next_bid,
         leading_team_id = p_team_id,
         show_undo_notice = false
   where auction_id = p_auction_id
   returning * into v_state;

  return v_state;
end;
$$;
