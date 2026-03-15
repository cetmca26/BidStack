-- =========================================================
-- LiveScore Platform — Database Migration
-- Modifies existing tables + creates new ls_* tables
-- Run this against the shared Supabase project
-- =========================================================

-- ─── 1. MODIFY EXISTING TABLES ───────────────────────────

-- Make auction_id nullable on teams (livescore teams won't have an auction)
ALTER TABLE public.teams ALTER COLUMN auction_id DROP NOT NULL;

-- Make manager nullable (livescore teams may not need a manager)
ALTER TABLE public.teams ALTER COLUMN manager DROP NOT NULL;
ALTER TABLE public.teams ALTER COLUMN manager SET DEFAULT '';

-- Add defaults so livescore inserts don't need auction-specific columns
ALTER TABLE public.teams ALTER COLUMN purse_remaining SET DEFAULT 0;
ALTER TABLE public.teams ALTER COLUMN slots_remaining SET DEFAULT 0;

-- Add sport column to teams for filtering
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS sport TEXT;

-- Make auction_id nullable on players
ALTER TABLE public.players ALTER COLUMN auction_id DROP NOT NULL;

-- Add team_id direct reference (livescore players use this instead of sold_team_id)
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id);

-- Add jersey_number
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS jersey_number INTEGER;

-- Index for player lookups by team
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(team_id);

-- ─── 2. GUARD EXISTING TRIGGERS ──────────────────────────

-- Update enforce_minimum_squad to skip non-auction teams
CREATE OR REPLACE FUNCTION public.enforce_minimum_squad()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_base_price numeric(12,2);
BEGIN
  -- Skip enforcement for non-auction teams (livescore teams)
  IF NEW.auction_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT (settings ->> 'base_price')::numeric
    INTO v_base_price
  FROM public.auctions
  WHERE id = NEW.auction_id;

  IF v_base_price IS NULL THEN
    RAISE EXCEPTION 'Base price not configured for auction %', NEW.auction_id;
  END IF;

  IF NEW.purse_remaining < 0 THEN
    RAISE EXCEPTION 'Team purse_remaining cannot be negative';
  END IF;

  IF NEW.purse_remaining < NEW.slots_remaining * v_base_price THEN
    RAISE EXCEPTION 'Minimum squad rule violated: remaining purse % does not cover % slots at base price %',
      NEW.purse_remaining, NEW.slots_remaining, v_base_price;
  END IF;

  RETURN NEW;
END;
$$;

-- ─── 3. NEW ENUMS ────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
    CREATE TYPE public.match_status AS ENUM ('scheduled', 'live', 'completed', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'innings_status') THEN
    CREATE TYPE public.innings_status AS ENUM ('not_started', 'in_progress', 'completed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wicket_type') THEN
    CREATE TYPE public.wicket_type AS ENUM (
      'bowled', 'caught', 'lbw', 'run_out', 'stumped',
      'hit_wicket', 'obstructing_field', 'retired_hurt', 'timed_out'
    );
  END IF;
END $$;

-- ─── 4. CORE PLATFORM TABLES ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.ls_tournaments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  sport       TEXT NOT NULL CHECK (sport IN ('cricket', 'football', 'badminton')),
  location    TEXT,
  start_date  DATE,
  end_date    DATE,
  status      TEXT NOT NULL DEFAULT 'upcoming'
              CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  settings    JSONB NOT NULL DEFAULT '{}',
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ls_tournament_teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.ls_tournaments(id) ON DELETE CASCADE,
  team_id       UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  UNIQUE (tournament_id, team_id)
);

CREATE TABLE IF NOT EXISTS public.ls_matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.ls_tournaments(id) ON DELETE CASCADE,
  team_a_id     UUID NOT NULL REFERENCES public.teams(id),
  team_b_id     UUID NOT NULL REFERENCES public.teams(id),
  status        public.match_status NOT NULL DEFAULT 'scheduled',
  start_time    TIMESTAMPTZ,
  venue         TEXT,
  settings      JSONB NOT NULL DEFAULT '{}',
  result        JSONB,
  toss          JSONB,
  playing_xi    JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. CRICKET SCORING TABLES (Phase 2 — schema ready) ──

