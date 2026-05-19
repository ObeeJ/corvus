"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Server, ShieldAlert, MessageSquare, Settings, Hexagon, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { href: "/", icon: Activity, label: "Live Scan" },
  { href: "/hosts", icon: Server, label: "Hosts" },
  { href: "/alerts", icon: ShieldAlert, label: "Alerts" },
  { href: "/ask", icon: MessageSquare, label: "Ask Corvus" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full bg-[#0d0d0d] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="h-[56px] flex items-center px-5 border-b border-white/[0.06]">
        <Hexagon className="w-[18px] h-[18px] mr-2.5 text-violet-500" strokeWidth={1.5} />
        <span className="text-[13px] font-semibold tracking-[0.08em] uppercase text-white/90">Corvus</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 flex flex-col gap-0.5 mt-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-100 ${
                active
                  ? "bg-violet-500/10 text-violet-400"
                  : "text-white/40 hover:text-white/75 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className={`w-[15px] h-[15px] shrink-0 ${active ? "text-violet-400" : "text-white/30"}`} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/[0.06]">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-100 ${
            pathname === "/settings"
              ? "bg-violet-500/10 text-violet-400"
              : "text-white/40 hover:text-white/75 hover:bg-white/[0.04]"
          }`}
        >
          <Settings className={`w-[15px] h-[15px] shrink-0 ${pathname === "/settings" ? "text-violet-400" : "text-white/30"}`} strokeWidth={1.75} />
          Settings
        </Link>
        {user && (
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-100"
          >
            <LogOut className="w-[15px] h-[15px] shrink-0 text-white/25" strokeWidth={1.75} />
            <span className="truncate">{user.email}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
