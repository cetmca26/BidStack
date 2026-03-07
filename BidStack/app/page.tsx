"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    // If auction.status is 'live', it should be treated as live regardless of phase
    return new Set(
      auctions
        .filter((a) => a.status === "live")
        .map((a) => a.id)
    );
  }, [auctions]);

  const hasLiveAuctions = liveAuctionIds.size > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-fluid-lg text-slate-50">
      <div className="container-fluid flex flex-col gap-fluid-lg">
        <header className="flex flex-col items-start justify-between gap-fluid-md md:flex-row md:items-center">
          <div className="max-w-(--breakpoint-md)">
            <h1 className="tracking-tight">
              Sports Auction Platform
            </h1>
            <p className="mt-fluid-sm text-sm text-slate-300">
              Join live player auctions, track teams in real time, and register for upcoming events.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/login">
              <Button variant="outline" className="text-black" color="black" size="sm">
                Admin Login
              </Button>
            </Link>
          </div>
        </header>

        <section className="fluid-grid">
          <Card className="col-span-12 md:col-span-5 border-slate-800 bg-slate-900/70 shadow-xl shadow-black/60">
            <div className="mb-fluid-sm flex items-center justify-between px-fluid pt-fluid">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Live Auctions
              </h2>
              {hasLiveAuctions && (
                <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-medium text-emerald-300">
                  Live now
                </span>
              )}
            </div>
            {auctions.filter((a) => (a.status ?? "upcoming") === "live" && liveAuctionIds.has(a.id))
              .length === 0 ? (
              <p className="text-sm text-slate-400">
                No auctions are live right now. Check the upcoming auctions below.
              </p>
            ) : (
              <div className="space-y-3">
                {auctions
                  .filter((a) => (a.status ?? "upcoming") === "live" && liveAuctionIds.has(a.id))
                  .map((auction) => (
                    <div
                      key={auction.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-3"
                    >
                      <div>
                        <div className="text-sm font-semibold">{auction.name}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-emerald-300">
                          {auction.sport_type.toUpperCase()} · Live Auction
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/live/${auction.id}`}>
                          <Button size="sm" variant="default">
                            View Live
                          </Button>
                        </Link>
                        <Link href={`/auction/${auction.id}`}>
                          <Button size="sm" variant="outline">
                            Details &amp; Register
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>

          <Card className="col-span-12 md:col-span-7 border-slate-800 bg-slate-900/70 shadow-xl shadow-black/60">
            <div className="mb-fluid-sm flex items-center justify-between px-fluid pt-fluid">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                All Auctions
              </h2>
              <span className="text-xs text-slate-400">
                {auctions.length} {auctions.length === 1 ? "auction" : "auctions"}
              </span>
            </div>
            {auctions.length === 0 ? (
              <p className="text-sm text-slate-400">
                No auctions have been created yet. Once an admin creates an auction, it will appear
                here.
              </p>
            ) : (
              <div className="space-y-3">
                {auctions.map((auction) => {
                  const status = auction.status ?? "upcoming";
                  const isLive = status === "live" && liveAuctionIds.has(auction.id);
                  return (
                    <div
                      key={auction.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3"
                    >
                      <div>
                        <div className="text-sm font-semibold">{auction.name}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {auction.sport_type.toUpperCase()}
                          {status === "live" ? " · Live" : status === "completed" ? " · Completed" : " · Upcoming / Scheduled"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {status === "completed" ? (
                          <Link href={`/live/${auction.id}`}>
                            <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-500 text-amber-50">
                              View Squads
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/auction/${auction.id}`}>
                            <Button size="sm" variant="outline">
                              View &amp; Register
                            </Button>
                          </Link>
                        )}
                        {isLive && (
                          <Link href={`/live/${auction.id}`}>
                            <Button size="sm" variant="ghost">
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
          </Card>
        </section>
      </div>
    </div >
  );
}