CREATE TABLE IF NOT EXISTS public.ls_innings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        UUID NOT NULL REFERENCES public.ls_matches(id) ON DELETE CASCADE,
  innings_number  SMALLINT NOT NULL CHECK (innings_number IN (1, 2)),
  batting_team_id UUID NOT NULL REFERENCES public.teams(id),
  bowling_team_id UUID NOT NULL REFERENCES public.teams(id),
  total_runs      INTEGER NOT NULL DEFAULT 0,
  total_wickets   INTEGER NOT NULL DEFAULT 0,
  total_overs     NUMERIC(5,1) NOT NULL DEFAULT 0,
  total_extras    INTEGER NOT NULL DEFAULT 0,
  status          public.innings_status NOT NULL DEFAULT 'not_started',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, innings_number)
);

CREATE TABLE IF NOT EXISTS public.ls_balls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id      UUID NOT NULL REFERENCES public.ls_innings(id) ON DELETE CASCADE,
  over_number     SMALLINT NOT NULL,
  ball_number     SMALLINT NOT NULL,
  sequence        INTEGER NOT NULL,
  batter_id       UUID NOT NULL REFERENCES public.players(id),
  non_striker_id  UUID NOT NULL REFERENCES public.players(id),
  bowler_id       UUID NOT NULL REFERENCES public.players(id),
  runs_bat        SMALLINT NOT NULL DEFAULT 0,
  runs_extra      SMALLINT NOT NULL DEFAULT 0,
  extra_type      TEXT,
  is_wicket       BOOLEAN NOT NULL DEFAULT false,
  wicket_type     public.wicket_type,
  wicket_player_id UUID REFERENCES public.players(id),
  fielder_id      UUID REFERENCES public.players(id),
  is_legal        BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ls_batting_stats (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id            UUID NOT NULL REFERENCES public.ls_innings(id) ON DELETE CASCADE,
  player_id             UUID NOT NULL REFERENCES public.players(id),
  runs                  INTEGER NOT NULL DEFAULT 0,
  balls_faced           INTEGER NOT NULL DEFAULT 0,
  fours                 INTEGER NOT NULL DEFAULT 0,
  sixes                 INTEGER NOT NULL DEFAULT 0,
  is_out                BOOLEAN NOT NULL DEFAULT false,
  dismissal_type        public.wicket_type,
  dismissal_bowler_id   UUID REFERENCES public.players(id),
  dismissal_fielder_id  UUID REFERENCES public.players(id),
  batting_position      SMALLINT,
  UNIQUE (innings_id, player_id)
);

CREATE TABLE IF NOT EXISTS public.ls_bowling_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id      UUID NOT NULL REFERENCES public.ls_innings(id) ON DELETE CASCADE,
  player_id       UUID NOT NULL REFERENCES public.players(id),
  overs           NUMERIC(4,1) NOT NULL DEFAULT 0,
  maidens         INTEGER NOT NULL DEFAULT 0,
  runs_conceded   INTEGER NOT NULL DEFAULT 0,
  wickets         INTEGER NOT NULL DEFAULT 0,
  wides           INTEGER NOT NULL DEFAULT 0,
  no_balls        INTEGER NOT NULL DEFAULT 0,
  dot_balls       INTEGER NOT NULL DEFAULT 0,
  UNIQUE (innings_id, player_id)
);

