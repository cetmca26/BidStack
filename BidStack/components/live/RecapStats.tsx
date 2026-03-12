"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Team, Player } from "@/lib/hooks/useAuctionState";
import { formatPriceCompact, formatPrice } from "@/lib/utils";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import { Trophy, Star, Target, Shield, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RecapStatsProps {
    teams: Team[];
    players: Player[];
    sportType: string;
}

export function RecapStats({ teams, players, sportType }: RecapStatsProps) {
    const soldPlayers = useMemo(() => players.filter(p => p.status === 'sold'), [players]);

    const mvp = useMemo(() => {
        if (soldPlayers.length === 0) return null;
        // Golden Signing excludes captains — only non-captain players qualify
        return [...soldPlayers].filter(p => !p.is_captain).sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0))[0] || null;
    }, [soldPlayers]);

    const roleMvps = useMemo(() => {
        const roles = sportType === "football"
            ? ["Forward", "Midfielder", "Defender", "Goalkeeper"]
            : ["Batsman", "Wicketkeeper", "Allrounder", "Bowler"];

        return roles.map(role => {
            const best = soldPlayers
                .filter(p => p.role === role)
                .sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0))[0];
            return { role, player: best };
        }).filter(item => item.player);
    }, [soldPlayers, sportType]);

    const mostValuableCaptain = useMemo(() => {
        return soldPlayers
            .filter(p => p.is_captain)
            .sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0))[0];
    }, [soldPlayers]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-8"
        >
            {/* Top MVP Highlight */}
            <section className="relative flex flex-col items-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />

                <motion.div variants={item} className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 text-amber-500 font-black text-xs uppercase tracking-[0.5em] mb-4">
                        <Trophy size={18} strokeWidth={3} />
                        Auction MVP
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white italic tracking-tighter uppercase mb-4">The Golden Signing</h2>
                </motion.div>

                {mvp && (
                    <motion.div
                        variants={item}
                        className="relative group cursor-pointer"
                    >
                        <div className="relative group cursor-pointer">
                        <Card className="relative bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[30px] shadow-none flex flex-col items-center overflow-visible min-h-[400px] sm:min-h-[450px]">
                            {/* Team Stamp */}
                            {mvp.sold_team_id && (
                                <div className="absolute top-4 right-4 z-20 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-lg">
                                    <TeamLogo
                                        name={teams.find(t => t.id === mvp.sold_team_id)?.name || ""}
                                        logoUrl={teams.find(t => t.id === mvp.sold_team_id)?.logo_url}
                                        size="sm"
                                    />
                                </div>
                            )}

                            {/* Image Section */}
                            <div className="flex-1 w-full relative flex items-end justify-center pointer-events-none pt-8 px-4">
                                {mvp.photo_url ? (
                                    <img src={mvp.photo_url} alt={mvp.name} className="w-full h-full max-h-[250px] sm:max-h-[300px] object-contain object-bottom" />
                                ) : (
                                    <div className="flex items-center justify-center font-heading font-black text-slate-300 dark:text-slate-800 text-[10rem] opacity-70">
                                        {mvp.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="shrink-0 w-full flex flex-col items-center px-6 mt-4 z-10 pb-8">
                                <div className="flex flex-col items-center gap-1 bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-[80%] mx-auto">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-black text-emerald-600 dark:text-emerald-400 leading-none">
                                            {formatPrice(mvp.sold_price)}
                                        </div>
                                        <div className="text-xs sm:text-sm font-bold text-slate-500 tracking-wider italic">
                                            ({formatPriceCompact(mvp.sold_price)})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        </div>
                    </motion.div>
                )}
            </section>

            {/* Role MVPs Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {roleMvps.map(({ role, player }) => (
                    <motion.div key={role} variants={item}>
                        <Card className="relative bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[20px] sm:rounded-3xl shadow-none flex flex-col items-center text-center group overflow-visible mb-6 aspect-[3/4]">
                            {/* Team Stamp */}
                            {player.sold_team_id && (
                                <div className="absolute top-3 right-3 z-30 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-md scale-90 sm:scale-100">
                                    <TeamLogo
                                        name={teams.find(t => t.id === player.sold_team_id)?.name || ""}
                                        logoUrl={teams.find(t => t.id === player.sold_team_id)?.logo_url}
                                        size="sm"
                                    />
                                </div>
                            )}

                            {/* Photo Section — fills most of the card */}
                            <div className="flex-1 w-full relative flex items-end justify-center pointer-events-none p-3 sm:p-4 pb-0 overflow-hidden rounded-t-[inherit]">
                                {player.photo_url ? (
                                    <img src={player.photo_url} alt={player.name} className="w-full h-full object-contain object-bottom" />
                                ) : (
                                    <div className="flex items-center justify-center font-heading font-black text-slate-300 dark:text-slate-800 text-[6rem] opacity-20">
                                        {player.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Player Name + Bid */}
                            <div className="shrink-0 w-full z-10 px-3 sm:px-4 pt-2 pb-5">
                                <div className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-white uppercase tracking-wide truncate mb-1">
                                    {player.name}
                                </div>
                                <div className="flex flex-col items-center gap-0.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm py-1.5 px-2 w-full">
                                    <span className="font-mono text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-bold">{formatPrice(player.sold_price)}</span>
                                    <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium italic">
                                        ({formatPriceCompact(player.sold_price)})
                                    </span>
                                </div>
                            </div>
                            
                            {/* Bottom Title Pill */}
                            <div className="absolute bottom-0 translate-y-1/2 z-20 text-[8px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full shadow border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                Best {role}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </section>

            {/* Key Stats Bar */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={item} className="h-full">
                    <Card className="h-full bg-emerald-500 text-slate-950 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] flex flex-col justify-center items-center text-center shadow-lg shadow-emerald-900/20">
                        <Users size={24} strokeWidth={2.5} className="mb-2 sm:mb-4" />
                        <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-80">Total Players Sold</div>
                        <div className="text-4xl sm:text-5xl font-black mt-1 leading-none">{soldPlayers.length}</div>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="h-full">
                    <Card className="h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] flex flex-col justify-center items-center text-center border-2">
                        <Target size={24} strokeWidth={2.5} className="mb-2 sm:mb-4 text-emerald-500" />
                        <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Expenditure</div>
                        <div className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white font-mono leading-none">
                            {formatPriceCompact(soldPlayers.reduce((s, p) => s + (p.sold_price || 0), 0))}
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="h-full">
                    <Card className="relative bg-blue-50/50 dark:bg-slate-900/50 border border-blue-200 dark:border-blue-900/30 shadow-none text-slate-900 dark:text-white rounded-[24px] sm:rounded-[32px] flex flex-col items-center text-center overflow-visible mb-6 aspect-[3/4]">
                        {/* Team Stamp */}
                        {mostValuableCaptain?.sold_team_id && (
                            <div className="absolute top-4 right-4 z-30 flex items-center justify-center bg-white/80 dark:bg-blue-900/80 backdrop-blur-md p-1.5 rounded-full border border-white/50 shadow-lg">
                                <TeamLogo
                                    name={teams.find(t => t.id === mostValuableCaptain.sold_team_id)?.name || ""}
                                    logoUrl={teams.find(t => t.id === mostValuableCaptain.sold_team_id)?.logo_url}
                                    size="sm"
                                />
                            </div>
                        )}

                        {/* Photo Section — fills most of the card */}
                        <div className="flex-1 w-full relative flex items-end justify-center pointer-events-none p-3 sm:p-4 pb-0 overflow-hidden rounded-t-[inherit]">
                            {mostValuableCaptain?.photo_url ? (
                                <img src={mostValuableCaptain.photo_url} alt={mostValuableCaptain.name} className="w-full h-full object-contain object-bottom" />
                            ) : null}
                        </div>

                        {/* Player Name + Bid */}
                        <div className="shrink-0 w-full z-10 px-3 sm:px-4 pt-2 pb-5">
                            {mostValuableCaptain ? (
                                <>
                                    <div className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-white uppercase tracking-wide truncate mb-1">
                                        {mostValuableCaptain.name}
                                    </div>
                                    <div className="flex flex-col items-center gap-0.5 bg-blue-100 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-900 shadow-sm py-1.5 px-2 w-full">
                                        <span className="font-mono text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-400">{formatPrice(mostValuableCaptain.sold_price)}</span>
                                        <span className="text-[8px] sm:text-[9px] text-blue-700 dark:text-blue-500 font-medium italic">({formatPriceCompact(mostValuableCaptain.sold_price)})</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-400 uppercase italic tracking-tighter">N/A</div>
                            )}
                        </div>
                        
                        {/* Bottom Title Pill */}
                        <div className="absolute bottom-0 translate-y-1/2 z-20 flex items-center gap-1.5 bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-800 shadow px-4 py-1.5 rounded-full whitespace-nowrap">
                            <Star size={12} strokeWidth={2.5} className="text-amber-500" />
                            <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-900 dark:text-blue-100">Top Captain Pick</div>
                        </div>
                    </Card>
                </motion.div>
            </section>
        </motion.div>
    );
}
