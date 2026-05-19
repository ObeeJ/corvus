"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, Server, ShieldAlert, Activity, ArrowUpRight, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#181b22] border border-white/[0.1] px-3 py-2 text-[12px] font-mono">
      <p className="text-white/50 mb-1">{label}</p>
      <p className="text-[#F97316]">Alerts: {payload[0]?.value}</p>
    </div>
  );
};

function StatCard({ icon: Icon, label, value, sub, accent, loading }: {
  icon: any; label: string; value: string | number; sub: string; accent?: boolean; loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#181b22] border p-5 flex flex-col gap-3 relative overflow-hidden group transition-colors ${
        accent ? "border-[#F97316]/25 hover:border-[#F97316]/40" : "border-white/[0.07] hover:border-white/[0.12]"
      }`}
    >
      {accent && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F97316]/60 to-transparent" />}
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 border flex items-center justify-center ${accent ? "border-[#F97316]/30 bg-[#F97316]/5" : "border-white/[0.08] bg-white/[0.03]"}`}>
          <Icon className={`w-4 h-4 ${accent ? "text-[#F97316]" : "text-white/40"}`} strokeWidth={1.5} />
        </div>
        <TrendingUp className="w-3.5 h-3.5 text-[#F97316]/30" />
      </div>
      <div>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-white/20 mb-1" />
        ) : (
          <p className="text-2xl font-bold font-mono text-white">{value}</p>
        )}
        <p className="text-[12px] text-white/40 mt-0.5 tracking-wide">{label}</p>
      </div>
      <p className="font-mono text-[11px] text-white/25 tracking-wide">{sub}</p>
    </motion.div>
  );
}

