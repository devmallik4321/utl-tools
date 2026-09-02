"use client";

import { useState, useMemo } from "react";
import { Flame, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function FireCalculator() {
  const [annualExpenses, setAnnualExpenses] = useState<number>(55000);
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(120000);
  const [annualSavings, setAnnualSavings] = useState<number>(28000);
  const [swr, setSwr] = useState<number>(4.0); // 4.0% Safe Withdrawal Rate (25x)
  const [investmentReturn, setInvestmentReturn] = useState<number>(7.5);
  const [inflation, setInflation] = useState<number>(2.5);
  const [copied, setCopied] = useState<boolean>(false);

  const { fireNumber, leanFireNumber, fatFireNumber, yearsToFire, monthsToFire, realReturn } = useMemo(() => {
    const swrDecimal = swr / 100;
    const target = swrDecimal > 0 ? annualExpenses / swrDecimal : 0;
    const leanTarget = target * 0.75;
    const fatTarget = target * 1.4;

    const r = (investmentReturn - inflation) / 100; // Real inflation-adjusted annual return
    const monthlyR = r / 12;
    const monthlySave = annualSavings / 12;

    let months = 0;
    let balance = currentNetWorth;

    while (balance < target && months < 600) {
      balance = balance * (1 + monthlyR) + monthlySave;
      months++;
    }

    return {
      fireNumber: target,
      leanFireNumber: leanTarget,
      fatFireNumber: fatTarget,
      yearsToFire: (months / 12).toFixed(1),
      monthsToFire: months,
      realReturn: r * 100,
    };
  }, [annualExpenses, currentNetWorth, annualSavings, swr, investmentReturn, inflation]);

  const handleCopy = async () => {
    const summary = `FIRE (Financial Independence, Retire Early) Analysis\n• Annual Living Expenses: $${annualExpenses.toLocaleString()}/yr\n• Safe Withdrawal Rate: ${swr}% (${(100 / swr).toFixed(0)}x rule)\n• FIRE Target Number: $${fireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• LeanFIRE Target (75%): $${leanFireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• FatFIRE Target (140%): $${fatFireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Estimated Time to FIRE: ${yearsToFire} Years (~${monthsToFire} Months at $${(annualSavings / 12).toFixed(0)}/mo savings)`;
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
            Annual Expenses ($/yr)
          </label>
          <input
            type="number"
            min={1000}
            value={annualExpenses}
            onChange={(e) => setAnnualExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">~${(annualExpenses / 12).toFixed(0)} / month</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Invested Assets ($)
          </label>
          <input
            type="number"
            min={0}
            value={currentNetWorth}
            onChange={(e) => setCurrentNetWorth(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Liquid stocks, 401k, crypto</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Savings Added ($/yr)
          </label>
          <input
            type="number"
            min={0}
            value={annualSavings}
            onChange={(e) => setAnnualSavings(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">~${(annualSavings / 12).toFixed(0)} / month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Safe Withdrawal Rate (%)
          </label>
          <select
            value={swr}
            onChange={(e) => setSwr(parseFloat(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={4.0}>4.0% (Trinity Study 25x Rule)</option>
            <option value={3.5}>3.5% (Conservative 28.5x Rule)</option>
            <option value={3.0}>3.0% (Ultra-Safe 33.3x Rule)</option>
            <option value={4.5}>4.5% (Aggressive 22.2x Rule)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Expected Growth Return (%/yr)
          </label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={investmentReturn}
            onChange={(e) => setInvestmentReturn(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Expected Inflation (%/yr)
          </label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={inflation}
            onChange={(e) => setInflation(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg"
          />
        </div>
      </div>

      {/* FIRE Results Card */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            FIRE Freedom Number &amp; Horizon
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
            <span className="text-xs font-semibold text-muted-foreground uppercase">FIRE Target Number</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${fireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground">Portfolio required for {swr}% safe withdrawal</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Time to Independence</span>
            <p className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {yearsToFire} <span className="text-sm font-normal text-muted-foreground">Years</span>
            </p>
            <span className="text-[10px] text-muted-foreground">~{monthsToFire} Months of savings &amp; growth</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Real Net Growth Rate</span>
            <p className="text-2xl font-bold font-mono text-foreground">{realReturn.toFixed(1)}%</p>
            <span className="text-[10px] text-muted-foreground">Return minus inflation</span>
          </div>
        </div>

        {/* FIRE Tiers */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            FIRE Target Variations
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-card rounded-lg border border-border space-y-1">
              <span className="text-muted-foreground font-sans block">LeanFIRE (Frugal / 75%)</span>
              <p className="text-lg font-bold text-foreground">
                ${leanFireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-muted-foreground font-sans block">Essential budget baseline</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-1">
              <span className="text-muted-foreground font-sans block">Standard FIRE (100%)</span>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ${fireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-muted-foreground font-sans block">Maintain exact current lifestyle</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-1">
              <span className="text-muted-foreground font-sans block">FatFIRE (Luxury / 140%)</span>
              <p className="text-lg font-bold text-foreground">
                ${fatFireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-muted-foreground font-sans block">Generous travel &amp; luxury spend</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
