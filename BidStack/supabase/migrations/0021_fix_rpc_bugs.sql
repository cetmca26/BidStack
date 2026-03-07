-- 0021_fix_rpc_bugs.sql
-- 1. Fix auto_allocate_ordered to use jsonb settings correctly
create or replace function public.auto_allocate_ordered(p_auction_id uuid, p_ordered_player_ids uuid[])
returns void
language plpgsql
security definer
as $$
declare
  v_base_price numeric(12,2);
  v_player_id uuid;
  v_team record;
begin
  -- Access base_price from the settings jsonb column
  select (settings ->> 'base_price')::numeric
    into v_base_price
  from public.auctions
  where id = p_auction_id;

  if v_base_price is null then
    raise exception 'Base price not configured for auction %', p_auction_id;
  end if;

  foreach v_player_id in array p_ordered_player_ids
  loop
    -- Double check player is actually unsold before allocating
    if not exists (select 1 from public.players where id = v_player_id and status = 'unsold' and auction_id = p_auction_id) then
      continue;
    end if;

    -- Pick the team with the highest slots remaining that can afford the base price in this auction
    select id, purse_remaining, slots_remaining
      into v_team
    from public.teams
    where auction_id = p_auction_id
      and slots_remaining > 0
      and purse_remaining >= v_base_price
    order by slots_remaining desc, purse_remaining desc
    limit 1
    for update;

    -- If no team can take them, skip
    if not found then
      continue;
    end if;

    -- Assign player to team
    update public.players
       set status = 'sold',
           sold_price = v_base_price,
           sold_team_id = v_team.id
     where id = v_player_id;

    -- Deduct from team
    update public.teams
       set purse_remaining = purse_remaining - v_base_price,
           slots_remaining = slots_remaining - 1
     where id = v_team.id;
  end loop;

end;
$$;

-- 2. Ensure place_bid has fallback for settings
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

  v_base_price := coalesce((v_auction.settings ->> 'base_price')::numeric, 0);
  v_increment  := coalesce((v_auction.settings ->> 'increment')::numeric, 0);

  if v_base_price <= 0 or v_increment <= 0 then
    raise exception 'Base price or increment not properly configured for auction %', p_auction_id;
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

  -- Logic for the first bid vs subsequent bids
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
