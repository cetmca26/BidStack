"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";

import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is an admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Access denied: Admin role required.");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 text-on-surface">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-2xl shadow-slate-300/40 dark:shadow-black/60">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Admin Login</h1>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Sign in with your admin credentials to access auction control.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-100">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password" title="Password" className="text-slate-700 dark:text-slate-100">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
              required
            />
          </div>
          {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Signing in..." : "Login as Admin"}
          </Button>
        </form>
        <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
          This is a simple hard-coded authentication layer to prevent casual access to admin pages.
        </p>
      </Card>
    </div>
  );
}

