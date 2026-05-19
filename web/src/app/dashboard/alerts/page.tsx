"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, ShieldAlert, Activity, GitBranch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const severityStyle: Record<string, string> = {
  CRITICAL: "text-red-400 border-red-500/25",
  HIGH: "text-orange-400 border-orange-500/25",
  MEDIUM: "text-amber-400 border-amber-500/25",
  LOW: "text-white/35 border-white/[0.08]",
};

const typeIcon: Record<string, React.ReactNode> = {
  "new-port": <Activity className="w-3 h-3 text-[#F97316]" />,
  "port-closed": <Activity className="w-3 h-3 text-white/30" />,
  "banner-drift": <GitBranch className="w-3 h-3 text-amber-400" />,
};

export default function Alerts() {
  const { apiFetch } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState<string>("all");
  const [since, setSince] = useState<string>("168h");

  useEffect(() => {
    setLoading(true);
    let url = `/api/v1/alerts?since=${since}`;
    if (severity !== "all") url += `&severity=${severity}`;
    apiFetch(url)
      .then(r => r.json())
      .then(d => { setAlerts(d.alerts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [severity, since]);

  return (
    <div className="flex flex-col h-full gap-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-white/85 tracking-wide">Alert Feed</h1>
          <p className="font-mono text-[11px] text-white/30 mt-1 tracking-wide">Detected network anomalies and behavioral changes</p>
        </div>
        <div className="flex gap-2">
          <Select value={since} onValueChange={v => v && setSince(v)}>
            <SelectTrigger className="w-[130px] h-8 bg-[#181b22] border-white/[0.08] text-white/45 font-mono text-[11px] tracking-wide">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e2129] border-white/[0.1]">
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="168h">Last 7 days</SelectItem>
              <SelectItem value="720h">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={v => v && setSeverity(v)}>
            <SelectTrigger className="w-[130px] h-8 bg-[#181b22] border-white/[0.08] text-white/45 font-mono text-[11px] tracking-wide">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e2129] border-white/[0.1]">
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pb-12">
        {loading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="h-4 w-4 animate-spin text-[#F97316]/50" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <ShieldAlert className="w-7 h-7 mb-3" strokeWidth={1} />
            <p className="font-mono text-[11px] tracking-wide">no alerts found</p>
          </div>
        ) : (
          <AnimatePresence>
            {alerts.map((alert, i) => (
              <motion.div
                key={`${alert.ts}-${i}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-[#181b22] border border-white/[0.06] px-4 py-3.5 flex items-start gap-4 hover:border-white/[0.11] transition-colors"
              >
                <div className="mt-0.5 w-7 h-7 bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
                  {typeIcon[alert.type] ?? <AlertCircle className="w-3 h-3 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono text-[12px] text-white/65 font-medium tracking-wide">{alert.type}</span>
                    <span className="font-mono text-[10px] text-white/25 tracking-wide">{alert.host}:{alert.port}/{alert.proto}</span>
                    <span className={`ml-auto font-mono text-[9px] px-1.5 py-0.5 border tracking-widest uppercase ${severityStyle[alert.severity] ?? severityStyle.LOW}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="font-mono text-[12px] text-white/35 leading-relaxed tracking-wide">{alert.message}</p>
                  <p className="font-mono text-[10px] text-white/20 mt-2 tracking-wide">{new Date(alert.ts).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
