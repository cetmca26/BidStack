"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player, Team } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import { formatPrice } from "@/lib/utils";
import { Gavel, TrendingUp, Trophy, XCircle } from "lucide-react";

interface BiddingPIPProps {
    player: Player | null;
    leadingTeam: Team | null;
    currentBid: number | null;
    phase?: "bidding" | "sold" | "unsold";
}

export function BiddingPIP({ player, leadingTeam, currentBid, phase = "bidding" }: BiddingPIPProps) {
    if (!player || currentBid === null) return null;

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className={`fixed top-6 right-6 z-[100] w-64 h-24 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden transition-colors duration-500 
                ${phase === "sold" ? "border-emerald-500 shadow-emerald-500/40" :
                    phase === "unsold" ? "border-rose-500 shadow-rose-500/40" :
                        "border-emerald-500/50 shadow-emerald-900/40"}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br to-transparent transition-colors duration-500
                ${phase === "sold" ? "from-emerald-500/20" :
                    phase === "unsold" ? "from-rose-500/20" :
                        "from-emerald-500/10"}`} />

            <div className="relative h-full p-3 flex items-center gap-3">
                <div className="relative">
                    <PlayerAvatar
                        id={player.id}
                        name={player.name}
                        role={player.role}
                        photoUrl={player.photo_url}
                        size="md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white dark:text-slate-950 p-1 rounded-full shadow-lg">
                        <Gavel size={10} strokeWidth={3} />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {phase === "bidding" && (
                        <>
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                                <TrendingUp size={10} />
                                Live Bid
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white truncate italic uppercase tracking-tighter">
                                {player.name}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <div className="text-lg font-black text-emerald-400 font-mono">
                                    {formatPrice(currentBid)}
                                </div>
                            </div>
                        </>
                    )}

                    {phase === "sold" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="sold-pip">
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                                <Trophy size={10} />
                                Sold To {leadingTeam?.name}
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white truncate italic uppercase tracking-tighter">
                                {player.name}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <div className="text-lg font-black text-emerald-400 font-mono">
                                    {formatPrice(currentBid)}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {phase === "unsold" && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key="unsold-pip" className="flex flex-col justify-center h-full">
                            <div className="text-xl font-black text-rose-500 italic uppercase tracking-tighter">
                                UNSOLD
                            </div>
                            <div className="text-[10px] font-black text-rose-400/80 uppercase tracking-widest mt-1 flex items-center gap-1">
                                <XCircle size={10} />
                                No bids
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Leading Team Bar */}
            {phase === "bidding" && (
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-500 flex items-center px-3">
                    <span className="text-[8px] font-black text-white dark:text-slate-950 uppercase tracking-[0.2em] truncate">
                        {leadingTeam ? `Leading: ${leadingTeam.name}` : "Awaiting Bids"}
                    </span>
                </div>
            )}

            {phase === "sold" && (
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-500 flex items-center px-3" />
            )}

            {phase === "unsold" && (
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="absolute bottom-0 left-0 right-0 h-4 bg-rose-500 flex items-center px-3" />
            )}
        </motion.div>
    );
}
