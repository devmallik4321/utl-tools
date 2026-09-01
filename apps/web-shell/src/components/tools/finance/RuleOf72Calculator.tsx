"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, Calendar, Copy, Check, Sparkles, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function RuleOf72Calculator() {
  const [interestRate, setInterestRate] = useState<number>(8.0);
  const [principal, setPrincipal] = useState<number>(10000);
  const [copied, setCopied] = useState<boolean>(false);

  // Rule of 72 approx vs Exact
  const rule72Years = interestRate > 0 ? 72 / interestRate : 0;
  const exactYears = interestRate > 0 ? Math.log(2) / Math.log(1 + interestRate / 100) : 0;
  const accuracyDelta = Math.abs(rule72Years - exactYears);

  // Milestone Doubling Projections
  const doublingMilestones = [
    { multiplier: "1x (Start)", amount: principal, years: 0 },
    { multiplier: "2x (1st Double)", amount: principal * 2, years: exactYears },
    { multiplier: "4x (2nd Double)", amount: principal * 4, years: exactYears * 2 },
    { multiplier: "8x (3rd Double)", amount: principal * 8, years: exactYears * 3 },
    { multiplier: "16x (4th Double)", amount: principal * 16, years: exactYears * 4 },
  ];

  const handleCopy = async () => {
    const summary = `Rule of 72 Investment Doubling Analysis\n• Annual Return Rate: ${interestRate}% APY\n• Starting Principal: $${principal.toLocaleString()}\n• Doubling Time (Rule of 72): ~${rule72Years.toFixed(1)} Years\n• Exact Compound Doubling Time: ${exactYears.toFixed(2)} Years\n• 10-Year Value: $${(principal * Math.pow(1 + interestRate / 100, 10)).toLocaleString()}\n• 20-Year Value: $${(principal * Math.pow(1 + interestRate / 100, 20)).toLocaleString()}\n• 30-Year Value: $${(principal * Math.pow(1 + interestRate / 100, 30)).toLocaleString()}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Expected Annual Return (% APY)
          </label>
          <input
            type="number"
            min={0.1}
            max={100}
            step="0.5"
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[11px] text-muted-foreground">e.g. S&amp;P 500 (~8–10%), Real Estate (~7%)</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Starting Investment Principal ($)
          </label>
          <input
            type="number"
            min={1}
            value={principal}
            onChange={(e) => setPrincipal(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Initial deposit amount</span>
        </div>
      </div>

      {/* Doubling Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Compound Money Doubling Timeline
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Years to Double (Rule of 72)</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ~{rule72Years.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Years</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Mental shortcut: 72 / {interestRate}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Exact Doubling Time</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {exactYears.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">Years</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Precise logarithmic compound formula</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Rule 72 Accuracy</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              99.{Math.max(0, Math.round((1 - accuracyDelta / exactYears) * 100))}%
            </p>
            <span className="text-[10px] text-muted-foreground">Variance: {(accuracyDelta * 12).toFixed(1)} months</span>
          </div>
        </div>

        {/* Milestone Table */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Future Doubling Milestones ($)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
            {doublingMilestones.map((m, idx) => (
              <div key={idx} className="p-3 bg-card rounded-lg border border-border space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-sans font-bold block">{m.multiplier}</span>
                <p className="text-foreground font-bold">${m.amount.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-sans">
                  {idx === 0 ? "Today" : `~${m.years.toFixed(1)} Years`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
