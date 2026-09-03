"use client";

import { useState, useMemo } from "react";
import { Home, DollarSign, Calendar, TrendingDown, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function MortgageRecastCalculator() {
  const [currentBalance, setCurrentBalance] = useState<number>(375000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [remainingYears, setRemainingYears] = useState<number>(25);
  const [lumpSumPayment, setLumpSumPayment] = useState<number>(50000);
  const [recastFee, setRecastFee] = useState<number>(250); // typical lender administrative fee
  const [copied, setCopied] = useState<boolean>(false);

  const { originalPayment, newPayment, monthlySavings, totalInterestSaved, netSavings } = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = remainingYears * 12;

    if (monthlyRate === 0 || totalMonths === 0) {
      return { originalPayment: 0, newPayment: 0, monthlySavings: 0, totalInterestSaved: 0, netSavings: 0 };
    }

    // Original Monthly Payment formula
    const origPMT = (currentBalance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const newBalance = Math.max(0, currentBalance - lumpSumPayment);

    // New Monthly Payment formula on reduced principal
    const newPMT = (newBalance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const origTotalInterest = origPMT * totalMonths - currentBalance;
    const newTotalInterest = newPMT * totalMonths - newBalance;
    const interestSaved = Math.max(0, origTotalInterest - newTotalInterest);

    return {
      originalPayment: Math.round(origPMT),
      newPayment: Math.round(newPMT),
      monthlySavings: Math.round(origPMT - newPMT),
      totalInterestSaved: Math.round(interestSaved),
      netSavings: Math.round(interestSaved - recastFee),
    };
  }, [currentBalance, interestRate, remainingYears, lumpSumPayment, recastFee]);

  const handleCopy = async () => {
    const summary = `Mortgage Recast Analysis ($${lumpSumPayment.toLocaleString()} Lump Sum on $${currentBalance.toLocaleString()} Balance):\n• Original Monthly Payment: $${originalPayment.toLocaleString()}/mo\n• New Recast Monthly Payment: $${newPayment.toLocaleString()}/mo\n• Monthly Cash Flow Savings: +$${monthlySavings.toLocaleString()}/mo\n• Lifetime Interest Saved: $${totalInterestSaved.toLocaleString()}\n• Net Financial Benefit (After $${recastFee} Fee): $${netSavings.toLocaleString()}`;
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
            Current Loan Balance ($)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={currentBalance}
            onChange={(e) => setCurrentBalance(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Interest Rate (% APR)
          </label>
          <input
            type="number"
            min={0.1}
            step={0.125}
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Remaining Term (Years)
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={remainingYears}
            onChange={(e) => setRemainingYears(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Lump-Sum Payment ($)
          </label>
          <input
            type="number"
            min={1000}
            step={5000}
            value={lumpSumPayment}
            onChange={(e) => setLumpSumPayment(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Home className="w-4 h-4 text-emerald-500" />
            Mortgage Recast Monthly Reduction &amp; Savings
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Recast Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Current Payment</span>
            <p className="text-2xl font-bold text-foreground">${originalPayment.toLocaleString()}/mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">Principal &amp; interest</span>
          </div>

          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              New Recast Payment
            </span>
            <p className="text-3xl font-extrabold text-foreground">${newPayment.toLocaleString()}/mo</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold">
              -${monthlySavings.toLocaleString()}/mo saved
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Interest Saved</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totalInterestSaved.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Lifetime interest reduction</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Net Benefit</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${netSavings.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">After ~$250 lender admin fee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
