-- Migration to explicitly enable realtime for core tables
-- This ensures that the frontend automatically receives websocket updates
-- when players, teams, or auction states are modified.

begin;

-- Drop the publication if it already exists to ensure a clean state
drop publication if exists supabase_realtime;

-- Recreate the publication
create publication supabase_realtime;

-- Add our core tables to the realtime publication
alter publication supabase_realtime add table public.auction_state;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.auctions;

commit;
