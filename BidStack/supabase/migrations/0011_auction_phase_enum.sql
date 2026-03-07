-- Migration to add completed_sale and completed_unsold to auction_phase enum
-- We have to use a DO block since ALTER TYPE cannot run inside a transaction block easily if used incorrectly,
-- but supabase migrations wrap in transaction. Standard syntax to add enum values:
ALTER TYPE public.auction_phase ADD VALUE IF NOT EXISTS 'completed_sale';
ALTER TYPE public.auction_phase ADD VALUE IF NOT EXISTS 'completed_unsold';
