"use client";

import { useState } from "react";
import { Target, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SavingsGoalCalculator() {
  const [targetGoal, setTargetGoal] = useState<number>(50000);
  const [initialBalance, setInitialBalance] = useState<number>(5000);
  const [years, setYears] = useState<number>(3);
  const [interestRatePct, setInterestRatePct] = useState<number>(5.5); // 5.5% HYSA or Index Fund
  const [copied, setCopied] = useState<boolean>(false);

  // PMT formula for future value with compound interest
  // FV = PV*(1+r)^n + PMT * [((1+r)^n - 1) / r]
  // PMT = (FV - PV*(1+r)^n) / [((1+r)^n - 1) / r]
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = interestRatePct / 100 / 12;

  let requiredMonthlyDeposit = 0;
  const futureValueOfInitial = initialBalance * Math.pow(1 + monthlyRate, months);
  const remainingGoal = Math.max(0, targetGoal - futureValueOfInitial);

  if (monthlyRate === 0) {
    requiredMonthlyDeposit = (targetGoal - initialBalance) / months;
  } else {
    const annuityFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    requiredMonthlyDeposit = remainingGoal / annuityFactor;
  }

  requiredMonthlyDeposit = Math.max(0, requiredMonthlyDeposit);
  const totalDeposits = initialBalance + requiredMonthlyDeposit * months;
  const totalInterestEarned = Math.max(0, targetGoal - totalDeposits);
  const interestPortionPct = targetGoal > 0 ? (totalInterestEarned / targetGoal) * 100 : 0;

  // Yearly timeline schedule
  const schedule: { year: number; balance: number; deposits: number; interest: number }[] = [];
  if (years > 0 && years <= 40) {
    for (let y = 1; y <= Math.floor(years); y++) {
      const m = y * 12;
      const fvInit = initialBalance * Math.pow(1 + monthlyRate, m);
      const fvAnnuity = monthlyRate > 0 ? requiredMonthlyDeposit * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) : requiredMonthlyDeposit * m;
      const totalBal = fvInit + fvAnnuity;
      const totalDep = initialBalance + requiredMonthlyDeposit * m;
      schedule.push({
        year: y,
        balance: totalBal,
        deposits: totalDep,
        interest: Math.max(0, totalBal - totalDep),
      });
    }
  }

  const handleCopy = async () => {
    const summary = `Savings Goal Target Plan\n• Goal: $${targetGoal.toLocaleString()} in ${years} Years\n• Initial Balance: $${initialBalance.toLocaleString()}\n• Required Monthly Deposit: $${requiredMonthlyDeposit.toFixed(2)}/mo\n• Total Out-of-Pocket Deposits: $${totalDeposits.toLocaleString()}\n• Total Interest Earned: $${totalInterestEarned.toFixed(2)} (${interestPortionPct.toFixed(1)}% of goal)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Target Goal */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Target Savings Goal ($)
          </label>
          <input
            type="number"
            min={1}
            value={targetGoal}
            onChange={(e) => setTargetGoal(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[11px] text-muted-foreground">Dream house, wedding, car, fund</span>
        </div>

        {/* Initial Balance */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Starting Balance ($)
          </label>
          <input
            type="number"
            min={0}
            value={initialBalance}
            onChange={(e) => setInitialBalance(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Current savings available</span>
        </div>

        {/* Time Horizon */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Timeframe (Years)
          </label>
          <input
            type="number"
            min={0.5}
            step="0.5"
            value={years}
            onChange={(e) => setYears(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">{months} monthly compounding periods</span>
        </div>

        {/* Expected Return */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Annual Interest Rate (% APY)
          </label>
          <input
            type="number"
            min={0}
            max={30}
            step="0.25"
            value={interestRatePct}
            onChange={(e) => setInterestRatePct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg font-bold"
          />
          <span className="text-[11px] text-muted-foreground">HYSA (~4.5%) / Index (~8%)</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-500" />
            Required Monthly Contribution Plan
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Savings Plan"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Required Monthly Deposit</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${requiredMonthlyDeposit.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Save this amount each month</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Out-of-Pocket Deposits</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${totalDeposits.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Your actual cash saved</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Compound Interest Earned</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              +${totalInterestEarned.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">{interestPortionPct.toFixed(1)}% of your goal is free profit</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Final Target Total</span>
            <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              ${targetGoal.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Target reached at Year {years}</span>
          </div>
        </div>

        {/* Compounding Progression Schedule */}
        {schedule.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Annual Compounding Trajectory:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
              {schedule.map((row) => (
                <div key={row.year} className="p-2.5 bg-card rounded-lg border border-border space-y-0.5">
                  <span className="text-[10px] text-muted-foreground font-sans font-bold block">YEAR {row.year}</span>
                  <p className="text-foreground font-bold">${row.balance.toFixed(0)}</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">+${row.interest.toFixed(0)} int</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
