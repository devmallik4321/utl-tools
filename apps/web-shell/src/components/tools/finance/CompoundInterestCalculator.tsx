"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, Calendar, Table } from "lucide-react";

export function CompoundInterestCalculator() {
  const [initialPrincipal, setInitialPrincipal] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [interestRate, setInterestRate] = useState<number>(8);
  const [years, setYears] = useState<number>(10);
  const [compoundFreq, setCompoundFreq] = useState<number>(12); // monthly

  // Compute Year-by-Year
  const calculateGrowth = () => {
    let balance = initialPrincipal;
    let totalDeposits = initialPrincipal;
    const schedule: { year: number; balance: number; interestEarned: number; totalDeposits: number }[] = [];

    const r = interestRate / 100;
    const n = compoundFreq;

    for (let y = 1; y <= years; y++) {
      let startingYearBalance = balance;
      for (let m = 1; m <= 12; m++) {
        balance += monthlyContribution;
        totalDeposits += monthlyContribution;
        // compound monthly equivalent
        balance += balance * (r / 12);
      }
      const interestEarnedThisYear = balance - startingYearBalance - (monthlyContribution * 12);
      schedule.push({
        year: y,
        balance: Math.round(balance),
        interestEarned: Math.round(interestEarnedThisYear),
        totalDeposits: Math.round(totalDeposits),
      });
    }

    const totalInterest = balance - totalDeposits;
    return {
      finalBalance: Math.round(balance),
      totalDeposits: Math.round(totalDeposits),
      totalInterest: Math.round(totalInterest),
      schedule,
    };
  };

  const results = calculateGrowth();

  return (
    <div className="space-y-6">
      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-card border border-border rounded-xl">
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Initial Deposit ($)
          </label>
          <input
            type="number"
            value={initialPrincipal}
            onChange={(e) => setInitialPrincipal(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Monthly Addition ($)
          </label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Annual Return (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Time Horizon (Years)
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={years}
            onChange={(e) => setYears(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Future Value
          </span>
          <p className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ${results.finalBalance.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground">Total accumulated portfolio</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Interest Earned
          </span>
          <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
            ${results.totalInterest.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground">Pure compound investment growth</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Principal Invested
          </span>
          <p className="text-3xl font-black font-mono text-foreground">
            ${results.totalDeposits.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground">Your out-of-pocket contributions</span>
        </div>
      </div>

      {/* Year-by-Year Table */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Year-by-Year Growth Breakdown
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px]">
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Total Invested</th>
                <th className="py-2.5 px-3">Yearly Interest</th>
                <th className="py-2.5 px-3 text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {results.schedule.map((row) => (
                <tr key={row.year} className="hover:bg-muted/40">
                  <td className="py-2.5 px-3 font-bold text-foreground">Year {row.year}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">${row.totalDeposits.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-bold">+${row.interestEarned.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-black text-foreground">${row.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
