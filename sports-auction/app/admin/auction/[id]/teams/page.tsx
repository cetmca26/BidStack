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
  captain_base_price?: number;
};

type Auction = {
  id: string;
  name: string;
  sport_type: string;
  is_registration_open: boolean;
  status?: "upcoming" | "live" | "completed";
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
  phone_number: string | null;
  ip_address: string | null;
  status: "upcoming" | "live" | "sold" | "unsold";
  sold_price: number | null;
  sold_team_id: string | null;
  is_captain?: boolean;
};

export default function ManageTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: auctionId } = use(params);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamManager, setTeamManager] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [togglingRegistration, setTogglingRegistration] = useState(false);
  const [lockingAuction, setLockingAuction] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [deletingPlayers, setDeletingPlayers] = useState(false);

  useEffect(() => {
    if (!auctionId) return;
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

  const handleToggleRegistration = async () => {
    if (!auction) return;
    setTogglingRegistration(true);
    const newVal = !auction.is_registration_open;
    try {
      const { error: updateError } = await supabase
        .from("auctions")
        .update({ is_registration_open: newVal })
        .eq("id", auctionId);
      if (!updateError) {
        setAuction((prev) => prev ? { ...prev, is_registration_open: newVal } : null);
      }
    } finally {
      setTogglingRegistration(false);
    }
  };

  const handleTogglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  const handleBatchDelete = async () => {
    if (selectedPlayerIds.size === 0) return;
    setDeletingPlayers(true);
    try {
      const { error: deleteError } = await supabase
        .from("players")
        .delete()
        .in("id", Array.from(selectedPlayerIds));
      if (!deleteError) {
        setPlayers((prev) => prev.filter((p) => !selectedPlayerIds.has(p.id)));
        setSelectedPlayerIds(new Set());
      }
    } finally {
      setDeletingPlayers(false);
    }
  };

  const handleLockAndProceed = async () => {
    if (!auction) return;
    setLockingAuction(true);
    try {
      // Close Registration and Set Status to Live
      const { error: updateError } = await supabase
        .from("auctions")
        .update({
          is_registration_open: false,
          status: "live"
        })
        .eq("id", auctionId);

      if (!updateError) {
        router.push(`/admin/auction/${auction.id}`);
      }
    } finally {
      setLockingAuction(false);
    }
  };

  const farmIps = useMemo(() => {
    const counts = players.reduce((acc, p) => {
      if (p.ip_address) {
        acc[p.ip_address] = (acc[p.ip_address] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    return new Set(Object.entries(counts).filter(([_, count]) => count > 1).map(([ip]) => ip));
  }, [players]);

  if (!auction) {
    return <div className="p-6 text-slate-50">Loading Verification Hub...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Verification Hub · {auction.name}
            </h1>
            <p className="text-sm text-slate-300">
              Verify registered participants and create teams. Lock participants to proceed to the Live Controller.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={auction.is_registration_open ? "destructive" : "secondary"}
              size="sm"
              onClick={handleToggleRegistration}
              disabled={togglingRegistration}
            >
              {togglingRegistration
                ? "Toggling..."
                : auction.is_registration_open
                  ? "Force Close Registration"
                  : "Re-open Registration"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleLockAndProceed}
              disabled={lockingAuction || players.length === 0 || teams.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {lockingAuction ? "Locking..." : "Lock Participants & Proceed"}
            </Button>
          </div>
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
              Verified Teams
            </h2>
            {teams.length === 0 ? (
              <p className="text-sm text-slate-400">
                No teams created yet. Add teams on the left to begin.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                {teams.map((team) => {
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
                      <div className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-400 italic text-center">
                        Captain matching will be performed in the Live Control portal.
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Registered Players Cleanup UI */}
        <Card className="border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/60">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Registered Players Cleanup
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select unwanted or duplicate players directly to remove them from the auction pool. Entries from the same IP are highlighted.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={selectedPlayerIds.size === 0 || deletingPlayers}
              onClick={handleBatchDelete}
            >
              {deletingPlayers ? "Deleting..." : `Delete Selected (${selectedPlayerIds.size})`}
            </Button>
          </div>

          <div className="max-h-[400px] overflow-y-auto rounded-md border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="sticky top-0 bg-slate-950 px-4 py-3 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-700 bg-slate-900 accent-emerald-500"
                      checked={players.length > 0 && selectedPlayerIds.size === players.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlayerIds(new Set(players.map((p) => p.id)));
                        } else {
                          setSelectedPlayerIds(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Player Details</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Contact & Network</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No players registered yet.
                    </td>
                  </tr>
                ) : (
                  players.map((p) => {
                    const isFarm = p.ip_address && farmIps.has(p.ip_address);
                    const isSelected = selectedPlayerIds.has(p.id);
                    return (
                      <tr
                        key={`player-row-${p.id}`}
                        className={`transition-colors hover:bg-slate-800/30 ${isSelected ? "bg-slate-800/40" : ""
                          }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTogglePlayerSelection(p.id)}
                            className="rounded border-slate-700 bg-slate-900 accent-emerald-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-100">{p.name}</div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">{p.role}</div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="text-xs text-slate-400">{p.phone_number || "No Phone"}</div>
                          <div
                            className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] uppercase font-medium ${isFarm
                              ? "bg-amber-900/30 text-amber-400 ring-1 ring-amber-500/50"
                              : "text-slate-500 bg-slate-900/50"
                              }`}
                          >
                            IP: {p.ip_address || "Unknown"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${p.status === "upcoming"
                              ? "bg-blue-900/30 text-blue-400"
                              : p.status === "sold"
                                ? "bg-emerald-900/30 text-emerald-400"
                                : "bg-slate-800 text-slate-400"
                              }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
