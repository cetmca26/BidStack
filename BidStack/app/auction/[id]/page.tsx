"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/ImageUploadField";

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
  photo_url?: string;
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
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
    if (!photoFile) {
      setPhotoError("Please upload a player photo.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setPhotoError(null);

    try {
      let ipAddress = null;
      try {
        const ipReq = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipReq.json();
        ipAddress = ipData.ip;
      } catch (err) {
        console.warn("Could not fetch IP", err);
      }

      const playerId = crypto.randomUUID();

      // Upload photo to player-photos bucket
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `originals/player_${playerId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("player-photos")
        .upload(fileName, photoFile);

      if (uploadError) {
        setPhotoError(`Photo upload failed: ${uploadError.message}`);
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("player-photos")
        .getPublicUrl(fileName);

      const photoUrl = urlData?.publicUrl;

      const { error: insertError } = await supabase.from("players").insert({
        id: playerId,
        auction_id: auction.id,
        name: name.trim(),
        role,
        phone_number: phoneNumber.trim(),
        ip_address: ipAddress,
        photo_url: photoUrl,
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
        setPhotoFile(null);
        setPhotoPreview(null);
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
    <div className="min-h-screen bg-[url('/CourtSide_landing.png')] bg-cover bg-center bg-fixed px-6 py-10 relative" style={{ backgroundColor: '#C0D5CC' }}>

      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6">
        <div className="mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="transition-all duration-300 -ml-2"
            onClick={() => router.push("/")}
            style={{ color: '#252D33' }}
          >
            ← Back to Home
          </Button>
        </div>
        <header className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-wide md:text-4xl" style={{ color: '#252D33', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                {auction.name}
              </h1>
              {auction.status === "live" && (
                <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider animate-pulse" style={{ backgroundColor: '#E6A850', color: '#252D33' }}>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: '#252D33', opacity: 0.75 }}></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: '#252D33' }}></span>
                  </span>
                  Live
                </span>
              )}
              {auction.status === "completed" && (
                <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded border-2" style={{ backgroundColor: 'rgba(90, 107, 127, 0.2)', color: '#5A6B7F', borderColor: '#5A6B7F' }}>
                  Concluded
                </span>
              )}
            </div>
            <p className="text-sm mt-2" style={{ color: '#252D33' }}>
              Auction for {auction.sport_type === "football" ? "Football" : "Cricket"} players.
            </p>
          </div>
          {auction.status === "live" && (
            <Button
              onClick={() => router.push(`/live/${auctionId}`)}
              className="animate-bounce transition-all duration-300 hover:shadow-lg hover:scale-105 font-bold uppercase tracking-wide"
              style={{ backgroundColor: '#E6A850', color: '#252D33' }}
            >
              Join Live Auction
            </Button>
          )}
        </header>

        <div className="grid gap-6 md:grid-cols-[3fr,2fr]">
          <Card className="border-2 p-5 shadow-2xl backdrop-blur-xl" style={{ backgroundColor: 'rgba(61, 74, 87, 0.8)', borderColor: '#7A8B9F' }}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.25em]" style={{ color: '#5A6B7F' }}>
              Registered Players
            </h2>
            {players.length === 0 ? (
              <p className="text-sm" style={{ color: '#EAEBEC' }}>
                No players have registered for this auction yet.
              </p>
            ) : (
              <div className="max-h-[360px] space-y-2 overflow-y-auto text-sm">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between gap-2 rounded-md border-2 px-3 py-2 backdrop-blur-md transition-all duration-300"
                    style={{ borderColor: '#7A8B9F', backgroundColor: 'rgba(61, 74, 87, 0.6)' }}
                  >
                    <div>
                      <div className="font-medium" style={{ color: '#EAEBEC' }}>{player.name}</div>
                      <div className="text-xs uppercase tracking-wide" style={{ color: '#5A6B7F' }}>
                        {player.role}
                      </div>
                    </div>
                    <div className="text-xs uppercase tracking-wide px-2 py-1 rounded" style={{ color: '#EAEBEC', backgroundColor: 'rgba(230, 168, 80, 0.2)' }}>
                      {player.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="border-2 p-5 shadow-2xl backdrop-blur-xl" style={{ backgroundColor: 'rgba(61, 74, 87, 0.8)', borderColor: '#7A8B9F' }}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.25em]" style={{ color: '#5A6B7F' }}>
              Register for this Auction
            </h2>
            {auction.status === "completed" ? (
              <div className="flex flex-col h-40 items-center justify-center rounded-lg border-2 px-4 text-center space-y-3" style={{ borderColor: '#5A6B7F', backgroundColor: 'rgba(90, 107, 127, 0.2)' }}>
                <div className="text-sm font-medium" style={{ color: '#5A6B7F' }}>This auction has concluded.</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-2 transition-all duration-300"
                  onClick={() => router.push(`/live/${auctionId}`)}
                  style={{ borderColor: '#5A6B7F', color: '#5A6B7F' }}
                >
                  View Final Rosters
                </Button>
              </div>
            ) : hasRegistered ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 px-4 text-center text-sm font-medium" style={{ borderColor: '#E6A850', backgroundColor: 'rgba(230, 168, 80, 0.15)', color: '#E6A850' }}>
                You have already submitted a registration for this auction.
              </div>
            ) : !auction.is_registration_open ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 px-4 text-center text-sm font-medium" style={{ borderColor: '#E6A850', backgroundColor: 'rgba(230, 168, 80, 0.15)', color: '#252D33' }}>
                Registration is currently closed.
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-1">
                  <Label htmlFor="name" style={{ color: '#252D33', fontWeight: 'bold' }}>Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="border-2 transition-all duration-300 focus:shadow-lg"
                    style={{ backgroundColor: 'rgba(61, 74, 87, 0.6)', borderColor: '#7A8B9F', color: '#EAEBEC' }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phoneNumber" style={{ color: '#252D33', fontWeight: 'bold' }}>Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="border-2 transition-all duration-300 focus:shadow-lg"
                    style={{ backgroundColor: 'rgba(61, 74, 87, 0.6)', borderColor: '#7A8B9F', color: '#EAEBEC' }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="role" style={{ color: '#252D33', fontWeight: 'bold' }}>Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-md border-2 px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-300"
                    style={{ backgroundColor: 'rgba(61, 74, 87, 0.6)', borderColor: '#7A8B9F', color: '#EAEBEC', focusRingColor: '#E6A850' }}
                  >
                    <option value="" style={{ backgroundColor: '#3D4A57', color: '#EAEBEC' }}>Select role</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r} style={{ backgroundColor: '#3D4A57', color: '#EAEBEC' }}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <ImageUploadField
                  label="Player Photo"
                  value={photoFile}
                  onChange={setPhotoFile}
                  preview={photoPreview}
                  onPreviewChange={setPhotoPreview}
                  error={photoError}
                  required
                />
                <div className="text-xs" style={{ color: '#5A6B7F' }}>
                  Upcoming players registered here will enter the{" "}
                  <span className="font-medium" style={{ color: '#252D33' }}>upcoming pool</span> for the auction.
                </div>
                {error && <p className="text-xs" style={{ color: '#E6A850' }}>{error}</p>}
                {success && <p className="text-xs" style={{ color: '#E6A850' }}>{success}</p>}
                <Button type="submit" disabled={submitting} className="w-full font-bold uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:scale-105" style={{ backgroundColor: '#E6A850', color: '#252D33' }}>
                  {submitting ? "Submitting..." : "Register"}
                </Button>
              </form>
            )}

            {upcomingPlayers.length > 0 && (
              <p className="mt-4 text-xs" style={{ color: '#5A6B7F' }}>
                Currently{" "}
                <span className="font-semibold" style={{ color: '#252D33' }}>
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

