"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, Package, BarChart3, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState<number>(5000); // Monthly fixed costs
  const [variableCost, setVariableCost] = useState<number>(20); // Unit cost
  const [pricePerUnit, setPricePerUnit] = useState<number>(60); // Sale price
  const [projectedUnits, setProjectedUnits] = useState<number>(150); // Volume simulator
  const [copied, setCopied] = useState<boolean>(false);

  // Contribution Margin = Price - Variable Cost
  const contributionMargin = pricePerUnit - variableCost;
  const contributionMarginRatio = pricePerUnit > 0 ? (contributionMargin / pricePerUnit) * 100 : 0;

  // Break-Even Units = Fixed Costs / Contribution Margin
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;

  // Simulation
  const simulatedRevenue = projectedUnits * pricePerUnit;
  const simulatedTotalCosts = fixedCosts + (projectedUnits * variableCost);
  const simulatedNetProfit = simulatedRevenue - simulatedTotalCosts;

  const handleCopy = async () => {
    const summary = `Break-Even Analysis\n• Fixed Costs: $${fixedCosts.toLocaleString()}\n• Price / Unit: $${pricePerUnit.toFixed(2)} (Variable Cost: $${variableCost.toFixed(2)})\n• Contribution Margin: $${contributionMargin.toFixed(2)}/unit (${contributionMarginRatio.toFixed(1)}%)\n• Break-Even Point: ${breakEvenUnits.toLocaleString()} units ($${breakEvenRevenue.toLocaleString()} Revenue)\n• Projected Profit at ${projectedUnits} units: $${simulatedNetProfit.toFixed(2)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Total Fixed Costs ($)
          </label>
          <input
            type="number"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Rent, payroll, software, overhead</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Variable Cost Per Unit ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={variableCost}
            onChange={(e) => setVariableCost(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Materials, fees, direct labor</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Selling Price Per Unit ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Customer retail or wholesale price</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Break-Even Point &amp; Margin Analysis
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
            <span className="text-xs font-semibold text-muted-foreground uppercase">Break-Even Units</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {breakEvenUnits.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">Units</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Sales needed to cover $0 net</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Break-Even Revenue</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${breakEvenRevenue.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Gross sales volume required</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Contribution Margin</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${contributionMargin.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">({contributionMarginRatio.toFixed(1)}%)</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Profit per unit toward fixed costs</span>
          </div>
        </div>

        {/* Projected Profit Simulator */}
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Profit Simulator: Projected Monthly Unit Sales
            </span>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{projectedUnits} units</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(500, breakEvenUnits * 2)}
            value={projectedUnits}
            onChange={(e) => setProjectedUnits(parseInt(e.target.value) || 0)}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
            <span>Projected Net Profit / Loss:</span>
            <span className={`text-base font-extrabold font-mono ${simulatedNetProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {simulatedNetProfit >= 0 ? "+" : ""}${simulatedNetProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
