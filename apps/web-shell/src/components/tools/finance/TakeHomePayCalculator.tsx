"use client";

import { useState } from "react";
import { DollarSign, Wallet, PieChart, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function TakeHomePayCalculator() {
  const [grossAnnual, setGrossAnnual] = useState<number>(85000);
  const [payFrequency, setPayFrequency] = useState<"annual" | "monthly" | "biweekly" | "weekly">("biweekly");
  const [federalTaxPct, setFederalTaxPct] = useState<number>(14.5);
  const [stateTaxPct, setStateTaxPct] = useState<number>(4.5);
  const [ficaPct, setFicaPct] = useState<number>(7.65); // Social Security 6.2% + Medicare 1.45%
  const [preTaxDeductionAnnual, setPreTaxDeductionAnnual] = useState<number>(4000); // 401k / Health
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const taxableIncome = Math.max(0, grossAnnual - preTaxDeductionAnnual);
  const federalTaxAnnual = taxableIncome * (federalTaxPct / 100);
  const stateTaxAnnual = taxableIncome * (stateTaxPct / 100);
  const ficaTaxAnnual = grossAnnual * (ficaPct / 100);

  const totalTaxesAnnual = federalTaxAnnual + stateTaxAnnual + ficaTaxAnnual;
  const netTakeHomeAnnual = Math.max(0, grossAnnual - preTaxDeductionAnnual - totalTaxesAnnual);

  const periodsPerYear = payFrequency === "annual" ? 1 : payFrequency === "monthly" ? 12 : payFrequency === "biweekly" ? 26 : 52;
  const netPerPaycheck = netTakeHomeAnnual / periodsPerYear;
  const grossPerPaycheck = grossAnnual / periodsPerYear;
  const totalTaxPerPaycheck = totalTaxesAnnual / periodsPerYear;
  const effectiveTaxRate = grossAnnual > 0 ? (totalTaxesAnnual / grossAnnual) * 100 : 0;

  const handleCopy = async () => {
    const summary = `Take-Home Paycheck Breakdown\n• Gross Annual: $${grossAnnual.toLocaleString()}\n• Net Take-Home Pay: $${netPerPaycheck.toFixed(2)} / ${payFrequency}\n• Annual Net Income: $${netTakeHomeAnnual.toLocaleString()}\n• Total Taxes: $${totalTaxesAnnual.toLocaleString()} (${effectiveTaxRate.toFixed(1)}% effective rate)\n• Federal Tax: $${federalTaxAnnual.toFixed(0)} | State: $${stateTaxAnnual.toFixed(0)} | FICA: $${ficaTaxAnnual.toFixed(0)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Gross Salary */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Gross Annual Salary ($)
          </label>
          <input
            type="number"
            min={1}
            value={grossAnnual}
            onChange={(e) => setGrossAnnual(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Pre-tax total yearly earnings</span>
        </div>

        {/* Pay Frequency */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Paycheck Frequency
          </label>
          <select
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value as any)}
            className="w-full px-3 py-2 text-base font-bold bg-background border border-border rounded-lg"
          >
            <option value="biweekly">Bi-Weekly (26 Paychecks/Year)</option>
            <option value="monthly">Monthly (12 Paychecks/Year)</option>
            <option value="weekly">Weekly (52 Paychecks/Year)</option>
            <option value="annual">Annual (1 Year Total)</option>
          </select>
          <span className="text-[11px] text-muted-foreground">Select your payroll schedule</span>
        </div>

        {/* Pre-Tax Deductions */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Pre-Tax Deductions ($/yr)
          </label>
          <input
            type="number"
            min={0}
            value={preTaxDeductionAnnual}
            onChange={(e) => setPreTaxDeductionAnnual(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">401(k), HSA, Health Insurance</span>
        </div>

        {/* Federal Tax Rate */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Estimated Federal Tax (%)
          </label>
          <input
            type="number"
            min={0}
            max={50}
            step="0.5"
            value={federalTaxPct}
            onChange={(e) => setFederalTaxPct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Effective federal income tax rate</span>
        </div>

        {/* State Tax Rate */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Estimated State Tax (%)
          </label>
          <input
            type="number"
            min={0}
            max={20}
            step="0.5"
            value={stateTaxPct}
            onChange={(e) => setStateTaxPct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">State income tax (0% in TX, FL, WA)</span>
        </div>

        {/* FICA / Social Security & Medicare */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            FICA / Social Security &amp; Med (%)
          </label>
          <input
            type="number"
            min={0}
            max={15}
            step="0.05"
            value={ficaPct}
            onChange={(e) => setFicaPct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Standard US rate is 7.65%</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Estimated Net Paycheck &amp; Tax Deductions
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Paycheck Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Take-Home per Paycheck</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${netPerPaycheck.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Every {payFrequency} period</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Net Annual Take-Home</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${netTakeHomeAnnual.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Total money deposited in bank</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Annual Taxes</span>
            <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              ${totalTaxesAnnual.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">{effectiveTaxRate.toFixed(1)}% total effective tax rate</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Taxes per Paycheck</span>
            <p className="text-2xl font-bold font-mono text-muted-foreground">
              ${totalTaxPerPaycheck.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Withheld each pay cycle</span>
          </div>
        </div>

        {/* Detailed Itemized Deduction Table */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Tax &amp; Deduction Breakdown:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-sans block">FEDERAL INCOME TAX</span>
              <p className="text-foreground font-bold">${federalTaxAnnual.toFixed(0)}</p>
              <span className="text-[10px] text-muted-foreground font-sans">Rate: {federalTaxPct}%</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-sans block">STATE &amp; LOCAL TAX</span>
              <p className="text-foreground font-bold">${stateTaxAnnual.toFixed(0)}</p>
              <span className="text-[10px] text-muted-foreground font-sans">Rate: {stateTaxPct}%</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-sans block">FICA (SS &amp; MEDICARE)</span>
              <p className="text-foreground font-bold">${ficaTaxAnnual.toFixed(0)}</p>
              <span className="text-[10px] text-muted-foreground font-sans">Rate: {ficaPct}%</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-sans block">PRE-TAX RETIREMENT/BENEFITS</span>
              <p className="text-blue-600 dark:text-blue-400 font-bold">${preTaxDeductionAnnual.toFixed(0)}</p>
              <span className="text-[10px] text-muted-foreground font-sans">Reduces Taxable Base</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
