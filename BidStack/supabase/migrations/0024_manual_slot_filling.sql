-- 0024_manual_slot_filling.sql
-- This migration removes auto-allocation logic and replaces it with a manual assignment RPC.

-- 1. Create assign_unsold_player RPC
create or replace function public.assign_unsold_player(p_player_id uuid, p_team_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_base_price numeric(12,2);
  v_auction_id uuid;
  v_team record;
begin
  -- Get player and auction context
  select auction_id into v_auction_id from public.players where id = p_player_id;
  
  -- Get base price
  select (settings ->> 'base_price')::numeric into v_base_price from public.auctions where id = v_auction_id;

  -- Get team and lock for update
  select * into v_team from public.teams where id = p_team_id for update;

  if not found then
    raise exception 'Team not found';
  end if;

  if v_team.purse_remaining < v_base_price then
    raise exception 'Team does not have enough purse remaining';
  end if;

  if v_team.slots_remaining <= 0 then
    raise exception 'Team does not have any slots remaining';
  end if;

  -- Assign player to team
  update public.players
     set status = 'sold'::public.player_status,
         sold_price = v_base_price,
         sold_team_id = p_team_id
   where id = p_player_id;

  -- Deduct from team
  update public.teams
     set purse_remaining = purse_remaining - v_base_price,
         slots_remaining = slots_remaining - 1
   where id = p_team_id;

end;
$$;

-- 2. Drop the auto_allocate_ordered function
drop function if exists public.auto_allocate_ordered(uuid, uuid[]);
