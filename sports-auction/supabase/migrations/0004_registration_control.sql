-- Migration to add registration control, phone numbers, and IP tracking

-- 1. Add is_registration_open to auctions
alter table public.auctions
add column if not exists is_registration_open boolean not null default true;

-- 2. Add phone_number and ip_address to players
alter table public.players
add column if not exists phone_number text,
add column if not exists ip_address text;

-- 3. Unique constraint on (auction_id, phone_number)

-- Drop any previous attempts
drop index if exists players_auction_phone_key;
alter table public.players drop constraint if exists players_auction_phone_key;

-- Add standard unique constraint
alter table public.players
add constraint players_auction_phone_key unique (auction_id, phone_number);


-- 4. Trigger to check registration status
create or replace function public.check_registration_status()
returns trigger
language plpgsql
as $$
declare
  v_is_open boolean;
begin
  select is_registration_open
    into v_is_open
  from public.auctions
  where id = new.auction_id;

  if not found then
    raise exception 'Auction % not found', new.auction_id;
  end if;

  if not v_is_open then
    raise exception 'Registration is currently closed for this auction';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_check_registration_status on public.players;

create trigger trg_check_registration_status
before insert on public.players
for each row
execute procedure public.check_registration_status();
