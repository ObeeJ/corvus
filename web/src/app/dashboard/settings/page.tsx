"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader2, Info } from "lucide-react";

const inputCls = "h-9 bg-white/[0.03] border-white/[0.07] text-white/65 placeholder:text-white/20 font-mono text-[12px] focus-visible:ring-[#F97316]/20 focus-visible:border-[#F97316]/30 tracking-wide";

const STORAGE_KEY = "corvus_settings";

type SettingsState = {
  defaultPorts: string;
  concurrency: number;
  rateLimit: number;
  osintEnabled: boolean;
  nvdKey: string;
  llmProvider: string;
  llmModel: string;
  llmKey: string;
  awsAccessKey: string;
  awsSecretKey: string;
  awsSGEnabled: boolean;
};

const DEFAULTS: SettingsState = {
  defaultPorts: "1-1024,8080,8443,9200,5432,3306,6379,27017",
  concurrency: 500,
  rateLimit: 0,
  osintEnabled: true,
  nvdKey: "",
  llmProvider: "groq",
  llmModel: "",
  llmKey: "",
  awsAccessKey: "",
  awsSecretKey: "",
  awsSGEnabled: false,
};

const LLM_PROVIDERS = [
  { id: "groq",      label: "Groq",      hint: "Free · llama-3.3-70b-versatile · 280 t/s",  proOnly: false },
  { id: "openai",    label: "OpenAI",    hint: "Pro · gpt-4o-mini or gpt-4o",               proOnly: true  },
  { id: "anthropic", label: "Anthropic", hint: "Pro · claude-haiku or claude-sonnet",        proOnly: true  },
  { id: "deepseek",  label: "DeepSeek",  hint: "Pro · deepseek-chat · very cost-efficient",  proOnly: true  },
  { id: "gemini",    label: "Gemini",    hint: "Pro · gemini-2.0-flash",                     proOnly: true  },
  { id: "grok",      label: "Grok",      hint: "Pro · grok-3-mini · xAI",                   proOnly: true  },
];

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#181b22] border border-white/[0.07] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[13px] font-semibold text-white/80 tracking-wide">{title}</p>
        <p className="font-mono text-[11px] text-white/30 mt-1 tracking-wide">{desc}</p>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] text-white/30 uppercase tracking-[0.15em]">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/40 leading-relaxed tracking-wide">{hint}</p>}
    </div>
  );
}

