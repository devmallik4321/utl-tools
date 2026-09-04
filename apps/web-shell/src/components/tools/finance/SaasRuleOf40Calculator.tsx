"use client";

import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Calendar, Copy, Check, Sparkles, ShieldCheck, Zap, Award, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SaasRuleOf40Calculator() {
  const [revenueCurrent, setRevenueCurrent] = useState<number>(20000000); // $20M ARR
  const [revenuePrior, setRevenuePrior] = useState<number>(14500000); // $14.5M ARR -> ~37.9% growth
  const [freeCashFlow, setFreeCashFlow] = useState<number>(1400000); // $1.4M FCF -> 7.0% margin
  const [copied, setCopied] = useState<boolean>(false);

  const {
    growthRatePct,
    fcfMarginPct,
    ruleOf40Score,
    isPassing,
    archetype,
    valuationMultipleTier,
    tierColor,
  } = useMemo(() => {
    const growth = revenuePrior > 0 ? ((revenueCurrent - revenuePrior) / revenuePrior) * 100 : 0;
    const margin = revenueCurrent > 0 ? (freeCashFlow / revenueCurrent) * 100 : 0;
    const score = growth + margin;

    const passes = score >= 40.0;

    let arch = "Balanced Scale (20-30% Growth + 10-20% Margin)";
    if (growth >= 40) {
      arch = "Hyper-Growth Dominant (>40% Growth)";
    } else if (margin >= 25) {
      arch = "Cash Flow Machine (>25% FCF Margin)";
    }

    let multiple = "8x – 14x EV / Forward ARR (Premium Venture Multiple)";
    let color = "text-emerald-500 border-emerald-500/30";

    if (score < 25) {
      multiple = "2x – 4x EV / ARR (Discount Multiple / Restructuring Candidate)";
      color = "text-rose-500 border-rose-500/30";
    } else if (score < 40) {
      multiple = "4x – 7x EV / ARR (Median Market Multiple)";
      color = "text-amber-500 border-amber-500/30";
    }

    return {
      growthRatePct: growth.toFixed(1),
      fcfMarginPct: margin.toFixed(1),
      ruleOf40Score: score.toFixed(1),
      isPassing: passes,
      archetype: arch,
      valuationMultipleTier: multiple,
      tierColor: color,
    };
  }, [revenueCurrent, revenuePrior, freeCashFlow]);

  const handleCopy = async () => {
    const summary = `B2B SaaS Rule of 40 Analysis:\n• Rule of 40 Score: ${ruleOf40Score}% (${isPassing ? "PASSING" : "FAILING"})\n• Breakdown:\n  - YoY Revenue Growth: ${growthRatePct}% ($${revenuePrior.toLocaleString()} -> $${revenueCurrent.toLocaleString()})\n  - Free Cash Flow Margin: ${fcfMarginPct}% ($${freeCashFlow.toLocaleString()} FCF)\n• Company Archetype: ${archetype}\n• Implied Valuation Multiple Band: ${valuationMultipleTier}`;
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
            Current Year ARR / Revenue ($)
          </label>
          <input
            type="number"
            step={500000}
            value={revenueCurrent}
            onChange={(e) => setRevenueCurrent(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Prior Year ARR / Revenue ($)
          </label>
          <input
            type="number"
            step={500000}
            value={revenuePrior}
            onChange={(e) => setRevenuePrior(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Free Cash Flow (FCF) ($)
          </label>
          <input
            type="number"
            step={250000}
            value={freeCashFlow}
            onChange={(e) => setFreeCashFlow(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground">Operating cash flow minus CapEx</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-500" />
            Rule of 40 Financial Performance Score
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Scorecard"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div
            className={`p-4 bg-card rounded-xl border-2 space-y-1 ${
              isPassing ? "border-emerald-500/50" : "border-amber-500/50"
            }`}
          >
            <span className="text-xs font-semibold text-foreground uppercase font-sans">
              Rule of 40 Score
            </span>
            <p className="text-3xl font-extrabold text-foreground">{ruleOf40Score}%</p>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-sans ${
                isPassing
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {isPassing ? "Passing (>= 40%)" : "Under 40% Target"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              YoY Growth Rate
            </span>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              +{growthRatePct}%
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Annual revenue growth</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              FCF Margin
            </span>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {fcfMarginPct}%
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Free cash flow / Revenue</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Company Archetype
            </span>
            <p className="text-xs font-bold text-foreground font-sans pt-1">{archetype}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Growth vs margin profile</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground space-y-1">
          <p>
            <strong className="text-foreground">Valuation Multiple Impact: </strong>
            {valuationMultipleTier}
          </p>
          <p className="text-[11px]">
            Software companies exceeding the Rule of 40 consistently trade at a 100% to 250% valuation premium compared to sub-40 peers because they prove growth is not being purchased with unsustainable cash burn.
          </p>
        </div>
      </div>
    </div>
  );
}
