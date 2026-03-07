"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player, Team } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Gavel, TrendingUp } from "lucide-react";

interface BiddingPIPProps {
    player: Player | null;
    leadingTeam: Team | null;
    currentBid: number | null;
}

export function BiddingPIP({ player, leadingTeam, currentBid }: BiddingPIPProps) {
    if (!player || currentBid === null) return null;

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-6 right-6 z-[100] w-64 h-24 bg-slate-900/80 backdrop-blur-xl border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden shadow-emerald-900/40"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />

            <div className="relative h-full p-3 flex items-center gap-3">
                <div className="relative">
                    <PlayerAvatar
                        id={player.id}
                        name={player.name}
                        role={player.role}
                        photoUrl={player.photo_url}
                        size="md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-lg">
                        <Gavel size={10} strokeWidth={3} />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                        <TrendingUp size={10} />
                        Live Bid
                    </div>
                    <div className="text-sm font-black text-white truncate italic uppercase tracking-tighter">
                        {player.name}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <div className="text-lg font-black text-emerald-400 font-mono">
                            ₹{currentBid.toLocaleString("en-IN")}
                        </div>
                    </div>
                </div>
            </div>

            {/* Leading Team Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-500 flex items-center px-3">
                <span className="text-[8px] font-black text-slate-950 uppercase tracking-[0.2em] truncate">
                    {leadingTeam ? `Leading: ${leadingTeam.name}` : "Awaiting Bids"}
                </span>
            </div>
        </motion.div>
    );
}
