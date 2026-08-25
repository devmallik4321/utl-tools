"use client";

import { useState, useEffect } from "react";
import { Hash, Copy, Check, ShieldCheck, FileCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog";

export function HashGenerator() {
  const [input, setInput] = useState<string>(SAMPLE_TEXT);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const computeHashes = async () => {
    if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) return;

    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const algorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
    const results: Record<string, string> = {};

    for (const algo of algorithms) {
      try {
        const buffer = await window.crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(buffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        results[algo] = hashHex;
      } catch {
        results[algo] = "Unavailable";
      }
    }

    setHashes(results);
  };

  useEffect(() => {
    computeHashes();
  }, [input]);

  const handleCopy = async (key: string, val: string) => {
    const textToCopy = uppercase ? val.toUpperCase() : val.toLowerCase();
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Text Box */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-blue-500" />
            Input String to Hash
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Uppercase Hex</span>
            </label>
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text here to compute cryptographic checksums..."
          className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none resize-none"
        />
      </div>

      {/* Hash Results Grid */}
      <div className="space-y-3">
        {Object.entries(hashes).map(([algo, rawHash]) => {
          const formatted = uppercase ? rawHash.toUpperCase() : rawHash.toLowerCase();
          const isCopied = copiedKey === algo;

          return (
            <div
              key={algo}
              className="p-4 bg-card border border-border rounded-xl space-y-1.5 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {algo} Checksum
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {rawHash.length * 4} bits ({rawHash.length / 2} bytes)
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 p-2.5 bg-muted/40 rounded-lg font-mono text-xs text-foreground">
                <span className="truncate select-all font-medium">{formatted}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(algo, rawHash)}
                  className="p-1.5 text-muted-foreground hover:text-foreground bg-card hover:bg-muted border border-border rounded-md transition-colors shrink-0"
                  title="Copy hash"
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
