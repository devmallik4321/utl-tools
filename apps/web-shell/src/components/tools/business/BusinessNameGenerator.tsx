"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, ExternalLink } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const STYLES: Record<string, { prefixes: string[]; suffixes: string[]; lexicons: string[] }> = {
  saas: {
    prefixes: ["Cloud", "Omni", "Sync", "Nova", "Flux", "Flow", "Pulse", "Meta", "Hyper", "Velo"],
    suffixes: ["ify", "ly", "hq", "stack", "base", "hub", "flow", "ops", "forge", "scale"],
    lexicons: ["Sync", "Scale", "Stack", "Engine", "Pulse", "Matrix", "Nest", "Forge", "Grid", "Apex"],
  },
  modern: {
    prefixes: ["Aura", "Zen", "Kite", "Loom", "Lark", "Verve", "Miro", "Lume", "Bolt", "Echo"],
    suffixes: ["a", "o", "io", "us", "ix", "en", "is", "ex", "on", "ai"],
    lexicons: ["Craft", "Nova", "Loom", "Beam", "Drift", "Aura", "Peak", "Haven", "Pulse", "Vault"],
  },
  corporate: {
    prefixes: ["Apex", "Vanguard", "Pinnacle", "Premier", "Global", "Summit", "Sterling", "Crest"],
    suffixes: ["Group", "Capital", "Partners", "Ventures", "Consulting", "Holdings", "Advisors"],
    lexicons: ["Bridge", "Charter", "Pinnacle", "Prime", "Summit", "Horizon", "Crest", "Crown"],
  },
  creative: {
    prefixes: ["Pixel", "Neon", "Velvet", "Prism", "Craft", "Mosaic", "Kaleido", "Vivid"],
    suffixes: ["Studio", "Lab", "Works", "Collective", "Atelier", "Design", "Co", "Space"],
    lexicons: ["Studio", "Canvas", "Palette", "Prism", "Bloom", "Muse", "Spark", "Vibe"],
  },
};

export function BusinessNameGenerator() {
  const [keyword, setKeyword] = useState<string>("Pay");
  const [industry, setIndustry] = useState<string>("saas");
  const [names, setNames] = useState<string[]>([
    "Payify",
    "OmniPay",
    "PayStack",
    "NovaPay",
    "PayForge",
    "PulsePay",
    "PayFlow HQ",
    "HyperPay",
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateNames = () => {
    const active = STYLES[industry] || STYLES.saas;
    const cleanKey = keyword.trim() || "Nova";
    const generated: string[] = [];

    for (let i = 0; i < 12; i++) {
      const pref = active.prefixes[Math.floor(Math.random() * active.prefixes.length)];
      const suff = active.suffixes[Math.floor(Math.random() * active.suffixes.length)];
      const lex = active.lexicons[Math.floor(Math.random() * active.lexicons.length)];

      let name = "";
      const mod = i % 4;

      if (mod === 0) name = `${cleanKey}${suff}`;
      else if (mod === 1) name = `${pref}${cleanKey}`;
      else if (mod === 2) name = `${cleanKey} ${lex}`;
      else name = `${pref} ${cleanKey}`;

      if (!generated.includes(name)) {
        generated.push(name);
      }
    }

    setNames(generated);
  };

  const copyName = async (name: string, index: number) => {
    const ok = await copyToClipboard(name);
    if (ok) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Core Concept / Keyword
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Cloud, Food, AI, Fit, Secure"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Naming Style
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
            >
              <option value="saas">Tech & SaaS (e.g. Cloudify, SyncHQ)</option>
              <option value="modern">Short & Brandable (e.g. Aura, Miro)</option>
              <option value="corporate">Corporate & Advisory (e.g. Pinnacle Partners)</option>
              <option value="creative">Creative & Agency (e.g. Pixel Studio)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={generateNames}
              className="w-full py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs sm:text-sm rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Names Grid */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Brandable Business Ideas ({names.length})
          </span>
          <span className="text-xs text-muted-foreground">Click copy or check domain</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {names.map((name, idx) => {
            const cleanDomainName = name.replace(/\s+/g, "").toLowerCase();
            return (
              <div
                key={idx}
                className="group p-3.5 rounded-xl border border-border bg-background hover:border-blue-500/80 hover:shadow-sm flex items-center justify-between transition-all"
              >
                <div
                  onClick={() => copyName(name, idx)}
                  className="flex-1 cursor-pointer flex items-center gap-2"
                >
                  <span className="font-bold text-sm text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {name}
                  </span>
                  {copiedIndex === idx && (
                    <span className="text-[10px] text-emerald-600 font-semibold">Copied!</span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyName(name, idx)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                    title="Copy Name"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>

                  <a
                    href={`https://whois.domaintools.com/${cleanDomainName}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-muted-foreground hover:text-blue-600"
                    title={`Check ${cleanDomainName}.com`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
