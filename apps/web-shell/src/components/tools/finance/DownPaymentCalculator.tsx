"use client";

import { useState, useMemo } from "react";
import { Home, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, PiggyBank } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function DownPaymentCalculator() {
  const [homePrice, setHomePrice] = useState<number>(450000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [currentSavings, setCurrentSavings] = useState<number>(18000);
  const [monthlySavings, setMonthlySavings] = useState<number>(1800);
  const [hysaApy, setHysaApy] = useState<number>(4.5);
  const [copied, setCopied] = useState<boolean>(false);

  const { targetAmount, remainingGoal, monthsToGoal, totalInterestEarned, targetDateStr } = useMemo(() => {
    const target = (homePrice * downPaymentPct) / 100;
    const remaining = Math.max(0, target - currentSavings);

    if (monthlySavings <= 0) {
      return { targetAmount: target, remainingGoal: remaining, monthsToGoal: 0, totalInterestEarned: 0, targetDateStr: "Indefinite" };
    }

    let balance = currentSavings;
    let months = 0;
    let interestEarned = 0;
    const monthlyRate = hysaApy / 100 / 12;

    while (balance < target && months < 360) {
      months++;
      const interest = balance * monthlyRate;
      interestEarned += interest;
      balance += monthlySavings + interest;
    }

    // Compute target month and year
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    return {
      targetAmount: target,
      remainingGoal: remaining,
      monthsToGoal: months,
      totalInterestEarned: interestEarned,
      targetDateStr: dateStr,
    };
  }, [homePrice, downPaymentPct, currentSavings, monthlySavings, hysaApy]);

  const handleCopy = async () => {
    const summary = `Home Down Payment Savings Plan (${downPaymentPct}% on $${homePrice.toLocaleString()})\n• Down Payment Target: $${targetAmount.toLocaleString()}\n• Months to Reach Goal: ${monthsToGoal} Months (~${(monthsToGoal / 12).toFixed(1)} years)\n• Estimated Ready Date: ${targetDateStr}\n• HYSA Compound Interest Earned: +$${totalInterestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
            Target Home Price ($)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={homePrice}
            onChange={(e) => setHomePrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Down Payment Goal (%)
          </label>
          <select
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(parseFloat(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={20}>20% (Avoids PMI Mortgage Insurance)</option>
            <option value={15}>15%</option>
            <option value={10}>10% (Popular Conventional)</option>
            <option value={5}>5% (First-time Homebuyer)</option>
            <option value={3.5}>3.5% (FHA Loan Minimum)</option>
          </select>
          <span className="text-[10px] text-muted-foreground font-mono">Target: ${targetAmount.toLocaleString()}</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Savings ($)
          </label>
          <input
            type="number"
            min={0}
            value={currentSavings}
            onChange={(e) => setCurrentSavings(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly Savings Budget ($/mo)
          </label>
          <input
            type="number"
            min={50}
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            HYSA Savings APY (%)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={hysaApy}
            onChange={(e) => setHysaApy(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">High-yield savings account interest</span>
        </div>
      </div>

      {/* Projection Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Home className="w-4 h-4 text-emerald-500" />
            Down Payment Timeline &amp; Ready Date
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Plan"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Ready Date</span>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{targetDateStr}</p>
            <span className="text-[10px] text-muted-foreground font-sans">{monthsToGoal} months to home purchase</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Target Down Payment</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${targetAmount.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">{downPaymentPct}% of purchase price</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Remaining Gap</span>
            <p className="text-2xl font-bold text-foreground">${remainingGoal.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">To save with deposits &amp; interest</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">HYSA Interest Boost</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              +${totalInterestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Free interest earned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
