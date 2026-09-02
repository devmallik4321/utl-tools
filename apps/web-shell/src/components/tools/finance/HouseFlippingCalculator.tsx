"use client";

import { useState, useMemo } from "react";
import { Hammer, DollarSign, TrendingUp, Percent, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HouseFlippingCalculator() {
  const [arv, setArv] = useState<number>(360000); // After Repair Value
  const [repairCosts, setRepairCosts] = useState<number>(50000);
  const [rulePercentage, setRulePercentage] = useState<number>(70); // 70% rule
  const [holdingAndClosing, setHoldingAndClosing] = useState<number>(25000); // financing, insurance, selling costs
  const [copied, setCopied] = useState<boolean>(false);

  const { mao, projectedProfit, roiPct } = useMemo(() => {
    // Standard 70% rule formula: MAO = (ARV * rulePct) - Repairs
    const maxOffer = arv * (rulePercentage / 100) - repairCosts;

    // True profit if bought at MAO:
    // Profit = ARV - MAO - Repairs - Holding/Closing
    const totalProjectCost = Math.max(0, maxOffer) + repairCosts + holdingAndClosing;
    const profit = arv - totalProjectCost;
    const roi = totalProjectCost > 0 ? (profit / totalProjectCost) * 100 : 0;

    return {
      mao: Math.max(0, Math.round(maxOffer)),
      projectedProfit: Math.round(profit),
      roiPct: roi.toFixed(1),
    };
  }, [arv, repairCosts, rulePercentage, holdingAndClosing]);

  const handleCopy = async () => {
    const summary = `House Flipping 70% Rule Analysis ($${arv.toLocaleString()} ARV):\n• Maximum Allowable Offer (MAO): $${mao.toLocaleString()} (at ${rulePercentage}% rule)\n• Estimated Renovation Costs: $${repairCosts.toLocaleString()}\n• Holding & Closing Costs: $${holdingAndClosing.toLocaleString()}\n• Projected Net Flip Profit: $${projectedProfit.toLocaleString()}\n• Projected Return on Capital: ${roiPct}%`;
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
            After Repair Value (ARV $)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={arv}
            onChange={(e) => setArv(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Appraised market value post-rehab</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Estimated Repairs ($)
          </label>
          <input
            type="number"
            min={0}
            step={2500}
            value={repairCosts}
            onChange={(e) => setRepairCosts(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
          <span className="text-[10px] text-muted-foreground">Labor, materials, permits</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Flipper Rule Percentage
          </label>
          <select
            value={rulePercentage}
            onChange={(e) => setRulePercentage(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={65}>65% Rule (Conservative / High Rate)</option>
            <option value={70}>70% Rule (Standard Flipper Rule)</option>
            <option value={75}>75% Rule (Hot Competitive Market)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Holding &amp; Resale Fees ($)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={holdingAndClosing}
            onChange={(e) => setHoldingAndClosing(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Financing, realtor 5-6%, transfer</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Hammer className="w-4 h-4 text-emerald-500" />
            Maximum Allowable Offer (MAO) &amp; Profit Buffer
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy MAO Analysis"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Max Allowable Offer (MAO)
            </span>
            <p className="text-3xl font-extrabold text-foreground">${mao.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              Do not bid above this acquisition price
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Projected Net Flip Profit
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${projectedProfit.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">After all rehab &amp; carrying costs</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Return on Capital</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{roiPct}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Profit / Total Capital Deployed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
