"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  CreditCard, Wallet, CheckCircle2, AlertCircle, XCircle,
  Copy, ExternalLink, ChevronDown, Loader2, Receipt, Zap, Info, ArrowLeft
} from "lucide-react";
import { TokenIcon } from "@/components/TokenIcon";

/* Supported token×network pairs (backend authoritative — keep in sync with paystack.go). */
type CryptoOption = {
  token: string;
  network: string;
  networkLabel: string;
  amount: string;
  badge?: string;
  hint?: string;
};
const CRYPTO_OPTIONS: CryptoOption[] = [
  { token: "USDT", network: "base",     networkLabel: "Base",     amount: "10",      badge: "cheapest", hint: "L2 · low fees, fast finality" },
  { token: "USDT", network: "arbitrum", networkLabel: "Arbitrum", amount: "10",      badge: "fast",     hint: "L2 · sub-second settlement" },
  { token: "USDT", network: "tron",     networkLabel: "Tron",     amount: "10",                          hint: "TRC-20 · widely used in Asia" },
  { token: "USDT", network: "ethereum", networkLabel: "Ethereum", amount: "10",                          hint: "ERC-20 · highest gas" },
  { token: "USDC", network: "solana",   networkLabel: "Solana",   amount: "10",      badge: "fast",     hint: "SPL · near-instant confirmation" },
  { token: "ETH",  network: "ethereum", networkLabel: "Ethereum", amount: "0.005",                       hint: "Native Ether" },
  { token: "BTC",  network: "bitcoin",  networkLabel: "Bitcoin",  amount: "0.00015",                     hint: "Native Bitcoin (BIP-84)" },
];


const inputCls = "h-9 bg-white/[0.03] border-white/[0.07] text-white/65 placeholder:text-white/20 font-mono text-[12px] focus-visible:ring-[#F97316]/20 focus-visible:border-[#F97316]/30 tracking-wide";

