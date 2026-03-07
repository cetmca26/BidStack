"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { XCircle } from "lucide-react";

interface UnsoldFeedbackProps {
    player: Player | null;
    isVisible: boolean;
}

export function UnsoldFeedback({ player, isVisible }: UnsoldFeedbackProps) {
    if (!player) return null;

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

                    <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[600px] md:h-[600px] max-w-[800px] max-h-[800px] bg-rose-500/10 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                            className="mb-8"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full" />
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
                            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter text-rose-500 uppercase drop-shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                                UNSOLD
                            </h2>

                            <div className="flex flex-col items-center gap-2 mt-4 text-rose-400">
                                <XCircle strokeWidth={2.5} size={32} className="opacity-80 mb-2" />
                                <div className="font-bold uppercase tracking-[0.4em] text-sm md:text-base">
                                    No Bids Received
                                </div>
                                <div className="text-rose-300/60 font-medium italic mt-2 text-sm max-w-sm">
                                    Player has been returned to the repository and may be drawn again in later phases.
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

