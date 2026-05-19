"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Activity, Eye, Zap, Network, Brain,
  Check, Mail,
  Menu, X, ArrowUpRight, MoveRight,
  MessageCircle, Clock
} from "lucide-react";

/* Brand icons (lucide dropped these kept as inline SVG which is the right call for trademarks) */
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.467-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.103.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.594 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import { Logo } from "@/components/Logo";

/* ── Hero meta: editorial release-line, no pill, no animation gimmicks ── */
/* ── Status chip: 100 cycling messages ── */
/* ── Hero meta strip: cycles B → C with editorial masthead style ── */
const META_SETS = [
  [
    { text: "Private Beta", accent: true },
    { text: "/",            dim: true    },
    { text: "Real-time detection"        },
    { text: "/",            dim: true    },
    { text: "Self-hosted"                },
    { text: "/",            dim: true    },
    { text: "No data leaves your infra"  },
  ],
  [
    { text: "Private Beta", accent: true },
    { text: "/",            dim: true    },
    { text: "Built for security teams"   },
    { text: "/",            dim: true    },
    { text: "Self-hosted"                },
    { text: "/",            dim: true    },
    { text: "Runs on your infra"         },
  ],
];

function HeroMeta() {
  const [set, setSet] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 700);
      setSet(s => (s + 1) % META_SETS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center gap-4 mb-10"
    >
      {/* 2px rule draws itself in once */}
      <motion.div
        className="h-[2px] bg-[#F97316] shrink-0"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        style={{ width: 40, originX: "0%" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />

      {/* pulsing dot at rule tip */}
      <span className="relative flex items-center justify-center w-2 h-2 shrink-0 -ml-3" aria-hidden>
        <motion.span
          className="absolute inset-0 rounded-full bg-[#F97316]/40"
          animate={
            pulse
              ? { scale: [1, 3.2], opacity: [0.9, 0] }
              : { scale: [1, 2.0], opacity: [0.6, 0] }
          }
          transition={{
            duration: pulse ? 0.55 : 2.0,
            ease: "easeOut",
            repeat: pulse ? 0 : Infinity,
          }}
        />
        <motion.span
          className="relative w-1 h-1 rounded-full bg-[#F97316]"
          animate={pulse ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </span>

      {/* cycling items */}
      <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] uppercase whitespace-nowrap overflow-x-auto">
        <AnimatePresence mode="wait">
          <motion.span
            key={set}
            initial={{ opacity: 0, y: 7, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -7, filter: "blur(5px)" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5"
          >
            {META_SETS[set].map(({ text, accent, dim }: { text: string; accent?: boolean; dim?: boolean }, i: number) => (
              <span
                key={i}
                className={
                  accent ? "text-[#F97316]" :
                  dim    ? "text-white/15"  :
                           "text-white/45"
                }
              >
                {text}
              </span>
            ))}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── nav ── */
function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["About", "Features", "Pricing", "Contact"];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#111318]/95 backdrop-blur border-b border-white/[0.06]" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo size={26} wordmarkClassName="text-white text-[13px]" />

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="font-mono text-[12px] text-white/40 hover:text-white/80 transition-colors tracking-wider uppercase">
              {l}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="font-mono text-[12px] text-white/40 hover:text-white/80 transition-colors px-4 py-2 tracking-wider uppercase">
            Sign in
          </Link>
          <Link href="/signup" className="font-mono text-[12px] font-semibold bg-[#F97316] text-[#0c0d10] px-5 py-2.5 hover:bg-[#F97316]/90 transition-colors tracking-widest uppercase flex items-center gap-2">
            Start Free <MoveRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button className="md:hidden text-white/50" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#111318] border-b border-white/[0.06] px-6 py-5 flex flex-col gap-4">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} className="font-mono text-[13px] text-white/50 hover:text-white uppercase tracking-wider">
              {l}
            </a>
          ))}
          <Link href="/signup" className="font-mono text-[12px] font-semibold bg-[#F97316] text-[#0c0d10] px-5 py-3 text-center tracking-widest uppercase">
            Start Free
          </Link>
        </div>
      )}
    </header>
  );
}



