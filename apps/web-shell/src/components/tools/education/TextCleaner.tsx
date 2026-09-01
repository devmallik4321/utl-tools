"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, RotateCcw, Sliders, FileText } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TEXT = `  Here is a   messy paragraph with <i>HTML formatting</i> &amp; extra spaces.   

It has   multiple blank lines...

“Smart quotes” and ‘single curly quotes’ along with em—dashes.

   Leading and trailing spaces on lines.  `;

export function TextCleaner() {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [stripBlankLines, setStripBlankLines] = useState<boolean>(true);
  const [collapseSpaces, setCollapseSpaces] = useState<boolean>(true);
  const [trimLines, setTrimLines] = useState<boolean>(true);
  const [stripHtml, setStripHtml] = useState<boolean>(true);
  const [normalizeQuotes, setNormalizeQuotes] = useState<boolean>(true);
  const [normalizeDashes, setNormalizeDashes] = useState<boolean>(true);
  const [casing, setCasing] = useState<"none" | "title" | "sentence" | "lower" | "upper">("none");
  const [copied, setCopied] = useState<boolean>(false);

  const cleanedText = useMemo(() => {
    let text = inputText;

    if (stripHtml) {
      text = text.replace(/<[^>]*>/g, "");
      text = text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
    }

    if (normalizeQuotes) {
      text = text.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
    }

    if (normalizeDashes) {
      text = text.replace(/[\u2013\u2014]/g, "-");
    }

    let lines = text.split("\n");

    if (trimLines) {
      lines = lines.map((l) => l.trim());
    }

    if (collapseSpaces) {
      lines = lines.map((l) => l.replace(/[ \t]+/g, " "));
    }

    if (stripBlankLines) {
      lines = lines.filter((l) => l.length > 0);
    }

    text = lines.join("\n");

    if (casing === "lower") {
      text = text.toLowerCase();
    } else if (casing === "upper") {
      text = text.toUpperCase();
    } else if (casing === "title") {
      text = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    } else if (casing === "sentence") {
      text = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    }

    return text;
  }, [inputText, stripBlankLines, collapseSpaces, trimLines, stripHtml, normalizeQuotes, normalizeDashes, casing]);

  const originalWords = inputText.trim().split(/\s+/).filter(Boolean).length;
  const cleanedWords = cleanedText.trim().split(/\s+/).filter(Boolean).length;

  const handleCopy = async () => {
    const ok = await copyToClipboard(cleanedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cleaning Filters Configuration */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Active Cleaning Operations
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={stripBlankLines}
              onChange={(e) => setStripBlankLines(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600"
            />
            <span>Strip Empty Lines</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={collapseSpaces}
              onChange={(e) => setCollapseSpaces(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600"
            />
            <span>Collapse Multi-Spaces</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={(e) => setTrimLines(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600"
            />
            <span>Trim Line Edges</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={stripHtml}
              onChange={(e) => setStripHtml(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600"
            />
            <span>Strip HTML Tags</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={normalizeQuotes}
              onChange={(e) => setNormalizeQuotes(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600"
            />
            <span>Straighten Quotes</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={normalizeDashes}
              onChange={(e) => setNormalizeDashes(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600"
            />
            <span>Normalize Dashes</span>
          </label>

          <div className="col-span-2 flex items-center gap-2">
            <span className="text-muted-foreground whitespace-nowrap">Case:</span>
            <select
              value={casing}
              onChange={(e) => setCasing(e.target.value as any)}
              className="px-2 py-1 bg-background border border-border rounded-md text-xs font-semibold"
            >
              <option value="none">Preserve Original Casing</option>
              <option value="sentence">Sentence case</option>
              <option value="title">Title Case</option>
              <option value="lower">lowercase</option>
              <option value="upper">UPPERCASE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Input / Output Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="font-semibold uppercase text-foreground">Raw Input Text</span>
            <span>{originalWords} Words | {inputText.length} Chars</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            placeholder="Paste text here to clean..."
            className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">Cleaned Output</span>
            <button
              onClick={handleCopy}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Cleaned"}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={cleanedText}
            rows={8}
            className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none select-all"
          />
        </div>
      </div>
    </div>
  );
}
