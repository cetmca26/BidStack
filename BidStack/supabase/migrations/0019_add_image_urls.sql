-- Add image URL columns for player photos and team logos
-- This migration adds support for mandatory image uploads

-- Add photo_url column to players table
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS photo_url text;

-- Add logo_url column to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS logo_url text;

-- Create indexes for photo_url and logo_url for faster queries
CREATE INDEX IF NOT EXISTS idx_players_photo_url ON public.players(photo_url);
CREATE INDEX IF NOT EXISTS idx_teams_logo_url ON public.teams(logo_url);
