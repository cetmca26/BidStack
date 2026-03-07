import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export type AuctionSettings = {
    purse: number;
    min_players: number;
    max_players: number;
    base_price: number;
    increment: number;
    captain_base_price?: number;
};

export type Auction = {
    id: string;
    name: string;
    sport_type: string;
    status: "upcoming" | "live" | "completed";
    settings: AuctionSettings;
};

export type Team = {
    id: string;
    auction_id: string;
    name: string;
    manager: string;
    logo_url: string | null;
    purse_remaining: number;
    slots_remaining: number;
    captain_id: string | null;
};

export type Player = {
    id: string;
    auction_id: string;
    name: string;
    role: string;
    photo_url: string | null;
    is_captain: boolean;
    sold_team_id: string | null;
    sold_price: number | null;
    status: "sold" | "live" | "upcoming"; // Computed field
};

export type AuctionState = {
    id: string;
    auction_id: string;
    current_player_id: string | null;
    current_bid: number | null;
    leading_team_id: string | null;
    previous_bid: number | null;
    previous_leading_team_id: string | null;
    previous_player_id: string | null;
    phase: string;
    show_undo_notice?: boolean;
};

export function useAuctionState(auctionId: string) {
    const [auction, setAuction] = useState<Auction | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [state, setState] = useState<AuctionState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!auctionId) return;

        const loadInitial = async () => {
            setLoading(true);
            try {
                const [
                    { data: auctionData, error: auctionError },
                    { data: teamsData, error: teamsError },
                    { data: playersData, error: playersError },
                    { data: stateData, error: stateError }
                ] = await Promise.all([
                    supabase.from("auctions").select("*").eq("id", auctionId).single(),
                    supabase.from("teams").select("*").eq("auction_id", auctionId),
                    supabase.from("players").select("*").eq("auction_id", auctionId),
                    supabase.from("auction_state").select("*").eq("auction_id", auctionId).maybeSingle(),
                ]);

                if (auctionError) throw auctionError;
                if (teamsError) throw teamsError;
                if (playersError) throw playersError;
                if (stateError) throw stateError;

                setAuction(auctionData as Auction);
                setTeams((teamsData ?? []) as Team[]);
                setPlayers((playersData ?? []) as Player[]);
                if (stateData) setState(stateData as AuctionState);
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadInitial();

        // Setup Realtime Subscriptions
        const channel = supabase
            .channel(`auction:${auctionId}`)
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
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "auctions", filter: `id=eq.${auctionId}` },
                (payload) => {
                    if (payload.new) setAuction(payload.new as Auction);
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

    return {
        auction,
        teams,
        players,
        state,
        currentPlayer,
        leadingTeam,
        loading,
        error,
        setPlayers, // For local optimism if needed
        setTeams,
        setState
    };
}
