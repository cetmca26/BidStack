-- Migration to add undo_sale RPC and update assign_captain to trigger a UI reveal

-- 1. Update assign_captain to push state to auction_state for Live UI Hype Reveal
create or replace function public.assign_captain(
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
  if p_price <= 0 then
    raise exception 'Captain price must be positive';
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

  if v_team.captain_id is not null then
    raise exception 'Team % already has a captain', p_team_id;
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

  if v_player.status <> 'upcoming' then
    raise exception 'Captain must be selected from upcoming players';
  end if;

  -- Purse and slot checks re-used from main auction rules
  if v_team.slots_remaining <= 0 then
    raise exception 'Team % has no remaining slots', p_team_id;
  end if;

  if v_team.purse_remaining < p_price then
    raise exception 'Captain price exceeds team purse for team %', p_team_id;
  end if;

  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_price) < v_required_money then
    raise exception 'Minimum squad rule violated for team % when assigning captain', p_team_id;
  end if;

  update public.players
     set status = 'sold',
         sold_price = p_price,
         sold_team_id = p_team_id
   where id = p_player_id;

  update public.teams
     set purse_remaining = v_team.purse_remaining - p_price,
         slots_remaining = v_team.slots_remaining - 1,
         captain_id = p_player_id
   where id = p_team_id;

  -- UPDATE AUCTION STATE FOR HYPE REVEAL
  update public.auction_state
     set current_player_id = p_player_id,
         leading_team_id = p_team_id,
         current_bid = p_price,
         phase = 'captain_round'
   where auction_id = p_auction_id;

end;
$$;


-- 2. Add undo_sale RPC to reverse a finalized sale
create or replace function public.undo_sale(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player public.players;
  v_team public.teams;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'No active auction state found for auction %', p_auction_id;
  end if;

  -- Check if there is a recently sold/unsold player mapped to state
  if v_state.current_player_id is null then
    raise exception 'No player to undo sale for.';
  end if;

  select * into v_player from public.players where id = v_state.current_player_id for update;

  if v_player.status not in ('sold', 'unsold') then
    raise exception 'Player % is not sold or unsold, cannot undo sale.', v_player.name;
  end if;

  if v_player.status = 'sold' and v_player.sold_team_id is not null then
    -- Refund team
    select * into v_team from public.teams where id = v_player.sold_team_id for update;
    
    update public.teams
       set purse_remaining = v_team.purse_remaining + coalesce(v_player.sold_price, 0),
           slots_remaining = v_team.slots_remaining + 1
     where id = v_team.id;
     
    -- If this player was a captain, remove captain status
    if v_team.captain_id = v_player.id then
       update public.teams set captain_id = null where id = v_team.id;
    end if;
  end if;

  -- Reset Player
  update public.players
     set status = 'upcoming',
         sold_price = null,
         sold_team_id = null
   where id = v_player.id;

  -- Reset Auction State to idle/ready
  update public.auction_state
     set phase = 'idle',
         current_bid = null,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
