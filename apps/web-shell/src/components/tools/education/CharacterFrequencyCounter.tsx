"use client";

import { useState, useMemo } from "react";
import { BarChart3, FileText, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Programming and software engineering require clear thinking, continuous learning, and attention to detail.`;

export function CharacterFrequencyCounter() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  const stats = useMemo(() => {
    const totalChars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[.!?]+(?:\s|$)/g) || []).length || 1 : 0;

    // Character frequency map
    const letterCounts: Record<string, number> = {};
    let vowelsCount = 0;
    let consonantsCount = 0;
    let digitsCount = 0;
    let whitespaceCount = 0;
    let punctuationCount = 0;

    for (const char of text) {
      if (/\s/.test(char)) {
        whitespaceCount++;
      } else if (/[0-9]/.test(char)) {
        digitsCount++;
      } else if (/[a-zA-Z]/.test(char)) {
        const lower = char.toLowerCase();
        letterCounts[lower] = (letterCounts[lower] || 0) + 1;
        if (/[aeiou]/.test(lower)) vowelsCount++;
        else consonantsCount++;
      } else {
        punctuationCount++;
      }
    }

    const totalLetters = vowelsCount + consonantsCount;
    const sortedLetters = Object.entries(letterCounts)
      .map(([letter, count]) => ({
        letter: letter.toUpperCase(),
        count,
        pct: totalLetters > 0 ? (count / totalLetters) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalChars,
      charsNoSpaces,
      words,
      sentences,
      vowelsCount,
      consonantsCount,
      digitsCount,
      whitespaceCount,
      punctuationCount,
      totalLetters,
      sortedLetters,
    };
  }, [text]);

  const handleCopy = async () => {
    let summary = `Character & Lexical Analysis\n• Total Characters: ${stats.totalChars} (${stats.charsNoSpaces} without spaces)\n• Words: ${stats.words} • Sentences: ${stats.sentences}\n• Vowels: ${stats.vowelsCount} • Consonants: ${stats.consonantsCount}\n• Top 5 Letters: ${stats.sortedLetters.slice(0, 5).map((l) => `${l.letter} (${l.count})`).join(", ")}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Input Text to Analyze
          </label>
          <span className="text-xs font-mono text-muted-foreground">{text.length} chars</span>
        </div>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text to inspect letter frequencies..."
          className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-card rounded-xl border border-border space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Total Characters</span>
          <p className="text-2xl font-bold font-mono text-foreground">{stats.totalChars}</p>
          <span className="text-[10px] text-muted-foreground font-mono">{stats.charsNoSpaces} without spaces</span>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Words &amp; Sentences</span>
          <p className="text-2xl font-bold font-mono text-foreground">{stats.words}</p>
          <span className="text-[10px] text-muted-foreground font-mono">{stats.sentences} sentences</span>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Vowels vs Consonants</span>
          <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{stats.vowelsCount} / {stats.consonantsCount}</p>
          <span className="text-[10px] text-muted-foreground font-mono">{stats.totalLetters > 0 ? ((stats.vowelsCount / stats.totalLetters) * 100).toFixed(1) : "0"}% vowels</span>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Digits &amp; Symbols</span>
          <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">{stats.digitsCount + stats.punctuationCount}</p>
          <span className="text-[10px] text-muted-foreground font-mono">{stats.digitsCount} digits, {stats.punctuationCount} symbols</span>
        </div>
      </div>

      {/* Letter Frequency Visual Distribution */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Letter Frequency Distribution (Sorted by Count)
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Stats"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {stats.sortedLetters.slice(0, 18).map((item, idx) => (
            <div key={idx} className="p-2.5 bg-card rounded-lg border border-border space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold font-mono text-foreground text-sm">{item.letter}</span>
                <span className="text-muted-foreground font-mono">{item.count}×</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, item.pct * 4)}%` }}
                  className="bg-blue-600 h-full rounded-full"
                />
              </div>
              <span className="text-[9px] text-muted-foreground font-mono block text-right">{item.pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
