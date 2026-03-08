import { Player, Team } from "@/lib/hooks/useAuctionState";

// ─── Role Configuration ─────────────────────────────────────────────
export const FOOTBALL_ROLES = ["Forward", "Midfielder", "Defender", "Goalkeeper"] as const;
export const CRICKET_ROLES = ["Batsman", "Wicketkeeper", "Allrounder", "Bowler"] as const;

export function getRolesForSport(sportType: string): string[] {
    return sportType === "football" ? [...FOOTBALL_ROLES] : [...CRICKET_ROLES];
}

const ROLE_EMOJI: Record<string, string> = {
    // Football
    Forward: "⚽",
    Midfielder: "⚽",
    Defender: "🛡️",
    Goalkeeper: "🥅",
    // Cricket
    Batsman: "🏏",
    Bowler: "⚡",
    Allrounder: "🎯",
    Wicketkeeper: "🧤",
};

export function getRoleEmoji(role: string): string {
    return ROLE_EMOJI[role] || "⚽";
}

// ─── Player Grouping ────────────────────────────────────────────────
export function getTeamPlayers(players: Player[], teamId: string): Player[] {
    return players.filter((p) => p.sold_team_id === teamId);
}

export function groupPlayersByRole(
    players: Player[],
    sportType: string,
): Record<string, Player[]> {
    const roles = getRolesForSport(sportType);
    return roles.reduce(
        (acc, role) => {
            acc[role] = players.filter((p) => p.role === role);
            return acc;
        },
        {} as Record<string, Player[]>,
    );
}

// ─── Key Player Detection ───────────────────────────────────────────
export function getCaptain(players: Player[]): Player | null {
    return players.find((p) => p.is_captain) || null;
}

/** Highest-priced non-captain player */
export function getMVP(players: Player[]): Player | null {
    const nonCaptains = players.filter((p) => !p.is_captain);
    if (nonCaptains.length === 0) return null;
    return [...nonCaptains].sort(
        (a, b) => (b.sold_price || 0) - (a.sold_price || 0),
    )[0];
}

/** Highest-priced player overall (captain or not) */
export function getTeamStar(players: Player[]): Player | null {
    if (players.length === 0) return null;
    return [...players].sort(
        (a, b) => (b.sold_price || 0) - (a.sold_price || 0),
    )[0];
}

// ─── Team Stats ─────────────────────────────────────────────────────
export function computeTeamStats(
    team: Team,
    teamPlayers: Player[],
): { totalSpend: number; avgPerPlayer: number; signings: number } {
    const totalSpend = teamPlayers.reduce(
        (sum, p) => sum + (p.sold_price || 0),
        0,
    );
    return {
        totalSpend,
        avgPerPlayer:
            teamPlayers.length > 0 ? Math.round(totalSpend / teamPlayers.length) : 0,
        signings: teamPlayers.length,
    };
}

/** Split a name into first name and last name parts */
export function splitName(name: string): { firstName: string; lastName: string } {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return { firstName: "", lastName: parts[0] || "" };
    return {
        firstName: parts.slice(0, -1).join(" "),
        lastName: parts[parts.length - 1],
    };
}
