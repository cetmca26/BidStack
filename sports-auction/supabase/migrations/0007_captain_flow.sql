-- Migration to support the new "Lock Participants -> Select Captains -> Captain Reveal -> Blind Bid" workflow

-- 1. Add Captain Base Price to Auctions
alter table public.auctions
add column if not exists captain_base_price numeric(12,2) default 0;

-- 2. Add is_captain flag to Players to track who was selected
alter table public.players
add column if not exists is_captain boolean default false;

-- 3. Update the assign_captain function to work with the Blind-Bid Matching Phase
-- This simplifies it to just assign team, price, and deduct purse/slots.
-- The UI will handle triggering the end of the phase when all are matched.
create or replace function public.match_captain_blind_bid(
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
  if p_price < 0 then
    raise exception 'Captain price cannot be negative';
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

  if not v_player.is_captain then
    raise exception 'Player % is not marked as a captain', v_player.name;
  end if;

  if v_player.status <> 'upcoming' then
    raise exception 'Captain must be selected from upcoming players';
  end if;

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

end;
$$;
