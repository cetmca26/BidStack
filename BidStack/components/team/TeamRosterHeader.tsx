"use client";

import { motion } from "framer-motion";
import { TeamLogo } from "@/components/TeamLogo";
import { UserCheck, Wallet, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Team } from "@/lib/hooks/useAuctionState";

interface TeamRosterHeaderProps {
    team: Team;
    signings: number;
    totalSpend: number;
    mode: "live" | "recap";
}

export function TeamRosterHeader({ team, signings, totalSpend, mode }: TeamRosterHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-5 sm:p-6 border-b border-slate-300 dark:border-slate-800 gap-4 flex-shrink-0">
            <div className="flex items-center gap-5">
                <motion.div
                    initial={mode === "live" ? { scale: 0.8, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                >
                    <TeamLogo
                        name={team.name}
                        logoUrl={team.logo_url}
                        size="lg"
                    />
                </motion.div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white uppercase tracking-tighter">
                        {team.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-sm tracking-widest uppercase">
                            {team.manager}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <UserCheck size={14} className="text-emerald-600 dark:text-emerald-500" />
                            {signings} Signings
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-100/60 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-300/50 dark:border-slate-800/50 min-w-[130px]">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-1">
                        <Wallet size={12} className="text-emerald-600 dark:text-emerald-500" />
                        Remaining
                    </div>
                    <div className="text-lg sm:text-xl font-mono font-bold text-emerald-400">
                        {formatPrice(team.purse_remaining)}
                    </div>
                </div>
                <div className="bg-slate-100/60 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-300/50 dark:border-slate-800/50 min-w-[130px]">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-1">
                        <TrendingUp size={12} className="text-amber-600 dark:text-amber-500" />
                        Total Spend
                    </div>
                    <div className="text-lg sm:text-xl font-mono font-bold text-amber-400">
                        {formatPrice(totalSpend)}
                    </div>
                </div>
            </div>
        </div>
    );
}
