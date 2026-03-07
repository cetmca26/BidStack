"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Team, Player, useAuctionState } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import { LiveSidebar } from "@/components/live/LiveSidebar";
import { TeamFormation } from "@/components/live/TeamFormation";
import { BiddingPIP } from "@/components/live/BiddingPIP";
import { SaleFeedback } from "@/components/live/SaleFeedback";
import { Gavel, LayoutDashboard, Menu, X } from "lucide-react";

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
    loading,
  } = useAuctionState(auctionId);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showSoldAnimation, setShowSoldAnimation] = useState(false);
  const [lastSoldPlayer, setLastSoldPlayer] = useState<any>(null);
  const [lastSoldTeam, setLastSoldTeam] = useState<any>(null);
  const [lastSoldPrice, setLastSoldPrice] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPlayerRepository, setShowPlayerRepository] = useState(false);
  const getPlayerRepositoryCount = useMemo(() => {
    if (typeof window === "undefined") return players.length;
    const width = window.innerWidth;
    if (width < 640) return Math.min(4, players.length);
    if (width < 1024) return Math.min(8, players.length);
    if (width < 1280) return Math.min(12, players.length);
    return Math.min(20, players.length);
  }, [players.length]);
  useEffect(() => {
    if (state?.phase === "completed_sale") {
      const soldPlayer = players.find((p) => p.id === state.current_player_id);
      const soldTeam = teams.find((t) => t.id === state.leading_team_id);
      if (soldPlayer && soldTeam) {
        setLastSoldPlayer(soldPlayer);
        setLastSoldTeam(soldTeam);
        setLastSoldPrice(state.current_bid || 0);
        setShowSoldAnimation(true);
        const timer = setTimeout(() => {
          setShowSoldAnimation(false);
        }, 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [
    state?.phase,
    state?.current_player_id,
    state?.leading_team_id,
    state?.current_bid,
    players,
    teams,
  ]);
  if (loading || !auction) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="mt-4 text-emerald-500 font-black uppercase tracking-widest text-xs">
          Initialising Arena...
        </div>
      </div>
    );
  }
  if (auction.status === "completed") {
    router.replace(`/live/${auctionId}/recap`);
    return null;
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>
      <nav className="relative z-50 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-[60px]">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-0 flex-1">
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
              onClick={() => setSelectedTeam(null)}
            >
              <div className="h-8 sm:h-10 w-8 sm:w-10 bg-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform flex-shrink-0">
                <Gavel className="text-slate-950" size={16} strokeWidth={3} />
              </div>
              <div className="hidden md:block min-w-0">
                <h1 className="text-base md:text-lg lg:text-xl font-black italic tracking-tighter uppercase text-white leading-none truncate">
                  {auction.name}
                </h1>
                <div className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] md:tracking-[0.3em] mt-0.5">
                  Live Auction
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden h-8 sm:h-10 w-8 sm:w-10 bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center text-slate-400 hover:text-white flex-shrink-0"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      <main className="relative z-10 flex-1 flex overflow-hidden w-full gap-2 sm:gap-3 md:gap-4 lg:gap-6 px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-6">
        <div className="flex-1 flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-6 overflow-hidden min-w-0">
          {selectedTeam ? (
            <div className="flex-1 flex flex-col h-full bg-slate-900/20 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-800/50 p-3 sm:p-4 md:p-6 overflow-hidden">
              <button
                onClick={() => setSelectedTeam(null)}
                className="self-start mb-3 md:mb-6 flex items-center gap-2 text-slate-500 hover:text-emerald-400 font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-colors flex-shrink-0"
              >
                <LayoutDashboard size={12} />
                Back
              </button>
              <div className="flex-1 overflow-auto">
                <TeamFormation
                  team={selectedTeam}
                  players={players}
                  sportType={auction.sport_type}
                />
              </div>
            </div>
          ) : showPlayerRepository ? (
            <div className="flex-1 flex flex-col h-full bg-slate-900/20 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-800/50 p-3 sm:p-4 md:p-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 md:mb-4 flex-shrink-0">
                <button
                  onClick={() => setShowPlayerRepository(false)}
                  className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-colors"
                >
                  <LayoutDashboard size={12} />
                  Back
                </button>
                <div className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] whitespace-nowrap">
                  Showing all players • Scroll to browse
                </div>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: rgba(15, 23, 42, 0.4);
                      border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: rgba(16, 185, 129, 0.4);
                      border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: rgba(16, 185, 129, 0.6);
                    }
                  `}</style>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    {players
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((player) => {
                      const team = teams.find(
                        (t) => t.id === player.sold_team_id,
                      );
                      return (
                        <div
                          key={player.id}
                          className="p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-800 bg-slate-900/40 flex items-center gap-2 sm:gap-3 group hover:border-emerald-500/30 transition-all shadow-lg"
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
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="text-[9px] sm:text-xs font-bold text-white truncate">
                                {player.name}
                              </div>
                              <div className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                                {player.role}
                              </div>
                            </div>
                            {player.status === "sold" ? (
                              team && (
                                <div className="mt-1 flex items-center gap-1 min-w-0">
                                  <TeamLogo
                                    name={team.name}
                                    logoUrl={team.logo_url}
                                    size="sm"
                                  />
                                  <div className="text-[7px] md:text-[8px] font-black text-emerald-400 uppercase truncate">
                                    {team.name}
                                  </div>
                                </div>
                              )
                            ) : (
                              <div
                                className={`mt-1 text-[7px] md:text-[8px] font-black uppercase tracking-widest ${player.status === "live" ? "text-amber-500 animate-pulse" : "text-slate-600"}`}
                              >
                                {player.status}
                              </div>
                            )}
                          </div>
                          {player.status === "sold" && (
                            <div className="text-right flex-shrink-0 text-[8px] sm:text-xs font-mono font-bold text-slate-300">
                              ₹
                              {player.sold_price
                                ? Math.round(player.sold_price / 100000) + "L"
                                : "0"}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative rounded-xl sm:rounded-2xl md:rounded-3xl bg-slate-900/40 border border-slate-800 overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#10b98111,_transparent_60%)] pointer-events-none" />
              <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-12 relative z-10 text-center overflow-y-auto">
                <AnimatePresence mode="wait">
                  {state?.phase === "captain_round" ? (
                    <motion.div
                      key="captain-phase"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center w-full"
                    >
                      <div className="text-center mb-4 md:mb-8 lg:mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter text-amber-500 uppercase mb-2 md:mb-4 animate-pulse">
                          Captain Reveal
                        </h2>
                        <p className="max-w-xs sm:max-w-md mx-auto text-[9px] sm:text-xs md:text-sm text-slate-400 font-medium px-2">
                          Franchises selecting leadership via Blind Bidding...
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full max-w-6xl overflow-y-auto custom-scrollbar pr-2">
                        {players
                          .filter((p) => p.is_captain)
                          .map((captain) => {
                            const matchedTeam = teams.find(
                              (t) => t.captain_id === captain.id,
                            );
                            return (
                              <motion.div
                                key={captain.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl border transition-all duration-500 flex flex-col items-center gap-1 md:gap-2 lg:gap-4 ${matchedTeam ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]" : "bg-slate-900/40 border-slate-800"}`}
                              >
                                <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 z-20">
                                  {matchedTeam ? (
                                    <div className="bg-emerald-500 text-slate-950 text-[7px] sm:text-[8px] font-black px-1.5 sm:px-2 py-px rounded-full shadow-lg animate-bounce">
                                      ✓
                                    </div>
                                  ) : (
                                    <div className="bg-amber-500/20 border border-amber-500/40 text-amber-500 text-[7px] sm:text-[8px] font-black px-1.5 sm:px-2 py-px rounded-full animate-pulse">
                                      ?
                                    </div>
                                  )}
                                </div>
                                <div className="relative">
                                  {matchedTeam && (
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                                  )}
                                  <PlayerAvatar
                                    id={captain.id}
                                    name={captain.name}
                                    role={captain.role}
                                    photoUrl={captain.photo_url}
                                    size="md"
                                    isCaptain={true}
                                  />
                                </div>
                                <div className="text-center">
                                  <h3 className="text-[8px] sm:text-xs md:text-sm lg:text-xl font-black italic text-white uppercase truncate px-1">
                                    {captain.name}
                                  </h3>
                                  <div className="text-[6px] sm:text-[7px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-tighter mt-0.5">
                                    {captain.role}
                                  </div>
                                </div>
                                {matchedTeam ? (
                                  <div className="mt-1 sm:mt-1.5 w-full pt-1 sm:pt-2 border-t border-slate-800/50 flex flex-col items-center gap-0.5 md:gap-1 lg:gap-3">
                                    <div className="flex items-center gap-0.5 sm:gap-1">
                                      <TeamLogo
                                        name={matchedTeam.name}
                                        logoUrl={matchedTeam.logo_url}
                                        size="sm"
                                      />
                                      <div className="text-[7px] sm:text-[8px] md:text-xs lg:text-sm font-black text-white italic uppercase truncate">
                                        {matchedTeam.name}
                                      </div>
                                    </div>
                                    <div className="text-[6px] sm:text-[7px] md:text-[9px] font-mono font-black text-emerald-400">
                                      ₹
                                      {matchedTeam.captain_id
                                        ? Math.round(
                                            captain.sold_price! / 100000,
                                          ) + "L"
                                        : "0"}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-1 flex gap-0.5">
                                    <div className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-amber-500/40 animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-amber-500/40 animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-amber-500/40 animate-bounce" />
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}{" "}
                      </div>
                    </motion.div>
                  ) : currentPlayer ? (
                    <motion.div
                      key={currentPlayer.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.1, y: -20 }}
                      className="flex flex-col items-center w-full max-w-4xl"
                    >
                      <div className="relative mb-2 sm:mb-4 md:mb-6 lg:mb-8">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full scale-150 animate-pulse" />
                        <PlayerAvatar
                          id={currentPlayer.id}
                          name={currentPlayer.name}
                          role={currentPlayer.role}
                          photoUrl={currentPlayer.photo_url}
                          size="xl"
                        />
                      </div>
                      <div className="text-[7px] md:text-[9px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] md:tracking-[0.4em] mb-1 md:mb-2 lg:mb-3">
                        Live Representation
                      </div>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black italic tracking-tighter text-white uppercase truncate max-w-full px-2 drop-shadow-2xl">
                        {currentPlayer.name}
                      </h2>
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 md:gap-3 lg:gap-6 mt-2 sm:mt-3 md:mt-4 flex-wrap justify-center px-2">
                        <span className="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-emerald-200/50 italic uppercase tracking-tight md:tracking-widest">
                          {currentPlayer.role}
                        </span>
                        <div className="h-0.5 w-0.5 md:h-1 md:w-1 rounded-full bg-slate-700 hidden sm:block" />
                        <div className="flex items-center gap-1 md:gap-2 bg-slate-950/80 px-2 md:px-4 py-1 md:py-2 rounded-md md:rounded-xl border border-slate-800">
                          <div className="text-[7px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-tighter md:tracking-widest">
                            Base
                          </div>
                          <div className="text-sm md:text-lg lg:text-xl font-mono font-black text-white">
                            ₹
                            {auction.settings.base_price.toLocaleString(
                              "en-IN",
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-8 lg:mt-12 flex flex-col items-center w-full px-2">
                        <div className="text-[7px] md:text-[9px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] md:tracking-[0.25em] lg:tracking-[0.3em] mb-2 md:mb-3 lg:mb-4">
                          Current Bid
                        </div>
                        <div className="relative w-full max-w-sm">
                          <div className="absolute inset-0 bg-emerald-500/20 blur-[40px] rounded-full animate-bounce" />
                          <div className="relative bg-emerald-500 text-slate-950 px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-3 md:py-4 lg:py-6 rounded-lg sm:rounded-2xl md:rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.4)] border-2 md:border-4 border-white/20">
                            <div className="text-2xl sm:text-3xl md:text-5xl lg:text-8xl font-black font-mono tracking-tighter italic">
                              ₹
                              {(
                                state?.current_bid ||
                                auction.settings.base_price
                              ).toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 md:mt-6 lg:mt-8 flex flex-col items-center gap-0.5 md:gap-1 lg:gap-2">
                          {leadingTeam ? (
                            <>
                              <div className="text-[7px] md:text-[9px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-tighter md:tracking-widest">
                                Held By
                              </div>
                              <div className="text-sm sm:text-base md:text-lg lg:text-2xl font-black text-white italic uppercase flex items-center gap-1 md:gap-2 lg:gap-3">
                                <TeamLogo
                                  name={leadingTeam.name}
                                  logoUrl={leadingTeam.logo_url}
                                  size="sm"
                                />
                                <span className="truncate max-w-xs">
                                  {leadingTeam.name}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-xs sm:text-sm md:text-base lg:text-xl font-black text-slate-600 uppercase italic animate-pulse">
                              Awaiting bids...
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-600 text-center"
                    >
                      <div className="h-12 sm:h-16 md:h-20 lg:h-24 w-12 sm:w-16 md:w-20 lg:w-24 bg-slate-900 rounded-full flex items-center justify-center mb-3 md:mb-4 lg:mb-6 mx-auto border border-slate-800">
                        <Gavel size={24} className="text-slate-700" />
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
              <div className="h-12 sm:h-16 md:h-20 lg:h-24 bg-slate-950 border-t border-slate-800 flex items-center justify-around px-2 sm:px-4 md:px-6 lg:px-12 gap-1 flex-shrink-0 overflow-x-auto">
                <div className="text-center flex-shrink-0">
                  <div className="text-[7px] md:text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-tighter md:tracking-widest">
                    Sold
                  </div>
                  <div className="text-sm md:text-lg lg:text-2xl font-black text-white italic">
                    {players.filter((p) => p.status === "sold").length}
                  </div>
                </div>
                <div className="h-4 sm:h-6 md:h-8 w-[1px] bg-slate-800" />
                <div className="text-center flex-shrink-0">
                  <div className="text-[7px] md:text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-tighter md:tracking-widest">
                    Upcoming
                  </div>
                  <div className="text-sm md:text-lg lg:text-2xl font-black text-white italic">
                    {players.filter((p) => p.status === "upcoming").length}
                  </div>
                </div>
                <div className="h-4 sm:h-6 md:h-8 w-[1px] bg-slate-800" />
                <div className="text-center flex-shrink-0">
                  <div className="text-[7px] md:text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-tighter md:tracking-widest">
                    Total
                  </div>
                  <div className="text-sm md:text-lg lg:text-2xl font-black text-emerald-500 italic">
                    ₹
                    {Math.round(
                      players.reduce((sum, p) => sum + (p.sold_price || 0), 0) /
                        100000,
                    )}
                    L
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          className={`fixed inset-y-0 right-0 z-[60] w-full max-w-[85vw] sm:max-w-xs md:max-w-sm lg:relative lg:block lg:w-auto transform transition-transform duration-500 ease-in-out bg-slate-950 border-l border-slate-800 ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"} overflow-hidden flex flex-col`}
        >
          <div className="flex-1 overflow-y-auto">
            <LiveSidebar
              teams={teams}
              players={players}
              onTeamClick={(team) => {
                setSelectedTeam(team);
                setShowPlayerRepository(false);
                setIsSidebarOpen(false);
              }}
              onExpandPlayers={() => {
                setShowPlayerRepository(true);
                setSelectedTeam(null);
                setIsSidebarOpen(false);
              }}
              maxPlayers={auction.settings.max_players}
            />
          </div>
        </div>
      </main>
      <AnimatePresence>
        {(selectedTeam || showPlayerRepository) && (
          <BiddingPIP
            player={currentPlayer}
            leadingTeam={leadingTeam}
            currentBid={state?.current_bid ?? null}
          />
        )}
      </AnimatePresence>
      <SaleFeedback
        player={lastSoldPlayer}
        team={lastSoldTeam}
        price={lastSoldPrice}
        isVisible={showSoldAnimation}
      />
    </div>
  );
}
