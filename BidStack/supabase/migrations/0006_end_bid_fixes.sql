-- Fix end_bid to retain player ID for UI 'Sold' states and undo mechanics

create or replace function public.end_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_team public.teams;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No active player to end bid for auction %', p_auction_id;
  end if;

  if v_state.leading_team_id is not null and v_state.current_bid is not null then
    select *
      into v_team
    from public.teams
    where id = v_state.leading_team_id
    for update;

    update public.players
       set status = 'sold',
           sold_price = v_state.current_bid,
           sold_team_id = v_state.leading_team_id
     where id = v_state.current_player_id;

    update public.teams
       set purse_remaining = v_team.purse_remaining - v_state.current_bid,
           slots_remaining = v_team.slots_remaining - 1
     where id = v_team.id;
     
    -- Update Phase for UI Polish
    update public.auction_state
       set phase = 'completed_sale'
     where id = v_state.id;
     
  else
    update public.players
       set status = 'unsold'
     where id = v_state.current_player_id;
     
    update public.auction_state
       set phase = 'completed_unsold'
     where id = v_state.id;
  end if;

  /* DO NOT NULLIFY current_player_id SO UNDO WORKS AND UI SHOWS SOLD STATUS */
  update public.auction_state
     set previous_bid = v_state.current_bid,
         previous_leading_team_id = v_state.leading_team_id
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
