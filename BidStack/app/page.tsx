"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

type AuctionSettings = {
  purse: number;
  min_players: number;
  max_players: number;
  base_price: number;
  increment: number;
};

type Auction = {
  id: string;
  name: string;
  sport_type: string;
  status?: "upcoming" | "live" | "completed";
  settings: AuctionSettings;
};

type AuctionState = {
  auction_id: string;
  phase: string;
  current_player_id: string | null;
};

export default function Home() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [states, setStates] = useState<AuctionState[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: auctionsData }, { data: stateData }] = await Promise.all([
        supabase.from("auctions").select("*"),
        supabase.from("auction_state").select("auction_id, phase, current_player_id"),
      ]);

      setAuctions((auctionsData ?? []) as Auction[]);
      setStates((stateData ?? []) as AuctionState[]);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("public_home")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auctions" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Auction;
            setAuctions((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
          } else if (payload.eventType === "INSERT") {
            setAuctions((prev) => [...prev, payload.new as Auction]);
          } else if (payload.eventType === "DELETE") {
            setAuctions((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auction_state" },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            const newState = payload.new as AuctionState;
            setStates((prev) => {
              const other = prev.filter(s => s.auction_id !== newState.auction_id);
              return [...other, newState];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const liveAuctionIds = useMemo(() => {
    return new Set(
      auctions
        .filter((a) => a.status === "live")
        .map((a) => a.id)
    );
  }, [auctions]);

  const hasLiveAuctions = liveAuctionIds.size > 0;

  return (
    <div className="min-h-screen bg-[url('/CourtSide_landing.png')] bg-cover bg-center bg-fixed relative bg-surface">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 pointer-events-none"></div>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-8 lg:px-12 lg:py-12">
        <header className="mb-8 md:mb-12 flex flex-col items-start justify-between gap-4 md:gap-6 md:flex-row md:items-center">
          <div className="max-w-md">
            <h1 className="tracking-tight text-4xl sm:text-5xl font-bold text-on-surface" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              BIDSTACK
            </h1>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg leading-relaxed text-on-surface/80">
              Official Auction platform for MCA Premier League 2026.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <ThemeToggle />
            <Link href="/admin/login">
              <Button variant="outline" size="lg" className="border-2 border-brand text-on-surface hover:bg-brand/10 font-bold uppercase transition-all duration-300">
                Admin Login
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-5">
          <Card className="col-span-1 md:col-span-2 border-2 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-3xl bg-surface-alt/75 dark:bg-surface-alt/75 border-border-ui">
            <div className="border-b-2 px-4 sm:px-6 py-4 sm:py-5 border-border-ui/30">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-on-surface-muted">
                  Live Auctions
                </h2>
                {hasLiveAuctions && (
                  <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider animate-pulse whitespace-nowrap bg-brand text-on-surface">
                    Live now
                  </span>
                )}
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              {auctions.filter((a) => (a.status ?? "upcoming") === "live" && liveAuctionIds.has(a.id))
                .length === 0 ? (
                <p className="text-sm text-center py-8 text-on-surface dark:text-on-surface">
                  No auctions are live right now. Check the upcoming auctions below.
                </p>
              ) : (
                <div className="space-y-3">
                  {auctions
                    .filter((a) => (a.status ?? "upcoming") === "live" && liveAuctionIds.has(a.id))
                    .map((auction) => (
                      <div
                        key={auction.id}
                        className="flex flex-col gap-3 rounded-lg border-2 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:scale-105 border-brand bg-brand/15 shadow-[0_0_20px_rgba(230,168,80,0.2)]"
                      >
                        <div>
                          <div className="text-sm font-semibold text-on-surface">{auction.name}</div>
                          <div className="text-xs uppercase tracking-[0.18em] mt-1 text-brand">
                            {auction.sport_type.toUpperCase()} · Live Auction
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Link href={`/live/${auction.id}`} className="flex-1">
                            <Button size="sm" className="w-full transition-all duration-300 hover:shadow-lg bg-brand text-on-surface font-bold">
                              View Live
                            </Button>
                          </Link>
                          <Link href={`/auction/${auction.id}`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full border-2 transition-all duration-300 hover:shadow-lg border-border-ui text-on-surface">
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="col-span-1 md:col-span-3 border-2 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-3xl bg-surface-alt/75 dark:bg-surface-alt/75 border-border-ui">
            <div className="border-b-2 px-4 sm:px-6 py-4 sm:py-5 border-border-ui/30">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-on-surface-muted">
                  All Auctions
                </h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand/20 text-on-surface-muted">
                  {auctions.length} {auctions.length === 1 ? "auction" : "auctions"}
                </span>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              {auctions.length === 0 ? (
                <p className="text-sm text-center py-8 text-on-surface">
                  No auctions have been created yet. Once an admin creates an auction, it will appear here.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auctions.map((auction) => {
                    const status = auction.status ?? "upcoming";
                    const isLive = status === "live" && liveAuctionIds.has(auction.id);
                    return (
                      <div
                        key={auction.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 backdrop-blur-md transition-all duration-300 border-border-ui bg-surface-alt/50"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-on-surface">{auction.name}</div>
                          <div className="text-xs uppercase tracking-[0.18em] mt-1 text-on-surface-muted">
                            {auction.sport_type.toUpperCase()}
                            <span className={`ml-2 ${status === "live" ? "text-brand" : "text-on-surface-muted"}`}>
                              • {status === "live" ? "LIVE" : status === "completed" ? "COMPLETED" : "UPCOMING"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                          {status === "completed" ? (
                            <Link href={`/live/${auction.id}`} className="flex-1 sm:flex-none">
                              <Button size="sm" className="w-full sm:w-auto transition-all duration-300 hover:shadow-lg bg-brand text-on-surface font-bold">
                                View Squads
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/auction/${auction.id}`} className="flex-1 sm:flex-none">
                              <Button size="sm" variant="outline" className="w-full sm:w-auto border-2 transition-all duration-300 border-border-ui text-on-surface">
                                View &amp; Register
                              </Button>
                            </Link>
                          )}
                          {isLive && (
                            <Link href={`/live/${auction.id}`} className="flex-1 sm:flex-none">
                              <Button size="sm" variant="ghost" className="w-full sm:w-auto transition-all duration-300 text-brand">
                                Watch
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
