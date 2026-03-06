-- Auction Engine core schema and RPCs
-- Compatible with Supabase/PostgreSQL

create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'player_status') then
    create type public.player_status as enum ('upcoming', 'live', 'sold', 'unsold');
  end if;

  if not exists (select 1 from pg_type where typname = 'auction_phase') then
    create type public.auction_phase as enum ('idle', 'captain_round', 'phase1', 'phase2', 'completed');
  end if;
end $$;

-- Auctions table
create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport_type text not null check (sport_type in ('football', 'cricket')),
  settings jsonb not null,
  created_at timestamptz not null default now()
);

-- Teams table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  name text not null,
  manager text not null,
  purse_remaining numeric(12,2) not null,
  slots_remaining integer not null,
  captain_id uuid,
  created_at timestamptz not null default now(),
  constraint teams_purse_non_negative check (purse_remaining >= 0)
);

-- Players table
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  name text not null,
  role text not null,
  status public.player_status not null default 'upcoming',
  sold_price numeric(12,2),
  sold_team_id uuid references public.teams(id),
  created_at timestamptz not null default now()
);

alter table public.teams
  add constraint teams_captain_fk
  foreign key (captain_id) references public.players(id);

-- Auction state table: one row per auction
create table if not exists public.auction_state (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  current_player_id uuid references public.players(id),
  current_bid numeric(12,2),
  leading_team_id uuid references public.teams(id),
  previous_bid numeric(12,2),
  previous_leading_team_id uuid references public.teams(id),
  phase public.auction_phase not null default 'idle',
  updated_at timestamptz not null default now(),
  constraint auction_state_auction_unique unique (auction_id)
);

-- Minimum squad / remaining purse enforcement
create or replace function public.enforce_minimum_squad()
returns trigger
language plpgsql
as $$
declare
  v_base_price numeric(12,2);
begin
  select (settings ->> 'base_price')::numeric
    into v_base_price
  from public.auctions
  where id = new.auction_id;

  if v_base_price is null then
    raise exception 'Base price not configured for auction %', new.auction_id;
  end if;

  if new.purse_remaining < 0 then
    raise exception 'Team purse_remaining cannot be negative';
  end if;

  if new.purse_remaining < new.slots_remaining * v_base_price then
    raise exception 'Minimum squad rule violated: remaining purse % does not cover % slots at base price %',
      new.purse_remaining, new.slots_remaining, v_base_price;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_minimum_squad on public.teams;

create trigger trg_enforce_minimum_squad
before insert or update of purse_remaining, slots_remaining
on public.teams
for each row
execute procedure public.enforce_minimum_squad();

-- Keep auction_state.updated_at fresh
create or replace function public.set_auction_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_set_auction_state_updated_at on public.auction_state;

create trigger trg_set_auction_state_updated_at
before update on public.auction_state
for each row
execute procedure public.set_auction_state_updated_at();

-- RPC: select next player for auction
create or replace function public.next_player(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player_id uuid;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    insert into public.auction_state (auction_id)
    values (p_auction_id)
    returning * into v_state;
  end if;

  -- Prefer upcoming players, fall back to unsold (Phase 2)
  select id
    into v_player_id
  from public.players
  where auction_id = p_auction_id
    and status = 'upcoming'
  order by random()
  limit 1;

  if not found then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'unsold'
    order by random()
    limit 1;
  end if;

  if not found then
    raise exception 'No players remaining for auction %', p_auction_id;
  end if;

  update public.players
    set status = 'live'
  where id = v_player_id;

  update public.auction_state
     set current_player_id = v_player_id,
         current_bid = null,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null,
         phase = case when v_state.phase in ('phase1', 'phase2') then v_state.phase else 'phase1' end
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- RPC: start bid – set base price and reset leading team
create or replace function public.start_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_auction public.auctions;
  v_base_price numeric(12,2);
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No current player selected for auction %', p_auction_id;
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;
  if v_base_price is null then
    raise exception 'Base price not configured for auction %', p_auction_id;
  end if;

  update public.auction_state
     set current_bid = v_base_price,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null,
         phase = 'phase1'
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- RPC: place bid – atomic bid increment with rule checks
create or replace function public.place_bid(p_auction_id uuid, p_team_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_auction public.auctions;
  v_team public.teams;
  v_base_price numeric(12,2);
  v_increment numeric(12,2);
  v_next_bid numeric(12,2);
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No active player for auction %', p_auction_id;
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;
  v_increment  := (v_auction.settings ->> 'increment')::numeric;

  if v_base_price is null or v_increment is null then
    raise exception 'Base price or increment not configured for auction %', p_auction_id;
  end if;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team % not found for auction %', p_team_id, p_auction_id;
  end if;

  v_next_bid := coalesce(v_state.current_bid, v_base_price) + v_increment;

  -- Purse check
  if v_team.purse_remaining < v_next_bid then
    raise exception 'Purse check failed for team %', p_team_id;
  end if;

  -- Slot check
  if v_team.slots_remaining <= 0 then
    raise exception 'Slot check failed for team %', p_team_id;
  end if;

  -- Minimum squad constraint
  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - v_next_bid) < v_required_money then
    raise exception 'Minimum squad rule failed for team %', p_team_id;
  end if;

  update public.auction_state
     set previous_bid = v_state.current_bid,
         previous_leading_team_id = v_state.leading_team_id,
         current_bid = v_next_bid,
         leading_team_id = p_team_id
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- RPC: undo last bid – revert to previous state
create or replace function public.undo_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'No auction_state row for auction %', p_auction_id;
  end if;

  if v_state.previous_bid is null then
    -- nothing to undo, return current state
    return v_state;
  end if;

  update public.auction_state
     set current_bid = v_state.previous_bid,
         leading_team_id = v_state.previous_leading_team_id,
         previous_bid = null,
         previous_leading_team_id = null
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- RPC: end bid – finalize sale or mark unsold
create or replace function public.end_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_team public.teams;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No active player to end bid for auction %', p_auction_id;
  end if;

  if v_state.leading_team_id is not null and v_state.current_bid is not null then
    select *
      into v_team
    from public.teams
    where id = v_state.leading_team_id
    for update;

    update public.players
       set status = 'sold',
           sold_price = v_state.current_bid,
           sold_team_id = v_state.leading_team_id
     where id = v_state.current_player_id;

    update public.teams
       set purse_remaining = v_team.purse_remaining - v_state.current_bid,
           slots_remaining = v_team.slots_remaining - 1
     where id = v_team.id;
  else
    update public.players
       set status = 'unsold'
     where id = v_state.current_player_id;
  end if;

  update public.auction_state
     set current_player_id = null,
         current_bid = null,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