export default function DashboardOverview() {
  const { apiFetch } = useAuth();
  const [hosts, setHosts] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/v1/hosts").then(r => r.json()).catch(() => ({ hosts: [] })),
      apiFetch("/api/v1/alerts?since=168h").then(r => r.json()).catch(() => ({ alerts: [] })),
    ]).then(([hostsData, alertsData]) => {
      setHosts(hostsData.hosts || []);
      setAlerts(alertsData.alerts || []);
      setLoading(false);
    });
  }, [apiFetch]);

  // Derive stats
  const criticalAlerts = alerts.filter((a: any) => a.severity === "CRITICAL").length;
  const highAlerts = alerts.filter((a: any) => a.severity === "HIGH").length;
  const totalCVEs = hosts.reduce((sum: number, h: any) => sum + (h.cve_count || 0), 0);
  const recentAlerts = [...alerts].sort((a: any, b: any) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 5);

  // Build hourly alert chart from real alert timestamps
  const chartData = buildHourlyChart(alerts);

  const severityColor: Record<string, string> = {
    CRITICAL: "text-red-400 bg-red-500/10 border-red-500/20",
    HIGH:     "text-orange-400 bg-orange-500/10 border-orange-500/20",
    MEDIUM:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
    LOW:      "text-white/40 bg-white/[0.05] border-white/[0.08]",
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Activity}    label="Total Alerts"   value={alerts.length}  sub={`${criticalAlerts} critical · ${highAlerts} high`} accent loading={loading} />
        <StatCard icon={Server}      label="Hosts Tracked"  value={hosts.length}   sub="across all scans" loading={loading} />
        <StatCard icon={ShieldAlert} label="Open Alerts"    value={alerts.filter((a:any) => !a.resolved).length} sub="unresolved" loading={loading} />
        <StatCard icon={Shield}      label="Avg Risk Score" value={hosts.length ? (hosts.reduce((s:number,h:any) => s + h.risk_score, 0) / hosts.length).toFixed(1) : "—"} sub="across all hosts" loading={loading} />
      </div>

      {/* Chart + Recent alerts */}
      <div className="grid lg:grid-cols-3 gap-3">
        {/* Alert activity chart */}
        <div className="lg:col-span-2 bg-[#181b22] border border-white/[0.07] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[13px] font-semibold text-white/80 tracking-wide">Alert Activity</p>
              <p className="font-mono text-[11px] text-white/30 mt-0.5 tracking-wide">Last 7 days</p>
            </div>
            <Link href="/dashboard/alerts" className="flex items-center gap-1 font-mono text-[11px] text-[#F97316]/60 hover:text-[#F97316] transition-colors tracking-wide">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="h-[180px] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-white/20" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "var(--font-geist-mono)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "var(--font-geist-mono)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="alerts" stroke="#F97316" strokeWidth={1.5} fill="url(#alertGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent alerts */}
        <div className="bg-[#181b22] border border-white/[0.07] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-white/80 tracking-wide">Recent Alerts</p>
            <Link href="/dashboard/alerts" className="font-mono text-[11px] text-[#F97316]/60 hover:text-[#F97316] transition-colors flex items-center gap-1 tracking-wide">
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-4 h-4 animate-spin text-white/20" />
              </div>
            ) : recentAlerts.length === 0 ? (
              <p className="font-mono text-[11px] text-white/20 text-center pt-8 tracking-wide">No alerts yet</p>
            ) : recentAlerts.map((a: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] text-white/55 truncate">{a.host}:{a.port}</span>
                    <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 border shrink-0 ${severityColor[a.severity] ?? severityColor.LOW}`}>
                      {a.severity}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-white/30 tracking-wide">{a.type}</p>
                  <p className="font-mono text-[10px] text-white/15 mt-0.5 tracking-wide">{timeAgo(a.ts)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Top risky hosts */}
      <div className="bg-[#181b22] border border-white/[0.07] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-semibold text-white/80 tracking-wide">Highest Risk Hosts</p>
          <Link href="/dashboard/hosts" className="font-mono text-[11px] text-[#F97316]/60 hover:text-[#F97316] transition-colors flex items-center gap-1 tracking-wide">
            All hosts <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin text-white/20" />
          </div>
        ) : hosts.length === 0 ? (
          <p className="font-mono text-[11px] text-white/20 text-center py-8 tracking-wide">No hosts yet — run a scan to populate</p>
        ) : (
          <div className="space-y-2">
            {[...hosts].sort((a,b) => b.risk_score - a.risk_score).slice(0, 5).map((host: any, i: number) => (
              <motion.div
                key={host.ip}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors group"
              >
                <Link href={`/dashboard/hosts/${host.ip}`} className="font-mono text-[12px] text-[#F97316]/80 hover:text-[#F97316] transition-colors w-36 shrink-0 tracking-wide">
                  {host.ip}
                </Link>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-1 bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className={`h-full ${host.risk_score > 50 ? "bg-red-500" : host.risk_score > 20 ? "bg-amber-500" : "bg-[#F97316]"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(host.risk_score, 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-white/35 w-10 text-right tracking-wide">{host.risk_score.toFixed(1)}</span>
                </div>
                <span className="font-mono text-[11px] text-white/25 w-16 text-right tracking-wide">{host.port_count} ports</span>
                <span className="font-mono text-[10px] text-white/20 hidden sm:block tracking-wide">{host.top_service || "—"}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Start Scan",  href: "/dashboard/scan",    desc: "Launch active recon"       },
          { label: "View Hosts",  href: "/dashboard/hosts",   desc: "Browse host directory"     },
          { label: "Ask Corvus",  href: "/dashboard/ask",     desc: "Natural language query"    },
          { label: "Alert Feed",  href: "/dashboard/alerts",  desc: "Review anomalies"          },
        ].map(({ label, href, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-[#181b22] border border-white/[0.07] p-4 hover:border-[#F97316]/25 hover:bg-[#F97316]/[0.03] transition-all group"
          >
            <p className="text-[13px] font-semibold text-white/65 group-hover:text-white/90 transition-colors tracking-wide">{label}</p>
            <p className="font-mono text-[11px] text-white/25 mt-1 tracking-wide">{desc}</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-white/15 group-hover:text-[#F97316] mt-2 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// Build a 7-day hourly bucket chart from real alert timestamps
function buildHourlyChart(alerts: any[]) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const buckets: Record<string, number> = {};

  // Last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets[days[d.getDay()]] = 0;
  }

  alerts.forEach((a: any) => {
    if (!a.ts) return;
    const d = new Date(a.ts);
    const key = days[d.getDay()];
    if (key in buckets) buckets[key] = (buckets[key] || 0) + 1;
  });

  return Object.entries(buckets).map(([label, alerts]) => ({ label, alerts }));
}

function timeAgo(ts: string) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
