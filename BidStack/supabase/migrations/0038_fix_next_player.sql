-- Migration 0038: Fix next_player RPC which was accidentally reverted by 0036
-- 0036 added admin auth checks but overwrote the next_player logic from 0034.
-- This combined version includes both the admin checks AND the blind_bid_round logic.

create or replace function public.next_player(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player_id uuid;
  v_upcoming_count integer;
  v_upcoming_phase2_count integer;
  v_unsold_count integer;
begin
  -- Authorization check: only admins can call this function
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can draw next player';
  end if;

  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    insert into public.auction_state (auction_id, phase)
    values (p_auction_id, 'phase1'::public.auction_phase)
    returning * into v_state;
  end if;

  -- Count available players (blind_reserved are excluded automatically by status filter)
  select count(*) into v_upcoming_count from public.players where auction_id = p_auction_id and status = 'upcoming' and is_captain = false;
  select count(*) into v_upcoming_phase2_count from public.players where auction_id = p_auction_id and status = 'upcoming_phase2';
  select count(*) into v_unsold_count from public.players where auction_id = p_auction_id and status = 'unsold';

  -- PHASE 1 Execution
  if v_state.phase in ('captain_round', 'idle', 'phase1', 'blind_bid_round') or 
     (v_state.phase::text like 'completed%' and v_upcoming_count > 0) or
     (v_state.phase::text like 'completed%' and v_upcoming_count = 0 and v_upcoming_phase2_count = 0 and v_unsold_count > 0) then

    if v_upcoming_count = 0 then
      -- Finished Phase 1
      update public.auction_state
         set phase = 'phase_1_complete'::public.auction_phase,
             current_player_id = null,
             current_bid = null,
             leading_team_id = null,
             previous_bid = null,
             previous_leading_team_id = null,
             show_undo_notice = false
       where id = v_state.id
       returning * into v_state;
      return v_state;
    end if;

    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
      and is_captain = false
    order by random()
    limit 1;

    update public.auction_state
       set phase = 'phase1'::public.auction_phase
     where id = v_state.id;

  -- PHASE 2 Execution
  elsif v_state.phase in ('phase_2_hype', 'phase2') or 
        (v_state.phase::text like 'completed%' and v_upcoming_phase2_count > 0) or
        (v_state.phase::text like 'completed%' and v_upcoming_count = 0 and v_upcoming_phase2_count = 0 and v_unsold_count = 0) then

    if v_upcoming_phase2_count = 0 then
      -- Finished Phase 2
      update public.auction_state
         set phase = 'phase_2_complete'::public.auction_phase,
             current_player_id = null,
             current_bid = null,
             leading_team_id = null,
             previous_bid = null,
             previous_leading_team_id = null,
             show_undo_notice = false
       where id = v_state.id
       returning * into v_state;
      return v_state;
    end if;

    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming_phase2'
    order by random()
    limit 1;

    update public.auction_state
       set phase = 'phase2'::public.auction_phase
     where id = v_state.id;
  end if;

  if v_player_id is not null then
    update public.players
      set status = 'live'::public.player_status
    where id = v_player_id;

    update public.auction_state
       set 
           previous_player_id = v_state.current_player_id, 
           current_player_id = v_player_id,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;
