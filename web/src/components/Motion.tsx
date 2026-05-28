"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════
   APPLE × SEDGE MOTION DESIGN SYSTEM
   ─────────────────────────────────────────────────────────────────────────
   Apple Secret: High speed, heavy damping, absolutely zero rebound.
   Sedge Logic:  Sticky pinning, scroll-driven state, contextual reveals.
   ═══════════════════════════════════════════════════════════════════════ */

// ── Apple Cinematic Spring: zero bounce, critically damped ──
export const APPLE_FLUID = { type: "spring" as const, duration: 0.7, bounce: 0 };
export const APPLE_FAST  = { type: "spring" as const, duration: 0.5, bounce: 0 };
export const APPLE_SLOW  = { type: "spring" as const, duration: 0.9, bounce: 0 };

// ── Legacy springs (kept for backward compat) ──
const SPRING_TRANSITION = { type: "spring" as const, stiffness: 100, damping: 20, mass: 1 };
const SUBTLE_TRANSITION = { type: "spring" as const, stiffness: 80, damping: 25, mass: 1 };

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTON MOTION PRESETS
   ─────────────────────────────────────────────────────────────────────────
   ctaMotion: primary calls-to-action. Springy lift + slight bounce so the
              one action that matters feels alive and distinct.
   btnMotion: everything secondary. Critically-damped micro-scale, zero bounce.
   ═══════════════════════════════════════════════════════════════════════ */

// Lively spring with a touch of bounce — reserved for primary CTAs only.
const CTA_SPRING = { type: "spring" as const, stiffness: 420, damping: 14, mass: 0.6 };

export const ctaMotion = {
  whileHover: { scale: 1.05, y: -3 },
  whileTap: { scale: 0.94 },
  transition: CTA_SPRING,
} as const;

export const btnMotion = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: APPLE_FAST,
} as const;

// motion-wrapped next/link so CTAs and ghost buttons can animate directly.
export const MotionLink = motion.create(Link);

/* ─── Core Wrappers ─── */

interface MotionProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export function FadeIn({ children, delay = 0, className, ...props }: MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ ...APPLE_FLUID, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, delay = 0, className, ...props }: MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ ...APPLE_FLUID, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, className, ...props }: MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ ...APPLE_FLUID, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─── Apple Text Mask: text slides out of an invisible slot ─── */
export function TextMask({ children, delay = 0, className, active = true }: MotionProps & { active?: boolean }) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: active ? 0 : "100%" }}
        transition={{ ...APPLE_FLUID, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ─── Stagger Container ─── */
export function StaggerContainer({ children, className, delayChildren = 0.1, staggerChildren = 0.1, ...props }: HTMLMotionProps<"div"> & { delayChildren?: number; staggerChildren?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        hidden: {},
        visible: {
          transition: { delayChildren, staggerChildren },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: APPLE_FLUID },
};

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT TOUR
   ─────────────────────────────────────────────────────────────────────────
   Stacked, scroll-revealed capability rows. Each row sizes to its own content
   (text + live visual, alternating sides) so there are no full-screen pins and
   no dead whitespace. Reveals are staggered on scroll for a cinematic feel.
   ═══════════════════════════════════════════════════════════════════════ */

interface TourStep {
  tagline: string;
  title: string;
  description: string;
  visual: ReactNode;
}

export function CinematicProductTour({ steps }: { steps: TourStep[] }) {
  return (
    <section className="relative bg-[#0a0c10] border-t border-white/[0.04] overflow-hidden">
      {/* Ambient atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, black, transparent)",
          }}
        />
        <div className="absolute top-1/3 right-0 w-[520px] h-[520px] rounded-full bg-[#F97316]/[0.04] blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 sm:py-28 lg:py-32">
        {/* Section header */}
        <SlideUp className="mb-16 sm:mb-24 max-w-xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]" />
            </span>
            <span className="font-mono text-[10px] text-[#F97316] tracking-[0.2em] uppercase">Product Tour</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold leading-[1.0] tracking-tight">
            How Corvus<br />
            <span className="text-white/25">thinks.</span>
          </h2>
        </SlideUp>

        {/* Capability rows */}
        <div className="space-y-20 sm:space-y-28 lg:space-y-36">
          {steps.map((step, index) => {
            const flipped = index % 2 === 1;
            return (
              <div key={index} className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Text */}
                <SlideUp className={flipped ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-4 mb-5">
                    <span className="font-mono text-[11px] text-[#F97316] tabular-nums shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-12 bg-[#F97316]/30 shrink-0" />
                    <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[#F97316] uppercase">
                      {step.tagline}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white/90 leading-[1.05]">
                    {step.title}
                  </h3>
                  <p className="mt-5 font-mono text-[12px] sm:text-[13px] text-white/40 leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </SlideUp>

                {/* Live visual */}
                <ScaleIn className={flipped ? "lg:order-1" : ""}>
                  <div className="h-[300px] sm:h-[360px] lg:h-[440px] w-full rounded-none bg-[#181b22]/60 border border-white/[0.08] backdrop-blur-sm shadow-2xl overflow-hidden p-4 sm:p-6 flex flex-col">
                    {step.visual}
                  </div>
                </ScaleIn>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
