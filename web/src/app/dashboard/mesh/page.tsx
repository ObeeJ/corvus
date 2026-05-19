"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Network, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MeshPage() {
  const { apiFetch } = useAuth();
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/mesh/nodes");
      const d = await res.json();
      setNodes(d.nodes || []);
      setLastRefresh(new Date());
    } catch { setNodes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const isStale = (lastSeen: string) => {
    if (!lastSeen) return true;
    return Date.now() - new Date(lastSeen).getTime() > 2 * 60 * 1000; // 2 min
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-white/85 tracking-wide">Mesh Nodes</h1>
          <p className="font-mono text-[11px] text-white/30 mt-1 tracking-wide">
            Distributed Corvus nodes connected via gossip protocol
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-white/20 tracking-wide">
            refreshed {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            onClick={fetchNodes}
            disabled={loading}
            variant="outline"
            className="h-8 px-3 bg-transparent border-white/[0.08] text-white/35 hover:text-white/60 hover:bg-white/[0.04] font-mono text-[11px] tracking-wide"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* How mesh works */}
      <div className="bg-[#181b22] border border-white/[0.07] p-4 flex items-start gap-3">
        <Network className="w-4 h-4 text-[#F97316]/50 shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="font-mono text-[11px] text-white/40 leading-relaxed tracking-wide">
            Multiple Corvus instances form a peer-to-peer mesh using UDP gossip. Each node shares scan results, coordinates CIDR division, and builds a unified network model without central coordination. Start a node with <code className="text-[#F97316]/60">corvus node --join &lt;peer-addr&gt;</code>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Connected Nodes", value: nodes.filter(n => !isStale(n.last_seen)).length },
          { label: "Total Nodes Seen", value: nodes.length },
          { label: "Stale / Offline",  value: nodes.filter(n => isStale(n.last_seen)).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#181b22] border border-white/[0.07] p-4">
            <p className="text-2xl font-bold font-mono text-white">{loading ? "—" : value}</p>
            <p className="font-mono text-[11px] text-white/30 mt-1 tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Node list */}
      <div className="bg-[#181b22] border border-white/[0.07] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <span className="font-mono text-[10px] text-white/25 uppercase tracking-[0.15em]">Node Registry</span>
          <span className="font-mono text-[10px] text-white/20 tracking-wide">{nodes.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-[#F97316]" />
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/20">
            <Network className="w-10 h-10 mb-3" strokeWidth={1} />
            <p className="font-mono text-[12px] tracking-wide">no mesh nodes connected</p>
            <p className="font-mono text-[11px] text-white/15 mt-1 tracking-wide">
              Start a node: <code className="text-white/30">corvus node</code>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            <div className="grid grid-cols-4 px-5 py-2 font-mono text-[10px] text-white/20 uppercase tracking-[0.12em]">
              <span>Node ID</span>
              <span>Address</span>
              <span>Scans</span>
              <span>Last Seen</span>
            </div>
            <AnimatePresence>
              {nodes.map((node, i) => {
                const stale = isStale(node.last_seen);
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-4 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {stale
                        ? <WifiOff className="w-3.5 h-3.5 text-white/20 shrink-0" strokeWidth={1.5} />
                        : <Wifi className="w-3.5 h-3.5 text-[#F97316]/60 shrink-0" strokeWidth={1.5} />
                      }
                      <span className="font-mono text-[11px] text-white/55 truncate tracking-wide">{node.id}</span>
                    </div>
                    <span className="font-mono text-[11px] text-white/40 tracking-wide">{node.addr}</span>
                    <span className="font-mono text-[11px] text-white/40 tracking-wide">{node.scan_count ?? 0}</span>
                    <span className={`font-mono text-[11px] tracking-wide ${stale ? "text-white/20" : "text-white/45"}`}>
                      {node.last_seen ? new Date(node.last_seen).toLocaleTimeString() : "—"}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
