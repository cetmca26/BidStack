"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center h-9 w-9 rounded-lg border transition-all
        bg-white/10 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700
        hover:bg-slate-200 dark:hover:bg-slate-700
        text-slate-700 dark:text-slate-300
        shadow-sm backdrop-blur-sm"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={16} strokeWidth={2.5} className="text-amber-400" />
      ) : (
        <Moon size={16} strokeWidth={2.5} className="text-slate-600" />
      )}
    </button>
  );
}
