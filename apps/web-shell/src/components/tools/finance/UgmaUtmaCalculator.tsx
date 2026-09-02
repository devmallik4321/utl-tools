"use client";

import { useState, useMemo } from "react";
import { Baby, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function UgmaUtmaCalculator() {
  const [childAge, setChildAge] = useState<number>(4);
  const [transferAge, setTransferAge] = useState<number>(21); // 18 or 21
  const [initialDeposit, setInitialDeposit] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(350);
  const [annualReturn, setAnnualReturn] = useState<number>(8.0);
  const [parentTaxBracket, setParentTaxBracket] = useState<number>(32);
  const [copied, setCopied] = useState<boolean>(false);

  const { finalBalance, totalDeposited, compoundEarnings, annualYield, kiddieTaxOwed, years } = useMemo(() => {
    const y = Math.max(1, transferAge - childAge);
    const months = y * 12;
    const monthlyRate = annualReturn / 100 / 12;

    let balance = initialDeposit;
    let deposits = 0;

    for (let m = 1; m <= months; m++) {
      balance = (balance + monthlyContribution) * (1 + monthlyRate);
      deposits += monthlyContribution;
    }

    const earnings = Math.max(0, balance - initialDeposit - deposits);

    // Assume ~2% annual taxable dividend/interest yield on portfolio
    const yearlyUnearned = balance * 0.02;

    // IRS Kiddie Tax calculation:
    // First $1,300: tax-free
    // Next $1,300: taxed at child's rate (10%)
    // Above $2,600: taxed at parent's marginal rate
    let tax = 0;
    if (yearlyUnearned > 1300) {
      const atChildRate = Math.min(1300, yearlyUnearned - 1300);
      tax += atChildRate * 0.10;
      if (yearlyUnearned > 2600) {
        const atParentRate = yearlyUnearned - 2600;
        tax += atParentRate * (parentTaxBracket / 100);
      }
    }

    return {
      finalBalance: Math.round(balance),
      totalDeposited: Math.round(deposits + initialDeposit),
      compoundEarnings: Math.round(earnings),
      annualYield: Math.round(yearlyUnearned),
      kiddieTaxOwed: Math.round(tax),
      years: y,
    };
  }, [childAge, transferAge, initialDeposit, monthlyContribution, annualReturn, parentTaxBracket]);

  const handleCopy = async () => {
    const summary = `Custodial UGMA/UTMA Growth Projection (${years} Years to Age ${transferAge}):\n• Total Account Value at Age ${transferAge}: $${finalBalance.toLocaleString()}\n• Total Capital Deposited: $${totalDeposited.toLocaleString()}\n• Compound Investment Growth: +$${compoundEarnings.toLocaleString()}\n• Annual Unearned Income Yield: ~$${annualYield.toLocaleString()}/yr\n• Estimated Annual Kiddie Tax: $${kiddieTaxOwed.toLocaleString()}/yr`;
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
            Current Age / Transfer Age
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              max={20}
              value={childAge}
              onChange={(e) => setChildAge(parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
            />
            <select
              value={transferAge}
              onChange={(e) => setTransferAge(parseInt(e.target.value))}
              className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
            >
              <option value={18}>Age 18 (Majority)</option>
              <option value={21}>Age 21 (UTMA)</option>
              <option value={25}>Age 25 (State Max)</option>
            </select>
          </div>
          <span className="text-[10px] text-muted-foreground">{years} compounding years</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Initial Principal ($)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={initialDeposit}
            onChange={(e) => setInitialDeposit(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly Deposit ($)
          </label>
          <input
            type="number"
            min={0}
            step={50}
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Parent Marginal Tax (%)
          </label>
          <select
            value={parentTaxBracket}
            onChange={(e) => setParentTaxBracket(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={24}>24% Federal Bracket</option>
            <option value={32}>32% Federal Bracket</option>
            <option value={35}>35% Federal Bracket</option>
            <option value={37}>37% Top Federal Bracket</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Baby className="w-4 h-4 text-emerald-500" />
            Custodial Transfer Value &amp; IRS Kiddie Tax Projection
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Portfolio at Age {transferAge}
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${finalBalance.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Full legal ownership to child</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Total Invested</span>
            <p className="text-2xl font-bold text-foreground">${totalDeposited.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Principal deposited</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Compound Returns</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              +${compoundEarnings.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Investment earnings</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Annual Kiddie Tax</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ${kiddieTaxOwed.toLocaleString()}/yr
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">On ~$1,300+ unearned gains</span>
          </div>
        </div>
      </div>
    </div>
  );
}
