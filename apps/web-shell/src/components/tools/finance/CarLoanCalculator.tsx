"use client";

import { useState } from "react";
import { Car, DollarSign, Calendar, Copy, Check, PieChart, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CarLoanCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState<number>(35000);
  const [downPayment, setDownPayment] = useState<number>(5000);
  const [tradeInValue, setTradeInValue] = useState<number>(2000);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(60); // 5-year loan
  const [interestRate, setInterestRate] = useState<number>(6.49);
  const [salesTaxPct, setSalesTaxPct] = useState<number>(6.5);
  const [dealerFees, setDealerFees] = useState<number>(850);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const salesTaxAmount = (vehiclePrice * salesTaxPct) / 100;
  const totalPurchasePrice = vehiclePrice + salesTaxAmount + dealerFees;
  const totalCredits = downPayment + tradeInValue;
  const loanPrincipal = Math.max(0, totalPurchasePrice - totalCredits);

  const monthlyRate = interestRate > 0 ? interestRate / 100 / 12 : 0;

  let monthlyPayment = 0;
  if (monthlyRate > 0 && loanTermMonths > 0) {
    const factor = Math.pow(1 + monthlyRate, loanTermMonths);
    monthlyPayment = (loanPrincipal * (monthlyRate * factor)) / (factor - 1);
  } else if (loanTermMonths > 0) {
    monthlyPayment = loanPrincipal / loanTermMonths;
  }

  const totalLoanRepayment = monthlyPayment * loanTermMonths;
  const totalInterestPaid = Math.max(0, totalLoanRepayment - loanPrincipal);
  const totalOverallCost = totalPurchasePrice + totalInterestPaid;

  const handleCopy = async () => {
    const summary = `Auto Loan Financing Summary\n• Vehicle Price: $${vehiclePrice.toLocaleString()} (Down Payment: $${downPayment.toLocaleString()}, Trade-in: $${tradeInValue.toLocaleString()})\n• Total Financed: $${loanPrincipal.toFixed(2)}\n• Monthly Payment: $${monthlyPayment.toFixed(2)}/mo (${loanTermMonths} Months @ ${interestRate}% APR)\n• Total Interest Paid: $${totalInterestPaid.toFixed(2)}\n• Total Cost of Car: $${totalOverallCost.toFixed(2)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Vehicle Price */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Vehicle Price ($)
          </label>
          <input
            type="number"
            min={0}
            value={vehiclePrice}
            onChange={(e) => setVehiclePrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>

        {/* Down Payment */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Cash Down Payment ($)
          </label>
          <input
            type="number"
            min={0}
            value={downPayment}
            onChange={(e) => setDownPayment(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>

        {/* Interest Rate */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Interest Rate (% APR)
          </label>
          <input
            type="number"
            min={0}
            step="0.05"
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>

        {/* Loan Term */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Loan Term (Months)
          </label>
          <select
            value={loanTermMonths}
            onChange={(e) => setLoanTermMonths(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-base bg-background border border-border rounded-lg font-bold"
          >
            <option value={36}>36 Months (3 Years)</option>
            <option value={48}>48 Months (4 Years)</option>
            <option value={60}>60 Months (5 Years)</option>
            <option value={72}>72 Months (6 Years)</option>
            <option value={84}>84 Months (7 Years)</option>
          </select>
        </div>
      </div>

      {/* Secondary Inputs: Trade-in, Tax, Fees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/20 border border-border rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Trade-in Value ($)</label>
          <input
            type="number"
            min={0}
            value={tradeInValue}
            onChange={(e) => setTradeInValue(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground">Equity from current car</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Sales Tax Rate (%)</label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={salesTaxPct}
            onChange={(e) => setSalesTaxPct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground font-mono">${salesTaxAmount.toFixed(2)} tax</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Title &amp; Dealer Fees ($)</label>
          <input
            type="number"
            min={0}
            value={dealerFees}
            onChange={(e) => setDealerFees(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground">Documentation &amp; registration</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-500" />
            Auto Loan Payment &amp; Cost Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Payment Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Payment</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${monthlyPayment.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            <span className="text-[10px] text-muted-foreground">For {loanTermMonths} months</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Financed Principal</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${loanPrincipal.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">After ${totalCredits.toLocaleString()} down/trade</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Interest Paid</span>
            <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              ${totalInterestPaid.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Cost of borrowing capital</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Out-of-Pocket</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${totalOverallCost.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Vehicle + Tax + Fees + Interest</span>
          </div>
        </div>
      </div>
    </div>
  );
}