CREATE TABLE IF NOT EXISTS public.ls_match_state (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id            UUID NOT NULL REFERENCES public.ls_matches(id) ON DELETE CASCADE,
  current_innings_id  UUID REFERENCES public.ls_innings(id),
  striker_id          UUID REFERENCES public.players(id),
  non_striker_id      UUID REFERENCES public.players(id),
  current_bowler_id   UUID REFERENCES public.players(id),
  current_over        SMALLINT NOT NULL DEFAULT 0,
  current_ball        SMALLINT NOT NULL DEFAULT 0,
  last_ball_id        UUID REFERENCES public.ls_balls(id),
  partnership_runs    INTEGER NOT NULL DEFAULT 0,
  partnership_balls   INTEGER NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id)
);

-- ─── 6. INDEXES ──────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_ls_matches_tournament ON public.ls_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_ls_matches_status ON public.ls_matches(status);
CREATE INDEX IF NOT EXISTS idx_ls_balls_innings_seq ON public.ls_balls(innings_id, sequence);
CREATE INDEX IF NOT EXISTS idx_ls_batting_stats_innings ON public.ls_batting_stats(innings_id);
CREATE INDEX IF NOT EXISTS idx_ls_bowling_stats_innings ON public.ls_bowling_stats(innings_id);
CREATE INDEX IF NOT EXISTS idx_ls_match_state_match ON public.ls_match_state(match_id);
CREATE INDEX IF NOT EXISTS idx_ls_tournament_teams_tournament ON public.ls_tournament_teams(tournament_id);

-- ─── 7. REALTIME ─────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.ls_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ls_match_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ls_innings;

-- ─── 8. AUTO-UPDATE updated_at TRIGGERS ──────────────────

CREATE OR REPLACE FUNCTION public.ls_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ls_tournaments_updated_at
  BEFORE UPDATE ON public.ls_tournaments
  FOR EACH ROW EXECUTE PROCEDURE public.ls_set_updated_at();

CREATE TRIGGER trg_ls_matches_updated_at
  BEFORE UPDATE ON public.ls_matches
  FOR EACH ROW EXECUTE PROCEDURE public.ls_set_updated_at();

CREATE TRIGGER trg_ls_match_state_updated_at
  BEFORE UPDATE ON public.ls_match_state
  FOR EACH ROW EXECUTE PROCEDURE public.ls_set_updated_at();

-- ─── 9. ROW LEVEL SECURITY ──────────────────────────────

-- Tournaments
ALTER TABLE public.ls_tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tournaments" ON public.ls_tournaments FOR SELECT USING (true);
CREATE POLICY "Admin write tournaments" ON public.ls_tournaments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Tournament teams
ALTER TABLE public.ls_tournament_teams ENABLE ROW SECURITY;
CREATE POLICY "Public read tournament_teams" ON public.ls_tournament_teams FOR SELECT USING (true);
CREATE POLICY "Admin write tournament_teams" ON public.ls_tournament_teams FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Matches
ALTER TABLE public.ls_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read matches" ON public.ls_matches FOR SELECT USING (true);
CREATE POLICY "Admin write matches" ON public.ls_matches FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Innings
ALTER TABLE public.ls_innings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read innings" ON public.ls_innings FOR SELECT USING (true);
CREATE POLICY "Admin write innings" ON public.ls_innings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Balls
ALTER TABLE public.ls_balls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read balls" ON public.ls_balls FOR SELECT USING (true);
CREATE POLICY "Admin write balls" ON public.ls_balls FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Batting stats
ALTER TABLE public.ls_batting_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read batting_stats" ON public.ls_batting_stats FOR SELECT USING (true);
CREATE POLICY "Admin write batting_stats" ON public.ls_batting_stats FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Bowling stats
ALTER TABLE public.ls_bowling_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bowling_stats" ON public.ls_bowling_stats FOR SELECT USING (true);
CREATE POLICY "Admin write bowling_stats" ON public.ls_bowling_stats FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Match state
ALTER TABLE public.ls_match_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read match_state" ON public.ls_match_state FOR SELECT USING (true);
CREATE POLICY "Admin write match_state" ON public.ls_match_state FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
