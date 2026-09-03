"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, AlertCircle, CheckCircle2, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_PATH_A = "M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80";
const SAMPLE_PATH_B = "M 10 80 C 40 150, 65 150, 95 80 S 150 10, 180 80";

export function SvgPathMorpher() {
  const [pathA, setPathA] = useState<string>(SAMPLE_PATH_A);
  const [pathB, setPathB] = useState<string>(SAMPLE_PATH_B);
  const [animationDuration, setAnimationDuration] = useState<number>(2.0); // seconds
  const [copied, setCopied] = useState<boolean>(false);

  const {
    countsA,
    countsB,
    isCompatible,
    totalCommandsA,
    totalCommandsB,
    cssKeyframes,
  } = useMemo(() => {
    const parseCommands = (d: string) => {
      const matches = d.match(/[MLHVCSQTAZmlhvcsqtaz]/g) || [];
      const freq: Record<string, number> = {};
      matches.forEach((c) => {
        const upper = c.toUpperCase();
        freq[upper] = (freq[upper] || 0) + 1;
      });
      return { matches, freq, total: matches.length };
    };

    const parsedA = parseCommands(pathA);
    const parsedB = parseCommands(pathB);

    // Strict compatibility: same total command count and matching command sequence
    let compatible = parsedA.matches.length > 0 && parsedA.matches.length === parsedB.matches.length;
    if (compatible) {
      for (let i = 0; i < parsedA.matches.length; i++) {
        if (parsedA.matches[i].toUpperCase() !== parsedB.matches[i].toUpperCase()) {
          compatible = false;
          break;
        }
      }
    }

    const css = `/* Pure CSS SVG Path Morph Animation */
@keyframes pathMorph {
  0%, 100% {
    d: path("${pathA.trim()}");
  }
  50% {
    d: path("${pathB.trim()}");
  }
}

.morphing-path {
  animation: pathMorph ${animationDuration}s ease-in-out infinite;
  fill: none;
  stroke: #3b82f6;
  stroke-width: 4;
  stroke-linecap: round;
}`;

    return {
      countsA: parsedA.freq,
      countsB: parsedB.freq,
      isCompatible: compatible,
      totalCommandsA: parsedA.total,
      totalCommandsB: parsedB.total,
      cssKeyframes: css,
    };
  }, [pathA, pathB, animationDuration]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(cssKeyframes);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Path Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <label className="font-semibold uppercase text-foreground">Start Path (d)</label>
            <span className="font-mono">{totalCommandsA} commands</span>
          </div>
          <textarea
            value={pathA}
            onChange={(e) => setPathA(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <label className="font-semibold uppercase text-foreground">End Morph Path (d)</label>
            <span className="font-mono">{totalCommandsB} commands</span>
          </div>
          <textarea
            value={pathB}
            onChange={(e) => setPathB(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Compatibility Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isCompatible
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
        }`}
      >
        <div className="flex items-center gap-2.5 text-xs font-bold">
          {isCompatible ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>
            {isCompatible
              ? "Morphing Compatible: Paths share identical command sequence and segment counts."
              : "Command Mismatch: Morphing requires identical command counts for smooth interpolation."}
          </span>
        </div>
        <span className="font-mono text-xs">
          A: {totalCommandsA} vs B: {totalCommandsB}
        </span>
      </div>

      {/* Generated CSS Keyframes */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            CSS @keyframes Path Morphing Rules
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy CSS"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {cssKeyframes}
        </pre>
      </div>
    </div>
  );
}
