"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Team } from "@/lib/hooks/useAuctionState";
import { formatPrice } from "@/lib/utils";
import { Gavel } from "lucide-react";

interface SaleFeedbackProps {
    player: Player | null;
    team: Team | null;
    price: number | null;
    isVisible: boolean;
    currentView?: "auction" | "roster" | "repository";
}

export function SaleFeedback({ player, team, price, isVisible, currentView = "auction" }: SaleFeedbackProps) {
    const [isDismissed, setIsDismissed] = useState(false);

    // Reset dismissal when a new player is sold
    useEffect(() => {
        setIsDismissed(false);
    }, [player?.id]);

    if (currentView !== "auction" || isDismissed) return null;
    if (!player || !team || !price) return null;

    // Generate 16 particles
    const particles = Array.from({ length: 16 });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setIsDismissed(true)}
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-4 py-6 md:px-12 md:py-10 sm:px-8 sm:py-8 cursor-pointer overflow-hidden"
                >
                    {/* Dark Navy Overlay with Blur */}
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />

                    {/* Radial Green Glow */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[800px] md:h-[800px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"
                    />

                    {/* Particle Burst effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        {particles.map((_, i) => {
                            const angle = (i / particles.length) * Math.PI * 2;
                            const distance = 300 + Math.random() * 200;
                            const x = Math.cos(angle) * distance;
                            const y = Math.sin(angle) * distance;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                                    animate={{ x, y, scale: Math.random() * 1.5 + 0.5, opacity: 0 }}
                                    transition={{ duration: 1 + Math.random(), ease: "easeOut" }}
                                    className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"
                                />
                            );
                        })}
                    </div>

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">

                        {/* 1. Photo Card Drop */}
                        <motion.div
                            initial={{ scale: 0.3, rotateX: 45, opacity: 0, y: -50 }}
                            animate={{ scale: 1, rotateX: 0, opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                            className="relative w-[200px] h-[250px] sm:w-[256px] sm:h-[320px] rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.4)] bg-slate-900 flex-shrink-0"
                        >
                            {/* Pulsing Emerald Shadow Animation over the card */}
                            <motion.div
                                animate={{ boxShadow: ["0 0 20px rgba(16,185,129,0.3)", "0 0 50px rgba(16,185,129,0.7)", "0 0 20px rgba(16,185,129,0.3)"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-2xl pointer-events-none z-20"
                            />

                            {/* Photo */}
                            {player.photo_url ? (
                                <img src={player.photo_url} alt={player.name} className="absolute inset-0 w-full h-full object-cover object-top" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                    <span className="text-6xl font-heading font-bold text-slate-700 uppercase">{player.name.charAt(0)}</span>
                                </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />

                            {/* Shimmer Sweep */}
                            <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 0.5 }}
                                className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 w-full"
                            />

                            {/* Badges */}
                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-30">
                                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                    {player.role}
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Player Name */}
                        <motion.h1
                            initial={{ y: 30, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.25 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter mt-6 md:mt-8 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                        >
                            {player.name}
                        </motion.h1>

                        {/* 3. Status Text */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.35 }}
                            className="mt-2"
                        >
                            <motion.div
                                animate={{ textShadow: ["0 0 20px rgba(16,185,129,0.4)", "0 0 60px rgba(16,185,129,0.9)", "0 0 20px rgba(16,185,129,0.4)"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="text-6xl sm:text-7xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-none"
                            >
                                SOLD!
                            </motion.div>
                        </motion.div>

                        {/* 4. Team Section + Price Card Wrapper */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.5 }}
                            className="mt-6 md:mt-8 w-full max-w-md mx-auto space-y-4"
                        >
                            {/* Team Name */}
                            <div className="flex flex-col items-center">
                                <div className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs">
                                    New Signing For
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1 px-4 text-center">
                                    {team.name}
                                </div>
                            </div>

                            {/* Price Card */}
                            <div className="relative overflow-hidden bg-emerald-500/90 rounded-3xl p-4 sm:p-6 border-2 border-emerald-300/50 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                                {/* Price Card Shimmer */}
                                <motion.div
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay: 1 }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 w-full z-0"
                                />

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="flex items-center gap-1.5 text-slate-900 font-black uppercase tracking-widest text-[9px] sm:text-[10px] opacity-80 mb-1">
                                        <Gavel size={14} />
                                        Final Hammer Price
                                    </div>
                                    <div className="text-4xl sm:text-5xl font-mono font-black text-slate-950 tracking-tight">
                                        {formatPrice(price)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 5. Dismiss Text */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="absolute -bottom-12 sm:-bottom-16 text-white text-xs sm:text-sm font-medium tracking-widest uppercase italic"
                        >
                            Tap anywhere to dismiss
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
