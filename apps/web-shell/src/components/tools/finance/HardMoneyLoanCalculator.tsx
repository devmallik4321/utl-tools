"use client";

import { useState, useMemo } from "react";
import { Briefcase, DollarSign, Calendar, Percent, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HardMoneyLoanCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(240000);
  const [rehabBudget, setRehabBudget] = useState<number>(55000);
  const [arv, setArv] = useState<number>(365000);
  const [ltcPercentage, setLtcPercentage] = useState<number>(85); // 85% LTC standard
  const [points, setPoints] = useState<number>(2.5); // 2.5 points origination
  const [interestRate, setInterestRate] = useState<number>(11.5); // 11.5% interest-only
  const [loanTermMonths, setLoanTermMonths] = useState<number>(9);
  const [lenderAdminFee, setLenderAdminFee] = useState<number>(1800);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    totalProjectCost,
    loanAmount,
    cashToClose,
    monthlyInterest,
    totalInterestPaid,
    originationPointsFee,
    totalFinancingCost,
  } = useMemo(() => {
    const totalCost = purchasePrice + rehabBudget;
    const maxLoanByLtc = totalCost * (ltcPercentage / 100);

    // Hard money lenders also cap loan at 70-75% ARV
    const maxLoanByArv = arv * 0.75;
    const finalLoan = Math.min(maxLoanByLtc, maxLoanByArv);

    const pointsFee = finalLoan * (points / 100);
    const downPayment = totalCost - finalLoan;
    const closeCash = downPayment + pointsFee + lenderAdminFee;

    // Monthly interest-only payment
    const monthlyInt = (finalLoan * (interestRate / 100)) / 12;
    const totalInt = monthlyInt * loanTermMonths;
    const allFinanceCosts = totalInt + pointsFee + lenderAdminFee;

    return {
      totalProjectCost: Math.round(totalCost),
      loanAmount: Math.round(finalLoan),
      cashToClose: Math.round(closeCash),
      monthlyInterest: Math.round(monthlyInt),
      totalInterestPaid: Math.round(totalInt),
      originationPointsFee: Math.round(pointsFee),
      totalFinancingCost: Math.round(allFinanceCosts),
    };
  }, [purchasePrice, rehabBudget, arv, ltcPercentage, points, interestRate, loanTermMonths, lenderAdminFee]);

  const handleCopy = async () => {
    const summary = `Hard Money Financing Analysis ($${loanAmount.toLocaleString()} Loan on $${totalProjectCost.toLocaleString()} Project):\n• Cash Required to Close: $${cashToClose.toLocaleString()} (Down + ${points} Pts + Fees)\n• Monthly Interest-Only Payment: $${monthlyInterest.toLocaleString()}/mo (@ ${interestRate}% APR)\n• Total Financing Cost (${loanTermMonths} Months): $${totalFinancingCost.toLocaleString()}\n• Points Origination Fee: $${originationPointsFee.toLocaleString()}\n• Total Interest over ${loanTermMonths} Mos: $${totalInterestPaid.toLocaleString()}`;
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
            Purchase Price ($)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Rehab Budget ($)
          </label>
          <input
            type="number"
            min={0}
            step={5000}
            value={rehabBudget}
            onChange={(e) => setRehabBudget(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Interest Rate (% APR)
          </label>
          <input
            type="number"
            min={5}
            max={22}
            step={0.25}
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Lender Points (%)
          </label>
          <input
            type="number"
            min={0}
            max={6}
            step={0.5}
            value={points}
            onChange={(e) => setPoints(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Second Row Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Loan-To-Cost (LTC %)
          </label>
          <select
            value={ltcPercentage}
            onChange={(e) => setLtcPercentage(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={75}>75% LTC (Conservative)</option>
            <option value={80}>80% LTC</option>
            <option value={85}>85% LTC (Standard Bridge)</option>
            <option value={90}>90% LTC (Experienced Flipper)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Holding Term (Months)
          </label>
          <select
            value={loanTermMonths}
            onChange={(e) => setLoanTermMonths(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={6}>6 Months (Fast Flip)</option>
            <option value={9}>9 Months (Average Project)</option>
            <option value={12}>12 Months (Full Gut Rehab)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            After Repair Value (ARV $)
          </label>
          <input
            type="number"
            min={50000}
            step={5000}
            value={arv}
            onChange={(e) => setArv(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-500" />
            Hard Money Capital &amp; Monthly Carrying Cost
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Loan Sheet"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Cash Needed at Closing
            </span>
            <p className="text-3xl font-extrabold text-foreground">${cashToClose.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              Down (${totalProjectCost - loanAmount}) + Points (${originationPointsFee})
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Monthly Payment
            </span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">${monthlyInterest.toLocaleString()}/mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">Interest-only carrying cost</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Total Loan Principal
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${loanAmount.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {((loanAmount / totalProjectCost) * 100).toFixed(0)}% LTC financed
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Total Financing Cost
            </span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ${totalFinancingCost.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">All interest + points + admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
