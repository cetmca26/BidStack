"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import { Star, TrendingUp, UserCheck, Wallet, Users, Crown, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Player {
    id: string;
    sold_team_id: string | null;
    status: string;
    role: string;
    name: string;
    photo_url: string | null;
    sold_price: number | null;
    is_captain?: boolean;
}

interface Team {
    id: string;
    name: string;
    logo_url: string | null;
    manager: string | null;
    purse_remaining: number;
    captain_id?: string | null;
}

interface Auction {
    id: string;
    name: string;
    status: string;
    sport_type: string;
}

interface ConsolidatedTeamRosterProps {
    auction: Auction;
    teams: Team[];
    players: Player[];
}

export default function ConsolidatedTeamRoster({ auction, teams, players }: ConsolidatedTeamRosterProps) {
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    useEffect(() => {
        if (teams.length > 0 && !selectedTeamId) {
            setSelectedTeamId(teams[0].id);
        }
    }, [teams, selectedTeamId]);

    const selectedTeam = teams.find((t: Team) => t.id === selectedTeamId);
    const teamPlayers = players.filter((p: Player) => p.sold_team_id === selectedTeamId);

    const isFootball = auction.sport_type === "football";
    const roles = isFootball
        ? ["Forward", "Midfielder", "Defender", "Goalkeeper"]
        : ["Batsman", "Wicketkeeper", "Allrounder", "Bowler"];

    const groupedPlayers = useMemo(() => {
        return roles.reduce((acc: Record<string, Player[]>, role: string) => {
            acc[role] = teamPlayers.filter((player: Player) => player.role === role && !player.is_captain);
            return acc;
        }, {} as Record<string, Player[]>);
    }, [teamPlayers, roles]);

    // Captain for this team
    const captain = useMemo(() => {
        return teamPlayers.find(p => p.is_captain) || null;
    }, [teamPlayers]);

    // MVP = highest-priced non-captain player
    const mvp = useMemo(() => {
        const nonCaptains = teamPlayers.filter(p => !p.is_captain);
        if (nonCaptains.length === 0) return null;
        return [...nonCaptains].sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0))[0];
    }, [teamPlayers]);

    const totalSpend = useMemo(() =>
        teamPlayers.reduce((sum: number, p: Player) => sum + (p.sold_price || 0), 0),
        [teamPlayers]
    );

    return (
        <div className="flex flex-col gap-fluid-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-fluid-lg">
                {/* Team Selector Sidebar */}
                <div className="lg:col-span-3 space-y-fluid-sm">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Teams</h3>
                    <div className="space-y-2">
                        {teams.map((team) => {
                            const teamPlayerCount = players.filter(p => p.sold_team_id === team.id).length;
                            return (
                                <button
                                    key={team.id}
                                    onClick={() => setSelectedTeamId(team.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${selectedTeamId === team.id
                                        ? "bg-slate-900 border-amber-500 shadow-lg shadow-amber-900/20"
                                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                                        }`}
                                >
                                    <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
                                    <div className="text-left flex-1 min-w-0">
                                        <div className={`font-bold truncate ${selectedTeamId === team.id ? "text-white" : "text-slate-400"}`}>
                                            {team.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-500 uppercase font-black">
                                                {teamPlayerCount} players
                                            </span>
                                            <span className="text-[10px] text-emerald-500/70 font-mono font-bold">
                                                {formatPrice(team.purse_remaining)} left
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Team Roster Detail */}
                <div className="lg:col-span-9">
                    <Card className="bg-slate-900/40 border-slate-800 rounded-3xl min-h-[600px] backdrop-blur-xl overflow-hidden">
                        {selectedTeam ? (
                            <div className="flex flex-col h-full">
                                {/* Team Header — TeamFormation style */}
                                <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900/60 backdrop-blur-md p-6 border-b border-slate-800 gap-4">
                                    <div className="flex items-center gap-6">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", bounce: 0.5 }}
                                        >
                                            <TeamLogo name={selectedTeam.name} logoUrl={selectedTeam.logo_url} size="lg" />
                                        </motion.div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                                                {selectedTeam.name}
                                            </h2>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-amber-400 font-bold text-sm tracking-widest uppercase">
                                                    {selectedTeam.manager}
                                                </span>
                                                <div className="h-1 w-1 rounded-full bg-slate-700" />
                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                    <UserCheck size={14} className="text-emerald-500" />
                                                    {teamPlayers.length} Signings
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/50 min-w-[140px]">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                                <Wallet size={12} className="text-emerald-500" />
                                                Remaining
                                            </div>
                                            <div className="text-xl font-mono font-bold text-emerald-400">
                                                {formatPrice(selectedTeam.purse_remaining)}
                                            </div>
                                        </div>
                                        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/50 min-w-[140px]">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                                <TrendingUp size={12} className="text-amber-500" />
                                                Total Spend
                                            </div>
                                            <div className="text-xl font-mono font-bold text-amber-400">
                                                {formatPrice(totalSpend)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Captain & MVP Highlights */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border-b border-slate-800/50">
                                    {/* Captain Card */}
                                    <div className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/40 p-5 flex items-center gap-5 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full" />
                                        <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-[0.3em] absolute top-3 left-5">
                                            <Crown size={12} fill="currentColor" />
                                            Captain
                                        </div>
                                        {captain ? (
                                            <>
                                                <div className="relative mt-4 flex-shrink-0">
                                                    <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
                                                    <PlayerAvatar
                                                        id={captain.id}
                                                        name={captain.name}
                                                        role={captain.role}
                                                        photoUrl={captain.photo_url}
                                                        size="lg"
                                                        isCaptain={true}
                                                    />
                                                </div>
                                                <div className="mt-4 flex-1 min-w-0">
                                                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter truncate">
                                                        {captain.name}
                                                    </h4>
                                                    <div className="text-[11px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                                                        {captain.role}
                                                    </div>
                                                    <div className="mt-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-amber-500/40 text-amber-400 font-mono font-bold text-base inline-block">
                                                        {formatPrice(captain.sold_price)}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="mt-4 flex-1 flex items-center justify-center py-4 text-slate-600 text-sm italic">
                                                No captain assigned
                                            </div>
                                        )}
                                    </div>

                                    {/* MVP Card */}
                                    <div className="relative rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900/40 p-5 flex items-center gap-5 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full" />
                                        <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] absolute top-3 left-5">
                                            <Sparkles size={12} fill="currentColor" />
                                            Most Valuable
                                        </div>
                                        {mvp ? (
                                            <>
                                                <div className="relative mt-4 flex-shrink-0">
                                                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                                                    <PlayerAvatar
                                                        id={mvp.id}
                                                        name={mvp.name}
                                                        role={mvp.role}
                                                        photoUrl={mvp.photo_url}
                                                        size="lg"
                                                    />
                                                </div>
                                                <div className="mt-4 flex-1 min-w-0">
                                                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter truncate">
                                                        {mvp.name}
                                                    </h4>
                                                    <div className="text-[11px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                                                        {mvp.role}
                                                    </div>
                                                    <div className="mt-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-base inline-block">
                                                        {formatPrice(mvp.sold_price)}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="mt-4 flex-1 flex items-center justify-center py-4 text-slate-600 text-sm italic">
                                                No non-captain signings
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Formation-Style Role Grid */}
                                <div className="flex-1 p-6">
                                    <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 min-h-[400px]">
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
                                        <div className="relative z-10 flex flex-col justify-around py-10 px-8 gap-8">
                                            {roles.map((role) => (
                                                <div key={role} className="flex flex-col items-center gap-4">
                                                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] border-b border-white/5 w-full text-center pb-2">
                                                        {role}
                                                    </div>
                                                    <div className="flex flex-wrap justify-center gap-6">
                                                        <AnimatePresence mode="popLayout">
                                                            {groupedPlayers[role]?.map((player) => (
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
                                                                    </div>
                                                                    <div className="mt-2 text-center">
                                                                        <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[80px]">
                                                                            {player.name}
                                                                        </div>
                                                                        <div className="text-[10px] font-mono text-emerald-500/80">
                                                                            {formatPrice(player.sold_price)}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                            {(!groupedPlayers[role] || groupedPlayers[role].length === 0) && (
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
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-12">
                                <Users size={48} className="opacity-10 mb-4" />
                                <p className="text-sm italic font-bold uppercase tracking-widest">Select a team to view their final roster</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
