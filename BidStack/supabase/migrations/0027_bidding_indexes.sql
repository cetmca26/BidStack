-- 0027_bidding_indexes.sql
-- Add indexes to speed up bid placement queries

-- Index on auction_state(auction_id) for fast state lookups
CREATE INDEX IF NOT EXISTS idx_auction_state_auction_id 
ON public.auction_state(auction_id);

-- Index on teams(id) for fast team lookups during bidding
-- Note: id should be PK, but adding explicit index for performance
CREATE INDEX IF NOT EXISTS idx_teams_id 
ON public.teams(id);

-- Composite index for faster state + team lookups
CREATE INDEX IF NOT EXISTS idx_auction_state_leading_team 
ON public.auction_state(leading_team_id, current_bid);

-- Index on auctions(id) if not already PK
CREATE INDEX IF NOT EXISTS idx_auctions_id 
ON public.auctions(id);
