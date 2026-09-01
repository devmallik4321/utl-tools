"use client";

import { useState, useMemo, useEffect } from "react";
import { Hash, Copy, Check, Download, RefreshCw, Sparkles, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BatchUuidGenerator() {
  const [count, setCount] = useState<number>(10);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [includeHyphens, setIncludeHyphens] = useState<boolean>(true);
  const [wrapBraces, setWrapBraces] = useState<boolean>(false);
  const [delimiter, setDelimiter] = useState<"newline" | "comma" | "json">("newline");
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const generateUuids = () => {
    const list: string[] = [];
    const n = Math.min(500, Math.max(1, count));
    for (let i = 0; i < n; i++) {
      let u = "";
      if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
        u = window.crypto.randomUUID();
      } else {
        u = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }

      if (!includeHyphens) {
        u = u.replace(/-/g, "");
      }
      if (uppercase) {
        u = u.toUpperCase();
      }
      if (wrapBraces) {
        u = `{${u}}`;
      }
      list.push(u);
    }
    setUuids(list);
  };

  useEffect(() => {
    generateUuids();
  }, [count, uppercase, includeHyphens, wrapBraces]);

  const formattedOutput = useMemo(() => {
    if (delimiter === "json") {
      return JSON.stringify(uuids, null, 2);
    } else if (delimiter === "comma") {
      return uuids.join(", ");
    }
    return uuids.join("\n");
  }, [uuids, delimiter]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(formattedOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const ext = delimiter === "json" ? "json" : "txt";
    const blob = new Blob([formattedOutput], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${count}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Configuration Bar */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Quantity (1–500)
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) => setCount(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Output Format
            </label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg"
            >
              <option value="newline">One Per Line (Text)</option>
              <option value="comma">Comma-Separated (CSV)</option>
              <option value="json">JSON Array</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-1 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHyphens}
                onChange={(e) => setIncludeHyphens(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <span>Include Hyphens (-)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <span>Uppercase (A-F)</span>
            </label>
          </div>

          <div className="flex flex-col gap-2 pt-1 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={wrapBraces}
                onChange={(e) => setWrapBraces(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <span>Wrap in Braces {"{...}"}</span>
            </label>
            <button
              onClick={generateUuids}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Output Area */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-blue-500" />
            Generated Cryptographic UUID v4 Identifiers ({uuids.length} generated)
          </h4>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy All"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 inline-flex items-center gap-1 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <textarea
          readOnly
          value={formattedOutput}
          rows={8}
          className="w-full px-3 py-2 text-xs font-mono bg-card border border-border rounded-lg text-emerald-600 dark:text-emerald-400 focus:outline-none select-all"
        />
      </div>
    </div>
  );
}
