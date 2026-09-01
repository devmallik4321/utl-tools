"use client";

import { useState } from "react";
import { Car, DollarSign, Calendar, TrendingDown, Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function AutoLoanEarlyPayoffCalculator() {
  const [balance, setBalance] = useState<number>(25000);
  const [apr, setApr] = useState<number>(6.5);
  const [remainingMonths, setRemainingMonths] = useState<number>(48);
  const [extraMonthly, setExtraMonthly] = useState<number>(150);
  const [lumpSum, setLumpSum] = useState<number>(1000);
  const [copied, setCopied] = useState<boolean>(false);

  const monthlyRate = apr / 100 / 12;

  // Standard Loan Math
  let standardMonthlyPayment = 0;
  if (monthlyRate > 0 && remainingMonths > 0) {
    standardMonthlyPayment =
      (balance * (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths))) /
      (Math.pow(1 + monthlyRate, remainingMonths) - 1);
  } else if (remainingMonths > 0) {
    standardMonthlyPayment = balance / remainingMonths;
  }
  const totalStandardInterest = standardMonthlyPayment * remainingMonths - balance;

  // Accelerated Math Simulation
  let acceleratedPrincipal = Math.max(0, balance - lumpSum);
  let acceleratedMonths = 0;
  let totalAcceleratedInterest = 0;
  const newPayment = standardMonthlyPayment + extraMonthly;

  if (newPayment > 0 && acceleratedPrincipal > 0) {
    let currBal = acceleratedPrincipal;
    while (currBal > 0 && acceleratedMonths < 360) {
      acceleratedMonths++;
      const interestPayment = currBal * monthlyRate;
      totalAcceleratedInterest += interestPayment;
      const principalPayment = Math.min(currBal, newPayment - interestPayment);
      currBal -= principalPayment;
      if (currBal < 1) break;
    }
  }

  const monthsSaved = Math.max(0, remainingMonths - acceleratedMonths);
  const interestSaved = Math.max(0, totalStandardInterest - totalAcceleratedInterest);

  const handleCopy = async () => {
    const summary = `Auto Loan Early Payoff Analysis\n• Current Loan: $${balance.toLocaleString()} @ ${apr}% APR (${remainingMonths} Mo remaining)\n• Base Monthly Payment: $${standardMonthlyPayment.toFixed(2)}/mo\n• Extra Monthly Payment: +$${extraMonthly.toFixed(2)}/mo (Lump sum: $${lumpSum.toLocaleString()})\n• Accelerated Payoff Time: ${acceleratedMonths} Months (Shaved ${monthsSaved} Months / ${(monthsSaved / 12).toFixed(1)} Yrs off loan)\n• Total Interest Saved: $${interestSaved.toFixed(2)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Loan Details */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Existing Car Loan Parameters
          </span>
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] text-muted-foreground block">Remaining Principal Balance ($)</label>
              <input
                type="number"
                min={1}
                value={balance}
                onChange={(e) => setBalance(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground block">Interest Rate (APR %)</label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={apr}
                  onChange={(e) => setApr(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 text-sm font-mono bg-background border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block">Remaining Term (Months)</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={remainingMonths}
                  onChange={(e) => setRemainingMonths(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 text-sm font-mono bg-background border border-border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Extra Payments */}
        <div className="p-4 bg-card border-2 border-emerald-500/30 rounded-xl space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Extra Payment Acceleration
          </span>
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] text-muted-foreground block">Extra Payment Per Month ($)</label>
              <input
                type="number"
                min={0}
                value={extraMonthly}
                onChange={(e) => setExtraMonthly(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block">One-Time Lump Sum Payment ($)</label>
              <input
                type="number"
                min={0}
                value={lumpSum}
                onChange={(e) => setLumpSum(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-sm font-mono bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payoff Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-500" />
            Early Payoff &amp; Interest Savings
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Payoff Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Interest Saved</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${interestSaved.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Cash kept in your pocket</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Time Shaved Off Loan</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {monthsSaved} <span className="text-xs font-normal text-muted-foreground">Months</span>
            </p>
            <span className="text-[10px] text-muted-foreground">~{(monthsSaved / 12).toFixed(1)} years sooner</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">New Loan Duration</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {acceleratedMonths} <span className="text-xs font-normal text-muted-foreground">Months</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Down from {remainingMonths} months</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Monthly Payment</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${newPayment.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Base ${standardMonthlyPayment.toFixed(2)} + ${extraMonthly}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
