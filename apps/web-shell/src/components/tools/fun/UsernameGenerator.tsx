"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const THEMES: Record<string, { prefixes: string[]; suffixes: string[]; adjectives: string[]; nouns: string[] }> = {
  tech: {
    prefixes: ["cyber", "byte", "code", "dev", "algo", "stack", "pixel", "logic", "nano", "vector"],
    suffixes: ["dev", "io", "lab", "hub", "bit", "box", "node", "sync", "core", "ops"],
    adjectives: ["Binary", "Quantum", "Crypto", "Neural", "Hyper", "Async", "Modular", "Static", "Cloud", "Cyber"],
    nouns: ["Coder", "Hacker", "Vector", "Matrix", "Daemon", "Kernel", "Syntax", "Buffer", "Packet", "Circuit"],
  },
  gaming: {
    prefixes: ["shadow", "frost", "vortex", "alpha", "rage", "blaze", "venom", "sniper", "titan", "ghost"],
    suffixes: ["pro", "god", "x", "play", "gg", "prime", "king", "slayer", "vibe", "elite"],
    adjectives: ["Silent", "Fierce", "Lethal", "Shadow", "Crimson", "Immortal", "Phantom", "Savage", "Mystic", "Iron"],
    nouns: ["Hunter", "Ninja", "Reaper", "Striker", "Knight", "Dragon", "Vanguard", "Ranger", "Warrior", "Sniper"],
  },
  clean: {
    prefixes: ["the", "just", "hey", "im", "real", "pure", "true", "simply", "daily", "daily"],
    suffixes: ["life", "flow", "mode", "wave", "vibe", "view", "zone", "hq", "space", "room"],
    adjectives: ["Calm", "Simple", "Noble", "Crisp", "Subtle", "Gentle", "Serene", "Fresh", "Velvet", "Golden"],
    nouns: ["Notes", "Studio", "Haven", "Atlas", "Oasis", "Peak", "Breeze", "Summit", "Horizon", "Harbor"],
  },
  creative: {
    prefixes: ["art", "color", "canvas", "ink", "craft", "neon", "prism", "spark", "mood", "aura"],
    suffixes: ["art", "design", "studio", "works", "create", "craft", "lens", "visuals", "gallery", "palette"],
    adjectives: ["Velvet", "Cosmic", "Pastel", "Luminous", "Radiant", "Abstract", "Infinite", "Solar", "Electric", "Chic"],
    nouns: ["Canvas", "Palette", "Prism", "Muse", "Mosaic", "Aura", "Studio", "Sculpt", "Motif", "Echo"],
  },
};

export function UsernameGenerator() {
  const [theme, setTheme] = useState<string>("tech");
  const [keyword, setKeyword] = useState<string>("");
  const [includeNumber, setIncludeNumber] = useState<boolean>(true);
  const [separator, setSeparator] = useState<"none" | "underscore" | "dot" | "dash">("none");
  const [usernames, setUsernames] = useState<string[]>([
    "QuantumCoder",
    "CyberDaemon",
    "DevMatrix_99",
    "ByteVector",
    "AsyncKnight",
    "SilentHacker",
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getSep = () => {
    if (separator === "underscore") return "_";
    if (separator === "dot") return ".";
    if (separator === "dash") return "-";
    return "";
  };

  const generateUsernames = () => {
    const active = THEMES[theme] || THEMES.tech;
    const sep = getSep();
    const results: string[] = [];

    for (let i = 0; i < 12; i++) {
      const adj = active.adjectives[Math.floor(Math.random() * active.adjectives.length)];
      const noun = active.nouns[Math.floor(Math.random() * active.nouns.length)];
      const prefix = active.prefixes[Math.floor(Math.random() * active.prefixes.length)];
      const suffix = active.suffixes[Math.floor(Math.random() * active.suffixes.length)];
      const randNum = includeNumber ? Math.floor(Math.random() * 90) + 10 : "";

      let name = "";
      const style = i % 4;

      if (keyword.trim()) {
        const cleanKey = keyword.trim().replace(/\s+/g, "");
        if (style === 0) name = `${cleanKey}${sep}${noun}${randNum}`;
        else if (style === 1) name = `${adj}${sep}${cleanKey}${randNum}`;
        else if (style === 2) name = `${prefix}${sep}${cleanKey}`;
        else name = `${cleanKey}${sep}${suffix}${randNum}`;
      } else {
        if (style === 0) name = `${adj}${sep}${noun}${randNum}`;
        else if (style === 1) name = `${prefix}${sep}${noun.toLowerCase()}${randNum}`;
        else if (style === 2) name = `${adj.toLowerCase()}${sep}${suffix}${randNum}`;
        else name = `${prefix}${sep}${adj.toLowerCase()}${randNum}`;
      }

      if (!results.includes(name)) {
        results.push(name);
      }
    }

    setUsernames(results);
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
      {/* Settings Bar */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Style / Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
            >
              <option value="tech">Developer / Tech</option>
              <option value="gaming">Gaming & Esports</option>
              <option value="clean">Clean & Minimalist</option>
              <option value="creative">Creative & Design</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Seed Word (Optional)
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Alex, Cloud, Ace"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Separator
            </label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
            >
              <option value="none">None (PascalCase)</option>
              <option value="underscore">Underscore (_)</option>
              <option value="dot">Dot (.)</option>
              <option value="dash">Hyphen (-)</option>
            </select>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeNumber}
                onChange={(e) => setIncludeNumber(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Include random digits</span>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={generateUsernames}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs sm:text-sm rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Usernames</span>
        </button>
      </div>

      {/* Usernames Grid */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Generated Usernames ({usernames.length})
          </span>
          <span className="text-xs text-muted-foreground">Click any username to copy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {usernames.map((name, idx) => (
            <div
              key={idx}
              onClick={() => copyName(name, idx)}
              className="group p-3.5 rounded-xl border border-border bg-background hover:border-blue-500/80 hover:shadow-sm cursor-pointer flex items-center justify-between transition-all"
            >
              <span className="font-mono font-bold text-sm text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {name}
              </span>
              <span className="p-1 rounded bg-muted/60 text-muted-foreground group-hover:text-foreground">
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
