"use client";

import { useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Player } from "@/lib/hooks/useAuctionState";
import { getRolesForSport, getRoleEmoji } from "@/lib/shared/playerUtils";

// ─── Types ──────────────────────────────────────────────────────────
interface TeamFormationProps {
    groupedPlayers: Record<string, Player[]>;
    captain: Player | null;
    sportType: string;
}

// ─── Animation Variants ─────────────────────────────────────────────
const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.9 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 260, damping: 22, delay: i * 0.06 },
    }),
    exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2 } },
};

// ═══════════════════════════════════════════════════════════════════
// PLAYER CARD — shared rectangular photo card
// ═══════════════════════════════════════════════════════════════════
function PlayerCard({
    player,
    isCaptain,
    accentColor,
    size = "normal",
    sportType,
}: {
    player: Player;
    isCaptain: boolean;
    accentColor: "gold" | "emerald" | "rose";
    size?: "normal" | "featured";
    sportType: string;
}) {
    const borderColor =
        isCaptain
            ? "border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.25)]"
            : accentColor === "rose"
                ? "border-rose-500/40"
                : "border-slate-700/60";

    const sizeClasses =
        size === "featured"
            ? "w-32 sm:w-40 md:w-48 !h-auto aspect-square"
            : "w-20 sm:w-24 md:w-32 !h-auto aspect-square";

    return (
        <div className="flex flex-col items-center group">
            {/* Photo Card */}
            <div
                className={`relative ${sizeClasses} rounded-xl overflow-hidden border-2 ${borderColor} bg-slate-900 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}
            >
                {player.photo_url ? (
                    <img
                        src={player.photo_url}
                        alt={player.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <span className="text-2xl font-heading font-bold text-slate-600 uppercase">
                            {player.name.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Single Line Name overlay */}
                <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2 flex flex-col items-center justify-end">
                    <div
                        className={`font-heading font-bold uppercase tracking-tight truncate w-full text-center ${size === "featured"
                            ? "text-sm sm:text-base md:text-lg"
                            : "text-[10px] sm:text-xs md:text-sm"
                            } ${accentColor === "rose"
                                ? "text-rose-400"
                                : isCaptain
                                    ? "text-amber-400"
                                    : "text-white"
                            }`}
                    >
                        {player.name}
                    </div>
                </div>

                {/* Captain badge */}
                {isCaptain && (
                    <div className="absolute top-1.5 right-1.5 bg-amber-500 text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-amber-200 z-10">
                        C
                    </div>
                )}

                {/* Role emoji badge (cricket mode) */}
                {sportType === "cricket" && (
                    <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-sm w-7 h-7 rounded-lg flex items-center justify-center z-10">
                        {getRoleEmoji(player.role)}
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// FOOTBALL MODE — FIFA FIFPro World XI style
// ═══════════════════════════════════════════════════════════════════
function FootballFormation({
    groupedPlayers,
    captain,
}: {
    groupedPlayers: Record<string, Player[]>;
    captain: Player | null;
}) {
    const roles = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
    let playerIndex = 0;

    return (
        <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden">
            {/* Background — dark pitch */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(160deg, #164726ff 0%, #277039ff 40%, #164726ff 100%)",
                }}
            />

            {/* Field markings — faint gold */}
            <svg className="absolute inset-0 w-full h-full opacity-[1] stroke-amber-500/50 text-amber-200/50" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Center line */}
                <line x1="0" y1="50" x2="100" y2="50" strokeWidth="0.3" />
                {/* Center circle */}
                <circle cx="50" cy="50" r="12" fill="none" strokeWidth="0.3" />
                <circle cx="50" cy="50" r="0.8" fill="currentColor" stroke="none" />
                {/* Penalty arcs top */}
                <rect x="25" y="0" width="50" height="16" fill="none" strokeWidth="0.3" />
                <rect x="35" y="0" width="30" height="6" fill="none" strokeWidth="0.3" />
                {/* Penalty arcs bottom */}
                <rect x="25" y="84" width="50" height="16" fill="none" strokeWidth="0.3" />
                <rect x="35" y="94" width="30" height="6" fill="none" strokeWidth="0.3" />
            </svg>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-500/20 rounded-full animate-pulse"
                        style={{
                            top: `${15 + i * 15}%`,
                            left: `${10 + i * 14}%`,
                            animationDelay: `${i * 0.7}s`,
                            animationDuration: `${2 + i * 0.5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

            {/* Formation grid */}
            <div className="relative z-10 h-full flex flex-col justify-around py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8">
                {roles.map((role) => {
                    const playersInRole = groupedPlayers[role] || [];
                    return (
                        <div key={role} className="flex flex-col items-center gap-2 sm:gap-3">
                            {/* Role label */}
                            <div className="text-[8px] sm:text-[9px] font-heading font-bold text-amber-500/30 uppercase tracking-[0.5em]">
                                {role}
                            </div>
                            {/* Player cards row */}
                            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
                                <AnimatePresence mode="popLayout">
                                    {playersInRole.map((player) => {
                                        const idx = playerIndex++;
                                        return (
                                            <motion.div
                                                key={player.id}
                                                custom={idx}
                                                variants={cardVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                layout
                                            >
                                                <PlayerCard
                                                    player={player}
                                                    isCaptain={captain?.id === player.id}
                                                    accentColor="gold"
                                                    sportType="football"
                                                />
                                            </motion.div>
                                        );
                                    })}
                                    {playersInRole.length === 0 && (
                                        <div className="h-28 sm:h-32 w-20 sm:w-24 rounded-xl border border-dashed border-amber-500/10 flex items-center justify-center">
                                            <span className="text-[8px] text-amber-500/15 font-heading uppercase tracking-wider">
                                                Empty
                                            </span>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom label */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-heading font-bold text-amber-500/25 uppercase tracking-[0.4em] z-10">
                ⚽ Formation XI
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// CRICKET MODE — ICC Team of Tournament style
// ═══════════════════════════════════════════════════════════════════
function CricketFormation({
    groupedPlayers,
    captain,
}: {
    groupedPlayers: Record<string, Player[]>;
    captain: Player | null;
}) {
    const roleOrder = [
        { key: "Wicketkeeper", label: "WICKET-KEEPERS" },
        { key: "Batsman", label: "BATTERS" },
        { key: "Allrounder", label: "ALL-ROUNDERS" },
        { key: "Bowler", label: "BOWLERS" },
    ];

    return (
        <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden">

            {/* Background */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(180deg, #6bc96b 0%, #329143ff 40%, #1b5e20ff 100%)",
                }}
            />

            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >

                <defs>

                    {/* Linear grass gradient */}
                    <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#599c51ff" />
                        <stop offset="40%" stopColor="#4eac50ff" />
                        <stop offset="100%" stopColor="#3ea64f" />
                    </linearGradient>

                    {/* Grass mowing stripes */}
                    <pattern
                        id="grassStripes"
                        patternUnits="userSpaceOnUse"
                        width="20"
                        height="100"
                    >
                        <rect width="20" height="100" fill="transparent" />
                        <rect width="10" height="100" fill="white" opacity="0.08" />
                    </pattern>

                </defs>

                {/* Ground */}
                <rect x="0" y="0" width="200" height="100" fill="url(#grassGradient)" />

                {/* Grass stripes overlay */}
                <rect x="0" y="0" width="200" height="100" fill="url(#grassStripes)" />

                Outer Boundary
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="yellow"
                    strokeOpacity="0.35"
                    strokeWidth="0.4"
                />

                {/* Inner Circle (30 yard) */}
                <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="none"
                    stroke="yellow"
                    strokeOpacity="0.35"
                    strokeWidth="0.35"
                />

                {/* Center Pitch */}
                <rect
                    x="47"
                    y="30"
                    width="6"
                    height="40"
                    rx="1"
                    fill="#c9a66b"
                    opacity="0.95"
                />

                {/* Creases */}
                <line
                    x1="45"
                    y1="35"
                    x2="55"
                    y2="35"
                    stroke="white"
                    strokeOpacity="0.5"
                    strokeWidth="0.35"
                />

                <line
                    x1="45"
                    y1="65"
                    x2="55"
                    y2="65"
                    stroke="white"
                    strokeOpacity="0.5"
                    strokeWidth="0.35"
                />

            </svg>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

            {/* Header */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-heading font-bold text-amber-500/40 uppercase tracking-[0.5em] z-10">
                🏏 Squad XI
            </div>

            {/* Formation */}
            <div className="relative z-10 h-full flex flex-col justify-center gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-10 py-10">

                {roleOrder.map((role) => {
                    const players = groupedPlayers[role.key] || [];

                    if (players.length === 0) return null;

                    return (
                        <div key={role.key} className="flex flex-col items-center">

                            {/* Role Title */}
                            <div className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest mb-2">
                                {role.label}
                            </div>

                            {/* Player Row */}
                            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap">
                                <AnimatePresence mode="popLayout">
                                    {players.map((player, idx) => (
                                        <motion.div
                                            key={player.id}
                                            custom={idx}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            layout
                                        >
                                            <PlayerCard
                                                player={player}
                                                isCaptain={captain?.id === player.id}
                                                accentColor="rose"
                                                sportType="cricket"
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT — delegates to football or cricket mode
// ═══════════════════════════════════════════════════════════════════
export function TeamFormation({ groupedPlayers, captain, sportType }: TeamFormationProps) {
    return sportType === "football" ? (
        <FootballFormation groupedPlayers={groupedPlayers} captain={captain} />
    ) : (
        <CricketFormation groupedPlayers={groupedPlayers} captain={captain} />
    );
}
