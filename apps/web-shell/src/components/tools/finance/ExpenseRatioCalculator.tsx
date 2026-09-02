"use client";

import { useState, useMemo } from "react";
import { TrendingDown, DollarSign, Calendar, Copy, Check, Sparkles, Scale } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function ExpenseRatioCalculator() {
  const [principal, setPrincipal] = useState<number>(50000);
  const [annualReturn, setAnnualReturn] = useState<number>(8.0);
  const [years, setYears] = useState<number>(30);
  const [feeA, setFeeA] = useState<number>(0.03); // 0.03% low-cost index ETF
  const [feeB, setFeeB] = useState<number>(0.75); // 0.75% active mutual fund
  const [copied, setCopied] = useState<boolean>(false);

  const netRateA = (annualReturn - feeA) / 100;
  const netRateB = (annualReturn - feeB) / 100;

  const endingBalA = principal * Math.pow(1 + netRateA, years);
  const endingBalB = principal * Math.pow(1 + netRateB, years);
  const feeCostDifference = Math.max(0, endingBalA - endingBalB);
  const feePercentLoss = endingBalA > 0 ? (feeCostDifference / endingBalA) * 100 : 0;

  const milestones = [10, 20, 30, 40].filter((y) => y <= Math.max(years, 40)).map((y) => {
    const balA = principal * Math.pow(1 + netRateA, y);
    const balB = principal * Math.pow(1 + netRateB, y);
    return {
      year: y,
      balA,
      balB,
      feeCost: balA - balB,
    };
  });

  const handleCopy = async () => {
    const summary = `Investment Expense Ratio Impact Analysis\n• Starting Principal: $${principal.toLocaleString()} @ ${annualReturn}% annual gross return (${years} Years)\n• Fund A (${feeA}% fee): $${endingBalA.toFixed(0)} ending balance\n• Fund B (${feeB}% fee): $${endingBalB.toFixed(0)} ending balance\n• Lifetime Wealth Lost to Fees: $${feeCostDifference.toFixed(0)} (${feePercentLoss.toFixed(1)}% of total portfolio)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters Input */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Initial Principal ($)
          </label>
          <input
            type="number"
            min={1}
            value={principal}
            onChange={(e) => setPrincipal(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Gross Market Return (%/yr)
          </label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Time Horizon (Years)
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={years}
            onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>
      </div>

      {/* Fund Fee Comparison Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border-2 border-emerald-500/30 rounded-xl space-y-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Low-Cost Fund A (e.g. Index ETF)
          </span>
          <label className="text-[11px] text-muted-foreground block">Annual Expense Ratio (%)</label>
          <input
            type="number"
            min={0}
            max={5}
            step="0.01"
            value={feeA}
            onChange={(e) => setFeeA(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-4 bg-card border-2 border-rose-500/30 rounded-xl space-y-2">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
            Higher-Fee Fund B (e.g. Active Mutual Fund)
          </span>
          <label className="text-[11px] text-muted-foreground block">Annual Expense Ratio (%)</label>
          <input
            type="number"
            min={0}
            max={5}
            step="0.05"
            value={feeB}
            onChange={(e) => setFeeB(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg"
          />
        </div>
      </div>

      {/* Fee Impact Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Lifetime Wealth Lost to Management Fees
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
            <span className="text-xs font-semibold text-muted-foreground uppercase">Lost Wealth to Fees</span>
            <p className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              ${feeCostDifference.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {feePercentLoss.toFixed(1)}% of potential wealth consumed
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Fund A Balance ({feeA}%)</span>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${endingBalA.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">After {years} years of compound returns</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Fund B Balance ({feeB}%)</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${endingBalB.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Reduced by ongoing annual drag</span>
          </div>
        </div>

        {/* Milestone Schedule */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Fee Loss Over Time ($)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {milestones.map((m) => (
              <div key={m.year} className="p-3 bg-card rounded-lg border border-border space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-sans font-bold block">{m.year} YEARS</span>
                <p className="text-foreground font-bold">Fund A: ${m.balA.toFixed(0)}</p>
                <p className="text-muted-foreground">Fund B: ${m.balB.toFixed(0)}</p>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-sans">
                  Fees Lost: -${m.feeCost.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
