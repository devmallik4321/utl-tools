"use client";

import { useState, useMemo } from "react";
import { Home, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HomeAffordabilityCalculator() {
  const [annualIncome, setAnnualIncome] = useState<number>(120000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(500); // Car, student loans, cards
  const [downPayment, setDownPayment] = useState<number>(60000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [dtiRule, setDtiRule] = useState<number>(36); // 36% conventional, 43% FHA, 50% max
  const [copied, setCopied] = useState<boolean>(false);

  const { maxHomePrice, maxLoanAmount, maxMonthlyPayment, monthlyIncome, frontEndDti } = useMemo(() => {
    const monthlyGross = annualIncome / 12;
    // Back-end DTI cap on total debt (mortgage PITI + other debts)
    const maxTotalDebt = monthlyGross * (dtiRule / 100);
    // Allowable mortgage payment (Principal + Interest + Taxes + Insurance ~ 80% P&I, 20% TI)
    const allowableTotalMortgage = Math.max(0, maxTotalDebt - monthlyDebts);
    const allowablePI = allowableTotalMortgage * 0.82; // approximate P&I fraction

    // Loan amount from monthly P&I payment:
    // P = M * ( (1+r)^n - 1 ) / ( r * (1+r)^n )
    const r = interestRate / 100 / 12;
    const n = 360; // 30-year fixed

    let loan = 0;
    if (r > 0 && allowablePI > 0) {
      loan = (allowablePI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
    }

    const homePrice = Math.round(loan + downPayment);
    const frontDti = ((allowableTotalMortgage / monthlyGross) * 100).toFixed(1);

    return {
      maxHomePrice: homePrice,
      maxLoanAmount: Math.round(loan),
      maxMonthlyPayment: Math.round(allowableTotalMortgage),
      monthlyIncome: Math.round(monthlyGross),
      frontEndDti: frontDti,
    };
  }, [annualIncome, monthlyDebts, downPayment, interestRate, dtiRule]);

  const handleCopy = async () => {
    const summary = `Home Affordability Estimate ($${annualIncome.toLocaleString()}/yr Income @ ${interestRate}% rate):\n• Maximum Home Purchase Price: $${maxHomePrice.toLocaleString()}\n• Qualifying Mortgage Loan: $${maxLoanAmount.toLocaleString()}\n• Down Payment: $${downPayment.toLocaleString()}\n• Max Total Housing Payment: $${maxMonthlyPayment.toLocaleString()}/mo\n• Back-End DTI Limit: ${dtiRule}%`;
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
            Annual Gross Income ($)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={annualIncome}
            onChange={(e) => setAnnualIncome(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">${monthlyIncome.toLocaleString()}/mo before taxes</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly Debt Obligations ($)
          </label>
          <input
            type="number"
            min={0}
            value={monthlyDebts}
            onChange={(e) => setMonthlyDebts(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
          <span className="text-[10px] text-muted-foreground">Auto loans, credit cards, student loans</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Down Payment Cash ($)
          </label>
          <input
            type="number"
            min={0}
            step={5000}
            value={downPayment}
            onChange={(e) => setDownPayment(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Mortgage Interest Rate (%)
          </label>
          <input
            type="number"
            min={1}
            step={0.125}
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0.1, parseFloat(e.target.value) || 6.5))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Lender DTI Ratio Standard
          </label>
          <select
            value={dtiRule}
            onChange={(e) => setDtiRule(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={36}>36% Standard Conventional Rule (Recommended)</option>
            <option value={43}>43% FHA / High Flexibility Cap</option>
            <option value={50}>50% Maximum Conforming Debt Limit</option>
          </select>
        </div>
      </div>

      {/* Overview Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Home className="w-4 h-4 text-emerald-500" />
            Home Buying Power &amp; Qualifying Budget
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Budget"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Max Home Price</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${maxHomePrice.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Purchase price ceiling</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Mortgage Loan</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${maxLoanAmount.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">30-year fixed borrowing</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Max Monthly Payment</span>
            <p className="text-2xl font-bold text-foreground">${maxMonthlyPayment.toLocaleString()}/mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">PITI estimated ceiling</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Front-End DTI</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{frontEndDti}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Mortgage-to-income ratio</span>
          </div>
        </div>
      </div>
    </div>
  );
}
