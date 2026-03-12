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
                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full group-hover:bg-amber-500/40 transition-all duration-500" />
                        <Card className="relative bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/50 rounded-[30px] shadow-2xl flex flex-col items-center overflow-hidden min-h-[400px] sm:min-h-[450px]">
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

                            {/* Full Height Player Image Background */}
                            <div className="absolute inset-0 pointer-events-none">
                                {mvp.photo_url ? (
                                    <img src={mvp.photo_url} alt={mvp.name} className="w-full h-[85%] object-contain object-bottom opacity-60 sm:opacity-80 mix-blend-luminosity dark:mix-blend-lighten" />
                                ) : (
                                    <div className="w-full h-[85%] flex items-center justify-center font-heading font-black text-slate-300 dark:text-slate-800 text-[10rem] opacity-70">
                                        {mvp.name.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 dark:from-slate-900 dark:via-slate-900/60 to-transparent" />
                            </div>

                            {/* Content overlay */}
                            <div className="relative z-10 w-full flex flex-col items-center p-6 sm:p-8 flex-1 justify-end">
                                <div className="mt-auto flex items-center justify-center gap-2 sm:gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-[80%] mx-auto">
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
                    </motion.div>
                )}
            </section>

            {/* Role MVPs Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {roleMvps.map(({ role, player }) => (
                    <motion.div key={role} variants={item}>
                        <Card className="relative bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[20px] sm:rounded-3xl flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors group h-full overflow-visible min-h-[250px] sm:min-h-[300px] mb-4">
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

                            {/* Full Height Player Image Background */}
                            <div className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden">
                                {player.photo_url ? (
                                    <img src={player.photo_url} alt={player.name} className="w-full h-[85%] object-contain object-bottom opacity-15 sm:opacity-85 mix-blend-luminosity dark:mix-blend-lighten" />
                                ) : (
                                    <div className="w-full h-[85%] flex items-center justify-center font-heading font-black text-slate-300 dark:text-slate-800 text-[6rem] opacity-20">
                                        {player.name.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 dark:from-slate-900 dark:via-slate-900/60 to-transparent" />
                            </div>

                            {/* Content overlay */}
                            <div className="relative z-10 w-full flex flex-col items-center p-4 sm:p-6 flex-1 justify-end pb-8">
                                <div className="mt-auto w-full flex flex-col items-center gap-2">
                                    <div className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-white/80 dark:bg-slate-950/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm w-full">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span>{formatPrice(player.sold_price)}</span>
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium italic">
                                                ({formatPriceCompact(player.sold_price)})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bottom Title Pill */}
                            <div className="absolute bottom-0 translate-y-1/2 z-20 text-[8px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest group-hover:scale-110 transition-transform bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-md border border-slate-200 dark:border-slate-700 w-auto whitespace-nowrap">
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
                    <Card className="relative h-full bg-blue-200 border border-blue-200 text-white rounded-[24px] sm:rounded-[32px] flex flex-col items-center text-center shadow-lg shadow-blue-500/80 overflow-visible min-h-[300px] mb-4">
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

                        <div className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden">
                            {mostValuableCaptain?.photo_url ? (
                                <img src={mostValuableCaptain.photo_url} alt={mostValuableCaptain.name} className="w-full h-[85%] object-contain object-bottom opacity-90 mix-blend-luminosity" />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-800/60 via-blue-600/20 to-transparent" />
                        </div>

                        <div className="relative z-10 w-full flex flex-col items-center p-4 sm:p-6 flex-1 justify-end h-full pb-8">
                            {mostValuableCaptain ? (
                                <div className="mt-auto w-full flex flex-col items-center gap-2">
                                    <div className="bg-blue-950/60 backdrop-blur-md border border-white/20 rounded-xl p-2 w-full flex flex-col items-center gap-0.5 shadow-xl">
                                        <span className="text-sm sm:text-base font-bold text-white drop-shadow-sm">{formatPrice(mostValuableCaptain.sold_price)}</span>
                                        <span className="text-[10px] text-blue-100 font-medium italic drop-shadow-sm">({formatPriceCompact(mostValuableCaptain.sold_price)})</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-auto flex flex-col items-center gap-2">
                                    <div className="text-xl sm:text-2xl font-black text-blue-900 uppercase italic tracking-tighter">N/A</div>
                                </div>
                            )}
                        </div>
                        
                        {/* Bottom Title Pill */}
                        <div className="absolute bottom-0 translate-y-1/2 z-20 flex items-center gap-1.5 bg-blue-100 border border-blue-300 shadow-md px-3 py-1 rounded-full whitespace-nowrap">
                            <Star size={12} strokeWidth={2.5} className="text-amber-500 drop-shadow-sm" />
                            <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-900">Top Captain Pick</div>
                        </div>
                    </Card>
                </motion.div>
            </section>
        </motion.div>
    );
}
