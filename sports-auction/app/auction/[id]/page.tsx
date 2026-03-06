"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  sport_type: "football" | "cricket";
  is_registration_open: boolean;
  status: "upcoming" | "live" | "completed";
  settings: AuctionSettings;
};

type Player = {
  id: string;
  auction_id: string;
  name: string;
  role: string;
  status: "upcoming" | "live" | "sold" | "unsold";
  sold_price: number | null;
  sold_team_id: string | null;
};

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: auctionId } = use(params);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lockData = window.localStorage.getItem(`registered_${auctionId}`);
      if (lockData === "true") {
        setHasRegistered(true);
      }
    }
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;
    const load = async () => {
      const [{ data: auctionData, error: auctionError }, { data: playersData }] = await Promise.all([
        supabase.from("auctions").select("*").eq("id", auctionId).single(),
        supabase.from("players").select("*").eq("auction_id", auctionId),
      ]);

      if (auctionError || !auctionData) {
        router.push("/");
        return;
      }

      setAuction(auctionData as Auction);
      setPlayers((playersData ?? []) as Player[]);
    };

    load();
  }, [auctionId, router]);

  useEffect(() => {
    if (!auctionId) return;
    const channel = supabase
      .channel(`public_auction_${auctionId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auctions", filter: `id=eq.${auctionId}` },
        (payload) => {
          if (payload.new) setAuction(payload.new as Auction);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `auction_id=eq.${auctionId}` },
        () => {
          supabase.from("players").select("*").eq("auction_id", auctionId).then(({ data }) => {
            if (data) setPlayers(data as Player[]);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  const roleOptions = useMemo(() => {
    if (!auction) return [];
    if (auction.sport_type === "football") {
      return ["Forward", "Midfielder", "Defender", "Goalkeeper"];
    }
    return ["Batsman", "Bowler", "Allrounder", "Wicketkeeper"];
  }, [auction]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;
    if (!name.trim() || !role || !phoneNumber.trim()) {
      setError("Please fill out all required fields.");
      setSuccess(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      let ipAddress = null;
      try {
        const ipReq = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipReq.json();
        ipAddress = ipData.ip;
      } catch (err) {
        console.warn("Could not fetch IP", err);
      }

      const { error: insertError } = await supabase.from("players").insert({
        auction_id: auction.id,
        name: name.trim(),
        role,
        phone_number: phoneNumber.trim(),
        ip_address: ipAddress,
      });

      if (insertError) {
        if (insertError.code === "23505" || insertError.message.includes("unique")) {
          setError("A registration with this phone number already exists.");
        } else {
          setError(insertError.message);
        }
      } else {
        setSuccess("Registration submitted successfully.");
        setName("");
        setRole("");
        setPhoneNumber("");
        if (typeof window !== "undefined") {
          window.localStorage.setItem(`registered_${auctionId}`, "true");
        }
        setHasRegistered(true);
        const { data: playersData } = await supabase
          .from("players")
          .select("*")
          .eq("auction_id", auctionId);
        setPlayers((playersData ?? []) as Player[]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!auction) {
    return <div className="p-6 text-slate-50">Loading auction...</div>;
  }

  const upcomingPlayers = players.filter((p) => p.status === "upcoming");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {auction.name}
              </h1>
              {auction.status === "live" && (
                <span className="flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-400 ring-1 ring-rose-500/30">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
                  </span>
                  Live
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300">
              Auction for {auction.sport_type === "football" ? "Football" : "Cricket"} players.
            </p>
          </div>
          {auction.status === "live" && (
            <Button
              onClick={() => router.push(`/live/${auctionId}`)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 animate-bounce"
            >
              JOIN LIVE AUCTION
            </Button>
          )}
        </header>

        <div className="grid gap-6 md:grid-cols-[3fr,2fr]">
          <Card className="border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/60">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Registered Players
            </h2>
            {players.length === 0 ? (
              <p className="text-sm text-slate-400">
                No players have registered for this auction yet.
              </p>
            ) : (
              <div className="max-h-[360px] space-y-2 overflow-y-auto text-sm">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-800/70 bg-slate-950/60 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">
                        {player.role}
                      </div>
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">
                      {player.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/60">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Register for this Auction
            </h2>
            {hasRegistered ? (
              <div className="flex h-32 items-center justify-center rounded-lg border border-emerald-900/50 bg-emerald-900/20 px-4 text-center text-sm font-medium text-emerald-400">
                You have already submitted a registration for this auction.
              </div>
            ) : !auction.is_registration_open ? (
              <div className="flex h-32 items-center justify-center rounded-lg border border-amber-900/50 bg-amber-900/20 px-4 text-center text-sm font-medium text-amber-400">
                Registration is currently closed.
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-slate-950/80"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="bg-slate-950/80"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Select role</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-slate-400">
                  Upcoming players registered here will enter the{" "}
                  <span className="font-medium text-slate-200">upcoming pool</span> for the auction.
                </div>
                {error && <p className="text-xs text-rose-400">{error}</p>}
                {success && <p className="text-xs text-emerald-400">{success}</p>}
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Register"}
                </Button>
              </form>
            )}

            {upcomingPlayers.length > 0 && (
              <p className="mt-4 text-xs text-slate-400">
                Currently{" "}
                <span className="font-semibold text-slate-200">
                  {upcomingPlayers.length} upcoming player
                  {upcomingPlayers.length === 1 ? "" : "s"}
                </span>{" "}
                in this auction.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

