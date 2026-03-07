-- 0029_fix_rpc_ambiguous_column.sql
-- Fix ambiguous column reference in execute_bid RPC

drop function if exists public.execute_bid(uuid, uuid, numeric(12,2));

create function public.execute_bid(
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
  -- Atomic update
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
