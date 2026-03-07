-- 0032_add_unsold_final_enum.sql
-- Add the missing 'unsold_final' value to the player_status enum

ALTER TYPE public.player_status ADD VALUE IF NOT EXISTS 'unsold_final';
