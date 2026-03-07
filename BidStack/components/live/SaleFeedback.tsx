"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player, Team } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Trophy } from "lucide-react";

interface SaleFeedbackProps {
    player: Player | null;
    team: Team | null;
    price: number | null;
    isVisible: boolean;
}

export function SaleFeedback({ player, team, price, isVisible }: SaleFeedbackProps) {
    if (!player || !team || !price) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-6"
                >
                    {/* Backdrop with aggressive blur */}
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" />

                    {/* Particle fragments logic omitted for brevity, but could be added here */}
                    <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                            className="mb-8"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
                                <PlayerAvatar
                                    id={player.id}
                                    name={player.name}
                                    role={player.role}
                                    photoUrl={player.photo_url}
                                    size="xl"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4"
                        >
                            <h2 className="text-8xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] italic italic">
                                Sold!
                            </h2>

                            <div className="flex flex-col items-center gap-2">
                                <div className="text-amber-500 font-bold uppercase tracking-[0.4em] text-sm animate-pulse">
                                    New Signing for
                                </div>
                                <div className="text-4xl font-black text-white italic tracking-tight uppercase">
                                    {team.name}
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col items-center">
                                <div className="px-10 py-4 bg-emerald-500 text-slate-950 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.5)] border-2 border-white/20">
                                    <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70 flex items-center justify-center gap-2">
                                        <Trophy size={12} strokeWidth={3} />
                                        Final Hammer Price
                                    </div>
                                    <div className="text-5xl font-black font-mono">
                                        ₹{price.toLocaleString("en-IN")}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
