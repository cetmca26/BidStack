"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Player } from "@/lib/hooks/useAuctionState";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Card } from "@/components/ui/card";
import { Crown, Sparkles, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface TeamRosterPanelProps {
    captain: Player | null;
    mvp: Player | null;
    teamPlayers: Player[];
}

export function TeamRosterPanel({ captain, mvp, teamPlayers }: TeamRosterPanelProps) {
    return (
        <div className="flex flex-col gap-3 sm:gap-4 h-full">
            {/* Captain & MVP Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Captain Card */}
                <div className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/40 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 blur-[60px] rounded-full" />

                    {/* Top Label */}
                    <div className="flex items-center gap-2 text-amber-500 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <Crown size={11} fill="currentColor" />
                        Captain
                    </div>

                    {captain ? (
                        <>
                            {/* Player Avatar */}
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

                            {/* Player Details */}
                            <div className="w-full min-w-0">
                                <h4 className="text-base sm:text-lg font-heading font-bold text-white uppercase tracking-tighter truncate w-full">
                                    {captain.name}
                                </h4>
                                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-1 mb-3 truncate w-full">
                                    {captain.role}
                                </div>
                                <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/40 text-amber-400 font-mono font-bold text-sm inline-block max-w-full">
                                    <span className="truncate block">{formatPrice(captain.sold_price)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-6 text-slate-600 text-sm italic">
                            No captain assigned
                        </div>
                    )}
                </div>

                {/* MVP Card */}
                <div className="relative rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900/40 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 blur-[60px] rounded-full" />

                    {/* Top Label */}
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <Sparkles size={11} fill="currentColor" />
                        Most Valuable
                    </div>

                    {mvp ? (
                        <>
                            {/* Player Avatar */}
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

                            {/* Player Details */}
                            <div className="w-full min-w-0">
                                <h4 className="text-base sm:text-lg font-heading font-bold text-white uppercase tracking-tighter truncate w-full">
                                    {mvp.name}
                                </h4>
                                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1 mb-3 truncate w-full">
                                    {mvp.role}
                                </div>
                                <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-sm inline-block max-w-full">
                                    <span className="truncate block">{formatPrice(mvp.sold_price)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-6 text-slate-600 text-sm italic">
                            No non-captain signings
                        </div>
                    )}
                </div>
            </div>

            {/* Roster Feed */}
            {/* <Card className="flex-1 border-slate-800 bg-slate-900/50 backdrop-blur-md p-4 sm:p-5 overflow-hidden flex flex-col">
                <div className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                    Roster Feed
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {[...teamPlayers].reverse().map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center justify-between border-l-2 border-emerald-500 bg-slate-950/40 p-2.5 sm:p-3 rounded-r-xl"
                        >
                            <div>
                                <div className="text-xs sm:text-sm font-bold text-slate-200">{p.name}</div>
                                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black">
                                    {p.role}
                                    {p.is_captain && " • Captain"}
                                </div>
                            </div>
                            <div className="text-right font-mono text-emerald-500 font-bold text-xs sm:text-sm">
                                {formatPrice(p.sold_price)}
                            </div>
                        </div>
                    ))}
                    {teamPlayers.length === 0 && (
                        <div className="h-full flex items-center justify-center text-slate-600 text-[10px] uppercase font-bold tracking-widest italic">
                            Feed Empty
                        </div>
                    )}
                </div>
            </Card> */}

            <style dangerouslySetInnerHTML={{
                __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        `,
            }} />
        </div>
    );
}
