-- Migration to add missing enum value 'phase_2_complete' to auction_phase
-- This value is used in several recent migrations but was never explicitly added.

ALTER TYPE public.auction_phase ADD VALUE IF NOT EXISTS 'phase_2_complete';
