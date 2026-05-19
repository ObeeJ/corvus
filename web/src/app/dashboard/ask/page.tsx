"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Terminal, Brain, Sparkles, Mic, MicOff, Volume2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "llm" | "dsl";

const DSL_SUGGESTIONS = [
  "ports opened in last 24h",
  "open ports on 192.168.1.0/24",
  "hosts running ssh",
  "hosts running ssh in last 7d",
];

const LLM_SUGGESTIONS = [
  "what on my network looks most likely to be exploited?",
  "did anything unusual happen in the last 6 hours?",
  "which hosts are running software with critical CVEs?",
  "summarize the current attack surface",
];

const inputCls = "pl-10 h-10 font-mono text-[12px] bg-white/[0.03] border-white/[0.07] text-white/75 placeholder:text-white/20 focus-visible:ring-[#F97316]/20 focus-visible:border-[#F97316]/30 tracking-wide";

export default function Ask() {
  const { apiFetch, user } = useAuth();
  const [mode, setMode] = useState<Mode>("llm");
  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<any[]>([]);
  const [showModels, setShowModels] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dslResults, setDslResults] = useState<any[] | null>(null);
  const [llmAnswer, setLlmAnswer] = useState<string | null>(null);

  // Voice input
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // TTS
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load models on mount
  useEffect(() => {
    apiFetch("/api/v1/ask/models")
      .then(r => r.json())
      .then(d => {
        setModels(d.models || []);
        if (d.models?.length > 0) setSelectedModel(d.models[0].id);
      })
      .catch(() => {});
  }, [apiFetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setDslResults(null);
    setLlmAnswer(null);

    try {
      if (mode === "llm") {
        const res = await apiFetch("/api/v1/ask", {
          method: "POST",
          body: JSON.stringify({ question: query, model: selectedModel }),
        });
        const data = await res.json();
        setLlmAnswer(data.answer || data.error || "No answer returned.");
      } else {
        const res = await apiFetch("/api/v1/query", {
          method: "POST",
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        setDslResults(data.results || []);
      }
    } catch {
      if (mode === "llm") setLlmAnswer("Failed to reach the server.");
      else setDslResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setTranscribing(true);
        try {
          const form = new FormData();
          form.append("audio", blob, "recording.webm");
          form.append("language", "en");
          const res = await fetch("/api/v1/ask/transcribe", {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("corvus_token")}` },
            body: form,
          });
          const d = await res.json();
          if (d.text) setQuery(d.text);
        } catch {} finally { setTranscribing(false); }
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch { alert("Microphone access denied"); }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  // TTS
  const speak = async (text: string) => {
    if (speaking) { audioRef.current?.pause(); setSpeaking(false); return; }
    setSpeaking(true);
    try {
      const res = await apiFetch("/api/v1/ask/speak", {
        method: "POST",
        body: JSON.stringify({ text, voice: "Fritz-PlayAI" }),
      });
      const d = await res.json();
      if (d.audio) {
        const bytes = Uint8Array.from(atob(d.audio), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setSpeaking(false);
        audio.play();
      }
    } catch { setSpeaking(false); }
  };

  const suggestions = mode === "llm" ? LLM_SUGGESTIONS : DSL_SUGGESTIONS;
  const hasResult = mode === "llm" ? llmAnswer !== null : dslResults !== null;
  const isGroq = user?.plan !== "pro" || !selectedModel || selectedModel.includes("llama") || selectedModel.includes("groq");

  return (
    <div className="flex flex-col h-full gap-5 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-white/85 tracking-wide">Ask Corvus</h1>
          <p className="font-mono text-[11px] text-white/30 mt-1 tracking-wide">Query your network intelligence state</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06]">
          {([["llm", Brain, "Ask AI"], ["dsl", Terminal, "Query DSL"]] as const).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => { setMode(id); setQuery(""); setDslResults(null); setLlmAnswer(null); }}
              className={`flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${
                mode === id ? "bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/25" : "text-white/30 hover:text-white/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#181b22] border border-white/[0.07] p-5 space-y-4">
        {/* Model selector — only in LLM mode */}
        {mode === "llm" && models.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowModels(v => !v)}
              className="flex items-center gap-2 font-mono text-[11px] text-white/45 hover:text-white/70 transition-colors border border-white/[0.07] px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.04]"
            >
              <Brain className="w-3.5 h-3.5 text-[#F97316]/60" />
              <span className="tracking-wide">{selectedModel || "Select model"}</span>
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showModels ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showModels && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 z-20 bg-[#1a1f2a] border border-white/[0.1] min-w-[280px] max-h-64 overflow-y-auto shadow-xl"
                >
                  {models.map((m: any) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m.id); setShowModels(false); }}
                      className={`w-full text-left px-4 py-2.5 font-mono text-[11px] hover:bg-white/[0.05] transition-colors tracking-wide ${
                        selectedModel === m.id ? "text-[#F97316] bg-[#F97316]/[0.06]" : "text-white/55"
                      }`}
                    >
                      <span className="block">{m.id}</span>
                      {m.owned_by && <span className="text-white/25 text-[10px]">{m.owned_by}</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Info banner */}
        {mode === "llm" && (
          <div className="flex items-start gap-2.5 p-3 bg-[#F97316]/[0.05] border border-[#F97316]/15">
            <Sparkles className="w-3.5 h-3.5 text-[#F97316]/60 shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-white/35 leading-relaxed tracking-wide">
              Corvus fetches your network state, passes it to the selected model, and returns a plain-English answer.
              {isGroq && " Voice input and TTS available with Groq."}
            </p>
          </div>
        )}

        {/* Input row */}
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            {mode === "llm" ? <Brain className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" /> : <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />}
            <Input
              placeholder={mode === "llm" ? "e.g. what looks most likely to be exploited?" : "e.g. ports opened in last 24h"}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className={inputCls}
              disabled={loading || recording || transcribing}
            />
          </div>

          {/* Voice button — Groq only */}
          {mode === "llm" && isGroq && (
            <Button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              disabled={transcribing}
              variant="outline"
              className={`h-10 px-3 border transition-colors ${
                recording
                  ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
              }`}
              title={recording ? "Stop recording" : "Voice input"}
            >
              {transcribing ? <Loader2 className="w-4 h-4 animate-spin" /> : recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}

          <Button
            type="submit"
            disabled={loading || !query}
            className="h-10 px-6 bg-[#F97316] text-[#0c0d10] font-mono font-bold text-[11px] hover:bg-[#F97316]/90 disabled:opacity-30 tracking-widest uppercase"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Search className="h-3.5 w-3.5 mr-2" />{mode === "llm" ? "Ask" : "Run"}</>}
          </Button>
        </form>

        {/* Suggestions */}
        {!hasResult && !loading && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="font-mono text-[10px] bg-white/[0.03] hover:bg-[#F97316]/[0.06] text-white/30 hover:text-[#F97316]/70 px-3 py-1.5 border border-white/[0.06] hover:border-[#F97316]/25 transition-all tracking-wide"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LLM answer */}
      <AnimatePresence>
        {mode === "llm" && llmAnswer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#181b22] border border-white/[0.07] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-[#F97316]/60" />
                <span className="font-mono text-[10px] text-white/25 uppercase tracking-[0.15em]">
                  {selectedModel || "Corvus AI"}
                </span>
              </div>
              {/* TTS button — Groq only */}
              {isGroq && (
                <button
                  onClick={() => speak(llmAnswer)}
                  className={`flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1 border transition-colors ${
                    speaking
                      ? "bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316]"
                      : "bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/60 hover:border-white/20"
                  }`}
                  title={speaking ? "Stop" : "Read aloud"}
                >
                  <Volume2 className="w-3 h-3" />
                  {speaking ? "Stop" : "Read aloud"}
                </button>
              )}
            </div>
            <p className="font-mono text-[13px] text-white/65 leading-relaxed whitespace-pre-wrap tracking-wide">{llmAnswer}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DSL results */}
      <AnimatePresence>
        {mode === "dsl" && dslResults !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-[#181b22] border border-white/[0.07] flex flex-col min-h-0 overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="font-mono text-[10px] text-white/25 uppercase tracking-[0.15em]">Results</span>
              <span className="font-mono text-[10px] text-white/20 tracking-wide">{dslResults.length} matches</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.05] hover:bg-transparent">
                    {["Host", "Port", "Service", "Version", "Status"].map(h => (
                      <TableHead key={h} className="font-mono text-[9px] text-white/20 uppercase tracking-[0.15em] h-9">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dslResults.length === 0 ? (
                    <TableRow className="border-transparent hover:bg-transparent">
                      <TableCell colSpan={5} className="h-32 text-center font-mono text-[11px] text-white/20 tracking-wide">no results matched</TableCell>
                    </TableRow>
                  ) : dslResults.map((r, i) => (
                    <motion.tr
                      key={`${r.ip}-${r.port}-${i}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-white/[0.04] hover:bg-white/[0.02]"
                    >
                      <TableCell className="font-mono text-[12px] text-[#F97316] py-2.5 tracking-wide">{r.ip}</TableCell>
                      <TableCell className="font-mono text-[12px] text-white/40 py-2.5 tracking-wide">{r.port}/{r.protocol}</TableCell>
                      <TableCell className="text-[12px] text-white/70 font-medium py-2.5 tracking-wide">{r.state?.service || r.state?.service_name || "unknown"}</TableCell>
                      <TableCell className="font-mono text-[11px] text-white/30 py-2.5 tracking-wide">{r.state?.version || "—"}</TableCell>
                      <TableCell className="py-2.5">
                        {r.state?.open
                          ? <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 tracking-wide"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />open</span>
                          : <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-white/25 tracking-wide"><span className="w-1.5 h-1.5 rounded-full bg-white/20" />closed</span>}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
