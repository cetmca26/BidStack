-- Auction status tracking: upcoming, live, completed

do $$
begin
  if not exists (select 1 from pg_type where typname = 'auction_status') then
    create type public.auction_status as enum ('upcoming', 'live', 'completed');
  end if;
end $$;

alter table public.auctions
  add column if not exists status public.auction_status not null default 'upcoming';

