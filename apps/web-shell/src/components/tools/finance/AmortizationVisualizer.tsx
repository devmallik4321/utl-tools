"use client";

import { useState, useMemo } from "react";
import { Home, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, PieChart } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function AmortizationVisualizer() {
  const [loanAmount, setLoanAmount] = useState<number>(380000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [termYears, setTermYears] = useState<number>(30);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(200);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    baseMonthlyPayment,
    totalBaseInterest,
    acceleratedTotalInterest,
    interestSaved,
    monthsSaved,
    schedule,
  } = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = termYears * 12;

    let baseMonthly = 0;
    if (monthlyRate > 0) {
      baseMonthly =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      baseMonthly = loanAmount / totalMonths;
    }

    // Baseline calculation without extra payments
    const baseTotalInterest = Math.max(0, baseMonthly * totalMonths - loanAmount);

    // Accelerated calculation with extra monthly payments
    let balance = loanAmount;
    let actualMonths = 0;
    let totalInterestPaid = 0;
    const yearlyBreakdown: {
      year: number;
      principalPaid: number;
      interestPaid: number;
      endingBalance: number;
    }[] = [];

    let currentYearPrincipal = 0;
    let currentYearInterest = 0;

    while (balance > 0 && actualMonths < totalMonths + 12) {
      actualMonths++;
      const interestForMonth = balance * monthlyRate;
      let principalForMonth = baseMonthly - interestForMonth + extraMonthlyPayment;

      if (principalForMonth > balance) {
        principalForMonth = balance;
      }

      balance -= principalForMonth;
      totalInterestPaid += interestForMonth;
      currentYearPrincipal += principalForMonth;
      currentYearInterest += interestForMonth;

      if (actualMonths % 12 === 0 || balance <= 0) {
        yearlyBreakdown.push({
          year: Math.ceil(actualMonths / 12),
          principalPaid: currentYearPrincipal,
          interestPaid: currentYearInterest,
          endingBalance: Math.max(0, balance),
        });
        currentYearPrincipal = 0;
        currentYearInterest = 0;
      }

      if (balance <= 0) break;
    }

    const savedMonths = Math.max(0, totalMonths - actualMonths);
    const savedInterest = Math.max(0, baseTotalInterest - totalInterestPaid);

    return {
      baseMonthlyPayment: baseMonthly,
      totalBaseInterest: baseTotalInterest,
      acceleratedTotalInterest: totalInterestPaid,
      interestSaved: savedInterest,
      monthsSaved: savedMonths,
      schedule: yearlyBreakdown,
    };
  }, [loanAmount, interestRate, termYears, extraMonthlyPayment]);

  const handleCopy = async () => {
    const summary = `Mortgage Amortization Schedule ($${loanAmount.toLocaleString()} @ ${interestRate}% for ${termYears} Years)\n• Base Monthly Payment: $${baseMonthlyPayment.toFixed(2)}/mo\n• Extra Monthly Payment: +$${extraMonthlyPayment}/mo\n• Accelerated Payoff: Finished in ${(termYears - monthsSaved / 12).toFixed(1)} Years (${(monthsSaved / 12).toFixed(1)} Years Early!)\n• Total Lifetime Interest Saved: $${interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
            Loan Amount ($)
          </label>
          <input
            type="number"
            min={1000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Interest Rate (% APR)
          </label>
          <input
            type="number"
            min={0}
            step="0.125"
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Loan Term (Years)
          </label>
          <select
            value={termYears}
            onChange={(e) => setTermYears(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={30}>30 Years (Standard)</option>
            <option value={20}>20 Years</option>
            <option value={15}>15 Years</option>
            <option value={10}>10 Years</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Extra Monthly Pay ($/mo)
          </label>
          <input
            type="number"
            min={0}
            value={extraMonthlyPayment}
            onChange={(e) => setExtraMonthlyPayment(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-emerald-500" />
            Amortization Payoff &amp; Savings Summary
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Base Monthly P&amp;I</span>
            <p className="text-3xl font-extrabold font-mono text-foreground">
              ${baseMonthlyPayment.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Excludes property tax &amp; insurance</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Interest Saved</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground">
              By adding ${extraMonthlyPayment}/mo extra
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Time Shaved Off Loan</span>
            <p className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {(monthsSaved / 12).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">Years</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Finished in {schedule.length} years total</span>
          </div>
        </div>

        {/* Amortization Schedule Table */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Year-by-Year Amortization Schedule
          </span>
          <div className="overflow-x-auto max-h-72 border border-border rounded-xl">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-card text-muted-foreground border-b border-border sticky top-0">
                <tr>
                  <th className="p-2.5">Year</th>
                  <th className="p-2.5">Principal Paid</th>
                  <th className="p-2.5">Interest Paid</th>
                  <th className="p-2.5 text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {schedule.map((row) => (
                  <tr key={row.year} className="hover:bg-muted/50">
                    <td className="p-2.5 font-bold">Year {row.year}</td>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400">
                      ${row.principalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="p-2.5 text-rose-600 dark:text-rose-400">
                      ${row.interestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="p-2.5 text-right font-bold text-foreground">
                      ${row.endingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
