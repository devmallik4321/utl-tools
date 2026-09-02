"use client";

import { useState, useMemo } from "react";
import { Sun, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Zap } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SolarPaybackCalculator() {
  const [systemCost, setSystemCost] = useState<number>(22000);
  const [taxCreditPct, setTaxCreditPct] = useState<number>(30); // 30% Federal IRA credit
  const [monthlyElectricBill, setMonthlyElectricBill] = useState<number>(220);
  const [solarOffsetPct, setSolarOffsetPct] = useState<number>(90); // 90% offset
  const [annualInflation, setAnnualInflation] = useState<number>(3.5); // 3.5% utility escalation
  const [copied, setCopied] = useState<boolean>(false);

  const { netCost, federalCreditAmount, year1Savings, paybackYears, cumulative25YrProfit } = useMemo(() => {
    const credit = systemCost * (taxCreditPct / 100);
    const net = Math.max(0, systemCost - credit);

    const annualBill = monthlyElectricBill * 12;
    const y1Savings = annualBill * (solarOffsetPct / 100);

    // Calculate payback break-even years
    let cumulative = 0;
    let years = 0;
    let currentSavings = y1Savings;
    let total25Yr = 0;

    for (let yr = 1; yr <= 25; yr++) {
      cumulative += currentSavings;
      total25Yr += currentSavings;
      if (cumulative < net) {
        years++;
      } else if (years === yr - 1) {
        // Fractional year
        const remaining = net - (cumulative - currentSavings);
        years += remaining / currentSavings;
      }
      currentSavings *= 1 + annualInflation / 100;
    }

    const netProfit25 = total25Yr - net;

    return {
      netCost: Math.round(net),
      federalCreditAmount: Math.round(credit),
      year1Savings: Math.round(y1Savings),
      paybackYears: years > 0 ? years.toFixed(1) : "N/A",
      cumulative25YrProfit: Math.round(netProfit25),
    };
  }, [systemCost, taxCreditPct, monthlyElectricBill, solarOffsetPct, annualInflation]);

  const handleCopy = async () => {
    const summary = `Residential Solar Payback Analysis ($${systemCost.toLocaleString()} System Cost):\n• 30% Federal Clean Energy Tax Credit: -$${federalCreditAmount.toLocaleString()}\n• Net Out-of-Pocket Cost: $${netCost.toLocaleString()}\n• Year 1 Electricity Savings: $${year1Savings.toLocaleString()}/year\n• Payback Break-Even Period: ${paybackYears} Years\n• 25-Year Net Profit: +$${cumulative25YrProfit.toLocaleString()}`;
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
            Gross System Cost ($)
          </label>
          <input
            type="number"
            min={5000}
            step={1000}
            value={systemCost}
            onChange={(e) => setSystemCost(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Turnkey equipment + installation</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly Electric Bill ($)
          </label>
          <input
            type="number"
            min={20}
            step={10}
            value={monthlyElectricBill}
            onChange={(e) => setMonthlyElectricBill(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">
            ~${(monthlyElectricBill * 12).toLocaleString()}/yr current cost
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Solar Bill Offset (%)
          </label>
          <select
            value={solarOffsetPct}
            onChange={(e) => setSolarOffsetPct(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={100}>100% Full Electric Offset</option>
            <option value={90}>90% Standard High Offset</option>
            <option value={75}>75% Moderate Offset</option>
            <option value={50}>50% Half Offset</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-500" />
            Solar ROI &amp; Payback Period
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Analysis"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Payback Break-Even</span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{paybackYears} Yrs</p>
            <span className="text-[10px] text-muted-foreground font-sans">100% Return of initial capital</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Federal Tax Credit</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              -${federalCreditAmount.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">30% IRA clean energy credit</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Net Out-Of-Pocket</span>
            <p className="text-2xl font-bold text-foreground">${netCost.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">True system installation basis</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">25-Year Net Profit</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              +${cumulative25YrProfit.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Lifetime energy savings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
