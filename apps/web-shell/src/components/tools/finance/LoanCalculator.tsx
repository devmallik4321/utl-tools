"use client";

import { useState } from "react";
import { DollarSign, Percent, Calendar, PieChart, Table, TrendingDown, CheckCircle2 } from "lucide-react";

export function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(250000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);

  // Amortization calculation
  const calculateLoan = (years: number) => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = years * 12;

    if (principal <= 0 || monthlyRate <= 0 || totalMonths <= 0) {
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        schedule: [],
      };
    }

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - principal;

    // Yearly schedule
    let remainingBalance = principal;
    const schedule: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = [];

    for (let y = 1; y <= years; y++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let m = 1; m <= 12; m++) {
        const interestForMonth = remainingBalance * monthlyRate;
        const principalForMonth = monthlyPayment - interestForMonth;
        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        remainingBalance -= principalForMonth;
      }

      schedule.push({
        year: y,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        balance: Math.max(0, Math.round(remainingBalance)),
      });
    }

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      schedule,
    };
  };

  const currentLoan = calculateLoan(loanTermYears);
  const comparison15 = calculateLoan(15);
  const comparison30 = calculateLoan(30);

  const interestRatio = currentLoan.totalPayment > 0
    ? Math.round((currentLoan.totalInterest / currentLoan.totalPayment) * 100)
    : 0;
  const principalRatio = 100 - interestRatio;

  const interestSavingsOn15 = comparison30.totalInterest - comparison15.totalInterest;

  return (
    <div className="space-y-6">
      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-card border border-border rounded-xl">
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Loan Amount ($)
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Annual Interest Rate (%)
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
            Loan Term (Years)
          </label>
          <select
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          >
            <option value={5}>5 Years (Auto / Personal)</option>
            <option value={10}>10 Years</option>
            <option value={15}>15 Years (Fixed Mortgage)</option>
            <option value={20}>20 Years</option>
            <option value={30}>30 Years (Standard Mortgage)</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Monthly Payment (P&amp;I)
          </span>
          <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
            ${currentLoan.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-muted-foreground">Fixed monthly installment</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Interest Cost
          </span>
          <p className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
            ${currentLoan.totalInterest.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground">{interestRatio}% of total repayment is interest</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Loan Repayment
          </span>
          <p className="text-3xl font-black font-mono text-foreground">
            ${currentLoan.totalPayment.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground">${loanAmount.toLocaleString()} Principal + Interest</span>
        </div>
      </div>

      {/* Ratio Progress Visualizer */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between text-xs font-semibold text-foreground">
          <span>Principal: {principalRatio}% (${loanAmount.toLocaleString()})</span>
          <span className="text-rose-600 dark:text-rose-400">Interest: {interestRatio}% (${currentLoan.totalInterest.toLocaleString()})</span>
        </div>
        <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${principalRatio}%` }} />
          <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${interestRatio}%` }} />
        </div>
      </div>

      {/* 15 vs 30 Year Scenario Comparison Callout */}
      {loanTermYears >= 15 && (
        <div className="p-5 bg-gradient-to-r from-blue-50/60 to-emerald-50/60 dark:from-blue-950/30 dark:to-emerald-950/30 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            <TrendingDown className="w-4 h-4" />
            <span>Scenario Comparison: 15-Year vs 30-Year Mortgage</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground leading-relaxed">
            Switching from a 30-year to a 15-year term increases your monthly payment by <strong>+${(comparison15.monthlyPayment - comparison30.monthlyPayment).toFixed(0)}/mo</strong>, but saves you <strong className="text-emerald-600 dark:text-emerald-400">${interestSavingsOn15.toLocaleString()}</strong> in total interest costs over the life of the loan.
          </p>
        </div>
      )}

      {/* Amortization Schedule */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Amortization Payoff Schedule
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px]">
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Principal Paid</th>
                <th className="py-2.5 px-3">Interest Paid</th>
                <th className="py-2.5 px-3 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {currentLoan.schedule.map((row) => (
                <tr key={row.year} className="hover:bg-muted/40">
                  <td className="py-2.5 px-3 font-bold text-foreground">Year {row.year}</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">${row.principalPaid.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400">${row.interestPaid.toLocaleString()}</td>
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
