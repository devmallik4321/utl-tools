"use client";

import { useState } from "react";
import { FileText, Clock, BarChart, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TEXT = `UTL.tools is a permanent digital toolbox built on simple principles: fast, reliable, client-side online utilities that solve real everyday problems.

Whether you need to format JSON data, generate a cryptographically strong password, calculate your compound interest investment growth, or look up your public IP address, UTL.tools gets it done without friction or paywalls.`;

export function WordCounter() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  const getStats = () => {
    const raw = text.trim();
    if (!raw) {
      return {
        words: 0,
        charsWithSpaces: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: "0 min",
        speakingTime: "0 min",
        topKeywords: [],
      };
    }

    const wordsArray = raw.split(/\s+/).filter(Boolean);
    const words = wordsArray.length;
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s+/g, "").length;
    const sentences = raw.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = raw.split(/\n\s*\n/).filter(Boolean).length || (words > 0 ? 1 : 0);

    const readingMinutes = Math.ceil(words / 225);
    const readingTime = readingMinutes <= 1 ? "< 1 min" : `${readingMinutes} mins`;

    const speakingMinutes = Math.ceil(words / 130);
    const speakingTime = speakingMinutes <= 1 ? "< 1 min" : `${speakingMinutes} mins`;

    // Keyword density (filtering out small stop words)
    const stopWords = new Set(["the", "and", "a", "an", "is", "in", "it", "of", "to", "or", "for", "on", "with", "that", "this", "your", "you"]);
    const freq: Record<string, number> = {};
    wordsArray.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (clean.length > 2 && !stopWords.has(clean)) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      words,
      charsWithSpaces,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      topKeywords,
    };
  };

  const stats = getStats();

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="p-4 bg-card border border-border rounded-xl space-y-0.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Words
          </span>
          <p className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
            {stats.words.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-0.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Chars (Total)
          </span>
          <p className="text-2xl font-black font-mono text-foreground">
            {stats.charsWithSpaces.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-0.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Chars (No Space)
          </span>
          <p className="text-2xl font-black font-mono text-foreground">
            {stats.charsNoSpaces.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-0.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Sentences
          </span>
          <p className="text-2xl font-black font-mono text-foreground">
            {stats.sentences}
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-0.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Reading Time
          </span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {stats.readingTime}
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-0.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Speaking Time
          </span>
          <p className="text-xl font-bold font-mono text-foreground">
            {stats.speakingTime}
          </p>
        </div>
      </div>

      {/* Editor Box */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Live Text Editor
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>
            <button
              type="button"
              onClick={() => setText("")}
              className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your content here..."
          className="w-full p-4 text-xs sm:text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y leading-relaxed"
        />
      </div>

      {/* Top Keywords */}
      {stats.topKeywords.length > 0 && (
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Top Keyword Frequencies
          </span>
          <div className="flex flex-wrap gap-2">
            {stats.topKeywords.map(([word, count]) => (
              <span
                key={word}
                className="px-3 py-1 bg-muted/60 text-foreground border border-border rounded-lg text-xs font-medium"
              >
                {word}: <strong className="font-mono text-blue-600 dark:text-blue-400">{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
