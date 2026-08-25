"use client";

import { useState } from "react";
import { Type, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TEXT = "user profile settings and authentication token";

export function CaseConverter() {
  const [input, setInput] = useState<string>(SAMPLE_TEXT);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Split string into clean word tokens
  const getWords = (str: string): string[] => {
    return str
      .replace(/([a-z])([A-Z])/g, "$1 $2") // handle camelCase boundaries
      .replace(/[-_./\\]/g, " ") // handle separators
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  };

  const words = getWords(input);

  const cases: Record<string, { label: string; desc: string; transform: () => string }> = {
    camelCase: {
      label: "camelCase",
      desc: "Standard JavaScript / TypeScript variable convention",
      transform: () =>
        words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join(""),
    },
    snake_case: {
      label: "snake_case",
      desc: "Python & PostgreSQL column naming standard",
      transform: () => words.map((w) => w.toLowerCase()).join("_"),
    },
    "kebab-case": {
      label: "kebab-case",
      desc: "CSS class names & URL slug standard",
      transform: () => words.map((w) => w.toLowerCase()).join("-"),
    },
    PascalCase: {
      label: "PascalCase",
      desc: "React component & C# / Java class standard",
      transform: () => words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(""),
    },
    CONSTANT_CASE: {
      label: "CONSTANT_CASE",
      desc: "Global constants and environment variables",
      transform: () => words.map((w) => w.toUpperCase()).join("_"),
    },
    "Title Case": {
      label: "Title Case",
      desc: "Article headlines and UI navigation titles",
      transform: () => words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "),
    },
    "Sentence case": {
      label: "Sentence case",
      desc: "Standard sentence punctuation",
      transform: () => {
        const full = words.join(" ").toLowerCase();
        return full.charAt(0).toUpperCase() + full.slice(1);
      },
    },
    "dot.case": {
      label: "dot.case",
      desc: "Java package and metric namespace convention",
      transform: () => words.map((w) => w.toLowerCase()).join("."),
    },
    "path/case": {
      label: "path/case",
      desc: "File system directories and routing paths",
      transform: () => words.map((w) => w.toLowerCase()).join("/"),
    },
  };

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Text Area */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-blue-500" />
            Input String to Transform
          </label>
          <button
            type="button"
            onClick={() => setInput("")}
            className="text-[11px] text-muted-foreground hover:text-foreground underline"
          >
            Clear
          </button>
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste any text or variable name..."
          className="w-full px-4 py-3 text-sm sm:text-base font-mono bg-background border-2 border-border focus:border-blue-500 rounded-xl focus:outline-none"
        />
      </div>

      {/* Output Converted Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(cases).map(([key, config]) => {
          const val = config.transform();
          const isCopied = copiedKey === key;

          return (
            <div
              key={key}
              className="p-4 bg-card border border-border rounded-xl space-y-2 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{config.label}</span>
                <span className="text-[10px] text-muted-foreground">{config.desc}</span>
              </div>

              <div className="flex items-center justify-between gap-2 p-2.5 bg-muted/40 rounded-lg font-mono text-xs text-foreground">
                <span className="truncate select-all font-semibold">{val || "—"}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(key, val)}
                  className="p-1 text-muted-foreground hover:text-foreground bg-card hover:bg-muted border border-border rounded transition-colors shrink-0"
                  title="Copy to clipboard"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
