"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Activity, Eye, Zap, Network, Brain,
  Check, Mail, Terminal, Radar, Lock, BarChart3,
  Menu, X, ArrowUpRight, MoveRight,
  MessageCircle, Clock, Loader2, ChevronUp
} from "lucide-react";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const IgIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import { Logo } from "@/components/Logo";
import { FadeIn, SlideUp, StaggerContainer, ScaleIn, CinematicProductTour, APPLE_FLUID, APPLE_FAST, MotionLink, ctaMotion, btnMotion } from "@/components/Motion";
import { useScroll, useMotionValueEvent } from "framer-motion";

/* ── Scroll Progress Bar (Sedge-inspired) ── */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 h-[3px] bg-[#F97316] origin-left z-[100]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

/* ── Infinite Scroll Ticker (Sedge pattern) ── */
function ScrollTicker() {
  const items = Array.from({ length: 14 });
  return (
    <div className="relative w-full py-6 overflow-hidden border-t border-b border-white/[0.04] bg-[#0a0c10]">
      <div className="flex items-center gap-8 animate-ticker whitespace-nowrap">
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 opacity-40">
              <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z" fill="#F97316"/>
            </svg>
            <span className="font-mono text-[12px] text-white/25 tracking-widest uppercase">
              CONTINUOUS INTELLIGENCE // REAL-TIME MAPPING // ANOMALY DETECTION //
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  );
}

/* ── "What if" Parallax Section (Sedge-inspired, adapted for cybersecurity) ── */
function WhatIfSection() {
  const statements = [
    "your network mapped itself while you slept?",
    "every port change triggered an instant alert?",
    "vulnerabilities were found before attackers could exploit them?",
    "you could query your entire infrastructure in plain English?",
    "security felt invisible, yet bulletproof?",
  ];

  return (
    <section className="relative w-full py-20 sm:py-32 overflow-hidden bg-[#0a0c10] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-[300px_1fr] gap-10 lg:gap-16">
          {/* Left sticky header */}
          <div className="lg:sticky lg:top-32 lg:self-start space-y-4">
            <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em]">The Vision</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F97316]/90 leading-[1.0]">
              What if —
            </h2>
            <p className="font-mono text-[12px] text-white/25 leading-relaxed mt-4">
              We asked ourselves these questions.<br />
              Then we built the answers.
            </p>
          </div>

          {/* Right scrolling statements */}
          <div className="space-y-6">
            {statements.map((statement, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.15, x: 40 + i * 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{ ...APPLE_FLUID, delay: i * 0.04 }}
                className="py-5 sm:py-6 border-b border-white/[0.04] last:border-b-0"
              >
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-white/80 leading-[1.15]">
                  {statement}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom transition text */}
      <div className="max-w-7xl mx-auto px-6 mt-16 sm:mt-24 flex items-center justify-between">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="px-6 font-mono text-[10px] text-white/20 uppercase tracking-[0.25em]">
          That&apos;s why we built Corvus
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>
    </section>
  );
}

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
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={set}
            initial={{ opacity: 0, y: 7, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -7, filter: "blur(5px)" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-2 sm:gap-2.5 font-mono text-[10px] sm:text-[11px] tracking-[0.15em] uppercase w-full"
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
          </motion.div>
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

  const links = [
    { label: "About", href: "/#about" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Use Cases", href: "/use-cases" },
    { label: "Contact", href: "/#contact" }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#111318]/95 backdrop-blur border-b border-white/[0.06]" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo size={26} wordmarkClassName="text-white text-[13px]" />

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {links.map(l => (
            <Link key={l.label} href={l.href} className="font-mono text-[11px] xl:text-[12px] text-white/40 hover:text-white/80 transition-colors tracking-wider uppercase">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 xl:gap-3">
          <MotionLink {...btnMotion} href="/login" className="font-mono text-[12px] text-white/40 hover:text-white/80 transition-colors px-4 py-2 tracking-wider uppercase">
            Sign in
          </MotionLink>
          <MotionLink {...ctaMotion} href="/signup" className="font-mono text-[12px] font-semibold bg-[#F97316] text-[#0c0d10] px-5 py-2.5 hover:bg-[#F97316]/90 transition-colors tracking-widest uppercase flex items-center gap-2">
            Start Free <MoveRight className="w-3.5 h-3.5" />
          </MotionLink>
        </div>

        <button className="md:hidden text-white/50" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#111318] border-b border-white/[0.06] px-6 py-5 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="font-mono text-[13px] text-white/50 hover:text-white uppercase tracking-wider">
              {l.label}
            </Link>
          ))}
          <MotionLink {...ctaMotion} href="/signup" className="font-mono text-[12px] font-semibold bg-[#F97316] text-[#0c0d10] px-5 py-3 text-center tracking-widest uppercase">
            Start Free
          </MotionLink>
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
    <section id="about" className="border-y border-white/[0.06] bg-[#0e1016] relative overflow-hidden w-full">
      {/* ambient warm wash */}
      <div className="pointer-events-none absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-[#F97316]/[0.04] blur-3xl" aria-hidden />

      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-28 relative w-full">
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight">
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
        <div className="border border-white/[0.07] bg-[#0e1016] w-full">
          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[1.2fr_1fr_1.4fr] lg:grid-cols-[1.5fr_1fr_1.6fr] border-b border-white/[0.06]">
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
              className={`flex flex-col md:grid md:grid-cols-[1.2fr_1fr_1.4fr] lg:grid-cols-[1.5fr_1fr_1.6fr] ${
                i < NMAP_GAPS.length - 1 ? "border-b border-white/[0.05]" : ""
              } group hover:bg-white/[0.015] transition-colors`}
            >
              {/* Capability */}
              <div className="px-5 py-4 md:py-5 border-b md:border-b-0 border-white/[0.05]">
                <p className="text-[14px] font-semibold text-white/85 tracking-wide">{row.capability}</p>
              </div>
              {/* nmap (muted, with X) */}
              <div className="px-5 py-3 md:py-5 border-b md:border-b-0 md:border-l border-white/[0.05] flex items-start gap-2.5">
                <X className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" strokeWidth={2} />
                <span className="font-mono text-[12px] text-white/30 leading-relaxed tracking-wide">
                  <span className="md:hidden text-white/20 uppercase text-[10px] mr-2">nmap:</span>
                  {row.nmap}
                </span>
              </div>
              {/* Corvus (active, with check) */}
              <div className="px-5 py-4 md:py-5 md:border-l border-white/[0.05] bg-[#F97316]/[0.02] flex items-start gap-2.5 group-hover:bg-[#F97316]/[0.04] transition-colors">
                <Check className="w-3.5 h-3.5 text-[#F97316] mt-0.5 shrink-0" strokeWidth={2.25} />
                <span className="font-mono text-[12px] text-white/75 leading-relaxed tracking-wide">
                  <span className="md:hidden text-[#F97316]/60 uppercase text-[10px] mr-2">Corvus:</span>
                  {row.corvus}
                </span>
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
            Corvus runs its own native scan engine TCP connect, half-open SYN, and UDP probes built in Go. No external scanner; just the intelligence layer nmap never had: state, history, context, alerting.
          </p>
          <MotionLink
            {...btnMotion}
            href="#features"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-[#F97316]/80 hover:text-[#F97316] transition-colors tracking-[0.15em] uppercase border-b border-[#F97316]/30 hover:border-[#F97316] pb-0.5"
          >
            See full capabilities <ArrowUpRight className="w-3 h-3" />
          </MotionLink>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc, index }: { icon: any; title: string; desc: string; index: number }) {
  return (
    <SlideUp delay={index * 0.08}>
      <motion.div
        initial="rest"
        animate="rest"
        whileHover="hover"
        variants={{ rest: { scale: 1, y: 0 }, hover: { scale: 1.02, y: -4 } }}
        transition={APPLE_FAST}
        className="group p-6 h-full border border-white/[0.06] bg-[#181b22] hover:border-[#F97316]/40 hover:bg-[#1e2129] transition-colors duration-300 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/0 via-transparent to-[#F97316]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <motion.div
          variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -6, scale: 1.1 } }}
          transition={APPLE_FAST}
          className="w-9 h-9 border border-white/[0.1] flex items-center justify-center mb-5 group-hover:border-[#F97316]/40 group-hover:bg-[#F97316]/10 transition-colors relative z-10"
        >
          <Icon className="w-4 h-4 text-white/40 group-hover:text-[#F97316] transition-colors" strokeWidth={1.5} />
        </motion.div>
        <h3 className="text-[14px] font-semibold text-white/85 mb-2 tracking-wide relative z-10">{title}</h3>
        <p className="font-mono text-[12px] text-white/35 leading-relaxed relative z-10">{desc}</p>
      </motion.div>
    </SlideUp>
  );
}

/* ── Dynamic Mockup: Live State Timeline ── */
function LiveStateTimelineMockup() {
  const [pulse, setPulse] = useState(0);
  const [anomalies, setAnomalies] = useState(4);
  const [states, setStates] = useState<number[][]>([
    [0, 0, 0, 1, 1, 1], // Port 22
    [0, 0, 0, 0, 1, 1], // Port 80
    [0, 0, 0, 0, 0, 1], // Port 443
    [0, 0, 0, 0, 0, 0], // Port 8080
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(p => p + 1);
      setStates(prev => prev.map((row, rIdx) => 
        row.map((val, cIdx) => {
          if (cIdx === 5) {
            return Math.random() > 0.8 ? (val === 1 ? 0 : 1) : val;
          }
          return val;
        })
      ));
      if (Math.random() > 0.93) {
        setAnomalies(a => a + (Math.random() > 0.5 ? 1 : -1));
      }
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center gap-2 mb-2 sm:mb-4 justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
          </span>
          <span className="font-mono text-[9px] sm:text-[10px] text-white/40 tracking-widest uppercase">Live State Timeline</span>
        </div>
        <span className="font-mono text-[9px] text-[#F97316]/60 uppercase tracking-[0.15em] animate-pulse">scanning...</span>
      </div>
      <div className="flex-1 grid grid-cols-4 gap-2 sm:gap-3 my-auto">
        {["22/SSH", "80/HTTP", "443/TLS", "8080/API"].map((port, i) => (
          <div key={port} className="border border-white/[0.08] bg-white/[0.02] rounded-lg p-2 sm:p-3 flex flex-col gap-1.5 sm:gap-2">
            <span className="font-mono text-[9px] sm:text-[10px] text-[#F97316]/80">{port}</span>
            <div className="flex-1 flex flex-col justify-end gap-1">
              {Array.from({ length: 6 }).map((_, j) => {
                const isActive = states[i][j] === 1;
                return (
                  <motion.div
                    key={j}
                    animate={{ 
                      backgroundColor: isActive ? '#F97316' : 'rgba(255,255,255,0.08)',
                      opacity: isActive ? (0.6 + j * 0.08) : (0.2 + j * 0.05)
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-1 sm:h-1.5 rounded-full"
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-2 sm:pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <span className="font-mono text-[9px] sm:text-[10px] text-white/25">Last 30 days</span>
        <span className="font-mono text-[9px] sm:text-[10px] text-[#F97316]/60 transition-all">{Math.max(1, anomalies)} anomalies detected</span>
      </div>
    </div>
  );
}

/* ── Dynamic Mockup: Ask Corvus ── */
function AskCorvusMockup() {
  const fullText = "Show me all hosts that changed TLS certs in the last 48 hours";
  const [typedText, setTypedText] = useState("");
  const [step, setStep] = useState(0); 

  useEffect(() => {
    let index = 0;
    let typeTimer: any;
    let flowTimer: any;

    const runSimulation = () => {
      setStep(0);
      setTypedText("");
      index = 0;
      
      typeTimer = setInterval(() => {
        if (index <= fullText.length) {
          setTypedText(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(typeTimer);
          setStep(1); 
          
          flowTimer = setTimeout(() => {
            setStep(2); 
            flowTimer = setTimeout(runSimulation, 6000);
          }, 1500);
        }
      }, 60);
    };

    runSimulation();

    return () => {
      clearInterval(typeTimer);
      clearTimeout(flowTimer);
    };
  }, []);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center gap-2 mb-2 sm:mb-4">
        <Brain className="w-3.5 h-3.5 text-[#F97316]/60" />
        <span className="font-mono text-[9px] sm:text-[10px] text-white/40 tracking-widest uppercase">Ask Corvus</span>
      </div>
      <div className="flex-1 space-y-2 sm:space-y-3 flex flex-col justify-center">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-2.5 sm:p-4 min-h-[44px] sm:min-h-[56px] flex items-center">
          <p className="font-mono text-[11px] sm:text-[12px] text-white/70">
            &quot;{typedText}&quot;
            {step === 0 && <span className="animate-pulse inline-block w-1.5 h-3.5 bg-[#F97316] ml-0.5" />}
          </p>
        </div>
        
        <div className="relative min-h-[100px] sm:min-h-[140px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-white/30 font-mono text-[10px] sm:text-[11px] py-1 sm:py-2"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F97316]" />
                Thinking...
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-[#F97316]/[0.05] border border-[#F97316]/20 rounded-lg p-2.5 sm:p-4 space-y-1.5 sm:space-y-2"
              >
                <p className="font-mono text-[9px] sm:text-[10px] text-[#F97316]/80 uppercase tracking-wider">Corvus Response</p>
                <p className="font-mono text-[11px] sm:text-[12px] text-white/60 leading-relaxed">Found 3 hosts with TLS certificate rotation:</p>
                <div className="space-y-1 sm:space-y-1.5">
                  {[
                    "192.168.1.42 — cert renewed 6h ago",
                    "10.0.0.15 — issuer changed (Let's Encrypt → DigiCert)",
                    "172.16.0.8 — expired cert detected"
                  ].map((r, i) => (
                    <motion.p 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      key={r} 
                      className="font-mono text-[10px] sm:text-[11px] text-white/40 pl-2.5 sm:pl-3 border-l border-[#F97316]/30 truncate"
                    >
                      {r}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Dynamic Mockup: Mesh Topology ── */
function MeshTopologyMockup() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(prev => (prev + 1) % 6), 1500);
    return () => clearInterval(t);
  }, []);
  const nodes = [
    { id: "us-east-1a", ip: "10.0.1.12" },
    { id: "us-east-1b", ip: "10.0.2.45" },
    { id: "eu-west-1a", ip: "10.1.1.8" },
    { id: "ap-south-1a", ip: "10.2.1.99" },
    { id: "sa-east-1a", ip: "10.3.1.21" },
    { id: "us-west-2a", ip: "10.0.5.11" },
  ];
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-[#F97316]/60" />
          <span className="font-mono text-[9px] sm:text-[10px] text-white/40 tracking-widest uppercase">Mesh Topology</span>
        </div>
        <span className="font-mono text-[8px] sm:text-[9px] text-[#F97316]/80 uppercase border border-[#F97316]/20 bg-[#F97316]/5 px-1.5 py-0.5">Gossip Active</span>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-1.5 sm:gap-2 my-auto">
        {nodes.map((n, i) => (
          <div key={n.id} className={`border p-2 flex flex-col justify-center transition-colors duration-500 ${active === i ? "border-[#F97316]/40 bg-[#F97316]/10" : "border-white/[0.06] bg-white/[0.02]"}`}>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="font-mono text-[9px] sm:text-[10px] text-white/80">{n.id}</span>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${active === i ? "bg-[#F97316] animate-pulse" : "bg-green-500/60"}`} />
            </div>
            <span className="font-mono text-[8px] sm:text-[9px] text-white/30">{n.ip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Dynamic Mockup: CVE Dashboard ── */
function CVEDashboardMockup() {
  const [scanPulse, setScanPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScanPulse(p => p + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const cves = [
    { id: "CVE-2024-3094", sev: "CRITICAL", color: "#ef4444", host: "10.0.0.15", service: "xz-utils 5.6.0" },
    { id: "CVE-2024-21762", sev: "HIGH", color: "#f97316", host: "192.168.1.1", service: "FortiOS 7.2.3" },
    { id: "CVE-2023-44487", sev: "HIGH", color: "#f97316", host: "172.16.0.8", service: "nginx 1.24.0" },
  ];

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#F97316]/60" />
          <span className="font-mono text-[9px] sm:text-[10px] text-white/40 tracking-widest uppercase">CVE Correlator</span>
        </div>
        <span className="font-mono text-[8px] sm:text-[9px] text-red-500/80 animate-pulse uppercase border border-red-500/20 bg-red-500/5 px-1.5 py-0.5">3 Exposures</span>
      </div>
      
      <div className="space-y-1.5 sm:space-y-2 flex-1 flex flex-col justify-center my-auto">
        {cves.map((cve, idx) => (
          <motion.div 
            key={cve.id} 
            animate={{ 
              borderColor: scanPulse % 3 === idx ? `${cve.color}40` : "rgba(255,255,255,0.06)",
              backgroundColor: scanPulse % 3 === idx ? `${cve.color}10` : "rgba(255,255,255,0.02)"
            }}
            transition={{ duration: 0.5 }}
            className="flex flex-col border border-white/[0.06] p-2 sm:p-3 transition-all"
          >
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="font-mono text-[10px] sm:text-[11px] text-white/90">{cve.id}</span>
              <span className="font-mono text-[8px] sm:text-[9px] px-1.5 py-0.5" style={{ backgroundColor: `${cve.color}20`, color: cve.color }}>{cve.sev}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] sm:text-[10px] text-white/40 truncate mr-2">{cve.service}</span>
              <span className="font-mono text-[8px] sm:text-[9px] text-white/30 shrink-0">{cve.host}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#e8e9ec] selection:bg-[#F97316]/30 font-sans w-full max-w-[100vw] overflow-x-hidden">
      <ScrollProgressBar />
      <NavBar />

      {/* ── HERO ── */}
      <section className="w-full min-w-0 relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Dynamic Cinematic Background */}
        <div className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#F97316]/10 via-[#111318] to-[#111318]" />
          <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#F97316]/5 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full py-16 sm:py-24 relative z-10">
          <StaggerContainer
            delayChildren={0.2}
            staggerChildren={0.1}
            className="max-w-4xl"
          >
            <FadeIn>
              <HeroMeta />
            </FadeIn>

            <SlideUp>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-[-0.02em] mb-8">
                Networks<br />
                <span className="text-white/20">change.</span><br />
                <span className="text-[#F97316]">Corvus</span><br />
                remembers.
              </h1>
            </SlideUp>

            <SlideUp delay={0.1}>
              <p className="font-mono text-[14px] text-white/40 leading-relaxed max-w-lg mb-12">
                A living network intelligence engine that tracks how infrastructure changes over time, fuses passive OSINT before scanning, and surfaces anomalies the moment they appear.
              </p>
            </SlideUp>

            <SlideUp delay={0.2}>
              <div className="flex items-center gap-4 flex-wrap">
                <MotionLink
                  {...ctaMotion}
                  href="/signup"
                  className="inline-flex items-center gap-2.5 bg-[#F97316] text-[#0c0d10] font-bold font-mono text-[12px] px-7 py-3.5 tracking-widest uppercase hover:bg-[#F97316]/90 transition-colors"
                >
                  Start for free <MoveRight className="w-4 h-4" />
                </MotionLink>
                <MotionLink
                  {...btnMotion}
                  href="#features"
                  className="inline-flex items-center gap-2 border border-white/15 text-white/50 font-mono text-[12px] px-7 py-3.5 hover:border-white/30 hover:text-white/80 transition-colors tracking-widest uppercase"
                >
                  See how it works
                </MotionLink>
              </div>
            </SlideUp>

            <FadeIn delay={0.4}>
              <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-white/[0.06] flex items-center gap-6 sm:gap-10 flex-wrap">
                {["SOC 2 Compliant", "No agents required", "Self-hostable"].map(b => (
                  <div key={b} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#F97316]/60" strokeWidth={2} />
                    <span className="font-mono text-[11px] text-white/30 tracking-wide">{b}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </StaggerContainer>
        </div>
      </section>

      <ScrollTicker />

      {/* ── ABOUT / vs nmap positioning ── */}
      <VsNmap />

      <WhatIfSection />

      {/* ── CINEMATIC PRODUCT TOUR (Apple × Sedge) ── */}
      <CinematicProductTour
        steps={[
          {
            tagline: "Temporal Intelligence",
            title: "Every change. Every second. Remembered.",
            description: "Corvus stores the full history of every host, port, and service in a time-series graph. Query what changed, when it changed, and why it matters.",
            visual: <LiveStateTimelineMockup />,
          },
          {
            tagline: "Natural Language Queries",
            title: "Ask questions. Get intelligence.",
            description: "Type plain English. Corvus translates your questions into query plans, cross-references scan history, and returns structured intelligence—powered by Groq.",
            visual: <AskCorvusMockup />,
          },
          {
            tagline: "Distributed Mesh Network",
            title: "Nodes that think together.",
            description: "Deploy Corvus agents across multiple networks. They coordinate via gossip protocol, sharing scan results and anomaly data without a central coordinator.",
            visual: <MeshTopologyMockup />,
          },
          {
            tagline: "Vulnerability Correlation",
            title: "CVEs mapped. Risks prioritized.",
            description: "Every detected service version is cross-referenced against NVD, OSV, and GitHub Advisory Database. Know your exposure before attackers do.",
            visual: <CVEDashboardMockup />,
          },
        ]}
      />

      {/* ── FEATURES ── */}
      <section id="features" className="pt-16 pb-20 sm:pb-32 max-w-7xl mx-auto px-6 w-full">
        <SlideUp className="mb-12 sm:mb-20">
          <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em] mb-4">Capabilities</p>
          <h2 className="text-4xl sm:text-5xl font-bold leading-[1.0] tracking-tight max-w-xl">
            Intelligence that<br />
            <span className="text-white/25">never sleeps</span>
          </h2>
        </SlideUp>

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
      <section id="pricing" className="py-20 sm:py-32 border-t border-white/[0.06] bg-[#0c0d10] relative overflow-hidden w-full">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#F97316]/[0.02] blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SlideUp className="mb-12 sm:mb-20 text-center">
            <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em] mb-4">Investment</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Stop flying blind.<br />
              <span className="text-white/40">Start seeing everything.</span>
            </h2>
          </SlideUp>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-8">
            {/* Free */}
            <ScaleIn
              className="bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] rounded-none p-10 flex flex-col transition-colors duration-500"
            >
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.18em] mb-6">Discovery Phase</p>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-5xl font-bold tracking-tight text-white">$0</span>
                <span className="font-mono text-white/30 text-[13px]">/ forever</span>
              </div>
              <p className="font-mono text-[12px] text-white/50 mb-10 leading-relaxed">
                Test the engine. Map a small segment of your infrastructure and see the difference immediately.
              </p>
              <ul className="space-y-4 flex-1 mb-10">
                <li className="flex items-start gap-3 font-mono text-[12px] text-white/60">
                  <Check className="w-4 h-4 text-white/20 shrink-0 mt-0.5" /> 5 scheduled scans total
                </li>
                <li className="flex items-start gap-3 font-mono text-[12px] text-white/60">
                  <Check className="w-4 h-4 text-white/20 shrink-0 mt-0.5" /> 24-hour temporal data retention
                </li>
                <li className="flex items-start gap-3 font-mono text-[12px] text-white/60">
                  <Check className="w-4 h-4 text-white/20 shrink-0 mt-0.5" /> Basic host & port discovery
                </li>
              </ul>
              <MotionLink {...btnMotion} href="/signup" className="border border-white/10 bg-white/[0.02] text-white/60 font-mono text-[11px] font-semibold py-4 rounded-lg text-center tracking-[0.15em] uppercase hover:bg-white/[0.05] hover:text-white transition-colors">
                Start Exploring
              </MotionLink>
            </ScaleIn>

            {/* Pro */}
            <ScaleIn
              delay={0.1}
              className="bg-[#181b22] border border-[#F97316]/30 rounded-none p-10 flex flex-col relative shadow-[0_0_40px_-10px_rgba(249,115,22,0.15)] hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.25)] transition-shadow duration-500"
            >
              <div className="absolute -top-3 left-10">
                <span className="font-mono text-[9px] bg-[#F97316] text-[#0c0d10] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                  Maximum ROI
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.18em] mb-6 mt-2">Corvus Professional</p>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-5xl font-bold tracking-tight text-white">$10</span>
                <span className="font-mono text-white/30 text-[13px]">/ month</span>
              </div>
              <p className="font-mono text-[12px] text-white/70 mb-10 leading-relaxed">
                Full autonomous capabilities. Outsmart threats with continuous intelligence and infinite history.
              </p>
              <ul className="space-y-4 flex-1 mb-10">
                {[
                  "Unlimited scheduled mesh scans",
                  "Infinite temporal data retention",
                  "Priority OSINT prediction models",
                  "LLM natural language querying",
                  "Automated CVE vulnerability correlation",
                  "Full REST API & WebSocket access"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 font-mono text-[12px] text-white/90">
                    <Check className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" strokeWidth={3} />
                    {feature}
                  </li>
                ))}
              </ul>
              <MotionLink {...ctaMotion} href="/signup?plan=pro" className="bg-[#F97316] text-[#0c0d10] font-mono text-[11px] font-bold py-4 rounded-lg text-center tracking-[0.15em] uppercase hover:bg-[#F97316]/90 transition-colors flex items-center justify-center gap-2 group">
                Deploy Corvus Pro
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </MotionLink>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ── PRIVACY ── */}
      <section id="privacy" className="py-20 sm:py-32 border-t border-white/[0.06] w-full">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <SlideUp className="mb-12 sm:mb-16">
            <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em] mb-4">Privacy</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Your data,<br /><span className="text-white/25">your control</span></h2>
          </SlideUp>

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
      <section id="contact" className="py-16 sm:py-24 border-t border-white/[0.06] bg-[#0e1016] grid-bg relative overflow-hidden w-full">
        <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#F97316]/[0.03] blur-3xl" aria-hidden />

        <div className="max-w-6xl mx-auto px-6 relative w-full">
          <SlideUp className="mb-12 sm:mb-16 max-w-2xl">
            <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em] mb-4">Contact</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
              Talk to the<br /><span className="text-white/30">team building this.</span>
            </h2>
            <p className="font-mono text-[13px] text-white/40 mt-6 leading-relaxed">
              Bug reports, security disclosures, partnership questions, or curiosity we respond to every message.
            </p>
          </SlideUp>

          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-px bg-white/[0.05] border border-white/[0.06]">
            {/* ─── Left: channels ─── */}
            <div className="bg-[#181b22] p-6 sm:p-8 lg:p-10 flex flex-col">
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
                  { icon: LinkedinIcon, label: "LinkedIn", value: "Corvus Intelligence", href: "https://linkedin.com/company/corvus-intelligence" },
                  { icon: XIcon, label: "X / Twitter", value: "@corvus_sh", href: "https://x.com/corvus_sh" },
                  { icon: IgIcon, label: "Instagram", value: "@corvus.hq", href: "https://instagram.com/corvus.hq" },
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
            <div className="bg-[#181b22] p-6 sm:p-8 lg:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-8 bg-[#0e1016] w-full">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          <Logo size={20} muted wordmarkClassName="text-white/40 text-[11px]" />
          <p className="font-mono text-[11px] text-white/20">© 2025 Corvus Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["About", "Features", "Pricing", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="font-mono text-[11px] text-white/25 hover:text-white/55 transition-colors tracking-wider uppercase">{l}</a>
            ))}
            <Link href="/privacy" className="font-mono text-[11px] text-white/25 hover:text-white/55 transition-colors tracking-wider uppercase">Privacy</Link>
            <Link href="/terms" className="font-mono text-[11px] text-white/25 hover:text-white/55 transition-colors tracking-wider uppercase">Terms</Link>
          </div>
        </div>
      </footer>
      <ScrollToTop />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
        <motion.button
          {...ctaMotion}
          type="submit"
          className="w-full bg-[#F97316] text-[#0c0d10] font-mono font-bold text-[11px] py-4 tracking-[0.18em] uppercase hover:bg-[#F97316]/90 transition-colors flex items-center justify-center gap-2.5 mt-1"
        >
          Send message <ArrowUpRight className="w-4 h-4" />
        </motion.button>
        <p className="font-mono text-[10px] text-white/25 text-center tracking-wide pt-1">
          By sending, you agree to our terms. We never share your email.
        </p>
      </form>
    </div>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[100] w-10 h-10 border border-white/10 bg-[#181b22]/80 backdrop-blur-sm flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all shadow-xl"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
