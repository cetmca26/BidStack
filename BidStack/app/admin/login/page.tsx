"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-50">
      <Card className="w-full max-w-sm border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/60">
        <h1 className="mb-1 text-xl text-white font-semibold tracking-tight">Admin Login</h1>
        <p className="mb-5 text-sm text-slate-400">
          Sign in with your admin credentials to access auction control.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 text-slate-100">
            <Label htmlFor="email" className="text-slate-100">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950/80 text-slate-50 placeholder:text-slate-400"
              required
            />
          </div>
          <div className="space-y-1 text-slate-100">
            <Label htmlFor="password" title="Password" className="text-slate-100">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950/80 text-slate-50 placeholder:text-slate-400"
              required
            />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Signing in..." : "Login as Admin"}
          </Button>
        </form>
        <p className="mt-4 text-[11px] text-slate-500">
          This is a simple hard-coded authentication layer to prevent casual access to admin pages.
        </p>
      </Card>
    </div>
  );
}

