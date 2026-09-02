"use client";

import { useState, useMemo } from "react";
import { Building2, DollarSign, TrendingUp, Percent, Copy, Check, Sparkles, PieChart } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CapRateCalculator() {
  const [propertyPrice, setPropertyPrice] = useState<number>(425000);
  const [annualRent, setAnnualRent] = useState<number>(38400); // $3,200/mo
  const [vacancyRate, setVacancyRate] = useState<number>(5); // 5%
  const [operatingExpenses, setOperatingExpenses] = useState<number>(12000); // Taxes, insurance, maintenance, management
  const [copied, setCopied] = useState<boolean>(false);

  const { effectiveGrossIncome, netOperatingIncome, capRate, grm, onePercentRatio } = useMemo(() => {
    const vacancyLoss = annualRent * (vacancyRate / 100);
    const egi = Math.max(0, annualRent - vacancyLoss);
    const noi = Math.max(0, egi - operatingExpenses);

    const cap = propertyPrice > 0 ? (noi / propertyPrice) * 100 : 0;
    const grmVal = annualRent > 0 ? propertyPrice / annualRent : 0;
    const monthlyRent = annualRent / 12;
    const onePct = propertyPrice > 0 ? (monthlyRent / propertyPrice) * 100 : 0;

    return {
      effectiveGrossIncome: Math.round(egi),
      netOperatingIncome: Math.round(noi),
      capRate: cap.toFixed(2),
      grm: grmVal.toFixed(1),
      onePercentRatio: onePct.toFixed(2),
    };
  }, [propertyPrice, annualRent, vacancyRate, operatingExpenses]);

  const handleCopy = async () => {
    const summary = `Rental Real Estate Cap Rate Analysis ($${propertyPrice.toLocaleString()} Valuation):\n• Net Operating Income (NOI): $${netOperatingIncome.toLocaleString()}/yr\n• Capitalization Rate (Cap Rate): ${capRate}%\n• Effective Gross Income: $${effectiveGrossIncome.toLocaleString()}/yr\n• Gross Rent Multiplier (GRM): ${grm}x\n• 1% Rule Metric: ${onePercentRatio}%`;
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
            Property Value ($)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Gross Annual Rent ($)
          </label>
          <input
            type="number"
            min={0}
            step={1200}
            value={annualRent}
            onChange={(e) => setAnnualRent(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">
            ~${(annualRent / 12).toFixed(0)}/mo scheduled rent
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Vacancy Loss (%)
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={vacancyRate}
            onChange={(e) => setVacancyRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Standard buffer: 5% - 8%</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Expenses ($)
          </label>
          <input
            type="number"
            min={0}
            step={500}
            value={operatingExpenses}
            onChange={(e) => setOperatingExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
          <span className="text-[10px] text-muted-foreground">Taxes, insurance, HOA, upkeep</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-500" />
            Cap Rate &amp; Net Operating Performance
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Valuation"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Cap Rate</span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{capRate}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Unleveraged return on asset</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Net Operating Income</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${netOperatingIncome.toLocaleString()}/yr</p>
            <span className="text-[10px] text-muted-foreground font-sans">EGI minus operating expenses</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Gross Rent Multiplier</span>
            <p className="text-2xl font-bold text-foreground">{grm}x</p>
            <span className="text-[10px] text-muted-foreground font-sans">Price to Gross Income ratio</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">1% Rule Ratio</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{onePercentRatio}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Monthly rent / Price target 1%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
