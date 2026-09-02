"use client";

import { useState, useMemo } from "react";
import { Braces, Copy, Check, Sparkles, Minimize2, Maximize2, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JSON = `{
  "projectName": "UTL.tools",
  "version": "2.0.0",
  "clientSide": true,
  "metrics": {
    "utilities": 230,
    "staticRoutes": 276
  },
  "features": ["zero-runtime-cost", "zero-knowledge-privacy", "instant-search"]
}`;

export function JsonBeautifyMinify() {
  const [inputJson, setInputJson] = useState<string>(SAMPLE_JSON);
  const [indentSpaces, setIndentSpaces] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const { outputJson, isValid, errorMsg, originalBytes, minifiedBytes, savingsPct } = useMemo(() => {
    if (!inputJson.trim()) {
      return { outputJson: "", isValid: true, errorMsg: "", originalBytes: 0, minifiedBytes: 0, savingsPct: "0" };
    }

    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      const origB = new Blob([inputJson]).size;
      const minB = new Blob([minified]).size;
      const sav = origB > 0 ? (((origB - minB) / origB) * 100).toFixed(1) : "0";

      return {
        outputJson: minified,
        isValid: true,
        errorMsg: "",
        originalBytes: origB,
        minifiedBytes: minB,
        savingsPct: sav,
      };
    } catch (e: any) {
      return {
        outputJson: "",
        isValid: false,
        errorMsg: e.message || "Invalid JSON syntax",
        originalBytes: new Blob([inputJson]).size,
        minifiedBytes: 0,
        savingsPct: "0",
      };
    }
  }, [inputJson]);

  const handleFormat = (spaces: number) => {
    try {
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed, null, spaces));
    } catch (e) {
      // ignore
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed));
    } catch (e) {
      // ignore
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(inputJson);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFormat(2)}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg border border-border transition-colors flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Beautify (2 Spaces)</span>
          </button>

          <button
            onClick={() => handleFormat(4)}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg border border-border transition-colors flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Beautify (4 Spaces)</span>
          </button>

          <button
            onClick={handleMinify}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify JSON</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy Output"}</span>
        </button>
      </div>

      {/* Editor Area */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">JSON Editor &amp; Linter</label>
          <span className="font-mono">
            {originalBytes} bytes {isValid && `• Minified: ${minifiedBytes} bytes (-${savingsPct}%)`}
          </span>
        </div>
        <textarea
          value={inputJson}
          onChange={(e) => setInputJson(e.target.value)}
          rows={10}
          placeholder="Paste or type JSON here..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {!isValid && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
