"use client";

import { useState } from "react";
import { Home, DollarSign, PieChart, Shield, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function MortgagePaymentCalculator() {
  const [homePrice, setHomePrice] = useState<number>(450000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.75);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState<number>(5400); // ~1.2% national average
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState<number>(1800); // Homeowner insurance
  const [monthlyHoa, setMonthlyHoa] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const downPaymentAmount = (homePrice * downPaymentPct) / 100;
  const loanPrincipal = Math.max(0, homePrice - downPaymentAmount);

  const monthlyRate = interestRate > 0 ? interestRate / 100 / 12 : 0;
  const totalMonths = loanTermYears * 12;

  // Monthly Principal & Interest (P&I) = P * [r(1+r)^n] / [(1+r)^n - 1]
  let monthlyPI = 0;
  if (monthlyRate > 0 && totalMonths > 0) {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    monthlyPI = (loanPrincipal * (monthlyRate * factor)) / (factor - 1);
  } else if (totalMonths > 0) {
    monthlyPI = loanPrincipal / totalMonths;
  }

  // Monthly Taxes & Insurance
  const monthlyPropertyTax = propertyTaxAnnual / 12;
  const monthlyInsurance = homeInsuranceAnnual / 12;

  // Private Mortgage Insurance (PMI) if down payment < 20% (~0.75% of loan per year)
  const monthlyPmi = downPaymentPct < 20 ? (loanPrincipal * 0.0075) / 12 : 0;

  const totalMonthlyPiti = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPmi + monthlyHoa;
  const totalLoanRepayment = monthlyPI * totalMonths;
  const totalInterestPaid = Math.max(0, totalLoanRepayment - loanPrincipal);
  const totalOverallCost = homePrice + totalInterestPaid + (monthlyPropertyTax + monthlyInsurance + monthlyHoa) * totalMonths;

  const handleCopy = async () => {
    const summary = `Mortgage (PITI) Payment Calculation\n• Home Price: $${homePrice.toLocaleString()} (Down Payment: $${downPaymentAmount.toLocaleString()} / ${downPaymentPct}%)\n• Total Monthly Payment: $${totalMonthlyPiti.toFixed(2)}/mo\n  - Principal & Interest: $${monthlyPI.toFixed(2)}\n  - Property Tax: $${monthlyPropertyTax.toFixed(2)}\n  - Homeowners Insurance: $${monthlyInsurance.toFixed(2)}\n  ${monthlyPmi > 0 ? `- PMI: $${monthlyPmi.toFixed(2)}\n` : ""}• Loan Term: ${loanTermYears} Years @ ${interestRate}%\n• Total Interest Paid: $${totalInterestPaid.toFixed(2)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Home Price */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Home Purchase Price ($)
          </label>
          <input
            type="number"
            value={homePrice}
            onChange={(e) => setHomePrice(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>

        {/* Down Payment */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Down Payment (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Math.min(99, Math.max(0, parseFloat(e.target.value) || 0)))}
              className="w-20 px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
            />
            <span className="text-xs text-muted-foreground font-mono truncate">
              ${downPaymentAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Interest Rate (% APR)
          </label>
          <input
            type="number"
            step="0.05"
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>

        {/* Loan Term */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Loan Term (Years)
          </label>
          <select
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-base bg-background border border-border rounded-lg"
          >
            <option value={30}>30-Year Fixed</option>
            <option value={20}>20-Year Fixed</option>
            <option value={15}>15-Year Fixed</option>
            <option value={10}>10-Year Fixed</option>
          </select>
        </div>
      </div>

      {/* Secondary Costs (Taxes, Insurance, HOA) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/20 border border-border rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Annual Property Tax ($/yr)</label>
          <input
            type="number"
            value={propertyTaxAnnual}
            onChange={(e) => setPropertyTaxAnnual(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground font-mono">${(propertyTaxAnnual / 12).toFixed(2)}/mo</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Annual Homeowners Insurance ($/yr)</label>
          <input
            type="number"
            value={homeInsuranceAnnual}
            onChange={(e) => setHomeInsuranceAnnual(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground font-mono">${(homeInsuranceAnnual / 12).toFixed(2)}/mo</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Monthly HOA Dues ($/mo)</label>
          <input
            type="number"
            value={monthlyHoa}
            onChange={(e) => setMonthlyHoa(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground">Condo or community dues</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Home className="w-4 h-4 text-emerald-500" />
            Total Monthly Mortgage (PITI) Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Mortgage Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Monthly Payment</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${totalMonthlyPiti.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Principal + Interest + Taxes + Insurance</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Loan Principal Amount</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${loanPrincipal.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">After ${(downPaymentAmount).toLocaleString()} down payment</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Interest Over Term</span>
            <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              ${totalInterestPaid.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Across {loanTermYears} years</span>
          </div>
        </div>

        {/* Monthly PITI Itemized List */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Itemized Monthly Payment Components:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-card rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">PRINCIPAL &amp; INTEREST</span>
              <span className="font-bold text-foreground">${monthlyPI.toFixed(2)}</span>
            </div>
            <div className="p-2.5 bg-card rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">PROPERTY TAXES</span>
              <span className="font-bold text-foreground">${monthlyPropertyTax.toFixed(2)}</span>
            </div>
            <div className="p-2.5 bg-card rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">HOME INSURANCE</span>
              <span className="font-bold text-foreground">${monthlyInsurance.toFixed(2)}</span>
            </div>
            <div className="p-2.5 bg-card rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">PMI / HOA DUES</span>
              <span className="font-bold text-foreground">${(monthlyPmi + monthlyHoa).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
