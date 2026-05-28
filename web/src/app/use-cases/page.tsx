"use client";

import { FadeIn, SlideUp, StaggerContainer, ScaleIn, MotionLink, ctaMotion, btnMotion } from "@/components/Motion";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Database, Globe, Building2, Check, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";

const USE_CASES = [
  {
    icon: Globe,
    title: "External Attack Surface Management",
    body: "Automatically discover unknown assets, unmanaged infrastructure, and shadow IT connected to your domain. Corvus builds a probability model from DNS, CT logs, and cloud IP ranges to map your true public footprint.",
    points: ["Detect forgotten subdomains", "Alert on unexpected port exposure", "Monitor TLS certificate expiration"],
  },
  {
    icon: Database,
    title: "Internal Drift Detection",
    body: "Deploy lightweight mesh agents across your internal VPCs. Continuous state tracking memorizes your authorized architecture and triggers instant alerts when unauthorized services spin up or drift occurs.",
    points: ["Agentless continuous scanning", "Identify rogue databases & API servers", "Track temporal configuration changes"],
  },
  {
    icon: Building2,
    title: "M&A Cyber Due Diligence",
    body: "Instantly assess the network security posture of acquisition targets. Generate a comprehensive CVE and exposure report in minutes using Corvus' LLM query interface before closing a deal.",
    points: ["Zero-configuration deployment", "Automated CVE mapping via NVD/OSV", "Exportable intelligence reports"],
  },
  {
    icon: Shield,
    title: "Zero Trust Verification",
    body: "You implemented Zero Trust policies—but are they working? Corvus acts as an independent verifier, scanning your segments continuously to prove that expected lateral movement restrictions are actually enforced.",
    points: ["Prove network segmentation", "Verify firewall rule efficacy", "Detect unauthorized lateral access paths"],
  },
];

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#e8e9ec] selection:bg-[#F97316]/30 w-full max-w-[100vw] overflow-x-hidden">
      {/* Mini Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#111318]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size={26} wordmarkClassName="text-white text-[13px]" />
          </Link>
          <MotionLink {...btnMotion} href="/" className="font-mono text-[11px] text-white/40 hover:text-white transition-colors tracking-widest uppercase flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> Back
          </MotionLink>
        </div>
      </header>

      <main className="pt-24 sm:pt-32 pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <StaggerContainer delayChildren={0.1} staggerChildren={0.1}>
            <FadeIn className="mb-12 sm:mb-20 text-center max-w-3xl mx-auto">
              <p className="font-mono text-[10px] text-[#F97316] uppercase tracking-[0.2em] mb-4">Corvus Intelligence</p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Use Cases
              </h1>
              <p className="font-mono text-[12px] sm:text-[14px] text-white/40 leading-relaxed">
                See how modern security teams deploy continuous intelligence to map attack surfaces, detect drift, and enforce zero trust.
              </p>
            </FadeIn>

            <div className="grid sm:grid-cols-2 gap-px bg-white/[0.04] border border-white/[0.06]">
              {USE_CASES.map(({ icon: Icon, title, body, points }, i) => (
                <ScaleIn
                  key={title}
                  delay={i * 0.1}
                  className="bg-[#181b22] p-6 sm:p-8 lg:p-12 relative overflow-hidden group hover:bg-[#1e2129] transition-colors duration-300"
                >
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-[#F97316]/[0.04] blur-[60px] sm:blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <motion.div
                    whileHover={{ rotate: -6, scale: 1.1 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                    className="w-12 h-12 border border-white/[0.1] flex items-center justify-center mb-6 group-hover:border-[#F97316]/40 group-hover:bg-[#F97316]/10 transition-colors relative z-10"
                  >
                    <Icon className="w-5 h-5 text-white/50 group-hover:text-[#F97316] transition-colors" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white/90 mb-3 tracking-tight relative z-10">{title}</h3>
                  <p className="font-mono text-[12px] sm:text-[13px] text-white/40 leading-relaxed mb-6 sm:mb-8 relative z-10">
                    {body}
                  </p>
                  <ul className="space-y-3 relative z-10">
                    {points.map(item => (
                      <li key={item} className="flex items-center gap-3 font-mono text-[11px] sm:text-[12px] text-white/60">
                        <Check className="w-3.5 h-3.5 text-[#F97316] shrink-0" strokeWidth={2.25} /> {item}
                      </li>
                    ))}
                  </ul>
                </ScaleIn>
              ))}
            </div>
          </StaggerContainer>

          <SlideUp delay={0.4} className="mt-16 sm:mt-24 max-w-4xl mx-auto">
            <div className="bg-[#0e1016] border border-[#F97316]/20 p-6 sm:p-10 lg:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#F97316]/10 via-transparent to-transparent pointer-events-none" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/90 mb-4 sm:mb-6 tracking-tight relative z-10">Ready to see your true perimeter?</h2>
              <p className="font-mono text-[12px] sm:text-[13px] text-white/40 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed relative z-10">
                Join modern security teams using Corvus to transform static point-in-time scanning into continuous, autonomous intelligence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <MotionLink {...ctaMotion} href="/signup" className="w-full sm:w-auto bg-[#F97316] text-[#0c0d10] font-mono text-[12px] font-bold px-8 py-4 tracking-widest uppercase hover:bg-[#F97316]/90 transition-colors flex items-center justify-center gap-2 group">
                  Deploy Corvus
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </MotionLink>
                <MotionLink {...btnMotion} href="/#contact" className="w-full sm:w-auto border border-white/15 text-white/60 font-mono text-[12px] px-8 py-4 hover:border-white/30 hover:text-white transition-colors tracking-widest uppercase flex items-center justify-center">
                  Contact Sales
                </MotionLink>
              </div>
            </div>
          </SlideUp>
        </div>
      </main>
    </div>
  );
}
