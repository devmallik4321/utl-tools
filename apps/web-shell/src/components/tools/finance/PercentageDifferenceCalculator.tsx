"use client";

import { useState } from "react";
import { ArrowUpDown, Percent, TrendingUp, TrendingDown, HelpCircle, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function PercentageDifferenceCalculator() {
  const [val1, setVal1] = useState<string>("100");
  const [val2, setVal2] = useState<string>("125");
  const [copied, setCopied] = useState<boolean>(false);

  const num1 = parseFloat(val1);
  const num2 = parseFloat(val2);

  const isValid = !isNaN(num1) && !isNaN(num2);

  // 1. Percentage Difference (Symmetric: |V1 - V2| / ((V1 + V2) / 2) * 100)
  const avg = (num1 + num2) / 2;
  const absDiff = Math.abs(num1 - num2);
  const pctDiff = avg !== 0 ? (absDiff / Math.abs(avg)) * 100 : 0;

  // 2. Percentage Change (Directional: (V2 - V1) / |V1| * 100)
  const pctChange = num1 !== 0 ? ((num2 - num1) / Math.abs(num1)) * 100 : 0;
  const isIncrease = pctChange >= 0;

  // 3. Ratio
  const ratio = num2 !== 0 ? (num1 / num2).toFixed(2) : "0";

  const handleCopySummary = async () => {
    const summary = `Values: ${num1} and ${num2}\n• Percentage Difference: ${pctDiff.toFixed(2)}%\n• Percentage Change (${num1} → ${num2}): ${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}%\n• Absolute Difference: ${absDiff}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Value 1 */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Value 1 (Initial / Benchmark)
          </label>
          <input
            type="number"
            value={val1}
            onChange={(e) => setVal1(e.target.value)}
            className="w-full px-3 py-2.5 text-base font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 100"
          />
        </div>

        {/* Input Value 2 */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Value 2 (Final / Compared)
          </label>
          <input
            type="number"
            value={val2}
            onChange={(e) => setVal2(e.target.value)}
            className="w-full px-3 py-2.5 text-base font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 125"
          />
        </div>
      </div>

      {isValid && (
        <div className="space-y-4">
          {/* Key Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Percentage Difference */}
            <div className="p-5 bg-card border border-border rounded-xl space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Percentage Difference</span>
                <ArrowUpDown className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-extrabold text-foreground font-mono">
                {pctDiff.toFixed(2)}%
              </p>
              <p className="text-[11px] text-muted-foreground">
                Symmetric difference relative to average ({avg.toFixed(2)})
              </p>
            </div>

            {/* Percentage Change */}
            <div className="p-5 bg-card border border-border rounded-xl space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Percentage Change</span>
                {isIncrease ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <p className={`text-3xl font-extrabold font-mono ${isIncrease ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {isIncrease ? "+" : ""}{pctChange.toFixed(2)}%
              </p>
              <p className="text-[11px] text-muted-foreground">
                Directional change from {num1} to {num2} ({isIncrease ? "Increase" : "Decrease"})
              </p>
            </div>

            {/* Absolute Difference */}
            <div className="p-5 bg-card border border-border rounded-xl space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Absolute Difference</span>
                <Percent className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-3xl font-extrabold text-foreground font-mono">
                {absDiff.toFixed(2)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Direct difference: |{num1} - {num2}|
              </p>
            </div>
          </div>

          {/* Step-by-Step Mathematical Explanation */}
          <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Step-by-Step Calculation Formulas
              </h4>
              <button
                onClick={handleCopySummary}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Summary"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-muted-foreground">
              <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                <span className="font-semibold text-foreground block">Percentage Difference Formula:</span>
                <code>|V1 - V2| / ((V1 + V2) / 2) × 100</code>
                <p className="text-[11px] text-muted-foreground">
                  |{num1} - {num2}| / {avg.toFixed(2)} × 100 = <strong>{pctDiff.toFixed(2)}%</strong>
                </p>
              </div>

              <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                <span className="font-semibold text-foreground block">Percentage Change Formula:</span>
                <code>(V2 - V1) / |V1| × 100</code>
                <p className="text-[11px] text-muted-foreground">
                  ({num2} - {num1}) / {Math.abs(num1)} × 100 = <strong>{pctChange.toFixed(2)}%</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
