"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function AnnuityCalculator() {
  const [principal, setPrincipal] = useState<number>(250000);
  const [guaranteedRate, setGuaranteedRate] = useState<number>(6.0);
  const [payoutYears, setPayoutYears] = useState<number>(20);
  const [calcMode, setCalcMode] = useState<"payout" | "target">("payout");
  const [targetMonthly, setTargetMonthly] = useState<number>(1800);
  const [copied, setCopied] = useState<boolean>(false);

  const { monthlyPayout, annualPayout, totalLifetimePayout, totalInterestEarned, principalRequired } = useMemo(() => {
    const r = guaranteedRate / 100 / 12;
    const n = payoutYears * 12;

    if (calcMode === "payout") {
      let pmt = 0;
      if (r > 0 && n > 0) {
        pmt = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
      } else if (n > 0) {
        pmt = principal / n;
      }
      const totalPaid = pmt * n;
      const interest = Math.max(0, totalPaid - principal);

      return {
        monthlyPayout: pmt,
        annualPayout: pmt * 12,
        totalLifetimePayout: totalPaid,
        totalInterestEarned: interest,
        principalRequired: principal,
      };
    } else {
      // Calculate principal needed for target monthly income
      let reqPrincipal = 0;
      if (r > 0 && n > 0) {
        reqPrincipal = (targetMonthly * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
      } else if (n > 0) {
        reqPrincipal = targetMonthly * n;
      }
      const totalPaid = targetMonthly * n;
      const interest = Math.max(0, totalPaid - reqPrincipal);

      return {
        monthlyPayout: targetMonthly,
        annualPayout: targetMonthly * 12,
        totalLifetimePayout: totalPaid,
        totalInterestEarned: interest,
        principalRequired: reqPrincipal,
      };
    }
  }, [principal, guaranteedRate, payoutYears, calcMode, targetMonthly]);

  const handleCopy = async () => {
    const summary = `Fixed Annuity Payout Analysis (${payoutYears} Years @ ${guaranteedRate}% APR)\n• Upfront Principal: $${principalRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Guaranteed Monthly Income: $${monthlyPayout.toFixed(2)}/mo ($${annualPayout.toFixed(0)}/yr)\n• Total Lifetime Payout: $${totalLifetimePayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Guaranteed Interest Earned: +$${totalInterestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-0.5 bg-muted rounded-xl border border-border max-w-sm text-xs">
        <button
          onClick={() => setCalcMode("payout")}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
            calcMode === "payout" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
          }`}
        >
          Calculate Payout from Lump Sum
        </button>
        <button
          onClick={() => setCalcMode("target")}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
            calcMode === "target" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
          }`}
        >
          Calculate Principal Needed
        </button>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {calcMode === "payout" ? (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Upfront Premium / Principal ($)
            </label>
            <input
              type="number"
              min={1000}
              value={principal}
              onChange={(e) => setPrincipal(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>
        ) : (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Desired Monthly Income ($/mo)
            </label>
            <input
              type="number"
              min={100}
              value={targetMonthly}
              onChange={(e) => setTargetMonthly(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
            />
          </div>
        )}

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Guaranteed Rate of Return (%)
          </label>
          <input
            type="number"
            min={0}
            step="0.25"
            value={guaranteedRate}
            onChange={(e) => setGuaranteedRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Payout Period (Years)
          </label>
          <input
            type="number"
            min={1}
            max={40}
            value={payoutYears}
            onChange={(e) => setPayoutYears(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Payout Results Card */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Guaranteed Retirement Cash Flow Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Guaranteed Payout</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${monthlyPayout.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              ${annualPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })} per year for {payoutYears} yrs
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              {calcMode === "payout" ? "Total Lifetime Payout" : "Required Upfront Premium"}
            </span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${(calcMode === "payout" ? totalLifetimePayout : principalRequired).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {calcMode === "payout" ? "Principal + guaranteed interest" : "Lump sum needed today"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Guaranteed Interest Earned</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              +${totalInterestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground">Earned on remaining principal balance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
