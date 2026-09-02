"use client";

import { useState, useMemo } from "react";
import { PiggyBank, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Gift } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function FourZeroOneKCalculator() {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retireAge, setRetireAge] = useState<number>(65);
  const [currentBalance, setCurrentBalance] = useState<number>(45000);
  const [annualSalary, setAnnualSalary] = useState<number>(90000);
  const [employeeContributionPct, setEmployeeContributionPct] = useState<number>(8);
  const [employerMatchPct, setEmployerMatchPct] = useState<number>(50); // 50% match
  const [employerMatchCapPct, setEmployerMatchCapPct] = useState<number>(6); // up to 6% of salary
  const [annualReturn, setAnnualReturn] = useState<number>(7.5);
  const [copied, setCopied] = useState<boolean>(false);

  const { finalBalance, totalEmployeeContributed, totalEmployerMatch, totalGrowth, yearsToInvest } = useMemo(() => {
    const years = Math.max(1, retireAge - currentAge);
    const r = annualReturn / 100;

    let balance = currentBalance;
    let employeeTotal = 0;
    let employerTotal = 0;

    // Year-by-year simulation
    for (let y = 1; y <= years; y++) {
      const employeeAnnual = annualSalary * (employeeContributionPct / 100);
      const matchablePct = Math.min(employeeContributionPct, employerMatchCapPct);
      const employerAnnual = annualSalary * (matchablePct / 100) * (employerMatchPct / 100);

      const totalAnnualContribution = employeeAnnual + employerAnnual;
      employeeTotal += employeeAnnual;
      employerTotal += employerAnnual;

      balance = (balance + totalAnnualContribution) * (1 + r);
    }

    const growth = Math.max(0, balance - currentBalance - employeeTotal - employerTotal);

    return {
      finalBalance: balance,
      totalEmployeeContributed: employeeTotal,
      totalEmployerMatch: employerTotal,
      totalGrowth: growth,
      yearsToInvest: years,
    };
  }, [
    currentAge,
    retireAge,
    currentBalance,
    annualSalary,
    employeeContributionPct,
    employerMatchPct,
    employerMatchCapPct,
    annualReturn,
  ]);

  const handleCopy = async () => {
    const summary = `401(k) Retirement Growth Projection (${yearsToInvest} Years to Age ${retireAge})\n• Projected Nest Egg at Age ${retireAge}: $${finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Your Contributions: $${totalEmployeeContributed.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Employer Match Free Money: +$${totalEmployerMatch.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Compound Investment Growth: +$${totalGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
            Current Age / Retire Age
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={18}
              max={80}
              value={currentAge}
              onChange={(e) => setCurrentAge(parseInt(e.target.value) || 30)}
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
          <span className="text-[10px] text-muted-foreground">{yearsToInvest} years of compounding</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Base Salary ($)
          </label>
          <input
            type="number"
            min={1000}
            value={annualSalary}
            onChange={(e) => setAnnualSalary(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current 401(k) Balance ($)
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
            Expected Growth (%/yr)
          </label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Your Contribution (% of Salary)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={employeeContributionPct}
            onChange={(e) => setEmployeeContributionPct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground">
            ${((annualSalary * employeeContributionPct) / 100).toLocaleString()}/yr (~$
            {(((annualSalary * employeeContributionPct) / 100) / 12).toFixed(0)}/mo)
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Employer Match Rate (%)
          </label>
          <select
            value={employerMatchPct}
            onChange={(e) => setEmployerMatchPct(parseFloat(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          >
            <option value={50}>50% Match (Standard)</option>
            <option value={100}>100% Dollar-for-Dollar Match</option>
            <option value={25}>25% Match</option>
            <option value={0}>0% (No Company Match)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Employer Match Cap (% of Salary)
          </label>
          <select
            value={employerMatchCapPct}
            onChange={(e) => setEmployerMatchCapPct(parseFloat(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={6}>Up to 6% of Salary (Most Common)</option>
            <option value={5}>Up to 5% of Salary</option>
            <option value={4}>Up to 4% of Salary</option>
            <option value={8}>Up to 8% of Salary</option>
          </select>
        </div>
      </div>

      {/* Projection Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-emerald-500" />
            401(k) Nest Egg Projection at Age {retireAge}
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
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Projected Balance</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Total at retirement</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">You Contributed</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totalEmployeeContributed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Your personal paycheck savings</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Employer Match</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              +${totalEmployerMatch.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">100% Free company money</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Compound Growth</span>
            <p className="text-2xl font-bold text-foreground">
              +${totalGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Compound stock market return</span>
          </div>
        </div>
      </div>
    </div>
  );
}
