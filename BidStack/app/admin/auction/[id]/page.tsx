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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-2 pb-2">
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
