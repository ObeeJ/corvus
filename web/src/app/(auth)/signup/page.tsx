"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";

const inputCls = "h-10 bg-white/[0.03] border-white/[0.08] text-white/75 placeholder:text-white/20 font-mono text-[12px] focus-visible:ring-[#F97316]/20 focus-visible:border-[#F97316]/30 tracking-wide";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign up");
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[16px] font-bold tracking-tight text-white/90">Create Account</h1>
        <p className="font-mono text-[11px] text-white/35 mt-1.5 tracking-wide">Start mapping network intelligence today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-3 font-mono text-[11px] text-red-400 bg-red-500/[0.07] border border-red-500/[0.15] tracking-wide">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] text-white/30 uppercase tracking-[0.15em]">Email</label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] text-white/30 uppercase tracking-[0.15em]">Password</label>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className={inputCls}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-[#F97316] text-[#0c0d10] font-mono font-bold text-[11px] hover:bg-[#F97316]/90 disabled:opacity-40 tracking-widest uppercase flex items-center justify-center gap-2 mt-1"
        >
          {isLoading ? "Creating..." : <><span>Create Account</span><MoveRight className="w-3.5 h-3.5" /></>}
        </Button>
      </form>

      <p className="text-center font-mono text-[11px] text-white/25 tracking-wide">
        Already have an account?{" "}
        <Link href="/login" className="text-[#F97316]/70 hover:text-[#F97316] transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
