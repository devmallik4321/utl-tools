"use client";

import { useState, useMemo } from "react";
import { Minimize2, Copy, Check, Download, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JSON = `{
  "status": "success",
  "data": {
    "user": {
      "id": 1042,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "roles": [
        "admin",
        "developer"
      ]
    },
    "settings": {
      "theme": "dark",
      "notifications": true,
      "locale": "en-US"
    }
  },
  "timestamp": 1772496000
}`;

export function JsonMinifier() {
  const [inputText, setInputText] = useState<string>(SAMPLE_JSON);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    if (!inputText.trim()) {
      return { minified: "", isValid: true, originalBytes: 0, minifiedBytes: 0, savedBytes: 0, savedPct: 0 };
    }
    try {
      const parsed = JSON.parse(inputText);
      const minified = JSON.stringify(parsed);
      const originalBytes = new Blob([inputText]).size;
      const minifiedBytes = new Blob([minified]).size;
      const savedBytes = Math.max(0, originalBytes - minifiedBytes);
      const savedPct = originalBytes > 0 ? (savedBytes / originalBytes) * 100 : 0;

      return {
        minified,
        isValid: true,
        originalBytes,
        minifiedBytes,
        savedBytes,
        savedPct,
      };
    } catch (err: any) {
      return {
        minified: "",
        isValid: false,
        error: err.message,
        originalBytes: new Blob([inputText]).size,
        minifiedBytes: 0,
        savedBytes: 0,
        savedPct: 0,
      };
    }
  }, [inputText]);

  const handleCopy = async () => {
    if (!result.isValid || !result.minified) return;
    const ok = await copyToClipboard(result.minified);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result.isValid || !result.minified) return;
    const blob = new Blob([result.minified], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payload.min.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Input JSON Pane */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Raw Formatted JSON Input
          </label>
          <span className="text-xs font-mono text-muted-foreground">
            {result.originalBytes} Bytes
          </span>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={7}
          placeholder="Paste JSON to minify..."
          className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Compression Stats */}
      {result.isValid && result.minified && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Space Saved</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              -{result.savedPct.toFixed(1)}%
            </p>
            <span className="text-[10px] text-muted-foreground">{result.savedBytes} bytes eliminated</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Minified Size</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {result.minifiedBytes} <span className="text-xs font-normal text-muted-foreground">Bytes</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Compact payload wire transfer size</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Original Size</span>
            <p className="text-2xl font-bold font-mono text-muted-foreground">
              {result.originalBytes} <span className="text-xs font-normal text-muted-foreground">Bytes</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Before whitespace removal</span>
          </div>
        </div>
      )}

      {/* Minified Output Pane */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Minimize2 className="w-4 h-4 text-emerald-500" />
            Minified Single-Line JSON
          </h4>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!result.isValid || !result.minified}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Minified"}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!result.isValid || !result.minified}
              className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 inline-flex items-center gap-1 disabled:opacity-40 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .min.json</span>
            </button>
          </div>
        </div>

        {result.isValid ? (
          <textarea
            readOnly
            value={result.minified}
            rows={4}
            className="w-full px-3 py-2 text-xs font-mono bg-card border border-border rounded-lg text-emerald-600 dark:text-emerald-400 focus:outline-none select-all break-all"
          />
        ) : (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-300 text-xs">
            Invalid JSON: {result.error}
          </div>
        )}
      </div>
    </div>
  );
}
