"use client";

import { useState, useMemo } from "react";
import { Link2, Copy, Check, Sparkles, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TITLE = "How to Build a Next.js 14 Web App in 2026: Fast, Private & Scalable!";

export function SlugGenerator() {
  const [inputText, setInputText] = useState<string>(SAMPLE_TITLE);
  const [separator, setSeparator] = useState<string>("-");
  const [removeStopWords, setRemoveStopWords] = useState<boolean>(false);
  const [preserveCase, setPreserveCase] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const STOP_WORDS = new Set(["a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "of", "with", "by", "is", "it"]);

  const generatedSlug = useMemo(() => {
    if (!inputText.trim()) return "";

    // Normalize accents/diacritics (e.g. café -> cafe)
    let text = inputText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Split words
    let words = text
      .replace(/[^\w\s-]/g, "") // Remove punctuation & symbols
      .trim()
      .split(/[\s_-]+/);

    if (!preserveCase) {
      words = words.map((w) => w.toLowerCase());
    }

    if (removeStopWords) {
      words = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
    }

    return words.join(separator);
  }, [inputText, separator, removeStopWords, preserveCase]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(generatedSlug);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Article Title / Heading / Product Name
        </label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter title to convert into clean URL slug..."
          className="w-full px-4 py-2.5 text-base sm:text-lg bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        />
      </div>

      {/* Configuration Options */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Slug Formatting Options
        </label>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Separator:</span>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="px-2.5 py-1 bg-background border border-border rounded-md font-mono"
            >
              <option value="-">Hyphen (kebab-case)</option>
              <option value="_">Underscore (snake_case)</option>
              <option value="/">Slash (path/slug)</option>
              <option value=".">Dot (domain.slug)</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={removeStopWords}
              onChange={(e) => setRemoveStopWords(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>Remove Stop Words (a, the, in, of)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={preserveCase}
              onChange={(e) => setPreserveCase(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>Preserve Uppercase Letters</span>
          </label>
        </div>
      </div>

      {/* Generated Slug Result */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-emerald-500" />
            Clean SEO URL Slug
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Slug"}</span>
          </button>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border flex items-center justify-between gap-3">
          <p className="text-base sm:text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all select-all">
            {generatedSlug || "your-clean-slug-here"}
          </p>
        </div>

        <div className="p-3 bg-background rounded-lg border border-border text-xs text-muted-foreground font-mono">
          <span className="text-foreground font-bold">Sample Live URL:</span> https://example.com/blog/{generatedSlug || "your-slug"}
        </div>
      </div>
    </div>
  );
}
