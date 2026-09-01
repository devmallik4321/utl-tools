"use client";

import { useState } from "react";
import { BookOpen, Mic, Clock, FileText, BarChart, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TEXT = `Search engine optimization and digital product discovery rely on providing genuine value to users. When an individual searches for a tool or calculator, their intent is immediate: they want a frictionless solution that computes accurate answers in milliseconds without intrusive registration walls or misleading advertisements. By structuring web applications with clean semantic HTML, client-side execution, and clear contextual guidance, creators build trust and organic authority that compounds steadily over time.`;

export function ContentReadingTimeCalculator() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [readingWpm, setReadingWpm] = useState<number>(220); // Average silent reading speed
  const [speakingWpm, setSpeakingWpm] = useState<number>(130); // Average speaking / podcast speed
  const [copied, setCopied] = useState<boolean>(false);

  // Text metrics
  const cleanText = text.trim();
  const words = cleanText.length > 0 ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s+/g, "").length;
  const sentences = cleanText.length > 0 ? cleanText.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphs = cleanText.length > 0 ? cleanText.split(/\n+/).filter(Boolean).length : 0;

  // Time calculations
  const readingSecondsTotal = words > 0 ? Math.ceil((words / readingWpm) * 60) : 0;
  const readingMin = Math.floor(readingSecondsTotal / 60);
  const readingSec = readingSecondsTotal % 60;

  const speakingSecondsTotal = words > 0 ? Math.ceil((words / speakingWpm) * 60) : 0;
  const speakingMin = Math.floor(speakingSecondsTotal / 60);
  const speakingSec = speakingSecondsTotal % 60;

  const handleCopy = async () => {
    const summary = `Text & Reading Time Analysis\n• Words: ${words.toLocaleString()}\n• Reading Time (${readingWpm} WPM): ${readingMin}m ${readingSec}s\n• Speaking Time (${speakingWpm} WPM): ${speakingMin}m ${speakingSec}s\n• Characters: ${charsWithSpaces.toLocaleString()} (${charsNoSpaces.toLocaleString()} no spaces)\n• Sentences: ${sentences} | Paragraphs: ${paragraphs}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Paste Content / Speech / Script
          </label>
          <span className="text-xs text-muted-foreground font-mono">
            {words.toLocaleString()} words • {charsWithSpaces.toLocaleString()} chars
          </span>
        </div>
        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full p-3 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Speed Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/20 border border-border rounded-xl">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-foreground">Silent Reading Speed:</span>
            <span className="font-mono text-muted-foreground">{readingWpm} WPM</span>
          </div>
          <input
            type="range"
            min={100}
            max={400}
            step={10}
            value={readingWpm}
            onChange={(e) => setReadingWpm(parseInt(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-foreground">Speech / Voiceover Speed:</span>
            <span className="font-mono text-muted-foreground">{speakingWpm} WPM</span>
          </div>
          <input
            type="range"
            min={80}
            max={220}
            step={5}
            value={speakingWpm}
            onChange={(e) => setSpeakingWpm(parseInt(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
      </div>

      {/* Reading & Speech Time Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Silent Reading Time */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Silent Reading Time</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
            {readingMin}m {readingSec}s
          </p>
          <p className="text-[11px] text-muted-foreground">
            Estimated time for a typical reader ({readingWpm} WPM)
          </p>
        </div>

        {/* Speaking / Speech Time */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Speech / Presentation Time</span>
            <Mic className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {speakingMin}m {speakingSec}s
          </p>
          <p className="text-[11px] text-muted-foreground">
            Estimated spoken delivery / podcast voiceover ({speakingWpm} WPM)
          </p>
        </div>
      </div>

      {/* Detailed Statistics Table */}
      <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Document Metrics Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 bg-card rounded-lg border border-border">
            <span className="text-muted-foreground block text-[10px]">WORDS</span>
            <span className="text-sm font-bold text-foreground">{words.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-card rounded-lg border border-border">
            <span className="text-muted-foreground block text-[10px]">CHARACTERS</span>
            <span className="text-sm font-bold text-foreground">{charsWithSpaces.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-card rounded-lg border border-border">
            <span className="text-muted-foreground block text-[10px]">SENTENCES</span>
            <span className="text-sm font-bold text-foreground">{sentences}</span>
          </div>
          <div className="p-2.5 bg-card rounded-lg border border-border">
            <span className="text-muted-foreground block text-[10px]">PARAGRAPHS</span>
            <span className="text-sm font-bold text-foreground">{paragraphs}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
