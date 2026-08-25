"use client";

import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function UrlEncoder() {
  const [inputUrl, setInputUrl] = useState<string>("https://utl.tools/search?q=free online utilities & filter=all");
  const [mode, setMode] = useState<"component" | "full">("component");
  const [copied, setCopied] = useState<boolean>(false);

  const getEncoded = () => {
    if (!inputUrl) return "";
    try {
      return mode === "component" ? encodeURIComponent(inputUrl) : encodeURI(inputUrl);
    } catch {
      return "Encoding error";
    }
  };

  const encodedResult = getEncoded();

  const handleCopy = async () => {
    const ok = await copyToClipboard(encodedResult);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs sm:text-sm text-foreground cursor-pointer select-none">
            <input
              type="radio"
              name="mode"
              checked={mode === "component"}
              onChange={() => setMode("component")}
              className="text-blue-600"
            />
            <span className="font-medium">Encode URI Component (Encodes ?, &, /, :)</span>
          </label>

          <label className="flex items-center gap-2 text-xs sm:text-sm text-foreground cursor-pointer select-none">
            <input
              type="radio"
              name="mode"
              checked={mode === "full"}
              onChange={() => setMode("full")}
              className="text-blue-600"
            />
            <span className="font-medium">Full URL Mode (Preserves standard URL structure)</span>
          </label>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Raw Input URL or Parameter
          </span>
          <textarea
            rows={8}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter raw URL or text to encode..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Percent-Encoded URL Result
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <textarea
            rows={8}
            readOnly
            value={encodedResult}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all break-all"
          />
        </div>
      </div>
    </div>
  );
}
