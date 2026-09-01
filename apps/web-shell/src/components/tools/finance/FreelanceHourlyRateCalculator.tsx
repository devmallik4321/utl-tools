"use client";

import { useState } from "react";
import { DollarSign, Briefcase, Calendar, ShieldCheck, Copy, Check, PieChart } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function FreelanceHourlyRateCalculator() {
  const [targetAnnualIncome, setTargetAnnualIncome] = useState<number>(85000);
  const [annualExpenses, setAnnualExpenses] = useState<number>(12000); // Software, hardware, health insurance, office
  const [taxRate, setTaxRate] = useState<number>(25); // Estimated self-employment & income tax %
  const [weeksOff, setWeeksOff] = useState<number>(4); // Vacation + sick days + holidays
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState<number>(25); // Real billable client hours vs admin
  const [profitMargin, setProfitMargin] = useState<number>(15); // % business growth reserve
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const workingWeeks = Math.max(1, 52 - weeksOff);
  const annualBillableHours = workingWeeks * billableHoursPerWeek;

  // Pre-tax required gross revenue = (Target Net + Annual Expenses) / (1 - TaxRate / 100)
  const baseNetRequired = targetAnnualIncome + annualExpenses;
  const taxMultiplier = Math.max(0.01, 1 - taxRate / 100);
  const preTaxGrossRevenue = baseNetRequired / taxMultiplier;
  const totalTargetRevenue = preTaxGrossRevenue * (1 + profitMargin / 100);

  // Minimum required hourly rate
  const minHourlyRate = annualBillableHours > 0 ? totalTargetRevenue / annualBillableHours : 0;
  const dayRate = minHourlyRate * (billableHoursPerWeek / 5);
  const estimatedTaxes = totalTargetRevenue - (targetAnnualIncome + annualExpenses);

  const handleCopy = async () => {
    const summary = `Freelance Rate Calculation\n• Target Take-Home: $${targetAnnualIncome.toLocaleString()}\n• Minimum Hourly Rate: $${minHourlyRate.toFixed(2)}/hr\n• Day Rate (5h billable/day): $${dayRate.toFixed(2)}/day\n• Estimated Gross Target: $${totalTargetRevenue.toFixed(2)}\n• Billable Hours: ${annualBillableHours.toLocaleString()} hrs/year (${workingWeeks} working weeks @ ${billableHoursPerWeek} hrs/wk)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Configuration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Target Net Income */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Desired Annual Net Pay ($)
          </label>
          <input
            type="number"
            value={targetAnnualIncome}
            onChange={(e) => setTargetAnnualIncome(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Personal income after taxes</span>
        </div>

        {/* Business Overhead */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Annual Expenses &amp; Overhead ($)
          </label>
          <input
            type="number"
            value={annualExpenses}
            onChange={(e) => setAnnualExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Software, health, equipment</span>
        </div>

        {/* Estimated Taxes */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Estimated Tax Rate (%)
          </label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Math.min(90, Math.max(0, parseFloat(e.target.value) || 0)))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Self-employment + Income tax</span>
        </div>

        {/* Billable Hours per Week */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Billable Hours / Week
          </label>
          <input
            type="number"
            value={billableHoursPerWeek}
            onChange={(e) => setBillableHoursPerWeek(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Typical freelancers bill 20-30 hrs</span>
        </div>

        {/* Weeks Off / Year */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Non-Working Weeks / Year
          </label>
          <input
            type="number"
            value={weeksOff}
            onChange={(e) => setWeeksOff(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Vacation, sickness, holidays</span>
        </div>

        {/* Profit Margin */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Business Profit Buffer (%)
          </label>
          <input
            type="number"
            value={profitMargin}
            onChange={(e) => setProfitMargin(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Cash reserve &amp; business growth</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Recommended Rate &amp; Revenue Target
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
            <span className="text-xs font-semibold text-muted-foreground uppercase">Minimum Hourly Rate</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${minHourlyRate.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/hr</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Charge at least this per billable hour</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Standard Day Rate</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${dayRate.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/day</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Based on {(billableHoursPerWeek / 5).toFixed(1)} billable hrs/day</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Gross Invoiced Target</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${totalTargetRevenue.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Total annual client invoicing needed</span>
          </div>
        </div>

        {/* Project Scope Quick Estimator */}
        <div className="p-4 bg-card rounded-xl border border-border space-y-2">
          <span className="text-xs font-bold text-foreground block">
            Project Scope Pricing Quick Reference:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 bg-muted/40 rounded-lg">
              <span className="text-muted-foreground text-[10px] block">10-HOUR SPRINT</span>
              <span className="font-bold text-foreground">${(minHourlyRate * 10).toFixed(0)}</span>
            </div>
            <div className="p-2 bg-muted/40 rounded-lg">
              <span className="text-muted-foreground text-[10px] block">1-WEEK PROJECT (25h)</span>
              <span className="font-bold text-foreground">${(minHourlyRate * 25).toFixed(0)}</span>
            </div>
            <div className="p-2 bg-muted/40 rounded-lg">
              <span className="text-muted-foreground text-[10px] block">2-WEEK PROJECT (50h)</span>
              <span className="font-bold text-foreground">${(minHourlyRate * 50).toFixed(0)}</span>
            </div>
            <div className="p-2 bg-muted/40 rounded-lg">
              <span className="text-muted-foreground text-[10px] block">MONTHLY RETAINER (100h)</span>
              <span className="font-bold text-foreground">${(minHourlyRate * 100).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
