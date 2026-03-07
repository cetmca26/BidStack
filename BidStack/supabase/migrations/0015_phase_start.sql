-- 0015_phase_start.sql
-- Fix next_player to correctly transition from captain_round to phase1

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
