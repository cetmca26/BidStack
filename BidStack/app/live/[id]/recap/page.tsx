"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAuctionState } from "@/lib/hooks/useAuctionState";
import { RecapStats } from "@/components/live/RecapStats";
import TeamRoster from "@/components/team/TeamRoster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, BarChart3, ArrowLeft } from "lucide-react";

export default function AuctionRecapPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: auctionId } = use(params);

    const {
        auction,
        teams,
        players,
        loading,
    } = useAuctionState(auctionId);

    if (loading || !auction) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <div className="h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <div className="mt-4 text-amber-500 font-black uppercase tracking-widest text-xs">
                    Calculating Results...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
            {/* Background Decor */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="relative z-50 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl px-6 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 text-amber-500 font-black text-xs uppercase tracking-[0.4em] mb-1">
                            <Trophy size={14} />
                            Auction Concluded
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
                            {auction.name} <span className="text-slate-500 ml-4 font-normal">Recap</span>
                        </h1>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => router.push("/")}
                        className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 gap-2 rounded-xl"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Button>
                </div>
            </header>

            <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-8 overflow-y-auto">
                <Tabs defaultValue="highlights" className="space-y-12">
                    <div className="flex justify-center">
                        <TabsList className="bg-slate-900/80 border border-slate-800 p-1 h-14 rounded-2xl">
                            <TabsTrigger value="highlights" className="rounded-xl h-full px-8 gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                                <BarChart3 size={18} />
                                Highlights
                            </TabsTrigger>
                            <TabsTrigger value="rosters" className="rounded-xl h-full px-8 gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950">
                                <Users size={18} />
                                Final Rosters
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="highlights" className="mt-0 focus-visible:ring-0">
                        <RecapStats teams={teams} players={players} sportType={auction.sport_type} />
                    </TabsContent>

                    <TabsContent value="rosters" className="mt-0 focus-visible:ring-0">
                        <TeamRoster auction={auction} teams={teams} players={players} mode="recap" />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
