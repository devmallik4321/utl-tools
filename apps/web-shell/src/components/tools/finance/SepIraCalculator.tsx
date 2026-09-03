"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const IRS_MAX_LIMIT_2024 = 69000;

export function SepIraCalculator() {
  const [netScheduleCProfit, setNetScheduleCProfit] = useState<number>(135000);
  const [marginalTaxBracket, setMarginalTaxBracket] = useState<number>(24); // 12%, 22%, 24%, 32%, 35%, 37%
  const [copied, setCopied] = useState<boolean>(false);

  const {
    halfSeTaxDeduction,
    adjustedNetEarnings,
    maxSepContribution,
    estimatedTaxSavings,
    effectiveInvestmentCost,
    isCapped,
  } = useMemo(() => {
    // 1. Calculate Self-Employment Tax (15.3% on 92.35% of profit, subject to SS wage base cap)
    const ssWageCap = 168600; // 2024 SS cap
    const seEarnings = netScheduleCProfit * 0.9235;

    let ssTax = 0;
    let medTax = seEarnings * 0.029;
    if (seEarnings <= ssWageCap) {
      ssTax = seEarnings * 0.124;
    } else {
      ssTax = ssWageCap * 0.124;
    }
    const totalSeTax = ssTax + medTax;
    const halfSeTax = totalSeTax / 2;

    // 2. Adjusted Net Self-Employment Earnings
    const adjEarnings = Math.max(0, netScheduleCProfit - halfSeTax);

    // 3. Sole proprietorship SEP-IRA rate is 20% (0.25 / (1 + 0.25) = 0.20)
    const rawContribution = adjEarnings * 0.20;
    const finalContribution = Math.min(IRS_MAX_LIMIT_2024, rawContribution);

    // 4. Tax savings
    const taxSavings = finalContribution * (marginalTaxBracket / 100);
    const netCost = finalContribution - taxSavings;

    return {
      halfSeTaxDeduction: Math.round(halfSeTax),
      adjustedNetEarnings: Math.round(adjEarnings),
      maxSepContribution: Math.round(finalContribution),
      estimatedTaxSavings: Math.round(taxSavings),
      effectiveInvestmentCost: Math.round(netCost),
      isCapped: rawContribution > IRS_MAX_LIMIT_2024,
    };
  }, [netScheduleCProfit, marginalTaxBracket]);

  const handleCopy = async () => {
    const summary = `Self-Employed SEP-IRA Contribution Analysis ($${netScheduleCProfit.toLocaleString()} Net Schedule C Profit):\n• Maximum Tax-Deductible Contribution: $${maxSepContribution.toLocaleString()} (${isCapped ? "Capped at IRS $69,000 Limit" : "20% of Adjusted Net Earnings"})\n• Estimated Federal Income Tax Savings: $${estimatedTaxSavings.toLocaleString()} (at ${marginalTaxBracket}% bracket)\n• Out-of-Pocket Net Cost: $${effectiveInvestmentCost.toLocaleString()}\n• Deductible Half SE Tax: $${halfSeTaxDeduction.toLocaleString()}\n• Adjusted Net Earnings Base: $${adjustedNetEarnings.toLocaleString()}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Net 1099 / Schedule C Profit ($)
          </label>
          <input
            type="number"
            min={1000}
            step={5000}
            value={netScheduleCProfit}
            onChange={(e) => setNetScheduleCProfit(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Line 31 of IRS Schedule C</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Marginal Federal Tax Bracket (%)
          </label>
          <select
            value={marginalTaxBracket}
            onChange={(e) => setMarginalTaxBracket(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={12}>12% Federal Bracket</option>
            <option value={22}>22% Federal Bracket</option>
            <option value={24}>24% Federal Bracket (Typical 1099)</option>
            <option value={32}>32% Federal Bracket</option>
            <option value={35}>35% Federal Bracket</option>
            <option value={37}>37% Federal Bracket (Top Tier)</option>
          </select>
          <span className="text-[10px] text-muted-foreground">Determines dollar-for-dollar tax deductions</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Maximum SEP-IRA Deduction &amp; Tax Reduction
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy SEP Sheet"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Max SEP Contribution
            </span>
            <p className="text-3xl font-extrabold text-foreground">${maxSepContribution.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {isCapped ? "Capped at IRS limit ($69,000)" : "20% statutory adjusted profit"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Immediate Tax Savings
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${estimatedTaxSavings.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              Saved at {marginalTaxBracket}% tax bracket
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Net Out-Of-Pocket Cost
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${effectiveInvestmentCost.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Contribution minus tax saved</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              50% SE Tax Deduction
            </span>
            <p className="text-2xl font-bold text-foreground">${halfSeTaxDeduction.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Excluded before 20% calculation</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Why 20% instead of 25%? </strong>
          While employees receive up to 25% of compensation, self-employed sole proprietors must use the IRS statutory formula where the plan contribution rate is divided by (1 + rate): <span className="font-mono text-foreground">0.25 / 1.25 = 20.0%</span> of net earnings minus half of self-employment tax.
        </div>
      </div>
    </div>
  );
}
