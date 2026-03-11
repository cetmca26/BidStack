-- Add is_blind_bid to players table to easily identify blind bid players
-- even after they have been sold and their status changes from 'blind_reserved' to 'sold'.

ALTER TABLE players ADD COLUMN IF NOT EXISTS is_blind_bid BOOLEAN DEFAULT FALSE;

-- Update existing blind_reserved players to true for data integrity
UPDATE players SET is_blind_bid = TRUE WHERE status = 'blind_reserved';
