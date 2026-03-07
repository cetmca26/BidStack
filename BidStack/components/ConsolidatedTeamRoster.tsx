"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamLogo } from "@/components/TeamLogo";

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

    const roles = auction.sport_type === "football"
        ? ["Forward", "Midfielder", "Defender", "Goalkeeper"]
        : ["Batsman", "Wicketkeeper", "Allrounder", "Bowler"];

    const groupedPlayers = roles.reduce((acc: Record<string, Player[]>, role: string) => {
        acc[role] = teamPlayers.filter((player: Player) => player.role === role);
        return acc;
    }, {} as Record<string, Player[]>);

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
                {/* Team Selector Sidebar */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Teams</h3>
                    <div className="space-y-2">
                        {teams.map((team) => (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeamId(team.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${selectedTeamId === team.id
                                        ? "bg-slate-900 border-amber-500 shadow-lg shadow-amber-900/20"
                                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                                    }`}
                            >
                                <TeamLogo name={team.name} logoUrl={team.logo_url} size="sm" />
                                <div className="text-left">
                                    <div className={`font-bold ${selectedTeamId === team.id ? "text-white" : "text-slate-400"}`}>
                                        {team.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black">
                                        ₹{team.purse_remaining.toLocaleString("en-IN")} Left
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Team Roster Grid */}
                <div className="flex-1">
                    <Card className="bg-slate-900/40 border-slate-800 p-8 rounded-[32px] min-h-[600px] backdrop-blur-xl">
                        {selectedTeam ? (
                            <>
                                <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-8">
                                    <div className="flex items-center gap-6">
                                        <TeamLogo name={selectedTeam.name} logoUrl={selectedTeam.logo_url} size="lg" />
                                        <div>
                                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                                                {selectedTeam.name}
                                            </h2>
                                            <p className="text-amber-500 font-bold uppercase tracking-widest text-sm">
                                                Manager: {selectedTeam.manager}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                            Total Spend
                                        </div>
                                        <div className="text-3xl font-mono font-black text-white">
                                            ₹{teamPlayers.reduce((sum: number, p: Player) => sum + (p.sold_price || 0), 0).toLocaleString("en-IN")}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                    {roles.map((role) => (
                                        <div key={role} className="space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{role}s</h4>
                                                <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 bg-slate-800 rounded-full">
                                                    {groupedPlayers[role].length}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {groupedPlayers[role].map((p) => (
                                                    <div key={p.id} className="flex items-center justify-between group">
                                                        <div className="flex items-center gap-3">
                                                            <PlayerAvatar id={p.id} name={p.name} role={p.role} photoUrl={p.photo_url} size="sm" />
                                                            <div>
                                                                <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                                    {p.name}
                                                                    {p.is_captain && <span className="ml-2 text-[10px] bg-amber-500 text-black px-1 rounded font-black">C</span>}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 uppercase font-bold">
                                                                    Base: ₹{(p as any).base_price?.toLocaleString("en-IN")}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-mono text-sm font-bold text-white">
                                                                ₹{p.sold_price?.toLocaleString("en-IN")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {groupedPlayers[role].length === 0 && (
                                                    <div className="text-[11px] italic text-slate-700 uppercase font-bold tracking-widest py-2">
                                                        No signings
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
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