/* ── Positioning: Why Corvus (vs nmap) ── */
const NMAP_GAPS = [
  {
    capability: "Network state over time",
    nmap: "Stateless every scan starts from zero",
    corvus: "Time-series graph of every host, port, and service change",
  },
  {
    capability: "Behavioral anomaly detection",
    nmap: "No concept of \"different from last week\"",
    corvus: "Alerts on banner drift, version rotation, latency change",
  },
  {
    capability: "CVE correlation",
    nmap: "Bolt-on NSE scripts, no severity context",
    corvus: "Native NVD + OSV + GitHub Advisory lookup inline",
  },
  {
    capability: "Passive OSINT pre-scan",
    nmap: "Sends packets first, asks questions never",
    corvus: "CT logs, DNS, BGP, cloud ranges before a single probe",
  },
  {
    capability: "Operator interface",
    nmap: "CLI flags and XML output",
    corvus: "Web dashboard, REST + WebSocket API, natural-language queries",
  },
];

function VsNmap() {
  return (
    <section id="about" className="border-y border-white/[0.06] bg-[#0e1016] relative overflow-hidden">
      {/* ambient warm wash */}
      <div className="pointer-events-none absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-[#F97316]/[0.04] blur-3xl" aria-hidden />

      <div className="max-w-7xl mx-auto px-6 py-28 relative">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-12 gap-10 mb-16 items-end"
        >
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em] mb-5">
              Positioning · Why Corvus
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight">
              <span className="font-mono text-white/40 line-through decoration-[#F97316]/60 decoration-[2px]">nmap</span>{" "}
              <span className="text-white">stopped where</span><br />
              <span className="text-white/30">networks started moving.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-mono text-[13px] text-white/45 leading-relaxed">
              nmap is a brilliant point-in-time scanner. But modern networks change every hour services rotate, CVEs land, attackers move sideways. Corvus is the engine that remembers, correlates, and tells you what shifted.
            </p>
          </div>
        </motion.div>

        {/* Comparison table */}
        <div className="border border-white/[0.07] bg-[#0e1016]">
          {/* Column headers */}
          <div className="grid grid-cols-[1.2fr_1fr_1.4fr] lg:grid-cols-[1.5fr_1fr_1.6fr] border-b border-white/[0.06]">
            <div className="px-5 py-4">
              <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.18em]">Capability</span>
            </div>
            <div className="px-5 py-4 border-l border-white/[0.05]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-white/40 tracking-wide">nmap</span>
                <span className="font-mono text-[9px] text-white/25 uppercase tracking-[0.15em]">since 1997</span>
              </div>
            </div>
            <div className="px-5 py-4 border-l border-white/[0.05] bg-[#F97316]/[0.04] relative">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#F97316]" />
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-[#F97316] font-semibold tracking-wide">Corvus</span>
                <span className="font-mono text-[9px] text-[#F97316]/60 uppercase tracking-[0.15em]">2025</span>
              </div>
            </div>
          </div>

          {/* Rows */}
          {NMAP_GAPS.map((row, i) => (
            <motion.div
              key={row.capability}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={`grid grid-cols-[1.2fr_1fr_1.4fr] lg:grid-cols-[1.5fr_1fr_1.6fr] ${
                i < NMAP_GAPS.length - 1 ? "border-b border-white/[0.05]" : ""
              } group hover:bg-white/[0.015] transition-colors`}
            >
              {/* Capability */}
              <div className="px-5 py-5">
                <p className="text-[14px] font-semibold text-white/85 tracking-wide">{row.capability}</p>
              </div>
              {/* nmap (muted, with X) */}
              <div className="px-5 py-5 border-l border-white/[0.05] flex items-start gap-2.5">
                <X className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" strokeWidth={2} />
                <span className="font-mono text-[12px] text-white/30 leading-relaxed tracking-wide">{row.nmap}</span>
              </div>
              {/* Corvus (active, with check) */}
              <div className="px-5 py-5 border-l border-white/[0.05] bg-[#F97316]/[0.02] flex items-start gap-2.5 group-hover:bg-[#F97316]/[0.04] transition-colors">
                <Check className="w-3.5 h-3.5 text-[#F97316] mt-0.5 shrink-0" strokeWidth={2.25} />
                <span className="font-mono text-[12px] text-white/75 leading-relaxed tracking-wide">{row.corvus}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footnote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-between flex-wrap gap-4"
        >
          <p className="font-mono text-[11px] text-white/30 tracking-wide leading-relaxed max-w-xl">
            We still use nmap under the hood for raw probes. Corvus is the intelligence layer it never had state, history, context, alerting.
          </p>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-[#F97316]/80 hover:text-[#F97316] transition-colors tracking-[0.15em] uppercase border-b border-[#F97316]/30 hover:border-[#F97316] pb-0.5"
          >
            See full capabilities <ArrowUpRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc, index }: { icon: any; title: string; desc: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group p-6 border border-white/[0.06] bg-[#181b22] hover:border-[#F97316]/30 hover:bg-[#1e2129] transition-all duration-300 card-lift"
    >
      <div className="w-9 h-9 border border-white/[0.1] flex items-center justify-center mb-5 group-hover:border-[#F97316]/40 transition-colors">
        <Icon className="w-4 h-4 text-white/40 group-hover:text-[#F97316] transition-colors" strokeWidth={1.5} />
      </div>
      <h3 className="text-[14px] font-semibold text-white/85 mb-2 tracking-wide">{title}</h3>
      <p className="font-mono text-[12px] text-white/35 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#111318] text-white overflow-x-hidden">
      <NavBar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center grid-bg pt-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#F97316]/[0.03] blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <HeroMeta />

            <h1 className="text-6xl lg:text-7xl font-bold leading-[0.95] tracking-[-0.02em] mb-8">
              Networks<br />
              <span className="text-white/20">change.</span><br />
              <span className="text-[#F97316]">Corvus</span><br />
              remembers.
            </h1>

            <p className="font-mono text-[14px] text-white/40 leading-relaxed max-w-lg mb-12">
              A living network intelligence engine that tracks how infrastructure changes over time, fuses passive OSINT before scanning, and surfaces anomalies the moment they appear.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2.5 bg-[#F97316] text-[#0c0d10] font-bold font-mono text-[12px] px-7 py-3.5 tracking-widest uppercase hover:bg-[#F97316]/90 transition-colors"
              >
                Start for free <MoveRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 border border-white/15 text-white/50 font-mono text-[12px] px-7 py-3.5 hover:border-white/30 hover:text-white/80 transition-colors tracking-widest uppercase"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-16 pt-10 border-t border-white/[0.06] flex items-center gap-10 flex-wrap">
              {["SOC 2 Compliant", "No agents required", "Self-hostable"].map(b => (
                <div key={b} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#F97316]/60" strokeWidth={2} />
                  <span className="font-mono text-[11px] text-white/30 tracking-wide">{b}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT / vs nmap positioning ── */}
      <VsNmap />


      {/* ── FEATURES ── */}
      <section id="features" className="py-32 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em] mb-4">Capabilities</p>
          <h2 className="text-5xl font-bold leading-[1.0] tracking-tight max-w-xl">
            Intelligence that<br />
            <span className="text-white/25">never sleeps</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
          {[
            { icon: Activity, title: "Temporal State Tracking", desc: "Every host, port, and service state stored in an embedded time-series graph. Query the full history of any endpoint." },
            { icon: Eye, title: "Predictive OSINT Fusion", desc: "Before sending a single packet, Corvus queries CT logs, DNS, BGP, and cloud IP ranges to build a probability model." },
            { icon: Zap, title: "Behavioral Anomaly Detection", desc: "Alerts on behavioral change response time delta, banner mutation, TLS rotation, service version drift." },
            { icon: Network, title: "Distributed Mesh", desc: "Multiple Corvus nodes form a P2P mesh using gossip protocol, sharing results without central coordination." },
            { icon: Brain, title: "LLM Query Interface", desc: "Ask questions in plain English. Corvus translates natural language into query plans and summarizes findings." },
            { icon: Shield, title: "CVE Correlation", desc: "Cross-references detected versions against NVD, OSV, and GitHub Advisory Database inline with scan results." },
          ].map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-32 border-t border-white/[0.06] bg-[#0e1016] grid-bg">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em] mb-4">Pricing</p>
            <h2 className="text-5xl font-bold tracking-tight">Simple,<br /><span className="text-white/25">transparent</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-px bg-white/[0.06]">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#181b22] p-10 flex flex-col"
            >
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.18em] mb-6">Free Trial</p>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-5xl font-bold tracking-tight text-white">$0</span>
                <span className="font-mono text-white/30 text-[13px]">/month</span>
              </div>
              <p className="font-mono text-[12px] text-white/35 mb-10 leading-relaxed">Essential network mapping for individuals and small teams.</p>
              <ul className="space-y-3.5 flex-1 mb-10">
                {["5 scans total", "24 hour data retention", "Basic host discovery only", "No CVE correlation"].map(f => (
                  <li key={f} className="flex items-center gap-3 font-mono text-[12px] text-white/45">
                    <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="border border-white/15 text-white/40 font-mono text-[11px] font-semibold py-3.5 text-center tracking-[0.15em] uppercase hover:border-white/30 hover:text-white/70 transition-colors">
                Try for free
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="bg-[#181b22] p-10 flex flex-col relative border border-[#F97316]/25"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#F97316]" />
              <div className="flex items-center justify-between mb-6">
                <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.18em]">Pro Plan</p>
                <span className="font-mono text-[9px] bg-[#F97316]/10 text-[#F97316]/80 border border-[#F97316]/20 px-2 py-1 tracking-widest uppercase">Most popular</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-5xl font-bold tracking-tight text-white">$10</span>
                <span className="font-mono text-white/30 text-[13px]">/month</span>
              </div>
              <p className="font-mono text-[12px] text-white/35 mb-10 leading-relaxed">Unlimited intelligence and API access for professionals.</p>
              <ul className="space-y-3.5 flex-1 mb-10">
                {["Unlimited scans", "Unlimited data retention", "Priority OSINT analysis", "Full API + WebSocket access", "LLM natural language queries", "Cloud API correlation", "OSV + GitHub Advisory DB"].map(f => (
                  <li key={f} className="flex items-center gap-3 font-mono text-[12px] text-white/65">
                    <span className="w-1 h-1 rounded-full bg-[#F97316]/60 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=pro" className="bg-[#F97316] text-[#0c0d10] font-mono text-[11px] font-bold py-3.5 text-center tracking-[0.15em] uppercase hover:bg-[#F97316]/90 transition-colors">
                Upgrade to Pro
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PRIVACY ── */}
      <section id="privacy" className="py-32 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em] mb-4">Privacy</p>
            <h2 className="text-4xl font-bold tracking-tight">Your data,<br /><span className="text-white/25">your control</span></h2>
          </motion.div>

          <div className="space-y-0">
            {[
              { title: "Data Collection", body: "Corvus collects only the data necessary to provide the service: your email address, scan targets you submit, and scan results. We do not sell, share, or monetize your data with third parties." },
              { title: "Scan Data Storage", body: "Scan results are stored in an encrypted embedded database on your self-hosted instance or our managed infrastructure. Free tier data is retained for 7 days; Pro tier is unlimited." },
              { title: "Authentication", body: "Passwords are hashed using bcrypt with a minimum cost factor of 12. Authentication tokens are short-lived JWTs. We do not store plaintext credentials." },
              { title: "Third-Party Services", body: "Corvus optionally integrates with NVD, OSV, GitHub Advisory, and cloud provider APIs. These integrations are opt-in and use only the credentials you provide." },
              { title: "Data Deletion", body: "You may request full deletion of your account and all associated data at any time by contacting support@corvus.sh. Deletion is processed within 72 hours." },
            ].map(({ title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-6 py-7 border-b border-white/[0.05] last:border-b-0"
              >
                <div className="w-6 shrink-0 pt-0.5">
                  <span className="font-mono text-[10px] text-white/20">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <h3 className="font-mono text-[11px] font-semibold text-white/70 uppercase tracking-[0.12em] mb-2">{title}</h3>
                  <p className="font-mono text-[12px] text-white/35 leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-32 border-t border-white/[0.06] bg-[#0e1016] grid-bg relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#F97316]/[0.03] blur-3xl" aria-hidden />

        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 max-w-2xl"
          >
            <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em] mb-4">Contact</p>
            <h2 className="text-5xl font-bold tracking-tight leading-[1.05]">
              Talk to the<br /><span className="text-white/30">team building this.</span>
            </h2>
            <p className="font-mono text-[13px] text-white/40 mt-6 leading-relaxed">
              Bug reports, security disclosures, partnership questions, or curiosity we respond to every message.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-px bg-white/[0.05] border border-white/[0.06]">
            {/* ─── Left: channels ─── */}
            <div className="bg-[#181b22] p-8 lg:p-10 flex flex-col">
              {/* Primary email hero treatment */}
              <motion.a
                href="mailto:support@corvus.sh"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="group block relative p-6 border border-[#F97316]/20 bg-[#F97316]/[0.03] hover:bg-[#F97316]/[0.06] hover:border-[#F97316]/40 transition-all duration-200"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#F97316]" />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#F97316]/10 border border-[#F97316]/30 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[#F97316]" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-[#F97316]/80 uppercase tracking-[0.18em] mb-1.5">Direct line</p>
                      <p className="font-mono text-[14px] text-white/90 tracking-wide">support@corvus.sh</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <Clock className="w-3 h-3 text-white/30" strokeWidth={1.5} />
                        <span className="font-mono text-[10px] text-white/35 tracking-wide">Avg. reply in under 12h</span>
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white/25 group-hover:text-[#F97316] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </motion.a>

              {/* Divider label */}
              <div className="flex items-center gap-3 my-7">
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="font-mono text-[9px] text-white/25 uppercase tracking-[0.2em]">Or join us</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>

              {/* Secondary channels */}
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { icon: GithubIcon, label: "GitHub", value: "Open issues · contribute", href: "#" },
                  { icon: MessageCircle, label: "Discord", value: "Community channel", href: "#" },
                  { icon: XIcon, label: "X / Twitter", value: "@corvus_sh", href: "#" },
                ].map(({ icon: Icon, label, value, href }, i) => (
                  <motion.a
                    key={label}
                    href={href}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className="group flex items-center gap-4 p-3.5 border border-white/[0.05] hover:border-white/[0.15] hover:bg-white/[0.02] transition-all"
                  >
                    <div className="w-8 h-8 border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:border-[#F97316]/30 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-white/45 group-hover:text-[#F97316] transition-colors" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-white/75 tracking-wide">{label}</p>
                      <p className="font-mono text-[10px] text-white/30 mt-0.5 tracking-wide">{value}</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/45 transition-colors" />
                  </motion.a>
                ))}
              </div>

              {/* Security disclosure note fills the column with substance */}
              <div className="mt-auto pt-7">
                <div className="border-l-2 border-white/[0.08] pl-4">
                  <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.18em] mb-1.5">Security disclosure</p>
                  <p className="font-mono text-[11px] text-white/40 leading-relaxed tracking-wide">
                    Found a vulnerability? Email <span className="text-[#F97316]/80">security@corvus.sh</span> with PGP-encrypted details. We acknowledge within 24h.
                  </p>
                </div>
              </div>
            </div>

            {/* ─── Right: form ─── */}
            <div className="bg-[#181b22] p-8 lg:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-8 bg-[#0e1016]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size={20} muted wordmarkClassName="text-white/40 text-[11px]" />
          <p className="font-mono text-[11px] text-white/20">© 2025 Corvus Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["About", "Features", "Pricing", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="font-mono text-[11px] text-white/25 hover:text-white/55 transition-colors tracking-wider uppercase">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const inputCls = "w-full bg-white/[0.03] border border-white/[0.08] text-white/75 font-mono text-[12px] px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-[#F97316]/35 transition-colors";

  if (sent) return (
    <div className="flex flex-col items-center justify-center gap-5 border border-white/[0.08] p-12">
      <div className="w-10 h-10 border border-[#F97316]/35 flex items-center justify-center">
        <Check className="w-5 h-5 text-[#F97316]" />
      </div>
      <p className="font-mono text-[12px] text-white/50 text-center leading-relaxed">Message sent.<br />We&apos;ll respond within 24 hours.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Send a message</p>
        <p className="font-mono text-[11px] text-white/40 tracking-wide leading-relaxed">
          Tell us what you&apos;re trying to do we&apos;ll route it to the right person.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] text-white/30 uppercase tracking-[0.15em]">Name</label>
            <input
              className={inputCls}
              placeholder="Jane Smith"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] text-white/30 uppercase tracking-[0.15em]">Email</label>
            <input
              className={inputCls}
              type="email"
              placeholder="jane@company.io"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] text-white/30 uppercase tracking-[0.15em]">What&apos;s on your mind?</label>
          <textarea
            className={`${inputCls} resize-none h-36`}
            placeholder="I'm evaluating Corvus for a 200-host environment and want to know about..."
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#F97316] text-[#0c0d10] font-mono font-bold text-[11px] py-4 tracking-[0.18em] uppercase hover:bg-[#F97316]/90 transition-colors flex items-center justify-center gap-2.5 mt-1"
        >
          Send message <ArrowUpRight className="w-4 h-4" />
        </button>
        <p className="font-mono text-[10px] text-white/25 text-center tracking-wide pt-1">
          By sending, you agree to our terms. We never share your email.
        </p>
      </form>
    </div>
  );
}
