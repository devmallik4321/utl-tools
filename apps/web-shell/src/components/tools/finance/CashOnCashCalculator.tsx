"use client";

import { useState, useMemo } from "react";
import { DollarSign, Building2, TrendingUp, Percent, Copy, Check, Sparkles, PieChart } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CashOnCashCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(380000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [closingCosts, setClosingCosts] = useState<number>(8500);
  const [rehabCost, setRehabCost] = useState<number>(10000);
  const [monthlyRent, setMonthlyRent] = useState<number>(3100);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(1050); // Taxes, insurance, HOA, upkeep, vacancy
  const [mortgageRate, setMortgageRate] = useState<number>(6.75); // 30-year fixed rate
  const [copied, setCopied] = useState<boolean>(false);

  const { totalCashInvested, monthlyMortgage, monthlyCashFlow, annualCashFlow, cashOnCashReturn } = useMemo(() => {
    const downPaymentAmount = purchasePrice * (downPaymentPct / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const totalCash = downPaymentAmount + closingCosts + rehabCost;

    // Monthly Mortgage Payment: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
    const monthlyRate = mortgageRate / 100 / 12;
    const numPayments = 30 * 12;

    let piPayment = 0;
    if (loanAmount > 0 && monthlyRate > 0) {
      piPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    const netMonthly = monthlyRent - monthlyExpenses - piPayment;
    const netAnnual = netMonthly * 12;

    const coc = totalCash > 0 ? (netAnnual / totalCash) * 100 : 0;

    return {
      totalCashInvested: Math.round(totalCash),
      monthlyMortgage: Math.round(piPayment),
      monthlyCashFlow: Math.round(netMonthly),
      annualCashFlow: Math.round(netAnnual),
      cashOnCashReturn: coc.toFixed(2),
    };
  }, [purchasePrice, downPaymentPct, closingCosts, rehabCost, monthlyRent, monthlyExpenses, mortgageRate]);

  const handleCopy = async () => {
    const summary = `Rental Real Estate Cash-on-Cash Analysis ($${purchasePrice.toLocaleString()} Purchase Price):\n• Total Cash Out-of-Pocket: $${totalCashInvested.toLocaleString()}\n• Monthly Rent: $${monthlyRent.toLocaleString()} | Operating Expenses: $${monthlyExpenses.toLocaleString()}\n• Monthly Mortgage (P&I): $${monthlyMortgage.toLocaleString()}\n• Net Monthly Cash Flow: $${monthlyCashFlow.toLocaleString()}/mo\n• Annual Pre-Tax Cash Flow: $${annualCashFlow.toLocaleString()}/year\n• Cash-on-Cash Return (CoC): ${cashOnCashReturn}%`;
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
            Purchase Price ($)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Down Payment (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">
            ${((purchasePrice * downPaymentPct) / 100).toLocaleString()} down
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Closing &amp; Rehab ($)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={closingCosts + rehabCost}
            onChange={(e) => {
              const val = Math.max(0, parseFloat(e.target.value) || 0);
              setClosingCosts(val * 0.45);
              setRehabCost(val * 0.55);
            }}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Title fees, inspections, repair</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Mortgage Rate (%)
          </label>
          <input
            type="number"
            min={1}
            max={15}
            step={0.125}
            value={mortgageRate}
            onChange={(e) => setMortgageRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">30-Year Fixed Term</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Gross Monthly Rent ($)
          </label>
          <input
            type="number"
            min={0}
            step={50}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly Expenses ($)
          </label>
          <input
            type="number"
            min={0}
            step={50}
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
          <span className="text-[10px] text-muted-foreground">Property taxes, insurance, HOA, upkeep, vacancy buffer</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-500" />
            Leveraged Cash-on-Cash Return Summary
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Return"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Cash-on-Cash Return</span>
            <p
              className={`text-3xl font-extrabold ${
                parseFloat(cashOnCashReturn) >= 8
                  ? "text-emerald-600 dark:text-emerald-400"
                  : parseFloat(cashOnCashReturn) > 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {cashOnCashReturn}%
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Annual cash / Total cash invested</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Net Monthly Cash Flow</span>
            <p
              className={`text-2xl font-bold ${
                monthlyCashFlow >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              ${monthlyCashFlow.toLocaleString()}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">After mortgage &amp; expenses</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Total Out-of-Pocket</span>
            <p className="text-2xl font-bold text-foreground">${totalCashInvested.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Down payment + closing + rehab</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Monthly Mortgage P&amp;I</span>
            <p className="text-2xl font-bold text-foreground">${monthlyMortgage.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Principal and interest</span>
          </div>
        </div>
      </div>
    </div>
  );
}
