"use client";

import { useState } from "react";
import { Calculator, ArrowRight, Percent } from "lucide-react";

export function PercentageCalculator() {
  // Scenario 1: What is X% of Y?
  const [s1X, setS1X] = useState<number>(15);
  const [s1Y, setS1Y] = useState<number>(200);

  // Scenario 2: X is what percent of Y?
  const [s2X, setS2X] = useState<number>(45);
  const [s2Y, setS2Y] = useState<number>(150);

  // Scenario 3: % Change from X to Y
  const [s3X, setS3X] = useState<number>(80);
  const [s3Y, setS3Y] = useState<number>(120);

  // Scenario 4: Increase/Decrease X by Y%
  const [s4X, setS4X] = useState<number>(100);
  const [s4Y, setS4Y] = useState<number>(20);
  const [s4Type, setS4Type] = useState<"increase" | "decrease">("increase");

  // Calcs
  const s1Result = ((s1X / 100) * s1Y).toFixed(2);
  const s2Result = s2Y !== 0 ? (((s2X / s2Y) * 100).toFixed(2)) : "0.00";
  const s3Diff = s3Y - s3X;
  const s3Pct = s3X !== 0 ? (((s3Diff / s3X) * 100).toFixed(2)) : "0.00";
  const s4Result = s4Type === "increase"
    ? (s4X * (1 + s4Y / 100)).toFixed(2)
    : (s4X * (1 - s4Y / 100)).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scenario 1 */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            What is X% of Y?
          </span>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>What is</span>
            <input
              type="number"
              value={s1X}
              onChange={(e) => setS1X(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-background border border-border rounded-lg text-center font-mono font-bold"
            />
            <span>% of</span>
            <input
              type="number"
              value={s1Y}
              onChange={(e) => setS1Y(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 bg-background border border-border rounded-lg text-center font-mono font-bold"
            />
            <span>?</span>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">({s1X} / 100) &times; {s1Y}</span>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Result:</span>
              <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">{s1Result}</span>
            </div>
          </div>
        </div>

        {/* Scenario 2 */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            X is what percent of Y?
          </span>
          <div className="flex items-center gap-2 text-sm font-medium">
            <input
              type="number"
              value={s2X}
              onChange={(e) => setS2X(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-background border border-border rounded-lg text-center font-mono font-bold"
            />
            <span>is what % of</span>
            <input
              type="number"
              value={s2Y}
              onChange={(e) => setS2Y(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 bg-background border border-border rounded-lg text-center font-mono font-bold"
            />
            <span>?</span>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">({s2X} / {s2Y}) &times; 100</span>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Result:</span>
              <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">{s2Result}%</span>
            </div>
          </div>
        </div>

        {/* Scenario 3 */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Percentage Increase / Decrease
          </span>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>From</span>
            <input
              type="number"
              value={s3X}
              onChange={(e) => setS3X(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-background border border-border rounded-lg text-center font-mono font-bold"
            />
            <span>to</span>
            <input
              type="number"
              value={s3Y}
              onChange={(e) => setS3Y(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 bg-background border border-border rounded-lg text-center font-mono font-bold"
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {parseFloat(s3Pct) >= 0 ? "Increase" : "Decrease"} of {Math.abs(s3Diff)}
            </span>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Percentage Change:</span>
              <span className={`text-2xl font-black font-mono ${parseFloat(s3Pct) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {parseFloat(s3Pct) >= 0 ? `+${s3Pct}%` : `${s3Pct}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Scenario 4 */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Adjust Value by Percentage
          </span>
          <div className="flex items-center gap-2 text-sm font-medium">
            <select
              value={s4Type}
              onChange={(e) => setS4Type(e.target.value as any)}
              className="px-2 py-1 bg-background border border-border rounded-lg text-xs"
            >
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
            <input
              type="number"
              value={s4X}
              onChange={(e) => setS4X(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-background border border-border rounded-lg text-center font-mono font-bold"
            />
            <span>by</span>
            <input
              type="number"
              value={s4Y}
              onChange={(e) => setS4Y(parseFloat(e.target.value) || 0)}
              className="w-16 px-2 py-1 bg-background border border-border rounded-lg text-center font-mono font-bold"
            />
            <span>%</span>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              {s4X} {s4Type === "increase" ? "+" : "-"} {((s4X * s4Y) / 100).toFixed(2)}
            </span>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Final Amount:</span>
              <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">{s4Result}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
