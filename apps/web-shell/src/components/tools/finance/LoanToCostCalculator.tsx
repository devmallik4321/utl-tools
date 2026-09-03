"use client";

import { useState, useMemo } from "react";
import { Building, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Scale, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function LoanToCostCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(2500000);
  const [renovationBudget, setRenovationBudget] = useState<number>(750000);
  const [asCompletedValue, setAsCompletedValue] = useState<number>(4100000);
  const [maxLtcPct, setMaxLtcPct] = useState<number>(80); // 75% - 85% LTC
  const [maxLtvPct, setMaxLtvPct] = useState<number>(70); // 65% - 75% LTV
  const [copied, setCopied] = useState<boolean>(false);

  const {
    totalCost,
    maxLoanLtc,
    maxLoanLtv,
    finalLoanAmount,
    bindingConstraint,
    requiredSponsorEquity,
    effectiveLtc,
    effectiveLtv,
  } = useMemo(() => {
    const cost = purchasePrice + renovationBudget;
    const loanLtc = cost * (maxLtcPct / 100);
    const loanLtv = asCompletedValue * (maxLtvPct / 100);

    const finalLoan = Math.min(loanLtc, loanLtv);
    const constraint = loanLtc <= loanLtv ? "LTC (Cost Constrained)" : "LTV (Appraisal Constrained)";
    const equity = Math.max(0, cost - finalLoan);

    const effLtc = cost > 0 ? (finalLoan / cost) * 100 : 0;
    const effLtv = asCompletedValue > 0 ? (finalLoan / asCompletedValue) * 100 : 0;

    return {
      totalCost: Math.round(cost),
      maxLoanLtc: Math.round(loanLtc),
      maxLoanLtv: Math.round(loanLtv),
      finalLoanAmount: Math.round(finalLoan),
      bindingConstraint: constraint,
      requiredSponsorEquity: Math.round(equity),
      effectiveLtc: effLtc.toFixed(1),
      effectiveLtv: effLtv.toFixed(1),
    };
  }, [purchasePrice, renovationBudget, asCompletedValue, maxLtcPct, maxLtvPct]);

  const handleCopy = async () => {
    const summary = `Commercial CRE Loan-to-Cost (LTC) Underwriting Analysis:\n• Total Project Cost: $${totalCost.toLocaleString()} (Purchase: $${purchasePrice.toLocaleString()} + Rehab: $${renovationBudget.toLocaleString()})\n• Stabilized As-Completed Value: $${asCompletedValue.toLocaleString()}\n• Sizing Constraints:\n  - Max Loan by ${maxLtcPct}% LTC: $${maxLoanLtc.toLocaleString()}\n  - Max Loan by ${maxLtvPct}% As-Completed LTV: $${maxLoanLtv.toLocaleString()}\n• Final Underwritten Loan: $${finalLoanAmount.toLocaleString()} (${bindingConstraint})\n• Required Sponsor Equity Injection: $${requiredSponsorEquity.toLocaleString()}\n• Effective Metrics: ${effectiveLtc}% LTC / ${effectiveLtv}% LTV`;
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
            Property Acquisition Price ($)
          </label>
          <input
            type="number"
            min={10000}
            step={50000}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Rehab / Construction Budget ($)
          </label>
          <input
            type="number"
            min={0}
            step={25000}
            value={renovationBudget}
            onChange={(e) => setRenovationBudget(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Hard construction + soft costs</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            As-Completed ARV Appraised Value ($)
          </label>
          <input
            type="number"
            min={10000}
            step={50000}
            value={asCompletedValue}
            onChange={(e) => setAsCompletedValue(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">Post-stabilization market value</span>
        </div>
      </div>

      {/* Lender Underwriting Limits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Lender Maximum LTC Cap</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{maxLtcPct}%</span>
          </div>
          <input
            type="range"
            min={60}
            max={90}
            value={maxLtcPct}
            onChange={(e) => setMaxLtcPct(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
          <span className="text-[10px] text-muted-foreground">Typical bridge debt: 75% – 85% of total cost</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Lender Maximum As-Completed LTV Cap</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{maxLtvPct}%</span>
          </div>
          <input
            type="range"
            min={55}
            max={80}
            value={maxLtvPct}
            onChange={(e) => setMaxLtvPct(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
          <span className="text-[10px] text-muted-foreground">Typical take-out limit: 65% – 75% of stabilized ARV</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-500" />
            Underwritten Loan Sizing &amp; Sponsor Equity
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
              Final Max Loan Amount
            </span>
            <p className="text-3xl font-extrabold text-foreground">
              ${finalLoanAmount.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {bindingConstraint}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Required Sponsor Equity
            </span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ${requiredSponsorEquity.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Total cost minus loan</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Total Project Cost
            </span>
            <p className="text-2xl font-bold text-foreground">${totalCost.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Purchase + Renovation</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Effective Ratios
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {effectiveLtc}% LTC
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">{effectiveLtv}% As-Completed LTV</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">LTC vs LTV Invariant: </strong>
          Lenders always size bridge/construction loans to the <span className="font-semibold text-foreground">lesser of</span> the LTC ceiling (${maxLoanLtc.toLocaleString()}) and the As-Completed LTV ceiling (${maxLoanLtv.toLocaleString()}) to protect their principal in the event of project cost overruns.
        </div>
      </div>
    </div>
  );
}
