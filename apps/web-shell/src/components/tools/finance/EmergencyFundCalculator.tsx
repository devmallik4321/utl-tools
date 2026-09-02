"use client";

import { useState, useMemo } from "react";
import { ShieldAlert, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function EmergencyFundCalculator() {
  const [savings, setSavings] = useState<number>(18500);
  const [housing, setHousing] = useState<number>(1600);
  const [foodUtilities, setFoodUtilities] = useState<number>(850);
  const [insuranceDebt, setInsuranceDebt] = useState<number>(550);
  const [discretionary, setDiscretionary] = useState<number>(450);
  const [copied, setCopied] = useState<boolean>(false);

  const essentialMonthly = housing + foodUtilities + insuranceDebt;
  const totalMonthly = essentialMonthly + discretionary;

  const essentialRunwayMonths = essentialMonthly > 0 ? savings / essentialMonthly : 0;
  const standardRunwayMonths = totalMonthly > 0 ? savings / totalMonthly : 0;

  const target3Mo = essentialMonthly * 3;
  const target6Mo = essentialMonthly * 6;
  const target12Mo = essentialMonthly * 12;

  const gap6Mo = target6Mo - savings;

  const handleCopy = async () => {
    const summary = `Emergency Fund Runway Analysis\n• Liquid Cash Reserves: $${savings.toLocaleString()}\n• Essential Monthly Burn: $${essentialMonthly.toLocaleString()}/mo (Total: $${totalMonthly.toLocaleString()}/mo)\n• Survival Runway: ${essentialRunwayMonths.toFixed(1)} Months (${(essentialRunwayMonths * 30.4).toFixed(0)} Days)\n• Standard Runway: ${standardRunwayMonths.toFixed(1)} Months\n• 3-Month Target: $${target3Mo.toLocaleString()} (${savings >= target3Mo ? "Funded ✓" : `Gap: $${(target3Mo - savings).toLocaleString()}`})\n• 6-Month Target: $${target6Mo.toLocaleString()} (${savings >= target6Mo ? "Funded ✓" : `Gap: $${gap6Mo.toLocaleString()}`})\n• 12-Month Target: $${target12Mo.toLocaleString()} (${savings >= target12Mo ? "Funded ✓" : `Gap: $${(target12Mo - savings).toLocaleString()}`})`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Savings & Expense Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Liquid Savings */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Liquid Cash &amp; Bank Savings
          </span>
          <div>
            <label className="text-[11px] text-muted-foreground block">Total Liquid Cash / HYSA Balance ($)</label>
            <input
              type="number"
              min={0}
              value={savings}
              onChange={(e) => setSavings(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
            />
            <span className="text-[10px] text-muted-foreground pt-1 block">
              Checking, Savings, and Money Market accounts
            </span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Monthly Expense Breakdown ($/mo)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-muted-foreground block">Housing / Rent ($)</label>
              <input
                type="number"
                min={0}
                value={housing}
                onChange={(e) => setHousing(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block">Food &amp; Utilities ($)</label>
              <input
                type="number"
                min={0}
                value={foodUtilities}
                onChange={(e) => setFoodUtilities(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block">Insurance &amp; Debt ($)</label>
              <input
                type="number"
                min={0}
                value={insuranceDebt}
                onChange={(e) => setInsuranceDebt(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block">Discretionary ($)</label>
              <input
                type="number"
                min={0}
                value={discretionary}
                onChange={(e) => setDiscretionary(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Runway Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            Financial Emergency Runway &amp; Health Tier
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Runway Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Bare-Bones Runway</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {essentialRunwayMonths.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Months</span>
            </p>
            <span className="text-[10px] text-muted-foreground">
              ~{(essentialRunwayMonths * 30.4).toFixed(0)} Days on essentials ($${essentialMonthly}/mo)
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Standard Runway</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {standardRunwayMonths.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Months</span>
            </p>
            <span className="text-[10px] text-muted-foreground">
              With current discretionary ($${totalMonthly}/mo)
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">6-Month Target Gap</span>
            <p className={`text-2xl font-bold font-mono ${gap6Mo <= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {gap6Mo <= 0 ? "Fully Funded ✓" : `$${gap6Mo.toLocaleString()}`}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {gap6Mo <= 0 ? "You have a complete 6-month buffer" : "Savings needed for 6-month target"}
            </span>
          </div>
        </div>

        {/* Milestone Buffer Cards */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Emergency Fund Savings Targets
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-card rounded-lg border border-border space-y-1">
              <div className="flex justify-between items-center font-sans">
                <span className="font-bold text-foreground">3-Month Basic</span>
                <span className={`text-[10px] font-bold ${savings >= target3Mo ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {savings >= target3Mo ? "Achieved ✓" : "In Progress"}
                </span>
              </div>
              <p className="text-base font-bold text-foreground">${target3Mo.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground font-sans block">Starter safety cushion</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-1">
              <div className="flex justify-between items-center font-sans">
                <span className="font-bold text-foreground">6-Month Recommended</span>
                <span className={`text-[10px] font-bold ${savings >= target6Mo ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {savings >= target6Mo ? "Achieved ✓" : "In Progress"}
                </span>
              </div>
              <p className="text-base font-bold text-foreground">${target6Mo.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground font-sans block">Standard expert guideline</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-1">
              <div className="flex justify-between items-center font-sans">
                <span className="font-bold text-foreground">12-Month Bulletproof</span>
                <span className={`text-[10px] font-bold ${savings >= target12Mo ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {savings >= target12Mo ? "Achieved ✓" : "In Progress"}
                </span>
              </div>
              <p className="text-base font-bold text-foreground">${target12Mo.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground font-sans block">For freelancers &amp; single earners</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
