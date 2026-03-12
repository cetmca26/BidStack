"use client";

import { useState, useMemo } from "react";
import { Player, Team } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

type FilterStatus = "all" | "upcoming" | "sold" | "unsold";

interface PlayerRepositoryProps {
    players: Player[];
    teams: Team[];
    onBack: () => void;
}

export function PlayerRepository({ players, teams, onBack }: PlayerRepositoryProps) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterStatus>("all");

    const filteredPlayers = useMemo(() => {
        return players
            .filter((p) => {
                if (filter === "all") return true;
                if (filter === "sold") return p.status === "sold" || p.sold_team_id !== null;
                if (filter === "unsold") return p.status === "unsold" || p.status === "unsold_final";
                if (filter === "upcoming") return p.status === "upcoming" || p.status === "upcoming_phase2" || p.status === "blind_reserved";
                return p.status === filter;
            })
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [players, filter, search]);

    const filterPills: { label: string; value: FilterStatus }[] = [
        { label: "All", value: "all" },
        { label: "Upcoming", value: "upcoming" },
        { label: "Sold", value: "sold" },
        { label: "Unsold", value: "unsold" },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-white/60 dark:bg-slate-900/40 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden" data-density="compact">
            {/* Header */}
            <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-slate-300 dark:border-slate-800 flex-shrink-0">
                <div className="flex items-center justify-between">
                    {/* <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Auction
                    </button> */}
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">
                        {filteredPlayers.length} Players
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
                    <Input
                        placeholder="Search players..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-slate-100/50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800 text-sm h-9"
                    />
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 overflow-x-auto">
                    {filterPills.map((pill) => (
                        <button
                            key={pill.value}
                            onClick={() => setFilter(pill.value)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${filter === pill.value
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-100/40 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-500 hover:border-slate-400 dark:hover:border-slate-700"
                                }`}
                        >
                            {pill.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Player Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {filteredPlayers.map((player) => {
                        const team = teams.find((t) => t.id === player.sold_team_id);
                        return (
                            <div
                                key={player.id}
                                className="p-2.5 sm:p-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex items-center gap-2.5 sm:gap-3 group hover:border-emerald-500/30 transition-all"
                            >
                                <div className="flex-shrink-0">
                                    <PlayerAvatar
                                        id={player.id}
                                        name={player.name}
                                        role={player.role}
                                        photoUrl={player.photo_url}
                                        size="sm"
                                        isCaptain={player.is_captain}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{player.name}</div>
                                    <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        {player.role}
                                    </div>
                                    {player.status === "sold" && team ? (
                                        <div className="mt-1 flex items-center gap-1 min-w-0">
                                            <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
                                            <div className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase truncate">
                                                {team.name}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`mt-1 text-[8px] font-black uppercase tracking-widest ${player.status === "live" ? "text-amber-600 dark:text-amber-500 animate-pulse" : "text-slate-500 dark:text-slate-600"}`}
                                        >
                                            {player.status}
                                        </div>
                                    )}
                                </div>
                                {player.status === "sold" && (
                                    <div className="text-right flex-shrink-0 text-[9px] sm:text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                        ₹{player.sold_price?.toLocaleString("en-IN")}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {filteredPlayers.length === 0 && (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 italic uppercase font-bold tracking-widest text-sm">
                        No players match your filters.
                    </div>
                )}
            </div>
        </div>
    );
}
