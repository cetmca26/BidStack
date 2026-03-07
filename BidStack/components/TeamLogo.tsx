"use client";

import { useState } from "react";

interface TeamLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES = {
  sm: { container: "w-8 h-8", text: "text-[10px]" },
  md: { container: "w-12 h-12", text: "text-xs" },
  lg: { container: "w-20 h-20", text: "text-sm" },
  xl: { container: "w-32 h-32", text: "text-base" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TeamLogo({
  name,
  logoUrl,
  size = "md",
}: TeamLogoProps) {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = SIZE_CLASSES[size];
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeConfig.container} rounded-full overflow-hidden border-2 border-slate-700 shadow-lg flex items-center justify-center font-bold text-white bg-gradient-to-br from-slate-700 to-slate-900`}
    >
      {logoUrl && !imageError ? (
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={sizeConfig.text}>{initials}</span>
      )}
    </div>
  );
}
