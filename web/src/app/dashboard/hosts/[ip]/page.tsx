"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, ShieldAlert, GitBranch, Activity, Lock, Search, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function HostDetail() {
  const { ip } = useParams();
  const router = useRouter();
  const { apiFetch } = useAuth();
  const [host, setHost] = useState<any>(null);
  const [supplyChain, setSupplyChain] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/v1/hosts/${ip}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      apiFetch(`/api/v1/supplychain/${ip}`).then(r => r.json()).catch(() => ({ findings: [] })),
    ]).then(([hostData, scData]) => {
      setHost(hostData);
      setSupplyChain(scData.findings || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [ip, apiFetch]);

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <Loader2 className="w-5 h-5 animate-spin text-[#F97316]" />
    </div>
  );

  if (!host) return (
    <div className="flex flex-col items-center justify-center h-full text-white/20">
      <Search className="w-8 h-8 mb-3" strokeWidth={1} />
      <p className="text-[12px] font-mono tracking-wide">host not found: {ip}</p>
      <button onClick={() => router.push("/dashboard/hosts")} className="mt-4 text-[#F97316]/60 text-[12px] hover:text-[#F97316] flex items-center gap-1.5 font-mono transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> back to hosts
      </button>
    </div>
  );

  const riskColor = host.risk_score > 50 ? "text-red-400" : host.risk_score > 20 ? "text-amber-400" : "text-[#F97316]";
  const tabCls = "rounded-none border-b-2 border-transparent data-[state=active]:border-[#F97316] data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5 px-0 text-[12px] font-mono text-white/30 data-[state=active]:text-[#F97316] tracking-wide";

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full gap-5 max-w-5xl mx-auto pb-12">
      <div>
        <button onClick={() => router.push("/dashboard/hosts")} className="text-white/30 hover:text-white/60 text-[12px] flex items-center gap-1.5 mb-4 font-mono transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> hosts
        </button>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold font-mono text-white/90 tracking-wide">{host.ip}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-white/30 font-mono tracking-wide">last seen {new Date(host.last_seen).toLocaleString()}</span>
              <span className="text-white/15">·</span>
              <span className="text-[11px] font-mono text-white/35 tracking-wide">{host.port_count} ports open</span>
              {supplyChain.length > 0 && (
                <>
                  <span className="text-white/15">·</span>
                  <span className="text-[11px] font-mono text-amber-400 tracking-wide">{supplyChain.length} supply chain flag{supplyChain.length > 1 ? "s" : ""}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">Risk Score</p>
            <p className={`text-2xl font-bold font-mono ${riskColor}`}>{host.risk_score.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* OSINT profile strip */}
      {host.osint && (
        <div className="bg-[#181b22] border border-white/[0.07] px-5 py-3 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-white/25" strokeWidth={1.5} />
            <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">OSINT</span>
          </div>
          {host.osint.organization && (
            <div><span className="font-mono text-[10px] text-white/20 uppercase tracking-wider mr-1.5">Org</span><span className="font-mono text-[11px] text-white/55 tracking-wide">{host.osint.organization}</span></div>
          )}
          {host.osint.asn > 0 && (
            <div><span className="font-mono text-[10px] text-white/20 uppercase tracking-wider mr-1.5">ASN</span><span className="font-mono text-[11px] text-white/55 tracking-wide">AS{host.osint.asn}</span></div>
          )}
          {host.osint.cloud_provider && (
            <div><span className="font-mono text-[10px] text-white/20 uppercase tracking-wider mr-1.5">Cloud</span><span className="font-mono text-[11px] text-[#F97316]/70 tracking-wide">{host.osint.cloud_provider}</span></div>
          )}
          {host.osint.hostnames?.length > 0 && (
            <div><span className="font-mono text-[10px] text-white/20 uppercase tracking-wider mr-1.5">DNS</span><span className="font-mono text-[11px] text-white/55 tracking-wide">{host.osint.hostnames.slice(0, 3).join(", ")}</span></div>
          )}
        </div>
      )}

      <Tabs defaultValue="ports" className="w-full flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b border-white/[0.06] rounded-none bg-transparent p-0 h-auto gap-5">
          <TabsTrigger value="ports" className={tabCls}>Open Ports</TabsTrigger>
          <TabsTrigger value="supplychain" className={tabCls}>
            Supply Chain
            {supplyChain.length > 0 && <span className="ml-2 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 font-mono">{supplyChain.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="alerts" className={tabCls}>
            Anomaly Log
            {host.alerts?.length > 0 && <span className="ml-2 text-[10px] bg-white/[0.07] text-white/35 px-1.5 py-0.5 font-mono">{host.alerts.length}</span>}
          </TabsTrigger>
        </TabsList>

        {/* Open Ports */}
        <TabsContent value="ports" className="mt-4 space-y-2.5 flex-1">
          {host.ports?.map((port: any) => (
            <div key={`${port.port}-${port.protocol}`} className="bg-[#181b22] border border-white/[0.06] p-5 flex flex-col md:flex-row gap-6 hover:border-white/[0.1] transition-colors">
              <div className="w-40 shrink-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-white/90">{port.port}</span>
                  <span className="text-[10px] font-mono text-white/30 uppercase">{port.protocol}</span>
                </div>
                <div className="mt-3 space-y-2 font-mono text-[11px]">
                  <div><span className="text-white/25 block mb-0.5 uppercase tracking-wider">service</span><span className="text-white/55 tracking-wide">{port.service || "unknown"}</span></div>
                  <div><span className="text-white/25 block mb-0.5 uppercase tracking-wider">version</span><span className="text-white/55 tracking-wide">{port.version || "—"}</span></div>
                  <div><span className="text-white/25 block mb-0.5 uppercase tracking-wider">latency</span><span className="text-white/55 tracking-wide">{port.response_ms}ms</span></div>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-4">
                {port.banner && (
                  <div>
                    <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">Banner</p>
                    <pre className="bg-black/40 p-3 text-[11px] font-mono text-[#F97316]/60 overflow-x-auto border border-white/[0.05] max-h-28 tracking-wide">{port.banner.trim()}</pre>
                  </div>
                )}
                {port.cves?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-3 h-3 text-red-400" /> Vulnerabilities ({port.cves.length})
                    </p>
                    <div className="space-y-1.5">
                      {port.cves.map((cve: any) => (
                        <div key={cve.id} className="flex gap-3 items-start bg-red-500/[0.05] p-2.5 border border-red-500/[0.12]">
                          <span className="text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 shrink-0 tracking-wide">{cve.id}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed tracking-wide">{cve.description}</p>
                            {cve.cvss_v3 > 0 && <p className="font-mono text-[10px] text-white/20 mt-1 tracking-wide">CVSSv3: {cve.cvss_v3} · {cve.severity}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {(!host.ports || host.ports.length === 0) && (
            <div className="text-center py-12 text-[12px] text-white/20 font-mono tracking-wide">no open ports detected</div>
          )}
        </TabsContent>

        {/* Supply Chain */}
        <TabsContent value="supplychain" className="mt-4">
          <div className="bg-[#181b22] border border-white/[0.06] overflow-hidden">
            {supplyChain.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {supplyChain.map((f: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="p-1.5 bg-amber-500/[0.08] border border-amber-500/20 shrink-0 mt-0.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] text-amber-400 tracking-wide">{f.type}</span>
                        <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 border tracking-wide ${
                          f.severity === "CRITICAL" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          f.severity === "HIGH"     ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>{f.severity}</span>
                      </div>
                      <p className="text-[12px] text-white/45 leading-relaxed tracking-wide">{f.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-white/20 flex flex-col items-center">
                <Lock className="w-7 h-7 mb-2" strokeWidth={1} />
                <p className="text-[12px] font-mono tracking-wide">no supply chain issues detected</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Anomaly Log */}
        <TabsContent value="alerts" className="mt-4">
          <div className="bg-[#181b22] border border-white/[0.06] overflow-hidden">
            {host.alerts?.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {host.alerts.map((alert: any, i: number) => (
                  <div key={i} className="px-4 py-3.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                    <div className="mt-0.5 shrink-0">
                      {alert.type === "new-port"    ? <Activity className="w-3.5 h-3.5 text-[#F97316]" /> :
                       alert.type === "banner-drift" ? <GitBranch className="w-3.5 h-3.5 text-amber-400" /> :
                                                       <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[12px] text-white/60 tracking-wide">{alert.type}</span>
                        <span className="text-[10px] text-white/20 font-mono tracking-wide">{new Date(alert.ts).toLocaleString()}</span>
                      </div>
                      <p className="text-[12px] text-white/35 leading-relaxed tracking-wide">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-white/20 flex flex-col items-center">
                <Activity className="w-7 h-7 mb-2" strokeWidth={1} />
                <p className="text-[12px] font-mono tracking-wide">no anomalies detected</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
