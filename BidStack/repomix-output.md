This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.gitignore
app/admin/auction/[id]/page.tsx
app/admin/auction/[id]/teams/page.tsx
app/admin/auction/[id]/verify/page.tsx
app/admin/login/page.tsx
app/admin/page.tsx
app/auction/[id]/page.tsx
app/favicon.ico
app/globals.css
app/layout.tsx
app/live/[id]/page.tsx
app/live/[id]/recap/page.tsx
app/live/[id]/repository/page.tsx
app/page.tsx
components.json
components/ImageUploadField.tsx
components/ImageViewerModal.tsx
components/live/AuctionHero.tsx
components/live/BiddingPIP.tsx
components/live/BlindBidReveal.tsx
components/live/CaptainDeck.tsx
components/live/PlayerRepository.tsx
components/live/RecapStats.tsx
components/live/RepositoryPanel.tsx
components/live/SaleFeedback.tsx
components/live/TeamFormation.tsx
components/live/TeamListCard.tsx
components/live/TempCard.tsx
components/live/UnsoldFeedback.tsx
components/live/ViewSquadsPanel.tsx
components/PlayerAvatar.tsx
components/team/TeamRoster.tsx
components/team/TeamRosterHeader.tsx
components/team/TeamStarPlayers.tsx
components/TeamLogo.tsx
components/ThemeProvider.tsx
components/ThemeToggle.tsx
components/ui/button.tsx
components/ui/card.tsx
components/ui/checkbox.tsx
components/ui/dialog.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/table.tsx
components/ui/tabs.tsx
eslint.config.mjs
lib/hooks/useAuctionState.ts
lib/imageCompression.ts
lib/shared/playerUtils.ts
lib/supabase.ts
lib/utils.ts
next.config.ts
package.json
postcss.config.mjs
public/android-chrome-192x192.png
public/android-chrome-512x512.png
public/apple-touch-icon.png
public/CourtSide_landing.png
public/favicon-16x16.png
public/favicon-32x32.png
public/file.svg
public/globe.svg
public/next.svg
public/site.webmanifest
public/vercel.svg
public/window.svg
README.md
supabase/.gitignore
supabase/config.toml
supabase/functions/import_map.json
supabase/functions/place-bid/index.ts
supabase/functions/process-player-photo/.npmrc
supabase/functions/process-player-photo/deno.json
supabase/functions/process-player-photo/index.ts
supabase/migrations/0001_auction_engine.sql
supabase/migrations/0002_captain_round.sql
supabase/migrations/0003_auction_status.sql
supabase/migrations/0004_registration_control.sql
supabase/migrations/0005_audit_fixes.sql
supabase/migrations/0006_end_bid_fixes.sql
supabase/migrations/0007_captain_flow.sql
supabase/migrations/0008_auto_allocation.sql
supabase/migrations/0009_enable_realtime.sql
supabase/migrations/0010_end_auction.sql
supabase/migrations/0011_auction_phase_enum.sql
supabase/migrations/0012_explicit_phases.sql
supabase/migrations/0013_explicit_phases_fix.sql
supabase/migrations/0014_explicit_phases_typecast.sql
supabase/migrations/0015_phase_start.sql
supabase/migrations/0016_undo_sale_rework.sql
supabase/migrations/0017_phase2_statuses.sql
supabase/migrations/0018_undo_sale_notice_and_first_bid.sql
supabase/migrations/0019_add_image_urls.sql
supabase/migrations/0020_storage_buckets_setup.sql
supabase/migrations/0021_fix_rpc_bugs.sql
supabase/migrations/0022_fix_enum_typecasts.sql
supabase/migrations/0023_fix_player_status_casts.sql
supabase/migrations/0024_manual_slot_filling.sql
supabase/migrations/0025_admin_auth.sql
supabase/migrations/0026_execute_bid_rpc.sql
supabase/migrations/0027_bidding_indexes.sql
supabase/migrations/0028_optimize_execute_bid_rpc.sql
supabase/migrations/0029_fix_rpc_ambiguous_column.sql
supabase/migrations/0030_refactor_execute_bid.sql
supabase/migrations/0031_optimize_bidding_latency.sql
supabase/migrations/0032_add_unsold_final_enum.sql
supabase/migrations/0033_fix_phase2_loop.sql
supabase/migrations/0034_blind_bids_extension.sql
supabase/migrations/0035_dynamic_increments.sql
supabase/migrations/0036_admin_authorization_checks.sql
supabase/migrations/0037_add_is_blind_bid.sql
supabase/migrations/0038_fix_next_player.sql
tsconfig.json
```

# Files

## File: .gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
.env
.env.local
scripts/seed_players.mjs
repomix-output.md
/repomix-output.md
````

## File: app/admin/auction/[id]/page.tsx
````typescript
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatPrice, numberToIndianWords } from "@/lib/utils";
import {
  useAuctionState,
  Auction,
  Team,
  Player,
  AuctionState,
  AuctionSettings
} from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TeamRoster from "@/components/team/TeamRoster";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminAuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: auctionId } = use(params);

  const {
    auction,
    teams,
    players,
    state,
    currentPlayer,
    leadingTeam,
    loading: dataLoading,
    setPlayers,
    setTeams,
    setState
  } = useAuctionState(auctionId);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  const selectedCaptains = useMemo(() => players.filter((p) => p.is_captain), [players]);
  const unassignedCaptains = useMemo(
    () => selectedCaptains.filter((c) => c.status === "upcoming"),
    [selectedCaptains]
  );
  const blindBidPlayers = useMemo(() => players.filter((p) => p.status === "blind_reserved"), [players]);
  const unassignedBlindBids = useMemo(() => blindBidPlayers.filter((p) => p.status === "blind_reserved"), [blindBidPlayers]);

  const [blindBidAssignments, setBlindBidAssignments] = useState<Record<string, { playerId: string; amount: string }>>({});

  // Helper: compute tier-based dynamic increment from auction settings
  const getDynamicIncrement = (currentBid: number): number => {
    if (!auction) return 0;
    const s = auction.settings as any;
    const t1Thresh = Number(s.tier1_threshold);
    const t2Thresh = Number(s.tier2_threshold);
    if (t1Thresh && t2Thresh) {
      if (currentBid < t1Thresh) return Number(s.tier1_increment) || 0;
      if (currentBid < t2Thresh) return Number(s.tier2_increment) || 0;
      return Number(s.tier3_increment) || 0;
    }
    // Legacy fallback
    return Number(s.increment) || 0;
  };

  const [captainBids, setCaptainBids] = useState<Record<string, { captainId: string; amount: string }>>({});

  // Initialize captain bid amounts with captain_base_price for all unmatched teams
  // to prevent uncontrolled→controlled input warning
  useEffect(() => {
    if (auction && teams.length > 0) {
      const basePrice = String(auction.settings?.captain_base_price ?? auction.settings?.base_price ?? '');
      setCaptainBids(prev => {
        const updated = { ...prev };
        teams.forEach(t => {
          if (!t.captain_id && !updated[t.id]) {
            updated[t.id] = { captainId: '', amount: basePrice };
          }
        });
        return updated;
      });
    }
  }, [auction, teams]);

  // Initialize blind bid assignment amounts with base_price
  useEffect(() => {
    if (auction && teams.length > 0) {
      const basePrice = String(auction.settings?.base_price ?? '');
      setBlindBidAssignments(prev => {
        const updated = { ...prev };
        teams.forEach(t => {
          if (!updated[t.id]) {
            updated[t.id] = { playerId: '', amount: basePrice };
          }
        });
        return updated;
      });
    }
  }, [auction, teams]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setIsAuthed(true);
      setCheckingAuth(false);
    };

    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (state?.phase === "completed_sale" || state?.phase === "completed_unsold" || state?.phase === "phase_2_hype") {
      const timer = setTimeout(async () => {
        setLoadingAction("next_player");
        try {
          await supabase.rpc("next_player", { p_auction_id: auctionId });
        } catch (e) {
          console.error("Auto-advance failed:", e);
        } finally {
          setLoadingAction(null);
        }
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [state?.phase, auctionId]);

  const safeSettings = auction?.settings;

  // Compute current dynamic increment for display
  const currentDynamicIncrement = useMemo(() => {
    if (!state?.current_bid && !safeSettings?.base_price) return 0;
    return getDynamicIncrement(state?.current_bid ?? Number(safeSettings?.base_price ?? 0));
  }, [state?.current_bid, safeSettings, auction]);

  if (checkingAuth) {
    return <div className="p-6 text-lg text-slate-700 dark:text-slate-50">Checking admin access...</div>;
  }

  if (!isAuthed) {
    return null;
  }

  if (!auction) {
    return <div className="p-6 text-lg">Loading auction...</div>;
  }

  if (auction.status === "completed") {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{auction.name} - Results</h1>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-emerald-500/20">Auction Completed</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 gap-2"
            onClick={() => router.push(`/admin`)}
          >
            ← Return to Dashboard
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <TeamRoster auction={auction} teams={teams} players={players} mode="recap" />
        </div>
      </div>
    );
  }

  const settings = auction.settings;
  const allTeamsHaveCaptain = teams.length > 0 && teams.every((t) => t.captain_id);

  const computeCanBid = (team: Team) => {
    const s = auction?.settings;
    if (!s) return false;
    if (!state) return false;
    if (!state.current_player_id) return false;
    if (state.leading_team_id === team.id) return false;

    const basePrice = Number(s.base_price ?? 0);
    const currentBid = state.current_bid ?? basePrice;
    const dynamicIncrement = getDynamicIncrement(currentBid);

    // If no leading team, next bid IS the current_bid (base_price).
    // Otherwise, it's current_bid + dynamicIncrement.
    const nextBid = state.leading_team_id === null ? currentBid : currentBid + dynamicIncrement;

    const purse = Number(team.purse_remaining ?? 0);
    const slots = team.slots_remaining ?? 0;

    const failsPurse = purse < nextBid;
    const failsSlots = slots <= 0;

    const remainingSlotsAfter = slots - 1;
    const requiredMoney = remainingSlotsAfter * basePrice;
    const failsMinimumSquad = purse - nextBid < requiredMoney;

    return !(failsPurse || failsSlots || failsMinimumSquad);
  };

  const handleNextPlayer = async () => {
    setLoadingAction("next_player");
    try {
      const { data: updatedState, error } = await supabase.rpc("next_player", { p_auction_id: auctionId });
      if (error) {
        window.alert(`Next player failed: ${error.message}`);
      } else if (updatedState) {
        if (updatedState.phase === "phase_2_complete") {
          window.alert("Phase 2 pool is empty! All players have completed bidding. Please proceed to the Slot Filling phase.");
        } else if (updatedState.phase === "phase_1_complete") {
          window.alert("Phase 1 pool is empty! Please proceed to Phase 2 (Unsold Players).");
        }
      }
    } catch (e: any) {
      console.error("Auto-advance failed:", e);
      window.alert(`Critical error: ${e.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStartBid = async () => {
    setLoadingAction("start_bid");
    try {
      const { error } = await supabase.rpc("start_bid", { p_auction_id: auctionId });
      if (error) window.alert(`Start bid failed: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStartPhase2Hype = async () => {
    setLoadingAction("start_phase2");
    try {
      await supabase.rpc("start_phase2", { p_auction_id: auctionId });
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePlaceBid = async (teamId: string) => {
    if (!state?.current_player_id) {
      window.alert('No player currently selected');
      return;
    }

    setLoadingAction(`bid_${teamId}`);

    // Calculate next bid amount using dynamic tier increments
    const base_price = auction.settings.base_price;
    const current_bid = state.current_bid ?? base_price;
    const dynamicIncr = getDynamicIncrement(current_bid);
    const next_bid = state.leading_team_id === null ? current_bid : current_bid + dynamicIncr;

    // --- Optimistic UI Update ---
    // Backup the old state to revert if the RPC fails
    const previousState = { ...state };
    const oldTeamPurse = teams.find(t => t.id === teamId)?.purse_remaining;

    // Immediately apply new state locally so the button feels instant
    setState(prev => prev ? {
      ...prev,
      current_bid: next_bid,
      leading_team_id: teamId,
      previous_bid: prev.current_bid,
      previous_leading_team_id: prev.leading_team_id
    } : null);

    // Optimistically deduct purse for the new leader
    setTeams(prev => prev.map(t => {
      // Restore old leader's purse
      if (t.id === previousState.leading_team_id) {
        return { ...t, purse_remaining: t.purse_remaining + (previousState.current_bid || 0) };
      }
      // Deduct new leader's purse
      if (t.id === teamId) {
        return { ...t, purse_remaining: t.purse_remaining - next_bid };
      }
      return t;
    }));

    try {
      const { data: result, error: invokeError } = await supabase.rpc('execute_bid', {
        p_auction_id: auctionId,
        p_team_id: teamId,
        p_next_bid: next_bid
      });

      if (invokeError) {
        // Handle race condition: bid was outpaced, retry with fresh state
        if (invokeError.message?.includes('must be higher than current bid')) {
          console.warn('Bid outpaced, retrying with fresh state...');

          // Revert optimistic updates first
          setState(previousState as AuctionState);
          setTeams(prev => prev.map(t => t.id === teamId && oldTeamPurse !== undefined ? { ...t, purse_remaining: oldTeamPurse } : t));

          const { data: freshState } = await supabase
            .from('auction_state')
            .select('current_bid, leading_team_id')
            .eq('auction_id', auctionId)
            .single();

          if (freshState) {
            const freshDynIncr = getDynamicIncrement(freshState.current_bid ?? base_price);
            const freshBid = freshState.leading_team_id === null
              ? (freshState.current_bid ?? base_price)
              : (freshState.current_bid ?? base_price) + freshDynIncr;

            // Apply optimistic update for the retry
            setState(prev => prev ? {
              ...prev, current_bid: freshBid, leading_team_id: teamId
            } : null);

            const { error: retryError } = await supabase.rpc('execute_bid', {
              p_auction_id: auctionId,
              p_team_id: teamId,
              p_next_bid: freshBid
            });

            if (retryError) {
              setState(previousState as AuctionState); // Rollback on final failure
              window.alert(`Bid failed: ${retryError.message}`);
            }
          }
        } else {
          // Revert optimistic updates on normal error
          setState(previousState as AuctionState);
          setTeams(prev => prev.map(t => t.id === teamId && oldTeamPurse !== undefined ? { ...t, purse_remaining: oldTeamPurse } : t));
          window.alert(`Bid failed: ${invokeError.message}`);
        }
      }

    } catch (err: any) {
      console.error("Bid error:", err);
      // Revert optimistic updates on exception
      setState(previousState as AuctionState);
      setTeams(prev => prev.map(t => t.id === teamId && oldTeamPurse !== undefined ? { ...t, purse_remaining: oldTeamPurse } : t));
      window.alert(`Bid Execution Failed:\n\n${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUndoBid = async () => {
    setLoadingAction("undo_bid");
    try {
      const { error } = await supabase.rpc("undo_bid", { p_auction_id: auctionId });
      if (error) window.alert(`Undo bid failed: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUndoSale = async () => {
    setLoadingAction("undo_sale");
    try {
      await supabase.rpc("undo_sale", { p_auction_id: auctionId });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEndBid = async () => {
    setLoadingAction("end_bid");
    try {
      const { error } = await supabase.rpc("end_bid", { p_auction_id: auctionId });
      if (error) window.alert(`End bid failed: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStartSlotFilling = async () => {
    setLoadingAction("start_slot_filling");
    try {
      const { error } = await supabase
        .from("auction_state")
        .update({ phase: "slot_filling" })
        .eq("auction_id", auctionId);
      if (error) throw error;
      
      router.push(`/admin/auction/${auctionId}/verify`);
    } catch (e: any) {
      window.alert(`Failed to start slot filling: ${e.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEndAuction = async () => {
    router.push(`/admin/auction/${auctionId}/verify`);
  };

  const handleSetPlayerCategory = async (playerId: string, category: 'regular' | 'captain' | 'blind_bid') => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    if (category === 'captain') {
      // Set is_captain = true, status stays 'upcoming', is_blind_bid = false
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, is_captain: true, status: 'upcoming' as any, is_blind_bid: false } : p));
      const { error } = await supabase.from('players').update({ is_captain: true, status: 'upcoming', is_blind_bid: false }).eq('id', playerId);
      if (error) {
        alert('Failed to set category: ' + error.message);
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, is_captain: player.is_captain, status: player.status } : p));
      }
    } else if (category === 'blind_bid') {
      // Set status = 'blind_reserved', is_captain = false, is_blind_bid = true
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, is_captain: false, status: 'blind_reserved' as any, is_blind_bid: true } : p));
      const { error } = await supabase.from('players').update({ is_captain: false, status: 'blind_reserved', is_blind_bid: true }).eq('id', playerId);
      if (error) {
        alert('Failed to set category: ' + error.message);
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, is_captain: player.is_captain, status: player.status } : p));
      }
    } else {
      // Regular: is_captain = false, status = 'upcoming', is_blind_bid = false
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, is_captain: false, status: 'upcoming' as any, is_blind_bid: false } : p));
      const { error } = await supabase.from('players').update({ is_captain: false, status: 'upcoming', is_blind_bid: false }).eq('id', playerId);
      if (error) {
        alert('Failed to set category: ' + error.message);
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, is_captain: player.is_captain, status: player.status } : p));
      }
    }
  };

  // Legacy wrapper for backward compat
  const handleToggleCaptain = async (playerId: string, currentVal: boolean) => {
    await handleSetPlayerCategory(playerId, currentVal ? 'regular' : 'captain');
  };

  const handleStartBlindBidRound = async () => {
    setLoadingAction('start_blind_bid_round');
    try {
      const { error } = await supabase.rpc('start_blind_bid_round', { p_auction_id: auctionId });
      if (error) window.alert(`Failed to start blind bid round: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMatchBlindBid = async (teamId: string) => {
    const assignment = blindBidAssignments[teamId];
    if (!assignment || !assignment.playerId) return;

    const matchPrice = assignment.amount ? Number(assignment.amount) : (auction?.settings?.base_price ?? 0);
    const minPrice = auction?.settings?.base_price ?? 0;
    if (matchPrice < minPrice) {
      alert(`Bid amount (₹${matchPrice.toLocaleString('en-IN')}) cannot be less than the base price (₹${minPrice.toLocaleString('en-IN')}).`);
      return;
    }

    setLoadingAction(`blind_match_${teamId}`);
    try {
      const { error } = await supabase.rpc('match_player_blind_bid', {
        p_auction_id: auctionId,
        p_team_id: teamId,
        p_player_id: assignment.playerId,
        p_price: matchPrice
      });
      if (error) {
        alert('Failed to match blind bid: ' + error.message);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStartCaptainRound = async () => {
    setLoadingAction("start_captain_round");
    try {
      if (state) {
        await supabase
          .from("auction_state")
          .update({ phase: "captain_round", current_player_id: null, current_bid: null, leading_team_id: null })
          .eq("auction_id", auctionId);
      } else {
        await supabase
          .from("auction_state")
          .insert({ auction_id: auctionId, phase: "captain_round" });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMatchCaptain = async (teamId: string) => {
    const bidInfo = captainBids[teamId];
    if (!bidInfo || !bidInfo.captainId) return;

    const matchPrice = bidInfo.amount ? Number(bidInfo.amount) : (auction.settings.captain_base_price ?? auction.settings.base_price);
    const minCaptainPrice = auction.settings.captain_base_price ?? auction.settings.base_price;
    if (matchPrice < minCaptainPrice) {
      alert(`Captain bid amount (₹${matchPrice.toLocaleString('en-IN')}) cannot be less than the captain base price (₹${minCaptainPrice.toLocaleString('en-IN')}).`);
      return;
    }

    setLoadingAction(`match_${teamId}`);
    try {
      const { error } = await supabase.rpc("match_captain_blind_bid", {
        p_auction_id: auctionId,
        p_team_id: teamId,
        p_player_id: bidInfo.captainId,
        p_price: matchPrice
      });
      if (error) {
        alert("Failed to match captain: " + error.message);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleConcludeCaptainPhase = async () => {
    setLoadingAction("conclude_captain_phase");
    try {
      await supabase.rpc("next_player", { p_auction_id: auctionId });
    } finally {
      setLoadingAction(null);
    }
  };

  if (!allTeamsHaveCaptain && state?.phase !== "captain_round" && state?.phase !== "blind_bid_round") {
    const captainCountValid = selectedCaptains.length === teams.length;
    const blindBidCountValid = blindBidPlayers.length === 0 || (blindBidPlayers.length > 0 && blindBidPlayers.length % teams.length === 0);
    const canProceed = captainCountValid && blindBidCountValid;

    const handleProceedToReveal = async () => {
      if (!captainCountValid) {
        window.alert(`You must select exactly ${teams.length} captains (currently ${selectedCaptains.length}).`);
        return;
      }
      if (blindBidPlayers.length > 0 && blindBidPlayers.length % teams.length !== 0) {
        window.alert(`Blind bid count (${blindBidPlayers.length}) must be a multiple of the number of teams (${teams.length}).`);
        return;
      }
      if (blindBidPlayers.length === 0) {
        const proceed = window.confirm("Proceed without blind bid players other than captains?");
        if (!proceed) return;
      }
      await handleStartCaptainRound();
    };

    const getPlayerCategory = (p: Player): 'regular' | 'captain' | 'blind_bid' => {
      if (p.is_captain) return 'captain';
      if (p.status === 'blind_reserved') return 'blind_bid';
      return 'regular';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 text-slate-800 dark:text-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Player Categorization</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {auction.name} · {auction.sport_type.toUpperCase()}
              </p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                Mark exactly {teams.length} captains. Blind bid players (if any) must be a multiple of {teams.length}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex gap-3 text-xs">
                <span className={`font-bold ${captainCountValid ? 'text-emerald-500' : 'text-rose-400'}`}>
                  Captains: {selectedCaptains.length}/{teams.length}
                </span>
                <span className={`font-bold ${blindBidCountValid ? 'text-emerald-500' : 'text-rose-400'}`}>
                  Blind Bids: {blindBidPlayers.length}
                </span>
              </div>
              <Button
                variant="default"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={handleProceedToReveal}
                disabled={!canProceed || loadingAction === "start_captain_round"}
              >
                {loadingAction === "start_captain_round" ? "Starting..." : "Proceed to Captain Reveal"}
              </Button>
            </div>
          </header>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-5 shadow-xl shadow-slate-300/40 dark:shadow-slate-950/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                Categorize Players
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-2 pb-16">
              {players.filter(p => p.status === "upcoming" || p.status === "blind_reserved" || (p.is_captain && p.status !== "sold")).map(p => {
                const category = getPlayerCategory(p);
                return (
                  <div
                    key={p.id}
                    className={`rounded-lg border p-3 space-y-2 ${
                      category === 'captain' ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/30' :
                      category === 'blind_bid' ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/30' :
                      'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-[10px] uppercase opacity-70 mt-0.5">{p.role}</div>
                    </div>
                    <div className="flex rounded-md overflow-hidden border border-slate-300 dark:border-slate-700 text-[10px] font-bold uppercase">
                      <button
                        onClick={() => handleSetPlayerCategory(p.id, 'regular')}
                        className={`flex-1 py-1.5 px-2 transition-colors ${category === 'regular' ? 'bg-slate-600 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                      >
                        Regular
                      </button>
                      <button
                        onClick={() => handleSetPlayerCategory(p.id, 'captain')}
                        className={`flex-1 py-1.5 px-2 transition-colors border-x border-slate-300 dark:border-slate-700 ${category === 'captain' ? 'bg-amber-600 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                      >
                        Captain
                      </button>
                      <button
                        onClick={() => handleSetPlayerCategory(p.id, 'blind_bid')}
                        className={`flex-1 py-1.5 px-2 transition-colors ${category === 'blind_bid' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                      >
                        Blind Bid
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!allTeamsHaveCaptain && state?.phase === "captain_round") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 text-slate-800 dark:text-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight">Captain Blind Bidding Setup</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The Live Screen is currently portraying the Blind Bidding animation. Match captains to proceed.</p>
            </div>
          </header>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-5 shadow-xl shadow-slate-300/40 dark:shadow-slate-950/50">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              Match Captains to Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => {
                if (team.captain_id) {
                  const c = players.find(p => p.id === team.captain_id);
                  return (
                    <div key={`matched-${team.id}`} className="rounded-lg border border-emerald-300/50 dark:border-emerald-800/50 bg-emerald-50/20 dark:bg-emerald-950/20 p-4">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">✓ {team.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">Captain: <span className="text-slate-900 dark:text-white font-medium">{c?.name}</span></div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bid Amount: {formatPrice(c?.sold_price)}</div>
                    </div>
                  );
                }

                return (
                  <div key={`unmatched-${team.id}`} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 p-4 space-y-3">
                    <div className="font-semibold">{team.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Purse: {formatPrice(team.purse_remaining)}</div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Select Captain</Label>
                      <select
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm outline-none focus:border-amber-500"
                        value={captainBids[team.id]?.captainId || ""}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCaptainBids(prev => ({ ...prev, [team.id]: { ...prev[team.id], captainId: e.target.value, amount: prev[team.id]?.amount || '' } }))}
                      >
                        <option value="">-- Choose --</option>
                        {unassignedCaptains.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Winning Blind Bid</Label>
                      <Input
                        type="number"
                        min={auction.settings.captain_base_price ?? auction.settings.base_price}
                        className="bg-slate-50 dark:bg-slate-950 h-8 text-sm"
                        placeholder={`Min: ${auction.settings.captain_base_price ?? auction.settings.base_price}`}
                        value={captainBids[team.id]?.amount ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaptainBids(prev => ({ ...prev, [team.id]: { ...prev[team.id], amount: e.target.value } }))}
                      />
                      {Number(captainBids[team.id]?.amount) > 0 && (
                        <p className="text-[10px] text-emerald-500 dark:text-emerald-400 italic mt-0.5">
                          ₹{numberToIndianWords(Number(captainBids[team.id]?.amount))}
                        </p>
                      )}
                    </div>

                    <Button
                      className="w-full mt-2"
                      size="sm"
                      variant="secondary"
                      disabled={!captainBids[team.id]?.captainId || loadingAction === `match_${team.id}`}
                      onClick={() => handleMatchCaptain(team.id)}
                    >
                      {loadingAction === `match_${team.id}` ? "Matching..." : "Confirm & Match"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (allTeamsHaveCaptain && state?.phase === "captain_round") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 flex flex-col items-center justify-center">
        <div className="text-center space-y-6 bg-white/50 dark:bg-slate-900/50 p-10 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight">Captain Matching Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            All teams have their captains assigned successfully via Blind Bidding.
            You can now conclude the captain phase and begin the regular player auction.
            {blindBidPlayers.length > 0 && ` (${blindBidPlayers.length} blind bid player(s) can be allocated from the auction panel.)`}
          </p>
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium" onClick={handleConcludeCaptainPhase} disabled={loadingAction === "conclude_captain_phase"}>
            {loadingAction === "conclude_captain_phase" ? "Transitioning..." : "Conclude Setup & Start Auction"}
          </Button>
        </div>
      </div>
    )
  }

  // Blind Bid Allocation Phase
  if (state?.phase === "blind_bid_round") {
    const allBlindBidsAssigned = unassignedBlindBids.length === 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 text-slate-800 dark:text-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 tracking-tight">Blind Bid Player Allocation</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Assign blind bid players to teams. {unassignedBlindBids.length} remaining.
              </p>
            </div>
            {allBlindBidsAssigned && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={handleConcludeCaptainPhase}
                disabled={loadingAction === "conclude_captain_phase"}
              >
                {loadingAction === "conclude_captain_phase" ? "Transitioning..." : "Conclude & Start Open Auction"}
              </Button>
            )}
          </header>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-5 shadow-xl shadow-slate-300/40 dark:shadow-slate-950/50">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              Match Blind Bid Players to Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => (
                <div key={`blind-${team.id}`} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 p-4 space-y-3">
                  <div className="font-semibold">{team.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Purse: {formatPrice(team.purse_remaining)} · Slots: {team.slots_remaining}</div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500 dark:text-slate-400">Select Player</Label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                      value={blindBidAssignments[team.id]?.playerId || ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBlindBidAssignments(prev => ({ ...prev, [team.id]: { ...prev[team.id], playerId: e.target.value, amount: prev[team.id]?.amount || '' } }))}
                    >
                      <option value="">-- Choose --</option>
                      {unassignedBlindBids.map(p => <option key={p.id} value={p.id}>{p.name} ({p.role})</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500 dark:text-slate-400">Winning Blind Bid</Label>
                    <Input
                      type="number"
                      min={auction.settings.base_price}
                      className="bg-slate-50 dark:bg-slate-950 h-8 text-sm"
                      placeholder={`Min: ${auction.settings.base_price}`}
                      value={blindBidAssignments[team.id]?.amount ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBlindBidAssignments(prev => ({ ...prev, [team.id]: { ...prev[team.id], amount: e.target.value } }))}
                    />
                    {Number(blindBidAssignments[team.id]?.amount) > 0 && (
                      <p className="text-[10px] text-emerald-500 dark:text-emerald-400 italic mt-0.5">
                        ₹{numberToIndianWords(Number(blindBidAssignments[team.id]?.amount))}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full mt-2"
                    size="sm"
                    variant="secondary"
                    disabled={!blindBidAssignments[team.id]?.playerId || loadingAction === `blind_match_${team.id}`}
                    onClick={() => handleMatchBlindBid(team.id)}
                  >
                    {loadingAction === `blind_match_${team.id}` ? "Matching..." : "Confirm & Match"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (state?.phase === "phase_1_complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="text-center space-y-6 bg-white/50 dark:bg-slate-900/50 p-10 rounded-2xl border border-amber-300 dark:border-amber-800 shadow-2xl shadow-amber-200/20 dark:shadow-amber-900/20 max-w-xl">
          <h2 className="text-3xl font-semibold text-amber-600 dark:text-amber-500 tracking-tight">Phase 1 Complete!</h2>
          <div className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm space-y-2">
            <p>The primary upcoming player pool has been entirely exhausted.</p>
            <p><strong>({players.filter(p => p.status === "upcoming").length})</strong> players remain for drawing.</p>
            <p>Click below to transition to Phase 2. This will broadcast an intermission 'Hype' screen to the Audience and begin drawing from the remaining pool.</p>
          </div>
          <Button size="lg" className="bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-md w-full" onClick={handleStartPhase2Hype} disabled={loadingAction === "start_phase2"}>
            {loadingAction === "start_phase2" ? "Starting..." : "Proceed to Phase 2 (Unsold Players)"}
          </Button>
        </div>
      </div>
    )
  }
  if (state?.phase === "phase_2_complete") {
    const finalUnsolds = players.filter(p => ["unsold", "unsold_final"].includes(p.status)).length;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="text-center space-y-6 bg-white/50 dark:bg-slate-900/50 p-10 rounded-2xl border border-rose-300 dark:border-rose-800 shadow-2xl shadow-rose-200/20 dark:shadow-rose-900/20 max-w-xl">
          <h2 className="text-3xl font-semibold text-rose-600 dark:text-rose-500 tracking-tight">Phase 2 Complete!</h2>
          <div className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm space-y-2">
            <p>The entire player pool has been exhausted.</p>
            <p><strong>({finalUnsolds})</strong> players were never drawn after Phase 2.</p>
            <p>You can now proceed to the accelerated Slot Filling phase to quickly complete remaining team slots.</p>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium w-full" onClick={handleStartSlotFilling} disabled={loadingAction === "start_slot_filling"}>
              {loadingAction === "start_slot_filling" ? "Starting..." : "Proceed to Slot Filling Phase"}
            </Button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 text-slate-800 dark:text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">Auction Control</h1>
              <ThemeToggle />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {auction.name} · {auction.sport_type.toUpperCase()}
            </p>
            {!allTeamsHaveCaptain && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                Assign captains to every team in{" "}
                <span className="underline">Admin &gt; Manage Teams</span> before starting the live
                auction.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleStartBid}
              disabled={
                loadingAction === "start_bid" || !state?.current_player_id || !allTeamsHaveCaptain || state?.current_bid !== null
              }
            >
              Start Bid
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUndoBid}
              disabled={loadingAction === "undo_bid" || state?.current_bid === null || state?.previous_bid === null || !['phase1', 'phase2'].includes(state?.phase || '')}
            >
              Undo Bid
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndBid}
              disabled={loadingAction === "end_bid" || !state?.current_player_id || state?.phase?.startsWith("completed") || state?.current_bid === null}
            >
              End Bid
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUndoSale}
              disabled={
                loadingAction === "undo_sale" ||
                !(
                  (state?.phase?.startsWith("completed") && state?.current_player_id) ||
                  ((state?.phase === "phase1" || state?.phase === "phase2") && state?.current_bid === null && state?.previous_player_id)
                )
              }
            >
              Undo Sale
            </Button>
            {unassignedBlindBids.length > 0 && (
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={handleStartBlindBidRound}
                disabled={loadingAction === "start_blind_bid_round"}
              >
                {loadingAction === "start_blind_bid_round" ? "Starting..." : `Blind Bids (${unassignedBlindBids.length})`}
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              className="bg-rose-600 font-bold text-white hover:bg-rose-500 shadow-md shadow-rose-900/50"
              onClick={handleEndAuction}
              disabled={loadingAction === "end_auction"}
            >
              {loadingAction === "end_auction" ? "Ending..." : "End Auction"}
            </Button>
          </div>
        </header>

        {state?.show_undo_notice && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 rounded-xl border border-amber-400/30 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/40 p-4 shadow-2xl shadow-amber-200/20 dark:shadow-amber-900/20 ring-1 ring-amber-400/20 dark:ring-amber-500/20">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white dark:text-slate-950 text-xl font-black shadow-lg">!</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-500 dark:text-amber-400">SALE REVERSED</h3>
                <p className="text-sm text-amber-700/80 dark:text-amber-200/80 leading-snug">The previous transaction was undone. The player has been restored. You can now start the bidding again.</p>
              </div>
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 shadow-lg shadow-amber-900/40"
                onClick={handleStartBid}
              >
                RESTORE BIDDING
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
          <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-5 shadow-xl shadow-slate-300/40 dark:shadow-slate-950/50">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              Current Player
            </h2>
            {currentPlayer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-100/40 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="scale-75 origin-left w-[80px]">
                    <PlayerAvatar
                      id={currentPlayer.id}
                      name={currentPlayer.name}
                      role={currentPlayer.role}
                      photoUrl={currentPlayer.photo_url}
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{currentPlayer.name}</div>
                    <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">{currentPlayer.role}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-slate-100/80 dark:bg-slate-900/80 px-3 py-2">
                    <div className="text-xs uppercase text-slate-500 dark:text-slate-400">Base Price</div>
                    <div className="text-lg font-semibold">
                      {formatPrice(settings.base_price)}
                    </div>
                  </div>
                  <div className="rounded-md bg-slate-100/80 dark:bg-slate-900/80 px-3 py-2">
                    <div className="text-xs uppercase text-slate-500 dark:text-slate-400">Increment</div>
                    <div className="text-lg font-semibold">
                      +{formatPrice(currentDynamicIncrement)}
                    </div>
                  </div>
                  <div className="rounded-md bg-emerald-900/40 px-3 py-2">
                    <div className="text-xs uppercase text-emerald-300">Current Bid</div>
                    {formatPrice(state?.current_bid ?? settings.base_price)}
                  </div>
                  <div className="rounded-md bg-slate-100/80 dark:bg-slate-900/80 px-3 py-2">
                    <div className="text-xs uppercase text-slate-500 dark:text-slate-400">Leading Team</div>
                    <div className="text-lg font-semibold">
                      {leadingTeam ? leadingTeam.name : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ) : state?.phase === "completed_sale" || state?.phase === "completed_unsold" ? (
              <div className="flex h-40 flex-col items-center justify-center space-y-4">
                <div className={`text-3xl font-bold uppercase tracking-widest ${state.phase === "completed_sale" ? "text-emerald-400" : "text-slate-500"}`}>
                  {state.phase === "completed_sale" ? "Sold!" : "Unsold!"}
                </div>
                <div className="text-sm text-slate-400">
                  Select &quot;Next Player&quot; to continue, or &quot;Undo Sale&quot; to reverse this result.
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500 dark:text-slate-500">
                No player selected. Use &quot;Next Player&quot; to draw one.
              </div>
            )}
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-5 shadow-xl shadow-slate-300/40 dark:shadow-slate-950/50">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              Teams · Bid Controls
            </h2>

            {state?.current_bid === null ? (
              <div className="flex h-32 items-center justify-center text-sm text-slate-500 dark:text-slate-500 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                Click "Start Bid" to unlock team controls for the current player.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {teams.map((team) => {
                  const canBid = computeCanBid(team);
                  const isLeading = state?.leading_team_id === team.id;
                  const isLoading = loadingAction === `bid_${team.id}`;

                  return (
                    <Button
                      key={team.id}
                      className={`relative flex h-auto flex-col items-start justify-between gap-1.5 rounded-xl border px-3 py-3 text-left shadow-sm transition-all duration-300 ${isLeading ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]' : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                      disabled={!canBid || isLoading || isLeading}
                      onClick={() => handlePlaceBid(team.id)}
                    >
                      <div className="w-full">
                        <span className="font-bold flex items-center justify-between gap-2 text-sm text-slate-700 dark:text-slate-100 truncate w-full">
                          <span className="truncate">{team.name}</span>
                          {isLeading && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                        </span>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                          {team.manager}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 w-full mt-1">
                        <span className="text-xs text-slate-300 flex justify-between">
                          <span>Purse:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {formatPrice(team.purse_remaining)}
                          </span>
                        </span>
                        <span className="text-xs text-slate-300 flex justify-between">
                          <span>Slots:</span>
                          <span className="font-bold">{team.slots_remaining}</span>
                        </span>
                      </div>

                      <div className="mt-2 w-full">
                        {isLoading ? (
                          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 animate-pulse bg-emerald-950/50 py-1 px-2 rounded w-full text-center">
                            Bidding...
                          </div>
                        ) : isLeading ? (
                          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-900/40 py-1 px-2 rounded border border-emerald-800/50 w-full text-center shadow-sm">
                            Current Highest
                          </div>
                        ) : !canBid ? (
                          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 bg-amber-950/30 py-1 px-2 rounded border border-amber-900/30 w-full text-center">
                            Cannot Bid
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-800/50 py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity w-full text-center hidden md:block">
                            Place Bid
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

    </div>
  );
}
````

## File: app/admin/auction/[id]/teams/page.tsx
````typescript
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Wallet, Shield, Users, Search, Target, Info, Crown, Plus, Eye, UserPlus, GripHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/ImageUploadField";
import { ImageViewerModal } from "@/components/ImageViewerModal";

type AuctionSettings = {
  purse: number;
  min_players: number;
  max_players: number;
  base_price: number;
  increment: number;
  captain_base_price?: number;
};

type Auction = {
  id: string;
  name: string;
  sport_type: string;
  is_registration_open: boolean;
  status?: "upcoming" | "live" | "completed";
  settings: AuctionSettings;
};

type Team = {
  id: string;
  auction_id: string;
  name: string;
  manager: string;
  logo_url?: string;
  purse_remaining: number;
  slots_remaining: number;
  captain_id: string | null;
};

type Player = {
  id: string;
  auction_id: string;
  name: string;
  role: string;
  photo_url?: string;
  phone_number: string | null;
  ip_address: string | null;
  status: "upcoming" | "live" | "sold" | "unsold";
  sold_price: number | null;
  sold_team_id: string | null;
  is_captain?: boolean;
};

export default function ManageTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: auctionId } = use(params);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamManager, setTeamManager] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  const [togglingRegistration, setTogglingRegistration] = useState(false);
  const [lockingAuction, setLockingAuction] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [deletingPlayers, setDeletingPlayers] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState("");

  // Auth check
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setIsAuthed(true);
      setCheckingAuth(false);
    };

    checkAdmin();
  }, [router]);

  // Data loading (only after auth is verified)
  useEffect(() => {
    if (!isAuthed || !auctionId) return;
    const load = async () => {
      const [{ data: auctionData, error: auctionError }, { data: teamData }, { data: playerData }] =
        await Promise.all([
          supabase.from("auctions").select("*").eq("id", auctionId).single(),
          supabase.from("teams").select("*").eq("auction_id", auctionId),
          supabase.from("players").select("*").eq("auction_id", auctionId),
        ]);

      if (auctionError || !auctionData) {
        router.push("/admin");
        return;
      }

      setAuction(auctionData as Auction);
      setTeams((teamData ?? []) as Team[]);
      setPlayers((playerData ?? []) as Player[]);
    };

    load();
  }, [auctionId, router, isAuthed]);

  const upcomingPlayers = useMemo(
    () => players.filter((p) => p.status === "upcoming"),
    [players],
  );

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;
    if (!teamName.trim() || !teamManager.trim()) {
      setError("Team name and manager are required.");
      return;
    }
    if (!logoFile) {
      setLogoError("Please upload a team logo.");
      return;
    }
    setCreatingTeam(true);
    setError(null);
    setLogoError(null);
    try {
      // Upload logo to team-logos bucket
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${auction.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("team-logos")
        .upload(fileName, logoFile);

      if (uploadError) {
        setLogoError(`Logo upload failed: ${uploadError.message}`);
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("team-logos")
        .getPublicUrl(fileName);

      const logoUrl = urlData?.publicUrl;

      const { error: insertError } = await supabase.from("teams").insert({
        auction_id: auction.id,
        name: teamName.trim(),
        manager: teamManager.trim(),
        logo_url: logoUrl,
        purse_remaining: auction.settings.purse,
        slots_remaining: auction.settings.max_players,
      });
      if (insertError) {
        setError(insertError.message);
      } else {
        setTeamName("");
        setTeamManager("");
        setLogoFile(null);
        setLogoPreview(null);
        const { data: teamData } = await supabase.from("teams").select("*").eq("auction_id", auctionId);
        setTeams((teamData ?? []) as Team[]);
      }
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleToggleRegistration = async () => {
    if (!auction) return;
    setTogglingRegistration(true);
    const newVal = !auction.is_registration_open;
    try {
      const { error: updateError } = await supabase
        .from("auctions")
        .update({ is_registration_open: newVal })
        .eq("id", auctionId);
      if (!updateError) {
        setAuction((prev) => prev ? { ...prev, is_registration_open: newVal } : null);
      }
    } finally {
      setTogglingRegistration(false);
    }
  };

  const handleTogglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  const handleBatchDelete = async () => {
    if (selectedPlayerIds.size === 0) return;
    setDeletingPlayers(true);
    try {
      const { error: deleteError } = await supabase
        .from("players")
        .delete()
        .in("id", Array.from(selectedPlayerIds));
      if (!deleteError) {
        setPlayers((prev) => prev.filter((p) => !selectedPlayerIds.has(p.id)));
        setSelectedPlayerIds(new Set());
      }
    } finally {
      setDeletingPlayers(false);
    }
  };

  const handleLockAndProceed = async () => {
    if (!auction) return;
    setLockingAuction(true);
    try {
      // Close Registration and Set Status to Live
      const { error: updateError } = await supabase
        .from("auctions")
        .update({
          is_registration_open: false,
          status: "live"
        })
        .eq("id", auctionId);

      if (!updateError) {
        router.push(`/admin/auction/${auction.id}`);
      }
    } finally {
      setLockingAuction(false);
    }
  };

  const farmIps = useMemo(() => {
    const counts = players.reduce((acc, p) => {
      if (p.ip_address) {
        acc[p.ip_address] = (acc[p.ip_address] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    return new Set(Object.entries(counts).filter(([_, count]) => count > 1).map(([ip]) => ip));
  }, [players]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="mt-4 text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest text-xs">
          Verifying Access...
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  if (!auction) {
    return <div className="p-6 text-slate-700 dark:text-slate-50">Loading Verification Hub...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 sm:px-6 py-8 sm:py-10 text-slate-800 dark:text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Verification Hub · {auction.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Verify registered participants and create teams. Lock participants to proceed to the Live Controller.
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Registration Link:</span>
              <code className="text-emerald-600 dark:text-emerald-400 font-mono text-xs select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/auction/${auction.id}` : ''}
              </code>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 ml-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 uppercase tracking-wider"
                onClick={(e) => {
                  navigator.clipboard.writeText(`${window.location.origin}/auction/${auction.id}`);
                  const btn = e.currentTarget;
                  const originalText = btn.innerText;
                  btn.innerText = "Copied!";
                  setTimeout(() => { btn.innerText = originalText; }, 2000);
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={auction.is_registration_open ? "destructive" : "secondary"}
              size="sm"
              onClick={handleToggleRegistration}
              disabled={togglingRegistration}
            >
              {togglingRegistration
                ? "Toggling..."
                : auction.is_registration_open
                  ? "Force Close Registration"
                  : "Re-open Registration"}
            </Button>
            {auction.status === "upcoming" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleLockAndProceed}
                disabled={lockingAuction || players.length === 0 || teams.length === 0}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {lockingAuction ? "Locking..." : "Lock Participants & Proceed"}
              </Button>
            )}
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
          <Card className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 shadow-xl shadow-slate-300/40 dark:shadow-black/60">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Create Team
            </h2>
            <form className="space-y-3 text-sm" onSubmit={handleCreateTeam}>
              <div className="space-y-1">
                <Label htmlFor="team-name" className="text-slate-700 dark:text-slate-100">
                  Team Name
                </Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="team-manager" className="text-slate-700 dark:text-slate-100">
                  Manager Name
                </Label>
                <Input
                  id="team-manager"
                  value={teamManager}
                  onChange={(e) => setTeamManager(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50"
                />
              </div>
              <ImageUploadField
                label="Team Logo"
                value={logoFile}
                onChange={setLogoFile}
                preview={logoPreview}
                onPreviewChange={setLogoPreview}
                error={logoError}
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Each new team starts with a purse of{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {formatPrice(auction.settings.purse)}
                </span>{" "}
                and{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {auction.settings.max_players} slots
                </span>
                .
              </p>
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <Button type="submit" disabled={creatingTeam}>
                {creatingTeam ? "Creating..." : "Add Team"}
              </Button>
            </form>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 shadow-xl shadow-slate-300/40 dark:shadow-black/60">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Verified Teams
            </h2>
            {teams.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No teams created yet. Add teams on the left to begin.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                {teams.map((team) => {
                  return (
                    <div
                      key={team.id}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">{team.name}</div>
                          <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {team.manager}
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-600 dark:text-slate-300">
                          <div>
                            Purse:{" "}
                            <span className="font-semibold">
                              {formatPrice(team.purse_remaining)}
                            </span>
                          </div>
                          <div>
                            Slots: <span className="font-semibold">{team.slots_remaining}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400 italic text-center">
                        Captain matching will be performed in the Live Control portal.
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Registered Players Cleanup UI */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 shadow-xl shadow-slate-300/40 dark:shadow-black/60">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Registered Players Cleanup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select unwanted or duplicate players directly to remove them from the auction pool. Entries from the same IP are highlighted.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={selectedPlayerIds.size === 0 || deletingPlayers}
              onClick={handleBatchDelete}
            >
              {deletingPlayers ? "Deleting..." : `Delete Selected (${selectedPlayerIds.size})`}
            </Button>
          </div>

          <div className="max-h-[400px] overflow-y-auto rounded-md border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 accent-emerald-500"
                      checked={players.length > 0 && selectedPlayerIds.size === players.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlayerIds(new Set(players.map((p) => p.id)));
                        } else {
                          setSelectedPlayerIds(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Player Details</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Contact & Network</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-500">
                      No players registered yet.
                    </td>
                  </tr>
                ) : (
                  players.map((p) => {
                    const isFarm = p.ip_address && farmIps.has(p.ip_address);
                    const isSelected = selectedPlayerIds.has(p.id);
                    return (
                      <tr
                        key={`player-row-${p.id}`}
                        className={`transition-colors hover:bg-slate-100/30 dark:hover:bg-slate-800/30 ${isSelected ? "bg-slate-100/40 dark:bg-slate-800/40" : ""
                          }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTogglePlayerSelection(p.id)}
                            className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 accent-emerald-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800 dark:text-slate-100">{p.name}</div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500">{p.role}</div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="text-xs text-slate-500 dark:text-slate-400">{p.phone_number || "No Phone"}</div>
                          <div
                            className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] uppercase font-medium ${isFarm
                              ? "bg-amber-100/30 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50"
                              : "text-slate-500 bg-slate-100/50 dark:bg-slate-900/50"
                              }`}
                          >
                            IP: {p.ip_address || "Unknown"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.photo_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 uppercase tracking-wider"
                                onClick={() => {
                                  if (p.photo_url) {
                                    setSelectedImageUrl(p.photo_url);
                                    setSelectedImageTitle(p.name);
                                    setImageViewerOpen(true);
                                  }
                                }}
                              >
                                👁 View
                              </Button>
                            )}
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${p.status === "upcoming"
                                ? "bg-blue-900/30 text-blue-400"
                                : p.status === "sold"
                                  ? "bg-emerald-900/30 text-emerald-400"
                                  : "bg-slate-800 text-slate-400"
                                }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageUrl={selectedImageUrl || undefined}
        title={selectedImageTitle}
        subtitle="Player Photo Verification"
      />
    </div>
  );
}
````

## File: app/admin/auction/[id]/verify/page.tsx
````typescript
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuctionState } from "@/lib/hooks/useAuctionState";
import { TeamLogo } from "@/components/TeamLogo";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Users,
    UserPlus,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ChevronRight,
    UserCheck,
    Lock
} from "lucide-react";

export default function VerifyAuctionPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: auctionId } = use(params);

    const {
        auction,
        teams,
        players,
        loading: stateLoading,
        error: stateError
    } = useAuctionState(auctionId);

    const [authLoading, setAuthLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [expandUnsoldList, setExpandUnsoldList] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "unsold" | "never_drawn">("all");
    const UNSOLD_DISPLAY_LIMIT = 5;

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/admin/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .maybeSingle();

            if (profile?.role !== "admin") {
                router.push("/");
                return;
            }
            setAuthLoading(false);
        };

        checkAuth();
    }, [router]);

    const nonSoldPlayers = useMemo(() =>
        players.filter(p => !["sold", "live"].includes(p.status)),
        [players]
    );

    const displayedPlayers = useMemo(() => {
        if (activeTab === "all") return nonSoldPlayers;
        if (activeTab === "unsold") return nonSoldPlayers.filter(p => ["unsold", "unsold_final"].includes(p.status));
        if (activeTab === "never_drawn") return nonSoldPlayers.filter(p => ["upcoming", "upcoming_phase2"].includes(p.status));
        return nonSoldPlayers;
    }, [nonSoldPlayers, activeTab]);

    const allTeamsSatisfied = useMemo(() => {
        if (!auction || !auction.settings || teams.length === 0) return false;
        const min = auction.settings.min_players ?? 0;
        const max = auction.settings.max_players ?? 0;
        return teams.every(t => (max - t.slots_remaining) >= min);
    }, [auction, teams]);

    const handleAssign = async (playerId: string, teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        if (!team) return;

        if (team.slots_remaining <= 0) {
            alert("This team is already full!");
            return;
        }

        if (team.purse_remaining < (auction?.settings.base_price || 0)) {
            alert("This team does not have enough purse remaining!");
            return;
        }

        setProcessing(`assign_${playerId}`);
        try {
            const { error } = await supabase.rpc("assign_unsold_player", {
                p_player_id: playerId,
                p_team_id: teamId
            });

            if (error) {
                alert("Assignment failed: " + error.message);
            }
        } finally {
            setProcessing(null);
        }
    };

    const handleFinalize = async () => {
        if (!allTeamsSatisfied) {
            alert("All teams must meet the minimum player requirement before finalizing.");
            return;
        }

        if (!window.confirm("Are you sure you want to permanently finalize this auction? This will take you back to the Admin Home.")) return;

        setProcessing("finalize");
        try {
            const { error } = await supabase.rpc("end_auction", { p_auction_id: auctionId });
            if (error) {
                alert("Finalization failed: " + error.message);
            } else {
                router.push(`/admin/auction/${auctionId}`);
            }
        } finally {
            setProcessing(null);
        }
    };

    if (authLoading || stateLoading) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
                        {authLoading ? "Verifying Credentials..." : "Initializing Verification Hub..."}
                    </p>
                </div>
            </div>
        );
    }

    if (stateError) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6">
                <Card className="max-w-md w-full bg-white dark:bg-slate-900 border-red-500/50 p-8 text-center text-red-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">Sync Error</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{stateError.message}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>Retry Sync</Button>
                </Card>
            </div>
        );
    }

    if (!auction) return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-500 italic">
            Auction not found.
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 text-slate-800 dark:text-slate-50">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* Header */}
                <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
                                onClick={() => router.push(`/admin/auction/${auctionId}`)}
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Auction
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 dark:from-emerald-400 to-teal-500">
                            Slot Filling Phase
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                            Ensure all teams meet the mandatory minimum of {auction.settings.min_players} players.
                            You can optionally fill up to {auction.settings.max_players} players if team purse allows.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {!allTeamsSatisfied && (
                            <div className="flex items-center bg-amber-500/10 text-amber-500 border border-amber-500/20 py-1.5 px-3 rounded-full text-xs font-semibold gap-2">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Minimum Requirements Not Met
                            </div>
                        )}
                        <Button
                            size="lg"
                            className={`font-bold transition-all duration-300 shadow-lg ${allTeamsSatisfied ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
                            disabled={!allTeamsSatisfied || processing === "finalize"}
                            onClick={handleFinalize}
                        >
                            {processing === "finalize" ? "Finalizing..." : allTeamsSatisfied ? "Finalize Auction" : "Satisfy All Min Requirements"}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </header>

                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Teams Status Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Team Roster Progress
                            </h2>
                        </div>

                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            {teams.map((team) => {
                                const count = auction.settings.max_players - team.slots_remaining;
                                const isSatisfied = count >= auction.settings.min_players;

                                return (
                                    <Card key={team.id} className={`p-5 relative overflow-hidden border-slate-200 dark:border-slate-800 transition-all duration-300 ${isSatisfied ? 'bg-emerald-50/10 dark:bg-emerald-950/10 border-emerald-200/20 dark:border-emerald-800/20' : 'bg-white/40 dark:bg-slate-900/40'}`}>
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                                            style={{ width: `${(count / auction.settings.max_players) * 100}%` }}
                                        />

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{team.name}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider">{team.manager}</p>
                                            </div>
                                            {isSatisfied ? (
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                    <UserCheck className="h-4 w-4 text-emerald-500" />
                                                </div>
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                                    <Users className="h-4 w-4 text-amber-500" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                            <div className="space-y-1">
                                                <span className="text-slate-500 dark:text-slate-500 text-xs block">Count</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-xl font-bold ${isSatisfied ? 'text-emerald-400' : 'text-amber-400'}`}>{count}</span>
                                                    <span className="text-slate-600">/ {auction.settings.max_players}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-slate-500 dark:text-slate-500 text-xs block">Remaining Purse</span>
                                                <p className="text-slate-800 dark:text-white font-mono font-medium">{formatPrice(team.purse_remaining)}</p>
                                            </div>
                                        </div>

                                        {!isSatisfied && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-950/20 border border-red-500/20 mb-2">
                                                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                                <span className="text-[10px] text-red-400 uppercase font-bold tracking-tight">Needs {auction.settings.min_players - count} more players</span>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full h-8 text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                                                onClick={() => router.push(`/admin/auction/${auctionId}/teams`)}
                                            >
                                                View Roster
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Unsold Players Section */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500 flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" /> Unsold Pool ({nonSoldPlayers.length})
                                </h2>
                            </div>
                            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                                <button
                                    onClick={() => setActiveTab("all")}
                                    className={`flex-1 py-1.5 rounded-md transition-all ${activeTab === "all" ? "bg-emerald-600/20 text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveTab("unsold")}
                                    className={`flex-1 py-1.5 rounded-md transition-all ${activeTab === "unsold" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                >
                                    Unsold
                                </button>
                                <button
                                    onClick={() => setActiveTab("never_drawn")}
                                    className={`flex-1 py-1.5 rounded-md transition-all ${activeTab === "never_drawn" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                >
                                    Never Drawn
                                </button>
                            </div>
                        </div>

                        <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-2 shadow-2xl overflow-hidden flex flex-col max-h-fit md:max-h-[calc(100vh-400px)]">
                            <div className="overflow-y-auto pr-1 space-y-2 p-2 custom-scrollbar max-h-[600px]">
                                {displayedPlayers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                        <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-600 dark:text-slate-300">No Players Found</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">There are no players matching this category.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {displayedPlayers.slice(0, expandUnsoldList ? displayedPlayers.length : UNSOLD_DISPLAY_LIMIT).map((player) => (
                                            <div key={player.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-all duration-200">
                                                <div className="flex justify-between items-start gap-2 mb-3">
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{player.name}</p>
                                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500">{player.role}</p>
                                                    </div>
                                                    <div className="px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-[9px] uppercase tracking-widest bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 h-5 flex items-center whitespace-nowrap">
                                                        {player.status.replace(/_/g, " ")}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-bold">Quick Match to Team</Label>
                                                    <select
                                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                                        onChange={(e) => {
                                                            if (e.target.value) handleAssign(player.id, e.target.value);
                                                            e.target.value = "";
                                                        }}
                                                        disabled={!!processing}
                                                    >
                                                        <option value="">Choose a team...</option>
                                                        {teams
                                                            .filter(t => t.slots_remaining > 0 && t.purse_remaining >= (auction?.settings.base_price || 0))
                                                            .map(t => (
                                                                <option key={t.id} value={t.id}>
                                                                    {t.name} ({auction.settings.max_players - t.slots_remaining}/{auction.settings.max_players})
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                            {displayedPlayers.length > UNSOLD_DISPLAY_LIMIT && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-xs border-t border-slate-200 dark:border-slate-800"
                                    onClick={() => setExpandUnsoldList(!expandUnsoldList)}
                                >
                                    {expandUnsoldList ? (
                                        <>
                                            ↑ Show Less ({UNSOLD_DISPLAY_LIMIT})
                                        </>
                                    ) : (
                                        <>
                                            ↓ Show More ({displayedPlayers.length - UNSOLD_DISPLAY_LIMIT} more)
                                        </>
                                    )}
                                </Button>
                            )}
                        </Card>

                        <div className="flex items-center gap-2 text-slate-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs italic">
                                Matching a player will deduct {formatPrice(auction.settings.base_price)} from the team purse.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #1e293b;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #334155;
              }
            `}} />
        </div>
    );
}
````

## File: app/admin/login/page.tsx
````typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";

import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is an admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Access denied: Admin role required.");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 text-on-surface">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-2xl shadow-slate-300/40 dark:shadow-black/60">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Admin Login</h1>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Sign in with your admin credentials to access auction control.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-100">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password" title="Password" className="text-slate-700 dark:text-slate-100">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
              required
            />
          </div>
          {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Signing in..." : "Login as Admin"}
          </Button>
        </form>
        <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
          This is a simple hard-coded authentication layer to prevent casual access to admin pages.
        </p>
      </Card>
    </div>
  );
}
````

## File: app/admin/page.tsx
````typescript
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { numberToIndianWords } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";

type Auction = {
  id: string;
  name: string;
  sport_type: string;
  status?: "upcoming" | "live" | "completed";
  settings: {
    purse: number;
    min_players: number;
    max_players: number;
    base_price: number;
    increment?: number;
    captain_base_price?: number;
    tier1_increment?: number;
    tier1_threshold?: number;
    tier2_increment?: number;
    tier2_threshold?: number;
    tier3_increment?: number;
  };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState("");
  const [sportType, setSportType] = useState<"football" | "cricket">("football");
  const [purse, setPurse] = useState("1000");
  const [minPlayers, setMinPlayers] = useState("7");
  const [maxPlayers, setMaxPlayers] = useState("11");
  const [basePrice, setBasePrice] = useState("10");
  const [captainBasePrice, setCaptainBasePrice] = useState("50");
  const [tier1Increment, setTier1Increment] = useState("30");
  const [tier1Threshold, setTier1Threshold] = useState("60");
  const [tier2Increment, setTier2Increment] = useState("50");
  const [tier2Threshold, setTier2Threshold] = useState("100");
  const [tier3Increment, setTier3Increment] = useState("100");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createSectionRef = useRef<HTMLDivElement | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("auctions")
        .select("id, name, sport_type, status, settings");

      if (error) {
        // Fallback for databases where status column has not been added yet
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("auctions")
          .select("id, name, sport_type, settings");
        if (fallbackError) {
          console.error("Error fetching auctions fallback:", fallbackError.message);
          setAuctions([]);
        } else {
          setAuctions((fallbackData ?? []) as Auction[]);
        }
      } else {
        setAuctions((data ?? []) as Auction[]);
      }
    };
    if (!checkingAuth) {
      load();
    }
  }, [checkingAuth]);

  useEffect(() => {
    if (checkingAuth) return;

    const channel = supabase
      .channel("dashboard_auctions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auctions" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Auction;
            setAuctions((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
          } else if (payload.eventType === "INSERT") {
            const newAuction = payload.new as Auction;
            setAuctions((prev) => {
              if (prev.some(a => a.id === newAuction.id)) return prev;
              return [...prev, newAuction];
            });
          } else if (payload.eventType === "DELETE") {
            setAuctions((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkingAuth]);

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const purseVal = Number(purse);
    const minVal = Number(minPlayers);
    const maxVal = Number(maxPlayers);
    const baseVal = Number(basePrice);
    const captBaseVal = Number(captainBasePrice);
    const t1Inc = Number(tier1Increment);
    const t1Thresh = Number(tier1Threshold);
    const t2Inc = Number(tier2Increment);
    const t2Thresh = Number(tier2Threshold);
    const t3Inc = Number(tier3Increment);

    if (!name.trim()) {
      setError("Auction name is required.");
      setCreating(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from("auctions").insert({
        name: name.trim(),
        sport_type: sportType,
        settings: {
          purse: purseVal,
          min_players: minVal,
          max_players: maxVal,
          base_price: baseVal,
          captain_base_price: captBaseVal,
          tier1_increment: t1Inc,
          tier1_threshold: t1Thresh,
          tier2_increment: t2Inc,
          tier2_threshold: t2Thresh,
          tier3_increment: t3Inc,
        },
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        setName("");
        // Reuse the same loading logic (with status fallback) after create
        const { data, error } = await supabase
          .from("auctions")
          .select("id, name, sport_type, status, settings");
        if (error) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("auctions")
            .select("id, name, sport_type, settings");
          if (!fallbackError) {
            setAuctions((fallbackData ?? []) as Auction[]);
          }
        } else {
          setAuctions((data ?? []) as Auction[]);
        }
      }
    } finally {
      setCreating(false);
    }
  };

  const formattedAuctions = useMemo(
    () =>
      auctions.map((a) => ({
        ...a,
        sportLabel: a.sport_type.toUpperCase(),
        statusEffective: a.status ?? "upcoming",
        statusLabel:
          (a.status ?? "upcoming") === "live"
            ? "Live"
            : (a.status ?? "upcoming") === "completed"
              ? "Completed"
              : "Upcoming",
      })),
    [auctions],
  );

  if (checkingAuth) {
    return <div className="p-6 text-slate-700 dark:text-slate-50">Checking admin access...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 sm:px-6 py-8 sm:py-10 text-slate-800 dark:text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin · Auctions</h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Select an auction to open the live controller.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setShowCreateForm((prev) => !prev);
                if (!showCreateForm) {
                  createSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {showCreateForm ? "Close Form" : "Create Auction"}
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Landing
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          {showCreateForm && (
            <Card
              ref={createSectionRef}
              className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 shadow-xl shadow-slate-300/40 dark:shadow-black/60"
            >
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Create Auction
              </h2>
              <form className="grid gap-3 text-sm md:grid-cols-2" onSubmit={handleCreateAuction}>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="auction-name" className="text-slate-700 dark:text-slate-100">
                    Name
                  </Label>
                  <Input
                    id="auction-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50"
                    placeholder="Summer League Auction"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sport" className="text-slate-700 dark:text-slate-100">
                    Sport
                  </Label>
                  <select
                    id="sport"
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value as "football" | "cricket")}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 px-3 py-2 text-sm text-slate-800 dark:text-slate-50 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="football">Football</option>
                    <option value="cricket">Cricket</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="purse" className="text-slate-700 dark:text-slate-100">
                    Purse per Team
                  </Label>
                  <Input
                    id="purse"
                    type="number"
                    value={purse}
                    onChange={(e) => setPurse(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50"
                  />
                  {Number(purse) > 0 && <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mt-0.5">₹{numberToIndianWords(Number(purse))}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="minPlayers" className="text-slate-100">
                    Min Players / Team
                  </Label>
                  <Input
                    id="minPlayers"
                    type="number"
                    value={minPlayers}
                    onChange={(e) => setMinPlayers(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maxPlayers" className="text-slate-100">
                    Max Players / Team
                  </Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="basePrice" className="text-slate-700 dark:text-slate-100">
                    Base Price
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50"
                  />
                  {Number(basePrice) > 0 && <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mt-0.5">₹{numberToIndianWords(Number(basePrice))}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="captBasePrice" className="text-slate-700 dark:text-slate-100">
                    Captain Base Price
                  </Label>
                  <Input
                    id="captBasePrice"
                    type="number"
                    value={captainBasePrice}
                    onChange={(e) => setCaptainBasePrice(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50"
                  />
                  {Number(captainBasePrice) > 0 && <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mt-0.5">₹{numberToIndianWords(Number(captainBasePrice))}</p>}
                </div>
                {/* Dynamic Bid Increment Tiers */}
                <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-800 pt-3 mt-1">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-3">Dynamic Bid Increment Tiers</h3>
                  <div className="flex flex-col gap-3">
                    {/* Row 1 */}
                    <div className="flex flex-wrap sm:flex-nowrap items-start gap-x-4 gap-y-2 text-sm bg-slate-100/60 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-start gap-3 font-medium min-w-[200px]">
                        <div className="flex flex-col items-end w-16">
                           <span className="text-slate-400 text-right mt-1.5">₹{basePrice || '0'}</span>
                           {Number(basePrice) > 0 && <span className="text-[9px] text-slate-400 italic text-right leading-tight break-words">{numberToIndianWords(Number(basePrice))}</span>}
                        </div>
                        <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest mt-1.5">→</span>
                        <div className="flex flex-col w-24">
                           <Input id="tier1Thresh" type="number" value={tier1Threshold} onChange={(e) => setTier1Threshold(e.target.value)} className="w-full bg-white dark:bg-slate-950 font-semibold h-8" placeholder="60" />
                           {Number(tier1Threshold) > 0 && <span className="text-[9px] text-blue-500 dark:text-blue-400 italic mt-1 leading-tight break-words">{numberToIndianWords(Number(tier1Threshold))}</span>}
                        </div>
                      </div>
                      <div className="flex items-start gap-3 flex-1 mt-1 sm:mt-0">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1.5">: Increment =</span>
                        <div className="flex flex-col w-24">
                           <Input id="tier1Inc" type="number" value={tier1Increment} onChange={(e) => setTier1Increment(e.target.value)} className="w-full bg-white dark:bg-slate-950 font-semibold text-blue-600 dark:text-blue-400 h-8" placeholder="30" />
                           {Number(tier1Increment) > 0 && <span className="text-[9px] text-blue-500 dark:text-blue-400 italic mt-1 leading-tight break-words">{numberToIndianWords(Number(tier1Increment))}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-wrap sm:flex-nowrap items-start gap-x-4 gap-y-2 text-sm bg-slate-100/60 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-start gap-3 font-medium min-w-[200px]">
                        <div className="flex flex-col items-end w-16">
                           <span className="text-slate-400 text-right mt-1.5">₹{tier1Threshold || '0'}</span>
                           {Number(tier1Threshold) > 0 && <span className="text-[9px] text-slate-400 italic text-right leading-tight break-words">{numberToIndianWords(Number(tier1Threshold))}</span>}
                        </div>
                        <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest mt-1.5">→</span>
                        <div className="flex flex-col w-24">
                           <Input id="tier2Thresh" type="number" value={tier2Threshold} onChange={(e) => setTier2Threshold(e.target.value)} className="w-full bg-white dark:bg-slate-950 font-semibold h-8" placeholder="100" />
                           {Number(tier2Threshold) > 0 && <span className="text-[9px] text-blue-500 dark:text-blue-400 italic mt-1 leading-tight break-words">{numberToIndianWords(Number(tier2Threshold))}</span>}
                        </div>
                      </div>
                      <div className="flex items-start gap-3 flex-1 mt-1 sm:mt-0">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1.5">: Increment =</span>
                        <div className="flex flex-col w-24">
                           <Input id="tier2Inc" type="number" value={tier2Increment} onChange={(e) => setTier2Increment(e.target.value)} className="w-full bg-white dark:bg-slate-950 font-semibold text-blue-600 dark:text-blue-400 h-8" placeholder="50" />
                           {Number(tier2Increment) > 0 && <span className="text-[9px] text-blue-500 dark:text-blue-400 italic mt-1 leading-tight break-words">{numberToIndianWords(Number(tier2Increment))}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="flex flex-wrap sm:flex-nowrap items-start gap-x-4 gap-y-2 text-sm bg-slate-100/60 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-start gap-3 font-medium min-w-[200px]">
                        <div className="flex flex-col items-end w-16">
                           <span className="text-slate-400 text-right mt-1.5">₹{tier2Threshold || '0'}</span>
                           {Number(tier2Threshold) > 0 && <span className="text-[9px] text-slate-400 italic text-right leading-tight break-words">{numberToIndianWords(Number(tier2Threshold))}</span>}
                        </div>
                        <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest mt-1.5 w-24 text-center ml-3">+</span>
                      </div>
                      <div className="flex items-start gap-3 flex-1 mt-1 sm:mt-0">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1.5">: Increment =</span>
                        <div className="flex flex-col w-24">
                           <Input id="tier3Inc" type="number" value={tier3Increment} onChange={(e) => setTier3Increment(e.target.value)} className="w-full bg-white dark:bg-slate-950 font-semibold text-blue-600 dark:text-blue-400 h-8" placeholder="100" />
                           {Number(tier3Increment) > 0 && <span className="text-[9px] text-blue-500 dark:text-blue-400 italic mt-1 leading-tight break-words">{numberToIndianWords(Number(tier3Increment))}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {error && (
                  <p className="md:col-span-2 text-xs text-rose-400">
                    {error}
                  </p>
                )}
                <div className="md:col-span-2">
                  <Button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create Auction"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Card className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 shadow-xl shadow-slate-300/40 dark:shadow-black/60">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Existing Auctions
            </h2>
            {formattedAuctions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No auctions found. Create an auction to get started.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                {formattedAuctions.map((auction) => {
                  const canStart = auction.statusEffective === "upcoming";
                  const canViewLive = auction.statusEffective === "live";
                  return (
                    <div
                      key={auction.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 px-3 py-2"
                    >
                      <div>
                        <div className="font-semibold">{auction.name}</div>
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          <span>{auction.sportLabel}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-500" />
                          <span
                            className={
                              auction.statusEffective === "live"
                                ? "text-emerald-300"
                                : auction.statusEffective === "completed"
                                  ? "text-slate-300"
                                  : "text-amber-300"
                            }
                          >
                            {auction.statusLabel}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {auction.statusEffective === "upcoming" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => router.push(`/admin/auction/${auction.id}/teams`)}
                          >
                            Verify & Teams
                          </Button>
                        )}
                        {auction.statusEffective === "live" && (
                          <Link href={`/admin/auction/${auction.id}/teams`}>
                            <Button size="sm" variant="outline">
                              Verify & Teams
                            </Button>
                          </Link>
                        )}
                        {auction.statusEffective === "live" && (
                          <Link href={`/admin/auction/${auction.id}`}>
                            <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/50">
                              Open Controller
                            </Button>
                          </Link>
                        )}
                        {auction.statusEffective === "completed" && (
                          <Link href={`/admin/auction/${auction.id}`}>
                            <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-500 text-amber-50">
                              View Squads
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={!canViewLive}
                          onClick={() => {
                            if (canViewLive) {
                              router.push(`/live/${auction.id}`);
                            }
                          }}
                        >
                          View Live
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
````

## File: app/auction/[id]/page.tsx
````typescript
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/ImageUploadField";
import { ThemeToggle } from "@/components/ThemeToggle";

type AuctionSettings = {
  purse: number;
  min_players: number;
  max_players: number;
  base_price: number;
  increment: number;
};

type Auction = {
  id: string;
  name: string;
  sport_type: "football" | "cricket";
  is_registration_open: boolean;
  status: "upcoming" | "live" | "completed";
  settings: AuctionSettings;
};

type Player = {
  id: string;
  auction_id: string;
  name: string;
  role: string;
  photo_url?: string;
  status: "upcoming" | "live" | "sold" | "unsold";
  sold_price: number | null;
  sold_team_id: string | null;
};

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: auctionId } = use(params);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lockData = window.localStorage.getItem(`registered_${auctionId}`);
      if (lockData === "true") {
        setHasRegistered(true);
      }
    }
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;
    const load = async () => {
      const [{ data: auctionData, error: auctionError }, { data: playersData }] = await Promise.all([
        supabase.from("auctions").select("*").eq("id", auctionId).single(),
        supabase.from("players").select("*").eq("auction_id", auctionId),
      ]);

      if (auctionError || !auctionData) {
        router.push("/");
        return;
      }

      setAuction(auctionData as Auction);
      setPlayers((playersData ?? []) as Player[]);
    };

    load();
  }, [auctionId, router]);

  useEffect(() => {
    if (!auctionId) return;
    const channel = supabase
      .channel(`public_auction_${auctionId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auctions", filter: `id=eq.${auctionId}` },
        (payload) => {
          if (payload.new) setAuction(payload.new as Auction);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `auction_id=eq.${auctionId}` },
        () => {
          supabase.from("players").select("*").eq("auction_id", auctionId).then(({ data }) => {
            if (data) setPlayers(data as Player[]);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  const roleOptions = useMemo(() => {
    if (!auction) return [];
    if (auction.sport_type === "football") {
      return ["Forward", "Midfielder", "Defender", "Goalkeeper"];
    }
    return ["Batsman", "Bowler", "Allrounder", "Wicketkeeper"];
  }, [auction]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;
    if (!name.trim() || !role || !phoneNumber.trim()) {
      setError("Please fill out all required fields.");
      setSuccess(null);
      return;
    }
    if (!photoFile) {
      setPhotoError("Please upload a player photo.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setPhotoError(null);

    try {
      let ipAddress = null;
      try {
        const ipReq = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipReq.json();
        ipAddress = ipData.ip;
      } catch (err) {
        console.warn("Could not fetch IP", err);
      }

      const playerId = crypto.randomUUID();

      const fileExt = photoFile.name.split('.').pop();
      const fileName = `originals/player_${playerId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("player-photos")
        .upload(fileName, photoFile);

      if (uploadError) {
        setPhotoError(`Photo upload failed: ${uploadError.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("player-photos")
        .getPublicUrl(fileName);

      const photoUrl = urlData?.publicUrl;

      const { error: insertError } = await supabase.from("players").insert({
        id: playerId,
        auction_id: auction.id,
        name: name.trim(),
        role,
        phone_number: phoneNumber.trim(),
        ip_address: ipAddress,
        photo_url: photoUrl,
      });

      if (insertError) {
        if (insertError.code === "23505" || insertError.message.includes("unique")) {
          setError("A registration with this phone number already exists.");
        } else {
          setError(insertError.message);
        }
      } else {
        setSuccess("Registration submitted successfully.");
        setName("");
        setRole("");
        setPhoneNumber("");
        setPhotoFile(null);
        setPhotoPreview(null);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(`registered_${auctionId}`, "true");
        }
        setHasRegistered(true);
        const { data: playersData } = await supabase
          .from("players")
          .select("*")
          .eq("auction_id", auctionId);
        setPlayers((playersData ?? []) as Player[]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!auction) {
    return <div className="p-6 text-on-surface">Loading auction...</div>;
  }

  const upcomingPlayers = players.filter((p) => p.status === "upcoming");

  return (
    <div className="min-h-screen bg-[url('/CourtSide_landing.png')] bg-cover bg-center bg-fixed px-4 sm:px-6 py-8 sm:py-10 relative bg-surface">

      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 pointer-events-none"></div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 sm:gap-6">
        <div className="mb-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="transition-all duration-300 -ml-2 text-on-surface hover:text-on-surface/80"
            onClick={() => router.push("/")}
          >
            ← Back to Home
          </Button>
          <ThemeToggle />
        </div>
        <header className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-wide md:text-4xl text-on-surface" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                {auction.name}
              </h1>
              {auction.status === "live" && (
                <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider animate-pulse bg-brand text-on-surface">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-on-surface opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-on-surface"></span>
                  </span>
                  Live
                </span>
              )}
              {auction.status === "completed" && (
                <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded border-2 bg-on-surface-muted/20 text-on-surface-muted border-on-surface-muted">
                  Concluded
                </span>
              )}
            </div>
            <p className="text-sm mt-2 text-on-surface/80">
              Auction for {auction.sport_type === "football" ? "Football" : "Cricket"} players.
            </p>
          </div>
          {auction.status === "live" && (
            <Button
              onClick={() => router.push(`/live/${auctionId}`)}
              className="animate-bounce transition-all duration-300 hover:shadow-lg hover:scale-105 font-bold uppercase tracking-wide bg-brand text-on-surface"
            >
              Join Live Auction
            </Button>
          )}
        </header>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-[3fr,2fr]">
          <Card className="border-2 p-4 sm:p-5 shadow-2xl backdrop-blur-xl bg-surface-alt/80 dark:bg-surface-alt/80 border-border-ui">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-on-surface-muted">
              Registered Players
            </h2>
            {players.length === 0 ? (
              <p className="text-sm text-on-surface">
                No players have registered for this auction yet.
              </p>
            ) : (
              <div className="max-h-[360px] space-y-2 overflow-y-auto text-sm">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between gap-2 rounded-md border-2 px-3 py-2 backdrop-blur-md transition-all duration-300 border-border-ui bg-surface-alt/60"
                  >
                    <div>
                      <div className="font-medium text-on-surface">{player.name}</div>
                      <div className="text-xs uppercase tracking-wide text-on-surface-muted">
                        {player.role}
                      </div>
                    </div>
                    <div className="text-xs uppercase tracking-wide px-2 py-1 rounded text-on-surface bg-brand/20">
                      {player.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="border-2 p-4 sm:p-5 shadow-2xl backdrop-blur-xl bg-surface-alt/80 dark:bg-surface-alt/80 border-border-ui">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-on-surface-muted">
              Register for this Auction
            </h2>
            {auction.status === "completed" ? (
              <div className="flex flex-col h-40 items-center justify-center rounded-lg border-2 px-4 text-center space-y-3 border-on-surface-muted bg-on-surface-muted/20">
                <div className="text-sm font-medium text-on-surface-muted">This auction has concluded.</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-2 transition-all duration-300 border-on-surface-muted text-on-surface-muted"
                  onClick={() => router.push(`/live/${auctionId}`)}
                >
                  View Final Rosters
                </Button>
              </div>
            ) : hasRegistered ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 px-4 text-center text-sm font-medium border-brand bg-brand/15 text-brand">
                You have already submitted a registration for this auction.
              </div>
            ) : !auction.is_registration_open ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 px-4 text-center text-sm font-medium border-brand bg-brand/15 text-on-surface">
                Registration is currently closed.
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-1">
                  <Label htmlFor="name" className="font-bold text-on-surface">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="border-2 transition-all duration-300 focus:shadow-lg bg-surface-alt/60 border-border-ui text-on-surface"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phoneNumber" className="font-bold text-on-surface">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="border-2 transition-all duration-300 focus:shadow-lg bg-surface-alt/60 border-border-ui text-on-surface"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="role" className="font-bold text-on-surface">Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-md border-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-300 bg-surface-alt/60 border-border-ui text-on-surface"
                  >
                    <option value="" className="bg-surface-alt text-on-surface">Select role</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r} className="bg-surface-alt text-on-surface">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <ImageUploadField
                  label="Player Photo"
                  value={photoFile}
                  onChange={setPhotoFile}
                  preview={photoPreview}
                  onPreviewChange={setPhotoPreview}
                  error={photoError}
                  required
                />
                <div className="text-xs text-on-surface-muted">
                  Upcoming players registered here will enter the{" "}
                  <span className="font-medium text-on-surface">upcoming pool</span> for the auction.
                </div>
                {error && <p className="text-xs text-brand">{error}</p>}
                {success && <p className="text-xs text-brand">{success}</p>}
                <Button type="submit" disabled={submitting} className="w-full font-bold uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:scale-105 bg-brand text-on-surface">
                  {submitting ? "Submitting..." : "Register"}
                </Button>
              </form>
            )}

            {upcomingPlayers.length > 0 && (
              <p className="mt-4 text-xs text-on-surface-muted">
                Currently{" "}
                <span className="font-semibold text-on-surface">
                  {upcomingPlayers.length} upcoming player
                  {upcomingPlayers.length === 1 ? "" : "s"}
                </span>{" "}
                in this auction.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
````

## File: app/globals.css
````css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-oswald);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  /* Semantic Surface Tokens */
  --color-surface: var(--surface);
  --color-surface-alt: var(--surface-alt);
  --color-on-surface: var(--on-surface);
  --color-on-surface-muted: var(--on-surface-muted);
  --color-brand: var(--brand);
  --color-border-ui: var(--border-ui);

  /* Fluid Typography Scale */
  --font-size-xs: clamp(0.65rem, 0.6rem + 0.25vw, 0.75rem);
  --font-size-sm: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --font-size-base: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --font-size-lg: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem);
  --font-size-2xl: clamp(1.75rem, 1.5rem + 1.25vw, 2.5rem);
  --font-size-3xl: clamp(2.5rem, 2rem + 2.5vw, 4rem);

  /* Fluid Spacing Scale */
  --spacing-fluid-sm: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --spacing-fluid-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --spacing-fluid-lg: clamp(1.5rem, 1rem + 2.5vw, 3rem);
  --spacing-fluid-xl: clamp(2.5rem, 2rem + 5vw, 6rem);

  /* Auction Layout Padding */
  --spacing-auction-pad: clamp(0.5rem, 0.4rem + 1vw, 1.5rem);
  --spacing-auction-gap: clamp(0.5rem, 0.4rem + 0.8vw, 1rem);
}

:root {
  --bg-main: #C0D5CC;
  --text-main: #252D33;

  --card-bg: #3D4A57;
  --card-text: #EAEBEC;

  --accent: #E6A850;
  --secondary: #5A6B7F;
  --border: #7A8B9F;
  --radius: 0.625rem;

  /* Semantic Surface Tokens — Light */
  --surface: #ffffff;
  --surface-alt: #f0f3f6;
  --on-surface: #252D33;
  --on-surface-muted: #5A6B7F;
  --brand: #E6A850;
  --border-ui: #7A8B9F;
  --background: oklch(1 0 0);
  --foreground: oklch(0.13 0.028 261.692);
  /* ... existing colors ... */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.13 0.028 261.692);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.13 0.028 261.692);
  --primary: oklch(0.21 0.034 264.665);
  --primary-foreground: oklch(0.985 0.002 247.839);
  --secondary: oklch(0.967 0.003 264.542);
  --secondary-foreground: oklch(0.21 0.034 264.665);
  --muted: oklch(0.967 0.003 264.542);
  --muted-foreground: oklch(0.551 0.027 264.364);
  --accent: oklch(0.967 0.003 264.542);
  --accent-foreground: oklch(0.21 0.034 264.665);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.928 0.006 264.531);
  --input: oklch(0.928 0.006 264.531);
  --ring: oklch(0.707 0.022 261.325);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0.002 247.839);
  --sidebar-foreground: oklch(0.13 0.028 261.692);
  --sidebar-primary: oklch(0.21 0.034 264.665);
  --sidebar-primary-foreground: oklch(0.985 0.002 247.839);
  --sidebar-accent: oklch(0.967 0.003 264.542);
  --sidebar-accent-foreground: oklch(0.21 0.034 264.665);
  --sidebar-border: oklch(0.928 0.006 264.531);
  --sidebar-ring: oklch(0.707 0.022 261.325);
}

/* Compact Mode Denisty */
[data-density="compact"] {
  --spacing-fluid-sm: 0.25rem;
  --spacing-fluid-md: 0.5rem;
  --spacing-fluid-lg: 1rem;
  --spacing-fluid-xl: 2rem;
  --radius: 0.25rem;
  font-size: 0.8125rem;
  /* Base 13px override */
}

.dark {
  /* Semantic Surface Tokens — Dark */
  --surface: #0f172a;
  --surface-alt: #1e293b;
  --on-surface: #EAEBEC;
  --on-surface-muted: #94a3b8;
  --brand: #E6A850;
  --border-ui: #334155;

  --background: oklch(0.13 0.028 261.692);
  --foreground: oklch(0.985 0.002 247.839);
  --card: oklch(0.21 0.034 264.665);
  --card-foreground: oklch(0.985 0.002 247.839);
  --popover: oklch(0.21 0.034 264.665);
  --popover-foreground: oklch(0.985 0.002 247.839);
  --primary: oklch(0.928 0.006 264.531);
  --primary-foreground: oklch(0.21 0.034 264.665);
  --secondary: oklch(0.278 0.033 256.848);
  --secondary-foreground: oklch(0.985 0.002 247.839);
  --muted: oklch(0.278 0.033 256.848);
  --muted-foreground: oklch(0.707 0.022 261.325);
  --accent: oklch(0.278 0.033 256.848);
  --accent-foreground: oklch(0.985 0.002 247.839);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.551 0.027 264.364);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.21 0.034 264.665);
  --sidebar-foreground: oklch(0.985 0.002 247.839);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0.002 247.839);
  --sidebar-accent: oklch(0.278 0.033 256.848);
  --sidebar-accent-foreground: oklch(0.985 0.002 247.839);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.551 0.027 264.364);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE/Edge */
  }

  *::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari, Edge */
  }

  body {
    @apply bg-background text-foreground;
    font-size: var(--font-size-base);
  }

  h1 {
    font-size: var(--font-size-3xl);
    @apply font-bold tracking-tight;
  }

  h2 {
    font-size: var(--font-size-2xl);
    @apply font-semibold tracking-tight;
  }

  h3 {
    font-size: var(--font-size-xl);
    @apply font-semibold;
  }

  h4 {
    font-size: var(--font-size-lg);
    @apply font-medium;
  }
}

@layer utilities {
  .fluid-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--spacing-fluid-md);
  }

  .container-fluid {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--spacing-fluid-md);
    padding-right: var(--spacing-fluid-md);
    max-width: 100vw;
  }

  @media (min-width: 1280px) {
    .container-fluid {
      max-width: 1280px;
    }
  }

  @media (min-width: 2560px) {
    .container-fluid {
      max-width: 2000px;
    }
  }

  .p-fluid {
    padding: var(--spacing-fluid-md);
  }

  .p-fluid-lg {
    padding: var(--spacing-fluid-lg);
  }

  .gap-fluid {
    gap: var(--spacing-fluid-md);
  }
}
````

## File: app/layout.tsx
````typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Oswald } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BidStack",
  description: "Sports Auction Platform of CET MCA 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent FOUC — runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  if (stored === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else if (stored === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
````

## File: app/live/[id]/page.tsx
````typescript
"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Team, Player, useAuctionState } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import TeamRoster from "@/components/team/TeamRoster";
import { ViewSquadsPanel } from "@/components/live/ViewSquadsPanel";
import { RepositoryPanel } from "@/components/live/RepositoryPanel";
import { PlayerRepository } from "@/components/live/PlayerRepository";
import { BiddingPIP } from "@/components/live/BiddingPIP";
import { SaleFeedback } from "@/components/live/SaleFeedback";
import { UnsoldFeedback } from "@/components/live/UnsoldFeedback";
import { Gavel, LayoutDashboard, ArrowLeft, Users, Shield, BookOpen } from "lucide-react";
import AuctionHero from "@/components/live/AuctionHero";
import CaptainCard from "@/components/live/TempCard";
import CaptainDeck from "@/components/live/CaptainDeck";
import BlindBidReveal from "@/components/live/BlindBidReveal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatPriceCompact } from "@/lib/utils";

import {
  getTeamPlayers,
  groupPlayersByRole,
  getCaptain,
  getMVP,
} from "@/lib/shared/playerUtils";

export default function LiveAuctionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: auctionId } = use(params);
  const {
    auction,
    teams,
    players,
    state,
    currentPlayer,
    leadingTeam,
    lastSale,
    loading,
  } = useAuctionState(auctionId);

  // ─── View State ───
  const [viewMode, setViewMode] = useState<"auction" | "squads" | "repository">("auction");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // ─── Feedback Animations ───
  const [showSoldAnimation, setShowSoldAnimation] = useState(false);
  const [lastSoldPlayer, setLastSoldPlayer] = useState<any>(null);
  const [lastSoldTeam, setLastSoldTeam] = useState<any>(null);
  const [lastSoldPrice, setLastSoldPrice] = useState<number | null>(null);
  const [showUnsoldAnimation, setShowUnsoldAnimation] = useState(false);
  const [lastUnsoldPlayer, setLastUnsoldPlayer] = useState<any>(null);
  const soldFeedbackStartTimeRef = useRef<number | null>(null);
  const unsoldFeedbackStartTimeRef = useRef<number | null>(null);

  const currentView = selectedTeam ? "roster" : viewMode === "repository" ? "repository" : "auction";

  const pipPhase =
    state?.phase === "completed_sale" || (showSoldAnimation) ? "sold" :
      state?.phase === "completed_unsold" || (showUnsoldAnimation) ? "unsold" :
        "bidding";

  const pipPlayer =
    showSoldAnimation ? lastSoldPlayer :
      showUnsoldAnimation ? lastUnsoldPlayer :
        lastSale?.player ?? currentPlayer;

  const pipTeam =
    showSoldAnimation ? lastSoldTeam :
      lastSale?.team ?? leadingTeam;

  const pipPrice =
    showSoldAnimation ? lastSoldPrice :
      lastSale?.price ?? state?.current_bid ?? null;

  // Handle sold feedback
  useEffect(() => {
    if (state?.phase === "completed_sale") {
      const soldPlayer = players.find((p) => p.id === state.current_player_id);
      const soldTeam = teams.find((t) => t.id === state.leading_team_id);
      if (soldPlayer && soldTeam) {
        setLastSoldPlayer(soldPlayer);
        setLastSoldTeam(soldTeam);
        setLastSoldPrice(state.current_bid || 0);
        setShowSoldAnimation(true);
        soldFeedbackStartTimeRef.current = Date.now();
      }
    } else if (showSoldAnimation) {
      setShowSoldAnimation(false);
      soldFeedbackStartTimeRef.current = null;
    }
  }, [state?.phase, state?.current_player_id, state?.leading_team_id, state?.current_bid, players, teams]);

  // Handle unsold feedback
  useEffect(() => {
    if (state?.phase === "completed_unsold") {
      const unsoldPlayer = players.find((p) => p.id === state.current_player_id);
      if (unsoldPlayer) {
        setLastUnsoldPlayer(unsoldPlayer);
        setShowUnsoldAnimation(true);
        unsoldFeedbackStartTimeRef.current = Date.now();
      }
    } else if (showUnsoldAnimation) {
      setShowUnsoldAnimation(false);
      unsoldFeedbackStartTimeRef.current = null;
    }
  }, [state?.phase, state?.current_player_id, players]);

  // Redirect to recap on completion or slot filling
  useEffect(() => {
    if (!loading && (auction?.status === "completed" || state?.phase === "slot_filling")) {
      router.replace(`/live/${auctionId}/recap`);
    }
  }, [auction?.status, state?.phase, auctionId, loading, router]);

  if (loading || !auction) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="mt-4 text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest text-xs">
          Initialising Arena...
        </div>
      </div>
    );
  }

  // ─── Handler: go back to auction view ───
  const handleBackToAuction = () => {
    setSelectedTeam(null);
    setViewMode("auction");
  };

  return (
    <div className="h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      {/* ═══ HEADER NAV ═══ */}
      <nav className="relative z-50 border-b border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl py-fluid-sm flex-shrink-0">
        <div className="container-fluid flex items-center justify-between gap-fluid-md min-h-[50px]">
          {/* Left: Back Button (when in squad/repo view) */}
          <div className="flex items-center gap-fluid-md min-w-0 flex-1">
            {(selectedTeam || viewMode !== "auction") && (
              <button
                onClick={handleBackToAuction}
                className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 font-bold text-xs uppercase tracking-widest transition-colors border border-slate-300 dark:border-slate-700 flex-shrink-0"
              >
                <ArrowLeft size={12} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {/* Center: Logo + Auction Title */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
              onClick={handleBackToAuction}
            >
              <div className="h-8 sm:h-10 w-8 sm:w-10 bg-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform flex-shrink-0">
                <Gavel className="text-slate-950" size={16} strokeWidth={3} />
              </div>
              <div className="hidden md:block min-w-0">
                <h1 className="text-base md:text-lg lg:text-xl font-black italic tracking-tighter uppercase text-slate-800 dark:text-white leading-none truncate">
                  {auction.name}
                </h1>
                <div className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] md:tracking-[0.3em] mt-0.5">
                  Live Auction
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 ml-auto flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="relative z-10 flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden w-full gap-[--spacing-auction-gap] p-[--spacing-auction-pad] pb-20 xl:pb-[--spacing-auction-pad]">

        {/* ─── LEFT: Primary Content Area ─── */}
        <div className={`flex flex-col gap-[--spacing-auction-gap] overflow-hidden min-w-0 xl:min-h-0 ${selectedTeam || viewMode !== "auction" ? 'w-full' : 'flex-1'}`}>

          {/* Squad View (TeamRoster) */}
          {selectedTeam ? (
            <div className="flex-1 flex flex-col h-full rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden relative bg-white/40 dark:bg-slate-900/40" data-density="compact">
              <div className="flex-1 flex flex-col h-full min-h-0 p-2 sm:p-4">
                <TeamRoster
                  auction={auction as any}
                  teams={teams}
                  players={players}
                  mode="live"
                />
              </div>
            </div>

          /* Repository View */
          ) : viewMode === "repository" ? (
            <PlayerRepository
              players={players}
              teams={teams}
              onBack={handleBackToAuction}
            />

          /* Squads View (mobile - content rendered separately below) */
          ) : viewMode === "squads" ? null : (
            <div className="flex-1 relative rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-800 overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#10b98111,_transparent_60%)] pointer-events-none" />
              <div className="flex-1 flex flex-col items-center justify-center p-fluid-lg relative z-10 text-center overflow-y-auto">
                <AnimatePresence mode="wait">
                  {state?.phase === "captain_round" ? (
                    <CaptainDeck players={players} teams={teams} />
                  ) : state?.phase === "blind_bid_round" ? (
                    <BlindBidReveal players={players} teams={teams} />
                  ) : currentPlayer && state?.current_bid !== null ? (
                    <div className="h-full w-full flex flex-col min-h-0">
                      <div className="flex-1 p-4 sm:p-6 min-h-0 flex items-center justify-center w-full">
                        <AuctionHero
                          player={currentPlayer}
                          bid={state?.current_bid || auction.settings.base_price}
                          basePrice={auction.settings.base_price}
                          team={leadingTeam}
                        />
                      </div>
                    </div>
                  ) : currentPlayer && state?.current_bid === null ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 dark:text-slate-600 text-center">
                      <div className="h-12 sm:h-16 md:h-20 lg:h-24 w-12 sm:w-16 md:w-20 lg:w-24 bg-slate-200 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3 md:mb-4 lg:mb-6 mx-auto border border-slate-300 dark:border-slate-800 animate-pulse">
                        <Gavel size={24} className="text-amber-500" />
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black italic uppercase tracking-tighter text-amber-500 dark:text-amber-400">
                        Ready for Bidding
                      </h3>
                      <p className="text-[8px] sm:text-xs md:text-sm font-medium mt-1 text-amber-600 dark:text-amber-300">
                        Awaiting admin to start bidding...
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-800 dark:text-slate-600 text-center">
                      <div className="h-12 sm:h-16 md:h-20 lg:h-24 w-12 sm:w-16 md:w-20 lg:w-24 bg-slate-200 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3 md:mb-4 lg:mb-6 mx-auto border border-slate-300 dark:border-slate-800">
                        <Gavel size={24} className="text-slate-400 dark:text-slate-700" />
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black italic uppercase tracking-tighter">
                        Arena Idle
                      </h3>
                      <p className="text-[8px] sm:text-xs md:text-sm font-medium mt-1">
                        Awaiting next player...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Stats Bar */}
              <div className="h-12 sm:h-14 md:h-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 flex items-center justify-around px-2 sm:px-4 md:px-6 lg:px-12 gap-1 flex-shrink-0 overflow-x-auto">
                <div className="text-center flex-shrink-0">
                  <div className="text-[7px] md:text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-tighter md:tracking-widest">Sold</div>
                  <div className="text-sm md:text-lg lg:text-2xl font-black text-slate-800 dark:text-white italic">{players.filter((p) => p.status === "sold").length}</div>
                </div>
                <div className="h-4 sm:h-6 md:h-8 w-[1px] bg-slate-300 dark:bg-slate-800" />
                <div className="text-center flex-shrink-0">
                  <div className="text-[7px] md:text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-tighter md:tracking-widest">Upcoming</div>
                  <div className="text-sm md:text-lg lg:text-2xl font-black text-slate-800 dark:text-white italic">{players.filter((p) => p.status === "upcoming").length}</div>
                </div>
                <div className="h-4 sm:h-6 md:h-8 w-[1px] bg-slate-300 dark:bg-slate-800" />
                <div className="text-center flex-shrink-0">
                  <div className="text-[7px] md:text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-tighter md:tracking-widest">Total</div>
                  <div className="text-sm md:text-lg lg:text-2xl font-black text-emerald-500 italic">
                    {formatPriceCompact(players.reduce((sum, p) => sum + (p.sold_price || 0), 0))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Sidebar (desktop only) ─── */}
        {!selectedTeam && viewMode === "auction" && (
          <div className="hidden xl:flex w-80 2xl:w-96 flex-shrink-0 flex-col h-full gap-4">
            {/* View Squads Panel */}
            <div className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-4 overflow-hidden flex flex-col">
              <ViewSquadsPanel
                auction={auction}
                teams={teams}
                players={players}
                onTeamSelect={(team) => setSelectedTeam(team)}
              />
            </div>

            {/* Repository Panel */}
            <div className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-4 overflow-hidden flex flex-col">
              <RepositoryPanel
                players={players}
                onExpand={() => setViewMode("repository")}
              />
            </div>
          </div>
        )}

        {/* ─── Mobile: Squads Full View ─── */}
        {!selectedTeam && viewMode === "squads" && (
          <div className="xl:hidden flex-1 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-4 overflow-hidden flex flex-col">
            <ViewSquadsPanel
              auction={auction}
              teams={teams}
              players={players}
              onTeamSelect={(team) => setSelectedTeam(team)}
            />
          </div>
        )}
      </main>

      {/* ═══ MOBILE BOTTOM TAB BAR ═══ */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-300 dark:border-slate-800 flex items-center justify-around h-14 px-2">
        <button
          onClick={() => { setViewMode("auction"); setSelectedTeam(null); }}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
            viewMode === "auction" && !selectedTeam
              ? "text-emerald-500"
              : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <Gavel size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-wider">Auction</span>
        </button>
        <button
          onClick={() => { setViewMode("squads"); setSelectedTeam(null); }}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
            viewMode === "squads" || selectedTeam
              ? "text-emerald-500"
              : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <Shield size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-wider">Squads</span>
        </button>
        <button
          onClick={() => { setViewMode("repository"); setSelectedTeam(null); }}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
            viewMode === "repository"
              ? "text-emerald-500"
              : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <BookOpen size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-wider">Players</span>
        </button>
      </div>

      {/* ═══ OVERLAYS ═══ */}
      <AnimatePresence>
        {(selectedTeam || viewMode !== "auction") && (
          <BiddingPIP
            player={pipPlayer}
            leadingTeam={pipTeam}
            currentBid={pipPrice}
            phase={pipPhase}
          />
        )}
      </AnimatePresence>
      <SaleFeedback
        player={lastSoldPlayer}
        team={lastSoldTeam}
        price={lastSoldPrice}
        isVisible={showSoldAnimation}
        currentView={currentView}
      />
      <UnsoldFeedback
        player={lastUnsoldPlayer}
        isVisible={showUnsoldAnimation}
        currentView={currentView}
      />
    </div>
  );
}
````

## File: app/live/[id]/recap/page.tsx
````typescript
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAuctionState } from "@/lib/hooks/useAuctionState";
import { RecapStats } from "@/components/live/RecapStats";
import TeamRoster from "@/components/team/TeamRoster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, BarChart3, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuctionRecapPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: auctionId } = use(params);

    const {
        auction,
        teams,
        players,
        loading,
    } = useAuctionState(auctionId);

    if (loading || !auction) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
                <div className="h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <div className="mt-4 text-amber-600 dark:text-amber-500 font-black uppercase tracking-widest text-xs">
                    Calculating Results...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans">
            {/* Background Decor */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="relative z-50 border-b border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl px-6 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 font-black text-xs uppercase tracking-[0.4em] mb-1">
                            <Trophy size={14} />
                            Auction Concluded
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-800 dark:text-white leading-none">
                            {auction.name} <span className="text-slate-500 ml-4 font-normal">Recap</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            onClick={() => router.push("/")}
                            className="border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 gap-2 rounded-xl"
                        >
                            <ArrowLeft size={16} />
                            Back to Home
                        </Button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-8 overflow-y-auto">
                <Tabs defaultValue="highlights" className="space-y-12">
                    <div className="flex justify-center">
                        <TabsList className="bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 p-1 h-14 rounded-2xl">
                            <TabsTrigger value="highlights" className="rounded-xl h-full px-8 gap-2 text-slate-600 dark:text-slate-400 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                                <BarChart3 size={18} />
                                Highlights
                            </TabsTrigger>
                            <TabsTrigger value="rosters" className="rounded-xl h-full px-8 gap-2 text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950">
                                <Users size={18} />
                                Final Rosters
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="highlights" className="mt-0 focus-visible:ring-0">
                        <RecapStats teams={teams} players={players} sportType={auction.sport_type} />
                    </TabsContent>

                    <TabsContent value="rosters" className="mt-0 focus-visible:ring-0">
                        <TeamRoster auction={auction} teams={teams} players={players} mode="recap" />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
````

## File: app/live/[id]/repository/page.tsx
````typescript
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAuctionState } from "@/lib/hooks/useAuctionState";
import { PlayerRepository } from "@/components/live/PlayerRepository";
import { ArrowLeft } from "lucide-react";

export default function RepositoryPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: auctionId } = use(params);
    const { auction, teams, players, loading } = useAuctionState(auctionId);

    if (loading || !auction) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
                <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <div className="mt-4 text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest text-xs">
                    Loading Repository...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans">
            <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8">
                <PlayerRepository
                    players={players}
                    teams={teams}
                    onBack={() => router.push(`/live/${auctionId}`)}
                />
            </div>
        </div>
    );
}
````

## File: app/page.tsx
````typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

type AuctionSettings = {
  purse: number;
  min_players: number;
  max_players: number;
  base_price: number;
  increment: number;
};

type Auction = {
  id: string;
  name: string;
  sport_type: string;
  status?: "upcoming" | "live" | "completed";
  settings: AuctionSettings;
};

type AuctionState = {
  auction_id: string;
  phase: string;
  current_player_id: string | null;
};

export default function Home() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [states, setStates] = useState<AuctionState[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: auctionsData }, { data: stateData }] = await Promise.all([
        supabase.from("auctions").select("*"),
        supabase.from("auction_state").select("auction_id, phase, current_player_id"),
      ]);

      setAuctions((auctionsData ?? []) as Auction[]);
      setStates((stateData ?? []) as AuctionState[]);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("public_home")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auctions" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Auction;
            setAuctions((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
          } else if (payload.eventType === "INSERT") {
            setAuctions((prev) => [...prev, payload.new as Auction]);
          } else if (payload.eventType === "DELETE") {
            setAuctions((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auction_state" },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            const newState = payload.new as AuctionState;
            setStates((prev) => {
              const other = prev.filter(s => s.auction_id !== newState.auction_id);
              return [...other, newState];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const liveAuctionIds = useMemo(() => {
    return new Set(
      auctions
        .filter((a) => a.status === "live")
        .map((a) => a.id)
    );
  }, [auctions]);

  const hasLiveAuctions = liveAuctionIds.size > 0;

  return (
    <div className="min-h-screen bg-[url('/CourtSide_landing.png')] bg-cover bg-center bg-fixed relative bg-surface">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 pointer-events-none"></div>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-8 lg:px-12 lg:py-12">
        <header className="mb-8 md:mb-12 flex flex-col items-start justify-between gap-4 md:gap-6 md:flex-row md:items-center">
          <div className="max-w-md">
            <h1 className="tracking-tight text-4xl sm:text-5xl font-bold text-on-surface" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              BIDSTACK
            </h1>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg leading-relaxed text-on-surface/80">
              Official Auction platform for MCA Premier League 2026.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <ThemeToggle />
            <Link href="/admin/login">
              <Button variant="outline" size="lg" className="border-2 border-brand text-on-surface hover:bg-brand/10 font-bold uppercase transition-all duration-300">
                Admin Login
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-5">
          <Card className="col-span-1 md:col-span-2 border-2 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-3xl bg-surface-alt/75 dark:bg-surface-alt/75 border-border-ui">
            <div className="border-b-2 px-4 sm:px-6 py-4 sm:py-5 border-border-ui/30">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-on-surface-muted">
                  Live Auctions
                </h2>
                {hasLiveAuctions && (
                  <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider animate-pulse whitespace-nowrap bg-brand text-on-surface">
                    Live now
                  </span>
                )}
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              {auctions.filter((a) => (a.status ?? "upcoming") === "live" && liveAuctionIds.has(a.id))
                .length === 0 ? (
                <p className="text-sm text-center py-8 text-on-surface dark:text-on-surface">
                  No auctions are live right now. Check the upcoming auctions below.
                </p>
              ) : (
                <div className="space-y-3">
                  {auctions
                    .filter((a) => (a.status ?? "upcoming") === "live" && liveAuctionIds.has(a.id))
                    .map((auction) => (
                      <div
                        key={auction.id}
                        className="flex flex-col gap-3 rounded-lg border-2 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:scale-105 border-brand bg-brand/15 shadow-[0_0_20px_rgba(230,168,80,0.2)]"
                      >
                        <div>
                          <div className="text-sm font-semibold text-on-surface">{auction.name}</div>
                          <div className="text-xs uppercase tracking-[0.18em] mt-1 text-brand">
                            {auction.sport_type.toUpperCase()} · Live Auction
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Link href={`/live/${auction.id}`} className="flex-1">
                            <Button size="sm" className="w-full transition-all duration-300 hover:shadow-lg bg-brand text-on-surface font-bold">
                              View Live
                            </Button>
                          </Link>
                          <Link href={`/auction/${auction.id}`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full border-2 transition-all duration-300 hover:shadow-lg border-border-ui text-on-surface">
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="col-span-1 md:col-span-3 border-2 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-3xl bg-surface-alt/75 dark:bg-surface-alt/75 border-border-ui">
            <div className="border-b-2 px-4 sm:px-6 py-4 sm:py-5 border-border-ui/30">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-on-surface-muted">
                  All Auctions
                </h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand/20 text-on-surface-muted">
                  {auctions.length} {auctions.length === 1 ? "auction" : "auctions"}
                </span>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              {auctions.length === 0 ? (
                <p className="text-sm text-center py-8 text-on-surface">
                  No auctions have been created yet. Once an admin creates an auction, it will appear here.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auctions.map((auction) => {
                    const status = auction.status ?? "upcoming";
                    const isLive = status === "live" && liveAuctionIds.has(auction.id);
                    return (
                      <div
                        key={auction.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 backdrop-blur-md transition-all duration-300 border-border-ui bg-surface-alt/50"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-on-surface">{auction.name}</div>
                          <div className="text-xs uppercase tracking-[0.18em] mt-1 text-on-surface-muted">
                            {auction.sport_type.toUpperCase()}
                            <span className={`ml-2 ${status === "live" ? "text-brand" : "text-on-surface-muted"}`}>
                              • {status === "live" ? "LIVE" : status === "completed" ? "COMPLETED" : "UPCOMING"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                          {status === "completed" ? (
                            <Link href={`/live/${auction.id}`} className="flex-1 sm:flex-none">
                              <Button size="sm" className="w-full sm:w-auto transition-all duration-300 hover:shadow-lg bg-brand text-on-surface font-bold">
                                View Squads
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/auction/${auction.id}`} className="flex-1 sm:flex-none">
                              <Button size="sm" variant="outline" className="w-full sm:w-auto border-2 transition-all duration-300 border-border-ui text-on-surface">
                                View &amp; Register
                              </Button>
                            </Link>
                          )}
                          {isLive && (
                            <Link href={`/live/${auction.id}`} className="flex-1 sm:flex-none">
                              <Button size="sm" variant="ghost" className="w-full sm:w-auto transition-all duration-300 text-brand">
                                Watch
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
````

## File: components.json
````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "gray",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
````

## File: components/ImageUploadField.tsx
````typescript
"use client";

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { compressImage, createPreviewUrl, revokePreviewUrl } from "@/lib/imageCompression";

interface ImageUploadFieldProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  preview: string | null;
  onPreviewChange: (preview: string | null) => void;
  required?: boolean;
  accept?: string;
  error?: string | null;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  preview,
  onPreviewChange,
  required = true,
  accept = "image/*",
  error,
}: ImageUploadFieldProps) {
  const [compressing, setCompressing] = useState(false);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        onChange(null);
        onPreviewChange(null);
        return;
      }

      setCompressing(true);
      try {
        // Compress the image
        const compressedBlob = await compressImage(file);
        
        // Create a new File object from the compressed blob
        const compressedFile = new File(
          [compressedBlob],
          file.name,
          { type: file.type }
        );

        onChange(compressedFile);

        // Create preview URL
        const previewUrl = createPreviewUrl(compressedBlob);
        if (preview) {
          revokePreviewUrl(preview);
        }
        onPreviewChange(previewUrl);
      } catch (err) {
        console.error("Compression failed:", err);
        // Fall back to original file if compression fails
        onChange(file);
        const previewUrl = createPreviewUrl(file);
        if (preview) {
          revokePreviewUrl(preview);
        }
        onPreviewChange(previewUrl);
      } finally {
        setCompressing(false);
      }
    },
    [onChange, onPreviewChange, preview]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload" className="text-slate-100">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            id="image-upload"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="bg-slate-950/80 text-slate-50 cursor-pointer"
            disabled={compressing}
            required={required}
          />
          {compressing && (
            <p className="text-xs text-slate-400 mt-1">Compressing image...</p>
          )}
          {value && !compressing && (
            <p className="text-xs text-emerald-400 mt-1">
              ✓ {value.name} ({(value.size / 1024).toFixed(0)} KB)
            </p>
          )}
          {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
        </div>

        {/* Live Preview */}
        {preview && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-emerald-500/50 bg-slate-800 flex-shrink-0 shadow-lg">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
````

## File: components/ImageViewerModal.tsx
````typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title: string;
  subtitle?: string;
}

export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
}: ImageViewerModalProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-100">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex items-center justify-center bg-slate-950 p-6 max-h-[calc(90vh-120px)] overflow-auto">
              {imageUrl && !imageError ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={imageUrl}
                  alt={title}
                  className="max-w-full max-h-full rounded-lg shadow-xl"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-slate-600 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-slate-400">
                    {imageError ? "Image failed to load" : "No image available"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-800/50 border-t border-slate-700 px-6 py-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 hover:bg-slate-700 text-slate-300"
                onClick={onClose}
              >
                Close
              </Button>
              {imageUrl && !imageError && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={() => window.open(imageUrl, "_blank")}
                >
                  Open Full Size
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
````

## File: components/live/AuctionHero.tsx
````typescript
"use client"

import { motion } from "framer-motion"
import { formatPriceCompact } from "@/lib/utils"

export default function AuctionHero({
    player,
    bid,
    basePrice,
    team
}: any) {

    return (
        <div className="relative w-full h-full grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl bg-white dark:bg-[#03070a] shadow-lg border border-slate-200 dark:border-slate-800">

            {/* LEFT SIDE — PLAYER IMAGE */}
            <div className="relative h-full min-h-[200px] md:min-h-0 w-full overflow-hidden">

                <img
                    src={player.photo_url}
                    alt={player.name}
                    className="absolute inset-0 w-full h-full object-contain object-top"
                />

                {/* gradient fade — bottom on mobile, right on desktop */}
                <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-transparent to-white dark:to-[#03070a]" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/40 dark:from-black/40 via-transparent to-transparent hidden md:block" />

            </div>


            {/* RIGHT SIDE */}
            <div className="relative flex flex-col justify-center px-[clamp(1.5rem,1rem+2vw,4rem)] py-[clamp(1rem,0.8rem+1.5vw,2.5rem)] gap-[clamp(0.75rem,0.5rem+1vw,1.5rem)]">

                {/* LIVE AUCTION */}
                <div className="flex items-center gap-2 text-red-400 text-xs tracking-[0.35em] font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    LIVE AUCTION
                </div>


                {/* PLAYER NAME */}
                <h1 className="text-[clamp(2rem,1.5rem+3vw,4.5rem)] font-extrabold italic text-slate-900 dark:text-white leading-[0.9] tracking-tight">
                    {player.name}
                </h1>


                {/* BASE PRICE */}
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 tracking-widest">

                    BASE PRICE

                    <div className="h-[1px] w-16 md:w-24 bg-slate-300 dark:bg-slate-700" />

                    ₹{basePrice.toLocaleString("en-IN")}

                </div>


                {/* BID PANEL */}
                <motion.div
                    key={bid}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="relative mt-2 md:mt-4 w-full max-w-md"
                >

                    {/* glow */}
                    <div className="absolute inset-0 bg-emerald-500 blur-[90px] opacity-40 rounded-xl" />

                    <div className="relative bg-emerald-500 rounded-xl px-[clamp(1.25rem,1rem+1.5vw,2.5rem)] py-[clamp(1rem,0.8rem+1vw,2rem)] shadow-lg">

                        <div className="text-[10px] tracking-[0.35em] font-bold text-black/70 mb-2">
                            CURRENT BID
                        </div>

                        <div className="flex flex-col justify-end mt-1">
                            <div className="text-[clamp(1.75rem,1.5rem+2vw,3rem)] font-black italic text-black tracking-tight leading-none">
                                ₹{bid.toLocaleString("en-IN")}
                            </div>
                            <div className="text-sm font-bold text-black/60 italic tracking-wider mt-1">
                                {formatPriceCompact(bid)}
                            </div>
                        </div>


                        {/* TEAM */}
                        <div className="flex items-center gap-3 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-black/20">

                            <span className="text-[10px] tracking-[0.3em] font-bold text-black/60">
                                HELD BY
                            </span>

                            <div className="flex items-center gap-2">

                                <img
                                    src={team?.logo_url}
                                    className="w-6 h-6 md:w-7 md:h-7 rounded-full"
                                />

                                <span className="font-bold text-black text-sm md:text-base">
                                    {team?.name}
                                </span>

                            </div>

                        </div>

                    </div>

                </motion.div>

            </div>

        </div>
    )
}
````

## File: components/live/BiddingPIP.tsx
````typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player, Team } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import { formatPrice } from "@/lib/utils";
import { Gavel, TrendingUp, Trophy, XCircle } from "lucide-react";

interface BiddingPIPProps {
    player: Player | null;
    leadingTeam: Team | null;
    currentBid: number | null;
    phase?: "bidding" | "sold" | "unsold";
}

export function BiddingPIP({ player, leadingTeam, currentBid, phase = "bidding" }: BiddingPIPProps) {
    if (!player || currentBid === null) return null;

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            drag
            dragMomentum={false}
            dragElastic={0.1}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
            className={`fixed top-28 right-6 md:right-10 z-[100] w-64 h-24 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden transition-colors duration-500 cursor-grab touch-none select-none
                ${phase === "sold" ? "border-emerald-500 shadow-emerald-500/40" :
                    phase === "unsold" ? "border-rose-500 shadow-rose-500/40" :
                        "border-emerald-500/50 shadow-emerald-900/40"}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br to-transparent transition-colors duration-500
                ${phase === "sold" ? "from-emerald-500/20" :
                    phase === "unsold" ? "from-rose-500/20" :
                        "from-emerald-500/10"}`} />

            <div className="relative h-full p-3 flex items-center gap-3">
                <div className="relative">
                    <PlayerAvatar
                        id={player.id}
                        name={player.name}
                        role={player.role}
                        photoUrl={player.photo_url}
                        size="md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white dark:text-slate-950 p-1 rounded-full shadow-lg">
                        <Gavel size={10} strokeWidth={3} />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {phase === "bidding" && (
                        <>
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                                <TrendingUp size={10} />
                                Live Bid
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white truncate italic uppercase tracking-tighter">
                                {player.name}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <div className="text-lg font-black text-emerald-400 font-mono">
                                    {formatPrice(currentBid)}
                                </div>
                            </div>
                        </>
                    )}

                    {phase === "sold" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="sold-pip">
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                                <Trophy size={10} />
                                Sold To {leadingTeam?.name}
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white truncate italic uppercase tracking-tighter">
                                {player.name}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <div className="text-lg font-black text-emerald-400 font-mono">
                                    {formatPrice(currentBid)}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {phase === "unsold" && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key="unsold-pip" className="flex flex-col justify-center h-full">
                            <div className="text-xl font-black text-rose-500 italic uppercase tracking-tighter">
                                UNSOLD
                            </div>
                            <div className="text-[10px] font-black text-rose-400/80 uppercase tracking-widest mt-1 flex items-center gap-1">
                                <XCircle size={10} />
                                No bids
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Leading Team Bar */}
            {phase === "bidding" && (
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-500 flex items-center px-3">
                    <span className="text-[8px] font-black text-white dark:text-slate-950 uppercase tracking-[0.2em] truncate">
                        {leadingTeam ? `Leading: ${leadingTeam.name}` : "Awaiting Bids"}
                    </span>
                </div>
            )}

            {phase === "sold" && (
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-500 flex items-center px-3" />
            )}

            {phase === "unsold" && (
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="absolute bottom-0 left-0 right-0 h-4 bg-rose-500 flex items-center px-3" />
            )}
        </motion.div>
    );
}
````

## File: components/live/BlindBidReveal.tsx
````typescript
"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Team } from "@/lib/hooks/useAuctionState";
import { formatPriceCompact } from "@/lib/utils";

interface BlindBidRevealProps {
  players: Player[];
  teams: Team[];
}

/**
 * BlindBidReveal: Cinematic card flip animation for blind bid player reveals.
 *
 * Animation sequence:
 * 1. Cards start face-down in a grid
 * 2. All cards flip sequentially shortly after mount (reveal who is in the blind pool)
 * 3. When admin matches a player to a team, that card gets a glowing highlight animation
 *
 * Uses CSS perspective + Framer Motion rotateY for the 3D card flip.
 * Only uses transform + opacity for guaranteed 60 FPS GPU rendering.
 */
export default function BlindBidReveal({ players, teams }: BlindBidRevealProps) {
  const blindPlayers = useMemo(
    () =>
      players.filter(
        (p) => p.is_blind_bid === true
      ),
    [players]
  );

  // Sequential auto-flip: reveal all cards one by one shortly after mount
  const [flippedCount, setFlippedCount] = useState(0);

  useEffect(() => {
    if (flippedCount >= blindPlayers.length) return;

    const timer = setTimeout(
      () => setFlippedCount((prev) => prev + 1),
      flippedCount === 0 ? 800 : 400 // Initial delay, then 400ms per card
    );
    return () => clearTimeout(timer);
  }, [flippedCount, blindPlayers.length]);

  return (
    <motion.section
      key="blind-bid-reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-8 sm:mb-12"
      >
        <h2 className="italic tracking-tighter text-blue-500 uppercase mb-3 animate-pulse text-2xl sm:text-3xl md:text-4xl font-black">
          Blind Bid Reveal
        </h2>
        <p className="max-w-md mx-auto text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
          Concealed signings about to be unveiled...
        </p>
      </motion.div>

      {/* Cards Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 w-full max-w-screen-2xl"
        style={{ perspective: "1200px" }}
      >
        {blindPlayers.map((player, index) => {
          const isFlipped = index < flippedCount;
          const assignedTeam = player.sold_team_id
            ? teams.find((t) => t.id === player.sold_team_id)
            : null;
          const isMatched = !!assignedTeam;

          return (
            <FlipCard
              key={player.id}
              player={player}
              team={assignedTeam ?? null}
              isFlipped={isFlipped}
              isMatched={isMatched}
              index={index}
            />
          );
        })}
      </div>
    </motion.section>
  );
}

function FlipCard({
  player,
  team,
  isFlipped,
  isMatched,
  index,
}: {
  player: Player;
  team: Team | null;
  isFlipped: boolean;
  isMatched: boolean;
  index: number;
}) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.04, duration: 0.4 }}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.8,
          type: "spring",
          stiffness: 60,
          damping: 15,
        }}
      >
        {/* Front: Card Back */}
        <div
          className="w-full rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 aspect-[3/4] flex items-center justify-center shadow-xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <motion.div
            className="text-blue-400/50 text-5xl font-black italic"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ?
          </motion.div>
        </div>

        {/* Back: Player Card (rotated 180deg to be readable when flipped) */}
        <div
          className={`absolute inset-0 w-full rounded-2xl overflow-hidden shadow-xl transition-all duration-500 ${
            isMatched
              ? "border-2 border-emerald-400 ring-4 ring-emerald-400/30 shadow-emerald-500/30"
              : "border-2 border-blue-400/60"
          }`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex flex-col h-full bg-card">
            {/* Player photo */}
            <div className="relative flex-1 overflow-hidden bg-slate-200 dark:bg-slate-800">
              <img
                src={player.photo_url || "/placeholder-player.png"}
                alt={player.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Matched Glow Overlay */}
              {isMatched && (
                <motion.div
                  className="absolute inset-0 bg-emerald-500/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 1.5, repeat: 2 }}
                />
              )}
            </div>

            {/* Info */}
            <div className="p-3 text-center bg-card border-t border-border">
              <div className="font-bold text-sm text-foreground truncate">
                {player.name}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                {player.role}
              </div>
              {isMatched && team ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="mt-2 bg-emerald-500/10 border border-emerald-400/30 rounded-md py-1 px-2 inline-block"
                >
                  <span className="text-[10px] font-bold text-emerald-500">
                    {team.name}
                  </span>
                  {player.sold_price && (
                    <span className="text-[10px] font-bold text-amber-500 ml-1.5">
                      {formatPriceCompact(player.sold_price)}
                    </span>
                  )}
                </motion.div>
              ) : (
                <div className="mt-2">
                  <motion.div
                    className="flex justify-center gap-1"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <span className="text-[9px] text-blue-400 font-medium tracking-wider">
                      AWAITING MATCH
                    </span>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
````

## File: components/live/CaptainDeck.tsx
````typescript
"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Team } from "@/lib/hooks/useAuctionState";
import CaptainCard from "@/components/live/TempCard";

interface CaptainDeckProps {
  players: Player[];
  teams: Team[];
}

/**
 * CaptainDeck: Cinematic card stack explosion animation for captain reveal.
 *
 * Animation sequence:
 * 1. All captain cards start stacked in the center (position: absolute overlay)
 * 2. Cards shuffle (slight rotateZ oscillation)
 * 3. One by one, each card "launches" upward (translateY + scale), spotlights for 2s,
 *    then flies to its final grid position
 *
 * Cards that are already matched (sold) skip the shuffle and jump directly to
 * their revealed position with a quick fade-in. This provides resilience to page
 * refreshes mid-animation.
 */
export default function CaptainDeck({ players, teams }: CaptainDeckProps) {
  const captains = useMemo(() => players.filter((p) => p.is_captain), [players]);

  // Track which captains have been "revealed" in the animation sequence
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [shuffleComplete, setShuffle] = useState(false);

  // Count how many are already matched (for resilience on refresh)
  const alreadyMatched = useMemo(
    () => captains.filter((c) => c.status === "sold").length,
    [captains]
  );

  // Start the shuffle after mount
  useEffect(() => {
    const shuffleTimer = setTimeout(() => setShuffle(true), 800);
    return () => clearTimeout(shuffleTimer);
  }, []);

  // After shuffle, reveal captains one by one
  useEffect(() => {
    if (!shuffleComplete) return;

    // Quick-reveal already matched captains
    if (revealedIndex < alreadyMatched - 1) {
      setRevealedIndex(alreadyMatched - 1);
      return;
    }

    if (revealedIndex >= captains.length - 1) return;

    const timer = setTimeout(
      () => setRevealedIndex((prev) => prev + 1),
      revealedIndex < alreadyMatched ? 300 : 2500 // Fast for pre-matched, slow for live reveals
    );
    return () => clearTimeout(timer);
  }, [shuffleComplete, revealedIndex, captains.length, alreadyMatched]);

  return (
    <motion.section
      key="captain-deck"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-8 sm:mb-12"
      >
        <h2 className="italic tracking-tighter text-amber-500 uppercase mb-3 animate-pulse text-2xl sm:text-3xl md:text-4xl font-black">
          Captain Reveal
        </h2>
        <p className="max-w-md mx-auto text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
          Franchises selecting leadership via Blind Bidding...
        </p>
      </motion.div>

      {/* Deck Area */}
      <div className="relative w-full max-w-screen-2xl" style={{ minHeight: "400px" }}>
        {/* Stacked pile (before shuffle) */}
        <AnimatePresence>
          {!shuffleComplete && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {captains.map((captain, i) => (
                <motion.div
                  key={`stack-${captain.id}`}
                  className="absolute w-48 sm:w-56"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    rotateZ: (i - captains.length / 2) * 5,
                    x: (i - captains.length / 2) * 8,
                    y: (i - captains.length / 2) * -3,
                  }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.4,
                    type: "spring",
                    stiffness: 120,
                  }}
                >
                  {/* Card back face */}
                  <div className="rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 aspect-[3/4] flex items-center justify-center shadow-2xl">
                    <div className="text-amber-400/60 text-5xl font-black italic">?</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Revealed cards grid */}
        {shuffleComplete && (
          <div className="flex flex-wrap justify-center place-items-center gap-4 sm:gap-6 w-full max-w-[1400px] mx-auto">
            {captains.map((captain, index) => {
              const matchedTeam = teams.find((t) => t.captain_id === captain.id);
              const isRevealed = index <= revealedIndex;

              return (
                <motion.div
                  key={captain.id}
                  className="flex justify-center shrink-0 w-[140px] sm:w-[180px] lg:w-[220px]"
                  initial={{ opacity: 0, scale: 0.3, y: -100 }}
                  animate={
                    isRevealed
                      ? { opacity: 1, scale: 1, y: 0 }
                      : { opacity: 0.15, scale: 0.85, y: 0 }
                  }
                  transition={{
                    duration: isRevealed ? 0.6 : 0.3,
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                  }}
                >
                  {isRevealed ? (
                    <div className="w-full max-w-xs sm:max-w-sm">
                      <CaptainCard
                        index={index}
                        name={captain.name}
                        role={captain.role}
                        image={captain.photo_url || "/placeholder-player.png"}
                        teamColor="#22c55e"
                        teamName={matchedTeam?.name}
                        price={
                          matchedTeam && captain.sold_price
                            ? Math.round(captain.sold_price / 100000)
                            : undefined
                        }
                        isSold={!!matchedTeam}
                      />
                    </div>
                  ) : (
                    /* Unrevealed card back */
                    <div className="w-full max-w-xs sm:max-w-sm">
                      <div className="rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 aspect-[3/4] flex items-center justify-center shadow-lg">
                        <motion.div
                          className="text-amber-400/40 text-4xl font-black italic"
                          animate={{ rotateZ: [-3, 3, -3] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          ?
                        </motion.div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
}
````

## File: components/live/PlayerRepository.tsx
````typescript
"use client";

import { useState, useMemo } from "react";
import { Player, Team } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

type FilterStatus = "all" | "upcoming" | "sold" | "unsold";

interface PlayerRepositoryProps {
    players: Player[];
    teams: Team[];
    onBack: () => void;
}

export function PlayerRepository({ players, teams, onBack }: PlayerRepositoryProps) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterStatus>("all");

    const filteredPlayers = useMemo(() => {
        return players
            .filter((p) => {
                if (filter === "all") return true;
                if (filter === "sold") return p.status === "sold" || p.sold_team_id !== null;
                if (filter === "unsold") return p.status === "unsold" || p.status === "unsold_final";
                if (filter === "upcoming") return p.status === "upcoming" || p.status === "upcoming_phase2" || p.status === "blind_reserved";
                return p.status === filter;
            })
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [players, filter, search]);

    const filterPills: { label: string; value: FilterStatus }[] = [
        { label: "All", value: "all" },
        { label: "Upcoming", value: "upcoming" },
        { label: "Sold", value: "sold" },
        { label: "Unsold", value: "unsold" },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-white/60 dark:bg-slate-900/40 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden" data-density="compact">
            {/* Header */}
            <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-slate-300 dark:border-slate-800 flex-shrink-0">
                <div className="flex items-center justify-between">
                    {/* <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Auction
                    </button> */}
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">
                        {filteredPlayers.length} Players
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
                    <Input
                        placeholder="Search players..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-slate-100/50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800 text-sm h-9"
                    />
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 overflow-x-auto">
                    {filterPills.map((pill) => (
                        <button
                            key={pill.value}
                            onClick={() => setFilter(pill.value)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${filter === pill.value
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-100/40 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-500 hover:border-slate-400 dark:hover:border-slate-700"
                                }`}
                        >
                            {pill.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Player Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {filteredPlayers.map((player) => {
                        const team = teams.find((t) => t.id === player.sold_team_id);
                        return (
                            <div
                                key={player.id}
                                className="p-2.5 sm:p-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex items-center gap-2.5 sm:gap-3 group hover:border-emerald-500/30 transition-all"
                            >
                                <div className="flex-shrink-0">
                                    <PlayerAvatar
                                        id={player.id}
                                        name={player.name}
                                        role={player.role}
                                        photoUrl={player.photo_url}
                                        size="sm"
                                        isCaptain={player.is_captain}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{player.name}</div>
                                    <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        {player.role}
                                    </div>
                                    {player.status === "sold" && team ? (
                                        <div className="mt-1 flex items-center gap-1 min-w-0">
                                            <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
                                            <div className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase truncate">
                                                {team.name}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`mt-1 text-[8px] font-black uppercase tracking-widest ${player.status === "live" ? "text-amber-600 dark:text-amber-500 animate-pulse" : "text-slate-500 dark:text-slate-600"}`}
                                        >
                                            {player.status}
                                        </div>
                                    )}
                                </div>
                                {player.status === "sold" && (
                                    <div className="text-right flex-shrink-0 text-[9px] sm:text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                        ₹{player.sold_price?.toLocaleString("en-IN")}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {filteredPlayers.length === 0 && (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 italic uppercase font-bold tracking-widest text-sm">
                        No players match your filters.
                    </div>
                )}
            </div>
        </div>
    );
}
````

## File: components/live/RecapStats.tsx
````typescript
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Team, Player } from "@/lib/hooks/useAuctionState";
import { formatPriceCompact, formatPrice } from "@/lib/utils";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import { Trophy, Star, Target, Shield, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RecapStatsProps {
    teams: Team[];
    players: Player[];
    sportType: string;
}

export function RecapStats({ teams, players, sportType }: RecapStatsProps) {
    const soldPlayers = useMemo(() => players.filter(p => p.status === 'sold'), [players]);

    const mvp = useMemo(() => {
        if (soldPlayers.length === 0) return null;
        // Golden Signing excludes captains — only non-captain players qualify
        return [...soldPlayers].filter(p => !p.is_captain).sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0))[0] || null;
    }, [soldPlayers]);

    const roleMvps = useMemo(() => {
        const roles = sportType === "football"
            ? ["Forward", "Midfielder", "Defender", "Goalkeeper"]
            : ["Batsman", "Wicketkeeper", "Allrounder", "Bowler"];

        return roles.map(role => {
            const best = soldPlayers
                .filter(p => p.role === role)
                .sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0))[0];
            return { role, player: best };
        }).filter(item => item.player);
    }, [soldPlayers, sportType]);

    const mostValuableCaptain = useMemo(() => {
        return soldPlayers
            .filter(p => p.is_captain)
            .sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0))[0];
    }, [soldPlayers]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-8"
        >
            {/* Top MVP Highlight */}
            <section className="relative flex flex-col items-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />

                <motion.div variants={item} className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 text-amber-500 font-black text-xs uppercase tracking-[0.5em] mb-4">
                        <Trophy size={18} strokeWidth={3} />
                        Auction MVP
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white italic tracking-tighter uppercase mb-4">The Golden Signing</h2>
                </motion.div>

                {mvp && (
                    <motion.div
                        variants={item}
                        className="relative group cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full group-hover:bg-amber-500/40 transition-all duration-500" />
                        <Card className="relative bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/50 rounded-[30px] shadow-2xl flex flex-col items-center overflow-hidden min-h-[400px] sm:min-h-[450px]">
                            {/* Team Stamp */}
                            {mvp.sold_team_id && (
                                <div className="absolute top-4 right-4 z-20 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-lg">
                                    <TeamLogo
                                        name={teams.find(t => t.id === mvp.sold_team_id)?.name || ""}
                                        logoUrl={teams.find(t => t.id === mvp.sold_team_id)?.logo_url}
                                        size="sm"
                                    />
                                </div>
                            )}

                            {/* Full Height Player Image Background */}
                            <div className="absolute inset-0 pointer-events-none">
                                {mvp.photo_url ? (
                                    <img src={mvp.photo_url} alt={mvp.name} className="w-full h-[85%] object-contain object-bottom opacity-60 sm:opacity-80 mix-blend-luminosity dark:mix-blend-lighten" />
                                ) : (
                                    <div className="w-full h-[85%] flex items-center justify-center font-heading font-black text-slate-300 dark:text-slate-800 text-[10rem] opacity-70">
                                        {mvp.name.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 dark:from-slate-900 dark:via-slate-900/60 to-transparent" />
                            </div>

                            {/* Content overlay */}
                            <div className="relative z-10 w-full flex flex-col items-center p-6 sm:p-8 flex-1 justify-end">
                                <div className="mt-auto flex items-center justify-center gap-2 sm:gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-[80%] mx-auto">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-black text-emerald-600 dark:text-emerald-400 leading-none">
                                            {formatPrice(mvp.sold_price)}
                                        </div>
                                        <div className="text-xs sm:text-sm font-bold text-slate-500 tracking-wider italic">
                                            ({formatPriceCompact(mvp.sold_price)})
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </Card>
                    </motion.div>
                )}
            </section>

            {/* Role MVPs Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {roleMvps.map(({ role, player }) => (
                    <motion.div key={role} variants={item}>
                        <Card className="relative bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[20px] sm:rounded-3xl flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors group h-full overflow-visible min-h-[250px] sm:min-h-[300px] mb-4">
                            {/* Team Stamp */}
                            {player.sold_team_id && (
                                <div className="absolute top-3 right-3 z-30 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-md scale-90 sm:scale-100">
                                    <TeamLogo
                                        name={teams.find(t => t.id === player.sold_team_id)?.name || ""}
                                        logoUrl={teams.find(t => t.id === player.sold_team_id)?.logo_url}
                                        size="sm"
                                    />
                                </div>
                            )}

                            {/* Full Height Player Image Background */}
                            <div className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden">
                                {player.photo_url ? (
                                    <img src={player.photo_url} alt={player.name} className="w-full h-[85%] object-contain object-bottom opacity-15 sm:opacity-85 mix-blend-luminosity dark:mix-blend-lighten" />
                                ) : (
                                    <div className="w-full h-[85%] flex items-center justify-center font-heading font-black text-slate-300 dark:text-slate-800 text-[6rem] opacity-20">
                                        {player.name.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 dark:from-slate-900 dark:via-slate-900/60 to-transparent" />
                            </div>

                            {/* Content overlay */}
                            <div className="relative z-10 w-full flex flex-col items-center p-4 sm:p-6 flex-1 justify-end pb-8">
                                <div className="mt-auto w-full flex flex-col items-center gap-2">
                                    <div className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-white/80 dark:bg-slate-950/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm w-full">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span>{formatPrice(player.sold_price)}</span>
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium italic">
                                                ({formatPriceCompact(player.sold_price)})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bottom Title Pill */}
                            <div className="absolute bottom-0 translate-y-1/2 z-20 text-[8px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest group-hover:scale-110 transition-transform bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-md border border-slate-200 dark:border-slate-700 w-auto whitespace-nowrap">
                                Best {role}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </section>

            {/* Key Stats Bar */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={item} className="h-full">
                    <Card className="h-full bg-emerald-500 text-slate-950 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] flex flex-col justify-center items-center text-center shadow-lg shadow-emerald-900/20">
                        <Users size={24} strokeWidth={2.5} className="mb-2 sm:mb-4" />
                        <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-80">Total Players Sold</div>
                        <div className="text-4xl sm:text-5xl font-black mt-1 leading-none">{soldPlayers.length}</div>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="h-full">
                    <Card className="h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] flex flex-col justify-center items-center text-center border-2">
                        <Target size={24} strokeWidth={2.5} className="mb-2 sm:mb-4 text-emerald-500" />
                        <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Expenditure</div>
                        <div className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white font-mono leading-none">
                            {formatPriceCompact(soldPlayers.reduce((s, p) => s + (p.sold_price || 0), 0))}
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="h-full">
                    <Card className="relative h-full bg-blue-200 border border-blue-200 text-white rounded-[24px] sm:rounded-[32px] flex flex-col items-center text-center shadow-lg shadow-blue-500/80 overflow-visible min-h-[300px] mb-4">
                        {/* Team Stamp */}
                        {mostValuableCaptain?.sold_team_id && (
                            <div className="absolute top-4 right-4 z-30 flex items-center justify-center bg-white/80 dark:bg-blue-900/80 backdrop-blur-md p-1.5 rounded-full border border-white/50 shadow-lg">
                                <TeamLogo
                                    name={teams.find(t => t.id === mostValuableCaptain.sold_team_id)?.name || ""}
                                    logoUrl={teams.find(t => t.id === mostValuableCaptain.sold_team_id)?.logo_url}
                                    size="sm"
                                />
                            </div>
                        )}

                        <div className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden">
                            {mostValuableCaptain?.photo_url ? (
                                <img src={mostValuableCaptain.photo_url} alt={mostValuableCaptain.name} className="w-full h-[85%] object-contain object-bottom opacity-90 mix-blend-luminosity" />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-800/60 via-blue-600/20 to-transparent" />
                        </div>

                        <div className="relative z-10 w-full flex flex-col items-center p-4 sm:p-6 flex-1 justify-end h-full pb-8">
                            {mostValuableCaptain ? (
                                <div className="mt-auto w-full flex flex-col items-center gap-2">
                                    <div className="bg-blue-950/60 backdrop-blur-md border border-white/20 rounded-xl p-2 w-full flex flex-col items-center gap-0.5 shadow-xl">
                                        <span className="text-sm sm:text-base font-bold text-white drop-shadow-sm">{formatPrice(mostValuableCaptain.sold_price)}</span>
                                        <span className="text-[10px] text-blue-100 font-medium italic drop-shadow-sm">({formatPriceCompact(mostValuableCaptain.sold_price)})</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-auto flex flex-col items-center gap-2">
                                    <div className="text-xl sm:text-2xl font-black text-blue-900 uppercase italic tracking-tighter">N/A</div>
                                </div>
                            )}
                        </div>
                        
                        {/* Bottom Title Pill */}
                        <div className="absolute bottom-0 translate-y-1/2 z-20 flex items-center gap-1.5 bg-blue-100 border border-blue-300 shadow-md px-3 py-1 rounded-full whitespace-nowrap">
                            <Star size={12} strokeWidth={2.5} className="text-amber-500 drop-shadow-sm" />
                            <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-900">Top Captain Pick</div>
                        </div>
                    </Card>
                </motion.div>
            </section>
        </motion.div>
    );
}
````

## File: components/live/RepositoryPanel.tsx
````typescript
"use client";

import { Player } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Users, ChevronRight } from "lucide-react";

interface RepositoryPanelProps {
    players: Player[];
    onExpand: () => void;
}

export function RepositoryPanel({ players, onExpand }: RepositoryPanelProps) {
    const upcomingPlayers = players
        .filter((p) => p.status === "upcoming")
        .slice(0, 4);

    const soldCount = players.filter((p) => p.status === "sold").length;
    const upcomingCount = players.filter((p) => p.status === "upcoming").length;

    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-500 font-bold text-xs uppercase tracking-widest px-1">
                <Users size={14} />
                Repository
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-100/60 dark:bg-slate-950/60 rounded-lg p-2 border border-slate-300/50 dark:border-slate-800/50 text-center">
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-500">{soldCount}</div>
                    <div className="text-[9px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest">Sold</div>
                </div>
                <div className="bg-slate-100/60 dark:bg-slate-950/60 rounded-lg p-2 border border-slate-300/50 dark:border-slate-800/50 text-center">
                    <div className="text-lg font-black text-amber-600 dark:text-amber-500">{upcomingCount}</div>
                    <div className="text-[9px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest">Upcoming</div>
                </div>
            </div>

            {/* Expand Button */}
            <button
                onClick={onExpand}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-sky-300 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 hover:border-sky-400 dark:hover:border-sky-500/50 transition-all text-xs font-black uppercase tracking-widest"
            >
                Expand Repository
                <ChevronRight size={12} />
            </button>

            {/* Upcoming Players Preview */}
            {upcomingPlayers.length > 0 && (
                <div className="space-y-1.5 mt-auto">
                    <div className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest px-1">
                        PLayer List
                    </div>
                    {upcomingPlayers.map((player) => (
                        <div
                            key={player.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-300/50 dark:border-slate-800/50 bg-slate-100/30 dark:bg-slate-950/30"
                        >
                            <PlayerAvatar
                                id={player.id}
                                name={player.name}
                                role={player.role}
                                photoUrl={player.photo_url}
                                size="sm"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{player.name}</div>
                                <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {player.role}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
````

## File: components/live/SaleFeedback.tsx
````typescript
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Team } from "@/lib/hooks/useAuctionState";
import { formatPrice, formatPriceCompact } from "@/lib/utils";
import { Gavel } from "lucide-react";

interface SaleFeedbackProps {
    player: Player | null;
    team: Team | null;
    price: number | null;
    isVisible: boolean;
    currentView?: "auction" | "roster" | "repository";
}

export function SaleFeedback({ player, team, price, isVisible, currentView = "auction" }: SaleFeedbackProps) {
    const [isDismissed, setIsDismissed] = useState(false);

    // Reset dismissal when a new player is sold
    useEffect(() => {
        setIsDismissed(false);
    }, [player?.id]);

    if (currentView !== "auction" || isDismissed) return null;
    if (!player || !team || !price) return null;

    // Generate 16 particles
    const particles = Array.from({ length: 16 });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setIsDismissed(true)}
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-4 py-6 md:px-12 md:py-10 sm:px-8 sm:py-8 cursor-pointer overflow-hidden"
                >
                    {/* Overlay with Blur */}
                    <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl" />

                    {/* Radial Green Glow */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[800px] md:h-[800px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"
                    />

                    {/* Particle Burst effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        {particles.map((_, i) => {
                            const angle = (i / particles.length) * Math.PI * 2;
                            const distance = 300 + Math.random() * 200;
                            const x = Math.cos(angle) * distance;
                            const y = Math.sin(angle) * distance;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                                    animate={{ x, y, scale: Math.random() * 1.5 + 0.5, opacity: 0 }}
                                    transition={{ duration: 1 + Math.random(), ease: "easeOut" }}
                                    className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"
                                />
                            );
                        })}
                    </div>

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl w-full max-h-[85vh]">

                        {/* 1. Photo Card Drop */}
                        <motion.div
                            initial={{ scale: 0.3, rotateX: 45, opacity: 0, y: -50 }}
                            animate={{ scale: 1, rotateX: 0, opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                            className="relative w-[180px] sm:w-[256px] aspect-[4/5] rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.4)] bg-slate-100 dark:bg-slate-900 flex-shrink-0"
                        >
                            {/* Pulsing Emerald Shadow Animation over the card */}
                            <motion.div
                                animate={{ boxShadow: ["0 0 20px rgba(16,185,129,0.3)", "0 0 50px rgba(16,185,129,0.7)", "0 0 20px rgba(16,185,129,0.3)"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-2xl pointer-events-none z-20"
                            />

                            {/* Photo */}
                            {player.photo_url ? (
                                <img src={player.photo_url} alt={player.name} className="absolute inset-0 w-full h-full object-contain object-top" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900">
                                    <span className="text-6xl font-heading font-bold text-slate-400 dark:text-slate-700 uppercase">{player.name.charAt(0)}</span>
                                </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />

                            {/* Shimmer Sweep */}
                            <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 0.5 }}
                                className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 w-full"
                            />

                            {/* Badges */}
                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-30">
                                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                    {player.role}
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Player Name */}
                        <motion.h1
                            initial={{ y: 30, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.25 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-6 md:mt-8 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                        >
                            {player.name}
                        </motion.h1>

                        {/* 3. Status Text */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.35 }}
                            className="mt-2"
                        >
                            <motion.div
                                animate={{ textShadow: ["0 0 20px rgba(16,185,129,0.4)", "0 0 60px rgba(16,185,129,0.9)", "0 0 20px rgba(16,185,129,0.4)"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="font-black italic tracking-tighter text-emerald-600 dark:text-white uppercase leading-none"
                                style={{ fontSize: "clamp(4rem, 15vw, 8rem)" }}
                            >
                                SOLD!
                            </motion.div>
                        </motion.div>

                        {/* 4. Team Section + Price Card Wrapper */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.5 }}
                            className="mt-6 md:mt-8 w-full max-w-md mx-auto space-y-4"
                        >
                            {/* Team Name */}
                            <div className="flex flex-col items-center">
                                <div className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs">
                                    New Signing For
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 px-4 text-center">
                                    {team.name}
                                </div>
                            </div>

                            {/* Price Card */}
                            <div className="relative overflow-hidden bg-emerald-500/90 rounded-3xl p-4 sm:p-6 border-2 border-emerald-300/50 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                                {/* Price Card Shimmer */}
                                <motion.div
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay: 1 }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 w-full z-0"
                                />

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="flex items-center gap-1.5 text-slate-900 font-black uppercase tracking-widest text-[9px] sm:text-[10px] opacity-80 mb-1">
                                        <Gavel size={14} />
                                        Final Hammer Price
                                    </div>
                                    <div className="text-4xl sm:text-5xl font-mono font-black text-slate-950 tracking-tight text-center">
                                        {formatPrice(price)}
                                        <div className="text-lg sm:text-xl text-slate-800/80 -mt-1 font-sans italic tracking-wider">
                                            ({formatPriceCompact(price)})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 5. Dismiss Text */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="absolute -bottom-12 sm:-bottom-16 text-slate-800 dark:text-white text-xs sm:text-sm font-medium tracking-widest uppercase italic"
                        >
                            Tap anywhere to dismiss
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
````

## File: components/live/TeamFormation.tsx
````typescript
"use client";

import { useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Player } from "@/lib/hooks/useAuctionState";
import { getRolesForSport, getRoleEmoji } from "@/lib/shared/playerUtils";

// ─── Types ──────────────────────────────────────────────────────────
interface TeamFormationProps {
    groupedPlayers: Record<string, Player[]>;
    captain: Player | null;
    sportType: string;
}

// ─── Animation Variants ─────────────────────────────────────────────
const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.9 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 260, damping: 22, delay: i * 0.06 },
    }),
    exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2 } },
};

// ═══════════════════════════════════════════════════════════════════
// PLAYER CARD — shared rectangular photo card
// ═══════════════════════════════════════════════════════════════════
function PlayerCard({
    player,
    isCaptain,
    accentColor,
    size = "normal",
    sportType,
}: {
    player: Player;
    isCaptain: boolean;
    accentColor: "gold" | "emerald" | "rose";
    size?: "normal" | "featured";
    sportType: string;
}) {
    const borderColor =
        isCaptain
            ? "border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.25)]"
            : accentColor === "rose"
                ? "border-rose-500/40"
                : "border-slate-700/60";

    const sizeClasses =
        size === "featured"
            ? "w-32 sm:w-40 md:w-48 !h-auto aspect-square"
            : "w-20 sm:w-24 md:w-32 !h-auto aspect-square";

    return (
        <div className="flex flex-col items-center group">
            {/* Photo Card */}
            <div
                className={`relative ${sizeClasses} rounded-xl overflow-hidden border-2 ${borderColor} bg-slate-900 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}
            >
                {player.photo_url ? (
                    <img
                        src={player.photo_url}
                        alt={player.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <span className="text-2xl font-heading font-bold text-slate-600 uppercase">
                            {player.name.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Single Line Name overlay */}
                <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2 flex flex-col items-center justify-end">
                    <div
                        className={`font-heading font-bold uppercase tracking-tight truncate w-full text-center ${size === "featured"
                            ? "text-sm sm:text-base md:text-lg"
                            : "text-[10px] sm:text-xs md:text-sm"
                            } ${accentColor === "rose"
                                ? "text-rose-400"
                                : isCaptain
                                    ? "text-amber-400"
                                    : "text-white"
                            }`}
                    >
                        {player.name}
                    </div>
                </div>

                {/* Captain badge */}
                {isCaptain && (
                    <div className="absolute top-1.5 right-1.5 bg-amber-500 text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-amber-200 z-10">
                        C
                    </div>
                )}

                {/* Role emoji badge (cricket mode) */}
                {sportType === "cricket" && (
                    <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-sm w-7 h-7 rounded-lg flex items-center justify-center z-10">
                        {getRoleEmoji(player.role)}
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// FOOTBALL MODE — FIFA FIFPro World XI style
// ═══════════════════════════════════════════════════════════════════
function FootballFormation({
    groupedPlayers,
    captain,
}: {
    groupedPlayers: Record<string, Player[]>;
    captain: Player | null;
}) {
    const roles = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
    let playerIndex = 0;

    return (
        <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden">
            {/* Background — dark pitch */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(160deg, #164726ff 0%, #277039ff 40%, #164726ff 100%)",
                }}
            />

            {/* Field markings — faint gold */}
            <svg className="absolute inset-0 w-full h-full opacity-[1] stroke-amber-500/50 text-amber-200/50" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Center line */}
                <line x1="0" y1="50" x2="100" y2="50" strokeWidth="0.3" />
                {/* Center circle */}
                <circle cx="50" cy="50" r="12" fill="none" strokeWidth="0.3" />
                <circle cx="50" cy="50" r="0.8" fill="currentColor" stroke="none" />
                {/* Penalty arcs top */}
                <rect x="25" y="0" width="50" height="16" fill="none" strokeWidth="0.3" />
                <rect x="35" y="0" width="30" height="6" fill="none" strokeWidth="0.3" />
                {/* Penalty arcs bottom */}
                <rect x="25" y="84" width="50" height="16" fill="none" strokeWidth="0.3" />
                <rect x="35" y="94" width="30" height="6" fill="none" strokeWidth="0.3" />
            </svg>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-500/20 rounded-full animate-pulse"
                        style={{
                            top: `${15 + i * 15}%`,
                            left: `${10 + i * 14}%`,
                            animationDelay: `${i * 0.7}s`,
                            animationDuration: `${2 + i * 0.5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

            {/* Formation grid */}
            <div className="relative z-10 h-full flex flex-col justify-around py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8">
                {roles.map((role) => {
                    const playersInRole = groupedPlayers[role] || [];
                    return (
                        <div key={role} className="flex flex-col items-center gap-2 sm:gap-3">
                            {/* Role label */}
                            <div className="text-[8px] sm:text-[9px] font-heading font-bold text-amber-500/30 uppercase tracking-[0.5em]">
                                {role}
                            </div>
                            {/* Player cards row */}
                            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
                                <AnimatePresence mode="popLayout">
                                    {playersInRole.map((player) => {
                                        const idx = playerIndex++;
                                        return (
                                            <motion.div
                                                key={player.id}
                                                custom={idx}
                                                variants={cardVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                layout
                                            >
                                                <PlayerCard
                                                    player={player}
                                                    isCaptain={captain?.id === player.id}
                                                    accentColor="gold"
                                                    sportType="football"
                                                />
                                            </motion.div>
                                        );
                                    })}
                                    {playersInRole.length === 0 && (
                                        <div className="h-28 sm:h-32 w-20 sm:w-24 rounded-xl border border-dashed border-amber-500/10 flex items-center justify-center">
                                            <span className="text-[8px] text-amber-500/15 font-heading uppercase tracking-wider">
                                                Empty
                                            </span>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom label */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-heading font-bold text-amber-500/25 uppercase tracking-[0.4em] z-10">
                ⚽ Formation XI
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// CRICKET MODE — ICC Team of Tournament style
// ═══════════════════════════════════════════════════════════════════
function CricketFormation({
    groupedPlayers,
    captain,
}: {
    groupedPlayers: Record<string, Player[]>;
    captain: Player | null;
}) {
    const roleOrder = [
        { key: "Wicketkeeper", label: "WICKET-KEEPERS" },
        { key: "Batsman", label: "BATTERS" },
        { key: "Allrounder", label: "ALL-ROUNDERS" },
        { key: "Bowler", label: "BOWLERS" },
    ];

    return (
        <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden">

            {/* Background */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(180deg, #6bc96b 0%, #329143ff 40%, #1b5e20ff 100%)",
                }}
            />

            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >

                <defs>

                    {/* Linear grass gradient */}
                    <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#599c51ff" />
                        <stop offset="40%" stopColor="#4eac50ff" />
                        <stop offset="100%" stopColor="#3ea64f" />
                    </linearGradient>

                    {/* Grass mowing stripes */}
                    <pattern
                        id="grassStripes"
                        patternUnits="userSpaceOnUse"
                        width="20"
                        height="100"
                    >
                        <rect width="20" height="100" fill="transparent" />
                        <rect width="10" height="100" fill="white" opacity="0.08" />
                    </pattern>

                </defs>

                {/* Ground */}
                <rect x="0" y="0" width="200" height="100" fill="url(#grassGradient)" />

                {/* Grass stripes overlay */}
                <rect x="0" y="0" width="200" height="100" fill="url(#grassStripes)" />

                Outer Boundary
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="yellow"
                    strokeOpacity="0.35"
                    strokeWidth="0.4"
                />

                {/* Inner Circle (30 yard) */}
                <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="none"
                    stroke="yellow"
                    strokeOpacity="0.35"
                    strokeWidth="0.35"
                />

                {/* Center Pitch */}
                <rect
                    x="47"
                    y="30"
                    width="6"
                    height="40"
                    rx="1"
                    fill="#c9a66b"
                    opacity="0.95"
                />

                {/* Creases */}
                <line
                    x1="45"
                    y1="35"
                    x2="55"
                    y2="35"
                    stroke="white"
                    strokeOpacity="0.5"
                    strokeWidth="0.35"
                />

                <line
                    x1="45"
                    y1="65"
                    x2="55"
                    y2="65"
                    stroke="white"
                    strokeOpacity="0.5"
                    strokeWidth="0.35"
                />

            </svg>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

            {/* Header */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-heading font-bold text-amber-500/40 uppercase tracking-[0.5em] z-10">
                🏏 Squad XI
            </div>

            {/* Formation */}
            <div className="relative z-10 h-full flex flex-col justify-center gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-10 py-10">

                {roleOrder.map((role) => {
                    const players = groupedPlayers[role.key] || [];

                    if (players.length === 0) return null;

                    return (
                        <div key={role.key} className="flex flex-col items-center">

                            {/* Role Title */}
                            <div className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest mb-2">
                                {role.label}
                            </div>

                            {/* Player Row */}
                            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap">
                                <AnimatePresence mode="popLayout">
                                    {players.map((player, idx) => (
                                        <motion.div
                                            key={player.id}
                                            custom={idx}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            layout
                                        >
                                            <PlayerCard
                                                player={player}
                                                isCaptain={captain?.id === player.id}
                                                accentColor="rose"
                                                sportType="cricket"
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT — delegates to football or cricket mode
// ═══════════════════════════════════════════════════════════════════
export function TeamFormation({ groupedPlayers, captain, sportType }: TeamFormationProps) {
    return sportType === "football" ? (
        <FootballFormation groupedPlayers={groupedPlayers} captain={captain} />
    ) : (
        <CricketFormation groupedPlayers={groupedPlayers} captain={captain} />
    );
}
````

## File: components/live/TeamListCard.tsx
````typescript
"use client";

import { Team, Player, Auction } from "@/lib/hooks/useAuctionState";
import { TeamLogo } from "@/components/TeamLogo";
import { getTeamPlayers } from "@/lib/shared/playerUtils";
import { Users, ChevronRight } from "lucide-react";

interface TeamListCardProps {
    team: Team;
    players: Player[];
    minPlayers: number;
    onClick: () => void;
}

export function TeamListCard({ team, players, minPlayers, onClick }: TeamListCardProps) {
    const teamPlayers = getTeamPlayers(players, team.id);
    const soldCount = teamPlayers.length;
    const requiredPlayers = Math.max(0, minPlayers - soldCount);

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all group text-left"
        >
            <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {team.name}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">
                        <span className="text-emerald-600 dark:text-emerald-500">{soldCount}</span> Sold
                    </div>
                    {requiredPlayers > 0 && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-500 font-black uppercase tracking-wider">
                            {requiredPlayers} Required
                        </div>
                    )}
                </div>
            </div>
            <ChevronRight size={14} className="text-slate-500 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-shrink-0" />
        </button>
    );
}
````

## File: components/live/TempCard.tsx
````typescript
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { formatPriceCompact } from "@/lib/utils";

interface CaptainCardProps {
  name: string;
  role: string;
  image: string;
  teamColor: string;
  index: number;
  teamName?: string;
  price?: number;
  isSold?: boolean;
}

const CaptainCard = ({ name, role, image, teamColor, index, teamName, price, isSold }: CaptainCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.5, rotateY: 90 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
      transition={{
        delay: 1.5 + index * 0.4,
        duration: 0.8,
        type: "spring",
        stiffness: 80,
        damping: 15,
      }}
      whileHover={{
        scale: 1.08,
        y: -16,
        transition: { duration: 0.3 },
      }}
      className="relative group cursor-pointer"
    >
      {/* Glow behind card */}
      <motion.div
        className="absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: `linear-gradient(135deg, ${teamColor}, transparent)` }}
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative bg-card border border-border rounded-2xl overflow-hidden w-full box-glow-primary group-hover:box-glow-accent transition-shadow duration-500">
        {/* Captain badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 2 + index * 0.4, type: "spring", stiffness: 200 }}
          className="absolute top-3 right-3 z-20"
        >
          <div className="bg-accent rounded-full p-2 box-glow-accent">
            <Crown className="w-5 h-5 text-accent-foreground" />
          </div>
        </motion.div>

        {/* Player image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.div
            className="absolute inset-0 z-10"
            style={{
              background: `linear-gradient(to top, hsl(var(--card)) 0%, transparent 50%, ${teamColor}22 100%)`,
            }}
          />
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-contain object-top"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
          {/* Animated border line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: teamColor }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2.2 + index * 0.4, duration: 0.6 }}
          />
        </div>

        {/* Info */}
        <div className="p-5 text-center relative">
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at center bottom, ${teamColor}, transparent 70%)`,
            }}
          />
          <motion.h3
            className="font-display text-lg font-bold tracking-wider text-foreground relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4 + index * 0.4 }}
          >
            {name}
          </motion.h3>
          <motion.p
            className="font-display text-xs tracking-[0.3em] text-muted-foreground mt-1 uppercase relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 + index * 0.4 }}
          >
            {role}
          </motion.p>

          {/* Sold info or decorative dots */}
          {isSold && teamName && price ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 bg-secondary rounded-lg py-1.5 px-3 relative z-10"
            >
              <span className="font-display text-xs" style={{ color: teamColor }}>{teamName}</span>
              <span className="font-display text-xs text-accent ml-2">{formatPriceCompact(price)}</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex justify-center gap-1.5 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8 + index * 0.4 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CaptainCard;
````

## File: components/live/UnsoldFeedback.tsx
````typescript
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/hooks/useAuctionState";
import { XCircle } from "lucide-react";

interface UnsoldFeedbackProps {
    player: Player | null;
    isVisible: boolean;
    currentView?: "auction" | "roster" | "repository";
}

export function UnsoldFeedback({ player, isVisible, currentView = "auction" }: UnsoldFeedbackProps) {
    const [isDismissed, setIsDismissed] = useState(false);

    // Reset dismissal when a new player is unsold
    useEffect(() => {
        setIsDismissed(false);
    }, [player?.id]);

    if (currentView !== "auction" || isDismissed) return null;
    if (!player) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setIsDismissed(true)}
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-4 py-6 md:px-12 md:py-10 sm:px-8 sm:py-8 cursor-pointer overflow-hidden"
                >
                    {/* Overlay with Blur */}
                    <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl" />

                    {/* Radial Red Glow */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[800px] md:h-[800px] bg-rose-500/20 blur-[100px] rounded-full pointer-events-none"
                    />

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl w-full max-h-[85vh]">

                        {/* 1. Photo Card Drop */}
                        <motion.div
                            initial={{ scale: 0.3, rotateX: 45, opacity: 0, y: -50 }}
                            animate={{ scale: 1, rotateX: 0, opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                            className="relative w-[180px] sm:w-[256px] aspect-[4/5] rounded-2xl overflow-hidden border-2 border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.4)] bg-slate-100 dark:bg-slate-900 flex-shrink-0"
                        >
                            {/* Pulsing Rose Shadow Animation over the card */}
                            <motion.div
                                animate={{ boxShadow: ["0 0 20px rgba(244,63,94,0.3)", "0 0 50px rgba(244,63,94,0.7)", "0 0 20px rgba(244,63,94,0.3)"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-2xl pointer-events-none z-20"
                            />

                            {/* Photo */}
                            {player.photo_url ? (
                                <img src={player.photo_url} alt={player.name} className="absolute inset-0 w-full h-full object-contain object-top" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900">
                                    <span className="text-6xl font-heading font-bold text-slate-400 dark:text-slate-700 uppercase">{player.name.charAt(0)}</span>
                                </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />

                            {/* Shimmer Sweep */}
                            <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 0.5 }}
                                className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 w-full"
                            />

                            {/* Badges */}
                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-30">
                                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                    {player.role}
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Player Name */}
                        <motion.h1
                            initial={{ y: 30, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.25 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-rose-950 dark:text-rose-50 uppercase tracking-tighter mt-6 md:mt-8 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                        >
                            {player.name}
                        </motion.h1>

                        {/* 3. Status Text */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.35 }}
                            className="mt-2"
                        >
                            <div 
                                className="font-black italic tracking-tighter text-rose-500 uppercase leading-none drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                                style={{ fontSize: "clamp(3.5rem, 14vw, 8rem)" }}
                            >
                                UNSOLD
                            </div>
                        </motion.div>

                        {/* 4. Result Message Card */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.5 }}
                            className="mt-6 md:mt-8 w-full max-w-sm mx-auto"
                        >
                            <div className="flex flex-col items-center justify-center bg-rose-500/15 rounded-full px-6 py-4 sm:px-8 sm:py-5 border border-rose-500/30 backdrop-blur-sm shadow-[0_0_30px_rgba(244,63,94,0.15)]">
                                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-widest text-xs sm:text-sm">
                                    <XCircle size={16} strokeWidth={2.5} />
                                    No Bids Received
                                </div>
                                <div className="text-rose-200/60 font-medium italic mt-1.5 text-[10px] sm:text-xs">
                                    Returns to auction pool
                                </div>
                            </div>
                        </motion.div>

                        {/* 5. Dismiss Text */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="absolute -bottom-12 sm:-bottom-16 text-slate-800 dark:text-white text-xs sm:text-sm font-medium tracking-widest uppercase italic"
                        >
                            Tap anywhere to dismiss
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
````

## File: components/live/ViewSquadsPanel.tsx
````typescript
"use client";

import { Team, Player, Auction } from "@/lib/hooks/useAuctionState";
import { TeamListCard } from "@/components/live/TeamListCard";
import { Shield } from "lucide-react";

interface ViewSquadsPanelProps {
    auction: Auction;
    teams: Team[];
    players: Player[];
    onTeamSelect: (team: Team) => void;
}

export function ViewSquadsPanel({ auction, teams, players, onTeamSelect }: ViewSquadsPanelProps) {
    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold text-xs uppercase tracking-widest px-1">
                <Shield size={14} />
                Select a Franchise
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {teams.map((team) => (
                    <TeamListCard
                        key={team.id}
                        team={team}
                        players={players}
                        minPlayers={auction.settings.min_players}
                        onClick={() => onTeamSelect(team)}
                    />
                ))}
            </div>
        </div>
    );
}
````

## File: components/PlayerAvatar.tsx
````typescript
"use client";

import { useState } from "react";

interface PlayerAvatarProps {
  id: string;
  name: string;
  role: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  isCaptain?: boolean;
  sportType?: "football" | "cricket";
}

const ROLE_COLORS: Record<string, { border: string; bg: string; badge: string }> = {
  // Football roles
  Forward: { border: "border-red-500/60", bg: "from-red-600 to-red-800", badge: "⚽" },
  Midfielder: { border: "border-blue-500/60", bg: "from-blue-600 to-blue-800", badge: "⚽" },
  Defender: { border: "border-green-500/60", bg: "from-green-600 to-green-800", badge: "🛡️" },
  Goalkeeper: { border: "border-yellow-500/60", bg: "from-yellow-600 to-yellow-800", badge: "🥅" },
  // Cricket roles
  Batsman: { border: "border-orange-500/60", bg: "from-orange-600 to-orange-800", badge: "🏏" },
  Bowler: { border: "border-purple-500/60", bg: "from-purple-600 to-purple-800", badge: "🎯" },
  Allrounder: { border: "border-cyan-500/60", bg: "from-cyan-600 to-cyan-800", badge: "⭐" },
  Wicketkeeper: { border: "border-indigo-500/60", bg: "from-indigo-600 to-indigo-800", badge: "🧤" },
};

const SIZE_CLASSES = {
  sm: { container: "w-10 h-10", text: "text-[10px]", badge: "text-[8px]" },
  md: { container: "w-16 h-16", text: "text-xs", badge: "text-[10px]" },
  lg: { container: "w-24 h-24", text: "text-sm", badge: "text-xs" },
  xl: { container: "w-32 h-32", text: "text-base", badge: "text-sm" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PlayerAvatar({
  id,
  name,
  role,
  photoUrl,
  size = "md",
  showBadge = true,
  isCaptain = false,
  sportType = "football",
}: PlayerAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const roleConfig = ROLE_COLORS[role] || ROLE_COLORS[Object.keys(ROLE_COLORS)[0]];
  const sizeConfig = SIZE_CLASSES[size];
  const initials = getInitials(name);

  return (
    <div className="relative inline-block">
      {/* Captain Star Badge */}
      {isCaptain && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-black font-black rounded-full flex items-center justify-center shadow-lg shadow-amber-900/50 border-2 border-amber-200 z-20"
          style={{
            width: size === "sm" ? "16px" : size === "md" ? "24px" : size === "lg" ? "32px" : "40px",
            height: size === "sm" ? "16px" : size === "md" ? "24px" : size === "lg" ? "32px" : "40px",
            fontSize: size === "sm" ? "10px" : size === "md" ? "12px" : size === "lg" ? "16px" : "18px",
          }}
        >
          C
        </div>
      )}

      {/* Main Avatar */}
      <div
        className={`${sizeConfig.container} rounded-full overflow-hidden border-2 ${roleConfig.border} shadow-lg flex items-center justify-center font-bold text-white relative group bg-gradient-to-br ${roleConfig.bg}`}
      >
        {photoUrl && !imageError ? (
          <>
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-contain object-top"
              onError={() => setImageError(true)}
            />
            {/* Role overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <span className={`${sizeConfig.badge} text-white/0 group-hover:text-white/80 transition-all`}>
                {roleConfig.badge}
              </span>
            </div>
          </>
        ) : (
          <>
            <span className={sizeConfig.text}>{initials}</span>
            {showBadge && (
              <div className="absolute bottom-0 right-0 bg-slate-900/80 rounded-full p-0.5 border border-white/20">
                <span className={`block ${sizeConfig.badge}`}>{roleConfig.badge}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
````

## File: components/team/TeamRoster.tsx
````typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TeamLogo } from "@/components/TeamLogo";
import { Users, PanelRightClose, PanelRightOpen } from "lucide-react";
import { formatPrice, formatPriceCompact } from "@/lib/utils";
import { Player, Team, Auction } from "@/lib/hooks/useAuctionState";
import {
    getTeamPlayers,
    groupPlayersByRole,
    getCaptain,
    getMVP,
    computeTeamStats,
} from "@/lib/shared/playerUtils";
import { TeamFormation } from "@/components/live/TeamFormation";
import { TeamRosterHeader } from "@/components/team/TeamRosterHeader";
import { TeamStarPlayers } from "@/components/team/TeamStarPlayers";

interface TeamRosterProps {
    auction: Auction;
    teams: Team[];
    players: Player[];
    mode: "live" | "recap";
    /** Externally controlled selected team (optional — used by live page sidebar) */
    selectedTeamId?: string | null;
    onTeamSelect?: (teamId: string) => void;
}

export default function TeamRoster({
    auction,
    teams,
    players,
    mode,
    selectedTeamId: externalSelectedTeamId,
    onTeamSelect,
}: TeamRosterProps) {
    const [internalSelectedTeamId, setInternalSelectedTeamId] = useState<string | null>(null);
    const [isSquadPanelOpen, setIsSquadPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"highlights" | "rosters">("highlights");

    // Use external selection if provided, otherwise internal
    const selectedTeamId = externalSelectedTeamId !== undefined ? externalSelectedTeamId : internalSelectedTeamId;
    const setSelectedTeamId = (id: string) => {
        if (onTeamSelect) onTeamSelect(id);
        else setInternalSelectedTeamId(id);
    };

    useEffect(() => {
        if (mode === "live") {
            setIsSquadPanelOpen(window.innerWidth >= 1024);
        } else {
            setIsSquadPanelOpen(true);
        }
    }, [mode]);

    useEffect(() => {
        if (teams.length > 0 && !selectedTeamId) {
            setSelectedTeamId(teams[0].id);
        }
    }, [teams, selectedTeamId]);

    const selectedTeam = teams.find((t) => t.id === selectedTeamId) || null;

    const teamPlayers = useMemo(
        () => (selectedTeamId ? getTeamPlayers(players, selectedTeamId) : []),
        [players, selectedTeamId],
    );

    const groupedPlayers = useMemo(
        () => groupPlayersByRole(teamPlayers, auction.sport_type),
        [teamPlayers, auction.sport_type],
    );

    const captain = useMemo(() => getCaptain(teamPlayers), [teamPlayers]);
    const mvp = useMemo(() => getMVP(teamPlayers), [teamPlayers]);
    const stats = useMemo(
        () =>
            selectedTeam
                ? computeTeamStats(selectedTeam, teamPlayers)
                : { totalSpend: 0, avgPerPlayer: 0, signings: 0 },
        [selectedTeam, teamPlayers],
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Team Selector Pills */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar gap-3 snap-x">
                {teams.map((team) => {
                    const count = getTeamPlayers(players, team.id).length;
                    const isActive = selectedTeamId === team.id;
                    return (
                        <button
                            key={team.id}
                            onClick={() => setSelectedTeamId(team.id)}
                            className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-all border snap-center whitespace-nowrap ${isActive
                                ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20"
                                : "bg-white/60 dark:bg-slate-900/40 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                                }`}
                        >
                            <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
                            <div className="text-left">
                                <div className={`font-bold text-sm ${isActive ? "text-slate-950" : "text-slate-800 dark:text-white"}`}>
                                    {team.name}
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest flex gap-2 mt-0.5 ${isActive ? "text-emerald-950/70" : "text-slate-500"}`}>
                                    <span>{count} players</span>
                                    <span>•</span>
                                    <span className={isActive ? "text-emerald-950 font-mono" : "text-emerald-500 font-mono"}>
                                        {formatPriceCompact(team.purse_remaining)} left
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="w-full">
                <Card className="bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 rounded-3xl min-h-[600px] backdrop-blur-xl overflow-hidden">
                    {selectedTeam ? (
                        <div className="flex flex-col h-full min-h-0">
                            {/* Header with Centered Tabs */}
                            <div className="relative">
                                <TeamRosterHeader
                                    team={selectedTeam}
                                    signings={stats.signings}
                                    totalSpend={stats.totalSpend}
                                    mode={mode}
                                />

                                {/* Absolute Centered Toggle */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center pt-2">
                                    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-1 rounded-full flex items-center pointer-events-auto shadow-2xl">
                                        <button
                                            onClick={() => setActiveTab("highlights")}
                                            className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "highlights"
                                                ? "bg-emerald-500 text-slate-950"
                                                : "text-slate-400 hover:text-slate-200"
                                                }`}
                                        >
                                            Highlights
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("rosters")}
                                            className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "rosters"
                                                ? "bg-emerald-500 text-slate-950"
                                                : "text-slate-400 hover:text-slate-200"
                                                }`}
                                        >
                                            Final Rosters
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {activeTab === "highlights" ? (
                                <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 overflow-hidden min-h-0 justify-center">
                                    {/* Formation Container - Constrained width */}
                                    <div className="w-full lg:max-w-[550px] xl:max-w-[750px] min-h-[250px] lg:min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5">
                                        <div className="flex items-center justify-end p-2 lg:hidden">
                                            <button
                                                onClick={() => setIsSquadPanelOpen(!isSquadPanelOpen)}
                                                className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-widest ${isSquadPanelOpen ? "text-emerald-400" : "text-slate-500"
                                                    }`}
                                            >
                                                {isSquadPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                                                <span>Squad</span>
                                            </button>
                                        </div>
                                        <TeamFormation
                                            groupedPlayers={groupedPlayers}
                                            captain={captain}
                                            sportType={auction.sport_type}
                                        />
                                    </div>

                                    {/* Star Players Side Panel */}
                                    <AnimatePresence mode="wait">
                                        {isSquadPanelOpen && (
                                            <motion.div
                                                initial={mode === "live" ? { width: 0, opacity: 0 } : false}
                                                animate={{ width: "auto", opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                className="lg:w-[520px] xl:w-[560px] flex-shrink-0 overflow-y-auto custom-scrollbar"
                                            >
                                                <div className="w-fluid space-y-4 pt-2">
                                                    <div className="text-[20px] font-black text-slate-500 uppercase tracking-widest px-2">
                                                        Team Star Players
                                                    </div>
                                                    <TeamStarPlayers captain={captain} mvp={mvp} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                        {teamPlayers.map(player => (
                                            <div key={player.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                                                {/* Image – fixed aspect ratio */}
                                                <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                                                    {player.photo_url ? (
                                                        <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover object-top" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-heading font-black text-slate-300 dark:text-slate-700 text-4xl">
                                                            {player.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    {player.is_captain && (
                                                        <div className="absolute top-2 right-2 bg-amber-500 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase shadow">C</div>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="p-2.5 flex flex-col gap-0.5">
                                                    <div className="font-bold text-xs text-slate-800 dark:text-white truncate uppercase tracking-tight font-heading">
                                                        {player.name}
                                                    </div>
                                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        {player.role}
                                                    </div>
                                                    <div className="text-xs font-mono font-bold text-emerald-500 mt-1">
                                                        <div>{formatPrice(player.sold_price)}</div>
                                                        <div className="text-[9px] text-emerald-600/70 dark:text-emerald-500/70 font-medium italic">
                                                            ({formatPriceCompact(player.sold_price)})
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-12">
                            <Users size={48} className="opacity-10 mb-4" />
                            <p className="text-sm italic font-bold uppercase tracking-widest">
                                Select a team to view their final roster
                            </p>
                        </div>
                    )}
                    {/* //: (
//                         <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-12">
//                             <Users size={48} className="opacity-10 mb-4" />
//                             <p className="text-sm italic font-bold uppercase tracking-widest">
//                                 Select a team to view their final roster
//                             </p>
//                         </div>
//                     )} */}
                </Card>
            </div>
        </div>
    );
}
````

## File: components/team/TeamRosterHeader.tsx
````typescript
"use client";

import { motion } from "framer-motion";
import { TeamLogo } from "@/components/TeamLogo";
import { UserCheck, Wallet, TrendingUp } from "lucide-react";
import { formatPrice, formatPriceCompact } from "@/lib/utils";
import { Team } from "@/lib/hooks/useAuctionState";

interface TeamRosterHeaderProps {
    team: Team;
    signings: number;
    totalSpend: number;
    mode: "live" | "recap";
}

export function TeamRosterHeader({ team, signings, totalSpend, mode }: TeamRosterHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-5 sm:p-6 border-b border-slate-300 dark:border-slate-800 gap-4 flex-shrink-0">
            <div className="flex items-center gap-5">
                <motion.div
                    initial={mode === "live" ? { scale: 0.8, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                >
                    <TeamLogo
                        name={team.name}
                        logoUrl={team.logo_url}
                        size="lg"
                    />
                </motion.div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white uppercase tracking-tighter">
                        {team.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-sm tracking-widest uppercase">
                            {team.manager}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <UserCheck size={14} className="text-emerald-600 dark:text-emerald-500" />
                            {signings} Signings
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-100/60 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-300/50 dark:border-slate-800/50 min-w-[130px]">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-1">
                        <Wallet size={12} className="text-emerald-600 dark:text-emerald-500" />
                        Remaining
                    </div>
                    <div className="text-lg sm:text-xl font-mono font-bold text-emerald-400">
                        {formatPrice(team.purse_remaining)}
                    </div>
                    <div className="text-[10px] text-emerald-500/70 font-medium italic">
                        ({formatPriceCompact(team.purse_remaining)})
                    </div>
                </div>
                <div className="bg-slate-100/60 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-300/50 dark:border-slate-800/50 min-w-[130px]">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-1">
                        <TrendingUp size={12} className="text-amber-600 dark:text-amber-500" />
                        Total Spend
                    </div>
                    <div className="text-lg sm:text-xl font-mono font-bold text-amber-400">
                        {formatPrice(totalSpend)}
                    </div>
                    <div className="text-[10px] text-amber-500/70 font-medium italic">
                        ({formatPriceCompact(totalSpend)})
                    </div>
                </div>
            </div>
        </div>
    );
}
````

## File: components/team/TeamStarPlayers.tsx
````typescript
"use client";

import { Player } from "@/lib/hooks/useAuctionState";
import { Crown, Sparkles } from "lucide-react";
import { formatPrice, formatPriceCompact } from "@/lib/utils";

interface TeamStarPlayersProps {
    captain: Player | null;
    mvp: Player | null;
}

export function TeamStarPlayers({ captain, mvp }: TeamStarPlayersProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 pb-5">
            {/* Captain Card */}
            <div className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-100/40 dark:from-amber-950/30 to-slate-50/60 dark:to-slate-900/40 overflow-visible h-[200px]">
                {captain ? (
                    <>
                        {/* Top Title Pill — straddles top edge */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 bg-amber-50 dark:bg-slate-900 border border-amber-400 dark:border-amber-600 px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                            <Crown size={10} fill="currentColor" className="text-amber-500" />
                            <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.25em]">Captain</span>
                        </div>

                        {/* Rectangle photo — clipped inside the div */}
                        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                            {captain.photo_url ? (
                                <img
                                    src={captain.photo_url}
                                    alt={captain.name}
                                    className="w-full h-full object-contain object-center"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-heading font-black text-amber-300/20 dark:text-amber-800/20 text-[6rem]">
                                    {captain.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Bottom Price Pill — straddles bottom edge */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 flex flex-col items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-400/50 dark:border-amber-600/50 px-3 py-1 rounded-xl shadow-lg whitespace-nowrap">
                            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{formatPrice(captain.sold_price)}</span>
                            <span className="text-[8px] text-amber-500/70 font-medium italic leading-tight">({formatPriceCompact(captain.sold_price)})</span>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-600 text-sm italic">
                        No captain assigned
                    </div>
                )}
            </div>

            {/* MVP Card */}
            <div className="relative rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-100/40 dark:from-emerald-950/30 to-slate-50/60 dark:to-slate-900/40 overflow-visible h-[200px]">
                {mvp ? (
                    <>
                        {/* Top Title Pill — straddles top edge */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 bg-emerald-50 dark:bg-slate-900 border border-emerald-400 dark:border-emerald-600 px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                            <Sparkles size={10} fill="currentColor" className="text-emerald-500" />
                            <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em]">Most Valuable</span>
                        </div>

                        {/* Rectangle photo — clipped inside the div */}
                        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                            {mvp.photo_url ? (
                                <img
                                    src={mvp.photo_url}
                                    alt={mvp.name}
                                    className="w-full h-full object-contain object-center"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-heading font-black text-emerald-300/20 dark:text-emerald-800/20 text-[6rem]">
                                    {mvp.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Bottom Price Pill — straddles bottom edge */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 flex flex-col items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-emerald-400/50 dark:border-emerald-600/50 px-3 py-1 rounded-xl shadow-lg whitespace-nowrap">
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(mvp.sold_price)}</span>
                            <span className="text-[8px] text-emerald-500/70 font-medium italic leading-tight">({formatPriceCompact(mvp.sold_price)})</span>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-600 text-sm italic">
                        No non-captain signings
                    </div>
                )}
            </div>
        </div>
    );
}
````

## File: components/TeamLogo.tsx
````typescript
"use client";

import { useState } from "react";

interface TeamLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES = {
  sm: { container: "w-8 h-8", text: "text-[10px]" },
  md: { container: "w-12 h-12", text: "text-xs" },
  lg: { container: "w-20 h-20", text: "text-sm" },
  xl: { container: "w-32 h-32", text: "text-base" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TeamLogo({
  name,
  logoUrl,
  size = "md",
}: TeamLogoProps) {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = SIZE_CLASSES[size];
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeConfig.container} rounded-full overflow-hidden border-2 border-slate-700 shadow-lg flex items-center justify-center font-bold text-white bg-gradient-to-br from-slate-700 to-slate-900`}
    >
      {logoUrl && !imageError ? (
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={sizeConfig.text}>{initials}</span>
      )}
    </div>
  );
}
````

## File: components/ThemeProvider.tsx
````typescript
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read persisted theme or fallback to system preference
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
````

## File: components/ThemeToggle.tsx
````typescript
"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center h-9 w-9 rounded-lg border transition-all
        bg-white/10 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700
        hover:bg-slate-200 dark:hover:bg-slate-700
        text-slate-700 dark:text-slate-300
        shadow-sm backdrop-blur-sm"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={16} strokeWidth={2.5} className="text-amber-400" />
      ) : (
        <Moon size={16} strokeWidth={2.5} className="text-slate-600" />
      )}
    </button>
  );
}
````

## File: components/ui/button.tsx
````typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        compact: "h-7 px-2.5 py-1 text-xs gap-1 has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
````

## File: components/ui/card.tsx
````typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-fluid rounded-xl border bg-card py-fluid text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-fluid-sm px-fluid has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-fluid",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-fluid", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-fluid [.border-t]:pt-fluid", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
````

## File: components/ui/checkbox.tsx
````typescript
"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
````

## File: components/ui/dialog.tsx
````typescript
"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
````

## File: components/ui/input.tsx
````typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
````

## File: components/ui/label.tsx
````typescript
"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
````

## File: components/ui/table.tsx
````typescript
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
````

## File: components/ui/tabs.tsx
````typescript
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            className
        )}
        {...props}
    />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
````

## File: eslint.config.mjs
````javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
````

## File: lib/hooks/useAuctionState.ts
````typescript
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export type AuctionSettings = {
    purse: number;
    min_players: number;
    max_players: number;
    base_price: number;
    increment?: number;
    captain_base_price?: number;
    tier1_increment?: number;
    tier1_threshold?: number;
    tier2_increment?: number;
    tier2_threshold?: number;
    tier3_increment?: number;
};

export type Auction = {
    id: string;
    name: string;
    sport_type: string;
    status: "upcoming" | "live" | "completed";
    settings: AuctionSettings;
};

export type Team = {
    id: string;
    auction_id: string;
    name: string;
    manager: string;
    logo_url: string | null;
    purse_remaining: number;
    slots_remaining: number;
    captain_id: string | null;
};

export type Player = {
    id: string;
    auction_id: string;
    name: string;
    role: string;
    photo_url: string | null;
    is_captain: boolean;
    is_blind_bid: boolean;
    sold_team_id: string | null;
    sold_price: number | null;
    status: "sold" | "live" | "upcoming" | "unsold" | "blind_reserved" | "upcoming_phase2" | "unsold_final"; // DB enum values
};

export type AuctionState = {
    id: string;
    auction_id: string;
    current_player_id: string | null;
    current_bid: number | null;
    leading_team_id: string | null;
    previous_bid: number | null;
    previous_leading_team_id: string | null;
    previous_player_id: string | null;
    phase: string;
    show_undo_notice?: boolean;
};

export function useAuctionState(auctionId: string) {
    const [auction, setAuction] = useState<Auction | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [state, setState] = useState<AuctionState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!auctionId) return;

        const loadInitial = async () => {
            setLoading(true);
            try {
                const [
                    { data: auctionData, error: auctionError },
                    { data: teamsData, error: teamsError },
                    { data: playersData, error: playersError },
                    { data: stateData, error: stateError }
                ] = await Promise.all([
                    supabase.from("auctions").select("*").eq("id", auctionId).single(),
                    supabase.from("teams").select("*").eq("auction_id", auctionId),
                    supabase.from("players").select("*").eq("auction_id", auctionId),
                    supabase.from("auction_state").select("*").eq("auction_id", auctionId).maybeSingle(),
                ]);

                if (auctionError) throw auctionError;
                if (teamsError) throw teamsError;
                if (playersError) throw playersError;
                if (stateError) throw stateError;

                setAuction(auctionData as Auction);
                setTeams((teamsData ?? []) as Team[]);
                setPlayers((playersData ?? []) as Player[]);
                if (stateData) setState(stateData as AuctionState);
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadInitial();

        // Setup Realtime Subscriptions
        const channel = supabase
            .channel(`auction:${auctionId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "auction_state", filter: `auction_id=eq.${auctionId}` },
                (payload) => {
                    if (payload.new) setState(payload.new as AuctionState);
                },
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "teams", filter: `auction_id=eq.${auctionId}` },
                () => {
                    supabase.from("teams").select("*").eq("auction_id", auctionId).then(({ data }) => {
                        if (data) setTeams(data as Team[]);
                    });
                },
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "players", filter: `auction_id=eq.${auctionId}` },
                () => {
                    supabase.from("players").select("*").eq("auction_id", auctionId).then(({ data }) => {
                        if (data) setPlayers(data as Player[]);
                    });
                },
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "auctions", filter: `id=eq.${auctionId}` },
                (payload) => {
                    if (payload.new) setAuction(payload.new as Auction);
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [auctionId]);

    const currentPlayer = useMemo(
        () => players.find((p) => p.id === state?.current_player_id) ?? null,
        [players, state?.current_player_id],
    );

    const leadingTeam = useMemo(
        () => teams.find((t) => t.id === state?.leading_team_id) ?? null,
        [teams, state?.leading_team_id],
    );

    const lastSale = useMemo(() => {
        if (!state) return null;
        if (state.phase === "completed_sale") {
            const player = players.find(p => p.id === state.current_player_id);
            const team = teams.find(t => t.id === state.leading_team_id);
            if (player) {
                return {
                    player,
                    team: team ?? null,
                    price: state.current_bid,
                    result: "sold" as const
                };
            }
        }
        if (state.phase === "completed_unsold") {
            const player = players.find(p => p.id === state.current_player_id);
            if (player) {
                return {
                    player,
                    team: null,
                    price: null,
                    result: "unsold" as const
                };
            }
        }
        return null;
    }, [state?.phase, state?.current_player_id, state?.leading_team_id, state?.current_bid, players, teams]);

    return {
        auction,
        teams,
        players,
        state,
        currentPlayer,
        leadingTeam,
        lastSale,
        loading,
        error,
        setPlayers, // For local optimism if needed
        setTeams,
        setState
    };
}
````

## File: lib/imageCompression.ts
````typescript
/**
 * Image Compression Utility
 * Compresses images to max 800px width with 0.8 quality using Canvas API
 */

interface CompressionOptions {
  maxWidth?: number;
  quality?: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const { maxWidth = 800, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not compress image"));
            }
          },
          file.type || "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Could not load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Could not read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generate a preview URL from a compressed blob
 */
export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Clean up preview URL to prevent memory leaks
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
````

## File: lib/shared/playerUtils.ts
````typescript
import { Player, Team } from "@/lib/hooks/useAuctionState";

// ─── Role Configuration ─────────────────────────────────────────────
export const FOOTBALL_ROLES = ["Forward", "Midfielder", "Defender", "Goalkeeper"] as const;
export const CRICKET_ROLES = ["Batsman", "Wicketkeeper", "Allrounder", "Bowler"] as const;

export function getRolesForSport(sportType: string): string[] {
    return sportType === "football" ? [...FOOTBALL_ROLES] : [...CRICKET_ROLES];
}

const ROLE_EMOJI: Record<string, string> = {
    // Football
    Forward: "⚽",
    Midfielder: "⚽",
    Defender: "🛡️",
    Goalkeeper: "🥅",
    // Cricket
    Batsman: "🏏",
    Bowler: "⚡",
    Allrounder: "🎯",
    Wicketkeeper: "🧤",
};

export function getRoleEmoji(role: string): string {
    return ROLE_EMOJI[role] || "⚽";
}

// ─── Player Grouping ────────────────────────────────────────────────
export function getTeamPlayers(players: Player[], teamId: string): Player[] {
    return players.filter((p) => p.sold_team_id === teamId);
}

export function groupPlayersByRole(
    players: Player[],
    sportType: string,
): Record<string, Player[]> {
    const roles = getRolesForSport(sportType);
    return roles.reduce(
        (acc, role) => {
            acc[role] = players.filter((p) => p.role === role);
            return acc;
        },
        {} as Record<string, Player[]>,
    );
}

// ─── Key Player Detection ───────────────────────────────────────────
export function getCaptain(players: Player[]): Player | null {
    return players.find((p) => p.is_captain) || null;
}

/** Highest-priced non-captain player */
export function getMVP(players: Player[]): Player | null {
    const nonCaptains = players.filter((p) => !p.is_captain);
    if (nonCaptains.length === 0) return null;
    return [...nonCaptains].sort(
        (a, b) => (b.sold_price || 0) - (a.sold_price || 0),
    )[0];
}

/** Highest-priced player overall (captain or not) */
export function getTeamStar(players: Player[]): Player | null {
    if (players.length === 0) return null;
    return [...players].sort(
        (a, b) => (b.sold_price || 0) - (a.sold_price || 0),
    )[0];
}

// ─── Team Stats ─────────────────────────────────────────────────────
export function computeTeamStats(
    team: Team,
    teamPlayers: Player[],
): { totalSpend: number; avgPerPlayer: number; signings: number } {
    const totalSpend = teamPlayers.reduce(
        (sum, p) => sum + (p.sold_price || 0),
        0,
    );
    return {
        totalSpend,
        avgPerPlayer:
            teamPlayers.length > 0 ? Math.round(totalSpend / teamPlayers.length) : 0,
        signings: teamPlayers.length,
    };
}

/** Split a name into first name and last name parts */
export function splitName(name: string): { firstName: string; lastName: string } {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return { firstName: "", lastName: parts[0] || "" };
    return {
        firstName: parts.slice(0, -1).join(" "),
        lastName: parts[parts.length - 1],
    };
}

// ─── Team-level Convenience Utilities ───────────────────────────────
export function groupPlayersByTeam(
    players: Player[],
): Record<string, Player[]> {
    return players.reduce(
        (acc, p) => {
            if (p.sold_team_id) {
                if (!acc[p.sold_team_id]) acc[p.sold_team_id] = [];
                acc[p.sold_team_id].push(p);
            }
            return acc;
        },
        {} as Record<string, Player[]>,
    );
}

export function calculateTeamSpend(players: Player[], teamId: string): number {
    return getTeamPlayers(players, teamId).reduce(
        (sum, p) => sum + (p.sold_price || 0),
        0,
    );
}

export function getTeamCaptain(players: Player[], teamId: string): Player | null {
    return getTeamPlayers(players, teamId).find((p) => p.is_captain) || null;
}

export function getTeamMVP(players: Player[], teamId: string): Player | null {
    const teamPlayers = getTeamPlayers(players, teamId).filter((p) => !p.is_captain);
    if (teamPlayers.length === 0) return null;
    return [...teamPlayers].sort(
        (a, b) => (b.sold_price || 0) - (a.sold_price || 0),
    )[0];
}
````

## File: lib/supabase.ts
````typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
````

## File: lib/utils.ts
````typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPriceCompact(amount: number | null | undefined): string {
  if (amount == null || amount === 0) return "₹0.00";

  // Use absolute value for comparison to handle potential negatives
  const absAmount = Math.abs(amount);

  if (absAmount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (absAmount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (absAmount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)} K`;
  }
  
  return `₹${amount.toFixed(2)}`;
}

// ─── Indian Currency: Number to Words ───

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitWords(n: number): string {
  if (n < 20) return ones[n];
  return (tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')).trim();
}

function threeDigitWords(n: number): string {
  if (n === 0) return '';
  if (n < 100) return twoDigitWords(n);
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigitWords(n % 100) : '');
}

/**
 * Convert a number to Indian currency words.
 * e.g. 2500000 -> "Twenty Five Lakhs"
 *      15000   -> "Fifteen Thousand"
 *      10250000 -> "One Crore Two Lakh Fifty Thousand"
 */
export function numberToIndianWords(num: number | null | undefined): string {
  if (num == null || isNaN(num) || num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToIndianWords(Math.abs(num));

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const helper = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return (tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')).trim();
    if (n < 1000) return (ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + helper(n % 100) : '')).trim();
    return '';
  };

  let remainder = Math.round(num);
  const parts: string[] = [];

  // 1. Crores (Recursive to handle 100, 1000+ Crores)
  if (remainder >= 10000000) {
    const crores = Math.floor(remainder / 10000000);
    parts.push(numberToIndianWords(crores) + (crores === 1 ? ' Crore' : ' Crores'));
    remainder %= 10000000;
  }

  // 2. Lakhs
  if (remainder >= 100000) {
    const lakhs = Math.floor(remainder / 100000);
    parts.push(helper(lakhs) + (lakhs === 1 ? ' Lakh' : ' Lakhs'));
    remainder %= 100000;
  }

  // 3. Thousands
  if (remainder >= 1000) {
    const thousands = Math.floor(remainder / 1000);
    parts.push(helper(thousands) + ' Thousand');
    remainder %= 1000;
  }

  // 4. Remaining Hundreds/Tens/Ones
  if (remainder > 0) {
    parts.push(helper(remainder));
  }

  return parts.join(' ').trim();
}
````

## File: next.config.ts
````typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
````

## File: package.json
````json
{
  "name": "sports-auction",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@supabase/supabase-js": "^2.98.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.35.0",
    "lucide-react": "^0.577.0",
    "next": "16.1.6",
    "radix-ui": "^1.4.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.71.2",
    "tailwind-merge": "^3.5.0",
    "z": "^1.0.9",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "shadcn": "^3.8.5",
    "supabase": "^2.76.17",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5"
  }
}
````

## File: postcss.config.mjs
````javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
````

## File: public/file.svg
````xml
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
````

## File: public/globe.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
````

## File: public/next.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
````

## File: public/site.webmanifest
````
{"name":"","short_name":"","icons":[{"src":"/android-chrome-192x192.png","sizes":"192x192","type":"image/png"},{"src":"/android-chrome-512x512.png","sizes":"512x512","type":"image/png"}],"theme_color":"#ffffff","background_color":"#ffffff","display":"standalone"}
````

## File: public/vercel.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
````

## File: public/window.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
````

## File: README.md
````markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
````

## File: supabase/.gitignore
````
# Supabase
.branches
.temp

# dotenvx
.env.keys
.env.local
.env.*.local
````

## File: supabase/config.toml
````toml
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "sports-auction"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` and `graphql_public` schemas are included by default.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
# Enable HTTPS endpoints locally using a self-signed certificate.
enabled = false
# Paths to self-signed certificate pair.
# cert_path = "../certs/my-cert.pem"
# key_path = "../certs/my-key.pem"

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# Maximum amount of time to wait for health check when starting the local database.
health_timeout = "2m"
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 17

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

# [db.vault]
# secret_key = "env(SECRET_VALUE)"

[db.migrations]
# If disabled, migrations will be skipped during a db push or reset.
enabled = true
# Specifies an ordered list of schema files that describe your database.
# Supports glob patterns relative to supabase directory: "./schemas/*.sql"
schema_paths = []

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory: "./seeds/*.sql"
sql_paths = ["./seed.sql"]

[db.network_restrictions]
# Enable management of network restrictions.
enabled = false
# List of IPv4 CIDR blocks allowed to connect to the database.
# Defaults to allow all IPv4 connections. Set empty array to block all IPs.
allowed_cidrs = ["0.0.0.0/0"]
# List of IPv6 CIDR blocks allowed to connect to the database.
# Defaults to allow all IPv6 connections. Set empty array to block all IPs.
allowed_cidrs_v6 = ["::/0"]

# Uncomment to reject non-secure connections to the database.
# [db.ssl_enforcement]
# enabled = true

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

# Allow connections via S3 compatible clients
[storage.s3_protocol]
enabled = true

# Image transformation API is available to Supabase Pro plan.
# [storage.image_transformation]
# enabled = true

# Store analytical data in S3 for running ETL jobs over Iceberg Catalog
# This feature is only available on the hosted platform.
[storage.analytics]
enabled = false
max_namespaces = 5
max_tables = 10
max_catalogs = 2

# Analytics Buckets is available to Supabase Pro plan.
# [storage.analytics.buckets.my-warehouse]

# Store vector embeddings in S3 for large and durable datasets
# This feature is only available on the hosted platform.
[storage.vector]
enabled = false
max_buckets = 10
max_indexes = 5

# Vector Buckets is available to Supabase Pro plan.
# [storage.vector.buckets.documents-openai]

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# JWT issuer URL. If not set, defaults to the local API URL (http://127.0.0.1:<port>/auth/v1).
# jwt_issuer = ""
# Path to JWT signing key. DO NOT commit your signing keys file to git.
# signing_keys_path = "./signing_keys.json"
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

[auth.rate_limit]
# Number of emails that can be sent per hour. Requires auth.email.smtp to be enabled.
email_sent = 2
# Number of SMS messages that can be sent per hour. Requires auth.sms to be enabled.
sms_sent = 30
# Number of anonymous sign-ins that can be made per hour per IP address. Requires enable_anonymous_sign_ins = true.
anonymous_users = 30
# Number of sessions that can be refreshed in a 5 minute interval per IP address.
token_refresh = 150
# Number of sign up and sign-in requests that can be made in a 5 minute interval per IP address (excludes anonymous users).
sign_in_sign_ups = 30
# Number of OTP / Magic link verifications that can be made in a 5 minute interval per IP address.
token_verifications = 30
# Number of Web3 logins that can be made in a 5 minute interval per IP address.
web3 = 30

# Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
# [auth.captcha]
# enabled = true
# provider = "hcaptcha"
# secret = ""

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# enabled = true
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

# Uncomment to customize notification email template
# [auth.email.notification.password_changed]
# enabled = true
# subject = "Your password has been changed"
# content_path = "./templates/password_changed_notification.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ .Code }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a new user is created and allows developers to reject the request based on the incoming user object.
# [auth.hook.before_user_created]
# enabled = true
# uri = "pg-functions://postgres/auth/before-user-created-hook"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
# [auth.hook.custom_access_token]
# enabled = true
# uri = "pg-functions://<database>/<schema>/<hook_name>"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Multi-factor-authentication is available to Supabase Pro plan.
[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = false
verify_enabled = false

# Configure MFA via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

# Configure MFA via WebAuthn
# [auth.mfa.web_authn]
# enroll_enabled = true
# verify_enabled = true

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `x`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false
# If enabled, it will allow the user to successfully authenticate when the provider does not return an email address.
email_optional = false

# Allow Solana wallet holders to sign in to your project via the Sign in with Solana (SIWS, EIP-4361) standard.
# You can configure "web3" rate limit in the [auth.rate_limit] section and set up [auth.captcha] if self-hosting.
[auth.web3.solana]
enabled = false

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

# Use Clerk as a third-party provider alongside Supabase Auth.
[auth.third_party.clerk]
enabled = false
# Obtain from https://clerk.com/setup/supabase
# domain = "example.clerk.accounts.dev"

# OAuth server configuration
[auth.oauth_server]
# Enable OAuth server functionality
enabled = false
# Path for OAuth consent flow UI
authorization_url_path = "/oauth/consent"
# Allow dynamic client registration
allow_dynamic_registration = false

[edge_runtime]
enabled = true
# Supported request policies: `oneshot`, `per_worker`.
# `per_worker` (default) — enables hot reload during local development.
# `oneshot` — fallback mode if hot reload causes issues (e.g. in large repos or with symlinks).
policy = "per_worker"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8083
deno_version = 2

[functions.place-bid]
verify_jwt = false

# [edge_runtime.secrets]
# secret_key = "env(SECRET_VALUE)"

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"

[functions.process-player-photo]
enabled = true
verify_jwt = true
import_map = "./functions/process-player-photo/deno.json"
# Uncomment to specify a custom file path to the entrypoint.
# Supported file extensions are: .ts, .js, .mjs, .jsx, .tsx
entrypoint = "./functions/process-player-photo/index.ts"
# Specifies static files to be bundled with the function. Supports glob patterns.
# For example, if you want to serve static HTML pages in your function:
# static_files = [ "./functions/process-player-photo/*.html" ]
````

## File: supabase/functions/import_map.json
````json
{
  "imports": {
    "std/": "https://deno.land/std@0.168.0/",
    "supabase": "https://esm.sh/@supabase/supabase-js@2.39.0"
  }
}
````

## File: supabase/functions/place-bid/index.ts
````typescript
import { serve } from "std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization');
        console.log("AUTH HEADER:", authHeader?.slice(0,30));
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Missing Authorization" }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            {
                global: {
                    headers: { Authorization: authHeader },
                },
                auth: {
                    persistSession: false,
                },
            }
        );
        
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) throw new Error("Unauthorized");

        // 1. Log the raw body for debugging (clone the request to avoid consuming it)
        const rawBody = await req.clone().text();
        console.log("Raw body:", rawBody);

        // 2. Parse request body
        let body;
        try {
            body = await req.json();
        } catch {
            throw new Error("Invalid JSON body");
        }

        const { auction_id, team_id, bid_amount } = body ?? {};

        console.log("Incoming bid request:", { auction_id, team_id, bid_amount });

        if (!auction_id || !team_id || bid_amount === undefined) {
            throw new Error('Missing required fields: auction_id, team_id, bid_amount');
        }

        // 3. Execute bid via consolidated RPC
        const { data: updatedState, error: rpcError } = await supabaseClient
            .rpc('execute_bid', {
                p_auction_id: auction_id,
                p_team_id: team_id,
                p_next_bid: bid_amount
            });

        if (rpcError) {
            console.error('RPC Error:', rpcError);
            throw new Error(rpcError.message);
        }

        return new Response(JSON.stringify(updatedState), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("Edge function error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
````

## File: supabase/functions/process-player-photo/.npmrc
````
# Configuration for private npm package dependencies
# For more information on using private registries with Edge Functions, see:
# https://supabase.com/docs/guides/functions/import-maps#importing-from-private-registries
````

## File: supabase/functions/process-player-photo/deno.json
````json
{
  "imports": {
    "@supabase/functions-js": "jsr:@supabase/functions-js@^2"
  }
}
````

## File: supabase/functions/process-player-photo/index.ts
````typescript
import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {

  const body = await req.json()
  const record = body.record

  const playerId = record.id
  const photoUrl = record.photo_url

  if (!photoUrl) {
    return new Response("No photo provided")
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Start prediction
  const start = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("REPLICATE_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "MODEL_VERSION",
      input: {
        image: photoUrl,
        prompt: "Convert this cricket player photo into esports avatar with dramatic lighting, dark background, ultra sharp portrait, cinematic lighting, epic background, epic lighting"
      }
    })
  })

  const prediction = await start.json()

  const predictionId = prediction.id

  // Poll until finished
  let result = prediction

  while (result.status !== "succeeded" && result.status !== "failed") {

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const check = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("REPLICATE_API_KEY")}`,
        }
      }
    )

    result = await check.json()
  }

  if (result.status === "failed") {
    return new Response("Prediction failed")
  }

  const generatedImage = result.output[0]

  const image = await fetch(generatedImage)
  const buffer = await image.arrayBuffer()

  const filePath = `processed/player_${playerId}.png`

  await supabase.storage
    .from("player-photos")
    .upload(filePath, buffer, {
      contentType: "image/png",
      upsert: true
    })

  const publicUrl =
    `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/player-photos/${filePath}`

  await supabase
    .from("players")
    .update({
      processed_photo_url: publicUrl
    })
    .eq("id", playerId)

  return new Response("Success")
})
````

## File: supabase/migrations/0001_auction_engine.sql
````sql
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
````

## File: supabase/migrations/0002_captain_round.sql
````sql
-- Captain assignment RPC for blind bidding phase

create or replace function public.assign_captain(
  p_auction_id uuid,
  p_team_id uuid,
  p_player_id uuid,
  p_price numeric
)
returns void
language plpgsql
security definer
as $$
declare
  v_auction public.auctions;
  v_team public.teams;
  v_player public.players;
  v_base_price numeric(12,2);
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  if p_price <= 0 then
    raise exception 'Captain price must be positive';
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction % not found', p_auction_id;
  end if;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team % not found for auction %', p_team_id, p_auction_id;
  end if;

  if v_team.captain_id is not null then
    raise exception 'Team % already has a captain', p_team_id;
  end if;

  select *
    into v_player
  from public.players
  where id = p_player_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Player % not found for auction %', p_player_id, p_auction_id;
  end if;

  if v_player.status <> 'upcoming' then
    raise exception 'Captain must be selected from upcoming players';
  end if;

  -- Purse and slot checks re-used from main auction rules
  if v_team.slots_remaining <= 0 then
    raise exception 'Team % has no remaining slots', p_team_id;
  end if;

  if v_team.purse_remaining < p_price then
    raise exception 'Captain price exceeds team purse for team %', p_team_id;
  end if;

  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_price) < v_required_money then
    raise exception 'Minimum squad rule violated for team % when assigning captain', p_team_id;
  end if;

  update public.players
     set status = 'sold',
         sold_price = p_price,
         sold_team_id = p_team_id
   where id = p_player_id;

  update public.teams
     set purse_remaining = v_team.purse_remaining - p_price,
         slots_remaining = v_team.slots_remaining - 1,
         captain_id = p_player_id
   where id = p_team_id;
end;
$$;
````

## File: supabase/migrations/0003_auction_status.sql
````sql
-- Auction status tracking: upcoming, live, completed

do $$
begin
  if not exists (select 1 from pg_type where typname = 'auction_status') then
    create type public.auction_status as enum ('upcoming', 'live', 'completed');
  end if;
end $$;

alter table public.auctions
  add column if not exists status public.auction_status not null default 'upcoming';
````

## File: supabase/migrations/0004_registration_control.sql
````sql
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
````

## File: supabase/migrations/0005_audit_fixes.sql
````sql
-- Migration to add undo_sale RPC and update assign_captain to trigger a UI reveal

-- 1. Update assign_captain to push state to auction_state for Live UI Hype Reveal
create or replace function public.assign_captain(
  p_auction_id uuid,
  p_team_id uuid,
  p_player_id uuid,
  p_price numeric
)
returns void
language plpgsql
security definer
as $$
declare
  v_auction public.auctions;
  v_team public.teams;
  v_player public.players;
  v_base_price numeric(12,2);
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  if p_price <= 0 then
    raise exception 'Captain price must be positive';
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction % not found', p_auction_id;
  end if;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team % not found for auction %', p_team_id, p_auction_id;
  end if;

  if v_team.captain_id is not null then
    raise exception 'Team % already has a captain', p_team_id;
  end if;

  select *
    into v_player
  from public.players
  where id = p_player_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Player % not found for auction %', p_player_id, p_auction_id;
  end if;

  if v_player.status <> 'upcoming' then
    raise exception 'Captain must be selected from upcoming players';
  end if;

  -- Purse and slot checks re-used from main auction rules
  if v_team.slots_remaining <= 0 then
    raise exception 'Team % has no remaining slots', p_team_id;
  end if;

  if v_team.purse_remaining < p_price then
    raise exception 'Captain price exceeds team purse for team %', p_team_id;
  end if;

  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_price) < v_required_money then
    raise exception 'Minimum squad rule violated for team % when assigning captain', p_team_id;
  end if;

  update public.players
     set status = 'sold',
         sold_price = p_price,
         sold_team_id = p_team_id
   where id = p_player_id;

  update public.teams
     set purse_remaining = v_team.purse_remaining - p_price,
         slots_remaining = v_team.slots_remaining - 1,
         captain_id = p_player_id
   where id = p_team_id;

  -- UPDATE AUCTION STATE FOR HYPE REVEAL
  update public.auction_state
     set current_player_id = p_player_id,
         leading_team_id = p_team_id,
         current_bid = p_price,
         phase = 'captain_round'
   where auction_id = p_auction_id;

end;
$$;


-- 2. Add undo_sale RPC to reverse a finalized sale
create or replace function public.undo_sale(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player public.players;
  v_team public.teams;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'No active auction state found for auction %', p_auction_id;
  end if;

  -- Check if there is a recently sold/unsold player mapped to state
  if v_state.current_player_id is null then
    raise exception 'No player to undo sale for.';
  end if;

  select * into v_player from public.players where id = v_state.current_player_id for update;

  if v_player.status not in ('sold', 'unsold') then
    raise exception 'Player % is not sold or unsold, cannot undo sale.', v_player.name;
  end if;

  if v_player.status = 'sold' and v_player.sold_team_id is not null then
    -- Refund team
    select * into v_team from public.teams where id = v_player.sold_team_id for update;
    
    update public.teams
       set purse_remaining = v_team.purse_remaining + coalesce(v_player.sold_price, 0),
           slots_remaining = v_team.slots_remaining + 1
     where id = v_team.id;
     
    -- If this player was a captain, remove captain status
    if v_team.captain_id = v_player.id then
       update public.teams set captain_id = null where id = v_team.id;
    end if;
  end if;

  -- Reset Player
  update public.players
     set status = 'upcoming',
         sold_price = null,
         sold_team_id = null
   where id = v_player.id;

  -- Reset Auction State to idle/ready
  update public.auction_state
     set phase = 'idle',
         current_bid = null,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0006_end_bid_fixes.sql
````sql
-- Fix end_bid to retain player ID for UI 'Sold' states and undo mechanics

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
     
    -- Update Phase for UI Polish
    update public.auction_state
       set phase = 'completed_sale'
     where id = v_state.id;
     
  else
    update public.players
       set status = 'unsold'
     where id = v_state.current_player_id;
     
    update public.auction_state
       set phase = 'completed_unsold'
     where id = v_state.id;
  end if;

  /* DO NOT NULLIFY current_player_id SO UNDO WORKS AND UI SHOWS SOLD STATUS */
  update public.auction_state
     set previous_bid = v_state.current_bid,
         previous_leading_team_id = v_state.leading_team_id
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0007_captain_flow.sql
````sql
-- Migration to support the new "Lock Participants -> Select Captains -> Captain Reveal -> Blind Bid" workflow

-- 1. Add Captain Base Price to Auctions
alter table public.auctions
add column if not exists captain_base_price numeric(12,2) default 0;

-- 2. Add is_captain flag to Players to track who was selected
alter table public.players
add column if not exists is_captain boolean default false;

-- 3. Update the assign_captain function to work with the Blind-Bid Matching Phase
-- This simplifies it to just assign team, price, and deduct purse/slots.
-- The UI will handle triggering the end of the phase when all are matched.
create or replace function public.match_captain_blind_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_player_id uuid,
  p_price numeric
)
returns void
language plpgsql
security definer
as $$
declare
  v_auction public.auctions;
  v_team public.teams;
  v_player public.players;
  v_base_price numeric(12,2);
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  if p_price < 0 then
    raise exception 'Captain price cannot be negative';
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction % not found', p_auction_id;
  end if;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team % not found for auction %', p_team_id, p_auction_id;
  end if;

  if v_team.captain_id is not null then
    raise exception 'Team % already has a captain', p_team_id;
  end if;

  select *
    into v_player
  from public.players
  where id = p_player_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Player % not found for auction %', p_player_id, p_auction_id;
  end if;

  if not v_player.is_captain then
    raise exception 'Player % is not marked as a captain', v_player.name;
  end if;

  if v_player.status <> 'upcoming' then
    raise exception 'Captain must be selected from upcoming players';
  end if;

  if v_team.slots_remaining <= 0 then
    raise exception 'Team % has no remaining slots', p_team_id;
  end if;

  if v_team.purse_remaining < p_price then
    raise exception 'Captain price exceeds team purse for team %', p_team_id;
  end if;

  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_price) < v_required_money then
    raise exception 'Minimum squad rule violated for team % when assigning captain', p_team_id;
  end if;

  update public.players
     set status = 'sold',
         sold_price = p_price,
         sold_team_id = p_team_id
   where id = p_player_id;

  update public.teams
     set purse_remaining = v_team.purse_remaining - p_price,
         slots_remaining = v_team.slots_remaining - 1,
         captain_id = p_player_id
   where id = p_team_id;

end;
$$;
````

## File: supabase/migrations/0008_auto_allocation.sql
````sql
-- Migration to add final Auto-Allocation for Unsold Phase 2

create or replace function public.auto_allocate_unsold(
  p_auction_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_auction public.auctions;
  v_base_price numeric(12,2);
  v_team record;
  v_player record;
begin
  -- Get auction and base price
  select * into v_auction from public.auctions where id = p_auction_id for update;
  if not found then
    raise exception 'Auction not found';
  end if;
  
  v_base_price := (v_auction.settings ->> 'base_price')::numeric;

  -- Loop through teams that need players (slots_remaining > 0)
  for v_team in 
    select * from public.teams 
    where auction_id = p_auction_id and slots_remaining > 0 
    order by slots_remaining desc 
  loop
    -- While this particular team still needs players and has enough purse
    while v_team.slots_remaining > 0 and v_team.purse_remaining >= v_base_price loop
      -- Find an unsold player deterministically
      select * into v_player 
      from public.players 
      where auction_id = p_auction_id and status = 'unsold' 
      order by id
      limit 1;
      
      -- If no more unsold players exist at all, exit the entire function
      if not found then
        return;
      end if;

      -- Assign player to the current team
      update public.players
      set status = 'sold',
          sold_price = v_base_price,
          sold_team_id = v_team.id
      where id = v_player.id;

      -- Update our local team record variables
      v_team.purse_remaining := v_team.purse_remaining - v_base_price;
      v_team.slots_remaining := v_team.slots_remaining - 1;

      -- Persist team updates to the database
      update public.teams
      set purse_remaining = v_team.purse_remaining,
          slots_remaining = v_team.slots_remaining
      where id = v_team.id;
      
    end loop;
  end loop;

  -- Finally, set state block to indicate completion of Phase 2
  update public.auction_state
  set phase = 'completed_auto_allocation',
      current_player_id = null,
      current_bid = null,
      leading_team_id = null
  where auction_id = p_auction_id;

end;
$$;
````

## File: supabase/migrations/0009_enable_realtime.sql
````sql
-- Migration to explicitly enable realtime for core tables
-- This ensures that the frontend automatically receives websocket updates
-- when players, teams, or auction states are modified.

begin;

-- Drop the publication if it already exists to ensure a clean state
drop publication if exists supabase_realtime;

-- Recreate the publication
create publication supabase_realtime;

-- Add our core tables to the realtime publication
alter publication supabase_realtime add table public.auction_state;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.auctions;

commit;
````

## File: supabase/migrations/0010_end_auction.sql
````sql
-- Create a function to permanently conclude an auction
CREATE OR REPLACE FUNCTION end_auction(p_auction_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Set the primary auction status to 'completed'
  UPDATE auctions
  SET status = 'completed',
      is_registration_open = false
  WHERE id = p_auction_id;

  -- 2. Ensure the auction_state phase is strictly 'completed' to halt all live screens
  UPDATE auction_state
  SET phase = 'completed',
      current_player_id = NULL,
      current_bid = NULL,
      leading_team_id = NULL
  WHERE auction_id = p_auction_id;

END;
$$;
````

## File: supabase/migrations/0011_auction_phase_enum.sql
````sql
-- Migration to add completed_sale and completed_unsold to auction_phase enum
-- We have to use a DO block since ALTER TYPE cannot run inside a transaction block easily if used incorrectly,
-- but supabase migrations wrap in transaction. Standard syntax to add enum values:
ALTER TYPE public.auction_phase ADD VALUE IF NOT EXISTS 'completed_sale';
ALTER TYPE public.auction_phase ADD VALUE IF NOT EXISTS 'completed_unsold';
````

## File: supabase/migrations/0012_explicit_phases.sql
````sql
-- Migration for Explicit Phases, Hype screens, Strict Undo constraints, and Ordered Auto-Allocate

-- Register new phases for the hype transition
ALTER TYPE public.auction_phase ADD VALUE IF NOT EXISTS 'phase_2_hype';
ALTER TYPE public.auction_phase ADD VALUE IF NOT EXISTS 'phase_1_complete';

-- 1. Modified next_player
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

  if v_state.phase = 'phase1' or v_state.phase = 'idle' or v_state.phase like 'completed%' then
    -- If we were in phase 1, keep pulling from phase 1 upcoming
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
    order by random()
    limit 1;

    if not found then
      -- Instead of silently falling back to unsold, explicitly halt
      update public.auction_state
         set phase = 'phase_1_complete',
             current_player_id = null,
             current_bid = null,
             leading_team_id = null
       where id = v_state.id
       returning * into v_state;
      raise exception 'PHASE_1_COMPLETE';
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
      raise exception 'PHASE_2_COMPLETE';
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


-- 2. Explicit transition into Phase 2 Hype
create or replace function public.start_phase2(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  update public.auction_state
     set phase = 'phase_2_hype'
   where auction_id = p_auction_id
   returning * into v_state;
   
  return v_state;
end;
$$;


-- 3. Strict undo_bid
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

  if v_state.phase not in ('phase1', 'phase2') or v_state.current_bid is null then
    raise exception 'Undo Bid can only be used during an active live continuous bid.';
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


-- 4. Strict undo_sale
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

  if v_state.previous_bid is null and v_state.previous_leading_team_id is null and v_state.phase like 'completed%' then
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


-- 5. Auto-Allocation with Order Array
create or replace function public.auto_allocate_ordered(p_auction_id uuid, p_ordered_player_ids uuid[])
returns void
language plpgsql
security definer
as $$
declare
  v_settings record;
  v_player_id uuid;
  v_team record;
begin
  select purse, min_players, max_players, base_price, increment
    into v_settings
  from public.auctions
  where id = p_auction_id;

  if not found then
    raise exception 'Auction not found';
  end if;

  foreach v_player_id in array p_ordered_player_ids
  loop
    -- Double check player is actually unsold before allocating
    if not exists (select 1 from public.players where id = v_player_id and status = 'unsold' and auction_id = p_auction_id) then
      continue;
    end if;

    -- Pick the team with the highest slots remaining that can afford the base price in this auction
    select id, purse_remaining, slots_remaining
      into v_team
    from public.teams
    where auction_id = p_auction_id
      and slots_remaining > 0
      and purse_remaining >= v_settings.base_price
    order by slots_remaining desc, purse_remaining desc
    limit 1
    for update;

    -- If no team can take them, skip
    if not found then
      continue;
    end if;

    -- Assign player to team
    update public.players
       set status = 'sold',
           sold_price = v_settings.base_price,
           sold_team_id = v_team.id
     where id = v_player_id;

    -- Deduct from team
    update public.teams
       set purse_remaining = purse_remaining - v_settings.base_price,
           slots_remaining = slots_remaining - 1
     where id = v_team.id;
  end loop;

end;
$$;
````

## File: supabase/migrations/0013_explicit_phases_fix.sql
````sql
-- 0013_explicit_phases_fix.sql
-- Fix next_player so it does not raise an exception, but returns the completed phase block so UI gets realtime update

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

  if v_state.phase = 'phase1' or v_state.phase = 'idle' or v_state.phase like 'completed%' then
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
````

## File: supabase/migrations/0014_explicit_phases_typecast.sql
````sql
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
````

## File: supabase/migrations/0015_phase_start.sql
````sql
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
````

## File: supabase/migrations/0016_undo_sale_rework.sql
````sql
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
````

## File: supabase/migrations/0017_phase2_statuses.sql
````sql
-- 0017_phase2_statuses.sql
-- Expand player status to track Phase 2 eligibility natively to prevent infinite draw loops.

ALTER TYPE public.player_status ADD VALUE IF NOT EXISTS 'upcoming_phase2';

-- Modify start_phase2 to move all 'unsold' players into 'upcoming_phase2'
create or replace function public.start_phase2(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  -- Shift all unsold players into the Phase 2 queue
  update public.players
     set status = 'upcoming_phase2'
   where auction_id = p_auction_id
     and status = 'unsold';

  -- Trigger the hype screen phase
  update public.auction_state
     set phase = 'phase_2_hype'
   where auction_id = p_auction_id
   returning * into v_state;
   
  return v_state;
end;
$$;


-- Modify next_player to only pull from 'upcoming_phase2' during Phase 2
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

  if v_state.phase = 'captain_round' or v_state.phase = 'phase1' or v_state.phase = 'idle' or (v_state.phase::text like 'completed%' and not exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    -- Wait, the rule is if we were in phase 1, keep pulling from phase 1 upcoming
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

  elsif v_state.phase = 'phase_2_hype' or v_state.phase = 'phase2' or (v_state.phase::text like 'completed%' and exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    -- In phase 2, pull ONLY from upcoming_phase2
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming_phase2'
    order by random()
    limit 1;

    if not found then
      -- Phase 2 is complete.
      update public.auction_state
         set phase = 'phase_2_complete',
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
         previous_player_id = v_state.current_player_id, 
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


-- Rewrite undo_sale to use upcoming_phase2
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

  if v_state.phase::text not in ('phase1', 'phase2', 'completed_sale', 'completed_unsold') then
    raise exception 'Undo Sale is not permitted in the current phase.';
  end if;

  if (v_state.phase::text = 'phase1' or v_state.phase::text = 'phase2') and v_state.current_bid is not null then
    raise exception 'Undo Sale is not permitted after a new bid has started.';
  end if;

  if v_state.phase::text like 'completed%' then
    v_target_player_id := v_state.current_player_id;
  else
    v_target_player_id := v_state.previous_player_id;
  end if;

  if v_target_player_id is null then
    raise exception 'No sold player context available for undo.';
  end if;

  select * into v_player from public.players where id = v_target_player_id for update;

  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  if v_state.phase::text like 'completed%' then
    -- SCENARIO A: Undoing during the 3.5s window
    update public.players
       set status = 'live',
           sold_price = null,
           sold_team_id = null
     where id = v_player.id;

    update public.auction_state
       set phase = case when v_state.phase::text = 'completed_unsold' or v_state.phase::text = 'completed_sale' then 
                     (case when exists(select 1 from public.players where status = 'upcoming_phase2' and auction_id=p_auction_id) then 'phase2' else 'phase1' end)
                   else 'phase1' end,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           current_player_id = v_target_player_id, 
           previous_player_id = null
     where id = v_state.id
     returning * into v_state;

  else
    -- SCENARIO B: Undoing AFTER next_player has been drawn
    update public.players
       set status = case when v_state.phase::text = 'phase2' then 'upcoming_phase2' else 'upcoming' end,
           sold_price = null,
           sold_team_id = null
     where id = v_player.id;

    update public.auction_state
       set previous_player_id = null
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0018_undo_sale_notice_and_first_bid.sql
````sql
-- 0018_undo_sale_notice_and_first_bid.sql
-- 1. Add column to track undo notice
ALTER TABLE public.auction_state ADD COLUMN IF NOT EXISTS show_undo_notice boolean DEFAULT false;

-- 2. Update place_bid to ensure first bid = base price
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

  -- THE FIX: If no leading team, next bid IS the current_bid (base_price).
  -- Otherwise, it's current_bid + increment.
  if v_state.leading_team_id is null then
    v_next_bid := coalesce(v_state.current_bid, v_base_price);
  else
    v_next_bid := v_state.current_bid + v_increment;
  end if;

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
         leading_team_id = p_team_id,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- 3. Update undo_sale to restore player and set notice
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

  if v_state.phase::text not in ('phase1', 'phase2', 'completed_sale', 'completed_unsold') then
    raise exception 'Undo Sale is not permitted in the current phase.';
  end if;

  if (v_state.phase::text = 'phase1' or v_state.phase::text = 'phase2') and v_state.current_bid is not null then
    raise exception 'Undo Sale is not permitted after a new bid has started.';
  end if;

  if v_state.phase::text like 'completed%' then
    v_target_player_id := v_state.current_player_id;
  else
    v_target_player_id := v_state.previous_player_id;
  end if;

  if v_target_player_id is null then
    raise exception 'No sold player context available for undo.';
  end if;

  select * into v_player from public.players where id = v_target_player_id for update;

  -- Restore Purse/Slots if it was sold
  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  -- Restore player to LIVE
  update public.players
     set status = 'live',
         sold_price = null,
         sold_team_id = null
   where id = v_target_player_id;

  if v_state.phase::text like 'completed%' then
    -- SCENARIO A: Undoing during the 3.5s window
    update public.auction_state
       set phase = case when v_state.phase::text = 'completed_unsold' or v_state.phase::text = 'completed_sale' then 
                     (case when exists(select 1 from public.players where status = 'upcoming_phase2' and auction_id=p_auction_id) then 'phase2' else 'phase1' end)
                   else 'phase1' end,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           current_player_id = v_target_player_id, 
           previous_player_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;

  else
    -- SCENARIO B: Undoing AFTER next_player has been drawn
    -- If a new player was drawn, move them back to upcoming
    if v_state.current_player_id is not null then
      update public.players
         set status = case when v_state.phase::text = 'phase2' then 'upcoming_phase2' else 'upcoming' end
       where id = v_state.current_player_id;
    end if;

    update public.auction_state
       set current_player_id = v_target_player_id,
           previous_player_id = null,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;

-- 4. Reset notice in other RPCs
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

  if v_state.phase = 'captain_round' or v_state.phase = 'phase1' or v_state.phase = 'idle' or (v_state.phase::text like 'completed%' and not exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
    order by random()
    limit 1;

    if not found then
      update public.auction_state
         set phase = 'phase_1_complete',
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

    update public.auction_state
       set phase = 'phase1'
     where id = v_state.id;

  elsif v_state.phase = 'phase_2_hype' or v_state.phase = 'phase2' or (v_state.phase::text like 'completed%' and exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming_phase2'
    order by random()
    limit 1;

    if not found then
      update public.auction_state
         set phase = 'phase_2_complete',
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

    update public.auction_state
       set phase = 'phase2'
     where id = v_state.id;
  end if;

  update public.players
    set status = 'live'
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

  return v_state;
end;
$$;

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
         phase = case when v_state.phase = 'phase1' or v_state.phase = 'idle' or v_state.phase = 'captain_round' then 'phase1' else 'phase2' end,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

create or replace function public.end_bid(p_auction_id uuid)
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
    raise exception 'No active player for auction %', p_auction_id;
  end if;

  select * into v_player from public.players where id = v_state.current_player_id for update;

  if v_state.leading_team_id is not null then
    -- SOLD
    update public.players
       set status = 'sold',
           sold_price = v_state.current_bid,
           sold_team_id = v_state.leading_team_id
     where id = v_state.current_player_id;

    update public.teams
       set purse_remaining = purse_remaining - v_state.current_bid,
           slots_remaining = slots_remaining - 1
     where id = v_state.leading_team_id;

    update public.auction_state
       set phase = 'completed_sale',
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  else
    -- UNSOLD
    update public.players
       set status = case when v_state.phase = 'phase2' then 'unsold_final' else 'unsold' end
     where id = v_state.current_player_id;

    update public.auction_state
       set phase = 'completed_unsold',
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;

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
    raise exception 'No auction context available.';
  end if;

  if v_state.previous_bid is null then
    raise exception 'No previous bid available to undo.';
  end if;

  update public.auction_state
     set current_bid = previous_bid,
         leading_team_id = previous_leading_team_id,
         previous_bid = null,
         previous_leading_team_id = null,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0019_add_image_urls.sql
````sql
-- Add image URL columns for player photos and team logos
-- This migration adds support for mandatory image uploads

-- Add photo_url column to players table
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS photo_url text;

-- Add logo_url column to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS logo_url text;

-- Create indexes for photo_url and logo_url for faster queries
CREATE INDEX IF NOT EXISTS idx_players_photo_url ON public.players(photo_url);
CREATE INDEX IF NOT EXISTS idx_teams_logo_url ON public.teams(logo_url);
````

## File: supabase/migrations/0020_storage_buckets_setup.sql
````sql
-- Create storage buckets for player photos and team logos
-- Allows anonymous users to upload files

-- Insert buckets into storage.buckets table
INSERT INTO storage.buckets (id, name, public, owner, created_at, updated_at, file_size_limit, allowed_mime_types)
VALUES 
  ('player-photos', 'player-photos', true, NULL, now(), now(), 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('team-logos', 'team-logos', true, NULL, now(), now(), 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Policy for player-photos: Allow anonymous uploads to player-photos bucket
DROP POLICY IF EXISTS "Allow anonymous uploads to player-photos" ON storage.objects;
CREATE POLICY "Allow anonymous uploads to player-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'player-photos');

-- Policy for player-photos: Allow public read access
DROP POLICY IF EXISTS "Allow public read access to player-photos" ON storage.objects;
CREATE POLICY "Allow public read access to player-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'player-photos');

-- Policy for team-logos: Allow anonymous uploads to team-logos bucket
DROP POLICY IF EXISTS "Allow anonymous uploads to team-logos" ON storage.objects;
CREATE POLICY "Allow anonymous uploads to team-logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'team-logos');

-- Policy for team-logos: Allow public read access
DROP POLICY IF EXISTS "Allow public read access to team-logos" ON storage.objects;
CREATE POLICY "Allow public read access to team-logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-logos');

-- Optional: Allow authenticated users to delete their own uploads
DROP POLICY IF EXISTS "Allow users to delete their uploads" ON storage.objects;
CREATE POLICY "Allow users to delete their uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('player-photos', 'team-logos')
  AND auth.uid() IS NOT NULL
);
````

## File: supabase/migrations/0021_fix_rpc_bugs.sql
````sql
-- 0021_fix_rpc_bugs.sql
-- 1. Fix auto_allocate_ordered to use jsonb settings correctly
create or replace function public.auto_allocate_ordered(p_auction_id uuid, p_ordered_player_ids uuid[])
returns void
language plpgsql
security definer
as $$
declare
  v_base_price numeric(12,2);
  v_player_id uuid;
  v_team record;
begin
  -- Access base_price from the settings jsonb column
  select (settings ->> 'base_price')::numeric
    into v_base_price
  from public.auctions
  where id = p_auction_id;

  if v_base_price is null then
    raise exception 'Base price not configured for auction %', p_auction_id;
  end if;

  foreach v_player_id in array p_ordered_player_ids
  loop
    -- Double check player is actually unsold before allocating
    if not exists (select 1 from public.players where id = v_player_id and status = 'unsold' and auction_id = p_auction_id) then
      continue;
    end if;

    -- Pick the team with the highest slots remaining that can afford the base price in this auction
    select id, purse_remaining, slots_remaining
      into v_team
    from public.teams
    where auction_id = p_auction_id
      and slots_remaining > 0
      and purse_remaining >= v_base_price
    order by slots_remaining desc, purse_remaining desc
    limit 1
    for update;

    -- If no team can take them, skip
    if not found then
      continue;
    end if;

    -- Assign player to team
    update public.players
       set status = 'sold',
           sold_price = v_base_price,
           sold_team_id = v_team.id
     where id = v_player_id;

    -- Deduct from team
    update public.teams
       set purse_remaining = purse_remaining - v_base_price,
           slots_remaining = slots_remaining - 1
     where id = v_team.id;
  end loop;

end;
$$;

-- 2. Ensure place_bid has fallback for settings
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

  v_base_price := coalesce((v_auction.settings ->> 'base_price')::numeric, 0);
  v_increment  := coalesce((v_auction.settings ->> 'increment')::numeric, 0);

  if v_base_price <= 0 or v_increment <= 0 then
    raise exception 'Base price or increment not properly configured for auction %', p_auction_id;
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

  -- Logic for the first bid vs subsequent bids
  if v_state.leading_team_id is null then
    v_next_bid := coalesce(v_state.current_bid, v_base_price);
  else
    v_next_bid := v_state.current_bid + v_increment;
  end if;

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
         leading_team_id = p_team_id,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0022_fix_enum_typecasts.sql
````sql
-- 0022_fix_enum_typecasts.sql
-- This migration fixes the "column 'phase' is of type auction_phase but expression is of type text" error
-- by adding explicit casts to public.auction_phase for all CASE and literal assignments.

-- 1. Fix next_player
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
    values (p_auction_id, 'phase1'::public.auction_phase)
    returning * into v_state;
  end if;

  if v_state.phase = 'captain_round' or v_state.phase = 'phase1' or v_state.phase = 'idle' or (v_state.phase::text like 'completed%' and not exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
    order by random()
    limit 1;

    if not found then
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

    update public.auction_state
       set phase = 'phase1'::public.auction_phase
     where id = v_state.id;

  elsif v_state.phase = 'phase_2_hype' or v_state.phase = 'phase2' or (v_state.phase::text like 'completed%' and exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming_phase2'
    order by random()
    limit 1;

    if not found then
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

    update public.auction_state
       set phase = 'phase2'::public.auction_phase
     where id = v_state.id;
  end if;

  update public.players
    set status = 'live'
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

  return v_state;
end;
$$;

-- 2. Fix start_bid
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
         phase = (case when v_state.phase::text in ('phase1', 'idle', 'captain_round') then 'phase1' else 'phase2' end)::public.auction_phase,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- 3. Fix undo_sale
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

  if v_state.phase::text not in ('phase1', 'phase2', 'completed_sale', 'completed_unsold') then
    raise exception 'Undo Sale is not permitted in the current phase.';
  end if;

  if (v_state.phase::text = 'phase1' or v_state.phase::text = 'phase2') and v_state.current_bid is not null then
    raise exception 'Undo Sale is not permitted after a new bid has started.';
  end if;

  if v_state.phase::text like 'completed%' then
    v_target_player_id := v_state.current_player_id;
  else
    v_target_player_id := v_state.previous_player_id;
  end if;

  if v_target_player_id is null then
    raise exception 'No sold player context available for undo.';
  end if;

  select * into v_player from public.players where id = v_target_player_id for update;

  -- Restore Purse/Slots if it was sold
  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  -- Restore player to LIVE
  update public.players
     set status = 'live',
         sold_price = null,
         sold_team_id = null
   where id = v_target_player_id;

  if v_state.phase::text like 'completed%' then
    -- SCENARIO A: Undoing during the 3.5s window
    update public.auction_state
       set phase = (case when v_state.phase::text in ('completed_unsold', 'completed_sale') then 
                      (case when exists(select 1 from public.players where status = 'upcoming_phase2' and auction_id=p_auction_id) then 'phase2' else 'phase1' end)
                    else 'phase1' end)::public.auction_phase,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           current_player_id = v_target_player_id, 
           previous_player_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;

  else
    -- SCENARIO B: Undoing AFTER next_player has been drawn
    -- If a new player was drawn, move them back to upcoming
    if v_state.current_player_id is not null then
      update public.players
         set status = case when v_state.phase::text = 'phase2' then 'upcoming_phase2' else 'upcoming' end
       where id = v_state.current_player_id;
    end if;

    update public.auction_state
       set current_player_id = v_target_player_id,
           previous_player_id = null,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;

-- 4. Fix end_bid
create or replace function public.end_bid(p_auction_id uuid)
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
    raise exception 'No active player for auction %', p_auction_id;
  end if;

  select * into v_player from public.players where id = v_state.current_player_id for update;

  if v_state.leading_team_id is not null then
    -- SOLD
    update public.players
       set status = 'sold',
           sold_price = v_state.current_bid,
           sold_team_id = v_state.leading_team_id
     where id = v_state.current_player_id;

    update public.teams
       set purse_remaining = purse_remaining - v_state.current_bid,
           slots_remaining = slots_remaining - 1
     where id = v_state.leading_team_id;

    update public.auction_state
       set phase = 'completed_sale'::public.auction_phase,
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  else
    -- UNSOLD
    update public.players
       set status = case when v_state.phase::text = 'phase2' then 'unsold_final' else 'unsold' end
     where id = v_state.current_player_id;

    update public.auction_state
       set phase = 'completed_unsold'::public.auction_phase,
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0023_fix_player_status_casts.sql
````sql
-- 0023_fix_player_status_casts.sql
-- This migration fixes the "column 'status' is of type player_status but expression is of type text" error
-- by adding explicit casts to public.player_status for all RPC status updates.

-- 1. Fix next_player
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
    values (p_auction_id, 'phase1'::public.auction_phase)
    returning * into v_state;
  end if;

  if v_state.phase = 'captain_round' or v_state.phase = 'phase1' or v_state.phase = 'idle' or (v_state.phase::text like 'completed%' and not exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
    order by random()
    limit 1;

    if not found then
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

    update public.auction_state
       set phase = 'phase1'::public.auction_phase
     where id = v_state.id;

  elsif v_state.phase = 'phase_2_hype' or v_state.phase = 'phase2' or (v_state.phase::text like 'completed%' and exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming_phase2'
    order by random()
    limit 1;

    if not found then
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

    update public.auction_state
       set phase = 'phase2'::public.auction_phase
     where id = v_state.id;
  end if;

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

  return v_state;
end;
$$;

-- 2. Fix undo_sale
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

  if v_state.phase::text not in ('phase1', 'phase2', 'completed_sale', 'completed_unsold') then
    raise exception 'Undo Sale is not permitted in the current phase.';
  end if;

  if (v_state.phase::text = 'phase1' or v_state.phase::text = 'phase2') and v_state.current_bid is not null then
    raise exception 'Undo Sale is not permitted after a new bid has started.';
  end if;

  if v_state.phase::text like 'completed%' then
    v_target_player_id := v_state.current_player_id;
  else
    v_target_player_id := v_state.previous_player_id;
  end if;

  if v_target_player_id is null then
    raise exception 'No sold player context available for undo.';
  end if;

  select * into v_player from public.players where id = v_target_player_id for update;

  -- Restore Purse/Slots if it was sold
  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  -- Restore player to LIVE
  update public.players
     set status = 'live'::public.player_status,
         sold_price = null,
         sold_team_id = null
   where id = v_target_player_id;

  if v_state.phase::text like 'completed%' then
    -- SCENARIO A: Undoing during the 3.5s window
    update public.auction_state
       set phase = (case when v_state.phase::text in ('completed_unsold', 'completed_sale') then 
                      (case when exists(select 1 from public.players where status = 'upcoming_phase2' and auction_id=p_auction_id) then 'phase2' else 'phase1' end)
                    else 'phase1' end)::public.auction_phase,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           current_player_id = v_target_player_id, 
           previous_player_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;

  else
    -- SCENARIO B: Undoing AFTER next_player has been drawn
    -- If a new player was drawn, move them back to upcoming
    if v_state.current_player_id is not null then
      update public.players
         set status = (case when v_state.phase::text = 'phase2' then 'upcoming_phase2' else 'upcoming' end)::public.player_status
       where id = v_state.current_player_id;
    end if;

    update public.auction_state
       set current_player_id = v_target_player_id,
           previous_player_id = null,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;

-- 3. Fix end_bid
create or replace function public.end_bid(p_auction_id uuid)
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
    raise exception 'No active player for auction %', p_auction_id;
  end if;

  select * into v_player from public.players where id = v_state.current_player_id for update;

  if v_state.leading_team_id is not null then
    -- SOLD
    update public.players
       set status = 'sold'::public.player_status,
           sold_price = v_state.current_bid,
           sold_team_id = v_state.leading_team_id
     where id = v_state.current_player_id;

    update public.teams
       set purse_remaining = purse_remaining - v_state.current_bid,
           slots_remaining = slots_remaining - 1
     where id = v_state.leading_team_id;

    update public.auction_state
       set phase = 'completed_sale'::public.auction_phase,
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  else
    -- UNSOLD
    update public.players
       set status = (case when v_state.phase::text = 'phase2' then 'unsold_final' else 'unsold' end)::public.player_status
     where id = v_state.current_player_id;

    update public.auction_state
       set phase = 'completed_unsold'::public.auction_phase,
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;

-- 4. Fix start_phase2
create or replace function public.start_phase2(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  -- Shift all unsold players into the Phase 2 queue
  update public.players
     set status = 'upcoming_phase2'::public.player_status
   where auction_id = p_auction_id
     and status = 'unsold';

  -- Trigger the hype screen phase
  update public.auction_state
     set phase = 'phase_2_hype'::public.auction_phase
   where auction_id = p_auction_id
   returning * into v_state;
   
  return v_state;
end;
$$;

-- 5. Fix auto_allocate_ordered
create or replace function public.auto_allocate_ordered(p_auction_id uuid, p_ordered_player_ids uuid[])
returns void
language plpgsql
security definer
as $$
declare
  v_base_price numeric(12,2);
  v_player_id uuid;
  v_team record;
begin
  -- Access base_price from the settings jsonb column
  select (settings ->> 'base_price')::numeric
    into v_base_price
  from public.auctions
  where id = p_auction_id;

  if v_base_price is null then
    raise exception 'Base price not configured for auction %', p_auction_id;
  end if;

  foreach v_player_id in array p_ordered_player_ids
  loop
    -- Double check player is actually unsold before allocating
    if not exists (select 1 from public.players where id = v_player_id and status = 'unsold' and auction_id = p_auction_id) then
      continue;
    end if;

    -- Pick the team with the highest slots remaining that can afford the base price in this auction
    select id, purse_remaining, slots_remaining
      into v_team
    from public.teams
    where auction_id = p_auction_id
      and slots_remaining > 0
      and purse_remaining >= v_base_price
    order by slots_remaining desc, purse_remaining desc
    limit 1
    for update;

    -- If no team can take them, skip
    if not found then
      continue;
    end if;

    -- Assign player to team
    update public.players
       set status = 'sold'::public.player_status,
           sold_price = v_base_price,
           sold_team_id = v_team.id
     where id = v_player_id;

    -- Deduct from team
    update public.teams
       set purse_remaining = purse_remaining - v_base_price,
           slots_remaining = slots_remaining - 1
     where id = v_team.id;
  end loop;

end;
$$;
````

## File: supabase/migrations/0024_manual_slot_filling.sql
````sql
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
````

## File: supabase/migrations/0025_admin_auth.sql
````sql
-- 0025_admin_auth.sql
-- 1. Create a profiles table to track user roles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'viewer')) default 'viewer',
  created_at timestamptz not null default now()
);

-- 2. Create a trigger to automatically create a profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Note: The USER must manually promote their specific user to 'admin' in the profiles table.
-- update public.profiles set role = 'admin' where email = 'your-admin@email.com';
````

## File: supabase/migrations/0026_execute_bid_rpc.sql
````sql
-- 0026_execute_bid_rpc.sql
-- This RPC is intended to be called ONLY by the Supabase Edge Function
-- after it has performed complex validation (purse, slots, min squad).
-- It performs the atomic update of the auction state.

create or replace function public.execute_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_next_bid numeric(12,2)
)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  -- Lock the state row
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction state not found';
  end if;

  -- Atomic update
  update public.auction_state
     set previous_bid = current_bid,
         previous_leading_team_id = leading_team_id,
         current_bid = p_next_bid,
         leading_team_id = p_team_id,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0027_bidding_indexes.sql
````sql
-- 0027_bidding_indexes.sql
-- Add indexes to speed up bid placement queries

-- Index on auction_state(auction_id) for fast state lookups
CREATE INDEX IF NOT EXISTS idx_auction_state_auction_id 
ON public.auction_state(auction_id);

-- Index on teams(id) for fast team lookups during bidding
-- Note: id should be PK, but adding explicit index for performance
CREATE INDEX IF NOT EXISTS idx_teams_id 
ON public.teams(id);

-- Composite index for faster state + team lookups
CREATE INDEX IF NOT EXISTS idx_auction_state_leading_team 
ON public.auction_state(leading_team_id, current_bid);

-- Index on auctions(id) if not already PK
CREATE INDEX IF NOT EXISTS idx_auctions_id 
ON public.auctions(id);
````

## File: supabase/migrations/0028_optimize_execute_bid_rpc.sql
````sql
-- 0028_optimize_execute_bid_rpc.sql
-- Optimize execute_bid to return only necessary columns

drop function if exists public.execute_bid(uuid, uuid, numeric(12,2));

create function public.execute_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_next_bid numeric(12,2)
)
returns table(
  id uuid,
  auction_id uuid,
  current_bid numeric(12,2),
  leading_team_id uuid,
  previous_bid numeric(12,2),
  previous_leading_team_id uuid
)
language plpgsql
security definer
as $$
begin
  -- Atomic update
  return query
  update public.auction_state
     set previous_bid = current_bid,
         previous_leading_team_id = leading_team_id,
         current_bid = p_next_bid,
         leading_team_id = p_team_id,
         show_undo_notice = false
   where auction_id = p_auction_id
   returning
     id,
     auction_id,
     current_bid,
     leading_team_id,
     previous_bid,
     previous_leading_team_id;
end;
$$;
````

## File: supabase/migrations/0029_fix_rpc_ambiguous_column.sql
````sql
-- 0029_fix_rpc_ambiguous_column.sql
-- Fix ambiguous column reference in execute_bid RPC

drop function if exists public.execute_bid(uuid, uuid, numeric(12,2));

create function public.execute_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_next_bid numeric(12,2)
)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  -- Atomic update
  update public.auction_state
     set previous_bid = current_bid,
         previous_leading_team_id = leading_team_id,
         current_bid = p_next_bid,
         leading_team_id = p_team_id,
         show_undo_notice = false
   where auction_id = p_auction_id
   returning * into v_state;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0030_refactor_execute_bid.sql
````sql
-- 0030_refactor_execute_bid.sql
-- Consolidate all bidding validations into a single atomic RPC with row-level locking

drop function if exists public.execute_bid(uuid, uuid, numeric(12,2));

create or replace function public.execute_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_next_bid numeric(12,2)
)
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
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  -- 1. Lock the auction state to prevent race conditions
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction state not found for id %', p_auction_id;
  end if;

  -- 2. Validate active player
  if v_state.current_player_id is null then
    raise exception 'No active player for this auction';
  end if;

  -- 3. Get auction settings and status
  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if v_auction.status != 'live' then
    raise exception 'Auction is not in live status';
  end if;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;
  v_increment  := (v_auction.settings ->> 'increment')::numeric;

  if v_base_price is null or v_increment is null then
    raise exception 'Base price or increment not configured for auction';
  end if;

  -- 4. Validate team and leading status
  if v_state.leading_team_id = p_team_id then
    raise exception 'Team is already leading the bid';
  end if;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team not found or does not belong to this auction';
  end if;

  -- 5. Validate bid amount
  if v_state.leading_team_id is null then
    -- First bid
    if p_next_bid < v_base_price then
      raise exception 'First bid must be at least base price (%)', v_base_price;
    end if;
    if (p_next_bid - v_base_price) % v_increment != 0 then
      raise exception 'Initial bid must be in increments of % above base price', v_increment;
    end if;
  else
    -- Subsequent bids
    if p_next_bid <= coalesce(v_state.current_bid, 0) then
      raise exception 'Bid amount must be higher than current bid (%)', coalesce(v_state.current_bid, 0);
    end if;
    if (p_next_bid - coalesce(v_state.current_bid, 0)) % v_increment != 0 then
      raise exception 'Bid must be in increments of %', v_increment;
    end if;
  end if;

  -- 6. Purse and Slot checks
  if v_team.purse_remaining < p_next_bid then
    raise exception 'Insufficient purse remaining';
  end if;

  if v_team.slots_remaining <= 0 then
    raise exception 'No slots remaining';
  end if;

  -- 7. Minimum squad constraint
  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_next_bid) < v_required_money then
    raise exception 'Insufficient funds to maintain minimum squad requirement';
  end if;

  -- 8. Atomic update
  update public.auction_state
     set previous_bid = current_bid,
         previous_leading_team_id = leading_team_id,
         current_bid = p_next_bid,
         leading_team_id = p_team_id,
         show_undo_notice = false
   where auction_id = p_auction_id
   returning * into v_state;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0031_optimize_bidding_latency.sql
````sql
-- 0031_optimize_bidding_latency.sql
-- Add authorization check directly into the execute_bid RPC so the frontend
-- can safely bypass Edge Functions for lower latency.

create or replace function public.execute_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_next_bid numeric(12,2)
)
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
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  -- 0. Authorization check
  -- Ensure only admins can execute bids to prevent malicious direct RPC calls
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can place bids';
  end if;

  -- 1. Lock the auction state to prevent race conditions
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction state not found for id %', p_auction_id;
  end if;

  -- 2. Validate active player
  if v_state.current_player_id is null then
    raise exception 'No active player for this auction';
  end if;

  -- 3. Get auction settings and status
  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if v_auction.status != 'live' then
    raise exception 'Auction is not in live status';
  end if;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;
  v_increment  := (v_auction.settings ->> 'increment')::numeric;

  if v_base_price is null or v_increment is null then
    raise exception 'Base price or increment not configured for auction';
  end if;

  -- 4. Validate team and leading status
  if v_state.leading_team_id = p_team_id then
    raise exception 'Team is already leading the bid';
  end if;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team not found or does not belong to this auction';
  end if;

  -- 5. Validate bid amount
  if v_state.leading_team_id is null then
    -- First bid
    if p_next_bid < v_base_price then
      raise exception 'First bid must be at least base price (%)', v_base_price;
    end if;
    if (p_next_bid - v_base_price) % v_increment != 0 then
      raise exception 'Initial bid must be in increments of % above base price', v_increment;
    end if;
  else
    -- Subsequent bids
    if p_next_bid <= coalesce(v_state.current_bid, 0) then
      raise exception 'Bid amount must be higher than current bid (%)', coalesce(v_state.current_bid, 0);
    end if;
    if (p_next_bid - coalesce(v_state.current_bid, 0)) % v_increment != 0 then
      raise exception 'Bid must be in increments of %', v_increment;
    end if;
  end if;

  -- 6. Purse and Slot checks
  if v_team.purse_remaining < p_next_bid then
    raise exception 'Insufficient purse remaining';
  end if;

  if v_team.slots_remaining <= 0 then
    raise exception 'No slots remaining';
  end if;

  -- 7. Minimum squad constraint
  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_next_bid) < v_required_money then
    raise exception 'Insufficient funds to maintain minimum squad requirement';
  end if;

  -- 8. Atomic update
  update public.auction_state
     set previous_bid = current_bid,
         previous_leading_team_id = leading_team_id,
         current_bid = p_next_bid,
         leading_team_id = p_team_id,
         show_undo_notice = false
   where auction_id = p_auction_id
   returning * into v_state;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0032_add_unsold_final_enum.sql
````sql
-- 0032_add_unsold_final_enum.sql
-- Add the missing 'unsold_final' value to the player_status enum

ALTER TYPE public.player_status ADD VALUE IF NOT EXISTS 'unsold_final';
````

## File: supabase/migrations/0033_fix_phase2_loop.sql
````sql
-- 0033_fix_phase2_loop.sql
-- Fix the logic in next_player and undo_sale to prevent infinite loops at the end of Phase 1 and Phase 2.
-- The previous logic relied solely on the presence of upcoming_phase2 players to identify Phase 2,
-- causing Phase 2 to revert to Phase 1 logic once all its players were processed.

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

  -- Count available players to determine context
  select count(*) into v_upcoming_count from public.players where auction_id = p_auction_id and status = 'upcoming';
  select count(*) into v_upcoming_phase2_count from public.players where auction_id = p_auction_id and status = 'upcoming_phase2';
  select count(*) into v_unsold_count from public.players where auction_id = p_auction_id and status = 'unsold';

  -- PHASE 1 Execution
  if v_state.phase in ('captain_round', 'idle', 'phase1') or 
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
  -- Authorization check: only admins can call this function
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can undo sales';
  end if;

  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'No auction context available.';
  end if;

  if v_state.phase::text not in ('phase1', 'phase2', 'completed_sale', 'completed_unsold') then
    raise exception 'Undo Sale is not permitted in the current phase.';
  end if;

  if (v_state.phase::text = 'phase1' or v_state.phase::text = 'phase2') and v_state.current_bid is not null then
    raise exception 'Undo Sale is not permitted after a new bid has started.';
  end if;

  if v_state.phase::text like 'completed%' then
    v_target_player_id := v_state.current_player_id;
  else
    v_target_player_id := v_state.previous_player_id;
  end if;

  if v_target_player_id is null then
    raise exception 'No sold player context available for undo.';
  end if;

  select * into v_player from public.players where id = v_target_player_id for update;

  -- Restore Purse/Slots if it was sold
  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  -- Restore player to LIVE
  update public.players
     set status = 'live'::public.player_status,
         sold_price = null,
         sold_team_id = null
   where id = v_target_player_id;

  if v_state.phase::text like 'completed%' then
    -- SCENARIO A: Undoing during the 3.5s window
    update public.auction_state
       set phase = (case when v_state.phase::text in ('completed_unsold', 'completed_sale') then 
                      (case when exists(select 1 from public.players where status in ('upcoming_phase2', 'unsold_final') and auction_id=p_auction_id) then 'phase2' else 'phase1' end)
                    else 'phase1' end)::public.auction_phase,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           current_player_id = v_target_player_id, 
           previous_player_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;

  else
    -- SCENARIO B: Undoing AFTER next_player has been drawn
    -- If a new player was drawn, move them back to upcoming
    if v_state.current_player_id is not null then
      update public.players
         set status = (case when v_state.phase::text in ('phase2', 'phase_2_complete', 'phase_2_hype') or exists(select 1 from public.players where status in ('upcoming_phase2', 'unsold_final') and auction_id=p_auction_id) then 'upcoming_phase2' else 'upcoming' end)::public.player_status
       where id = v_state.current_player_id;
    end if;

    update public.auction_state
       set current_player_id = v_target_player_id,
           previous_player_id = null,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0034_blind_bids_extension.sql
````sql
-- 0034_blind_bids_extension.sql
-- Extends the auction system with Blind Bid support for regular players.
-- Adds a 'blind_reserved' player status and a 'blind_bid_round' auction phase.
-- Creates RPCs for starting the blind bid round and matching blind bid players.
-- Updates next_player to exclude blind_reserved players from normal draws.

-- 1. Add new enum values
ALTER TYPE public.player_status ADD VALUE IF NOT EXISTS 'blind_reserved';
ALTER TYPE public.auction_phase ADD VALUE IF NOT EXISTS 'blind_bid_round';

-- 2. RPC to start the blind bid round
create or replace function public.start_blind_bid_round(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  -- Authorization check
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can start blind bid round';
  end if;

  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction state not found for id %', p_auction_id;
  end if;

  -- Verify there are blind_reserved players
  if not exists (select 1 from public.players where auction_id = p_auction_id and status = 'blind_reserved') then
    raise exception 'No blind bid players have been reserved for this auction';
  end if;

  update public.auction_state
     set phase = 'blind_bid_round'::public.auction_phase,
         current_player_id = null,
         current_bid = null,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- 3. RPC to match a blind bid player to a team (mirrors match_captain_blind_bid)
create or replace function public.match_player_blind_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_player_id uuid,
  p_price numeric
)
returns void
language plpgsql
security definer
as $$
declare
  v_auction public.auctions;
  v_team public.teams;
  v_player public.players;
  v_base_price numeric(12,2);
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  -- Authorization check
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can assign blind bid players';
  end if;

  if p_price < 0 then
    raise exception 'Blind bid price cannot be negative';
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction % not found', p_auction_id;
  end if;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team % not found for auction %', p_team_id, p_auction_id;
  end if;

  select *
    into v_player
  from public.players
  where id = p_player_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Player % not found for auction %', p_player_id, p_auction_id;
  end if;

  -- Must be a blind_reserved player
  if v_player.status <> 'blind_reserved' then
    raise exception 'Player % is not marked as blind_reserved', v_player.name;
  end if;

  -- Cannot be a captain
  if v_player.is_captain then
    raise exception 'Captains cannot be assigned as blind bid players';
  end if;

  if v_team.slots_remaining <= 0 then
    raise exception 'Team % has no remaining slots', p_team_id;
  end if;

  if v_team.purse_remaining < p_price then
    raise exception 'Blind bid price exceeds team purse for team %', p_team_id;
  end if;

  -- Minimum squad constraint
  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_price) < v_required_money then
    raise exception 'Minimum squad rule violated for team % when assigning blind bid player', p_team_id;
  end if;

  -- Execute assignment
  update public.players
     set status = 'sold'::public.player_status,
         sold_price = p_price,
         sold_team_id = p_team_id
   where id = p_player_id;

  update public.teams
     set purse_remaining = v_team.purse_remaining - p_price,
         slots_remaining = v_team.slots_remaining - 1
   where id = p_team_id;
end;
$$;

-- 4. Update next_player to exclude blind_reserved players from draws
-- This re-creates next_player with the blind_reserved exclusion added
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
````

## File: supabase/migrations/0035_dynamic_increments.sql
````sql
-- 0035_dynamic_increments.sql
-- Replaces the static increment validation in execute_bid with dynamic tier-based increments.
-- Tier thresholds and increment values are read from auction.settings JSONB:
--   tier1_threshold, tier1_increment, tier2_threshold, tier2_increment, tier3_increment
-- Falls back to the legacy static 'increment' field if tiers are not configured.

drop function if exists public.execute_bid(uuid, uuid, numeric(12,2));

create or replace function public.execute_bid(
  p_auction_id uuid,
  p_team_id uuid,
  p_next_bid numeric(12,2)
)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_auction public.auctions;
  v_team public.teams;
  v_base_price numeric(12,2);
  v_active_bid numeric(12,2);
  v_dynamic_incr numeric(12,2);
  v_tier1_threshold numeric(12,2);
  v_tier2_threshold numeric(12,2);
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  -- 1. Lock the auction state to prevent race conditions
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction state not found for id %', p_auction_id;
  end if;

  -- 2. Validate active player
  if v_state.current_player_id is null then
    raise exception 'No active player for this auction';
  end if;

  -- 3. Get auction settings and status
  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if v_auction.status != 'live' then
    raise exception 'Auction is not in live status';
  end if;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;

  if v_base_price is null then
    raise exception 'Base price not configured for auction';
  end if;

  -- 4. Compute dynamic increment
  v_active_bid := coalesce(v_state.current_bid, v_base_price);

  -- Read tier configuration from settings (falls back to legacy 'increment' if tiers not set)
  v_tier1_threshold := (v_auction.settings ->> 'tier1_threshold')::numeric;
  v_tier2_threshold := (v_auction.settings ->> 'tier2_threshold')::numeric;

  if v_tier1_threshold is not null and v_tier2_threshold is not null then
    -- Dynamic tier-based increments
    if v_active_bid < v_tier1_threshold then
      v_dynamic_incr := (v_auction.settings ->> 'tier1_increment')::numeric;
    elsif v_active_bid < v_tier2_threshold then
      v_dynamic_incr := (v_auction.settings ->> 'tier2_increment')::numeric;
    else
      v_dynamic_incr := (v_auction.settings ->> 'tier3_increment')::numeric;
    end if;

    if v_dynamic_incr is null or v_dynamic_incr <= 0 then
      raise exception 'Invalid increment configuration for current bid tier';
    end if;
  else
    -- Legacy fallback: static increment
    v_dynamic_incr := (v_auction.settings ->> 'increment')::numeric;
    if v_dynamic_incr is null then
      raise exception 'Increment not configured for auction';
    end if;
  end if;

  -- 5. Validate team and leading status
  if v_state.leading_team_id = p_team_id then
    raise exception 'Team is already leading the bid';
  end if;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team not found or does not belong to this auction';
  end if;

  -- 6. Validate bid amount
  if v_state.leading_team_id is null then
    -- First bid: must be at least base price
    if p_next_bid < v_base_price then
      raise exception 'First bid must be at least base price (%)', v_base_price;
    end if;
    -- First bid must equal base_price or base_price + N*increment
    if (p_next_bid - v_base_price) % v_dynamic_incr != 0 then
      raise exception 'Initial bid must be in increments of % above base price', v_dynamic_incr;
    end if;
  else
    -- Subsequent bids
    if p_next_bid <= coalesce(v_state.current_bid, 0) then
      raise exception 'Bid amount must be higher than current bid (%)', coalesce(v_state.current_bid, 0);
    end if;
    if (p_next_bid - coalesce(v_state.current_bid, 0)) != v_dynamic_incr then
      raise exception 'Bid must increment by exactly % (dynamic tier increment)', v_dynamic_incr;
    end if;
  end if;

  -- 7. Purse and Slot checks
  if v_team.purse_remaining < p_next_bid then
    raise exception 'Insufficient purse remaining';
  end if;

  if v_team.slots_remaining <= 0 then
    raise exception 'No slots remaining';
  end if;

  -- 8. Minimum squad constraint
  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_next_bid) < v_required_money then
    raise exception 'Insufficient funds to maintain minimum squad requirement';
  end if;

  -- 9. Atomic update
  update public.auction_state
     set previous_bid = current_bid,
         previous_leading_team_id = leading_team_id,
         current_bid = p_next_bid,
         leading_team_id = p_team_id,
         show_undo_notice = false
   where auction_id = p_auction_id
   returning * into v_state;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0036_admin_authorization_checks.sql
````sql
-- 0032_admin_authorization_checks.sql
-- Add authorization checks to all admin-only RPC functions

-- 1. Fix next_player - add admin check
create or replace function public.next_player(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player_id uuid;
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

  if v_state.phase = 'captain_round' or v_state.phase = 'phase1' or v_state.phase = 'idle' or (v_state.phase::text like 'completed%' and not exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming'
    order by random()
    limit 1;

    if not found then
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

    update public.auction_state
       set phase = 'phase1'::public.auction_phase
     where id = v_state.id;

  elsif v_state.phase = 'phase_2_hype' or v_state.phase = 'phase2' or (v_state.phase::text like 'completed%' and exists (select 1 from public.players where status = 'upcoming_phase2' and auction_id = p_auction_id)) then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'upcoming_phase2'
    order by random()
    limit 1;

    if not found then
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

    update public.auction_state
       set phase = 'phase2'::public.auction_phase
     where id = v_state.id;
  end if;

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

  return v_state;
end;
$$;

-- 2. Fix start_bid - add admin check
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
  -- Authorization check: only admins can call this function
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can start bidding';
  end if;

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
         phase = (case when v_state.phase::text in ('phase1', 'idle', 'captain_round') then 'phase1' else 'phase2' end)::public.auction_phase,
         show_undo_notice = false
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- 3. Fix end_bid - add admin check
create or replace function public.end_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player public.players;
begin
  -- Authorization check: only admins can call this function
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can end bidding';
  end if;

  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No active player for auction %', p_auction_id;
  end if;

  select * into v_player from public.players where id = v_state.current_player_id for update;

  if v_state.leading_team_id is not null then
    -- SOLD
    update public.players
       set status = 'sold'::public.player_status,
           sold_price = v_state.current_bid,
           sold_team_id = v_state.leading_team_id
     where id = v_state.current_player_id;

    update public.teams
       set purse_remaining = purse_remaining - v_state.current_bid,
           slots_remaining = slots_remaining - 1
     where id = v_state.leading_team_id;

    update public.auction_state
       set phase = 'completed_sale'::public.auction_phase,
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  else
    -- UNSOLD
    update public.players
       set status = (case when v_state.phase::text = 'phase2' then 'unsold_final' else 'unsold' end)::public.player_status
     where id = v_state.current_player_id;

    update public.auction_state
       set phase = 'completed_unsold'::public.auction_phase,
           show_undo_notice = false
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;

-- 4. Fix undo_sale - add admin check
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
  -- Authorization check: only admins can call this function
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Only admins can undo sales';
  end if;

  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'No auction context available.';
  end if;

  if v_state.phase::text not in ('phase1', 'phase2', 'completed_sale', 'completed_unsold') then
    raise exception 'Undo Sale is not permitted in the current phase.';
  end if;

  if (v_state.phase::text = 'phase1' or v_state.phase::text = 'phase2') and v_state.current_bid is not null then
    raise exception 'Undo Sale is not permitted after a new bid has started.';
  end if;

  if v_state.phase::text like 'completed%' then
    v_target_player_id := v_state.current_player_id;
  else
    v_target_player_id := v_state.previous_player_id;
  end if;

  if v_target_player_id is null then
    raise exception 'No sold player context available for undo.';
  end if;

  select * into v_player from public.players where id = v_target_player_id for update;

  -- Restore Purse/Slots if it was sold
  if v_player.status = 'sold' then
    update public.teams
       set purse_remaining = purse_remaining + v_player.sold_price,
           slots_remaining = slots_remaining + 1
     where id = v_player.sold_team_id;
  end if;

  -- Restore player to LIVE
  update public.players
     set status = 'live'::public.player_status,
         sold_price = null,
         sold_team_id = null
   where id = v_target_player_id;

  if v_state.phase::text like 'completed%' then
    -- SCENARIO A: Undoing during the 3.5s window
    update public.auction_state
       set phase = (case when v_state.phase::text in ('completed_unsold', 'completed_sale') then 
                      (case when exists(select 1 from public.players where status = 'upcoming_phase2' and auction_id=p_auction_id) then 'phase2' else 'phase1' end)
                    else 'phase1' end)::public.auction_phase,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           current_player_id = v_target_player_id, 
           previous_player_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;

  else
    -- SCENARIO B: Undoing AFTER next_player has been drawn
    -- If a new player was drawn, move them back to upcoming
    if v_state.current_player_id is not null then
      update public.players
         set status = (case when v_state.phase::text = 'phase2' then 'upcoming_phase2' else 'upcoming' end)::public.player_status
       where id = v_state.current_player_id;
    end if;

    update public.auction_state
       set current_player_id = v_target_player_id,
           previous_player_id = null,
           current_bid = null,
           leading_team_id = null,
           previous_bid = null,
           previous_leading_team_id = null,
           show_undo_notice = true
     where id = v_state.id
     returning * into v_state;
  end if;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0037_add_is_blind_bid.sql
````sql
-- Add is_blind_bid to players table to easily identify blind bid players
-- even after they have been sold and their status changes from 'blind_reserved' to 'sold'.

ALTER TABLE players ADD COLUMN IF NOT EXISTS is_blind_bid BOOLEAN DEFAULT FALSE;

-- Update existing blind_reserved players to true for data integrity
UPDATE players SET is_blind_bid = TRUE WHERE status = 'blind_reserved';
````

## File: supabase/migrations/0038_fix_next_player.sql
````sql
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
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules", "supabase"]
}
````
