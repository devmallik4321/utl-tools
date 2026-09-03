"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Scale, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function DebtYieldCalculator() {
  const [noi, setNoi] = useState<number>(450000); // Net Operating Income ($/year)
  const [loanAmount, setLoanAmount] = useState<number>(4500000); // Proposed debt
  const [requiredYield, setRequiredYield] = useState<number>(9.5); // Lender min %
  const [copied, setCopied] = useState<boolean>(false);

  const {
    debtYieldPct,
    maxPermittedLoan,
    equityGap,
    isCompliant,
  } = useMemo(() => {
    const yieldRatio = loanAmount > 0 ? (noi / loanAmount) * 100 : 0;
    const maxLoan = requiredYield > 0 ? (noi / (requiredYield / 100)) : 0;
    const gap = Math.max(0, loanAmount - maxLoan);

    return {
      debtYieldPct: yieldRatio.toFixed(2),
      maxPermittedLoan: Math.round(maxLoan),
      equityGap: Math.round(gap),
      isCompliant: yieldRatio >= requiredYield,
    };
  }, [noi, loanAmount, requiredYield]);

  const handleCopy = async () => {
    const summary = `Commercial Real Estate Debt Yield Analysis (NOI: $${noi.toLocaleString()} / Loan: $${loanAmount.toLocaleString()}):\n• Current Debt Yield: ${debtYieldPct}%\n• Lender Target Minimum: ${requiredYield}%\n• Underwriting Status: ${isCompliant ? "APPROVED (Yield Meets or Exceeds Threshold)" : "DEFICIT (Equity Injection Required)"}\n• Maximum Permitted Loan at ${requiredYield}% Target: $${maxPermittedLoan.toLocaleString()}\n• Additional Equity Required: $${equityGap.toLocaleString()}\n• Invariant: Debt Yield is independent of interest rates and amortization length.`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Net Operating Income (NOI)
          </label>
          <input
            type="number"
            min={1000}
            step={25000}
            value={noi}
            onChange={(e) => setNoi(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">Revenues minus operating expenses</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Requested Loan Amount ($)
          </label>
          <input
            type="number"
            min={1000}
            step={50000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Total mortgage debt requested</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Lender Required Debt Yield (%)
          </label>
          <input
            type="number"
            min={5}
            max={20}
            step={0.25}
            value={requiredYield}
            onChange={(e) => setRequiredYield(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground">CMBS / Life Co typical: 8.5% - 10.0%</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Underwriting Debt Yield &amp; Maximum Borrowing Capacity
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Underwriting Sheet"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Property Debt Yield
            </span>
            <p className="text-3xl font-extrabold text-foreground">{debtYieldPct}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {isCompliant ? "Meets lender criteria" : `Deficit: target is ${requiredYield}%`}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Lender Status
            </span>
            <p className={`text-2xl font-bold ${isCompliant ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {isCompliant ? "APPROVED" : "DEFICIT"}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {isCompliant ? "Borrowing amount supported" : "Over-leveraged for yield"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Max Allowable Loan
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${maxPermittedLoan.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Cap at {requiredYield}% debt yield</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Additional Equity Gap
            </span>
            <p className={`text-2xl font-bold ${equityGap > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              ${equityGap.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Cash needed to cure ratio</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Why do lenders prefer Debt Yield over DSCR? </strong>
          Debt Service Coverage Ratio (DSCR) can be manipulated with low interest rates or interest-only periods. In contrast, Debt Yield measures the lender's raw cash-on-cash return if they had to take back the property in foreclosure, making it the most objective measure of loan risk.
        </div>
      </div>
    </div>
  );
}
