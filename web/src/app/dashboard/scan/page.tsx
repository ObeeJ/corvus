"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Loader2, Radar, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveScan() {
  const { apiFetch } = useAuth();
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    setIsScanning(true);
    setResults([]);
    setScanError(null);
    try {
      const res = await apiFetch("/api/v1/scan", {
        method: "POST",
        body: JSON.stringify({ target, predict: true }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.id) {
        setScanError(data.error || `Scan failed (${res.status}). Check your target — use an IP (192.168.1.1) or CIDR (192.168.1.0/24).`);
        setIsScanning(false);
        return;
      }

      const token = localStorage.getItem("corvus_token");
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/scan/${data.id}/stream${token ? `?token=${token}` : ""}`);
      wsRef.current = ws;
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "result") setResults(p => [...p, msg.result]);
        else if (msg.type === "complete") { setIsScanning(false); ws.close(); }
      };
      ws.onerror = () => setIsScanning(false);
      ws.onclose = () => setIsScanning(false);
    } catch (err: any) {
      setScanError(err?.message || "Network error reaching the scan API.");
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    wsRef.current?.close();
    setIsScanning(false);
  };

  useEffect(() => () => { wsRef.current?.close(); }, []);

  return (
    <div className="flex flex-col h-full gap-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-white/85 tracking-wide">Live Scan</h1>
          <p className="font-mono text-[11px] text-white/30 mt-1 tracking-wide">Active reconnaissance with real-time streaming</p>
        </div>
        {isScanning && (
          <div className="flex items-center gap-2 border border-[#F97316]/25 bg-[#F97316]/5 px-3.5 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#F97316]" />
            </span>
            <span className="font-mono text-[10px] text-[#F97316]/80 uppercase tracking-[0.15em]">Scanning</span>
          </div>
        )}
      </div>

      {/* Input panel */}
      <div className="bg-[#181b22] border border-white/[0.07] p-5">
        <form onSubmit={startScan} className="flex gap-3">
          <div className="relative flex-1">
            <Radar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
            <Input
              placeholder="Target IP or CIDR: e.g. 192.168.1.0/24"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="pl-10 h-10 font-mono text-[12px] bg-white/[0.03] border-white/[0.07] text-white/75 placeholder:text-white/20 focus-visible:ring-[#F97316]/20 focus-visible:border-[#F97316]/30 tracking-wide"
              disabled={isScanning}
            />
          </div>
          {isScanning ? (
            <Button type="button" onClick={stopScan} className="h-10 px-5 bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/15 font-mono text-[11px] tracking-wide">
              <Square className="h-3.5 w-3.5 mr-2" /> Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!target} className="h-10 px-6 bg-[#F97316] text-[#0c0d10] font-mono font-bold text-[11px] hover:bg-[#F97316]/90 disabled:opacity-30 tracking-widest uppercase">
              <Play className="h-3 w-3 mr-2" /> Scan
            </Button>
          )}
        </form>

        {scanError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-start gap-3 p-3 border border-red-500/25 bg-red-500/[0.06]"
          >
            <div className="w-1 self-stretch bg-red-500/60 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] text-red-300 tracking-wide font-semibold">Scan rejected</p>
              <p className="font-mono text-[10px] text-red-300/70 tracking-wide mt-0.5 leading-relaxed break-words">
                {scanError}
              </p>
              <p className="font-mono text-[10px] text-white/30 tracking-wide mt-2 leading-relaxed">
                Valid targets: <span className="text-white/55">192.168.1.1</span> · <span className="text-white/55">10.0.0.0/24</span> · <span className="text-white/55">example.com</span>
              </p>
            </div>
            <button onClick={() => setScanError(null)} className="font-mono text-[10px] text-red-400/50 hover:text-red-400 uppercase tracking-[0.15em] px-1">
              dismiss
            </button>
          </motion.div>
        )}
      </div>

      {/* Results table */}
      <div className="flex-1 bg-[#181b22] border border-white/[0.07] flex flex-col min-h-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <span className="font-mono text-[10px] text-white/25 uppercase tracking-[0.15em]">Output Stream</span>
          <div className="flex items-center gap-4">
            {isScanning && <Loader2 className="h-3 w-3 animate-spin text-[#F97316]/50" />}
            <span className="font-mono text-[10px] text-white/20 tracking-wide">{results.length} discovered</span>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.05] hover:bg-transparent">
                {["Host", "Port", "Service", "Version", "CVEs"].map(h => (
                  <TableHead key={h} className="font-mono text-[9px] text-white/20 uppercase tracking-[0.15em] h-9">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {results.map((r, i) => (
                  <motion.tr
                    key={`${r.ip}-${r.port}-${i}`}
                    initial={{ opacity: 0, backgroundColor: "rgba(249,115,22,0.06)" }}
                    animate={{ opacity: 1, backgroundColor: "transparent" }}
                    transition={{ duration: 0.5 }}
                    className="border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <TableCell className="font-mono text-[12px] text-[#F97316] py-2.5 tracking-wide">{r.ip}</TableCell>
                    <TableCell className="font-mono text-[12px] text-white/45 py-2.5 tracking-wide">{r.port}/{r.protocol}</TableCell>
                    <TableCell className="text-[12px] text-white/70 font-medium py-2.5 tracking-wide">{r.service_name || "unknown"}</TableCell>
                    <TableCell className="font-mono text-[11px] text-white/30 py-2.5 tracking-wide">{r.version || "—"}</TableCell>
                    <TableCell className="py-2.5">
                      {r.cves?.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 tracking-wide">
                          {r.cves.length} CVE{r.cves.length > 1 ? "s" : ""}
                        </span>
                      ) : <span className="text-white/20 font-mono text-[11px]">—</span>}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {results.length === 0 && !isScanning && (
                <TableRow className="border-transparent hover:bg-transparent">
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Radar className="w-7 h-7 mx-auto mb-3 text-white/10" strokeWidth={1} />
                    <p className="font-mono text-[11px] text-white/20 tracking-wide">awaiting target...</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
