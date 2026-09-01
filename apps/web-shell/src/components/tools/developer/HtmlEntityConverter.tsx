"use client";

import { useState, useMemo } from "react";
import { Code, Copy, Check, Sparkles, ArrowRightLeft } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_HTML = `<div class="hero-container" id="main">
  <h1>Welcome to UTL.tools & Friends!</h1>
  <p>Price: €49.99 & special discount: 15% off.</p>
  <!-- Copyright © 2026 -->
</div>`;

const COMMON_ENTITIES = [
  { char: "&", entity: "&amp;", desc: "Ampersand" },
  { char: "<", entity: "&lt;", desc: "Less Than" },
  { char: ">", entity: "&gt;", desc: "Greater Than" },
  { char: '"', entity: "&quot;", desc: "Double Quote" },
  { char: "'", entity: "&#39;", desc: "Single Quote" },
  { char: "©", entity: "&copy;", desc: "Copyright" },
  { char: "®", entity: "&reg;", desc: "Registered Trademark" },
  { char: "™", entity: "&trade;", desc: "Trademark" },
  { char: "€", entity: "&euro;", desc: "Euro Currency" },
  { char: "£", entity: "&pound;", desc: "Pound Sterling" },
  { char: "—", entity: "&mdash;", desc: "Em Dash" },
  { char: " ", entity: "&nbsp;", desc: "Non-Breaking Space" },
];

export function HtmlEntityConverter() {
  const [inputText, setInputText] = useState<string>(SAMPLE_HTML);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedEntity, setCopiedEntity] = useState<string | null>(null);

  const convertedText = useMemo(() => {
    if (!inputText) return "";

    if (mode === "encode") {
      return inputText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/©/g, "&copy;")
        .replace(/®/g, "&reg;")
        .replace(/™/g, "&trade;")
        .replace(/€/g, "&euro;")
        .replace(/£/g, "&pound;")
        .replace(/—/g, "&mdash;");
    } else {
      let text = inputText;
      const parser = typeof DOMParser !== "undefined" ? new DOMParser() : null;
      if (parser) {
        try {
          const doc = parser.parseFromString(text, "text/html");
          return doc.documentElement.textContent || text;
        } catch {
          // fallback regex decode
        }
      }
      return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&copy;/g, "©")
        .replace(/&reg;/g, "®")
        .replace(/&trade;/g, "™")
        .replace(/&euro;/g, "€")
        .replace(/&pound;/g, "£")
        .replace(/&mdash;/g, "—")
        .replace(/&nbsp;/g, " ");
    }
  }, [inputText, mode]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(convertedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyEntity = async (entity: string) => {
    const ok = await copyToClipboard(entity);
    if (ok) {
      setCopiedEntity(entity);
      setTimeout(() => setCopiedEntity(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-muted/50 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setMode("encode")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            mode === "encode" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground"
          }`}
        >
          Encode HTML Special Characters (Text ➔ &amp;lt;div&amp;gt;)
        </button>
        <button
          type="button"
          onClick={() => setMode("decode")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            mode === "decode" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground"
          }`}
        >
          Decode HTML Entities (&amp;lt;div&amp;gt; ➔ Text)
        </button>
      </div>

      {/* Input / Output Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="font-semibold uppercase text-foreground">
              {mode === "encode" ? "Raw Text / HTML Code" : "HTML Entities to Decode"}
            </span>
            <span>{inputText.length} Chars</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            placeholder={mode === "encode" ? "Paste raw HTML or special characters..." : "Paste &lt;div&gt; entities..."}
            className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              {mode === "encode" ? "Encoded HTML Entities" : "Decoded Plain Text"}
            </span>
            <button
              onClick={handleCopy}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Result"}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={convertedText}
            rows={8}
            className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none select-all"
          />
        </div>
      </div>

      {/* Quick Reference Entity Matrix */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Code className="w-4 h-4 text-blue-500" />
          Quick Reference: Common HTML Entities
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
          {COMMON_ENTITIES.map((e) => (
            <div
              key={e.entity}
              onClick={() => handleCopyEntity(e.entity)}
              className="p-2.5 bg-card rounded-lg border border-border hover:border-blue-500 transition-colors cursor-pointer space-y-1 group shadow-2xs"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-base text-foreground font-mono">{e.char}</span>
                <span className="text-muted-foreground group-hover:text-blue-600 transition-colors">
                  {copiedEntity === e.entity ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </span>
              </div>
              <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{e.entity}</p>
              <span className="text-[10px] text-muted-foreground block truncate">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
