"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  settings: AuctionSettings;
};

type Team = {
  id: string;
  auction_id: string;
  name: string;
  manager: string;
  purse_remaining: number;
  slots_remaining: number;
  captain_id: string | null;
};

type Player = {
  id: string;
  auction_id: string;
  name: string;
  role: string;
  status: "upcoming" | "live" | "sold" | "unsold";
  sold_price: number | null;
  sold_team_id: string | null;
  is_captain?: boolean;
};

type AuctionState = {
  id: string;
  auction_id: string;
  current_player_id: string | null;
  current_bid: number | null;
  leading_team_id: string | null;
  phase: string;
};

export default function AdminAuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: auctionId } = use(params);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [state, setState] = useState<AuctionState | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  const selectedCaptains = useMemo(() => players.filter((p) => p.is_captain), [players]);
  const unassignedCaptains = useMemo(
    () => selectedCaptains.filter((c) => c.status === "upcoming"),
    [selectedCaptains]
  );

  const [captainBids, setCaptainBids] = useState<Record<string, { captainId: string; amount: string }>>({});

  const currentPlayer = useMemo(
    () => players.find((p) => p.id === state?.current_player_id) ?? null,
    [players, state?.current_player_id],
  );

  const leadingTeam = useMemo(
    () => teams.find((t) => t.id === state?.leading_team_id) ?? null,
    [teams, state?.leading_team_id],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const authed = window.localStorage.getItem("admin_auth") === "true";
    if (!authed) {
      router.replace("/admin/login");
    } else {
      setIsAuthed(true);
    }
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (!auctionId) return;
    const loadInitial = async () => {
      const [{ data: auctionData }, { data: teamsData }, { data: playersData }, { data: stateData }] =
        await Promise.all([
          supabase.from("auctions").select("*").eq("id", auctionId).single(),
          supabase.from("teams").select("*").eq("auction_id", auctionId),
          supabase.from("players").select("*").eq("auction_id", auctionId),
          supabase.from("auction_state").select("*").eq("auction_id", auctionId).maybeSingle(),
        ]);
      if (!auctionData) {
        router.push("/");
        return;
      }

      setAuction(auctionData as Auction);
      setTeams((teamsData ?? []) as Team[]);
      setPlayers((playersData ?? []) as Player[]);
      if (stateData) setState(stateData as AuctionState);
    };

    loadInitial();
  }, [auctionId, router]);

  useEffect(() => {
    if (!auctionId) return;
    const channel = supabase
      .channel("auction")
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  if (checkingAuth) {
    return <div className="p-6 text-lg text-slate-50">Checking admin access...</div>;
  }

  if (!isAuthed) {
    return null;
  }

  if (!auction) {
    return <div className="p-6 text-lg">Loading auction...</div>;
  }

  const settings = auction.settings;
  const allTeamsHaveCaptain = teams.length > 0 && teams.every((t) => t.captain_id);

  const computeCanBid = (team: Team) => {
    if (!settings) return false;
    if (!state) return false;
    if (!state.current_player_id) return false;

    const basePrice = Number(settings.base_price ?? 0);
    const increment = Number(settings.increment ?? 0);
    const currentBid = state.current_bid ?? basePrice;
    const nextBid = currentBid + increment;

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
      await supabase.rpc("next_player", { p_auction_id: auctionId });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStartBid = async () => {
    setLoadingAction("start_bid");
    try {
      await supabase.rpc("start_bid", { p_auction_id: auctionId });
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePlaceBid = async (teamId: string) => {
    setLoadingAction(`bid_${teamId}`);
    try {
      await supabase.rpc("place_bid", { p_auction_id: auctionId, p_team_id: teamId });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUndoBid = async () => {
    setLoadingAction("undo_bid");
    try {
      await supabase.rpc("undo_bid", { p_auction_id: auctionId });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEndBid = async () => {
    setLoadingAction("end_bid");
    try {
      await supabase.rpc("end_bid", { p_auction_id: auctionId });
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

  const handleAutoAllocate = async () => {
    if (!window.confirm("Are you sure you want to automatically distribute all remaining unsold players for base price?")) return;
    setLoadingAction("auto_allocate");
    try {
      const { error } = await supabase.rpc("auto_allocate_unsold", { p_auction_id: auctionId });
      if (error) {
        window.alert("Auto-allocation failed: " + error.message);
      } else {
        window.alert("Auto-allocation complete!");
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
      await supabase.from("auction_state").update({ phase: "idle" }).eq("auction_id", auctionId);
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
                )
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
              variant="outline"
              size="sm"
              onClick={handleNextPlayer}
              disabled={loadingAction === "next_player" || !allTeamsHaveCaptain}
            >
              Next Player
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleStartBid}
              disabled={
                loadingAction === "start_bid" || !state?.current_player_id || !allTeamsHaveCaptain
              }
            >
              Start Bid
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUndoBid}
              disabled={loadingAction === "undo_bid"}
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
              disabled={loadingAction === "undo_sale" || !state?.phase?.startsWith("completed")}
            >
              Undo Sale
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-700 text-amber-500 hover:bg-amber-950/50"
              onClick={handleAutoAllocate}
              disabled={loadingAction === "auto_allocate"}
            >
              Auto-Allocate Unsold
            </Button>
          </div>
        </header>

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
                    <div className="text-lg font-semibold text-emerald-200">
                      {(state?.current_bid ?? settings.base_price).toLocaleString("en-IN")}
                    </div>
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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {teams.map((team) => {
                const canBid = computeCanBid(team);
                const isLoading = loadingAction === `bid_${team.id}`;

                return (
                  <Button
                    key={team.id}
                    className="flex h-auto flex-col items-start justify-between gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-left text-sm shadow-sm transition hover:border-emerald-500 hover:bg-slate-900"
                    disabled={!canBid || isLoading}
                    onClick={() => handlePlaceBid(team.id)}
                  >
                    <span className="font-semibold">{team.name}</span>
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
                    {!canBid && (
                      <span className="mt-1 text-[10px] font-medium uppercase text-amber-300">
                        Cannot Bid
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

