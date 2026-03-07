"use client";

import { useState } from "react";

interface PlayerAvatarProps {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  isCaptain?: boolean;
  sportType?: "football" | "cricket";
}

const ROLE_COLORS: Record<string, { border: string; bg: string; badge: string }> = {
  // Football roles
  Forward: { border: "border-red-500/60", bg: "from-red-600 to-red-800", badge: "⚽" },
  Midfielder: { border: "border-blue-500/60", bg: "from-blue-600 to-blue-800", badge: "⚽" },
  Defender: { border: "border-green-500/60", bg: "from-green-600 to-green-800", badge: "🛡️" },
  Goalkeeper: { border: "border-yellow-500/60", bg: "from-yellow-600 to-yellow-800", badge: "🥅" },
  // Cricket roles
  Batsman: { border: "border-orange-500/60", bg: "from-orange-600 to-orange-800", badge: "🏏" },
  Bowler: { border: "border-purple-500/60", bg: "from-purple-600 to-purple-800", badge: "🎯" },
  Allrounder: { border: "border-cyan-500/60", bg: "from-cyan-600 to-cyan-800", badge: "⭐" },
  Wicketkeeper: { border: "border-indigo-500/60", bg: "from-indigo-600 to-indigo-800", badge: "🧤" },
};

const SIZE_CLASSES = {
  sm: { container: "w-10 h-10", text: "text-[10px]", badge: "text-[8px]" },
  md: { container: "w-16 h-16", text: "text-xs", badge: "text-[10px]" },
  lg: { container: "w-24 h-24", text: "text-sm", badge: "text-xs" },
  xl: { container: "w-32 h-32", text: "text-base", badge: "text-sm" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PlayerAvatar({
  id,
  name,
  role,
  photoUrl,
  size = "md",
  showBadge = true,
  isCaptain = false,
  sportType = "football",
}: PlayerAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const roleConfig = ROLE_COLORS[role] || ROLE_COLORS[Object.keys(ROLE_COLORS)[0]];
  const sizeConfig = SIZE_CLASSES[size];
  const initials = getInitials(name);

  return (
    <div className="relative inline-block">
      {/* Captain Star Badge */}
      {isCaptain && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-black font-black rounded-full flex items-center justify-center shadow-lg shadow-amber-900/50 border-2 border-amber-200 z-20"
          style={{
            width: size === "sm" ? "16px" : size === "md" ? "24px" : size === "lg" ? "32px" : "40px",
            height: size === "sm" ? "16px" : size === "md" ? "24px" : size === "lg" ? "32px" : "40px",
            fontSize: size === "sm" ? "10px" : size === "md" ? "12px" : size === "lg" ? "16px" : "18px",
          }}
        >
          C
        </div>
      )}

      {/* Main Avatar */}
      <div
        className={`${sizeConfig.container} rounded-full overflow-hidden border-2 ${roleConfig.border} shadow-lg flex items-center justify-center font-bold text-white relative group bg-gradient-to-br ${roleConfig.bg}`}
      >
        {photoUrl && !imageError ? (
          <>
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {/* Role overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <span className={`${sizeConfig.badge} text-white/0 group-hover:text-white/80 transition-all`}>
                {roleConfig.badge}
              </span>
            </div>
          </>
        ) : (
          <>
            <span className={sizeConfig.text}>{initials}</span>
            {showBadge && (
              <div className="absolute bottom-0 right-0 bg-slate-900/80 rounded-full p-0.5 border border-white/20">
                <span className={`block ${sizeConfig.badge}`}>{roleConfig.badge}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
