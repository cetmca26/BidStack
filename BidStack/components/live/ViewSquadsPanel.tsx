"use client";

import { Team, Player, Auction } from "@/lib/hooks/useAuctionState";
import { TeamListCard } from "@/components/live/TeamListCard";
import { Shield } from "lucide-react";

interface ViewSquadsPanelProps {
    auction: Auction;
    teams: Team[];
    players: Player[];
    onTeamSelect: (team: Team) => void;
}

export function ViewSquadsPanel({ auction, teams, players, onTeamSelect }: ViewSquadsPanelProps) {
    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest px-1">
                <Shield size={14} />
                Select a Franchise
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {teams.map((team) => (
                    <TeamListCard
                        key={team.id}
                        team={team}
                        players={players}
                        minPlayers={auction.settings.min_players}
                        onClick={() => onTeamSelect(team)}
                    />
                ))}
            </div>
        </div>
    );
}
