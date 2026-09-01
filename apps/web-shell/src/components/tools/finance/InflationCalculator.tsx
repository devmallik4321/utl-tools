"use client";

import { useState } from "react";
import { TrendingDown, DollarSign, Calendar, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function InflationCalculator() {
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [inflationRate, setInflationRate] = useState<number>(3.2); // Average annual inflation %
  const [years, setYears] = useState<number>(15);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  // Future Cost = Amount * (1 + rate)^years
  const multiplier = Math.pow(1 + inflationRate / 100, years);
  const futureCost = initialAmount * multiplier;
  const cumulativeInflation = (multiplier - 1) * 100;

  // Real purchasing power of initial amount in future = initial / (1 + rate)^years
  const futurePurchasingPower = initialAmount / multiplier;
  const purchasingPowerLossPct = (1 - 1 / multiplier) * 100;

  const handleCopy = async () => {
    const summary = `Inflation & Purchasing Power Projection\n• Initial Amount: $${initialAmount.toLocaleString()}\n• Time Horizon: ${years} Years @ ${inflationRate}% Annual Inflation\n• Equivalent Future Cost: $${futureCost.toFixed(2)} (+${cumulativeInflation.toFixed(1)}% Cumulative Inflation)\n• Real Purchasing Power of $${initialAmount.toLocaleString()}: $${futurePurchasingPower.toFixed(2)} (-${purchasingPowerLossPct.toFixed(1)}% loss in purchasing power)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Initial Amount ($)
          </label>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Today's money value</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Annual Inflation Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={inflationRate}
            onChange={(e) => setInflationRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Historical average ~3.0% - 3.5%</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Time Horizon (Years)
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={years}
            onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">{years} years into the future</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Projected Inflation &amp; Purchasing Power Loss
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Projection"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Equivalent Future Cost</span>
            <p className="text-3xl font-extrabold font-mono text-foreground">
              ${futureCost.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">What will cost ${initialAmount.toLocaleString()} today</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Future Purchasing Power</span>
            <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              ${futurePurchasingPower.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Real value of today's cash in {years} yrs</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Cumulative Inflation</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              +{cumulativeInflation.toFixed(1)}%
            </p>
            <span className="text-[10px] text-muted-foreground">Total price increase over period</span>
          </div>
        </div>

        {/* Milestone Decade Comparison Table */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Multi-Decade Inflation Milestones:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {[5, 10, 20, 30].map((yr) => {
              const fCost = initialAmount * Math.pow(1 + inflationRate / 100, yr);
              const pPower = initialAmount / Math.pow(1 + inflationRate / 100, yr);
              return (
                <div key={yr} className="p-2.5 bg-card rounded-lg border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-bold font-sans">{yr} YEARS</span>
                  <p className="text-foreground font-bold">${fCost.toFixed(0)} <span className="text-[10px] font-normal text-muted-foreground">Cost</span></p>
                  <p className="text-rose-500 text-[11px]">${pPower.toFixed(0)} <span className="text-[10px] text-muted-foreground">Power</span></p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
