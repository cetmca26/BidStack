"use client";

import { Player } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Users, ChevronRight } from "lucide-react";

interface RepositoryPanelProps {
    players: Player[];
    onExpand: () => void;
}

export function RepositoryPanel({ players, onExpand }: RepositoryPanelProps) {
    const upcomingPlayers = players
        .filter((p) => p.status === "upcoming")
        .slice(0, 4);

    const soldCount = players.filter((p) => p.status === "sold").length;
    const upcomingCount = players.filter((p) => p.status === "upcoming").length;

    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-500 font-bold text-xs uppercase tracking-widest px-1">
                <Users size={14} />
                Repository
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-100/60 dark:bg-slate-950/60 rounded-lg p-2 border border-slate-300/50 dark:border-slate-800/50 text-center">
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-500">{soldCount}</div>
                    <div className="text-[9px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest">Sold</div>
                </div>
                <div className="bg-slate-100/60 dark:bg-slate-950/60 rounded-lg p-2 border border-slate-300/50 dark:border-slate-800/50 text-center">
                    <div className="text-lg font-black text-amber-600 dark:text-amber-500">{upcomingCount}</div>
                    <div className="text-[9px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest">Upcoming</div>
                </div>
            </div>

            {/* Expand Button */}
            <button
                onClick={onExpand}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-sky-300 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 hover:border-sky-400 dark:hover:border-sky-500/50 transition-all text-xs font-black uppercase tracking-widest"
            >
                Expand Repository
                <ChevronRight size={12} />
            </button>

            {/* Upcoming Players Preview */}
            {upcomingPlayers.length > 0 && (
                <div className="space-y-1.5 mt-auto">
                    <div className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest px-1">
                        Next Up
                    </div>
                    {upcomingPlayers.map((player) => (
                        <div
                            key={player.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-300/50 dark:border-slate-800/50 bg-slate-100/30 dark:bg-slate-950/30"
                        >
                            <PlayerAvatar
                                id={player.id}
                                name={player.name}
                                role={player.role}
                                photoUrl={player.photo_url}
                                size="sm"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{player.name}</div>
                                <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {player.role}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
