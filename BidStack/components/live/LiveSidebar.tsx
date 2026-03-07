"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Users, Shield, TrendingUp } from "lucide-react";
import { Team, Player } from "@/lib/hooks/useAuctionState";
import { TeamLogo } from "@/components/TeamLogo";
import { formatPrice } from "@/lib/utils";

interface LiveSidebarProps {
    teams: Team[];
    players: Player[];
    onTeamClick: (team: Team) => void;
    onExpandPlayers?: () => void;
    maxPlayers: number;
}

export function LiveSidebar({ teams, players, onTeamClick, onExpandPlayers, maxPlayers }: LiveSidebarProps) {
    const SIDEBAR_PLAYER_LIMIT = 5;

    const upcomingPlayers = useMemo(() => {
        return players.filter(p => ["upcoming", "upcoming_phase2"].includes(p.status));
    }, [players]);

    return (
        <div className="flex flex-col h-full gap-fluid">
            {/* Teams Overview */}
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md p-fluid flex flex-col gap-fluid-sm">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                    <Shield size={14} />
                    Franchises
                </div>
                <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {teams.map((team) => (
                        <button
                            key={team.id}
                            onClick={() => onTeamClick(team)}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all group text-left"
                        >
                            <div className="flex items-center gap-3">
                                <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
                                <div>
                                    <div className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                                        {team.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase font-medium">
                                        {team.manager}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono text-emerald-500">
                                    {formatPrice(team.purse_remaining)}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    {maxPlayers - team.slots_remaining} / {maxPlayers} Slots
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Player List */}
            <Card className="flex-1 border-slate-800 bg-slate-900/50 backdrop-blur-md p-fluid flex flex-col gap-fluid-sm overflow-hidden" data-density="compact">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
                        <Users size={14} />
                        Upcoming Players
                    </div>
                    {onExpandPlayers && (
                        <button
                            onClick={onExpandPlayers}
                            className="text-[10px] text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                        >
                            <TrendingUp size={12} />
                            View All
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 mt-2">
                    {upcomingPlayers
                        .slice(0, SIDEBAR_PLAYER_LIMIT)
                        .map((player) => {
                            return (
                                <div
                                    key={player.id}
                                    className="p-3 rounded-xl border border-slate-800/50 bg-slate-950/20 flex items-center justify-between group hover:border-slate-700 transition-all"
                                >
                                    <div>
                                        <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                            {player.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-tight">
                                            {player.role} {player.is_captain && "• Captain"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[10px] font-bold uppercase ${player.status === 'live' ? "text-amber-500 animate-pulse" :
                                            player.status === 'upcoming' ? "text-rose-500" : "text-slate-600"
                                            }`}>
                                            {player.status.replace("_", " ")}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </Card>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
        </div>
    );
}
