"use client";

import { Player } from "@/lib/hooks/useAuctionState";
import { Crown, Sparkles } from "lucide-react";
import { formatPrice, formatPriceCompact } from "@/lib/utils";

interface TeamStarPlayersProps {
    captain: Player | null;
    mvp: Player | null;
}

export function TeamStarPlayers({ captain, mvp }: TeamStarPlayersProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 pb-5">
            {/* Captain Card */}
            <div className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-100/40 dark:from-amber-950/30 to-slate-50/60 dark:to-slate-900/40 overflow-visible h-[200px]">
                {captain ? (
                    <>
                        {/* Top Title Pill — straddles top edge */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 bg-amber-50 dark:bg-slate-900 border border-amber-400 dark:border-amber-600 px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                            <Crown size={10} fill="currentColor" className="text-amber-500" />
                            <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.25em]">Captain</span>
                        </div>

                        {/* Rectangle photo — clipped inside the div */}
                        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                            {captain.photo_url ? (
                                <img
                                    src={captain.photo_url}
                                    alt={captain.name}
                                    className="w-full h-full object-contain object-center"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-heading font-black text-amber-300/20 dark:text-amber-800/20 text-[6rem]">
                                    {captain.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Bottom Price Pill — straddles bottom edge */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 flex flex-col items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-400/50 dark:border-amber-600/50 px-3 py-1 rounded-xl shadow-lg whitespace-nowrap">
                            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{formatPrice(captain.sold_price)}</span>
                            <span className="text-[8px] text-amber-500/70 font-medium italic leading-tight">({formatPriceCompact(captain.sold_price)})</span>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-600 text-sm italic">
                        No captain assigned
                    </div>
                )}
            </div>

            {/* MVP Card */}
            <div className="relative rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-100/40 dark:from-emerald-950/30 to-slate-50/60 dark:to-slate-900/40 overflow-visible h-[200px]">
                {mvp ? (
                    <>
                        {/* Top Title Pill — straddles top edge */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 bg-emerald-50 dark:bg-slate-900 border border-emerald-400 dark:border-emerald-600 px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                            <Sparkles size={10} fill="currentColor" className="text-emerald-500" />
                            <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em]">Most Valuable</span>
                        </div>

                        {/* Rectangle photo — clipped inside the div */}
                        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                            {mvp.photo_url ? (
                                <img
                                    src={mvp.photo_url}
                                    alt={mvp.name}
                                    className="w-full h-full object-contain object-center"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-heading font-black text-emerald-300/20 dark:text-emerald-800/20 text-[6rem]">
                                    {mvp.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Bottom Price Pill — straddles bottom edge */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 flex flex-col items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-emerald-400/50 dark:border-emerald-600/50 px-3 py-1 rounded-xl shadow-lg whitespace-nowrap">
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(mvp.sold_price)}</span>
                            <span className="text-[8px] text-emerald-500/70 font-medium italic leading-tight">({formatPriceCompact(mvp.sold_price)})</span>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-600 text-sm italic">
                        No non-captain signings
                    </div>
                )}
            </div>
        </div>
    );
}
