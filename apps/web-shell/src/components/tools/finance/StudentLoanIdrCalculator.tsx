"use client";

import { useState, useMemo } from "react";
import { GraduationCap, DollarSign, Calendar, TrendingDown, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

// 2024 Federal Poverty Guidelines (Contiguous US)
const POVERTY_GUIDELINES: Record<number, number> = {
  1: 15060,
  2: 20440,
  3: 25820,
  4: 31200,
  5: 36580,
};

export function StudentLoanIdrCalculator() {
  const [agi, setAgi] = useState<number>(62000);
  const [familySize, setFamilySize] = useState<number>(1);
  const [loanBalance, setLoanBalance] = useState<number>(45000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTier, setLoanTier] = useState<"undergrad" | "split" | "grad">("undergrad"); // 5%, 7.5%, 10%
  const [copied, setCopied] = useState<boolean>(false);

  const {
    idrMonthlyPayment,
    standardMonthlyPayment,
    monthlySavings,
    povertyThresholdProtected,
    monthlyAccruedInterest,
    waivedInterestPerMonth,
  } = useMemo(() => {
    // 225% of Federal Poverty Line is protected under SAVE
    const basePoverty = POVERTY_GUIDELINES[familySize] || (31200 + (familySize - 4) * 5380);
    const protectedIncome = basePoverty * 2.25;

    const discretionaryIncome = Math.max(0, agi - protectedIncome);

    let idrRate = 0.05; // 5% for undergrad
    if (loanTier === "split") idrRate = 0.075;
    else if (loanTier === "grad") idrRate = 0.10;

    const annualIdr = discretionaryIncome * idrRate;
    const monthlyIdr = annualIdr / 12;

    // Standard 10-year fixed amortization payment
    const r = interestRate / 100 / 12;
    const n = 120; // 10 years
    const stdMonthly =
      loanBalance > 0 && r > 0
        ? (loanBalance * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1)
        : 0;

    // Monthly interest accrual
    const monthlyInterest = (loanBalance * (interestRate / 100)) / 12;
    const interestSubsidy = Math.max(0, monthlyInterest - monthlyIdr);

    return {
      idrMonthlyPayment: Math.round(monthlyIdr),
      standardMonthlyPayment: Math.round(stdMonthly),
      monthlySavings: Math.max(0, Math.round(stdMonthly - monthlyIdr)),
      povertyThresholdProtected: Math.round(protectedIncome),
      monthlyAccruedInterest: Math.round(monthlyInterest),
      waivedInterestPerMonth: Math.round(interestSubsidy),
    };
  }, [agi, familySize, loanBalance, interestRate, loanTier]);

  const handleCopy = async () => {
    const summary = `Student Loan IDR / SAVE Plan Analysis ($${loanBalance.toLocaleString()} Balance @ $${agi.toLocaleString()} AGI, Family of ${familySize}):\n• IDR / SAVE Monthly Payment: $${idrMonthlyPayment.toLocaleString()}/mo\n• Standard 10-Year Payment: $${standardMonthlyPayment.toLocaleString()}/mo\n• Monthly Cash Savings: $${monthlySavings.toLocaleString()}/mo ($${(monthlySavings * 12).toLocaleString()}/year)\n• Protected Income (225% Poverty Line): $${povertyThresholdProtected.toLocaleString()}/yr\n• Government Waived Interest Subsidy: $${waivedInterestPerMonth.toLocaleString()}/mo`;
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
            Adjusted Gross Income ($)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={agi}
            onChange={(e) => setAgi(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">AGI from IRS Form 1040</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Family Size
          </label>
          <select
            value={familySize}
            onChange={(e) => setFamilySize(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={1}>1 (Single Borrower)</option>
            <option value={2}>2 (Married / 1 Dependent)</option>
            <option value={3}>3 (Family of 3)</option>
            <option value={4}>4 (Family of 4)</option>
            <option value={5}>5 (Family of 5+)</option>
          </select>
          <span className="text-[10px] text-muted-foreground">Tax household size</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Total Federal Loan Debt
          </label>
          <input
            type="number"
            min={1000}
            step={5000}
            value={loanBalance}
            onChange={(e) => setLoanBalance(Math.max(500, parseFloat(e.target.value) || 500))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Loan Degree Type
          </label>
          <select
            value={loanTier}
            onChange={(e) => setLoanTier(e.target.value as any)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="undergrad">100% Undergraduate (5% Cap)</option>
            <option value="split">Undergrad &amp; Grad (7.5% Avg)</option>
            <option value="grad">100% Graduate (10% Cap)</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            Income-Driven Repayment vs Standard 10-Year Plan
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy IDR Sheet"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              IDR Monthly Payment
            </span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${idrMonthlyPayment.toLocaleString()}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Based on discretionary income</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Standard 10-Year Payment
            </span>
            <p className="text-2xl font-bold text-foreground">${standardMonthlyPayment.toLocaleString()}/mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">Fixed amortized baseline</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Monthly Cash Savings
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${monthlySavings.toLocaleString()}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              ${(monthlySavings * 12).toLocaleString()}/year kept in pocket
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Waived Interest Subsidy
            </span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${waivedInterestPerMonth.toLocaleString()}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Zero negative amortization</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Protected Income Buffer: </strong>
          The first <span className="text-foreground font-bold font-mono">${povertyThresholdProtected.toLocaleString()}</span> of your annual income is completely sheltered (225% of Federal Poverty Guidelines). Only income above this threshold is subject to the repayment formula.
        </div>
      </div>
    </div>
  );
}
