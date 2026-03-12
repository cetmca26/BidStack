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
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full max-w-screen-2xl"
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
      className="flex justify-center shrink-0 w-[140px] sm:w-[180px] lg:w-[220px]"
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
