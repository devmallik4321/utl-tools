"use client";

import { useState, useMemo } from "react";
import { PieChart, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Compass } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function TargetDateFundCalculator() {
  const [currentAge, setCurrentAge] = useState<number>(32);
  const [retireAge, setRetireAge] = useState<number>(65);
  const [portfolioValue, setPortfolioValue] = useState<number>(85000);
  const [copied, setCopied] = useState<boolean>(false);

  const { targetFundYear, yearsToRetire, usStocksPct, intlStocksPct, bondsPct, cashPct } = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yToRetire = Math.max(0, retireAge - currentAge);
    const exactRetireYear = currentYear + yToRetire;
    // Round to nearest 5-year increment for standard Target Date Funds (e.g. 2055, 2060)
    const fundYear = Math.round(exactRetireYear / 5) * 5;

    // Standard Vanguard/Fidelity glide path formula:
    // > 25 years away: 90% Equities (54% US, 36% Intl), 10% Bonds
    // 15 years away: 80% Equities (48% US, 32% Intl), 20% Bonds
    // 5 years away: 60% Equities (36% US, 24% Intl), 40% Bonds
    // At retirement: 50% Equities (30% US, 20% Intl), 50% Bonds/Cash
    let equityPct = 90;
    if (yToRetire <= 0) {
      equityPct = 30;
    } else if (yToRetire <= 5) {
      equityPct = 50;
    } else if (yToRetire <= 10) {
      equityPct = 65;
    } else if (yToRetire <= 20) {
      equityPct = 78;
    } else {
      equityPct = 90;
    }

    const fixedIncomePct = 100 - equityPct;
    const usStock = Math.round(equityPct * 0.6);
    const intlStock = equityPct - usStock;
    const bonds = Math.round(fixedIncomePct * 0.85);
    const cash = fixedIncomePct - bonds;

    return {
      targetFundYear: fundYear,
      yearsToRetire: yToRetire,
      usStocksPct: usStock,
      intlStocksPct: intlStock,
      bondsPct: bonds,
      cashPct: cash,
    };
  }, [currentAge, retireAge]);

  const totalEquity = usStocksPct + intlStocksPct;
  const totalFixed = bondsPct + cashPct;

  const handleCopy = async () => {
    const summary = `Target Date Retirement Fund Allocation (Target ${targetFundYear} Fund - ${yearsToRetire} Years to Retire):\n• Total Stocks/Equities: ${totalEquity}% ($${((portfolioValue * totalEquity) / 100).toLocaleString()})\n  - US Equities: ${usStocksPct}%\n  - International Equities: ${intlStocksPct}%\n• Total Bonds/Cash: ${totalFixed}% ($${((portfolioValue * totalFixed) / 100).toLocaleString()})\n  - Bonds: ${bondsPct}%\n  - Short-Term Cash: ${cashPct}%`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current / Target Retirement Age
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={18}
              max={80}
              value={currentAge}
              onChange={(e) => setCurrentAge(parseInt(e.target.value) || 30)}
              className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
            />
            <input
              type="number"
              min={currentAge + 1}
              max={95}
              value={retireAge}
              onChange={(e) => setRetireAge(parseInt(e.target.value) || 65)}
              className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{yearsToRetire} years until retirement</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Portfolio Balance ($)
          </label>
          <input
            type="number"
            min={0}
            step={5000}
            value={portfolioValue}
            onChange={(e) => setPortfolioValue(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2 flex flex-col justify-center">
          <span className="text-[10px] text-muted-foreground uppercase font-sans">Recommended Fund</span>
          <span className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
            Target {targetFundYear}
          </span>
          <span className="text-[10px] text-muted-foreground">Institutional Vanguard / Fidelity fund</span>
        </div>
      </div>

      {/* Allocation Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-500" />
            Glide Path Asset Allocation (Target {targetFundYear})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Allocation"}</span>
          </button>
        </div>

        {/* Visual Allocation Bar */}
        <div className="space-y-1.5">
          <div className="h-6 w-full rounded-xl overflow-hidden flex font-mono text-[11px] font-bold text-white shadow-inner">
            <div style={{ width: `${usStocksPct}%` }} className="bg-blue-600 flex items-center justify-center">
              US {usStocksPct}%
            </div>
            <div style={{ width: `${intlStocksPct}%` }} className="bg-indigo-500 flex items-center justify-center">
              Intl {intlStocksPct}%
            </div>
            <div style={{ width: `${bondsPct}%` }} className="bg-emerald-500 flex items-center justify-center">
              Bonds {bondsPct}%
            </div>
            <div style={{ width: `${cashPct}%` }} className="bg-amber-500 flex items-center justify-center">
              {cashPct}%
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Total Equities: {totalEquity}%</span>
            <span>Fixed Income &amp; Cash: {totalFixed}%</span>
          </div>
        </div>

        {/* Grid Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">US Equities</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{usStocksPct}%</p>
            <span className="text-xs text-foreground font-sans">
              ${((portfolioValue * usStocksPct) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Intl Equities</span>
            <p className="text-2xl font-bold text-indigo-500">{intlStocksPct}%</p>
            <span className="text-xs text-foreground font-sans">
              ${((portfolioValue * intlStocksPct) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Fixed Income / Bonds</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{bondsPct}%</p>
            <span className="text-xs text-foreground font-sans">
              ${((portfolioValue * bondsPct) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Cash / Reserves</span>
            <p className="text-2xl font-bold text-amber-500">{cashPct}%</p>
            <span className="text-xs text-foreground font-sans">
              ${((portfolioValue * cashPct) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
