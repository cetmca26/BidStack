-- 0028_optimize_execute_bid_rpc.sql
-- Optimize execute_bid to return only necessary columns

drop function if exists public.execute_bid(uuid, uuid, numeric(12,2));

create function public.execute_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_next_bid numeric(12,2)
)
returns table(
  id uuid,
  auction_id uuid,
  current_bid numeric(12,2),
  leading_team_id uuid,
  previous_bid numeric(12,2),
  previous_leading_team_id uuid
)
language plpgsql
security definer
as $$
begin
  -- Atomic update
  return query
  update public.auction_state
     set previous_bid = current_bid,
         previous_leading_team_id = leading_team_id,
         current_bid = p_next_bid,
         leading_team_id = p_team_id,
         show_undo_notice = false
   where auction_id = p_auction_id
   returning
     id,
     auction_id,
     current_bid,
     leading_team_id,
     previous_bid,
     previous_leading_team_id;
end;
$$;
