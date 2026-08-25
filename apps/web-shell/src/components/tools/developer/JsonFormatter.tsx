"use client";

import { useState } from "react";
import { Copy, Check, Download, Upload, Minimize2, Maximize2, RotateCcw, AlertCircle } from "lucide-react";
import { copyToClipboard, downloadFile } from "@/lib/utils";

const SAMPLE_JSON = `{
  "name": "UTL.tools",
  "version": "1.0.0",
  "features": [
    "Fast static utilities",
    "Zero server dependencies",
    "SEO-optimized content"
  ],
  "author": {
    "organization": "UTL Labs",
    "verified": true
  },
  "stats": {
    "tools": 38,
    "rating": 4.98
  }
}`;

export function JsonFormatter() {
  const [inputJson, setInputJson] = useState<string>(SAMPLE_JSON);
  const [indent, setIndent] = useState<string>("2");
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatJson = (space: string | number) => {
    setError(null);
    try {
      if (!inputJson.trim()) return;
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, space === "tab" ? "\t" : parseInt(space as string));
      setInputJson(formatted);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax.");
    }
  };

  const minifyJson = () => {
    setError(null);
    try {
      if (!inputJson.trim()) return;
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed));
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax.");
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(inputJson);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadFile(inputJson, "formatted.json", "application/json");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputJson(content);
      setError(null);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-card border border-border rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => formatJson(indent)}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Beautify</span>
          </button>

          <button
            type="button"
            onClick={minifyJson}
            className="px-3.5 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-lg border border-border flex items-center gap-1.5 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify</span>
          </button>

          <div className="flex items-center gap-1 ml-1 text-xs">
            <span className="text-muted-foreground">Indent:</span>
            <select
              value={indent}
              onChange={(e) => {
                setIndent(e.target.value);
                formatJson(e.target.value);
              }}
              className="px-2 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none"
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="tab">Tab Indent</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload JSON</span>
            <input type="file" accept=".json,text/plain" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {/* Editor Box */}
      <div className="relative">
        <textarea
          rows={16}
          value={inputJson}
          onChange={(e) => {
            setInputJson(e.target.value);
            setError(null);
          }}
          placeholder="Paste or type raw JSON data here..."
          className="w-full p-4 font-mono text-xs sm:text-sm bg-card border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y leading-relaxed text-foreground"
          spellCheck={false}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Chars: {inputJson.length} | Lines: {inputJson.split("\n").length}</span>
        <button
          type="button"
          onClick={() => { setInputJson(""); setError(null); }}
          className="hover:text-foreground underline"
        >
          Clear Editor
        </button>
      </div>
    </div>
  );
}
