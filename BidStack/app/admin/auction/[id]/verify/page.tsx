"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuctionState } from "@/lib/hooks/useAuctionState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Users,
    UserPlus,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ChevronRight,
    UserCheck,
    Lock
} from "lucide-react";

export default function VerifyAuctionPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: auctionId } = use(params);

    const {
        auction,
        teams,
        players,
        loading: stateLoading,
        error: stateError
    } = useAuctionState(auctionId);

    const [authLoading, setAuthLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [expandUnsoldList, setExpandUnsoldList] = useState(false);
    const UNSOLD_DISPLAY_LIMIT = 5;

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/admin/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            if (profile?.role !== "admin") {
                router.push("/");
                return;
            }
            setAuthLoading(false);
        };

        checkAuth();
    }, [router]);

    const unsoldPlayers = useMemo(() =>
        players.filter(p => p.status === "upcoming"),
        [players]
    );

    const allTeamsSatisfied = useMemo(() => {
        if (!auction || teams.length === 0) return false;
        const min = auction.settings.min_players;
        return teams.every(t => (auction.settings.max_players - t.slots_remaining) >= min);
    }, [auction, teams]);

    const handleAssign = async (playerId: string, teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        if (!team) return;

        if (team.slots_remaining <= 0) {
            alert("This team is already full!");
            return;
        }

        if (team.purse_remaining < (auction?.settings.base_price || 0)) {
            alert("This team does not have enough purse remaining!");
            return;
        }

        setProcessing(`assign_${playerId}`);
        try {
            const { error } = await supabase.rpc("assign_unsold_player", {
                p_player_id: playerId,
                p_team_id: teamId
            });

            if (error) {
                alert("Assignment failed: " + error.message);
            }
        } finally {
            setProcessing(null);
        }
    };

    const handleFinalize = async () => {
        if (!allTeamsSatisfied) {
            alert("All teams must meet the minimum player requirement before finalizing.");
            return;
        }

        if (!window.confirm("Are you sure you want to permanently finalize this auction? This will take you back to the Admin Home.")) return;

        setProcessing("finalize");
        try {
            const { error } = await supabase.rpc("end_auction", { p_auction_id: auctionId });
            if (error) {
                alert("Finalization failed: " + error.message);
            } else {
                router.push("/admin");
            }
        } finally {
            setProcessing(null);
        }
    };

    if (authLoading || stateLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <p className="text-slate-400 font-medium animate-pulse">
                        {authLoading ? "Verifying Credentials..." : "Initializing Verification Hub..."}
                    </p>
                </div>
            </div>
        );
    }

    if (stateError) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <Card className="max-w-md w-full bg-slate-900 border-red-500/50 p-8 text-center text-red-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">Sync Error</h3>
                    <p className="text-sm text-slate-400 mb-6">{stateError.message}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>Retry Sync</Button>
                </Card>
            </div>
        );
    }

    if (!auction) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 italic">
            Auction not found.
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-50">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* Header */}
                <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                                onClick={() => router.push(`/admin/auction/${auctionId}`)}
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Auction
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">
                            Slot Filling Phase
                        </h1>
                        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                            Ensure all teams meet the mandatory minimum of {auction.settings.min_players} players.
                            You can optionally fill up to {auction.settings.max_players} players if team purse allows.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {!allTeamsSatisfied && (
                            <div className="flex items-center bg-amber-500/10 text-amber-500 border border-amber-500/20 py-1.5 px-3 rounded-full text-xs font-semibold gap-2">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Minimum Requirements Not Met
                            </div>
                        )}
                        <Button
                            size="lg"
                            className={`font-bold transition-all duration-300 shadow-lg ${allTeamsSatisfied ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
                            disabled={!allTeamsSatisfied || processing === "finalize"}
                            onClick={handleFinalize}
                        >
                            {processing === "finalize" ? "Finalizing..." : allTeamsSatisfied ? "Finalize Auction" : "Satisfy All Min Requirements"}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </header>

                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Teams Status Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Team Roster Progress
                            </h2>
                        </div>

                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            {teams.map((team) => {
                                const count = auction.settings.max_players - team.slots_remaining;
                                const isSatisfied = count >= auction.settings.min_players;

                                return (
                                    <Card key={team.id} className={`p-5 relative overflow-hidden border-slate-800 transition-all duration-300 ${isSatisfied ? 'bg-emerald-950/10 border-emerald-800/20' : 'bg-slate-900/40'}`}>
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                                            style={{ width: `${(count / auction.settings.max_players) * 100}%` }}
                                        />

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-white mb-1">{team.name}</h3>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">{team.manager}</p>
                                            </div>
                                            {isSatisfied ? (
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                    <UserCheck className="h-4 w-4 text-emerald-500" />
                                                </div>
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                                    <Users className="h-4 w-4 text-amber-500" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                            <div className="space-y-1">
                                                <span className="text-slate-500 text-xs block">Count</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-xl font-bold ${isSatisfied ? 'text-emerald-400' : 'text-amber-400'}`}>{count}</span>
                                                    <span className="text-slate-600">/ {auction.settings.max_players}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-slate-500 text-xs block">Remaining Purse</span>
                                                <p className="text-white font-mono font-medium">₹{team.purse_remaining.toLocaleString("en-IN")}</p>
                                            </div>
                                        </div>

                                        {!isSatisfied && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-950/20 border border-red-500/20 mb-2">
                                                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                                <span className="text-[10px] text-red-400 uppercase font-bold tracking-tight">Needs {auction.settings.min_players - count} more players</span>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full h-8 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                                                onClick={() => router.push(`/admin/auction/${auctionId}/teams`)}
                                            >
                                                View Roster
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Unsold Players Section */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <UserPlus className="h-4 w-4" /> Unsold Pool ({unsoldPlayers.length})
                            </h2>
                        </div>

                        <Card className="border-slate-800 bg-slate-900/60 p-2 shadow-2xl overflow-hidden flex flex-col max-h-fit md:max-h-[calc(100vh-400px)]">
                            <div className="overflow-y-auto pr-1 space-y-2 p-2 custom-scrollbar max-h-[600px]">
                                {unsoldPlayers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                        <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-300">All Players Allocated</h4>
                                            <p className="text-xs text-slate-500 mt-1">There are no more players in the unsold pool.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {unsoldPlayers.slice(0, expandUnsoldList ? unsoldPlayers.length : UNSOLD_DISPLAY_LIMIT).map((player) => (
                                            <div key={player.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 transition-all duration-200">
                                                <div className="flex justify-between items-start gap-2 mb-3">
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{player.name}</p>
                                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">{player.role}</p>
                                                    </div>
                                                    <div className="px-2 py-0.5 rounded border border-slate-700 text-[9px] uppercase tracking-widest bg-slate-900 text-slate-400 h-5 flex items-center whitespace-nowrap">
                                                        Unsold
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Quick Match to Team</Label>
                                                    <select
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-md py-1.5 px-2 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                                        onChange={(e) => {
                                                            if (e.target.value) handleAssign(player.id, e.target.value);
                                                            e.target.value = "";
                                                        }}
                                                        disabled={!!processing}
                                                    >
                                                        <option value="">Choose a team...</option>
                                                        {teams
                                                            .filter(t => t.slots_remaining > 0 && t.purse_remaining >= (auction?.settings.base_price || 0))
                                                            .map(t => (
                                                                <option key={t.id} value={t.id}>
                                                                    {t.name} ({auction.settings.max_players - t.slots_remaining}/{auction.settings.max_players})
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                            {unsoldPlayers.length > UNSOLD_DISPLAY_LIMIT && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-xs border-t border-slate-800"
                                    onClick={() => setExpandUnsoldList(!expandUnsoldList)}
                                >
                                    {expandUnsoldList ? (
                                        <>
                                            ↑ Show Less ({UNSOLD_DISPLAY_LIMIT})
                                        </>
                                    ) : (
                                        <>
                                            ↓ Show More ({unsoldPlayers.length - UNSOLD_DISPLAY_LIMIT} more)
                                        </>
                                    )}
                                </Button>
                            )}
                        </Card>

                        <div className="flex items-center gap-2 text-slate-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs italic">
                                Matching a player will deduct {auction.settings.base_price.toLocaleString("en-IN")} from the team purse.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
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
            `}} />
        </div>
    );
}
