-- Backfill the sport column for existing teams based on their auction's sport type
UPDATE public.teams t
SET sport = a.sport_type
FROM public.auctions a
WHERE t.auction_id = a.id
AND t.sport IS NULL;
