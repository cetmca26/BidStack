"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Team, Player } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import { Star, TrendingUp, UserCheck, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TeamFormationProps {
    team: Team;
    players: Player[];
    sportType: string;
}

export function TeamFormation({ team, players, sportType }: TeamFormationProps) {
    const teamPlayers = useMemo(() =>
        players.filter(p => p.sold_team_id === team.id),
        [players, team.id]
    );

    const isFootball = sportType === "football";

    // Role configuration for positioning
    const roles = isFootball
        ? ["Forward", "Midfielder", "Defender", "Goalkeeper"]
        : ["Batsman", "Wicketkeeper", "Allrounder", "Bowler"];

    const groupedPlayers = useMemo(() => {
        return roles.reduce((acc, role) => {
            acc[role] = teamPlayers.filter(p => p.role === role);
            return acc;
        }, {} as Record<string, Player[]>);
    }, [teamPlayers, roles]);

    const teamStar = useMemo(() => {
        if (teamPlayers.length === 0) return null;
        return [...teamPlayers].sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0))[0];
    }, [teamPlayers]);

    return (
        <div className="flex flex-col h-full gap-fluid animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Team Header Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900/40 backdrop-blur-md rounded-2xl p-fluid border border-slate-800 shadow-xl gap-fluid">
                <div className="flex items-center gap-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                    >
                        <TeamLogo name={team.name} logoUrl={team.logo_url} size="lg" />
                    </motion.div>
                    <div>
                        <h2 className="tracking-tighter uppercase italic">
                            {team.name}
                        </h2>
                        <div className="flex items-center gap-fluid-sm mt-fluid-sm">
                            <span className="text-amber-400 font-bold text-sm tracking-widest uppercase">
                                {team.manager}
                            </span>
                            <div className="h-1 w-1 rounded-full bg-slate-700" />
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <UserCheck size={14} className="text-emerald-500" />
                                {teamPlayers.length} Signings
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-fluid-sm">
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/50 min-w-[140px]">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            <Wallet size={12} className="text-emerald-500" />
                            Remaining
                        </div>
                        <div className="text-xl font-mono font-bold text-emerald-400">
                            ₹{team.purse_remaining.toLocaleString("en-IN")}
                        </div>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/50 min-w-[140px]">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            <TrendingUp size={12} className="text-amber-500" />
                            Avg / Player
                        </div>
                        <div className="text-xl font-mono font-bold text-amber-400">
                            ₹{teamPlayers.length > 0
                                ? Math.round(teamPlayers.reduce((s, p) => s + (p.sold_price || 0), 0) / teamPlayers.length).toLocaleString("en-IN")
                                : "0"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-fluid flex-1 min-h-0">
                {/* Pitch / Field Layout */}
                <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
                    {/* Pitch Markings */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: isFootball
                                ? "linear-gradient(to bottom, transparent 49%, rgba(16, 185, 129, 0.4) 50%, transparent 51%), radial-gradient(circle at center, rgba(16, 185, 129, 0.4) 10%, transparent 11%)"
                                : "radial-gradient(ellipse at center, rgba(34, 197, 94, 0.3) 0%, transparent 70%)",
                            backgroundColor: isFootball ? "#064e3b" : "#14532d",
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                    {/* Player Formation Grid */}
                    <div className="relative z-10 h-full flex flex-col justify-around py-12 px-8">
                        {roles.map((role) => (
                            <div key={role} className="flex flex-col items-center gap-4">
                                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] border-b border-white/5 w-full text-center pb-2">
                                    {role}
                                </div>
                                <div className="flex flex-wrap justify-center gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {groupedPlayers[role].map((player) => (
                                            <motion.div
                                                key={player.id}
                                                layout
                                                initial={{ scale: 0, opacity: 0, y: 20 }}
                                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 260,
                                                    damping: 20,
                                                    layout: { duration: 0.3 }
                                                }}
                                                className="flex flex-col items-center group"
                                            >
                                                <div className="relative">
                                                    <PlayerAvatar
                                                        id={player.id}
                                                        name={player.name}
                                                        role={player.role}
                                                        photoUrl={player.photo_url}
                                                        size="lg"
                                                        showBadge={false}
                                                    />
                                                    {player.is_captain && (
                                                        <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-amber-200">
                                                            C
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[80px]">
                                                        {player.name}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-emerald-500/80">
                                                        ₹{player.sold_price?.toLocaleString("en-IN")}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {groupedPlayers[role].length === 0 && (
                                            <div className="h-20 w-20 rounded-full border border-dashed border-white/10 flex items-center justify-center text-white/5 text-[10px] font-black uppercase tracking-tighter italic">
                                                Empty Slot
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Highlights / Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-fluid">
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md p-5 flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 text-amber-500 font-black text-xs uppercase tracking-widest mb-6">
                            <Star size={14} fill="currentColor" />
                            Franchise Star
                        </div>

                        <AnimatePresence mode="wait">
                            {teamStar ? (
                                <motion.div
                                    key={teamStar.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full flex flex-col items-center"
                                >
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                                        <PlayerAvatar
                                            id={teamStar.id}
                                            name={teamStar.name}
                                            role={teamStar.role}
                                            photoUrl={teamStar.photo_url}
                                            size="xl"
                                            showBadge={true}
                                        />
                                    </div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                                        {teamStar.name}
                                    </h3>
                                    <div className="text-[11px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-1">
                                        {teamStar.role}
                                    </div>
                                    <div className="mt-4 px-6 py-2 rounded-full bg-slate-950 border border-amber-500/50 text-amber-400 font-mono font-bold text-lg shadow-lg shadow-amber-900/20">
                                        ₹{teamStar.sold_price?.toLocaleString("en-IN")}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-600">
                                    <Star size={48} className="opacity-10 mb-2" />
                                    <p className="text-sm italic font-medium">Awaiting first signing...</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </Card>

                    <Card className="flex-1 border-slate-800 bg-slate-900/50 backdrop-blur-md p-5 overflow-hidden flex flex-col">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                            Roster Feed
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {[...teamPlayers].reverse().map((p) => (
                                <div key={p.id} className="flex items-center justify-between border-l-2 border-emerald-500 bg-slate-950/40 p-3 rounded-r-xl">
                                    <div>
                                        <div className="text-sm font-bold text-slate-200">{p.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-black">{p.role}</div>
                                    </div>
                                    <div className="text-right font-mono text-emerald-500 font-bold">
                                        ₹{p.sold_price?.toLocaleString("en-IN")}
                                    </div>
                                </div>
                            ))}
                            {teamPlayers.length === 0 && (
                                <div className="h-full flex items-center justify-center text-slate-600 text-[11px] uppercase font-bold tracking-widest italic">
                                    Feed Empty
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}} />
        </div>
    );
}
