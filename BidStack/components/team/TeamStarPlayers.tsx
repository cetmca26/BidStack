"use client";

import { Player } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Crown, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface TeamStarPlayersProps {
    captain: Player | null;
    mvp: Player | null;
}

export function TeamStarPlayers({ captain, mvp }: TeamStarPlayersProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Captain Card */}
            <div className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-100/40 dark:from-amber-950/20 to-slate-50/60 dark:to-slate-900/40 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 blur-[60px] rounded-full" />

                <div className="flex items-center gap-2 text-amber-500 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                    <Crown size={11} fill="currentColor" />
                    Captain
                </div>

                {captain ? (
                    <>
                        <div className="relative flex-shrink-0 mb-3">
                            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
                            <PlayerAvatar
                                id={captain.id}
                                name={captain.name}
                                role={captain.role}
                                photoUrl={captain.photo_url}
                                size="lg"
                                isCaptain={true}
                            />
                        </div>
                        <div className="w-full min-w-0">
                            <h4 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white uppercase tracking-tighter truncate w-full">
                                {captain.name}
                            </h4>
                            <div className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-1 mb-3 truncate w-full">
                                {captain.role}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/80 dark:bg-slate-950/80 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono font-bold text-sm inline-block max-w-full">
                                <span className="truncate block">{formatPrice(captain.sold_price)}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-600 text-sm italic">
                        No captain assigned
                    </div>
                )}
            </div>

            {/* MVP Card */}
            <div className="relative rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-100/40 dark:from-emerald-950/20 to-slate-50/60 dark:to-slate-900/40 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 blur-[60px] rounded-full" />

                <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                    <Sparkles size={11} fill="currentColor" />
                    Most Valuable
                </div>

                {mvp ? (
                    <>
                        <div className="relative flex-shrink-0 mb-3">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                            <PlayerAvatar
                                id={mvp.id}
                                name={mvp.name}
                                role={mvp.role}
                                photoUrl={mvp.photo_url}
                                size="lg"
                            />
                        </div>
                        <div className="w-full min-w-0">
                            <h4 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white uppercase tracking-tighter truncate w-full">
                                {mvp.name}
                            </h4>
                            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1 mb-3 truncate w-full">
                                {mvp.role}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/80 dark:bg-slate-950/80 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm inline-block max-w-full">
                                <span className="truncate block">{formatPrice(mvp.sold_price)}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-600 text-sm italic">
                        No non-captain signings
                    </div>
                )}
            </div>
        </div>
    );
}
