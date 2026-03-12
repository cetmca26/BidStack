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
