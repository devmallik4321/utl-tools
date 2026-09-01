"use client";

import { useState } from "react";
import { DollarSign, Calendar, PieChart, Table, Copy, Check, Download } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function LoanEmiCalculator() {
  const [principal, setPrincipal] = useState<number>(250000);
  const [annualRate, setAnnualRate] = useState<number>(6.5);
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const months = tenureYears * 12;
  const monthlyRate = annualRate / 12 / 100;

  // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  let emi = 0;
  if (monthlyRate > 0 && months > 0) {
    emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  } else if (months > 0) {
    emi = principal / months;
  }

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  const principalPct = totalPayment > 0 ? ((principal / totalPayment) * 100).toFixed(1) : "0";
  const interestPct = totalPayment > 0 ? ((totalInterest / totalPayment) * 100).toFixed(1) : "0";

  // Generate Amortization Schedule
  const generateSchedule = (): AmortizationRow[] => {
    const rows: AmortizationRow[] = [];
    let balance = principal;

    for (let m = 1; m <= months; m++) {
      const interestPaid = balance * monthlyRate;
      const principalPaid = emi - interestPaid;
      balance = Math.max(0, balance - principalPaid);

      rows.push({
        month: m,
        payment: emi,
        principal: principalPaid,
        interest: interestPaid,
        balance: balance,
      });
    }
    return rows;
  };

  const handleCopySummary = async () => {
    const summary = `Loan EMI & Amortization Summary\n• Principal: $${principal.toLocaleString()}\n• Interest Rate: ${annualRate}%\n• Tenure: ${tenureYears} Years (${months} months)\n• Monthly EMI: $${emi.toFixed(2)}\n• Total Interest: $${totalInterest.toFixed(2)}\n• Total Payment: $${totalPayment.toFixed(2)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const schedule = showSchedule ? generateSchedule() : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Loan Principal */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Loan Amount ($)
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">${principal.toLocaleString()} Principal</span>
        </div>

        {/* Interest Rate */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Interest Rate (% p.a.)
          </label>
          <input
            type="number"
            step="0.1"
            value={annualRate}
            onChange={(e) => setAnnualRate(Math.max(0.01, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">{monthlyRate ? (monthlyRate * 100).toFixed(3) : 0}% monthly rate</span>
        </div>

        {/* Tenure */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Loan Tenure (Years)
          </label>
          <input
            type="number"
            value={tenureYears}
            onChange={(e) => setTenureYears(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">{months} monthly payments</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Payment & Repayment Breakdown
          </h4>
          <button
            onClick={handleCopySummary}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly EMI Payment</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${emi.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Fixed monthly installment</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Interest Payable</span>
            <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              ${totalInterest.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">{interestPct}% of total repayment</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Repayment Amount</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${totalPayment.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Principal + All Interest</span>
          </div>
        </div>

        {/* Visual Ratio Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
            <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${principalPct}%` }} />
            <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${interestPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Principal ({principalPct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Total Interest ({interestPct}%)
            </span>
          </div>
        </div>

        {/* Toggle Amortization Schedule */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-card hover:bg-muted border border-border text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <Table className="w-3.5 h-3.5 text-blue-500" />
            <span>{showSchedule ? "Hide Amortization Schedule" : "View Full Month-by-Month Amortization Schedule"}</span>
          </button>
        </div>

        {/* Amortization Table */}
        {showSchedule && (
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-bold text-foreground block">
              Complete Amortization Schedule ({months} Monthly Payments):
            </span>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-muted/60 text-muted-foreground sticky top-0 border-b border-border">
                  <tr>
                    <th className="p-2">Month</th>
                    <th className="p-2">EMI Payment</th>
                    <th className="p-2">Principal</th>
                    <th className="p-2">Interest</th>
                    <th className="p-2 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-muted/20">
                      <td className="p-2 text-muted-foreground">{row.month}</td>
                      <td className="p-2 font-medium">${row.payment.toFixed(2)}</td>
                      <td className="p-2 text-blue-600 dark:text-blue-400">${row.principal.toFixed(2)}</td>
                      <td className="p-2 text-rose-600 dark:text-rose-400">${row.interest.toFixed(2)}</td>
                      <td className="p-2 text-right font-medium">${row.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
