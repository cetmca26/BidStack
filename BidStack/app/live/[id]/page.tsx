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
import { Gavel, LayoutDashboard, Menu, X, Star, TrendingUp, UserCheck, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LiveAuctionPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Handle "Sold!" animation trigger
  useEffect(() => {
    if (state?.phase === "completed_sale") {
      const soldPlayer = players.find(p => p.id === state.current_player_id);
      const soldTeam = teams.find(t => t.id === state.leading_team_id);

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
  }, [state?.phase, state?.current_player_id, state?.leading_team_id, state?.current_bid, players, teams]);

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
    // Redirect to recap instead of staying on live page
    router.replace(`/live/${auctionId}/recap`);
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      {/* Main Navigation Bar */}
      <nav className="relative z-50 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setSelectedTeam(null)}
            >
              <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform">
                <Gavel className="text-slate-950" size={20} strokeWidth={3} />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">
                  {auction.name}
                </h1>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-0.5">
                  Live Auction Platform
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1 bg-slate-950/50 rounded-full p-1 border border-slate-800">
              <button
                onClick={() => {
                  setSelectedTeam(null);
                  setShowPlayerRepository(false);
                }}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!selectedTeam && !showPlayerRepository
                  ? "bg-emerald-500 text-slate-950 shadow-lg"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                Live Hub
              </button>
              {selectedTeam && (
                <div className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-slate-800 text-white flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {selectedTeam.name}
                </div>
              )}
              {showPlayerRepository && (
                <div className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-slate-800 text-white flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Player Repository
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Current Player Ticker (Desktop) */}
            {currentPlayer && !selectedTeam && !showPlayerRepository && (
              <div className="hidden xl:flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-emerald-500/30">
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ongoing</div>
                <div className="h-1 w-1 rounded-full bg-slate-700" />
                <div className="text-sm font-bold text-white">{currentPlayer.name}</div>
                <div className="h-1 w-1 rounded-full bg-slate-700" />
                <div className="text-sm font-mono font-bold text-emerald-400 italic">
                  ₹{(state?.current_bid || auction.settings.base_price).toLocaleString("en-IN")}
                </div>
              </div>
            )}

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden h-10 w-10 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full p-6 gap-6">
        {/* Left Content Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {selectedTeam ? (
            <div className="flex-1 flex flex-col h-full bg-slate-900/20 rounded-3xl border border-slate-800/50 p-6 overflow-hidden">
              <button
                onClick={() => setSelectedTeam(null)}
                className="self-start mb-6 flex items-center gap-2 text-slate-500 hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest transition-colors"
              >
                <LayoutDashboard size={14} />
                Return to Live View
              </button>
              <TeamFormation
                team={selectedTeam}
                players={players}
                sportType={auction.sport_type}
              />
            </div>
          ) : showPlayerRepository ? (
            <div className="flex-1 flex flex-col h-full bg-slate-900/20 rounded-3xl border border-slate-800/50 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setShowPlayerRepository(false)}
                  className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest transition-colors"
                >
                  <LayoutDashboard size={14} />
                  Return to Live View
                </button>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  Complete Player Repository
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {players.slice().sort((a, b) => a.name.localeCompare(b.name)).map((player) => {
                    const team = teams.find(t => t.id === player.sold_team_id);
                    return (
                      <div
                        key={player.id}
                        className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 flex items-center gap-4 group hover:border-emerald-500/30 transition-all shadow-lg"
                      >
                        <PlayerAvatar
                          id={player.id}
                          name={player.name}
                          role={player.role}
                          photoUrl={player.photo_url}
                          size="md"
                          isCaptain={player.is_captain}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{player.name}</div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{player.role}</div>
                          {player.status === 'sold' && team ? (
                            <div className="mt-2 flex items-center gap-2">
                              <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
                              <div className="text-[10px] font-black text-emerald-400 uppercase truncate">
                                {team.name}
                              </div>
                            </div>
                          ) : (
                            <div className={`mt-2 text-[10px] font-black uppercase tracking-widest ${player.status === 'live' ? 'text-amber-500 animate-pulse' : 'text-slate-600'
                              }`}>
                              {player.status}
                            </div>
                          )}
                        </div>
                        {player.status === 'sold' && (
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-slate-300">
                              ₹{player.sold_price?.toLocaleString("en-IN")}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full gap-6">
              {/* Main Auction Card */}
              <div className="flex-1 relative rounded-3xl bg-slate-900/40 border border-slate-800 overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#10b98111,_transparent_60%)] pointer-events-none" />

                <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10 text-center">
                  <AnimatePresence mode="wait">
                    {state?.phase === 'captain_round' ? (
                      <motion.div
                        key="captain-phase"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center w-full h-full"
                      >
                        <div className="text-center mb-12">
                          <h2 className="text-6xl font-black italic tracking-tighter text-amber-500 uppercase mb-4 animate-pulse">
                            Captain Reveal
                          </h2>
                          <p className="max-w-md mx-auto text-slate-400 font-medium">
                            The franchises are currently selecting their core leadership via Blind Bidding...
                          </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl overflow-y-auto pr-4 custom-scrollbar">
                          {players.filter(p => p.is_captain).map((captain) => {
                            const matchedTeam = teams.find(t => t.captain_id === captain.id);
                            return (
                              <motion.div
                                key={captain.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative p-6 rounded-3xl border transition-all duration-500 flex flex-col items-center gap-4 ${matchedTeam
                                  ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                                  : "bg-slate-900/40 border-slate-800"
                                  }`}
                              >
                                <div className="absolute -top-3 -right-3 z-20">
                                  {matchedTeam ? (
                                    <div className="bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
                                      REVEALED
                                    </div>
                                  ) : (
                                    <div className="bg-amber-500/20 border border-amber-500/40 text-amber-500 text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                                      BIDDING...
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
                                    size="lg"
                                    isCaptain={true}
                                  />
                                </div>

                                <div className="text-center">
                                  <h3 className="text-xl font-black italic text-white uppercase truncate px-2">
                                    {captain.name}
                                  </h3>
                                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                    {captain.role}
                                  </div>
                                </div>

                                <div className="mt-2 w-full pt-4 border-t border-slate-800/50 flex flex-col items-center gap-3">
                                  {matchedTeam ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <TeamLogo name={matchedTeam.name} logoUrl={matchedTeam.logo_url} size="sm" />
                                        <div className="text-sm font-black text-white italic uppercase">
                                          {matchedTeam.name}
                                        </div>
                                      </div>
                                      <div className="text-xs font-mono font-black text-emerald-400">
                                        ₹{captain.sold_price?.toLocaleString("en-IN")}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="h-12 flex flex-col items-center justify-center">
                                      <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 animate-bounce" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : currentPlayer ? (
                      <motion.div
                        key={currentPlayer.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, y: -20 }}
                        className="flex flex-col items-center w-full"
                      >
                        <div className="relative mb-8">
                          <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full scale-150 animate-pulse" />
                          <PlayerAvatar
                            id={currentPlayer.id}
                            name={currentPlayer.name}
                            role={currentPlayer.role}
                            photoUrl={currentPlayer.photo_url}
                            size="xl"
                          />
                        </div>

                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-3">
                          Live Representation
                        </div>
                        <h2 className="text-7xl font-black italic tracking-tighter text-white uppercase italic truncate max-w-4xl px-4 drop-shadow-2xl">
                          {currentPlayer.name}
                        </h2>
                        <div className="flex items-center gap-6 mt-4">
                          <span className="text-2xl font-black text-emerald-200/50 italic uppercase tracking-widest italic">
                            {currentPlayer.role}
                          </span>
                          <div className="h-2 w-2 rounded-full bg-slate-700" />
                          <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base</div>
                            <div className="text-xl font-mono font-black text-white">
                              ₹{auction.settings.base_price.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>

                        {/* Huge Bid Display */}
                        <div className="mt-12 flex flex-col items-center">
                          <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                            Current Highest Bid
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-[40px] rounded-full animate-bounce" />
                            <div className="relative bg-emerald-500 text-slate-950 px-12 py-6 rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.4)] border-4 border-white/20">
                              <div className="text-8xl font-black font-mono tracking-tighter italic">
                                ₹{(state?.current_bid || auction.settings.base_price).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 flex flex-col items-center gap-2">
                            {leadingTeam ? (
                              <>
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Held By</div>
                                <div className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
                                  <TeamLogo name={leadingTeam.name} logoUrl={leadingTeam.logo_url} size="sm" />
                                  {leadingTeam.name}
                                </div>
                              </>
                            ) : (
                              <div className="text-xl font-black text-slate-600 uppercase italic animate-pulse">
                                Waiting for first bid...
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
                        <div className="h-24 w-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 mx-auto border border-slate-800">
                          <Gavel size={40} className="text-slate-700" />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Arena Idle</h3>
                        <p className="text-sm font-medium mt-1">Awaiting next player call from the administrator...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Stats Ticker */}
                <div className="h-24 bg-slate-950 border-t border-slate-800 flex items-center justify-around px-12">
                  <div className="text-center">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Players Sold</div>
                    <div className="text-2xl font-black text-white italic">{players.filter(p => p.status === 'sold').length}</div>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800" />
                  <div className="text-center">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Upcoming Pool</div>
                    <div className="text-2xl font-black text-white italic">{players.filter(p => p.status === 'upcoming').length}</div>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800" />
                  <div className="text-center">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Spent</div>
                    <div className="text-2xl font-black text-emerald-500 italic">
                      ₹{players.reduce((sum, p) => sum + (p.sold_price || 0), 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className={`
          fixed inset-y-0 right-0 z-[60] w-full max-w-md lg:relative lg:block lg:w-[400px] 
          transform transition-transform duration-500 ease-in-out bg-slate-950 
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}>
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
      </main>

      {/* Picture-in-Picture & Overlays */}
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
