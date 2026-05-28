"use client";

import { FadeIn, SlideUp } from "@/components/Motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#111318] text-white w-full max-w-[100vw] overflow-x-hidden pt-16 sm:pt-24 pb-20 sm:pb-32">
      <div className="max-w-3xl mx-auto px-6">
        <FadeIn className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] text-[#F97316] hover:text-[#F97316]/80 transition-colors tracking-[0.15em] uppercase mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="font-mono text-[11px] sm:text-[12px] text-white/40">Last updated: October 2025</p>
        </FadeIn>

        <div className="space-y-12">
          <SlideUp delay={0.1}>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white/90">1. Data Collection & Control</h2>
            <p className="font-mono text-[13px] text-white/60 leading-relaxed">
              Corvus Intelligence is built on the principle of minimal data collection. We collect only what is strictly necessary to operate the platform: your email address for authentication, billing information (processed securely by Paystack or via Web3 wallets), and the network scan configurations you explicitly submit. We do not sell, rent, or share your data with third-party advertisers. 
            </p>
          </SlideUp>

          <SlideUp delay={0.15}>
            <h2 className="text-xl font-semibold mb-4 text-white/90">2. Telemetry and Scan Data</h2>
            <p className="font-mono text-[13px] text-white/60 leading-relaxed">
              If you utilize the managed Corvus Cloud, scan results are stored in an encrypted database isolated per tenant. For self-hosted deployments, no scan data leaves your infrastructure. Optional telemetry (such as crash reporting via Sentry) can be disabled entirely in your instance configuration.
            </p>
          </SlideUp>

          <SlideUp delay={0.2}>
            <h2 className="text-xl font-semibold mb-4 text-white/90">3. Third-Party Integrations</h2>
            <p className="font-mono text-[13px] text-white/60 leading-relaxed">
              Corvus integrates with external APIs such as the National Vulnerability Database (NVD), OSV, and GitHub Advisory Database. When correlation is enabled, only structural metadata (like software names and versions) is queried. No proprietary network topology or sensitive IP structures are transmitted to these third parties.
            </p>
          </SlideUp>

          <SlideUp delay={0.25}>
            <h2 className="text-xl font-semibold mb-4 text-white/90">4. LLM Providers</h2>
            <p className="font-mono text-[13px] text-white/60 leading-relaxed">
              Natural language queries utilizing Groq, OpenAI, or Anthropic are processed by sending truncated, context-specific JSON blobs to the respective APIs. By default, these providers do not use API data to train their foundation models. You may self-host an open-weight model to avoid sending data externally.
            </p>
          </SlideUp>

          <SlideUp delay={0.3}>
            <h2 className="text-xl font-semibold mb-4 text-white/90">5. Data Deletion</h2>
            <p className="font-mono text-[13px] text-white/60 leading-relaxed">
              You have the right to request full deletion of your account and all associated telemetry. Please contact <a href="mailto:privacy@corvus.sh" className="text-[#F97316] hover:underline">privacy@corvus.sh</a>. Data deletion requests are processed within 72 hours, permanently purging records from our active databases and triggering removal from cold storage backups within 30 days.
            </p>
          </SlideUp>
        </div>
      </div>
    </div>
  );
}
