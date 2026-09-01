"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, Calendar, Copy, Check, BarChart, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CagrCalculator() {
  const [initialValue, setInitialValue] = useState<number>(10000);
  const [finalValue, setFinalValue] = useState<number>(25000);
  const [years, setYears] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);

  // CAGR = (End / Start)^(1 / Years) - 1
  let cagrPct = 0;
  if (initialValue > 0 && finalValue > 0 && years > 0) {
    cagrPct = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
  }

  const totalGain = finalValue - initialValue;
  const totalGrowthPct = initialValue > 0 ? (totalGain / initialValue) * 100 : 0;

  // Yearly compounding progression
  const schedule: { year: number; value: number; gain: number }[] = [];
  if (initialValue > 0 && years > 0 && years <= 30) {
    const rate = cagrPct / 100;
    for (let y = 1; y <= Math.min(30, Math.floor(years)); y++) {
      const val = initialValue * Math.pow(1 + rate, y);
      schedule.push({ year: y, value: val, gain: val - initialValue });
    }
  }

  const handleCopy = async () => {
    const summary = `CAGR Growth Analysis\n• Initial Value: $${initialValue.toLocaleString()}\n• Final Value: $${finalValue.toLocaleString()} (${years} Years)\n• Total Gain: $${totalGain.toLocaleString()} (+${totalGrowthPct.toFixed(1)}%)\n• Compound Annual Growth Rate (CAGR): ${cagrPct.toFixed(2)}% per year`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Beginning / Initial Value ($)
          </label>
          <input
            type="number"
            min={1}
            value={initialValue}
            onChange={(e) => setInitialValue(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Starting revenue, portfolio, or metric</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Ending / Final Value ($)
          </label>
          <input
            type="number"
            min={1}
            value={finalValue}
            onChange={(e) => setFinalValue(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Final value at period end</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Number of Periods (Years)
          </label>
          <input
            type="number"
            min={0.1}
            step="0.5"
            value={years}
            onChange={(e) => setYears(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Time elapsed in years</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Compound Annual Growth Rate (CAGR)
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
            <span className="text-xs font-semibold text-muted-foreground uppercase">Compound Annual Rate</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {cagrPct.toFixed(2)}%<span className="text-xs font-normal text-muted-foreground"> / year</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Smoothed annual compounding rate</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Absolute Gain</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${totalGain.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Total money accumulated</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Cumulative Growth</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              +{totalGrowthPct.toFixed(1)}%
            </p>
            <span className="text-[10px] text-muted-foreground">Overall return across {years} years</span>
          </div>
        </div>

        {/* Annual Compounding Progression Schedule */}
        {schedule.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Year-by-Year Compound Trajectory:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
              {schedule.map((row) => (
                <div key={row.year} className="p-2.5 bg-card rounded-lg border border-border space-y-0.5">
                  <span className="text-[10px] text-muted-foreground font-sans font-bold block">YEAR {row.year}</span>
                  <p className="text-foreground font-bold">${row.value.toFixed(0)}</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">+${row.gain.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
