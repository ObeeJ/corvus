"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Bell, Mail, MessageSquare, Smartphone, Zap } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto pb-12 px-6 pt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-mono text-[10px] text-white/30 hover:text-white/60 transition-colors tracking-[0.15em] uppercase mb-5"
        >
          <ArrowLeft className="w-3 h-3" /> Back to dashboard
        </Link>
        <h1 className="text-[15px] font-semibold text-white/85 tracking-wide">Settings</h1>
        <p className="font-mono text-[11px] text-white/30 mt-1 tracking-wide">Manage your preferences and notifications</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <div className="bg-[#181b22] border border-white/[0.07] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Bell className="w-4 h-4 text-white/40" />
            <div>
              <p className="text-[13px] font-semibold text-white/80 tracking-wide">Notifications</p>
              <p className="font-mono text-[11px] text-white/30 mt-0.5 tracking-wide">Configure how Corvus alerts you</p>
            </div>
          </div>
          
          <div className="p-5 space-y-4">
            {/* Email Alerts - Active */}
            <div className="flex items-start justify-between group p-3 hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#F97316]/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#F97316]" />
                </div>
                <div>
                  <p className="font-mono text-[12px] text-white/80 tracking-wide">Email Alerts</p>
                  <p className="font-mono text-[10px] text-white/40 tracking-wide mt-0.5">Critical security alerts and billing receipts</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 bg-[#F97316]">
                  <span aria-hidden="true" className="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#0c0d10] shadow ring-0 transition duration-200 ease-in-out" />
                </div>
              </div>
            </div>

            {/* Slack - Coming Soon */}
            <div className="flex items-start justify-between group p-3 border border-transparent opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white/[0.05] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-white/50" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[12px] text-white/80 tracking-wide">Slack Integration</p>
                    <span className="font-mono text-[9px] bg-white/[0.05] text-white/40 border border-white/[0.1] px-1.5 py-0.5 tracking-widest uppercase">Coming Soon</span>
                  </div>
                  <p className="font-mono text-[10px] text-white/40 tracking-wide mt-0.5">Push alerts directly to your team's channels</p>
                </div>
              </div>
            </div>

            {/* WhatsApp - Coming Soon */}
            <div className="flex items-start justify-between group p-3 border border-transparent opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white/[0.05] flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-white/50" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[12px] text-white/80 tracking-wide">WhatsApp Alerts</p>
                    <span className="font-mono text-[9px] bg-white/[0.05] text-white/40 border border-white/[0.1] px-1.5 py-0.5 tracking-widest uppercase">Coming Soon</span>
                  </div>
                  <p className="font-mono text-[10px] text-white/40 tracking-wide mt-0.5">High-priority alerts sent to your phone</p>
                </div>
              </div>
            </div>

            {/* Telegram - Coming Soon */}
            <div className="flex items-start justify-between group p-3 border border-transparent opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white/[0.05] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-white/50" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[12px] text-white/80 tracking-wide">Telegram Bot</p>
                    <span className="font-mono text-[9px] bg-white/[0.05] text-white/40 border border-white/[0.1] px-1.5 py-0.5 tracking-widest uppercase">Coming Soon</span>
                  </div>
                  <p className="font-mono text-[10px] text-white/40 tracking-wide mt-0.5">Instant anomaly notifications via Telegram</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
