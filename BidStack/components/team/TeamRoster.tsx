"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TeamLogo } from "@/components/TeamLogo";
import { Users, PanelRightClose, PanelRightOpen } from "lucide-react";
import { formatPrice } from "@/lib/utils";
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
                                : "bg-slate-900/40 border-slate-700 hover:border-slate-500"
                                }`}
                        >
                            <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
                            <div className="text-left">
                                <div className={`font-bold text-sm ${isActive ? "text-slate-950" : "text-white"}`}>
                                    {team.name}
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest flex gap-2 mt-0.5 ${isActive ? "text-emerald-950/70" : "text-slate-500"}`}>
                                    <span>{count} players</span>
                                    <span>•</span>
                                    <span className={isActive ? "text-emerald-950 font-mono" : "text-emerald-500 font-mono"}>
                                        {formatPrice(team.purse_remaining)} left
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Tab Toggle Bar */}
            <div className="flex justify-center">
                <div className="bg-slate-900 border border-slate-800 p-1 rounded-full flex items-center">
                    <button
                        onClick={() => setActiveTab("highlights")}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "highlights"
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        Highlights
                    </button>
                    <button
                        onClick={() => setActiveTab("rosters")}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "rosters"
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        Final Rosters
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full">
                <Card className="bg-slate-900/40 border-slate-800 rounded-3xl min-h-[600px] backdrop-blur-xl overflow-hidden">
                    {selectedTeam ? (
                        <div className="flex flex-col h-full min-h-0">
                            {/* Team Header (extracted subcomponent) */}
                            <TeamRosterHeader
                                team={selectedTeam}
                                signings={stats.signings}
                                totalSpend={stats.totalSpend}
                                mode={mode}
                            />

                            {/* Conditional Content Based on Active Tab */}
                            {activeTab === "highlights" ? (
                                <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 overflow-hidden min-h-0">
                                    {/* Formation — hero area */}
                                    <div className="flex-1 min-h-[500px] lg:min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden rounded-2xl bg-slate-950">
                                        <div className="flex items-center justify-end p-2 lg:hidden">
                                            <button
                                                onClick={() => setIsSquadPanelOpen(!isSquadPanelOpen)}
                                                className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-widest transition-colors ${isSquadPanelOpen ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                                                    }`}
                                            >
                                                {isSquadPanelOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                                                <span className="inline">Squad</span>
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
                                                initial={mode === "live" ? { width: 0, opacity: 0, scale: 0.95 } : false}
                                                animate={{ width: "auto", opacity: 1, scale: 1 }}
                                                exit={{ width: 0, opacity: 0, scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                className="lg:w-[340px] xl:w-[380px] flex-shrink-0 overflow-y-auto origin-right custom-scrollbar"
                                            >
                                                <div className="w-full h-full min-w-[300px] space-y-4">
                                                    <div className="text-sm font-black text-slate-500 uppercase tracking-widest mt-2 px-2">
                                                        Team Star Players
                                                    </div>
                                                    <TeamStarPlayers
                                                        captain={captain}
                                                        mvp={mvp}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {teamPlayers.map(player => (
                                            <div key={player.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                                                    {player.photo_url ? (
                                                        <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover object-top" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-heading font-bold text-slate-500">
                                                            {player.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-sm text-white truncate uppercase tracking-tight font-heading">
                                                        {player.name}
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                                                        {player.role}
                                                    </div>
                                                    <div className="text-xs font-mono font-bold text-emerald-500 mt-1">
                                                        {formatPrice(player.sold_price)}
                                                    </div>
                                                </div>
                                                {player.is_captain && (
                                                    <div className="bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase">C</div>
                                                )}
                                            </div>
                                        ))}
                                        {teamPlayers.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-slate-500 italic uppercase font-bold tracking-widest text-sm">
                                                No players signed yet.
                                            </div>
                                        )}
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
                </Card>
            </div>
        </div>
    );
}
