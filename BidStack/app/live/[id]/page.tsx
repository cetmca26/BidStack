"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Team, Player, useAuctionState } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import ConsolidatedTeamRoster from "@/components/ConsolidatedTeamRoster";
import { BiddingPIP } from "@/components/live/BiddingPIP";
import { SaleFeedback } from "@/components/live/SaleFeedback";
import { UnsoldFeedback } from "@/components/live/UnsoldFeedback";
import { Gavel, LayoutDashboard, PanelRightClose, PanelRightOpen, PanelRight, Users } from "lucide-react";
import AuctionHero from "@/components/live/AuctionHero";
import CaptainCard from "@/components/live/TempCard";

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
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showSoldAnimation, setShowSoldAnimation] = useState(false);
  const [lastSoldPlayer, setLastSoldPlayer] = useState<any>(null);
  const [lastSoldTeam, setLastSoldTeam] = useState<any>(null);
  const [lastSoldPrice, setLastSoldPrice] = useState<number | null>(null);
  const [showUnsoldAnimation, setShowUnsoldAnimation] = useState(false);
  const [lastUnsoldPlayer, setLastUnsoldPlayer] = useState<any>(null);
  const [showPlayerRepository, setShowPlayerRepository] = useState(false);
  const [isSquadPanelOpen, setIsSquadPanelOpen] = useState(false);

  useEffect(() => {
    // default to open on desktop
    setIsSquadPanelOpen(window.innerWidth >= 1024);
  }, []);
  const soldFeedbackStartTimeRef = useRef<number | null>(null);
  const unsoldFeedbackStartTimeRef = useRef<number | null>(null);

  const currentView = selectedTeam ? "roster" : showPlayerRepository ? "repository" : "auction";

  const pipPhase =
    state?.phase === "completed_sale" || (showSoldAnimation) ? "sold" :
      state?.phase === "completed_unsold" || (showUnsoldAnimation) ? "unsold" :
        "bidding";

  // Use the explicitly captured sold/unsold items if the animation is actively running
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

  const getPlayerRepositoryCount = useMemo(() => {
    if (typeof window === "undefined") return players.length;
    const width = window.innerWidth;
    if (width < 640) return Math.min(4, players.length);
    if (width < 1024) return Math.min(8, players.length);
    if (width < 1280) return Math.min(12, players.length);
    return Math.min(20, players.length);
  }, [players.length]);
  // Handle sold feedback animation - show when phase is completed_sale
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
      // Phase changed away from completed_sale - close animation
      setShowSoldAnimation(false);
      soldFeedbackStartTimeRef.current = null;
    }
  }, [state?.phase, state?.current_player_id, state?.leading_team_id, state?.current_bid, players, teams]);

  // Handle unsold feedback animation - show when phase is completed_unsold
  useEffect(() => {
    if (state?.phase === "completed_unsold") {
      const unsoldPlayer = players.find((p) => p.id === state.current_player_id);
      if (unsoldPlayer) {
        setLastUnsoldPlayer(unsoldPlayer);
        setShowUnsoldAnimation(true);
        unsoldFeedbackStartTimeRef.current = Date.now();
      }
    } else if (showUnsoldAnimation) {
      // Phase changed away from completed_unsold - close animation
      setShowUnsoldAnimation(false);
      unsoldFeedbackStartTimeRef.current = null;
    }
  }, [state?.phase, state?.current_player_id, players]);
  useEffect(() => {
    if (!loading && auction?.status === "completed") {
      router.replace(`/live/${auctionId}/recap`);
    }
  }, [auction?.status, auctionId, loading, router]);
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
  return (
    <div className="h-screen bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>
      <nav className="relative z-50 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl py-fluid-sm flex-shrink-0">
        <div className="container-fluid flex items-center justify-between gap-fluid-md min-h-[50px]">
          <div className="flex items-center gap-fluid-md min-w-0 flex-1">
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
        </div>
      </nav>
      <main className="relative z-10 flex-1 flex flex-col xl:flex-row overflow-y-auto w-full gap-[--spacing-auction-gap] p-[--spacing-auction-pad]">
        <div className={`flex flex-col gap-[--spacing-auction-gap] min-w-0 min-h-[60vh] xl:min-h-0 ${selectedTeam ? 'w-full' : 'flex-1'}`}>
          {selectedTeam ? (
            <div className="flex-1 flex flex-col h-full bg-[var(--color-bg-panel)] rounded-2xl border border-slate-800 relative" data-density="compact">
              <div className="absolute top-4 left-4 z-50">
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-full text-slate-400 hover:text-emerald-400 font-bold text-xs uppercase tracking-widest transition-colors border border-slate-700"
                >
                  <LayoutDashboard size={12} />
                  Back to Auction
                </button>
              </div>
              <div className="flex-1 flex flex-col pt-14 p-2 sm:p-4 overflow-y-auto">
                <ConsolidatedTeamRoster
                  auction={auction as any}
                  teams={teams}
                  players={players}
                />
              </div>
            </div>
          ) : showPlayerRepository ? (
            <div className="flex-1 flex flex-col h-full bg-[var(--color-bg-panel)] rounded-2xl border border-slate-800 p-fluid-md overflow-hidden" data-density="compact">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-fluid-sm mb-fluid-md flex-shrink-0">
                <button
                  onClick={() => setShowPlayerRepository(false)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-400 font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  <LayoutDashboard size={10} />
                  Back
                </button>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  Showing all players • Scroll to browse
                </div>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
                            className="p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-800 bg-[var(--color-bg-card)] flex items-center gap-2 sm:gap-3 group hover:border-emerald-500/30 transition-all shadow-lg"
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
                                ₹{player.sold_price?.toLocaleString("en-IN")}
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
            <div className="flex-1 relative rounded-2xl bg-[var(--color-bg-panel)] border border-slate-800 overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#10b98111,_transparent_60%)] pointer-events-none" />
              <div className={`flex-1 flex flex-col items-center justify-center relative z-10 text-center ${state?.phase === 'captain_round' ? 'overflow-y-auto overflow-x-hidden p-2 sm:p-4 md:p-6 lg:p-8' : 'overflow-y-auto p-fluid-lg'}`}>
                <AnimatePresence mode="wait">
                  {state?.phase === "captain_round" ? (
                    <motion.section
                      key="captain-phase"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="w-full min-h-full flex flex-col items-center justify-center py-4"
                    >
                      {/* Header */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-center mb-2 sm:mb-4 md:mb-6 flex-shrink-0 mt-auto"
                      >
                        <h2 className="italic tracking-tighter text-amber-500 uppercase mb-0.5 sm:mb-1 md:mb-2 animate-pulse text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                          Captain Reveal
                        </h2>
                        <p className="max-w-md mx-auto text-[10px] sm:text-xs md:text-sm text-slate-400 font-medium">
                          Franchises selecting leadership via Blind Bidding...
                        </p>
                      </motion.div>

                      {/* Captain Cards Grid — responsive, scrollable */}
                      <div className="w-full flex-1 flex items-center justify-center mb-auto">
                        <div className="
                          grid
                          grid-cols-2
                          sm:grid-cols-3
                          md:grid-cols-4
                          gap-2 sm:gap-4 md:gap-6 lg:gap-8
                          w-full min-h-full
                          auto-rows-fr
                          px-1 sm:px-2 md:px-6 lg:px-12
                        "
                          style={{
                            maxWidth: '1400px',
                          }}
                        >
                          {players
                            .filter((p) => p.is_captain)
                            .map((captain, index) => {
                              const matchedTeam = teams.find((t) => t.captain_id === captain.id);

                              return (
                                <div key={captain.id} className="min-w-0 min-h-0">
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
                              );
                            })}
                        </div>
                      </div>
                    </motion.section>
                  ) : currentPlayer && state?.current_bid !== null ? (
                    <div className="h-full flex flex-col">

                      <div className="flex-1 p-6">

                        <AuctionHero
                          player={currentPlayer}
                          bid={state?.current_bid || auction.settings.base_price}
                          basePrice={auction.settings.base_price}
                          team={leadingTeam}
                        />

                      </div>

                    </div>
                  ) : currentPlayer && state?.current_bid === null ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-600 text-center"
                    >
                      <div className="h-12 sm:h-16 md:h-20 lg:h-24 w-12 sm:w-16 md:w-20 lg:w-24 bg-[var(--color-bg-card)] rounded-full flex items-center justify-center mb-3 md:mb-4 lg:mb-6 mx-auto border border-slate-800 animate-pulse">
                        <Gavel size={24} className="text-amber-500" />
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black italic uppercase tracking-tighter text-amber-400">
                        Ready for Bidding
                      </h3>
                      <p className="text-[8px] sm:text-xs md:text-sm font-medium mt-1 text-amber-300">
                        Awaiting admin to start bidding...
                      </p>
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

        {/* Action Panel for opening Roster selection from Auction View */}
        {!selectedTeam && (
          <div className={`w-full xl:w-[30%] flex-shrink-0 flex-col h-auto xl:h-full min-h-[120px]`}>
            <div className="h-full flex flex-col gap-4">
              <button onClick={() => setSelectedTeam(teams[0] || null)} className="w-full flex-1 rounded-2xl border-2 border-dashed border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex flex-col items-center justify-center text-emerald-500/50 hover:text-emerald-500 group">
                <LayoutDashboard className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black uppercase tracking-widest leading-none">View Squads</span>
              </button>
              <button onClick={() => { setShowPlayerRepository(true); setSelectedTeam(null); }} className="w-full flex-1 rounded-2xl border-2 border-dashed border-sky-500/20 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all flex flex-col items-center justify-center text-sky-500/50 hover:text-sky-500 group">
                <Users className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black uppercase tracking-widest leading-none">Repository</span>
              </button>
            </div>
          </div>
        )}
      </main>
      <AnimatePresence>
        {(selectedTeam || showPlayerRepository) && (
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
