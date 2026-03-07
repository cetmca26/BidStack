-- 0016_undo_sale_rework.sql
-- Add previous_player_id to track the last drawn player so we can undo their sale even after a new player is drawn.

ALTER TABLE public.auction_state ADD COLUMN IF NOT EXISTS previous_player_id uuid references public.players(id);

-- Update next_player to track the previous player
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

  if v_state.phase = 'captain_round' or v_state.phase = 'phase1' or v_state.phase = 'idle' or v_state.phase::text like 'completed%' then
    -- If we were in phase 1, keep pulling from phase 1 upcoming
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
    order by random()
    limit 1;

    if not found then
      -- Phase 1 is complete
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
     set 
         previous_player_id = v_state.current_player_id, -- TRACK THE LAST PLAYER
         current_player_id = v_player_id,
         current_bid = null,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;


-- Rewrite undo_sale to handle both 3.5s window and "AFTER next_player but BEFORE start_bid"
create or replace function public.undo_sale(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player public.players;
  v_target_player_id uuid;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'No auction context available.';
  end if;

  -- Validation: Can only undo in specific states
  if v_state.phase::text not in ('phase1', 'phase2', 'completed_sale', 'completed_unsold') then
    raise exception 'Undo Sale is not permitted in the current phase.';
  end if;

  if (v_state.phase::text = 'phase1' or v_state.phase::text = 'phase2') and v_state.current_bid is not null then
    raise exception 'Undo Sale is not permitted after a new bid has started.';
  end if;

  -- Determine which player to undo
  if v_state.phase::text like 'completed%' then
    -- Undoing right after End Bid, player is still the current one visually
    v_target_player_id := v_state.current_player_id;
  else
    -- Undoing AFTER next_player has been drawn
    v_target_player_id := v_state.previous_player_id;
  end if;

  if v_target_player_id is null then
    raise exception 'No sold player context available for undo.';
  end if;

  select * into v_player from public.players where id = v_target_player_id for update;

  -- Refund the team if sold
  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  -- Resolve phase & statuses based on WHEN we are undoing
  if v_state.phase::text like 'completed%' then
    -- SCENARIO A: Undoing during the 3.5s window. The visually focused player is reverted back to "live".
    update public.players
       set status = 'live',
           sold_price = null,
           sold_team_id = null
     where id = v_player.id;

    update public.auction_state
       set phase = case when v_state.phase::text = 'completed_unsold' or v_state.phase::text = 'completed_sale' then 'phase1' else 'phase1' end,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           current_player_id = v_target_player_id, 
           previous_player_id = null -- Prevent double undo
     where id = v_state.id
     returning * into v_state;

  else
    -- SCENARIO B: Undoing AFTER next_player has been drawn. 
    -- The previous player is quietly sent back to the upcoming/unsold queue. 
    -- The currently active player on screen is completely untouched.
    update public.players
       set status = case when v_state.phase::text = 'phase2' then 'unsold' else 'upcoming' end,
           sold_price = null,
           sold_team_id = null
     where id = v_player.id;

    update public.auction_state
       set previous_player_id = null -- Wipe tracking to prevent double undo
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;