function Section({ title, desc, children, accent }: {
  title: string; desc: string; children: React.ReactNode; accent?: boolean;
}) {
  return (
    <div className={`bg-[#181b22] border overflow-hidden ${accent ? "border-[#F97316]/25" : "border-white/[0.07]"}`}>
      {accent && <div className="h-[2px] bg-[#F97316]" />}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[13px] font-semibold text-white/80 tracking-wide">{title}</p>
        <p className="font-mono text-[11px] text-white/30 mt-0.5 tracking-wide">{desc}</p>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 text-white/25 hover:text-[#F97316] transition-colors" aria-label="Copy">
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#F97316]" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function UsageMeter({ used, total, label }: { used: number; total: number | null; label: string }) {
  const unlimited = total === null;
  const pct = unlimited || total === 0 ? 0 : Math.min((used / total) * 100, 100);
  const color = pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-[#F97316]";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between font-mono text-[10px] text-white/30 tracking-wide uppercase">
        <span>{label}</span>
        <span>{used} / {unlimited ? "∞" : total}</span>
      </div>
      <div className="h-1 bg-white/[0.06] w-full overflow-hidden">
        <motion.div
          className={`h-full ${unlimited ? "bg-[#F97316]/30" : color}`}
          initial={{ width: 0 }}
          animate={{ width: `${unlimited ? 100 : pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { user, apiFetch, refreshUser } = useAuth();
  const isPro = user?.plan === "pro";

  // payment state
  const [tab, setTab] = useState<"card" | "crypto">("card");
  const [selected, setSelected] = useState<CryptoOption>(CRYPTO_OPTIONS[0]);
  const [cryptoInfo, setCryptoInfo] = useState<any>(null);
  const [txHash, setTxHash] = useState("");
  const [verifyMsg, setVerifyMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // post-checkout banner from ?success=true / ?canceled=true
  const [banner, setBanner] = useState<{ type: "success" | "canceled"; visible: boolean }>({ type: "success", visible: false });

  // real usage from backend
  const [usage, setUsage] = useState<{ scans_used: number; scans_limit: number | null } | null>(null);

  // cancel state
  const [cancelConfirm, setCancelConfirm] = useState(false);

  // invoice state
  const [showInvoices, setShowInvoices] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesFetched, setInvoicesFetched] = useState(false);

  /* Handle post-checkout redirect from Paystack: /billing?success=true or ?canceled=true
     Also handles /billing?quota=exceeded from the 402 auto-redirect in apiFetch */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setBanner({ type: "success", visible: true });
      window.history.replaceState({}, "", "/billing");
      // Webhook usually arrives within seconds. Poll for plan upgrade up to 30s.
      let tries = 0;
      const id = setInterval(async () => {
        tries++;
        const fresh = await refreshUser();
        if (fresh?.plan === "pro" || tries >= 10) clearInterval(id);
      }, 3000);
      refreshUser();
    } else if (params.get("canceled") === "true") {
      setBanner({ type: "canceled", visible: true });
      window.history.replaceState({}, "", "/billing");
    } else if (params.get("quota") === "exceeded") {
      setBanner({ type: "canceled", visible: true });
      window.history.replaceState({}, "", "/billing");
    }
  }, [refreshUser]);

  /* Real usage from backend. Falls back to null if endpoint isn't deployed yet. */
  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/v1/billing/usage")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled || !d) return;
        setUsage({
          scans_used: d.scans_used ?? 0,
          scans_limit: d.scans_limit === -1 || d.scans_limit == null ? null : d.scans_limit,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [apiFetch]);

  const handlePaystack = async () => {
    setLoading(true);
    setPaymentError(null);
    try {
      const res = await apiFetch("/api/v1/billing/checkout", { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.url) {
        window.location.href = d.url;
        return;
      }
      setPaymentError(
        d.error
          ? `Paystack: ${d.error}`
          : `Paystack checkout failed (${res.status}). Verify PAYSTACK_SECRET_KEY is set on the server.`
      );
    } catch (e: any) {
      setPaymentError(`Network error contacting checkout: ${e?.message || "unknown"}`);
    } finally { setLoading(false); }
  };

  const handleCrypto = async () => {
    setLoading(true);
    setCryptoInfo(null);
    setVerifyMsg(null);
    setPaymentError(null);
    try {
      const res = await apiFetch("/api/v1/billing/crypto", {
        method: "POST",
        body: JSON.stringify({ token: selected.token, network: selected.network }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d?.payment?.address) {
        setPaymentError(d.error || `Failed to generate address (${res.status}). Backend may be down.`);
        return;
      }
      setCryptoInfo(d);
    } catch (e: any) {
      setPaymentError(`Network error: ${e?.message || "unknown"}`);
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!cryptoInfo?.payment?.reference || !txHash) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/billing/crypto/verify", {
        method: "POST",
        body: JSON.stringify({ reference: cryptoInfo.payment.reference, tx_hash: txHash }),
      });
      const d = await res.json();
      setVerifyMsg({ type: d.status === "confirmed" ? "success" : "error", text: d.message || d.status });
    } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await apiFetch("/api/v1/billing/cancel", { method: "POST" });
      setCancelConfirm(false);
    } finally { setLoading(false); }
  };

  const toggleInvoices = async () => {
    setShowInvoices(v => !v);
    if (invoicesFetched) return;
    setInvoicesLoading(true);
    try {
      const res = await apiFetch("/api/v1/billing/invoices");
      const d = await res.json();
      setInvoices(d.invoices || []);
    } catch { setInvoices([]); }
    finally { setInvoicesLoading(false); setInvoicesFetched(true); }
  };

  const scansUsed = usage?.scans_used ?? 0;
  const scansLimit = usage ? usage.scans_limit : (isPro ? null : 5);

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto pb-12 px-6 pt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-mono text-[10px] text-white/30 hover:text-white/60 transition-colors tracking-[0.15em] uppercase mb-5"
        >
          <ArrowLeft className="w-3 h-3" /> Back to dashboard
        </Link>
        <h1 className="text-[15px] font-semibold text-white/85 tracking-wide">Billing</h1>
        <p className="font-mono text-[11px] text-white/30 mt-1 tracking-wide">Manage your plan, payments, and invoices</p>
      </motion.div>

      {/* Post-checkout banner */}
      <AnimatePresence>
        {banner.visible && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-start gap-3 p-4 border ${
              banner.type === "success"
                ? "bg-[#F97316]/[0.06] border-[#F97316]/25"
                : "bg-amber-500/[0.06] border-amber-500/25"
            }`}
          >
            {banner.type === "success"
              ? <CheckCircle2 className="w-4 h-4 text-[#F97316] mt-0.5 shrink-0" />
              : <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
            <div className="flex-1">
              <p className={`font-mono text-[12px] font-semibold tracking-wide ${banner.type === "success" ? "text-[#F97316]" : "text-amber-400"}`}>
                {banner.type === "success" ? "Payment confirmed" : "Checkout canceled"}
              </p>
              <p className="font-mono text-[11px] text-white/45 mt-1 tracking-wide">
                {banner.type === "success"
                  ? "Your Pro plan is active. Allow up to 60 seconds for changes to propagate across mesh nodes."
                  : "No charge was made. You can resume the upgrade anytime below."}
              </p>
            </div>
            <button
              onClick={() => setBanner(b => ({ ...b, visible: false }))}
              className="text-white/25 hover:text-white/60 transition-colors p-1"
              aria-label="Dismiss"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current plan */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <Section title="Current Plan" desc="Your active subscription and usage" accent={isPro}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className={`font-mono text-[11px] font-bold uppercase tracking-widest ${isPro ? "text-[#F97316]" : "text-white/40"}`}>
                  {isPro ? "Pro Plan" : "Free Trial"}
                </span>
                {isPro && (
                  <span className="font-mono text-[9px] bg-[#F97316]/10 text-[#F97316]/70 border border-[#F97316]/20 px-2 py-0.5 tracking-widest uppercase">
                    Active
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] text-white/30 tracking-wide">
                {isPro ? "$10 / month · unlimited scans" : "100 scans / month · 7-day retention"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-white">{isPro ? "$10" : "$0"}</p>
              <p className="font-mono text-[10px] text-white/25 tracking-wide">/month</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <UsageMeter used={scansUsed} total={scansLimit} label="Scans this month" />
          </div>

          {isPro && (
            <div className="pt-1">
              {!cancelConfirm ? (
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="font-mono text-[10px] text-white/20 hover:text-red-400 transition-colors tracking-wide uppercase"
                >
                  Cancel subscription
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-red-500/[0.06] border border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <p className="font-mono text-[11px] text-white/50 flex-1 tracking-wide">Cancel at end of billing period?</p>
                  <button onClick={handleCancel} disabled={loading} className="font-mono text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest">
                    Confirm
                  </button>
                  <button onClick={() => setCancelConfirm(false)} className="font-mono text-[10px] text-white/25 hover:text-white/50 uppercase tracking-widest">
                    Keep
                  </button>
                </div>
              )}
            </div>
          )}
        </Section>
      </motion.div>

      {/* Upgrade — only on free */}
      {!isPro && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Section title="Upgrade to Pro" desc="$10 / month · unlimited scans · full API access · no data limits" accent>
            <div className="grid grid-cols-2 gap-2">
              {["Unlimited scans","Unlimited data retention","CVE + OSV correlation","Full REST + WebSocket API","LLM natural language queries","Cloud API correlation","Distributed scanner mesh nodes","Priority support"].map(f => (
                <div key={f} className="flex items-center gap-2 font-mono text-[11px] text-white/50 tracking-wide">
                  <Zap className="w-3 h-3 text-[#F97316]/60 shrink-0" />{f}
                </div>
              ))}
            </div>

            <Separator className="bg-white/[0.05]" />

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] w-fit">
              {([["card", CreditCard, "Paystack"], ["crypto", Wallet, "Crypto"]] as const).map(([id, Icon, label]) => (
                <button
                  key={id}
                  onClick={() => { setTab(id); setCryptoInfo(null); setVerifyMsg(null); }}
                  className={`flex items-center gap-2 px-4 py-2 font-mono text-[11px] tracking-wide transition-colors ${
                    tab === id ? "bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/25" : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>

            {paymentError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 border border-red-500/25 bg-red-500/[0.06]"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[11px] text-red-300 tracking-wide font-semibold">Payment failed</p>
                  <p className="font-mono text-[10px] text-red-300/70 tracking-wide mt-0.5 leading-relaxed break-words">{paymentError}</p>
                </div>
                <button onClick={() => setPaymentError(null)} className="text-red-400/50 hover:text-red-400 p-0.5">
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {tab === "card" && (
                <motion.div key="card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="space-y-3">
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <p className="font-mono text-[11px] text-white/55 tracking-wide">Pay with Paystack — ₦16,500/mo (~$10)</p>
                    <p className="font-mono text-[10px] text-white/30 tracking-wide leading-relaxed">
                      Cards (Visa, Mastercard, Verve), direct bank transfer, USSD, mobile money, Apple Pay, and Nigerian bank accounts. Pick at checkout.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Card", "Bank transfer", "USSD", "Mobile money", "Apple Pay"].map(m => (
                        <span key={m} className="font-mono text-[9px] text-white/40 border border-white/[0.08] px-2 py-0.5 tracking-wide">{m}</span>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handlePaystack} disabled={loading} className="h-10 w-full bg-[#F97316] text-[#0c0d10] font-mono font-bold text-[11px] hover:bg-[#F97316]/90 tracking-widest uppercase flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue to Paystack · ₦16,500/mo</>}
                  </Button>
                  <p className="font-mono text-[10px] text-white/20 tracking-wide text-center">Secured by Paystack · Cancel anytime</p>
                </motion.div>
              )}

              {tab === "crypto" && (
                <motion.div key="crypto" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="space-y-4">
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <p className="font-mono text-[11px] text-white/50 tracking-wide">Pay with any supported token</p>
                    <p className="font-mono text-[10px] text-white/25 tracking-wide">No KYC · activation after on-chain confirmation</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.15em]">Token & network</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CRYPTO_OPTIONS.map(opt => {
                        const active = selected.token === opt.token && selected.network === opt.network;
                        return (
                          <button
                            key={`${opt.token}-${opt.network}`}
                            onClick={() => { setSelected(opt); setCryptoInfo(null); setVerifyMsg(null); }}
                            className={`text-left px-3.5 py-3 border transition-all tracking-wide group ${
                              active
                                ? "bg-[#F97316]/10 border-[#F97316]/35"
                                : "bg-white/[0.02] border-white/[0.07] hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-1.5">
                              <TokenIcon token={opt.token} size={26} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`font-mono text-[11px] font-semibold tracking-wide ${active ? "text-[#F97316]" : "text-white/75"}`}>
                                    {opt.token} <span className="text-white/30 font-normal">on</span> {opt.networkLabel}
                                  </span>
                                  {opt.badge && (
                                    <span className={`font-mono text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5 border shrink-0 ${
                                      active
                                        ? "border-[#F97316]/30 text-[#F97316]/80"
                                        : "border-white/[0.08] text-white/30"
                                    }`}>
                                      {opt.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="font-mono text-[10px] text-white/30 tracking-wide mt-0.5 truncate">{opt.hint}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-end pl-[38px]">
                              <span className="font-mono text-[10px] text-white/50 tracking-wide shrink-0">{opt.amount} {opt.token}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button onClick={handleCrypto} disabled={loading} variant="outline" className="h-9 w-full bg-transparent border-white/[0.1] text-white/45 hover:bg-white/[0.04] hover:text-white/70 font-mono text-[11px] tracking-wide">
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Wallet className="w-3.5 h-3.5 mr-2" />}
                    Generate Payment Address
                  </Button>

                  <AnimatePresence>
                    {cryptoInfo && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-4 p-4 bg-white/[0.02] border border-white/[0.07]">
                        <p className="font-mono text-[11px] text-white/40 leading-relaxed tracking-wide">
                          {cryptoInfo.instructions || `Send exactly ${cryptoInfo.payment?.amount} ${cryptoInfo.payment?.token} on ${cryptoInfo.payment?.network}. Plan activates within 2 confirmations.`}
                        </p>
                        <div className="space-y-1.5">
                          <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.15em]">Send to</p>
                          <div className="flex items-center gap-2 bg-black/40 border border-white/[0.07] px-3 py-2.5">
                            <code className="flex-1 font-mono text-[11px] text-[#F97316] break-all tracking-wide">{cryptoInfo.payment?.address}</code>
                            <CopyButton text={cryptoInfo.payment?.address || ""} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            ["Amount", `${cryptoInfo.payment?.amount} ${cryptoInfo.payment?.token}`],
                            ["Network", cryptoInfo.payment?.network],
                            ["Ref", `${cryptoInfo.payment?.reference?.slice(0, 12)}…`],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <p className="font-mono text-[10px] text-white/20 uppercase tracking-[0.12em] mb-1">{label}</p>
                              <p className="font-mono text-[11px] text-white/55 tracking-wide">{value}</p>
                            </div>
                          ))}
                        </div>
                        <Separator className="bg-white/[0.05]" />
                        <div className="space-y-2">
                          <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.15em]">After sending — paste your transaction hash</p>
                          <div className="flex gap-2">
                            <Input placeholder="0x... or txid" value={txHash} onChange={e => setTxHash(e.target.value)} className={inputCls + " flex-1"} />
                            <Button onClick={handleVerify} disabled={loading || !txHash} className="h-9 px-4 bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316]/20 font-mono text-[11px] tracking-wide">
                              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                            </Button>
                          </div>
                          <AnimatePresence>
                            {verifyMsg && (
                              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className={`flex items-center gap-2 p-3 border font-mono text-[11px] tracking-wide ${
                                  verifyMsg.type === "success" ? "bg-[#F97316]/[0.06] border-[#F97316]/20 text-[#F97316]" : "bg-red-500/[0.06] border-red-500/20 text-red-400"
                                }`}>
                                {verifyMsg.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                                {verifyMsg.text}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>
        </motion.div>
      )}

      {/* How upgrading works — small UX guide */}
      {!isPro && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.13 }}>
          <div className="bg-white/[0.015] border border-white/[0.05] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-3.5 h-3.5 text-white/35" />
              <p className="font-mono text-[11px] text-white/55 uppercase tracking-[0.15em]">How it works</p>
            </div>
            <ol className="space-y-2.5">
              {[
                ["1", "Pick card or crypto.", "Paystack handles card; crypto is direct on-chain."],
                ["2", "Pay & confirm.", "Card: instant. Crypto: 1–2 network confirmations."],
                ["3", "Plan activates automatically.", "No support ticket. Mesh nodes sync within 60s."],
              ].map(([n, h, d]) => (
                <li key={n} className="flex gap-3">
                  <span className="font-mono text-[10px] text-[#F97316]/70 mt-0.5 shrink-0 tabular-nums">{n}</span>
                  <div>
                    <p className="text-[12px] text-white/70 tracking-wide">{h}</p>
                    <p className="font-mono text-[10px] text-white/30 mt-0.5 tracking-wide">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}

      {/* Invoice history */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Section title="Invoice History" desc="All past payments and receipts">
          <button onClick={toggleInvoices} className="flex items-center gap-2 font-mono text-[11px] text-white/35 hover:text-white/60 transition-colors tracking-wide w-full">
            <Receipt className="w-3.5 h-3.5" />
            Payment history
            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${showInvoices ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showInvoices && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                {invoicesLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-4 h-4 animate-spin text-white/20" />
                  </div>
                ) : invoices.length === 0 ? (
                  <p className="font-mono text-[11px] text-white/20 text-center py-6 tracking-wide">No invoices yet</p>
                ) : (
                  <div className="border border-white/[0.06] divide-y divide-white/[0.04]">
                    <div className="grid grid-cols-4 px-4 py-2 font-mono text-[10px] text-white/20 uppercase tracking-[0.12em]">
                      <span>Reference</span><span>Date</span><span>Amount</span><span>Method · Status</span>
                    </div>
                    {invoices.map((inv: any, i: number) => (
                      <motion.div key={inv.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="grid grid-cols-4 px-4 py-3 font-mono text-[11px] text-white/45 hover:bg-white/[0.02] transition-colors items-center tracking-wide">
                        <span className="text-[#F97316]/70 truncate" title={inv.id}>
                          {inv.reference ? inv.reference.slice(0, 14) + "…" : inv.id?.slice(0, 8)}
                        </span>
                        <span>{inv.date}</span>
                        <span>{inv.amount_usd ? `$${Number(inv.amount_usd).toFixed(2)}` : inv.amount || "—"}</span>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            inv.status === "success" ? "bg-emerald-500" :
                            inv.status === "pending_review" ? "bg-amber-500" :
                            "bg-[#F97316]/50"
                          }`} />
                          {inv.method || inv.provider || "—"}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                <p className="font-mono text-[10px] text-white/20 tracking-wide mt-3 text-center">
                  Need a receipt? Email <span className="text-[#F97316]/50">billing@corvus.sh</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>
      </motion.div>

      {/* Support */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="p-4 bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] text-white/40 tracking-wide">Billing question or dispute?</p>
            <p className="font-mono text-[10px] text-white/20 mt-0.5 tracking-wide">We respond within 24 hours</p>
          </div>
          <a href="mailto:billing@corvus.sh" className="font-mono text-[11px] text-[#F97316]/60 hover:text-[#F97316] transition-colors tracking-wide flex items-center gap-1.5">
            billing@corvus.sh <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
