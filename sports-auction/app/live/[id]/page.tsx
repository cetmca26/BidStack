"use client";

import { use, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

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
  status: "upcoming" | "live" | "completed";
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

export default function LiveAuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: auctionId } = use(params);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [state, setState] = useState<AuctionState | null>(null);

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

      setAuction(auctionData as Auction);
      setTeams((teamsData ?? []) as Team[]);
      setPlayers((playersData ?? []) as Player[]);
      if (stateData) setState(stateData as AuctionState);
    };

    loadInitial();
  }, [auctionId]);

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

  if (!auction) {
    return <div className="p-6 text-lg text-slate-50">Loading live auction...</div>;
  }

  if (auction.status !== "live") {
    return (
      <div className="p-6 text-lg text-slate-50">
        This auction is not live yet. Please wait for the administrator to start the auction.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-50">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[3fr,2fr]">
        <Card className="relative flex h-[340px] items-center justify-center overflow-hidden border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%)]" />
          <div className="relative z-10 flex w-full flex-col items-center justify-center text-center">
            {state?.phase === "captain_round" ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key="captain_round"
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
                  className="w-full flex flex-col items-center justify-center p-4"
                >
                  <div className="mb-6 text-sm font-black uppercase tracking-[0.4em] text-amber-500 drop-shadow-lg animate-pulse">
                    🌟 Blind Bidding in Progress 🌟
                  </div>
                  <div className="text-2xl font-black tracking-tighter text-slate-50 md:text-4xl drop-shadow-xl bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-8">
                    Revealing Franchise Captains
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full px-2 max-w-4xl mx-auto">
                    {players.filter(p => p.is_captain).map((captain, i) => {
                      const matchedTeam = teams.find(t => t.id === captain.sold_team_id);
                      return (
                        <motion.div
                          key={captain.id}
                          initial={{ opacity: 0, scale: 0.5, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: i * 0.15 + 0.3, type: "spring" }}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center shadow-lg transition-colors ${matchedTeam ? 'border-emerald-500/50 bg-emerald-950/40 shadow-emerald-900/20' : 'border-amber-500/30 bg-amber-950/20 shadow-amber-900/10'}`}
                        >
                          <div className="font-bold text-lg text-slate-100">{captain.name}</div>
                          <div className="text-[10px] uppercase text-slate-400 tracking-wider mt-1">{captain.role}</div>
                          {matchedTeam && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 text-xs bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded-md w-full truncate border border-emerald-500/30"
                            >
                              {matchedTeam.name}
                            </motion.div>
                          )}
                          {!matchedTeam && (
                            <div className="mt-3 text-xs text-amber-500/50 font-medium italic animate-pulse">
                              Awaiting Match...
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : state?.phase?.startsWith("completed") ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`completed-${state.phase}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center space-y-4 w-full"
                >
                  <div className={`text-5xl font-black uppercase tracking-[0.2em] md:text-7xl ${state.phase === "completed_sale" ? "text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "text-slate-600 drop-shadow-md"}`}>
                    {state.phase === "completed_sale" ? "SOLD!" : "UNSOLD!"}
                  </div>
                  {state.phase === "completed_sale" && currentPlayer && (
                    <div className="text-xl text-emerald-200 font-medium tracking-wider">
                      To {leadingTeam ? leadingTeam.name : "Unknown"}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300/90">
                  Live Player
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPlayer?.id ?? "empty"}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.96 }}
                    transition={{ duration: 0.35 }}
                    className="w-full"
                  >
                    {currentPlayer ? (
                      <>
                        <div className="text-3xl font-semibold tracking-tight md:text-4xl">
                          {currentPlayer.name}
                        </div>
                        <div className="mt-1 text-sm uppercase tracking-[0.25em] text-emerald-200/90">
                          {currentPlayer.role}
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4 text-left text-sm md:grid-cols-4">
                          <div className="rounded-lg bg-slate-900/80 px-3 py-2">
                            <div className="text-[10px] uppercase text-slate-400">Base Price</div>
                            <div className="text-lg font-semibold">
                              {auction.settings.base_price.toLocaleString("en-IN")}
                            </div>
                          </div>
                          <div className="rounded-lg bg-slate-900/80 px-3 py-2">
                            <div className="text-[10px] uppercase text-slate-400">Increment</div>
                            <div className="text-lg font-semibold">
                              +{auction.settings.increment.toLocaleString("en-IN")}
                            </div>
                          </div>
                          <motion.div
                            key={state?.current_bid ?? "no-bid"}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.25 }}
                            className="rounded-lg bg-emerald-900/60 px-3 py-2"
                          >
                            <div className="text-[10px] uppercase text-emerald-200">Current Bid</div>
                            <div className="text-xl font-semibold text-emerald-100">
                              {(state?.current_bid ?? auction.settings.base_price).toLocaleString(
                                "en-IN",
                              )}
                            </div>
                          </motion.div>
                          <div className="rounded-lg bg-slate-900/80 px-3 py-2">
                            <div className="text-[10px] uppercase text-slate-400">Leading Team</div>
                            <div className="text-lg font-semibold truncate">
                              {leadingTeam ? leadingTeam.name : "—"}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-400">
                        Waiting for the next player to be drawn...
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Live Ticker
                </div>
                <div className="text-sm text-slate-300">
                  {currentPlayer ? currentPlayer.name : "No active player"}
                </div>
              </div>
              <motion.div
                key={state?.current_bid ?? "ticker"}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="rounded-full bg-emerald-600/90 px-4 py-1 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-500/40"
              >
                ₹
                {(state?.current_bid ?? auction.settings.base_price).toLocaleString("en-IN")} ·{" "}
                {leadingTeam ? leadingTeam.name : "No bids yet"}
              </motion.div>
            </div>
          </Card>

          <Card className="flex-1 overflow-hidden border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Teams · Leaderboard
            </div>
            <div className="grid max-h-[260px] grid-cols-1 gap-3 overflow-y-auto text-sm md:grid-cols-2">
              {teams
                .slice()
                .sort((a, b) => b.purse_remaining - a.purse_remaining)
                .map((team) => {
                  const teamPlayers = players.filter(p => p.sold_team_id === team.id);
                  return (
                    <div
                      key={team.id}
                      className="flex flex-col overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/60 shadow-sm transition-colors hover:border-slate-700"
                    >
                      <div className="flex flex-col items-start justify-between gap-2 border-b border-transparent px-3 py-2 sm:flex-row sm:items-center">
                        <div className="w-full sm:w-auto">
                          <div className="truncate text-sm font-semibold">{team.name}</div>
                          <div className="truncate text-[11px] uppercase tracking-wide text-slate-400">
                            {team.manager}
                          </div>
                        </div>
                        <div className="flex w-full justify-between text-right text-[11px] text-slate-300 sm:w-auto sm:flex-col sm:justify-center">
                          <div>
                            Purse:{" "}
                            <span className="font-semibold text-emerald-400">
                              {team.purse_remaining.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div>
                            Slots: <span className="font-semibold">{team.slots_remaining}</span>
                          </div>
                        </div>
                      </div>

                      {/* Team Output Roster */}
                      {teamPlayers.length > 0 && (
                        <div className="border-t border-slate-800/50 bg-slate-900/30 px-3 py-2">
                          <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                            Roster ({teamPlayers.length})
                          </div>
                          <div className="flex max-h-[80px] flex-col gap-1 overflow-y-auto pr-1">
                            {teamPlayers.map(p => (
                              <div key={p.id} className="flex justify-between text-[10px]">
                                <span className="truncate pr-2 text-slate-300">
                                  {p.id === team.captain_id && <span className="mr-1 text-amber-500">ⓒ</span>}
                                  {p.name}
                                </span>
                                <span className="font-mono text-slate-400">
                                  {p.sold_price?.toLocaleString("en-IN") || "-"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      </div >
    </div >
  );
}

