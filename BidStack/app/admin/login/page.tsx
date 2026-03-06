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

