-- Migration to add missing enum value 'slot_filling' to auction_phase

ALTER TYPE public.auction_phase ADD VALUE IF NOT EXISTS 'slot_filling';
