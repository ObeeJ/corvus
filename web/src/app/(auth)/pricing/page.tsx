"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Wallet, Zap, ArrowRight } from "lucide-react";

const FREE_FEATURES = [
  "5 scans total",
  "24 hour data retention",
  "Basic host discovery only",
  "No CVE correlation",
];

const PRO_FEATURES = [
  "Unlimited scans",
  "Unlimited data retention",
  "CVE + OSV + GitHub Advisory",
  "Full REST + WebSocket API",
  "LLM natural language queries",
  "Cloud API correlation",
];

export default function PricingPage() {
  const { token } = useAuth();
  const [selected, setSelected] = useState<"card" | "crypto" | null>(null);

  const handlePaystack = async () => {
    if (!token) { window.location.href = "/login"; return; }
    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.url) window.location.href = d.url;
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[16px] font-bold tracking-tight text-white/90">Choose your plan</h1>
        <p className="font-mono text-[11px] text-white/35 mt-1.5 tracking-wide">Upgrade anytime. Cancel anytime.</p>
      </div>

      <div className="space-y-3">
        {/* Free */}
        <div className="border border-white/[0.07] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Free Trial</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white/60">$0</span>
              <span className="font-mono text-[10px] text-white/25">/mo</span>
            </div>
          </div>
          <ul className="space-y-2">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 font-mono text-[11px] text-white/35 tracking-wide">
                <span className="w-1 h-1 rounded-full bg-white/15 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="block border border-white/[0.08] text-white/30 font-mono text-[11px] font-semibold py-2.5 text-center tracking-[0.15em] uppercase hover:border-white/20 hover:text-white/50 transition-colors"
          >
            Try for free
          </Link>
        </div>

        {/* Pro */}
        <div className="border border-[#F97316]/25 p-5 space-y-4 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#F97316]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-widest">Pro Plan</p>
              <span className="font-mono text-[9px] bg-[#F97316]/10 text-[#F97316]/70 border border-[#F97316]/20 px-1.5 py-0.5 tracking-widest uppercase">Popular</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">$10</span>
              <span className="font-mono text-[10px] text-white/25">/mo</span>
            </div>
          </div>
          <ul className="space-y-2">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 font-mono text-[11px] text-white/60 tracking-wide">
                <Zap className="w-3 h-3 text-[#F97316]/60 shrink-0" /> {f}
              </li>
            ))}
          </ul>

          {/* Payment method picker */}
          {!selected ? (
            <div className="space-y-2 pt-1">
              <button
                onClick={() => token ? handlePaystack() : setSelected("card")}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#F97316] text-[#0c0d10] font-mono font-bold text-[11px] hover:bg-[#F97316]/90 transition-colors tracking-widest uppercase"
              >
                <CreditCard className="w-4 h-4" />
                <span className="flex-1 text-left">Pay with Card · Paystack</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelected("crypto")}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white/50 font-mono text-[11px] hover:bg-white/[0.07] hover:text-white/70 transition-colors tracking-wide"
              >
                <Wallet className="w-4 h-4" />
                <span className="flex-1 text-left">Pay with USDC · Crypto</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : selected === "crypto" ? (
            <div className="space-y-2 pt-1">
              <p className="font-mono text-[10px] text-white/30 tracking-wide">
                You&apos;ll be able to choose your network (Base, Polygon, Ethereum) after signing up.
              </p>
              <Link
                href="/signup?plan=pro&method=crypto"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F97316] text-[#0c0d10] font-mono font-bold text-[11px] hover:bg-[#F97316]/90 transition-colors tracking-widest uppercase"
              >
                Continue with Crypto <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button onClick={() => setSelected(null)} className="w-full font-mono text-[10px] text-white/20 hover:text-white/40 transition-colors tracking-wide">
                Back
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <p className="text-center font-mono text-[11px] text-white/20 tracking-wide">
        Already have an account?{" "}
        <Link href="/login" className="text-[#F97316]/60 hover:text-[#F97316] transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
