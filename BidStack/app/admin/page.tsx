"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Auction = {
  id: string;
  name: string;
  sport_type: string;
  status?: "upcoming" | "live" | "completed";
  settings: {
    purse: number;
    min_players: number;
    max_players: number;
    base_price: number;
    increment: number;
    captain_base_price?: number;
  };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState("");
  const [sportType, setSportType] = useState<"football" | "cricket">("football");
  const [purse, setPurse] = useState("1000");
  const [minPlayers, setMinPlayers] = useState("7");
  const [maxPlayers, setMaxPlayers] = useState("11");
  const [basePrice, setBasePrice] = useState("10");
  const [captainBasePrice, setCaptainBasePrice] = useState("50");
  const [increment, setIncrement] = useState("5");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createSectionRef = useRef<HTMLDivElement | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

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
        .maybeSingle();

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("auctions")
        .select("id, name, sport_type, status, settings");

      if (error) {
        // Fallback for databases where status column has not been added yet
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("auctions")
          .select("id, name, sport_type, settings");
        if (fallbackError) {
          console.error("Error fetching auctions fallback:", fallbackError.message);
          setAuctions([]);
        } else {
          setAuctions((fallbackData ?? []) as Auction[]);
        }
      } else {
        setAuctions((data ?? []) as Auction[]);
      }
    };
    if (!checkingAuth) {
      load();
    }
  }, [checkingAuth]);

  useEffect(() => {
    if (checkingAuth) return;

    const channel = supabase
      .channel("dashboard_auctions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auctions" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Auction;
            setAuctions((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
          } else if (payload.eventType === "INSERT") {
            const newAuction = payload.new as Auction;
            setAuctions((prev) => {
              if (prev.some(a => a.id === newAuction.id)) return prev;
              return [...prev, newAuction];
            });
          } else if (payload.eventType === "DELETE") {
            setAuctions((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkingAuth]);

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const purseVal = Number(purse);
    const minVal = Number(minPlayers);
    const maxVal = Number(maxPlayers);
    const baseVal = Number(basePrice);
    const captBaseVal = Number(captainBasePrice);
    const incVal = Number(increment);

    if (!name.trim()) {
      setError("Auction name is required.");
      setCreating(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from("auctions").insert({
        name: name.trim(),
        sport_type: sportType,
        settings: {
          purse: purseVal,
          min_players: minVal,
          max_players: maxVal,
          base_price: baseVal,
          increment: incVal,
          captain_base_price: captBaseVal,
        },
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        setName("");
        // Reuse the same loading logic (with status fallback) after create
        const { data, error } = await supabase
          .from("auctions")
          .select("id, name, sport_type, status, settings");
        if (error) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("auctions")
            .select("id, name, sport_type, settings");
          if (!fallbackError) {
            setAuctions((fallbackData ?? []) as Auction[]);
          }
        } else {
          setAuctions((data ?? []) as Auction[]);
        }
      }
    } finally {
      setCreating(false);
    }
  };

  const formattedAuctions = useMemo(
    () =>
      auctions.map((a) => ({
        ...a,
        sportLabel: a.sport_type.toUpperCase(),
        statusEffective: a.status ?? "upcoming",
        statusLabel:
          (a.status ?? "upcoming") === "live"
            ? "Live"
            : (a.status ?? "upcoming") === "completed"
              ? "Completed"
              : "Upcoming",
      })),
    [auctions],
  );

  if (checkingAuth) {
    return <div className="p-6 text-slate-50">Checking admin access...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin · Auctions</h1>
            <p className="text-sm text-slate-300">
              Select an auction to open the live controller.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setShowCreateForm((prev) => !prev);
                if (!showCreateForm) {
                  createSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {showCreateForm ? "Close Form" : "Create Auction"}
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Landing
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          {showCreateForm && (
            <Card
              ref={createSectionRef}
              className="border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/60"
            >
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Create Auction
              </h2>
              <form className="grid gap-3 text-sm md:grid-cols-2" onSubmit={handleCreateAuction}>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="auction-name" className="text-slate-100">
                    Name
                  </Label>
                  <Input
                    id="auction-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-950/80 text-slate-50"
                    placeholder="Summer League Auction"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sport" className="text-slate-100">
                    Sport
                  </Label>
                  <select
                    id="sport"
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value as "football" | "cricket")}
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="football">Football</option>
                    <option value="cricket">Cricket</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="purse" className="text-slate-100">
                    Purse per Team
                  </Label>
                  <Input
                    id="purse"
                    type="number"
                    value={purse}
                    onChange={(e) => setPurse(e.target.value)}
                    className="bg-slate-950/80 text-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="minPlayers" className="text-slate-100">
                    Min Players / Team
                  </Label>
                  <Input
                    id="minPlayers"
                    type="number"
                    value={minPlayers}
                    onChange={(e) => setMinPlayers(e.target.value)}
                    className="bg-slate-950/80 text-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maxPlayers" className="text-slate-100">
                    Max Players / Team
                  </Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    className="bg-slate-950/80 text-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="basePrice" className="text-slate-100">
                    Base Price
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="bg-slate-950/80 text-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="captBasePrice" className="text-slate-100">
                    Captain Base Price
                  </Label>
                  <Input
                    id="captBasePrice"
                    type="number"
                    value={captainBasePrice}
                    onChange={(e) => setCaptainBasePrice(e.target.value)}
                    className="bg-slate-950/80 text-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="increment" className="text-slate-100">
                    Bid Increment
                  </Label>
                  <Input
                    id="increment"
                    type="number"
                    value={increment}
                    onChange={(e) => setIncrement(e.target.value)}
                    className="bg-slate-950/80 text-slate-50"
                  />
                </div>
                {error && (
                  <p className="md:col-span-2 text-xs text-rose-400">
                    {error}
                  </p>
                )}
                <div className="md:col-span-2">
                  <Button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create Auction"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Card className="border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/60">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Existing Auctions
            </h2>
            {formattedAuctions.length === 0 ? (
              <p className="text-sm text-slate-400">
                No auctions found. Create an auction to get started.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                {formattedAuctions.map((auction) => {
                  const canStart = auction.statusEffective === "upcoming";
                  const canViewLive = auction.statusEffective === "live";
                  return (
                    <div
                      key={auction.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                    >
                      <div>
                        <div className="font-semibold">{auction.name}</div>
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-400">
                          <span>{auction.sportLabel}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-500" />
                          <span
                            className={
                              auction.statusEffective === "live"
                                ? "text-emerald-300"
                                : auction.statusEffective === "completed"
                                  ? "text-slate-300"
                                  : "text-amber-300"
                            }
                          >
                            {auction.statusLabel}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {auction.statusEffective === "upcoming" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => router.push(`/admin/auction/${auction.id}/teams`)}
                          >
                            Verify & Teams
                          </Button>
                        )}
                        {auction.statusEffective === "live" && (
                          <Link href={`/admin/auction/${auction.id}/teams`}>
                            <Button size="sm" variant="outline">
                              Verify & Teams
                            </Button>
                          </Link>
                        )}
                        {auction.statusEffective === "live" && (
                          <Link href={`/admin/auction/${auction.id}`}>
                            <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/50">
                              Open Controller
                            </Button>
                          </Link>
                        )}
                        {auction.statusEffective === "completed" && (
                          <Link href={`/admin/auction/${auction.id}`}>
                            <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-500 text-amber-50">
                              View Squads
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={!canViewLive}
                          onClick={() => {
                            if (canViewLive) {
                              router.push(`/live/${auction.id}`);
                            }
                          }}
                        >
                          View Live
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

