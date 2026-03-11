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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 w-full">
            {captains.map((captain, index) => {
              const matchedTeam = teams.find((t) => t.captain_id === captain.id);
              const isRevealed = index <= revealedIndex;

              return (
                <motion.div
                  key={captain.id}
                  className="w-full flex justify-center"
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
