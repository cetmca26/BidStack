"use client";

import { Team, Player, Auction } from "@/lib/hooks/useAuctionState";
import { TeamLogo } from "@/components/TeamLogo";
import { getTeamPlayers } from "@/lib/shared/playerUtils";
import { Users, ChevronRight } from "lucide-react";

interface TeamListCardProps {
    team: Team;
    players: Player[];
    minPlayers: number;
    onClick: () => void;
}

export function TeamListCard({ team, players, minPlayers, onClick }: TeamListCardProps) {
    const teamPlayers = getTeamPlayers(players, team.id);
    const soldCount = teamPlayers.length;
    const requiredPlayers = Math.max(0, minPlayers - soldCount);

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all group text-left"
        >
            <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {team.name}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                        <span className="text-emerald-500">{soldCount}</span> Sold
                    </div>
                    {requiredPlayers > 0 && (
                        <div className="text-[10px] text-amber-500 font-black uppercase tracking-wider">
                            {requiredPlayers} Required
                        </div>
                    )}
                </div>
            </div>
            <ChevronRight size={14} className="text-slate-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
        </button>
    );
}
