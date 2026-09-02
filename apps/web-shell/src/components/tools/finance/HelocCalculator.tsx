"use client";

import { useState, useMemo } from "react";
import { Home, DollarSign, Percent, Copy, Check, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HelocCalculator() {
  const [homeValue, setHomeValue] = useState<number>(450000);
  const [mortgageBalance, setMortgageBalance] = useState<number>(240000);
  const [maxLtv, setMaxLtv] = useState<number>(80);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [copied, setCopied] = useState<boolean>(false);

  const { totalEquity, maxBorrowable, currentLtv, monthlyInterestOnly, monthlyAmortized } = useMemo(() => {
    const equity = Math.max(0, homeValue - mortgageBalance);
    const maxTotalLoan = homeValue * (maxLtv / 100);
    const borrowable = Math.max(0, maxTotalLoan - mortgageBalance);
    const ltv = homeValue > 0 ? (mortgageBalance / homeValue) * 100 : 0;

    const monthlyRate = interestRate / 100 / 12;
    const interestOnly = borrowable * monthlyRate;

    // 10-year amortized monthly repayment (120 months)
    let amortized = 0;
    if (monthlyRate > 0 && borrowable > 0) {
      const n = 120;
      amortized = (borrowable * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1);
    }

    return {
      totalEquity: equity,
      maxBorrowable: borrowable,
      currentLtv: ltv,
      monthlyInterestOnly: interestOnly,
      monthlyAmortized: amortized,
    };
  }, [homeValue, mortgageBalance, maxLtv, interestRate]);

  const handleCopy = async () => {
    const summary = `Home Equity Line of Credit (HELOC) Analysis\n• Home Market Value: $${homeValue.toLocaleString()}\n• Current Mortgage Balance: $${mortgageBalance.toLocaleString()} (${currentLtv.toFixed(1)}% LTV)\n• Total Home Equity: $${totalEquity.toLocaleString()}\n• Max Borrowable HELOC (${maxLtv}% LTV Cap): $${maxBorrowable.toLocaleString()}\n• Estimated Monthly Interest-Only Payment (@ ${interestRate}%): $${monthlyInterestOnly.toFixed(2)}/mo\n• Estimated 10-Year Principal+Interest Payment: $${monthlyAmortized.toFixed(2)}/mo`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Property & Mortgage Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Estimated Home Value ($)
          </label>
          <input
            type="number"
            min={1000}
            value={homeValue}
            onChange={(e) => setHomeValue(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Mortgage Balance ($)
          </label>
          <input
            type="number"
            min={0}
            value={mortgageBalance}
            onChange={(e) => setMortgageBalance(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Max Lender LTV (%)
          </label>
          <select
            value={maxLtv}
            onChange={(e) => setMaxLtv(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={75}>75% (Conservative)</option>
            <option value={80}>80% (Standard)</option>
            <option value={85}>85% (High LTV)</option>
            <option value={90}>90% (Maximum)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            HELOC Rate (%)
          </label>
          <input
            type="number"
            min={0}
            step="0.25"
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Borrowable Equity Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Home className="w-4 h-4 text-emerald-500" />
            HELOC Borrowing Power &amp; Available Credit
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
            <span className="text-xs font-semibold text-muted-foreground uppercase">Max Borrowable HELOC</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${maxBorrowable.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground">At {maxLtv}% maximum combined loan-to-value</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Home Equity</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground">Current property value minus debt</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Current Loan-to-Value</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {currentLtv.toFixed(1)}%
            </p>
            <span className="text-[10px] text-muted-foreground">Existing mortgage / home value</span>
          </div>
        </div>

        {/* Repayment Estimates */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Estimated Monthly Payment Scenarios (If 100% Drawn)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-card rounded-lg border border-border space-y-1">
              <span className="text-muted-foreground font-sans block">Interest-Only Payment (Draw Period)</span>
              <p className="text-xl font-bold text-foreground">
                ${monthlyInterestOnly.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/ mo</span>
              </p>
              <span className="text-[10px] text-muted-foreground font-sans block">Principal balance remains unchanged</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-1">
              <span className="text-muted-foreground font-sans block">Principal + Interest (10-Yr Repayment)</span>
              <p className="text-xl font-bold text-foreground">
                ${monthlyAmortized.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/ mo</span>
              </p>
              <span className="text-[10px] text-muted-foreground font-sans block">Pays off credit line fully in 10 years</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
