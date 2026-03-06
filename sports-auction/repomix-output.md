This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.gitignore
app/admin/auction/[id]/page.tsx
app/admin/auction/[id]/teams/page.tsx
app/admin/login/page.tsx
app/admin/page.tsx
app/auction/[id]/page.tsx
app/favicon.ico
app/globals.css
app/layout.tsx
app/live/[id]/page.tsx
app/page.tsx
components.json
components/ui/button.tsx
components/ui/card.tsx
components/ui/dialog.tsx
components/ui/form.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/table.tsx
eslint.config.mjs
lib/supabase.ts
lib/utils.ts
next.config.ts
package.json
postcss.config.mjs
public/file.svg
public/globe.svg
public/next.svg
public/vercel.svg
public/window.svg
README.md
supabase/.gitignore
supabase/config.toml
supabase/migrations/0001_auction_engine.sql
supabase/migrations/0002_captain_round.sql
supabase/migrations/0003_auction_status.sql
tsconfig.json
```

# Files

## File: app/admin/auction/[id]/page.tsx
````typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  settings: AuctionSettings;
};

type Team = {
  id: string;
  auction_id: string;
  name: string;
  manager: string;
  purse_remaining: number;
  slots_remaining: number;
  captain_id: string | null;
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

type AuctionState = {
  id: string;
  auction_id: string;
  current_player_id: string | null;
  current_bid: number | null;
  leading_team_id: string | null;
  phase: string;
};

export default function AdminAuctionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const auctionId = params?.id as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [state, setState] = useState<AuctionState | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  const currentPlayer = useMemo(
    () => players.find((p) => p.id === state?.current_player_id) ?? null,
    [players, state?.current_player_id],
  );

  const leadingTeam = useMemo(
    () => teams.find((t) => t.id === state?.leading_team_id) ?? null,
    [teams, state?.leading_team_id],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const authed = window.localStorage.getItem("admin_auth") === "true";
    if (!authed) {
      router.replace("/admin/login");
    } else {
      setIsAuthed(true);
    }
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    const loadInitial = async () => {
      const [{ data: auctionData }, { data: teamsData }, { data: playersData }, { data: stateData }] =
        await Promise.all([
          supabase.from("auctions").select("*").eq("id", auctionId).single(),
          supabase.from("teams").select("*").eq("auction_id", auctionId),
          supabase.from("players").select("*").eq("auction_id", auctionId),
          supabase.from("auction_state").select("*").eq("auction_id", auctionId).maybeSingle(),
        ]);
      if (!auctionData) {
        router.push("/");
        return;
      }

      setAuction(auctionData as Auction);
      setTeams((teamsData ?? []) as Team[]);
      setPlayers((playersData ?? []) as Player[]);
      if (stateData) setState(stateData as AuctionState);
    };

    loadInitial();
  }, [auctionId, router]);

  useEffect(() => {
    const channel = supabase
      .channel("auction")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auction_state", filter: `auction_id=eq.${auctionId}` },
        (payload) => {
          if (payload.new) setState(payload.new as AuctionState);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams", filter: `auction_id=eq.${auctionId}` },
        () => {
          supabase.from("teams").select("*").eq("auction_id", auctionId).then(({ data }) => {
            if (data) setTeams(data as Team[]);
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `auction_id=eq.${auctionId}` },
        () => {
          supabase.from("players").select("*").eq("auction_id", auctionId).then(({ data }) => {
            if (data) setPlayers(data as Player[]);
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  if (checkingAuth) {
    return <div className="p-6 text-lg text-slate-50">Checking admin access...</div>;
  }

  if (!isAuthed) {
    return null;
  }

  if (!auction) {
    return <div className="p-6 text-lg">Loading auction...</div>;
  }

  const settings = auction.settings;
  const allTeamsHaveCaptain = teams.length > 0 && teams.every((t) => t.captain_id);

  const computeCanBid = (team: Team) => {
    if (!settings) return false;
    if (!state) return false;
    if (!state.current_player_id) return false;

    const basePrice = Number(settings.base_price ?? 0);
    const increment = Number(settings.increment ?? 0);
    const currentBid = state.current_bid ?? basePrice;
    const nextBid = currentBid + increment;

    const purse = Number(team.purse_remaining ?? 0);
    const slots = team.slots_remaining ?? 0;

    const failsPurse = purse < nextBid;
    const failsSlots = slots <= 0;

    const remainingSlotsAfter = slots - 1;
    const requiredMoney = remainingSlotsAfter * basePrice;
    const failsMinimumSquad = purse - nextBid < requiredMoney;

    return !(failsPurse || failsSlots || failsMinimumSquad);
  };

  const handleNextPlayer = async () => {
    setLoadingAction("next_player");
    try {
      await supabase.rpc("next_player", { p_auction_id: auctionId });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStartBid = async () => {
    setLoadingAction("start_bid");
    try {
      await supabase.rpc("start_bid", { p_auction_id: auctionId });
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePlaceBid = async (teamId: string) => {
    setLoadingAction(`bid_${teamId}`);
    try {
      await supabase.rpc("place_bid", { p_auction_id: auctionId, p_team_id: teamId });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUndoBid = async () => {
    setLoadingAction("undo_bid");
    try {
      await supabase.rpc("undo_bid", { p_auction_id: auctionId });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEndBid = async () => {
    setLoadingAction("end_bid");
    try {
      await supabase.rpc("end_bid", { p_auction_id: auctionId });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Auction Control</h1>
            <p className="text-sm text-slate-400">
              {auction.name} · {auction.sport_type.toUpperCase()}
            </p>
            {!allTeamsHaveCaptain && (
              <p className="mt-1 text-xs text-amber-300">
                Assign captains to every team in{" "}
                <span className="underline">Admin &gt; Manage Teams</span> before starting the live
                auction.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPlayer}
              disabled={loadingAction === "next_player" || !allTeamsHaveCaptain}
            >
              Next Player
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleStartBid}
              disabled={
                loadingAction === "start_bid" || !state?.current_player_id || !allTeamsHaveCaptain
              }
            >
              Start Bid
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUndoBid}
              disabled={loadingAction === "undo_bid"}
            >
              Undo Bid
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndBid}
              disabled={loadingAction === "end_bid" || !state?.current_player_id}
            >
              End Bid
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
          <Card className="border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/50">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
              Current Player
            </h2>
            {currentPlayer ? (
              <div className="space-y-2">
                <div className="text-xl font-semibold">{currentPlayer.name}</div>
                <div className="text-sm text-slate-400">{currentPlayer.role}</div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-slate-900/80 px-3 py-2">
                    <div className="text-xs uppercase text-slate-400">Base Price</div>
                    <div className="text-lg font-semibold">
                      {settings.base_price.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="rounded-md bg-slate-900/80 px-3 py-2">
                    <div className="text-xs uppercase text-slate-400">Increment</div>
                    <div className="text-lg font-semibold">
                      +{settings.increment.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="rounded-md bg-emerald-900/40 px-3 py-2">
                    <div className="text-xs uppercase text-emerald-300">Current Bid</div>
                    <div className="text-lg font-semibold text-emerald-200">
                      {(state?.current_bid ?? settings.base_price).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="rounded-md bg-slate-900/80 px-3 py-2">
                    <div className="text-xs uppercase text-slate-400">Leading Team</div>
                    <div className="text-lg font-semibold">
                      {leadingTeam ? leadingTeam.name : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                No player selected. Use &quot;Next Player&quot; to draw one.
              </div>
            )}
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/50">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
              Teams · Bid Controls
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {teams.map((team) => {
                const canBid = computeCanBid(team);
                const isLoading = loadingAction === `bid_${team.id}`;

                return (
                  <Button
                    key={team.id}
                    className="flex h-auto flex-col items-start justify-between gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-left text-sm shadow-sm transition hover:border-emerald-500 hover:bg-slate-900"
                    disabled={!canBid || isLoading}
                    onClick={() => handlePlaceBid(team.id)}
                  >
                    <span className="font-semibold">{team.name}</span>
                    <span className="text-[11px] uppercase tracking-wide text-slate-400">
                      {team.manager}
                    </span>
                    <span className="mt-1 text-xs text-slate-300">
                      Purse:{" "}
                      <span className="font-semibold">
                        {team.purse_remaining.toLocaleString("en-IN")}
                      </span>
                    </span>
                    <span className="text-xs text-slate-300">
                      Slots: <span className="font-semibold">{team.slots_remaining}</span>
                    </span>
                    {!canBid && (
                      <span className="mt-1 text-[10px] font-medium uppercase text-amber-300">
                        Cannot Bid
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
````

## File: app/admin/auction/[id]/teams/page.tsx
````typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  sport_type: string;
  settings: AuctionSettings;
};

type Team = {
  id: string;
  auction_id: string;
  name: string;
  manager: string;
  purse_remaining: number;
  slots_remaining: number;
  captain_id: string | null;
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

export default function ManageTeamsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const auctionId = params?.id as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamManager, setTeamManager] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [assigningCaptain, setAssigningCaptain] = useState<string | null>(null);
  const [captainPrice, setCaptainPrice] = useState<Record<string, string>>({});
  const [captainPlayer, setCaptainPlayer] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: auctionData, error: auctionError }, { data: teamData }, { data: playerData }] =
        await Promise.all([
          supabase.from("auctions").select("*").eq("id", auctionId).single(),
          supabase.from("teams").select("*").eq("auction_id", auctionId),
          supabase.from("players").select("*").eq("auction_id", auctionId),
        ]);

      if (auctionError || !auctionData) {
        router.push("/admin");
        return;
      }

      setAuction(auctionData as Auction);
      setTeams((teamData ?? []) as Team[]);
      setPlayers((playerData ?? []) as Player[]);
    };

    load();
  }, [auctionId, router]);

  const upcomingPlayers = useMemo(
    () => players.filter((p) => p.status === "upcoming"),
    [players],
  );

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;
    if (!teamName.trim() || !teamManager.trim()) {
      setError("Team name and manager are required.");
      return;
    }
    setCreatingTeam(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from("teams").insert({
        auction_id: auction.id,
        name: teamName.trim(),
        manager: teamManager.trim(),
        purse_remaining: auction.settings.purse,
        slots_remaining: auction.settings.max_players,
      });
      if (insertError) {
        setError(insertError.message);
      } else {
        setTeamName("");
        setTeamManager("");
        const { data: teamData } = await supabase.from("teams").select("*").eq("auction_id", auctionId);
        setTeams((teamData ?? []) as Team[]);
      }
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleAssignCaptain = async (teamId: string) => {
    const playerId = captainPlayer[teamId];
    const priceStr = captainPrice[teamId];
    if (!playerId || !priceStr) {
      setError("Select a player and enter a price for each captain assignment.");
      return;
    }
    const price = Number(priceStr);
    setAssigningCaptain(teamId);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("assign_captain", {
        p_auction_id: auctionId,
        p_team_id: teamId,
        p_player_id: playerId,
        p_price: price,
      });
      if (rpcError) {
        setError(rpcError.message);
      } else {
        const [{ data: teamData }, { data: playerData }] = await Promise.all([
          supabase.from("teams").select("*").eq("auction_id", auctionId),
          supabase.from("players").select("*").eq("auction_id", auctionId),
        ]);
        setTeams((teamData ?? []) as Team[]);
        setPlayers((playerData ?? []) as Player[]);
      }
    } finally {
      setAssigningCaptain(null);
    }
  };

  if (!auction) {
    return <div className="p-6 text-slate-50">Loading auction teams...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Teams &amp; Captains · {auction.name}
            </h1>
            <p className="text-sm text-slate-300">
              Configure teams for this auction and assign one captain per team before starting the
              live auction.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/auction/${auction.id}`)}>
            Go to Auction Control
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
          <Card className="border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/60">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Create Team
            </h2>
            <form className="space-y-3 text-sm" onSubmit={handleCreateTeam}>
              <div className="space-y-1">
                <Label htmlFor="team-name" className="text-slate-100">
                  Team Name
                </Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-slate-950/80 text-slate-50"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="team-manager" className="text-slate-100">
                  Manager Name
                </Label>
                <Input
                  id="team-manager"
                  value={teamManager}
                  onChange={(e) => setTeamManager(e.target.value)}
                  className="bg-slate-950/80 text-slate-50"
                />
              </div>
              <p className="text-xs text-slate-400">
                Each new team starts with a purse of{" "}
                <span className="font-semibold text-slate-100">
                  {auction.settings.purse.toLocaleString("en-IN")}
                </span>{" "}
                and{" "}
                <span className="font-semibold text-slate-100">
                  {auction.settings.max_players} slots
                </span>
                .
              </p>
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <Button type="submit" disabled={creatingTeam}>
                {creatingTeam ? "Creating..." : "Add Team"}
              </Button>
            </form>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/60">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Teams &amp; Captains
            </h2>
            {teams.length === 0 ? (
              <p className="text-sm text-slate-400">
                No teams created yet. Add teams on the left to begin.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                {teams.map((team) => {
                  const captain = players.find((p) => p.id === team.captain_id);
                  const hasCaptain = Boolean(captain);
                  return (
                    <div
                      key={team.id}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">{team.name}</div>
                          <div className="text-[11px] uppercase tracking-wide text-slate-400">
                            {team.manager}
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-300">
                          <div>
                            Purse:{" "}
                            <span className="font-semibold">
                              {team.purse_remaining.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div>
                            Slots: <span className="font-semibold">{team.slots_remaining}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 border-t border-slate-800 pt-3 text-xs">
                        {hasCaptain ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-slate-300">
                                Captain:{" "}
                                <span className="font-semibold text-slate-50">
                                  {captain?.name}
                                </span>{" "}
                                ({captain?.role})
                              </div>
                              <div className="text-slate-400">
                                Price:{" "}
                                <span className="font-semibold">
                                  {captain?.sold_price?.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                            <span className="rounded-full bg-emerald-600/20 px-3 py-0.5 text-[11px] font-semibold text-emerald-300">
                              Captain Assigned
                            </span>
                          </div>
                        ) : (
                          <div className="grid gap-2 md:grid-cols-[2fr,1fr,auto] md:items-end">
                            <div className="space-y-1">
                              <Label className="text-slate-100 text-xs">Select Captain</Label>
                              <select
                                value={captainPlayer[team.id] ?? ""}
                                onChange={(e) =>
                                  setCaptainPlayer((prev) => ({
                                    ...prev,
                                    [team.id]: e.target.value,
                                  }))
                                }
                                className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-50 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              >
                                <option value="">Choose upcoming player</option>
                                {upcomingPlayers.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} · {p.role}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-slate-100 text-xs">Captain Price</Label>
                              <Input
                                type="number"
                                value={captainPrice[team.id] ?? ""}
                                onChange={(e) =>
                                  setCaptainPrice((prev) => ({
                                    ...prev,
                                    [team.id]: e.target.value,
                                  }))
                                }
                                className="bg-slate-950/80 text-slate-50"
                              />
                            </div>
                            <Button
                              size="sm"
                              disabled={assigningCaptain === team.id}
                              onClick={() => handleAssignCaptain(team.id)}
                            >
                              {assigningCaptain === team.id ? "Assigning..." : "Assign Captain"}
                            </Button>
                          </div>
                        )}
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
````

## File: app/admin/login/page.tsx
````typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Simple hard-coded admin password (can be overridden via NEXT_PUBLIC_ADMIN_PASSWORD)
const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD && process.env.NEXT_PUBLIC_ADMIN_PASSWORD.length > 0
    ? process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    : "admin123";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (password === ADMIN_PASSWORD) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("admin_auth", "true");
      }
      router.push("/admin");
    } else {
      setError("Incorrect admin password.");
    }

    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-50">
      <Card className="w-full max-w-sm border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/60">
        <h1 className="mb-1 text-xl text-white font-semibold tracking-tight">Admin Login</h1>
        <p className="mb-5 text-sm text-slate-400">
          Enter the admin password to access auction control panels.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 text-slate-100">
            <Label htmlFor="password" className="text-slate-100">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950/80 text-slate-50 placeholder:text-slate-400"
            />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Checking..." : "Login as Admin"}
          </Button>
        </form>
        <p className="mt-4 text-[11px] text-slate-500">
          This is a simple hard-coded authentication layer to prevent casual access to admin pages.
        </p>
      </Card>
    </div>
  );
}
````

## File: app/admin/page.tsx
````typescript
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
  const [increment, setIncrement] = useState("5");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createSectionRef = useRef<HTMLDivElement | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const authed = window.localStorage.getItem("admin_auth") === "true";
    if (!authed) {
      router.replace("/admin/login");
      return;
    }
    setCheckingAuth(false);
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

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const purseVal = Number(purse);
    const minVal = Number(minPlayers);
    const maxVal = Number(maxPlayers);
    const baseVal = Number(basePrice);
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
                        {canStart && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={async () => {
                              await supabase
                                .from("auctions")
                                .update({ status: "live" })
                                .eq("id", auction.id);
                              const { data } = await supabase
                                .from("auctions")
                                .select("id, name, sport_type, status, settings");
                              setAuctions((data ?? []) as Auction[]);
                            }}
                          >
                            Start Auction
                          </Button>
                        )}
                        <Link href={`/admin/auction/${auction.id}/teams`}>
                          <Button size="sm" variant="outline">
                            Manage Teams
                          </Button>
                        </Link>
                        <Link href={`/admin/auction/${auction.id}`}>
                          <Button size="sm" variant="ghost">
                            Open Controller
                          </Button>
                        </Link>
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
````

## File: app/auction/[id]/page.tsx
````typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function AuctionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const auctionId = params?.id as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
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
    if (!name.trim() || !role) {
      setError("Please enter your name and select a role.");
      setSuccess(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: insertError } = await supabase.from("players").insert({
        auction_id: auction.id,
        name: name.trim(),
        role,
        // status defaults to 'upcoming' from DB enum
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess("Registration submitted successfully.");
        setName("");
        setRole("");
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
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {auction.name}
            </h1>
            <p className="text-sm text-slate-300">
              Auction for {auction.sport_type === "football" ? "Football" : "Cricket"} players.
            </p>
          </div>
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
````

## File: app/live/[id]/page.tsx
````typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

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
  status: "upcoming" | "live" | "completed";
  settings: AuctionSettings;
};

type Team = {
  id: string;
  auction_id: string;
  name: string;
  manager: string;
  purse_remaining: number;
  slots_remaining: number;
  captain_id: string | null;
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

type AuctionState = {
  id: string;
  auction_id: string;
  current_player_id: string | null;
  current_bid: number | null;
  leading_team_id: string | null;
  phase: string;
};

export default function LiveAuctionPage() {
  const params = useParams<{ id: string }>();
  const auctionId = params?.id as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [state, setState] = useState<AuctionState | null>(null);

  useEffect(() => {
    const loadInitial = async () => {
      const [{ data: auctionData }, { data: teamsData }, { data: playersData }, { data: stateData }] =
        await Promise.all([
          supabase.from("auctions").select("*").eq("id", auctionId).single(),
          supabase.from("teams").select("*").eq("auction_id", auctionId),
          supabase.from("players").select("*").eq("auction_id", auctionId),
          supabase.from("auction_state").select("*").eq("auction_id", auctionId).maybeSingle(),
        ]);

      setAuction(auctionData as Auction);
      setTeams((teamsData ?? []) as Team[]);
      setPlayers((playersData ?? []) as Player[]);
      if (stateData) setState(stateData as AuctionState);
    };

    loadInitial();
  }, [auctionId]);

  useEffect(() => {
    const channel = supabase
      .channel("auction")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auction_state", filter: `auction_id=eq.${auctionId}` },
        (payload) => {
          if (payload.new) setState(payload.new as AuctionState);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams", filter: `auction_id=eq.${auctionId}` },
        () => {
          supabase.from("teams").select("*").eq("auction_id", auctionId).then(({ data }) => {
            if (data) setTeams(data as Team[]);
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `auction_id=eq.${auctionId}` },
        () => {
          supabase.from("players").select("*").eq("auction_id", auctionId).then(({ data }) => {
            if (data) setPlayers(data as Player[]);
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  const currentPlayer = useMemo(
    () => players.find((p) => p.id === state?.current_player_id) ?? null,
    [players, state?.current_player_id],
  );

  const leadingTeam = useMemo(
    () => teams.find((t) => t.id === state?.leading_team_id) ?? null,
    [teams, state?.leading_team_id],
  );

  if (!auction) {
    return <div className="p-6 text-lg text-slate-50">Loading live auction...</div>;
  }

  if (auction.status !== "live") {
    return (
      <div className="p-6 text-lg text-slate-50">
        This auction is not live yet. Please wait for the administrator to start the auction.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-50">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[3fr,2fr]">
        <Card className="relative flex h-[340px] items-center justify-center overflow-hidden border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%)]" />
          <div className="relative z-10 flex w-full flex-col items-center justify-center text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300/90">
              Live Player
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPlayer?.id ?? "empty"}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="w-full"
              >
                {currentPlayer ? (
                  <>
                    <div className="text-3xl font-semibold tracking-tight md:text-4xl">
                      {currentPlayer.name}
                    </div>
                    <div className="mt-1 text-sm uppercase tracking-[0.25em] text-emerald-200/90">
                      {currentPlayer.role}
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-left text-sm md:grid-cols-4">
                      <div className="rounded-lg bg-slate-900/80 px-3 py-2">
                        <div className="text-[10px] uppercase text-slate-400">Base Price</div>
                        <div className="text-lg font-semibold">
                          {auction.settings.base_price.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="rounded-lg bg-slate-900/80 px-3 py-2">
                        <div className="text-[10px] uppercase text-slate-400">Increment</div>
                        <div className="text-lg font-semibold">
                          +{auction.settings.increment.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <motion.div
                        key={state?.current_bid ?? "no-bid"}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-lg bg-emerald-900/60 px-3 py-2"
                      >
                        <div className="text-[10px] uppercase text-emerald-200">Current Bid</div>
                        <div className="text-xl font-semibold text-emerald-100">
                          {(state?.current_bid ?? auction.settings.base_price).toLocaleString(
                            "en-IN",
                          )}
                        </div>
                      </motion.div>
                      <div className="rounded-lg bg-slate-900/80 px-3 py-2">
                        <div className="text-[10px] uppercase text-slate-400">Leading Team</div>
                        <div className="text-lg font-semibold">
                          {leadingTeam ? leadingTeam.name : "—"}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-400">
                    Waiting for the next player to be drawn...
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Live Ticker
                </div>
                <div className="text-sm text-slate-300">
                  {currentPlayer ? currentPlayer.name : "No active player"}
                </div>
              </div>
              <motion.div
                key={state?.current_bid ?? "ticker"}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="rounded-full bg-emerald-600/90 px-4 py-1 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-500/40"
              >
                ₹
                {(state?.current_bid ?? auction.settings.base_price).toLocaleString("en-IN")} ·{" "}
                {leadingTeam ? leadingTeam.name : "No bids yet"}
              </motion.div>
            </div>
          </Card>

          <Card className="flex-1 overflow-hidden border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Teams · Leaderboard
            </div>
            <div className="grid max-h-[260px] grid-cols-1 gap-3 overflow-y-auto text-sm md:grid-cols-2">
              {teams
                .slice()
                .sort((a, b) => b.purse_remaining - a.purse_remaining)
                .map((team) => (
                  <div
                    key={team.id}
                    className="rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">{team.name}</div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">
                          {team.manager}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-300">
                        <div>
                          Purse:{" "}
                          <span className="font-semibold">
                            {team.purse_remaining.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          Slots: <span className="font-semibold">{team.slots_remaining}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
````

## File: components.json
````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "gray",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
````

## File: components/ui/button.tsx
````typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
````

## File: components/ui/card.tsx
````typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
````

## File: components/ui/dialog.tsx
````typescript
"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
````

## File: components/ui/form.tsx
````typescript
"use client"

import * as React from "react"
import type { Label as LabelPrimitive } from "radix-ui"
import { Slot } from "radix-ui"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
````

## File: components/ui/input.tsx
````typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
````

## File: components/ui/label.tsx
````typescript
"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
````

## File: components/ui/table.tsx
````typescript
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
````

## File: lib/supabase.ts
````typescript
// lib/supabase.ts (Improved Code)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase Environment Variables. Check your .env.local file.");
}

export const supabase = createClient(
  supabaseUrl || "", 
  supabaseKey || ""
);
````

## File: lib/utils.ts
````typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
````

## File: supabase/.gitignore
````
# Supabase
.branches
.temp

# dotenvx
.env.keys
.env.local
.env.*.local
````

## File: supabase/config.toml
````toml
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "sports-auction"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` and `graphql_public` schemas are included by default.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
# Enable HTTPS endpoints locally using a self-signed certificate.
enabled = false
# Paths to self-signed certificate pair.
# cert_path = "../certs/my-cert.pem"
# key_path = "../certs/my-key.pem"

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# Maximum amount of time to wait for health check when starting the local database.
health_timeout = "2m"
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 17

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

# [db.vault]
# secret_key = "env(SECRET_VALUE)"

[db.migrations]
# If disabled, migrations will be skipped during a db push or reset.
enabled = true
# Specifies an ordered list of schema files that describe your database.
# Supports glob patterns relative to supabase directory: "./schemas/*.sql"
schema_paths = []

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory: "./seeds/*.sql"
sql_paths = ["./seed.sql"]

[db.network_restrictions]
# Enable management of network restrictions.
enabled = false
# List of IPv4 CIDR blocks allowed to connect to the database.
# Defaults to allow all IPv4 connections. Set empty array to block all IPs.
allowed_cidrs = ["0.0.0.0/0"]
# List of IPv6 CIDR blocks allowed to connect to the database.
# Defaults to allow all IPv6 connections. Set empty array to block all IPs.
allowed_cidrs_v6 = ["::/0"]

# Uncomment to reject non-secure connections to the database.
# [db.ssl_enforcement]
# enabled = true

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

# Allow connections via S3 compatible clients
[storage.s3_protocol]
enabled = true

# Image transformation API is available to Supabase Pro plan.
# [storage.image_transformation]
# enabled = true

# Store analytical data in S3 for running ETL jobs over Iceberg Catalog
# This feature is only available on the hosted platform.
[storage.analytics]
enabled = false
max_namespaces = 5
max_tables = 10
max_catalogs = 2

# Analytics Buckets is available to Supabase Pro plan.
# [storage.analytics.buckets.my-warehouse]

# Store vector embeddings in S3 for large and durable datasets
# This feature is only available on the hosted platform.
[storage.vector]
enabled = false
max_buckets = 10
max_indexes = 5

# Vector Buckets is available to Supabase Pro plan.
# [storage.vector.buckets.documents-openai]

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# JWT issuer URL. If not set, defaults to the local API URL (http://127.0.0.1:<port>/auth/v1).
# jwt_issuer = ""
# Path to JWT signing key. DO NOT commit your signing keys file to git.
# signing_keys_path = "./signing_keys.json"
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

[auth.rate_limit]
# Number of emails that can be sent per hour. Requires auth.email.smtp to be enabled.
email_sent = 2
# Number of SMS messages that can be sent per hour. Requires auth.sms to be enabled.
sms_sent = 30
# Number of anonymous sign-ins that can be made per hour per IP address. Requires enable_anonymous_sign_ins = true.
anonymous_users = 30
# Number of sessions that can be refreshed in a 5 minute interval per IP address.
token_refresh = 150
# Number of sign up and sign-in requests that can be made in a 5 minute interval per IP address (excludes anonymous users).
sign_in_sign_ups = 30
# Number of OTP / Magic link verifications that can be made in a 5 minute interval per IP address.
token_verifications = 30
# Number of Web3 logins that can be made in a 5 minute interval per IP address.
web3 = 30

# Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
# [auth.captcha]
# enabled = true
# provider = "hcaptcha"
# secret = ""

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# enabled = true
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

# Uncomment to customize notification email template
# [auth.email.notification.password_changed]
# enabled = true
# subject = "Your password has been changed"
# content_path = "./templates/password_changed_notification.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ .Code }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a new user is created and allows developers to reject the request based on the incoming user object.
# [auth.hook.before_user_created]
# enabled = true
# uri = "pg-functions://postgres/auth/before-user-created-hook"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
# [auth.hook.custom_access_token]
# enabled = true
# uri = "pg-functions://<database>/<schema>/<hook_name>"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Multi-factor-authentication is available to Supabase Pro plan.
[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = false
verify_enabled = false

# Configure MFA via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

# Configure MFA via WebAuthn
# [auth.mfa.web_authn]
# enroll_enabled = true
# verify_enabled = true

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `x`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false
# If enabled, it will allow the user to successfully authenticate when the provider does not return an email address.
email_optional = false

# Allow Solana wallet holders to sign in to your project via the Sign in with Solana (SIWS, EIP-4361) standard.
# You can configure "web3" rate limit in the [auth.rate_limit] section and set up [auth.captcha] if self-hosting.
[auth.web3.solana]
enabled = false

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

# Use Clerk as a third-party provider alongside Supabase Auth.
[auth.third_party.clerk]
enabled = false
# Obtain from https://clerk.com/setup/supabase
# domain = "example.clerk.accounts.dev"

# OAuth server configuration
[auth.oauth_server]
# Enable OAuth server functionality
enabled = false
# Path for OAuth consent flow UI
authorization_url_path = "/oauth/consent"
# Allow dynamic client registration
allow_dynamic_registration = false

[edge_runtime]
enabled = true
# Supported request policies: `oneshot`, `per_worker`.
# `per_worker` (default) — enables hot reload during local development.
# `oneshot` — fallback mode if hot reload causes issues (e.g. in large repos or with symlinks).
policy = "per_worker"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8083
# The Deno major version to use.
deno_version = 2

# [edge_runtime.secrets]
# secret_key = "env(SECRET_VALUE)"

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"
````

## File: supabase/migrations/0001_auction_engine.sql
````sql
-- Auction Engine core schema and RPCs
-- Compatible with Supabase/PostgreSQL

create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'player_status') then
    create type public.player_status as enum ('upcoming', 'live', 'sold', 'unsold');
  end if;

  if not exists (select 1 from pg_type where typname = 'auction_phase') then
    create type public.auction_phase as enum ('idle', 'captain_round', 'phase1', 'phase2', 'completed');
  end if;
end $$;

-- Auctions table
create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport_type text not null check (sport_type in ('football', 'cricket')),
  settings jsonb not null,
  created_at timestamptz not null default now()
);

-- Teams table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  name text not null,
  manager text not null,
  purse_remaining numeric(12,2) not null,
  slots_remaining integer not null,
  captain_id uuid,
  created_at timestamptz not null default now(),
  constraint teams_purse_non_negative check (purse_remaining >= 0)
);

-- Players table
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  name text not null,
  role text not null,
  status public.player_status not null default 'upcoming',
  sold_price numeric(12,2),
  sold_team_id uuid references public.teams(id),
  created_at timestamptz not null default now()
);

alter table public.teams
  add constraint teams_captain_fk
  foreign key (captain_id) references public.players(id);

-- Auction state table: one row per auction
create table if not exists public.auction_state (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  current_player_id uuid references public.players(id),
  current_bid numeric(12,2),
  leading_team_id uuid references public.teams(id),
  previous_bid numeric(12,2),
  previous_leading_team_id uuid references public.teams(id),
  phase public.auction_phase not null default 'idle',
  updated_at timestamptz not null default now(),
  constraint auction_state_auction_unique unique (auction_id)
);

-- Minimum squad / remaining purse enforcement
create or replace function public.enforce_minimum_squad()
returns trigger
language plpgsql
as $$
declare
  v_base_price numeric(12,2);
begin
  select (settings ->> 'base_price')::numeric
    into v_base_price
  from public.auctions
  where id = new.auction_id;

  if v_base_price is null then
    raise exception 'Base price not configured for auction %', new.auction_id;
  end if;

  if new.purse_remaining < 0 then
    raise exception 'Team purse_remaining cannot be negative';
  end if;

  if new.purse_remaining < new.slots_remaining * v_base_price then
    raise exception 'Minimum squad rule violated: remaining purse % does not cover % slots at base price %',
      new.purse_remaining, new.slots_remaining, v_base_price;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_minimum_squad on public.teams;

create trigger trg_enforce_minimum_squad
before insert or update of purse_remaining, slots_remaining
on public.teams
for each row
execute procedure public.enforce_minimum_squad();

-- Keep auction_state.updated_at fresh
create or replace function public.set_auction_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_set_auction_state_updated_at on public.auction_state;

create trigger trg_set_auction_state_updated_at
before update on public.auction_state
for each row
execute procedure public.set_auction_state_updated_at();

-- RPC: select next player for auction
create or replace function public.next_player(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_player_id uuid;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    insert into public.auction_state (auction_id)
    values (p_auction_id)
    returning * into v_state;
  end if;

  -- Prefer upcoming players, fall back to unsold (Phase 2)
  select id
    into v_player_id
  from public.players
  where auction_id = p_auction_id
    and status = 'upcoming'
  order by random()
  limit 1;

  if not found then
    select id
      into v_player_id
    from public.players
    where auction_id = p_auction_id
      and status = 'unsold'
    order by random()
    limit 1;
  end if;

  if not found then
    raise exception 'No players remaining for auction %', p_auction_id;
  end if;

  update public.players
    set status = 'live'
  where id = v_player_id;

  update public.auction_state
     set current_player_id = v_player_id,
         current_bid = null,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null,
         phase = case when v_state.phase in ('phase1', 'phase2') then v_state.phase else 'phase1' end
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- RPC: start bid – set base price and reset leading team
create or replace function public.start_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_auction public.auctions;
  v_base_price numeric(12,2);
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No current player selected for auction %', p_auction_id;
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;
  if v_base_price is null then
    raise exception 'Base price not configured for auction %', p_auction_id;
  end if;

  update public.auction_state
     set current_bid = v_base_price,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null,
         phase = 'phase1'
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- RPC: place bid – atomic bid increment with rule checks
create or replace function public.place_bid(p_auction_id uuid, p_team_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_auction public.auctions;
  v_team public.teams;
  v_base_price numeric(12,2);
  v_increment numeric(12,2);
  v_next_bid numeric(12,2);
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No active player for auction %', p_auction_id;
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;
  v_increment  := (v_auction.settings ->> 'increment')::numeric;

  if v_base_price is null or v_increment is null then
    raise exception 'Base price or increment not configured for auction %', p_auction_id;
  end if;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team % not found for auction %', p_team_id, p_auction_id;
  end if;

  v_next_bid := coalesce(v_state.current_bid, v_base_price) + v_increment;

  -- Purse check
  if v_team.purse_remaining < v_next_bid then
    raise exception 'Purse check failed for team %', p_team_id;
  end if;

  -- Slot check
  if v_team.slots_remaining <= 0 then
    raise exception 'Slot check failed for team %', p_team_id;
  end if;

  -- Minimum squad constraint
  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - v_next_bid) < v_required_money then
    raise exception 'Minimum squad rule failed for team %', p_team_id;
  end if;

  update public.auction_state
     set previous_bid = v_state.current_bid,
         previous_leading_team_id = v_state.leading_team_id,
         current_bid = v_next_bid,
         leading_team_id = p_team_id
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- RPC: undo last bid – revert to previous state
create or replace function public.undo_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'No auction_state row for auction %', p_auction_id;
  end if;

  if v_state.previous_bid is null then
    -- nothing to undo, return current state
    return v_state;
  end if;

  update public.auction_state
     set current_bid = v_state.previous_bid,
         leading_team_id = v_state.previous_leading_team_id,
         previous_bid = null,
         previous_leading_team_id = null
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;

-- RPC: end bid – finalize sale or mark unsold
create or replace function public.end_bid(p_auction_id uuid)
returns public.auction_state
language plpgsql
security definer
as $$
declare
  v_state public.auction_state;
  v_team public.teams;
begin
  select *
    into v_state
  from public.auction_state
  where auction_id = p_auction_id
  for update;

  if not found or v_state.current_player_id is null then
    raise exception 'No active player to end bid for auction %', p_auction_id;
  end if;

  if v_state.leading_team_id is not null and v_state.current_bid is not null then
    select *
      into v_team
    from public.teams
    where id = v_state.leading_team_id
    for update;

    update public.players
       set status = 'sold',
           sold_price = v_state.current_bid,
           sold_team_id = v_state.leading_team_id
     where id = v_state.current_player_id;

    update public.teams
       set purse_remaining = v_team.purse_remaining - v_state.current_bid,
           slots_remaining = v_team.slots_remaining - 1
     where id = v_team.id;
  else
    update public.players
       set status = 'unsold'
     where id = v_state.current_player_id;
  end if;

  update public.auction_state
     set current_player_id = null,
         current_bid = null,
         leading_team_id = null,
         previous_bid = null,
         previous_leading_team_id = null
   where id = v_state.id
   returning * into v_state;

  return v_state;
end;
$$;
````

## File: supabase/migrations/0002_captain_round.sql
````sql
-- Captain assignment RPC for blind bidding phase

create or replace function public.assign_captain(
  p_auction_id uuid,
  p_team_id uuid,
  p_player_id uuid,
  p_price numeric
)
returns void
language plpgsql
security definer
as $$
declare
  v_auction public.auctions;
  v_team public.teams;
  v_player public.players;
  v_base_price numeric(12,2);
  v_remaining_slots_after integer;
  v_required_money numeric(12,2);
begin
  if p_price <= 0 then
    raise exception 'Captain price must be positive';
  end if;

  select *
    into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction % not found', p_auction_id;
  end if;

  v_base_price := (v_auction.settings ->> 'base_price')::numeric;

  select *
    into v_team
  from public.teams
  where id = p_team_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Team % not found for auction %', p_team_id, p_auction_id;
  end if;

  if v_team.captain_id is not null then
    raise exception 'Team % already has a captain', p_team_id;
  end if;

  select *
    into v_player
  from public.players
  where id = p_player_id
    and auction_id = p_auction_id
  for update;

  if not found then
    raise exception 'Player % not found for auction %', p_player_id, p_auction_id;
  end if;

  if v_player.status <> 'upcoming' then
    raise exception 'Captain must be selected from upcoming players';
  end if;

  -- Purse and slot checks re-used from main auction rules
  if v_team.slots_remaining <= 0 then
    raise exception 'Team % has no remaining slots', p_team_id;
  end if;

  if v_team.purse_remaining < p_price then
    raise exception 'Captain price exceeds team purse for team %', p_team_id;
  end if;

  v_remaining_slots_after := v_team.slots_remaining - 1;
  v_required_money := v_remaining_slots_after * v_base_price;

  if (v_team.purse_remaining - p_price) < v_required_money then
    raise exception 'Minimum squad rule violated for team % when assigning captain', p_team_id;
  end if;

  update public.players
     set status = 'sold',
         sold_price = p_price,
         sold_team_id = p_team_id
   where id = p_player_id;

  update public.teams
     set purse_remaining = v_team.purse_remaining - p_price,
         slots_remaining = v_team.slots_remaining - 1,
         captain_id = p_player_id
   where id = p_team_id;
end;
$$;
````

## File: supabase/migrations/0003_auction_status.sql
````sql
-- Auction status tracking: upcoming, live, completed

do $$
begin
  if not exists (select 1 from pg_type where typname = 'auction_status') then
    create type public.auction_status as enum ('upcoming', 'live', 'completed');
  end if;
end $$;

alter table public.auctions
  add column if not exists status public.auction_status not null default 'upcoming';
````

## File: .gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
.env
.env.local
````

## File: app/globals.css
````css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.13 0.028 261.692);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.13 0.028 261.692);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.13 0.028 261.692);
  --primary: oklch(0.21 0.034 264.665);
  --primary-foreground: oklch(0.985 0.002 247.839);
  --secondary: oklch(0.967 0.003 264.542);
  --secondary-foreground: oklch(0.21 0.034 264.665);
  --muted: oklch(0.967 0.003 264.542);
  --muted-foreground: oklch(0.551 0.027 264.364);
  --accent: oklch(0.967 0.003 264.542);
  --accent-foreground: oklch(0.21 0.034 264.665);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.928 0.006 264.531);
  --input: oklch(0.928 0.006 264.531);
  --ring: oklch(0.707 0.022 261.325);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0.002 247.839);
  --sidebar-foreground: oklch(0.13 0.028 261.692);
  --sidebar-primary: oklch(0.21 0.034 264.665);
  --sidebar-primary-foreground: oklch(0.985 0.002 247.839);
  --sidebar-accent: oklch(0.967 0.003 264.542);
  --sidebar-accent-foreground: oklch(0.21 0.034 264.665);
  --sidebar-border: oklch(0.928 0.006 264.531);
  --sidebar-ring: oklch(0.707 0.022 261.325);
}

.dark {
  --background: oklch(0.13 0.028 261.692);
  --foreground: oklch(0.985 0.002 247.839);
  --card: oklch(0.21 0.034 264.665);
  --card-foreground: oklch(0.985 0.002 247.839);
  --popover: oklch(0.21 0.034 264.665);
  --popover-foreground: oklch(0.985 0.002 247.839);
  --primary: oklch(0.928 0.006 264.531);
  --primary-foreground: oklch(0.21 0.034 264.665);
  --secondary: oklch(0.278 0.033 256.848);
  --secondary-foreground: oklch(0.985 0.002 247.839);
  --muted: oklch(0.278 0.033 256.848);
  --muted-foreground: oklch(0.707 0.022 261.325);
  --accent: oklch(0.278 0.033 256.848);
  --accent-foreground: oklch(0.985 0.002 247.839);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.551 0.027 264.364);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.21 0.034 264.665);
  --sidebar-foreground: oklch(0.985 0.002 247.839);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0.002 247.839);
  --sidebar-accent: oklch(0.278 0.033 256.848);
  --sidebar-accent-foreground: oklch(0.985 0.002 247.839);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.551 0.027 264.364);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
````

## File: app/layout.tsx
````typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
````

## File: app/page.tsx
````typescript
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

  const liveAuctionIds = useMemo(() => {
    const livePhases = new Set(["captain_round", "phase1", "phase2"]);
    return new Set(
      states
        .filter((s) => livePhases.has(s.phase) && s.current_player_id !== null)
        .map((s) => s.auction_id),
    );
  }, [states]);

  const hasLiveAuctions = liveAuctionIds.size > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Sports Auction Platform
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
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

        <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
          <Card className="border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/60">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
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

          <Card className="border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/60">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
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
                          {isLive ? " · Live" : " · Upcoming / Scheduled"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/auction/${auction.id}`}>
                          <Button size="sm" variant="outline">
                            View &amp; Register
                          </Button>
                        </Link>
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
    </div>
  );
}
````

## File: eslint.config.mjs
````javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
````

## File: next.config.ts
````typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
````

## File: package.json
````json
{
  "name": "sports-auction",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@supabase/supabase-js": "^2.98.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.35.0",
    "lucide-react": "^0.577.0",
    "next": "16.1.6",
    "radix-ui": "^1.4.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.71.2",
    "tailwind-merge": "^3.5.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "shadcn": "^3.8.5",
    "supabase": "^2.76.17",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5"
  }
}
````

## File: postcss.config.mjs
````javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
````

## File: public/file.svg
````xml
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
````

## File: public/globe.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
````

## File: public/next.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
````

## File: public/vercel.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
````

## File: public/window.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
````

## File: README.md
````markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
````
