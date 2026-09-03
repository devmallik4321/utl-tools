"use client";

import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Calendar, TrendingDown, Copy, Check, Sparkles, Percent } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function InflationSalaryCalculator() {
  const [currentSalary, setCurrentSalary] = useState<number>(85000);
  const [years, setYears] = useState<number>(5);
  const [annualInflationRate, setAnnualInflationRate] = useState<number>(3.5);
  const [recentRaisePct, setRecentRaisePct] = useState<number>(3.0);
  const [copied, setCopied] = useState<boolean>(false);

  const { requiredFutureSalary, cumulativeInflationPct, purchasingPowerLoss, realWageChangePct } = useMemo(() => {
    const rate = annualInflationRate / 100;
    const compoundFactor = Math.pow(1 + rate, years);
    const futureSalary = currentSalary * compoundFactor;
    const totalInflation = (compoundFactor - 1) * 100;

    // Real wage change = ((1 + raise) / (1 + inflation) - 1) * 100
    const r = recentRaisePct / 100;
    const inf1yr = annualInflationRate / 100;
    const realWage = ((1 + r) / (1 + inf1yr) - 1) * 100;

    const lostPower = futureSalary - currentSalary;

    return {
      requiredFutureSalary: Math.round(futureSalary),
      cumulativeInflationPct: totalInflation.toFixed(1),
      purchasingPowerLoss: Math.round(lostPower),
      realWageChangePct: realWage.toFixed(2),
    };
  }, [currentSalary, years, annualInflationRate, recentRaisePct]);

  const handleCopy = async () => {
    const summary = `Inflation-Adjusted Salary Projection ($${currentSalary.toLocaleString()} Base over ${years} Years):\n• Target Future Salary to Maintain Lifestyle: $${requiredFutureSalary.toLocaleString()}/yr\n• Cumulative Inflation over ${years} Years: +${cumulativeInflationPct}%\n• Purchasing Power Gap: -$${purchasingPowerLoss.toLocaleString()}/yr if unadjusted\n• Current 1-Year Real Wage Adjustment (${recentRaisePct}% raise vs ${annualInflationRate}% inflation): ${realWageChangePct}%`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Salary ($/yr)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={currentSalary}
            onChange={(e) => setCurrentSalary(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Years in Future
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={years}
            onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Avg Annual Inflation (%)
          </label>
          <input
            type="number"
            min={0.5}
            step={0.25}
            value={annualInflationRate}
            onChange={(e) => setAnnualInflationRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Recent Raise Received (%)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={recentRaisePct}
            onChange={(e) => setRecentRaisePct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Purchasing Power Benchmark &amp; Future Salary Target
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Inflation Analysis"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Target Salary in {years} Yrs
            </span>
            <p className="text-3xl font-extrabold text-foreground">${requiredFutureSalary.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              To match today's standard of living
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Cumulative Inflation
            </span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">+{cumulativeInflationPct}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Total price level rise</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Purchasing Power Gap
            </span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              -${purchasingPowerLoss.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Loss if pay remains static</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Real Wage Growth</span>
            <p className={`text-2xl font-bold ${parseFloat(realWageChangePct) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {parseFloat(realWageChangePct) >= 0 ? `+${realWageChangePct}%` : `${realWageChangePct}%`}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">After subtracting 1-yr inflation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
