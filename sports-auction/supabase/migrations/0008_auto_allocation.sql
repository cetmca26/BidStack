-- Migration to add final Auto-Allocation for Unsold Phase 2

create or replace function public.auto_allocate_unsold(
  p_auction_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_auction public.auctions;
  v_base_price numeric(12,2);
  v_team record;
  v_player record;
begin
  -- Get auction and base price
  select * into v_auction from public.auctions where id = p_auction_id for update;
  if not found then
    raise exception 'Auction not found';
  end if;
  
  v_base_price := (v_auction.settings ->> 'base_price')::numeric;

  -- Loop through teams that need players (slots_remaining > 0)
  for v_team in 
    select * from public.teams 
    where auction_id = p_auction_id and slots_remaining > 0 
    order by slots_remaining desc 
  loop
    -- While this particular team still needs players and has enough purse
    while v_team.slots_remaining > 0 and v_team.purse_remaining >= v_base_price loop
      -- Find an unsold player deterministically
      select * into v_player 
      from public.players 
      where auction_id = p_auction_id and status = 'unsold' 
      order by id
      limit 1;
      
      -- If no more unsold players exist at all, exit the entire function
      if not found then
        return;
      end if;

      -- Assign player to the current team
      update public.players
      set status = 'sold',
          sold_price = v_base_price,
          sold_team_id = v_team.id
      where id = v_player.id;

      -- Update our local team record variables
      v_team.purse_remaining := v_team.purse_remaining - v_base_price;
      v_team.slots_remaining := v_team.slots_remaining - 1;

      -- Persist team updates to the database
      update public.teams
      set purse_remaining = v_team.purse_remaining,
          slots_remaining = v_team.slots_remaining
      where id = v_team.id;
      
    end loop;
  end loop;

  -- Finally, set state block to indicate completion of Phase 2
  update public.auction_state
  set phase = 'completed_auto_allocation',
      current_player_id = null,
      current_bid = null,
      leading_team_id = null
  where auction_id = p_auction_id;

end;
$$;
