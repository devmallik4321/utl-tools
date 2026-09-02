"use client";

import { useState, useMemo } from "react";
import { ShieldCheck, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Award } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function RothIraCalculator() {
  const [currentAge, setCurrentAge] = useState<number>(28);
  const [retireAge, setRetireAge] = useState<number>(65);
  const [currentBalance, setCurrentBalance] = useState<number>(12000);
  const [annualContribution, setAnnualContribution] = useState<number>(7000); // 2024/2026 limit
  const [annualReturn, setAnnualReturn] = useState<number>(8.0);
  const [retirementTaxBracket, setRetirementTaxBracket] = useState<number>(22);
  const [copied, setCopied] = useState<boolean>(false);

  const { finalBalance, totalContributed, totalGrowth, taxFreeSavings, years } = useMemo(() => {
    const y = Math.max(1, retireAge - currentAge);
    const r = annualReturn / 100;

    let balance = currentBalance;
    let contributions = 0;

    for (let i = 1; i <= y; i++) {
      balance = (balance + annualContribution) * (1 + r);
      contributions += annualContribution;
    }

    const growth = Math.max(0, balance - currentBalance - contributions);
    const taxSaved = growth * (retirementTaxBracket / 100);

    return {
      finalBalance: balance,
      totalContributed: contributions,
      totalGrowth: growth,
      taxFreeSavings: taxSaved,
      years: y,
    };
  }, [currentAge, retireAge, currentBalance, annualContribution, annualReturn, retirementTaxBracket]);

  const handleCopy = async () => {
    const summary = `Roth IRA Tax-Free Wealth Projection (${years} Years to Age ${retireAge})\n• Projected Tax-Free Nest Egg: $${finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Total Contributions: $${totalContributed.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Compound Tax-Free Growth: +$${totalGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Estimated Taxes Saved at ${retirementTaxBracket}% Bracket: $${taxFreeSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
            Current Age / Retirement Age
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={18}
              max={80}
              value={currentAge}
              onChange={(e) => setCurrentAge(parseInt(e.target.value) || 28)}
              className="w-full px-2.5 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
            />
            <input
              type="number"
              min={currentAge + 1}
              max={90}
              value={retireAge}
              onChange={(e) => setRetireAge(parseInt(e.target.value) || 65)}
              className="w-full px-2.5 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{years} years of tax-free growth</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Balance ($)
          </label>
          <input
            type="number"
            min={0}
            value={currentBalance}
            onChange={(e) => setCurrentBalance(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Contribution ($/yr)
          </label>
          <input
            type="number"
            min={0}
            max={8000}
            value={annualContribution}
            onChange={(e) => setAnnualContribution(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">Max limit $7,000 ($8,000 if 50+)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Expected Investment Return (%/yr)
          </label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">S&amp;P 500 historical ~8-10%</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Estimated Retirement Tax Bracket (%)
          </label>
          <select
            value={retirementTaxBracket}
            onChange={(e) => setRetirementTaxBracket(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={12}>12% Tax Bracket</option>
            <option value={22}>22% Tax Bracket (Most Common)</option>
            <option value={24}>24% Tax Bracket</option>
            <option value={32}>32% Tax Bracket</option>
          </select>
          <span className="text-[10px] text-muted-foreground">Used to calculate tax savings</span>
        </div>
      </div>

      {/* Projection Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-500" />
            Tax-Free Nest Egg &amp; Tax Shelter Summary
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Projection"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Tax-Free Nest Egg</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">100% Tax-free withdrawals</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Your Contributions</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totalContributed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">After-tax deposits</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Tax-Free Growth</span>
            <p className="text-2xl font-bold text-foreground">
              +${totalGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Pure compound returns</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Taxes Saved</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +${taxFreeSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Zero tax on gains</span>
          </div>
        </div>
      </div>
    </div>
  );
}