function ToggleRow({ title, hint, checked, onChange }: {
  title: string; hint: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white/70 tracking-wide">{title}</p>
        <p className="text-[11px] text-white/40 mt-0.5 tracking-wide leading-relaxed">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-[#F97316] shrink-0 mt-1" />
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [s, setS] = useState<SettingsState>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  /* Load saved settings on mount. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);

  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) =>
    setS(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      setSavedAt(Date.now());
    } finally {
      setTimeout(() => setSaving(false), 400);
    }
  };

  const handleReset = () => {
    setS(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    setSavedAt(null);
  };

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto pb-24">
      <div>
        <h1 className="text-[15px] font-semibold text-white/85 tracking-wide">Settings</h1>
        <p className="text-[11px] text-white/40 mt-1 tracking-wide leading-relaxed">
          Tune how Corvus scans, who it talks to, and which integrations it uses. Changes save to this browser.
        </p>
      </div>

      {/* Plan */}
      <Section title="Plan" desc="Your subscription and what's included">
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05]">
          <div>
            <p className="text-[13px] text-white/70 tracking-wide">
              You&apos;re on the{" "}
              <span className="font-mono text-[#F97316] font-semibold uppercase tracking-widest">{user?.plan || "free"}</span>{" "}
              plan
            </p>
            <p className="text-[11px] text-white/40 mt-1 tracking-wide">
              {user?.plan === "pro"
                ? "Unlimited scans, full API access, all integrations."
                : "100 scans/month, 7-day data retention. Upgrade to remove limits."}
            </p>
          </div>
          <a
            href="/billing"
            className="font-mono text-[11px] text-[#F97316]/70 hover:text-[#F97316] transition-colors tracking-wide uppercase border border-[#F97316]/20 hover:border-[#F97316]/40 px-3 py-1.5"
          >
            {user?.plan === "pro" ? "Manage" : "Upgrade"} →
          </a>
        </div>
      </Section>

      {/* Scan Defaults */}
      <Section title="Scan defaults" desc="Applied to every new scan unless you override them">
        <Field
          label="Default ports"
          hint="The list Corvus checks unless you specify others. Use commas and ranges (e.g. 22,80,443,8000-8100)."
        >
          <Input value={s.defaultPorts} onChange={e => update("defaultPorts", e.target.value)} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Concurrency"
            hint="How many ports to probe at once. Higher = faster scans, more bandwidth."
          >
            <Input type="number" value={s.concurrency} onChange={e => update("concurrency", Number(e.target.value))} className={inputCls} />
          </Field>
          <Field
            label="Rate limit"
            hint="Max packets per second. Set 0 for unlimited. Lower it on fragile networks."
          >
            <Input type="number" value={s.rateLimit} onChange={e => update("rateLimit", Number(e.target.value))} className={inputCls} />
          </Field>
        </div>
        <ToggleRow
          title="OSINT pre-scan"
          hint="Before sending packets, look up the target in public databases (CT logs, DNS, BGP). Catches issues without touching the network."
          checked={s.osintEnabled}
          onChange={v => update("osintEnabled", v)}
        />
      </Section>

      {/* Integrations */}
      <Section title="Integrations" desc="Optional API keys that make Corvus smarter">
        <Field
          label="NVD API key"
          hint="Speeds up vulnerability lookups. Free at nvd.nist.gov — without one, the public rate limit applies."
        >
          <Input
            type="password"
            placeholder="00000000-0000-0000-0000-000000000000"
            value={s.nvdKey}
            onChange={e => update("nvdKey", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Separator className="bg-white/[0.05]" />

        <Field
          label="LLM provider"
          hint={user?.plan === "pro" ? "Choose any provider. Each needs its own API key." : "Groq is free. Upgrade to Pro to use OpenAI, Anthropic, DeepSeek, Gemini, or Grok."}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LLM_PROVIDERS.map(p => {
              const locked = p.proOnly && user?.plan !== "pro";
              const active = s.llmProvider === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={locked}
                  onClick={() => !locked && update("llmProvider", p.id)}
                  className={`text-left px-3 py-2.5 border transition-all ${
                    active
                      ? "bg-[#F97316]/10 border-[#F97316]/35 text-[#F97316]"
                      : locked
                      ? "bg-white/[0.01] border-white/[0.04] text-white/20 cursor-not-allowed"
                      : "bg-white/[0.02] border-white/[0.07] text-white/55 hover:border-white/20 hover:text-white/75"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-mono text-[11px] font-semibold tracking-wide">{p.label}</span>
                    {locked && <span className="font-mono text-[9px] text-white/20 border border-white/[0.08] px-1 tracking-wide">PRO</span>}
                  </div>
                  <p className="font-mono text-[10px] text-white/30 tracking-wide leading-relaxed">{p.hint}</p>
                </button>
              );
            })}
          </div>
        </Field>

        <Field
          label="LLM model (optional)"
          hint="Leave blank to use the default for your chosen provider."
        >
          <Input
            placeholder={`e.g. ${s.llmProvider === "groq" ? "llama-3.3-70b-versatile" : s.llmProvider === "openai" ? "gpt-4o" : s.llmProvider === "anthropic" ? "claude-sonnet-4-5" : "default"}`}
            value={s.llmModel}
            onChange={e => update("llmModel", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field
          label="LLM API key"
          hint={s.llmProvider === "groq" ? "Get a free key at console.groq.com" : `Your ${s.llmProvider} API key.`}
        >
          <Input
            type="password"
            placeholder={s.llmProvider === "groq" ? "gsk_..." : s.llmProvider === "openai" ? "sk-..." : s.llmProvider === "anthropic" ? "sk-ant-..." : "API key"}
            value={s.llmKey}
            onChange={e => update("llmKey", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Separator className="bg-white/[0.05]" />

        <div className="space-y-3">
          <div>
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.15em] mb-1">AWS credentials</p>
            <p className="text-[11px] text-white/40 leading-relaxed tracking-wide">
              Optional. Lets Corvus cross-reference scan results with your AWS firewall rules to flag accidental exposures.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="password"
              placeholder="AWS Access Key ID"
              value={s.awsAccessKey}
              onChange={e => update("awsAccessKey", e.target.value)}
              className={inputCls}
            />
            <Input
              type="password"
              placeholder="AWS Secret Access Key"
              value={s.awsSecretKey}
              onChange={e => update("awsSecretKey", e.target.value)}
              className={inputCls}
            />
          </div>
          <ToggleRow
            title="Match scans to Security Groups"
            hint="When a port shows open in a scan, also flag whether your AWS Security Group allows it. Catches drift between what you intended and what's exposed."
            checked={s.awsSGEnabled}
            onChange={v => update("awsSGEnabled", v)}
          />
        </div>
      </Section>

      {/* Onboarding hint */}
      <div className="flex items-start gap-3 p-4 bg-white/[0.015] border border-white/[0.05]">
        <Info className="w-3.5 h-3.5 text-white/35 mt-0.5 shrink-0" />
        <div>
          <p className="text-[11px] text-white/55 tracking-wide leading-relaxed">
            <span className="font-semibold text-white/75">Not sure where to start?</span> Defaults work fine. Add a NVD key first — it&apos;s free and gives instant speedup on CVE lookups. AWS credentials are only useful if you run cloud infra.
          </p>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-10 mt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 p-3.5 bg-[#181b22] border border-white/[0.1] shadow-[0_8px_28px_-12px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              {savedAt ? (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F97316]" />
                  <span className="font-mono text-[11px] text-white/55 tracking-wide">Saved to this browser</span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                  <span className="font-mono text-[11px] text-white/45 tracking-wide">Unsaved changes preview live in this session</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="font-mono text-[10px] text-white/30 hover:text-white/60 transition-colors tracking-[0.15em] uppercase px-2"
            >
              Reset
            </button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-6 bg-[#F97316] text-[#0c0d10] font-mono font-bold text-[11px] hover:bg-[#F97316]/90 tracking-widest uppercase flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save changes"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
