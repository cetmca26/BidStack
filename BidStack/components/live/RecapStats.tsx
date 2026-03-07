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
            className="space-y-12 pb-20"
        >
            {/* Top MVP Highlight */}
            <section className="relative flex flex-col items-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />

                <motion.div variants={item} className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 text-amber-500 font-black text-xs uppercase tracking-[0.5em] mb-4">
                        <Trophy size={18} strokeWidth={3} />
                        Auction MVP
                    </div>
                    <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase italic">The Golden Signing</h2>
                </motion.div>

                {mvp && (
                    <motion.div
                        variants={item}
                        className="relative group cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full group-hover:bg-amber-500/40 transition-all duration-500" />
                        <Card className="relative bg-slate-900/40 backdrop-blur-xl border-2 border-amber-500/50 p-10 rounded-[40px] shadow-2xl flex flex-col items-center">
                            <PlayerAvatar
                                id={mvp.id}
                                name={mvp.name}
                                role={mvp.role}
                                photoUrl={mvp.photo_url}
                                size="xl"
                            />
                            <div className="mt-8 text-center">
                                <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">{mvp.name}</h3>
                                <div className="text-amber-500 font-bold uppercase tracking-widest text-sm mt-1">{mvp.role}</div>

                                <div className="mt-6 flex items-center gap-4">
                                    <div className="h-0.5 w-12 bg-slate-800" />
                                    <div className="text-3xl font-mono font-black text-white">
                                        {formatPrice(mvp.sold_price)}
                                    </div>
                                    <div className="h-0.5 w-12 bg-slate-800" />
                                </div>

                                {mvp.sold_team_id && (
                                    <div className="mt-6 flex items-center gap-2 justify-center bg-slate-950/60 px-4 py-2 rounded-full border border-slate-800">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signed By</span>
                                        <TeamLogo
                                            name={teams.find(t => t.id === mvp.sold_team_id)?.name || ""}
                                            logoUrl={teams.find(t => t.id === mvp.sold_team_id)?.logo_url}
                                            size="sm"
                                        />
                                        <span className="text-sm font-bold text-slate-200">
                                            {teams.find(t => t.id === mvp.sold_team_id)?.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </section>

            {/* Role MVPs Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {roleMvps.map(({ role, player }) => (
                    <motion.div key={role} variants={item}>
                        <Card className="bg-slate-900/40 border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors group">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 group-hover:text-emerald-500 transition-colors">
                                Best {role}
                            </div>
                            <PlayerAvatar
                                id={player.id}
                                name={player.name}
                                role={player.role}
                                photoUrl={player.photo_url}
                                size="lg"
                            />
                            <h4 className="mt-4 text-lg font-bold text-white uppercase italic">{player.name}</h4>
                            <div className="mt-2 font-mono text-emerald-500 font-bold">
                                {formatPrice(player.sold_price)}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </section>

            {/* Key Stats Bar */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={item}>
                    <Card className="bg-emerald-500 text-slate-950 p-8 rounded-[32px] flex flex-col items-center text-center shadow-lg shadow-emerald-900/20">
                        <Users size={32} strokeWidth={2.5} className="mb-4" />
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Players Sold</div>
                        <div className="text-5xl font-black mt-1">{soldPlayers.length}</div>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="bg-slate-900 border-slate-800 p-8 rounded-[32px] flex flex-col items-center text-center border-2">
                        <Target size={32} strokeWidth={2.5} className="mb-4 text-emerald-500" />
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Expenditure</div>
                        <div className="text-4xl font-black mt-1 text-white font-mono">
                            {formatPriceCompact(soldPlayers.reduce((s, p) => s + (p.sold_price || 0), 0))}
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="bg-blue-600 text-white p-8 rounded-[32px] flex flex-col items-center text-center shadow-lg shadow-blue-900/20">
                        <Star size={32} strokeWidth={2.5} className="mb-4" />
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Top Captain Pick</div>
                        {mostValuableCaptain ? (
                            <>
                                <div className="mt-4 mb-2">
                                    <PlayerAvatar
                                        id={mostValuableCaptain.id}
                                        name={mostValuableCaptain.name}
                                        role={mostValuableCaptain.role}
                                        photoUrl={mostValuableCaptain.photo_url}
                                        size="lg"
                                    />
                                </div>
                                <div className="text-2xl font-black mt-1 uppercase italic tracking-tighter truncate w-full">
                                    {mostValuableCaptain.name}
                                </div>
                                <div className="text-sm font-bold opacity-80 mt-1">{formatPrice(mostValuableCaptain.sold_price)}</div>
                            </>
                        ) : (
                            <div className="text-2xl font-black mt-1 uppercase italic tracking-tighter">N/A</div>
                        )}
                    </Card>
                </motion.div>
            </section>
        </motion.div>
    );
}
