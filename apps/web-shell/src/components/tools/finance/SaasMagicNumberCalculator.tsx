"use client";

import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Calendar, Copy, Check, Sparkles, Zap, Flame, ShieldAlert } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SaasMagicNumberCalculator() {
  const [priorQuarterRevenue, setPriorQuarterRevenue] = useState<number>(850000);
  const [currentQuarterRevenue, setCurrentQuarterRevenue] = useState<number>(1020000);
  const [priorQuarterSmSpend, setPriorQuarterSmSpend] = useState<number>(450000);
  const [grossMarginPct, setGrossMarginPct] = useState<number>(80);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    netQuarterlyGrowth,
    annualizedNetNewArr,
    magicNumber,
    cacPaybackMonths,
    efficiencyTier,
    vcRecommendation,
  } = useMemo(() => {
    const qGrowth = currentQuarterRevenue - priorQuarterRevenue;
    const annGrowth = qGrowth * 4;
    const magic = priorQuarterSmSpend > 0 ? annGrowth / priorQuarterSmSpend : 0;

    // CAC Payback = 12 / (Magic Number * Gross Margin)
    const gmDecimal = grossMarginPct / 100;
    const payback = magic > 0 && gmDecimal > 0 ? 12 / (magic * gmDecimal) : 99.9;

    let tier = "Healthy Growth (0.75x – 1.0x)";
    let rec = "Good sales efficiency. Maintain progressive investment in outbound sales and marketing.";
    if (magic >= 1.0) {
      tier = "Exceptional Efficiency (> 1.0x)";
      rec = "Pour fuel on the fire. You recover customer acquisition costs in under a year. Aggressively ramp sales & marketing budget.";
    } else if (magic < 0.5) {
      tier = "Inefficient (< 0.5x)";
      rec = "Do not scale spend. Acquisition costs are too high relative to new bookings. Refine ICP, retention, and funnel conversion first.";
    } else {
      tier = "Moderate Efficiency (0.5x – 0.75x)";
      rec = "Acceptable if expanding into an enterprise market, but evaluate rep productivity and marketing channel CAC.";
    }

    return {
      netQuarterlyGrowth: Math.round(qGrowth),
      annualizedNetNewArr: Math.round(annGrowth),
      magicNumber: magic.toFixed(2),
      cacPaybackMonths: payback.toFixed(1),
      efficiencyTier: tier,
      vcRecommendation: rec,
    };
  }, [priorQuarterRevenue, currentQuarterRevenue, priorQuarterSmSpend, grossMarginPct]);

  const handleCopy = async () => {
    const summary = `B2B SaaS Magic Number Analysis:\n• Magic Number: ${magicNumber}x (${efficiencyTier})\n• Estimated CAC Payback: ${cacPaybackMonths} months\n• Growth Metrics:\n  - Prior Quarter Revenue: $${priorQuarterRevenue.toLocaleString()}\n  - Current Quarter Revenue: $${currentQuarterRevenue.toLocaleString()} (+${netQuarterlyGrowth.toLocaleString()}/qtr)\n  - Annualized Net New ARR: $${annualizedNetNewArr.toLocaleString()}\n  - Prior Quarter S&M Spend: $${priorQuarterSmSpend.toLocaleString()}\n• VC Recommendation: ${vcRecommendation}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Prior Quarter Revenue (Q_N-1)
          </label>
          <input
            type="number"
            step={25000}
            value={priorQuarterRevenue}
            onChange={(e) => setPriorQuarterRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Quarter Revenue (Q_N)
          </label>
          <input
            type="number"
            step={25000}
            value={currentQuarterRevenue}
            onChange={(e) => setCurrentQuarterRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Prior Quarter Sales &amp; Marketing Spend (Q_N-1)
          </label>
          <input
            type="number"
            step={10000}
            value={priorQuarterSmSpend}
            onChange={(e) => setPriorQuarterSmSpend(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground">All sales salaries, commissions, ad spend, tools</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>SaaS Gross Margin</span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{grossMarginPct}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={95}
            value={grossMarginPct}
            onChange={(e) => setGrossMarginPct(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
          <span className="text-[10px] text-muted-foreground">Affects gross margin-adjusted CAC payback speed</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-500" />
            SaaS Magic Number &amp; Acquisition Payback
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              SaaS Magic Number
            </span>
            <p className="text-3xl font-extrabold text-foreground">{magicNumber}x</p>
            <span className="text-[10px] text-muted-foreground font-sans">Sales efficiency multiple</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              CAC Payback Period
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {cacPaybackMonths} mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Months to recover acquisition spend</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Annualized ARR Added
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${annualizedNetNewArr.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Run-rate ARR expansion</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Efficiency Tier
            </span>
            <p className="text-sm font-bold text-foreground font-sans">{efficiencyTier}</p>
            <span className="text-[10px] text-muted-foreground font-sans">VC benchmark rating</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Scale Venture Partners Benchmark: </strong>
          {vcRecommendation}
        </div>
      </div>
    </div>
  );
}
