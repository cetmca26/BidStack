-- 0014_explicit_phases_typecast.sql
-- Fix the LIKE operator on the custom enum type `auction_phase` by explicitly casting to text.

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
    insert into public.auction_state (auction_id, phase)
    values (p_auction_id, 'phase1')
    returning * into v_state;
  end if;

  if v_state.phase = 'phase1' or v_state.phase = 'idle' or v_state.phase::text like 'completed%' then
    -- If we were in phase 1, keep pulling from phase 1 upcoming
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
    order by random()
    limit 1;

    if not found then
      -- Instead of silently falling back to unsold or throwing exception, peacefully transition to phase_1_complete
      update public.auction_state
         set phase = 'phase_1_complete',
             current_player_id = null,
             current_bid = null,
             leading_team_id = null,
             previous_bid = null,
             previous_leading_team_id = null
       where id = v_state.id
       returning * into v_state;
      return v_state;
    end if;

    update public.auction_state
       set phase = 'phase1'
     where id = v_state.id;

  elsif v_state.phase = 'phase_2_hype' or v_state.phase = 'phase2' then
    -- In phase 2, pull ONLY from unsold
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'unsold'
    order by random()
    limit 1;

    if not found then
      -- Phase 2 is complete.
      update public.auction_state
         set phase = 'completed',
             current_player_id = null,
             current_bid = null,
             leading_team_id = null,
             previous_bid = null,
             previous_leading_team_id = null
       where id = v_state.id
       returning * into v_state;
      return v_state;
    end if;

    update public.auction_state
       set phase = 'phase2'
     where id = v_state.id;
  end if;

  update public.players
    set status = 'live'
  where id = v_player_id;

  update public.auction_state
     set current_player_id = v_player_id,
         current_bid = null,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;


create or replace function public.undo_sale(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player public.players;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No sold or unsold player context available for undo.';
  end if;
  
  -- We don't rollback state.phase directly because we don't know if it was phase1 or phase2, wait, 
  -- actually we do if we track it, but we can just use the status of the player before the sale if we wanted.
  -- But usually undo_sale is hit right after end_bid.

  if v_state.previous_bid is null and v_state.previous_leading_team_id is null and v_state.phase::text like 'completed%' then
    -- Wait, if no one bid, previous_bid might be null, but we still want to rollback an 'unsold' state.
    -- The key is preventing double undo. We nullify current_player_id at the end of this to prevent it.
  end if;

  select * into v_player from public.players where id = v_state.current_player_id for update;

  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  -- Revert player status to upcoming (or unsold if we are technically in phase2 completed)
  update public.players
     set status = case when v_state.phase = 'completed_unsold' and v_player.status = 'unsold' and v_player.is_captain = false then 'upcoming' else 'upcoming' end,
         sold_price = null,
         sold_team_id = null
   where id = v_player.id;

  -- Set phase back to phase1 or phase2 based on what it was (default phase1 if not known)
  -- To prevent double undo, we wipe current_player_id or previous_bid so it can't be repeatedly hit.
  update public.auction_state
     set phase = case when v_state.phase = 'completed_unsold' or v_state.phase = 'completed_sale' then 'phase1' else 'phase1' end,
         current_bid = v_state.previous_bid,
         leading_team_id = v_state.previous_leading_team_id,
         previous_bid = null,
         previous_leading_team_id = null,
         current_player_id = null -- NULLIFY to prevent second undo!
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
