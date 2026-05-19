"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity, Server, ShieldAlert, MessageSquare,
  Settings, LogOut, LayoutDashboard, CreditCard, Network
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Logo } from "@/components/Logo";

const nav = [
  { href: "/dashboard",         icon: LayoutDashboard, label: "Overview"   },
  { href: "/dashboard/scan",    icon: Activity,        label: "Live Scan"  },
  { href: "/dashboard/hosts",   icon: Server,          label: "Hosts"      },
  { href: "/dashboard/alerts",  icon: ShieldAlert,     label: "Alerts"     },
  { href: "/dashboard/ask",     icon: MessageSquare,   label: "Ask Corvus" },
  { href: "/dashboard/mesh",    icon: Network,         label: "Mesh Nodes" },
  { href: "/billing",           icon: CreditCard,      label: "Billing"    },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout, apiFetch } = useAuth();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    apiFetch("/api/v1/alerts?since=24h")
      .then(r => r.json())
      .then(d => setAlertCount((d.alerts ?? []).length))
      .catch(() => {});
  }, [apiFetch]);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside className="w-[220px] shrink-0 h-full flex flex-col bg-[#0e1016] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="h-[58px] flex items-center px-5 border-b border-white/[0.06] shrink-0">
        <Logo size={20} wordmarkClassName="text-white/90 text-[12px]" />
        <span className="ml-auto font-mono text-[9px] text-[#F97316]/40 border border-[#F97316]/15 px-1.5 py-0.5 tracking-widest">INT</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em] px-3 mb-3">Workspace</p>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all duration-150 relative ${
                active
                  ? "text-white bg-white/[0.06]"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.03]"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#F97316]" />
              )}
              <Icon
                className={`w-[15px] h-[15px] shrink-0 transition-colors ${
                  active ? "text-[#F97316]" : "text-white/20 group-hover:text-white/40"
                }`}
                strokeWidth={active ? 2 : 1.5}
              />
              <span className="tracking-wide">{label}</span>
              {label === "Alerts" && alertCount > 0 && (
                <span className="ml-auto font-mono text-[9px] bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5">{alertCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/[0.05] shrink-0" />

      {/* Footer */}
      <div className="px-2.5 py-3 space-y-0.5 shrink-0">
        <Link
          href="/dashboard/settings"
          className={`group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
            pathname === "/dashboard/settings"
              ? "text-white bg-white/[0.06]"
              : "text-white/35 hover:text-white/70 hover:bg-white/[0.03]"
          }`}
        >
          <Settings className="w-[15px] h-[15px] shrink-0 text-white/20 group-hover:text-white/40" strokeWidth={1.5} />
          <span className="tracking-wide">Settings</span>
        </Link>
        {user && (
          <button
            onClick={logout}
            className="w-full group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-white/25 hover:text-white/55 hover:bg-white/[0.03] transition-all duration-150"
          >
            <LogOut className="w-[15px] h-[15px] shrink-0 text-white/15 group-hover:text-white/35" strokeWidth={1.5} />
            <span className="truncate text-left font-mono text-[11px] tracking-wide">{user.email}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
