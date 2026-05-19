"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const crumbMap: Record<string, string> = {
  dashboard: "Overview",
  scan: "Live Scan",
  hosts: "Hosts",
  alerts: "Alerts",
  ask: "Ask Corvus",
  settings: "Settings",
  billing: "Billing",
  mesh: "Mesh Nodes",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="h-[58px] shrink-0 border-b border-white/[0.06] bg-[#0e1016]/80 backdrop-blur-sm flex items-center px-6 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-1">
        {segments.map((seg, i) => (
          <div key={seg} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-white/15" />}
            <span className={`font-mono text-[12px] tracking-wide ${
              i === segments.length - 1 ? "text-white/60" : "text-white/20"
            }`}>
              {crumbMap[seg] ?? seg}
            </span>
          </div>
        ))}
      </div>

      {/* Status indicator */}
      <div className="hidden sm:flex items-center gap-2 bg-emerald-500/[0.08] border border-emerald-500/20 px-3 py-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
        </span>
        <span className="font-mono text-[10px] text-emerald-400/80 uppercase tracking-[0.15em]">Online</span>
      </div>

      {/* Alerts bell */}
      <button className="relative p-2 text-white/25 hover:text-white/60 transition-colors">
        <Bell className="w-[15px] h-[15px]" strokeWidth={1.5} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F97316]" />
      </button>

      {/* User chip */}
      {user && (
        <div className="flex items-center gap-2.5 border-l border-white/[0.06] pl-4">
          <div className="w-7 h-7 bg-[#F97316]/10 border border-[#F97316]/25 flex items-center justify-center shrink-0">
            <span className="font-mono text-[11px] font-semibold text-[#F97316]">
              {user.email[0].toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="font-mono text-[11px] text-white/55 leading-none tracking-wide">{user.email.split("@")[0]}</p>
            <p className="font-mono text-[9px] text-white/25 mt-0.5 uppercase tracking-[0.15em]">{user.plan}</p>
          </div>
        </div>
      )}
    </header>
  );
}
