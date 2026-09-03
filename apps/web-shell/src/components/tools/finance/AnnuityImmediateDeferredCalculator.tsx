"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function AnnuityImmediateDeferredCalculator() {
  const [principal, setPrincipal] = useState<number>(250000);
  const [currentAge, setCurrentAge] = useState<number>(58);
  const [deferralYears, setDeferralYears] = useState<number>(7);
  const [mygaRate, setMygaRate] = useState<number>(5.35); // Fixed MYGA growth rate %
  const [immediatePayoutRate, setImmediatePayoutRate] = useState<number>(6.8); // % annualized SPIA
  const [deferredPayoutRate, setDeferredPayoutRate] = useState<number>(8.5); // Higher payout rate at older age
  const [copied, setCopied] = useState<boolean>(false);

  const {
    immediateMonthly,
    accumulatedValue,
    deferredMonthly,
    monthlyIncomeIncreasePct,
    crossoverYearsAfterStart,
  } = useMemo(() => {
    // SPIA Immediate monthly income
    const immAnnual = principal * (immediatePayoutRate / 100);
    const immMonthly = immAnnual / 12;

    // MYGA Deferred Compound Growth
    const fv = principal * Math.pow(1 + mygaRate / 100, deferralYears);

    // Future monthly income from annuitizing larger accumulated sum at older age
    const defAnnual = fv * (deferredPayoutRate / 100);
    const defMonthly = defAnnual / 12;

    const increasePct = ((defMonthly - immMonthly) / immMonthly) * 100;

    // Total income missed during deferral
    const missedIncome = immMonthly * (deferralYears * 12);
    // Extra income per month once deferred starts
    const monthlyAdvantage = defMonthly - immMonthly;
    const breakEvenMonths = monthlyAdvantage > 0 ? missedIncome / monthlyAdvantage : 0;
    const breakEvenYears = (breakEvenMonths / 12).toFixed(1);

    return {
      immediateMonthly: Math.round(immMonthly),
      accumulatedValue: Math.round(fv),
      deferredMonthly: Math.round(defMonthly),
      monthlyIncomeIncreasePct: increasePct.toFixed(0),
      crossoverYearsAfterStart: breakEvenYears,
    };
  }, [principal, currentAge, deferralYears, mygaRate, immediatePayoutRate, deferredPayoutRate]);

  const handleCopy = async () => {
    const summary = `Immediate (SPIA) vs Fixed Deferred (MYGA) Annuity Analysis ($${principal.toLocaleString()} at Age ${currentAge}):\n• Immediate Monthly Income (Start Now): $${immediateMonthly.toLocaleString()}/mo (${immediatePayoutRate}% payout rate)\n• Deferred Balance in ${deferralYears} Years (Age ${currentAge + deferralYears}): $${accumulatedValue.toLocaleString()} (at ${mygaRate}% fixed yield)\n• Future Monthly Income (Age ${currentAge + deferralYears}+): $${deferredMonthly.toLocaleString()}/mo (+${monthlyIncomeIncreasePct}% higher checks)\n• Income Catch-Up Period: ${crossoverYearsAfterStart} years after income commences`;
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
            Principal Investment ($)
          </label>
          <input
            type="number"
            min={10000}
            step={10000}
            value={principal}
            onChange={(e) => setPrincipal(Math.max(5000, parseFloat(e.target.value) || 5000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Age
          </label>
          <input
            type="number"
            min={45}
            max={85}
            value={currentAge}
            onChange={(e) => setCurrentAge(Math.max(40, parseInt(e.target.value) || 58))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Deferral Period (Years)
          </label>
          <select
            value={deferralYears}
            onChange={(e) => setDeferralYears(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={3}>3 Years (Short Horizon)</option>
            <option value={5}>5 Years (Standard MYGA)</option>
            <option value={7}>7 Years (Pre-Retirement)</option>
            <option value={10}>10 Years (Max Accumulation)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            MYGA Fixed Yield (%/yr)
          </label>
          <input
            type="number"
            min={1.0}
            max={10.0}
            step={0.1}
            value={mygaRate}
            onChange={(e) => setMygaRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Payout Rates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Immediate Annuity Payout Rate (% at Age {currentAge})
          </label>
          <input
            type="number"
            min={3.0}
            max={15.0}
            step={0.1}
            value={immediatePayoutRate}
            onChange={(e) => setImmediatePayoutRate(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Annualized cash distribution percentage</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Deferred Annuity Payout Rate (% at Age {currentAge + deferralYears})
          </label>
          <input
            type="number"
            min={3.0}
            max={18.0}
            step={0.1}
            value={deferredPayoutRate}
            onChange={(e) => setDeferredPayoutRate(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-purple-600 dark:text-purple-400"
          />
          <span className="text-[10px] text-muted-foreground">Higher payout rate at older attained age</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Immediate vs Deferred Cash-Flow Comparison
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Immediate Income (SPIA)
            </span>
            <p className="text-2xl font-bold text-foreground">${immediateMonthly.toLocaleString()}/mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">Starts right now @ age {currentAge}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Deferred Income (MYGA)
            </span>
            <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              ${deferredMonthly.toLocaleString()}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              +{monthlyIncomeIncreasePct}% higher checks @ age {currentAge + deferralYears}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Accumulated Balance
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${accumulatedValue.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              Principal after {deferralYears} yrs compounding
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Income Catch-Up
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {crossoverYearsAfterStart} Years
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              Break-even age ~{Math.round(currentAge + deferralYears + parseFloat(crossoverYearsAfterStart))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
