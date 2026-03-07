-- Create a function to permanently conclude an auction
CREATE OR REPLACE FUNCTION end_auction(p_auction_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Set the primary auction status to 'completed'
  UPDATE auctions
  SET status = 'completed',
      is_registration_open = false
  WHERE id = p_auction_id;

  -- 2. Ensure the auction_state phase is strictly 'completed' to halt all live screens
  UPDATE auction_state
  SET phase = 'completed',
      current_player_id = NULL,
      current_bid = NULL,
      leading_team_id = NULL
  WHERE auction_id = p_auction_id;

END;
$$;
