"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Server } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Hosts() {
  const { apiFetch } = useAuth();
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/v1/hosts")
      .then(r => r.json())
      .then(d => { setHosts(d.hosts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const riskColor = (s: number) => s > 50 ? "bg-red-500" : s > 20 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex flex-col h-full gap-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-white/85 tracking-wide">Hosts</h1>
          <p className="font-mono text-[11px] text-white/30 mt-1 tracking-wide">All discovered hosts across scans</p>
        </div>
        <span className="font-mono text-[10px] text-white/30 border border-white/[0.08] px-2.5 py-1.5 tracking-widest uppercase">{hosts.length} tracked</span>
      </div>

      <div className="flex-1 bg-[#181b22] border border-white/[0.07] flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.05] hover:bg-transparent">
                {["Host IP", "Ports", "Top Service", "Risk", "Last Seen"].map((h, i) => (
                  <TableHead key={h} className={`font-mono text-[9px] text-white/20 uppercase tracking-[0.15em] h-9 ${i === 4 ? "text-right" : ""}`}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-transparent hover:bg-transparent">
                  <TableCell colSpan={5} className="h-40 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto text-[#F97316]/50" />
                  </TableCell>
                </TableRow>
              ) : hosts.length === 0 ? (
                <TableRow className="border-transparent hover:bg-transparent">
                  <TableCell colSpan={5} className="h-40 text-center">
                    <Server className="w-6 h-6 mx-auto mb-3 text-white/10" strokeWidth={1} />
                    <p className="font-mono text-[11px] text-white/20 tracking-wide">no hosts: run a scan first</p>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {hosts.map((host, i) => (
                    <motion.tr
                      key={host.ip}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <TableCell className="font-mono text-[12px] py-2.5">
                        <Link href={`/dashboard/hosts/${host.ip}`} className="text-[#F97316] hover:text-[#F97316]/70 transition-colors tracking-wide">
                          {host.ip}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center py-2.5">
                        <span className="font-mono text-[11px] text-white/40 bg-white/[0.05] px-2 py-0.5 border border-white/[0.06] tracking-wide">{host.port_count}</span>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/40 py-2.5 tracking-wide">{host.top_service || "—"}</TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-16 h-1 bg-white/[0.06] overflow-hidden">
                            <div className={`h-full ${riskColor(host.risk_score)}`} style={{ width: `${Math.min(host.risk_score, 100)}%` }} />
                          </div>
                          <span className="font-mono text-[10px] text-white/25 tracking-wide">{host.risk_score.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-[10px] text-white/25 py-2.5 tracking-wide">{new Date(host.last_seen).toLocaleString()}</TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
