"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TeamLogo } from "@/components/TeamLogo";
import { Users, PanelRightClose, PanelRightOpen } from "lucide-react";
import { formatPrice, formatPriceCompact } from "@/lib/utils";
import { Player, Team, Auction } from "@/lib/hooks/useAuctionState";
import {
    getTeamPlayers,
    groupPlayersByRole,
    getCaptain,
    getMVP,
    computeTeamStats,
} from "@/lib/shared/playerUtils";
import { TeamFormation } from "@/components/live/TeamFormation";
import { TeamRosterHeader } from "@/components/team/TeamRosterHeader";
import { TeamStarPlayers } from "@/components/team/TeamStarPlayers";

interface TeamRosterProps {
    auction: Auction;
    teams: Team[];
    players: Player[];
    mode: "live" | "recap";
    /** Externally controlled selected team (optional — used by live page sidebar) */
    selectedTeamId?: string | null;
    onTeamSelect?: (teamId: string) => void;
}

export default function TeamRoster({
    auction,
    teams,
    players,
    mode,
    selectedTeamId: externalSelectedTeamId,
    onTeamSelect,
}: TeamRosterProps) {
    const [internalSelectedTeamId, setInternalSelectedTeamId] = useState<string | null>(null);
    const [isSquadPanelOpen, setIsSquadPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"highlights" | "rosters">("highlights");

    // Use external selection if provided, otherwise internal
    const selectedTeamId = externalSelectedTeamId !== undefined ? externalSelectedTeamId : internalSelectedTeamId;
    const setSelectedTeamId = (id: string) => {
        if (onTeamSelect) onTeamSelect(id);
        else setInternalSelectedTeamId(id);
    };

    useEffect(() => {
        if (mode === "live") {
            setIsSquadPanelOpen(window.innerWidth >= 1024);
        } else {
            setIsSquadPanelOpen(true);
        }
    }, [mode]);

    useEffect(() => {
        if (teams.length > 0 && !selectedTeamId) {
            setSelectedTeamId(teams[0].id);
        }
    }, [teams, selectedTeamId]);

    const selectedTeam = teams.find((t) => t.id === selectedTeamId) || null;

    const teamPlayers = useMemo(
        () => (selectedTeamId ? getTeamPlayers(players, selectedTeamId) : []),
        [players, selectedTeamId],
    );

    const groupedPlayers = useMemo(
        () => groupPlayersByRole(teamPlayers, auction.sport_type),
        [teamPlayers, auction.sport_type],
    );

    const captain = useMemo(() => getCaptain(teamPlayers), [teamPlayers]);
    const mvp = useMemo(() => getMVP(teamPlayers), [teamPlayers]);
    const stats = useMemo(
        () =>
            selectedTeam
                ? computeTeamStats(selectedTeam, teamPlayers)
                : { totalSpend: 0, avgPerPlayer: 0, signings: 0 },
        [selectedTeam, teamPlayers],
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Team Selector Pills */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar gap-3 snap-x">
                {teams.map((team) => {
                    const count = getTeamPlayers(players, team.id).length;
                    const isActive = selectedTeamId === team.id;
                    return (
                        <button
                            key={team.id}
                            onClick={() => setSelectedTeamId(team.id)}
                            className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-all border snap-center whitespace-nowrap ${isActive
                                ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20"
                                : "bg-white/60 dark:bg-slate-900/40 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                                }`}
                        >
                            <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
                            <div className="text-left">
                                <div className={`font-bold text-sm ${isActive ? "text-slate-950" : "text-slate-800 dark:text-white"}`}>
                                    {team.name}
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest flex gap-2 mt-0.5 ${isActive ? "text-emerald-950/70" : "text-slate-500"}`}>
                                    <span>{count} players</span>
                                    <span>•</span>
                                    <span className={isActive ? "text-emerald-950 font-mono" : "text-emerald-500 font-mono"}>
                                        {formatPriceCompact(team.purse_remaining)} left
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="w-full">
                <Card className="bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 rounded-3xl min-h-[600px] backdrop-blur-xl overflow-hidden">
                    {selectedTeam ? (
                        <div className="flex flex-col h-full min-h-0">
                            {/* Header with Centered Tabs */}
                            <div className="relative">
                                <TeamRosterHeader
                                    team={selectedTeam}
                                    signings={stats.signings}
                                    totalSpend={stats.totalSpend}
                                    mode={mode}
                                />

                                {/* Absolute Centered Toggle */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center pt-2">
                                    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-1 rounded-full flex items-center pointer-events-auto shadow-2xl">
                                        <button
                                            onClick={() => setActiveTab("highlights")}
                                            className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "highlights"
                                                ? "bg-emerald-500 text-slate-950"
                                                : "text-slate-400 hover:text-slate-200"
                                                }`}
                                        >
                                            Highlights
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("rosters")}
                                            className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "rosters"
                                                ? "bg-emerald-500 text-slate-950"
                                                : "text-slate-400 hover:text-slate-200"
                                                }`}
                                        >
                                            Final Rosters
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {activeTab === "highlights" ? (
                                <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 overflow-hidden min-h-0 justify-center">
                                    {/* Formation Container - Constrained width */}
                                    <div className="w-full lg:max-w-[550px] xl:max-w-[750px] min-h-[250px] lg:min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5">
                                        <div className="flex items-center justify-end p-2 lg:hidden">
                                            <button
                                                onClick={() => setIsSquadPanelOpen(!isSquadPanelOpen)}
                                                className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-widest ${isSquadPanelOpen ? "text-emerald-400" : "text-slate-500"
                                                    }`}
                                            >
                                                {isSquadPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                                                <span>Squad</span>
                                            </button>
                                        </div>
                                        <TeamFormation
                                            groupedPlayers={groupedPlayers}
                                            captain={captain}
                                            sportType={auction.sport_type}
                                        />
                                    </div>

                                    {/* Star Players Side Panel */}
                                    <AnimatePresence mode="wait">
                                        {isSquadPanelOpen && (
                                            <motion.div
                                                initial={mode === "live" ? { width: 0, opacity: 0 } : false}
                                                animate={{ width: "auto", opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                className="lg:w-[520px] xl:w-[560px] flex-shrink-0 overflow-y-auto custom-scrollbar"
                                            >
                                                <div className="w-fluid space-y-4 pt-2">
                                                    <div className="text-[20px] font-black text-slate-500 uppercase tracking-widest px-2">
                                                        Team Star Players
                                                    </div>
                                                    <TeamStarPlayers captain={captain} mvp={mvp} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {teamPlayers.map(player => (
                                            <div key={player.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3 shadow-sm rounded-lg">
                                                <div className="w-fluid h-fluid bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 rounded-md">
                                                    {player.photo_url ? (
                                                        <img src={player.photo_url} alt={player.name} className="w-fluid h-fluid object-cover object-top" />
                                                    ) : (
                                                        <div className="w-fluid h-fluid flex items-center justify-center font-heading font-bold text-slate-400 dark:text-slate-500">
                                                            {player.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-sm text-slate-800 dark:text-white truncate uppercase tracking-tight font-heading">
                                                        {player.name}
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                                                        {player.role}
                                                    </div>
                                                    <div className="text-xs font-mono font-bold text-emerald-500 mt-1">
                                                        <div>{formatPrice(player.sold_price)}</div>
                                                        <div className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 font-medium italic">
                                                            ({formatPriceCompact(player.sold_price)})
                                                        </div>
                                                    </div>
                                                </div>
                                                {player.is_captain && (
                                                    <div className="bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase">C</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-12">
                            <Users size={48} className="opacity-10 mb-4" />
                            <p className="text-sm italic font-bold uppercase tracking-widest">
                                Select a team to view their final roster
                            </p>
                        </div>
                    )}
                    {/* //: (
//                         <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-12">
//                             <Users size={48} className="opacity-10 mb-4" />
//                             <p className="text-sm italic font-bold uppercase tracking-widest">
//                                 Select a team to view their final roster
//                             </p>
//                         </div>
//                     )} */}
                </Card>
            </div>
        </div>
    );
}
