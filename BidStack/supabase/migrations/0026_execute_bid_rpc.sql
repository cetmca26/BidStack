-- 0026_execute_bid_rpc.sql
-- This RPC is intended to be called ONLY by the Supabase Edge Function
-- after it has performed complex validation (purse, slots, min squad).
-- It performs the atomic update of the auction state.

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
begin
  -- Lock the state row
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction state not found';
  end if;

  -- Atomic update
  update public.auction_state
     set previous_bid = current_bid,
         previous_leading_team_id = leading_team_id,
         current_bid = p_next_bid,
         leading_team_id = p_team_id,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
