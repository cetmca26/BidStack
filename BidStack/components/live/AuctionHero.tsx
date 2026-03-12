"use client"

import { motion } from "framer-motion"
import { formatPriceCompact } from "@/lib/utils"

export default function AuctionHero({
    player,
    bid,
    basePrice,
    team
}: any) {

    return (
        <div className="relative w-full h-full flex flex-col xl:flex-row overflow-hidden rounded-2xl bg-white dark:bg-[#03070a] shadow-lg border border-slate-200 dark:border-slate-800">

            {/* LEFT SIDE — PLAYER IMAGE */}
            <div className="relative xl:w-1/2 w-full min-h-[200px] xl:min-h-0 flex-shrink-0 overflow-hidden">

                <img
                    src={player.photo_url}
                    alt={player.name}
                    className="w-full h-auto max-h-[60vh] xl:max-h-full object-contain object-top"
                />

                {/* gradient fade — bottom on mobile, right on desktop */}
                <div className="absolute inset-0 bg-gradient-to-b xl:bg-gradient-to-r from-transparent via-transparent to-white dark:to-[#03070a]" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/40 dark:from-black/40 via-transparent to-transparent hidden xl:block" />

            </div>


            {/* RIGHT SIDE */}
            <div className="relative xl:w-1/2 w-full min-w-0 flex flex-col justify-center px-[clamp(1.5rem,1rem+2vw,4rem)] py-[clamp(1rem,0.8rem+1.5vw,2.5rem)] gap-[clamp(0.75rem,0.5rem+1vw,1.5rem)]">

                {/* LIVE AUCTION */}
                <div className="flex items-center gap-2 text-red-400 text-xs tracking-[0.35em] font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    LIVE AUCTION
                </div>


                {/* PLAYER NAME */}
                <h1 className="text-[clamp(2rem,1.5rem+3vw,4.5rem)] font-extrabold italic text-slate-900 dark:text-white leading-[0.9] tracking-tight">
                    {player.name}
                </h1>


                {/* BASE PRICE */}
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 tracking-widest">

                    BASE PRICE

                    <div className="h-[1px] w-16 md:w-24 bg-slate-300 dark:bg-slate-700" />

                    ₹{basePrice.toLocaleString("en-IN")}

                </div>


                {/* BID PANEL */}
                <motion.div
                    key={bid}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="relative mt-2 md:mt-4 w-full max-w-md"
                >

                    {/* glow */}
                    <div className="absolute inset-0 bg-emerald-500 blur-[90px] opacity-40 rounded-xl" />

                    <div className="relative bg-emerald-500 rounded-xl px-[clamp(1.25rem,1rem+1.5vw,2.5rem)] py-[clamp(1rem,0.8rem+1vw,2rem)] shadow-lg">

                        <div className="text-[10px] tracking-[0.35em] font-bold text-black/70 mb-2">
                            CURRENT BID
                        </div>

                        <div className="flex flex-col justify-end mt-1">
                            <div className="text-[clamp(1.75rem,1.5rem+2vw,3rem)] font-black italic text-black tracking-tight leading-none">
                                ₹{bid.toLocaleString("en-IN")}
                            </div>
                            <div className="text-sm font-bold text-black/60 italic tracking-wider mt-1">
                                {formatPriceCompact(bid)}
                            </div>
                        </div>


                        {/* TEAM */}
                        <div className="flex items-center gap-3 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-black/20">

                            <span className="text-[10px] tracking-[0.3em] font-bold text-black/60">
                                HELD BY
                            </span>

                            <div className="flex items-center gap-2">

                                <img
                                    src={team?.logo_url}
                                    className="w-6 h-6 md:w-7 md:h-7 rounded-full"
                                />

                                <span className="font-bold text-black text-sm md:text-base">
                                    {team?.name}
                                </span>

                            </div>

                        </div>

                    </div>

                </motion.div>

            </div>

        </div>
    )
}