"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAuctionState } from "@/lib/hooks/useAuctionState";
import { PlayerRepository } from "@/components/live/PlayerRepository";
import { ArrowLeft } from "lucide-react";

export default function RepositoryPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: auctionId } = use(params);
    const { auction, teams, players, loading } = useAuctionState(auctionId);

    if (loading || !auction) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
                <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <div className="mt-4 text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest text-xs">
                    Loading Repository...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans">
            <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8">
                <PlayerRepository
                    players={players}
                    teams={teams}
                    onBack={() => router.push(`/live/${auctionId}`)}
                />
            </div>
        </div>
    );
}
