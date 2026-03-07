"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  useAuctionState,
  Auction,
  Team,
  Player,
  AuctionState,
  AuctionSettings
} from "@/lib/hooks/useAuctionState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ConsolidatedTeamRoster from "@/components/ConsolidatedTeamRoster";

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

  const [captainBids, setCaptainBids] = useState<Record<string, { captainId: string; amount: string }>>({});

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
        .single();

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

  if (checkingAuth) {
    return <div className="p-6 text-lg text-slate-50">Checking admin access...</div>;
  }

  if (!isAuthed) {
    return null;
  }

  if (!auction) {
    return <div className="p-6 text-lg">Loading auction...</div>;
  }

  if (auction.status === "completed") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-100">{auction.name} - Results</h1>
            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-emerald-500/20">Auction Completed</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 hover:bg-slate-800 text-slate-300 gap-2"
            onClick={() => router.push(`/admin`)}
          >
            ← Return to Dashboard
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <ConsolidatedTeamRoster auction={auction} teams={teams} players={players} />
        </div>
      </div>
    );
  }

  const settings = auction.settings;
  const allTeamsHaveCaptain = teams.length > 0 && teams.every((t) => t.captain_id);

  const computeCanBid = (team: Team) => {
    if (!settings) return false;
    if (!state) return false;
    if (!state.current_player_id) return false;
    if (state.leading_team_id === team.id) return false;

    const basePrice = Number(settings.base_price ?? 0);
    const increment = Number(settings.increment ?? 0);
    const currentBid = state.current_bid ?? basePrice;

    // THE FIX: If no leading team, next bid IS the current_bid (base_price).
    // Otherwise, it's current_bid + increment.
    const nextBid = state.leading_team_id === null ? currentBid : currentBid + increment;

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
      const { error } = await supabase.rpc("next_player", { p_auction_id: auctionId });
      if (error) window.alert(`Next player failed: ${error.message}`);
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
    setLoadingAction(`bid_${teamId}`);
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/place-bid`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          auction_id: auctionId,
          team_id: teamId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge Function error:', errorText);
        throw new Error(`Bid failed: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log('Bid successful:', result);

    } catch (err: any) {
      console.error("Bid error:", err.message);
      window.alert(`Bid failed: ${err.message}`);
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

  const handleEndAuction = async () => {
    const invalidTeams = teams.filter(t => (settings.max_players - t.slots_remaining) < settings.min_players);
    if (invalidTeams.length > 0) {
      if (window.confirm(`Some teams have not met the minimum player requirement (${settings.min_players}).\n\nRedirect to the Slot Filling Hub to manually assign unsold players?`)) {
        router.push(`/admin/auction/${auctionId}/verify`);
      }
      return;
    }

    const upcomingCount = players.filter(p => p.status === "upcoming").length;
    const unsoldCount = players.filter(p => p.status === "unsold").length;
    const totalRemaining = upcomingCount + unsoldCount;
    const emptySlots = teams.reduce((sum, team) => sum + team.slots_remaining, 0);

    const message = `Are you sure you want to permanently end this auction?\n\n• Participants left: ${totalRemaining}\n• Total empty team slots: ${emptySlots}\n\nThis action cannot be undone. Admins will be returned to the Admin Home.`;

    if (!window.confirm(message)) return;

    setLoadingAction("end_auction");
    try {
      const { error } = await supabase.rpc("end_auction", { p_auction_id: auctionId });
      if (error) {
        window.alert("Failed to end auction: " + error.message);
      } else {
        router.push("/admin");
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleCaptain = async (playerId: string, currentVal: boolean) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, is_captain: !currentVal } : p));
    const { error } = await supabase.from("players").update({ is_captain: !currentVal }).eq("id", playerId);
    if (error) {
      console.error("Failed to toggle captain:", error);
      alert("Failed to toggle captain: " + error.message);
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, is_captain: currentVal } : p));
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
    if (!bidInfo || !bidInfo.captainId || !bidInfo.amount) return;

    setLoadingAction(`match_${teamId}`);
    try {
      const { error } = await supabase.rpc("match_captain_blind_bid", {
        p_auction_id: auctionId,
        p_team_id: teamId,
        p_player_id: bidInfo.captainId,
        p_price: Number(bidInfo.amount)
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

  if (!allTeamsHaveCaptain && state?.phase !== "captain_round") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Captain Selection Phase</h1>
              <p className="text-sm text-slate-400">
                {auction.name} · {auction.sport_type.toUpperCase()}
              </p>
              <p className="mt-1 text-xs text-amber-300">
                You must mark exactly {teams.length} players as Captains before proceeding to the Live Hype reveal.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={handleStartCaptainRound}
                disabled={selectedCaptains.length !== teams.length || loadingAction === "start_captain_round"}
              >
                {loadingAction === "start_captain_round" ? "Starting..." : "Start Captain Reveal Hype"}
              </Button>
            </div>
          </header>

          <Card className="border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
                Select Captains ({selectedCaptains.length} / {teams.length})
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[600px] overflow-y-auto pr-2 pb-2">
              {players.filter(p => p.status === "upcoming").map(p => (
                <Button
                  key={p.id}
                  variant={p.is_captain ? "default" : "outline"}
                  size="sm"
                  className={`h-auto flex flex-col w-full items-start justify-start p-3 ${p.is_captain ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500' : 'border-slate-700 bg-slate-900/50 text-slate-300'}`}
                  onClick={() => handleToggleCaptain(p.id, !!p.is_captain)}
                >
                  <span className="font-semibold text-left">{p.name}</span>
                  <span className="text-[10px] uppercase opacity-70 mt-1 break-words line-clamp-1 text-left">{p.role}</span>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!allTeamsHaveCaptain && state?.phase === "captain_round") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-emerald-400 tracking-tight">Captain Blind Bidding Setup</h1>
              <p className="text-sm text-slate-400 mt-1">The Live Screen is currently portraying the Blind Bidding animation. Match captains to proceed.</p>
            </div>
          </header>

          <Card className="border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/50">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
              Match Captains to Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => {
                if (team.captain_id) {
                  const c = players.find(p => p.id === team.captain_id);
                  return (
                    <div key={`matched-${team.id}`} className="rounded-lg border border-emerald-800/50 bg-emerald-950/20 p-4">
                      <div className="font-semibold text-emerald-400">✓ {team.name}</div>
                      <div className="text-sm text-slate-300 mt-2">Captain: <span className="text-white font-medium">{c?.name}</span></div>
                      <div className="text-xs text-slate-400 mt-1">Bid Amount: {c?.sold_price?.toLocaleString("en-IN")}</div>
                    </div>
                  );
                }

                return (
                  <div key={`unmatched-${team.id}`} className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 space-y-3">
                    <div className="font-semibold">{team.name}</div>
                    <div className="text-xs text-slate-400">Purse: {team.purse_remaining.toLocaleString("en-IN")}</div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400">Select Captain</Label>
                      <select
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm outline-none focus:border-amber-500"
                        value={captainBids[team.id]?.captainId || ""}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCaptainBids(prev => ({ ...prev, [team.id]: { ...prev[team.id], captainId: e.target.value, amount: prev[team.id]?.amount || '' } }))}
                      >
                        <option value="">-- Choose --</option>
                        {unassignedCaptains.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400">Winning Blind Bid</Label>
                      <Input
                        type="number"
                        className="bg-slate-950 h-8 text-sm"
                        placeholder={`Min: ${auction.settings.captain_base_price}`}
                        value={captainBids[team.id]?.amount || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaptainBids(prev => ({ ...prev, [team.id]: { ...prev[team.id], amount: e.target.value } }))}
                      />
                    </div>

                    <Button
                      className="w-full mt-2"
                      size="sm"
                      variant="secondary"
                      disabled={!captainBids[team.id]?.captainId || !captainBids[team.id]?.amount || loadingAction === `match_${team.id}`}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col items-center justify-center">
        <div className="text-center space-y-6 bg-slate-900/50 p-10 rounded-2xl border border-slate-800">
          <h2 className="text-3xl font-semibold text-emerald-400 tracking-tight">Captain Matching Complete!</h2>
          <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
            All teams have their captains assigned successfully via Blind Bidding.
            The audience is currently watching the Blind Bidding screen.
            You can now conclude the captain phase and begin the regular player auction.
          </p>
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium" onClick={handleConcludeCaptainPhase} disabled={loadingAction === "conclude_captain_phase"}>
            {loadingAction === "conclude_captain_phase" ? "Transitioning..." : "Conclude Setup & Start Auction"}
          </Button>
        </div>
      </div>
    )
  }

  if (state?.phase === "phase_1_complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="text-center space-y-6 bg-slate-900/50 p-10 rounded-2xl border border-amber-800 shadow-2xl shadow-amber-900/20 max-w-xl">
          <h2 className="text-3xl font-semibold text-amber-500 tracking-tight">Phase 1 Complete!</h2>
          <div className="text-slate-400 leading-relaxed text-sm space-y-2">
            <p>The primary upcoming player pool has been entirely exhausted.</p>
            <p><strong>({players.filter(p => p.status === "unsold").length})</strong> players remain Unsold.</p>
            <p>Click below to transition to Phase 2. This will broadcast an intermission 'Hype' screen to the Audience and begin drawing from the Unsold pool.</p>
          </div>
          <Button size="lg" className="bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-md w-full" onClick={handleStartPhase2Hype} disabled={loadingAction === "start_phase2"}>
            {loadingAction === "start_phase2" ? "Starting..." : "Proceed to Phase 2 (Unsold Players)"}
          </Button>
        </div>
      </div>
    )
  }
  if (state?.phase === "phase_2_complete") {
    const finalUnsolds = players.filter(p => p.status === "unsold").length;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="text-center space-y-6 bg-slate-900/50 p-10 rounded-2xl border border-rose-800 shadow-2xl shadow-rose-900/20 max-w-xl">
          <h2 className="text-3xl font-semibold text-rose-500 tracking-tight">Phase 2 Complete!</h2>
          <div className="text-slate-400 leading-relaxed text-sm space-y-2">
            <p>The entire player pool (including Unsold redraws) has been exhausted.</p>
            <p><strong>({finalUnsolds})</strong> players remain Unsold after Phase 2.</p>
            <p>You can now permanently End the Auction if minimum player requirements are met.</p>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-500 text-white font-medium w-full" onClick={handleEndAuction} disabled={loadingAction === "end_auction"}>
              {loadingAction === "end_auction" ? "Ending..." : "End Auction"}
            </Button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Auction Control</h1>
            <p className="text-sm text-slate-400">
              {auction.name} · {auction.sport_type.toUpperCase()}
            </p>
            {!allTeamsHaveCaptain && (
              <p className="mt-1 text-xs text-amber-300">
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
              disabled={loadingAction === "end_bid" || !state?.current_player_id || state?.phase?.startsWith("completed")}
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
            <div className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 shadow-2xl shadow-amber-900/20 ring-1 ring-amber-500/20">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xl font-black shadow-lg">!</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-400">SALE REVERSED</h3>
                <p className="text-sm text-amber-200/80 leading-snug">The previous transaction was undone. The player has been restored. You can now start the bidding again.</p>
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
          <Card className="border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/50">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
              Current Player
            </h2>
            {currentPlayer ? (
              <div className="space-y-2">
                <div className="text-xl font-semibold">{currentPlayer.name}</div>
                <div className="text-sm text-slate-400">{currentPlayer.role}</div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-slate-900/80 px-3 py-2">
                    <div className="text-xs uppercase text-slate-400">Base Price</div>
                    <div className="text-lg font-semibold">
                      {settings.base_price.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="rounded-md bg-slate-900/80 px-3 py-2">
                    <div className="text-xs uppercase text-slate-400">Increment</div>
                    <div className="text-lg font-semibold">
                      +{settings.increment.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="rounded-md bg-emerald-900/40 px-3 py-2">
                    <div className="text-xs uppercase text-emerald-300">Current Bid</div>
                    {(state?.current_bid ?? settings.base_price).toLocaleString("en-IN")}
                  </div>
                  <div className="rounded-md bg-slate-900/80 px-3 py-2">
                    <div className="text-xs uppercase text-slate-400">Leading Team</div>
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
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                No player selected. Use &quot;Next Player&quot; to draw one.
              </div>
            )}
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/50">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
              Teams · Bid Controls
            </h2>

            {state?.current_bid === null ? (
              <div className="flex h-32 items-center justify-center text-sm text-slate-500 rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
                Click "Start Bid" to unlock team controls for the current player.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {teams.map((team) => {
                  const canBid = computeCanBid(team);
                  const isLeading = state?.leading_team_id === team.id;
                  const isLoading = loadingAction === `bid_${team.id}`;

                  return (
                    <Button
                      key={team.id}
                      className={`flex h-auto flex-col items-start justify-between gap-1 rounded-xl border px-3 py-3 text-left text-sm shadow-sm transition ${isLeading ? 'border-emerald-500 bg-emerald-950/30' : 'border-slate-800 bg-slate-900/80 hover:border-emerald-500 hover:bg-slate-900'}`}
                      disabled={!canBid || isLoading || isLeading}
                      onClick={() => handlePlaceBid(team.id)}
                    >
                      <span className="font-semibold flex items-center gap-2">
                        {team.name}
                        {isLeading && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                      </span>
                      <span className="text-[11px] uppercase tracking-wide text-slate-400">
                        {team.manager}
                      </span>
                      <span className="mt-1 text-xs text-slate-300">
                        Purse:{" "}
                        <span className="font-semibold">
                          {team.purse_remaining.toLocaleString("en-IN")}
                        </span>
                      </span>
                      <span className="text-xs text-slate-300">
                        Slots: <span className="font-semibold">{team.slots_remaining}</span>
                      </span>
                      {!canBid && !isLeading && (
                        <span className="mt-1 text-[10px] font-medium uppercase text-amber-300">
                          Cannot Bid
                        </span>
                      )}
                      {isLeading && (
                        <span className="mt-1 text-[10px] font-medium uppercase text-emerald-400">
                          Current Highest
                        </span>
                      )}
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
