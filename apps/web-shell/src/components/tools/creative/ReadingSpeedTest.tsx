"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Play, CheckCircle2, RotateCcw, Copy, Check, Sparkles, Award } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TEXT = `The rapid advancement of web technologies and client-side computing has transformed modern productivity. By processing data locally in the browser using WebAssembly, Web Crypto, and modern JavaScript engines, applications achieve near-instant execution speed without the latency and privacy vulnerabilities of round-trip network requests. This zero-knowledge architectural pattern ensures that sensitive personal credentials, financial calculations, and proprietary code never leave the user's local device, providing a fundamentally secure foundation for digital utility workflows.`;

export function ReadingSpeedTest() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [status, setStatus] = useState<"idle" | "reading" | "completed">("idle");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (status === "reading") {
      const start = Date.now();
      setStartTime(start);
      timerRef.current = setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleStart = () => {
    setStatus("reading");
    setElapsedSec(0);
  };

  const handleFinish = () => {
    if (status !== "reading" || !startTime) return;
    const finalElapsedSec = Math.max(1, (Date.now() - startTime) / 1000);
    const calculatedWpm = Math.round((wordCount / (finalElapsedSec / 60)));
    setWpm(calculatedWpm);
    setStatus("completed");
  };

  const handleReset = () => {
    setStatus("idle");
    setElapsedSec(0);
    setWpm(0);
    setStartTime(null);
  };

  const getTier = (score: number) => {
    if (score < 150) return { label: "Careful / Analytical Reader", desc: "Focuses deeply on detail and comprehension" };
    if (score <= 250) return { label: "Average Adult Reader", desc: "Typical reading pace for news and articles" };
    if (score <= 350) return { label: "High-Speed Reader", desc: "Above-average speed with quick scanning capability" };
    return { label: "Elite Speed Reader", desc: "Fast visual chunking and high-velocity reading" };
  };

  const tier = getTier(wpm);

  const handleCopy = async () => {
    const summary = `Reading Speed Test Score\n• Speed: ${wpm} Words Per Minute (WPM)\n• Word Count: ${wordCount} words\n• Time Taken: ${elapsedSec} seconds\n• Level: ${tier.label} (${tier.desc})`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {status === "idle" && (
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Reading Timer</span>
            </button>
          )}

          {status === "reading" && (
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs animate-pulse transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>I Finished Reading!</span>
            </button>
          )}

          {status === "completed" && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span>Words: <strong className="text-foreground font-sans">{wordCount}</strong></span>
          <span>Elapsed: <strong className="text-blue-600 dark:text-blue-400">{elapsedSec}s</strong></span>
        </div>
      </div>

      {/* Reading Passage Pane */}
      <div className="p-6 bg-card border border-border rounded-xl space-y-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Reading Passage ({status === "reading" ? "Timer Active — Read at your normal pace" : "Click 'Start Reading Timer' above"})
        </span>
        <p className="text-sm sm:text-base leading-relaxed text-foreground select-text font-serif">
          {text}
        </p>
      </div>

      {/* Results View */}
      {status === "completed" && (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              Your Reading Speed Results
            </h4>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Score"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Reading Speed</span>
              <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {wpm} <span className="text-xs font-normal text-muted-foreground">WPM</span>
              </p>
              <span className="text-[10px] text-muted-foreground">Words Per Minute</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Proficiency Tier</span>
              <p className="text-base font-bold text-foreground truncate">
                {tier.label}
              </p>
              <span className="text-[10px] text-muted-foreground">{tier.desc}</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Reading Time</span>
              <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {elapsedSec} <span className="text-xs font-normal text-muted-foreground">Seconds</span>
              </p>
              <span className="text-[10px] text-muted-foreground">For {wordCount} total words</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
