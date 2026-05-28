"use client";

import { FadeIn, SlideUp } from "@/components/Motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="font-mono text-[11px] sm:text-[12px] text-white/40">Effective Date: October 2025</p>
        </FadeIn>

        <div className="space-y-12">
          <SlideUp delay={0.1}>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white/90">1. Acceptance of Terms</h2>
            <p className="font-mono text-[13px] text-white/60 leading-relaxed">
              By accessing or using Corvus Intelligence ("the Service"), you agree to be bound by these Terms of Service. The Service is provided as-is, designed for authorized network administration, security research, and defensive posture management. 
            </p>
          </SlideUp>

          <SlideUp delay={0.15}>
            <h2 className="text-xl font-semibold mb-4 text-white/90">2. Acceptable Use Policy</h2>
            <p className="font-mono text-[13px] text-white/60 leading-relaxed">
              You may only use Corvus to scan and monitor networks, endpoints, and assets for which you have explicit, documented authorization. Unauthorized scanning, penetration testing without consent, or malicious exploitation using insights derived from the Service is strictly prohibited and will result in immediate account termination.
            </p>
          </SlideUp>

          <SlideUp delay={0.2}>
            <h2 className="text-xl font-semibold mb-4 text-white/90">3. Subscriptions and Billing</h2>
            <p className="font-mono text-[13px] text-white/60 leading-relaxed">
              Corvus Pro operates on a monthly subscription basis. Payments are non-refundable except where required by law. If a payment method fails, access to Pro features will be suspended until the balance is cleared. You may cancel your subscription at any time; access will remain until the end of the current billing cycle.
            </p>
          </SlideUp>

          <SlideUp delay={0.25}>
            <h2 className="text-xl font-semibold mb-4 text-white/90">4. Limitation of Liability</h2>
            <p className="font-mono text-[13px] text-white/60 leading-relaxed">
              To the maximum extent permitted by law, Corvus Intelligence and its operators shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the Service. Network scanning carries inherent risks, and you assume full responsibility for any service degradation on the target networks caused by aggressive probe configurations.
            </p>
          </SlideUp>

          <SlideUp delay={0.3}>
            <h2 className="text-xl font-semibold mb-4 text-white/90">5. Service Modifications</h2>
            <p className="font-mono text-[13px] text-white/60 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time. We will provide reasonable advance notice for any significant deprecation of core features or changes to pricing structures.
            </p>
          </SlideUp>
        </div>
      </div>
    </div>
  );
}
