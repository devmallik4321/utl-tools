"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, Calendar, Copy, Check, PieChart } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function RoiCalculator() {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [finalValue, setFinalValue] = useState<number>(18500);
  const [holdingYears, setHoldingYears] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const netProfit = finalValue - initialInvestment;
  const totalRoiPct = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0;
  const multiple = initialInvestment > 0 ? finalValue / initialInvestment : 0;

  // Annualized ROI (CAGR) = (Final / Initial)^(1/Years) - 1
  let annualizedRoiPct = 0;
  if (initialInvestment > 0 && finalValue > 0 && holdingYears > 0) {
    annualizedRoiPct = (Math.pow(finalValue / initialInvestment, 1 / holdingYears) - 1) * 100;
  }

  const handleCopy = async () => {
    const summary = `Return on Investment (ROI) Summary\n• Initial Investment: $${initialInvestment.toLocaleString()}\n• Final Value: $${finalValue.toLocaleString()} (Holding: ${holdingYears} Years)\n• Net Profit: $${netProfit.toLocaleString()}\n• Total ROI: ${totalRoiPct.toFixed(1)}% (${multiple.toFixed(2)}x Multiple)\n• Annualized Return (CAGR): ${annualizedRoiPct.toFixed(2)}% per year`;
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
            Initial Investment ($)
          </label>
          <input
            type="number"
            min={1}
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Original capital invested</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Final Returned Value ($)
          </label>
          <input
            type="number"
            min={0}
            value={finalValue}
            onChange={(e) => setFinalValue(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Total money returned at exit</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Holding Period (Years)
          </label>
          <input
            type="number"
            min={0.1}
            step="0.5"
            value={holdingYears}
            onChange={(e) => setHoldingYears(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Investment duration</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            ROI &amp; Annualized Compound Return
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Net Profit</span>
            <p className={`text-2xl sm:text-3xl font-extrabold font-mono ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {netProfit >= 0 ? "+" : ""}${netProfit.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Total money gained/lost</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Return (ROI)</span>
            <p className={`text-2xl sm:text-3xl font-extrabold font-mono ${totalRoiPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {totalRoiPct >= 0 ? "+" : ""}{totalRoiPct.toFixed(1)}%
            </p>
            <span className="text-[10px] text-muted-foreground">Cumulative gain %</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Annualized (CAGR)</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {annualizedRoiPct.toFixed(2)}%
            </p>
            <span className="text-[10px] text-muted-foreground">Compound annual return</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Capital Multiple</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
              {multiple.toFixed(2)}x
            </p>
            <span className="text-[10px] text-muted-foreground">Every $1 turned into ${multiple.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
