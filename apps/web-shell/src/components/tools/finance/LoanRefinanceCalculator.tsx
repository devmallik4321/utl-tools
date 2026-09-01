"use client";

import { useState } from "react";
import { Landmark, DollarSign, Calendar, TrendingDown, Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function LoanRefinanceCalculator() {
  // Current Loan
  const [currentBalance, setCurrentBalance] = useState<number>(280000);
  const [currentApr, setCurrentApr] = useState<number>(7.25);
  const [currentPayment, setCurrentPayment] = useState<number>(2050);

  // New Refinanced Loan
  const [newApr, setNewApr] = useState<number>(5.5);
  const [newTermYears, setNewTermYears] = useState<number>(30);
  const [closingCosts, setClosingCosts] = useState<number>(4500);
  const [rollCostsIntoLoan, setRollCostsIntoLoan] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const newPrincipal = rollCostsIntoLoan ? currentBalance + closingCosts : currentBalance;
  const newMonthlyRate = newApr / 100 / 12;
  const newMonths = newTermYears * 12;

  let newMonthlyPayment = 0;
  if (newMonthlyRate > 0 && newMonths > 0) {
    newMonthlyPayment =
      (newPrincipal * (newMonthlyRate * Math.pow(1 + newMonthlyRate, newMonths))) /
      (Math.pow(1 + newMonthlyRate, newMonths) - 1);
  }

  const monthlySavings = currentPayment - newMonthlyPayment;
  const totalNewInterest = newMonthlyPayment * newMonths - newPrincipal;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : 0;

  const handleCopy = async () => {
    const summary = `Loan Refinance Analysis\n• Current Loan: $${currentBalance.toLocaleString()} @ ${currentApr}% APR (Payment: $${currentPayment.toFixed(2)}/mo)\n• Refinanced Loan: $${newPrincipal.toLocaleString()} @ ${newApr}% APR (Term: ${newTermYears} Yrs)\n• New Monthly Payment: $${newMonthlyPayment.toFixed(2)}/mo\n• Monthly Cash Savings: ${monthlySavings >= 0 ? "+" : ""}$${monthlySavings.toFixed(2)}/mo\n• Closing Costs: $${closingCosts.toLocaleString()}\n• Break-Even Period: ${breakEvenMonths > 0 ? `${breakEvenMonths} Months (${(breakEvenMonths / 12).toFixed(1)} Yrs)` : "N/A (Higher Payment)"}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current vs New Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Loan */}
        <div className="p-4 bg-card border-2 border-rose-500/30 rounded-xl space-y-3">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
            Existing / Current Loan
          </span>
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] text-muted-foreground block">Remaining Principal Balance ($)</label>
              <input
                type="number"
                min={1}
                value={currentBalance}
                onChange={(e) => setCurrentBalance(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground block">Current APR (%)</label>
                <input
                  type="number"
                  min={0}
                  step="0.125"
                  value={currentApr}
                  onChange={(e) => setCurrentApr(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 text-sm font-mono bg-background border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block">Monthly Payment ($)</label>
                <input
                  type="number"
                  min={1}
                  value={currentPayment}
                  onChange={(e) => setCurrentPayment(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 text-sm font-mono bg-background border border-border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* New Refinance Loan */}
        <div className="p-4 bg-card border-2 border-emerald-500/30 rounded-xl space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            New Refinanced Loan Offer
          </span>
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground block">New APR (%)</label>
                <input
                  type="number"
                  min={0}
                  step="0.125"
                  value={newApr}
                  onChange={(e) => setNewApr(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block">New Term (Years)</label>
                <select
                  value={newTermYears}
                  onChange={(e) => setNewTermYears(parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg"
                >
                  <option value={30}>30 Years (360 Mo)</option>
                  <option value={20}>20 Years (240 Mo)</option>
                  <option value={15}>15 Years (180 Mo)</option>
                  <option value={10}>10 Years (120 Mo)</option>
                  <option value={5}>5 Years (60 Mo)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground block">Closing Costs &amp; Fees ($)</label>
              <input
                type="number"
                min={0}
                value={closingCosts}
                onChange={(e) => setClosingCosts(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-sm font-mono bg-background border border-border rounded-lg"
              />
            </div>

            <label className="flex items-center gap-2 pt-1 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={rollCostsIntoLoan}
                onChange={(e) => setRollCostsIntoLoan(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600"
              />
              <span className="text-muted-foreground">Roll closing costs into new loan balance</span>
            </label>
          </div>
        </div>
      </div>

      {/* Refinance Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Refinance Savings &amp; Break-Even Analysis
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Refinance Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Cash Savings</span>
            <p className={`text-2xl sm:text-3xl font-extrabold font-mono ${monthlySavings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {monthlySavings >= 0 ? "+" : ""}${monthlySavings.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            <span className="text-[10px] text-muted-foreground">
              {monthlySavings >= 0 ? "Lower monthly bill" : "Higher monthly payment"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">New Monthly Payment</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${newMonthlyPayment.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Was ${currentPayment.toFixed(2)}/mo</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Break-Even Period</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {breakEvenMonths > 0 ? `${breakEvenMonths} Mo` : "N/A"}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {breakEvenMonths > 0 ? `~${(breakEvenMonths / 12).toFixed(1)} years to recoup fees` : "No monthly savings"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total New Interest</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${totalNewInterest.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Over {newTermYears} year loan lifetime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
