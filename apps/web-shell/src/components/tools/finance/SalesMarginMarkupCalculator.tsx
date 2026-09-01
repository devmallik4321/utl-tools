"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, Percent, Copy, Check, HelpCircle, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SalesMarginMarkupCalculator() {
  const [calcMode, setCalcMode] = useState<"margin" | "markup" | "price">("margin");
  const [cost, setCost] = useState<number>(40);
  const [marginPct, setMarginPct] = useState<number>(40); // 40% margin
  const [markupPct, setMarkupPct] = useState<number>(66.67); // 66.67% markup
  const [sellingPrice, setSellingPrice] = useState<number>(66.67);
  const [copied, setCopied] = useState<boolean>(false);

  // Derive all values based on mode
  let finalCost = cost;
  let finalRevenue = 0;
  let finalProfit = 0;
  let finalMargin = 0;
  let finalMarkup = 0;

  if (calcMode === "margin") {
    // Given Cost + Desired Margin% -> Price = Cost / (1 - Margin/100)
    const validMargin = Math.min(99.9, Math.max(0, marginPct));
    finalRevenue = finalCost / Math.max(0.001, 1 - validMargin / 100);
    finalProfit = finalRevenue - finalCost;
    finalMargin = validMargin;
    finalMarkup = finalCost > 0 ? (finalProfit / finalCost) * 100 : 0;
  } else if (calcMode === "markup") {
    // Given Cost + Desired Markup% -> Price = Cost * (1 + Markup/100)
    const validMarkup = Math.max(0, markupPct);
    finalRevenue = finalCost * (1 + validMarkup / 100);
    finalProfit = finalRevenue - finalCost;
    finalMarkup = validMarkup;
    finalMargin = finalRevenue > 0 ? (finalProfit / finalRevenue) * 100 : 0;
  } else {
    // Given Cost + Selling Price -> Margin & Markup
    finalRevenue = sellingPrice;
    finalProfit = finalRevenue - finalCost;
    finalMargin = finalRevenue > 0 ? (finalProfit / finalRevenue) * 100 : 0;
    finalMarkup = finalCost > 0 ? (finalProfit / finalCost) * 100 : 0;
  }

  const handleCopy = async () => {
    const summary = `Margin & Markup Pricing Breakdown\n• Cost: $${finalCost.toFixed(2)}\n• Selling Price (Revenue): $${finalRevenue.toFixed(2)}\n• Gross Profit: $${finalProfit.toFixed(2)}\n• Gross Margin: ${finalMargin.toFixed(1)}% (Profit as % of Revenue)\n• Markup: ${finalMarkup.toFixed(1)}% (Profit as % of Cost)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex p-1 bg-muted/50 rounded-xl border border-border">
        {[
          { id: "margin", label: "Target Gross Margin %" },
          { id: "markup", label: "Target Markup %" },
          { id: "price", label: "Calculate from Known Price" },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setCalcMode(m.id as any)}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
              calcMode === m.id
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cost Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Item Cost (COGS) ($)
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={cost}
            onChange={(e) => setCost(Math.max(0.01, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">What you pay to manufacture/buy the product</span>
        </div>

        {/* Dynamic Secondary Input */}
        {calcMode === "margin" && (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Desired Gross Margin (%)
            </label>
            <input
              type="number"
              min={0}
              max={99.9}
              step="0.1"
              value={marginPct}
              onChange={(e) => setMarginPct(Math.min(99.9, Math.max(0, parseFloat(e.target.value) || 0)))}
              className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
            />
            <span className="text-[11px] text-muted-foreground">Percentage of selling price kept as gross profit</span>
          </div>
        )}

        {calcMode === "markup" && (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Desired Markup on Cost (%)
            </label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={markupPct}
              onChange={(e) => setMarkupPct(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
            />
            <span className="text-[11px] text-muted-foreground">Percentage added on top of cost</span>
          </div>
        )}

        {calcMode === "price" && (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Actual Selling Price ($)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Math.max(0.01, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
            />
            <span className="text-[11px] text-muted-foreground">Final retail or invoice price</span>
          </div>
        )}
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Pricing &amp; Profitability Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Selling Price</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${finalRevenue.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Recommended retail price</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Gross Profit</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${finalProfit.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Revenue minus Cost</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Gross Margin</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {finalMargin.toFixed(1)}%
            </p>
            <span className="text-[10px] text-muted-foreground">Profit / Selling Price</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Markup on Cost</span>
            <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              {finalMarkup.toFixed(1)}%
            </p>
            <span className="text-[10px] text-muted-foreground">Profit / Cost</span>
          </div>
        </div>

        {/* Education & Comparison Box */}
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <span className="text-xs font-bold text-foreground block">
            Margin vs Markup Quick Comparison Table:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
            {[
              { margin: 15, markup: 17.6 },
              { margin: 25, markup: 33.3 },
              { margin: 33.3, markup: 50.0 },
              { margin: 50.0, markup: 100.0 },
              { margin: 75.0, markup: 300.0 },
            ].map((row, i) => (
              <div key={i} className="p-2 bg-muted/40 rounded-lg text-center">
                <span className="text-[10px] text-muted-foreground block">{row.margin}% MARGIN</span>
                <span className="font-bold text-foreground">➔ {row.markup}% Markup</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
