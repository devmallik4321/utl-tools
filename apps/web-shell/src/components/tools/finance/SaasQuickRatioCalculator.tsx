"use client";

import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Calendar, Copy, Check, Sparkles, Activity, PieChart } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SaasQuickRatioCalculator() {
  const [newMrr, setNewMrr] = useState<number>(22000);
  const [expansionMrr, setExpansionMrr] = useState<number>(8500);
  const [churnMrr, setChurnMrr] = useState<number>(4200);
  const [contractionMrr, setContractionMrr] = useState<number>(1800);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    grossAddedMrr,
    grossLostMrr,
    netNewMrr,
    quickRatio,
    efficiencyGrade,
    gradeDescription,
  } = useMemo(() => {
    const added = newMrr + expansionMrr;
    const lost = churnMrr + contractionMrr;
    const net = added - lost;
    const ratio = lost > 0 ? added / lost : added > 0 ? 99.9 : 0;

    let grade = "Healthy (2x - 4x)";
    let desc = "Sustainable growth. New additions comfortably outpace customer churn.";
    if (ratio >= 4.0) {
      grade = "Top Quartile (> 4.0x)";
      desc = "Exceptional growth efficiency. Top-tier VC fundable metric with minimal revenue leakage.";
    } else if (ratio < 2.0) {
      grade = "Leaky Bucket (< 2.0x)";
      desc = "Growth drag. Churn and contraction consume too much new sales acquisition effort.";
    }

    return {
      grossAddedMrr: Math.round(added),
      grossLostMrr: Math.round(lost),
      netNewMrr: Math.round(net),
      quickRatio: ratio.toFixed(2),
      efficiencyGrade: grade,
      gradeDescription: desc,
    };
  }, [newMrr, expansionMrr, churnMrr, contractionMrr]);

  const handleCopy = async () => {
    const summary = `B2B SaaS Quick Ratio Analysis:\n• Quick Ratio: ${quickRatio}x (${efficiencyGrade})\n• Net New MRR: $${netNewMrr.toLocaleString()}/mo ($${(netNewMrr * 12).toLocaleString()} Net ARR)\n• Inflow Breakdown:\n  - New Customer MRR: $${newMrr.toLocaleString()}\n  - Expansion MRR: $${expansionMrr.toLocaleString()}\n  - Total Added: $${grossAddedMrr.toLocaleString()}\n• Outflow Breakdown:\n  - Churned MRR: $${churnMrr.toLocaleString()}\n  - Contraction MRR: $${contractionMrr.toLocaleString()}\n  - Total Lost: $${grossLostMrr.toLocaleString()}\n• Assessment: ${gradeDescription}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters: Inflow vs Outflow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Added Revenue */}
        <div className="p-4 bg-card border border-emerald-500/30 rounded-xl space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Revenue Additions (Inflow)
          </span>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              New Customer MRR ($)
            </label>
            <input
              type="number"
              step={1000}
              value={newMrr}
              onChange={(e) => setNewMrr(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Expansion / Upsell MRR ($)
            </label>
            <input
              type="number"
              step={500}
              value={expansionMrr}
              onChange={(e) => setExpansionMrr(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </div>

        {/* Lost Revenue */}
        <div className="p-4 bg-card border border-rose-500/30 rounded-xl space-y-3">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
            Revenue Losses (Outflow)
          </span>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Churned MRR ($)
            </label>
            <input
              type="number"
              step={500}
              value={churnMrr}
              onChange={(e) => setChurnMrr(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Contraction / Downgrade MRR ($)
            </label>
            <input
              type="number"
              step={250}
              value={contractionMrr}
              onChange={(e) => setContractionMrr(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
            />
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            SaaS Growth Efficiency &amp; Quick Ratio
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
              SaaS Quick Ratio
            </span>
            <p className="text-3xl font-extrabold text-foreground">{quickRatio}x</p>
            <span className="text-[10px] text-muted-foreground font-sans">{efficiencyGrade}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Net New MRR Added
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +${netNewMrr.toLocaleString()}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              +${(netNewMrr * 12).toLocaleString()}/yr Net ARR
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Gross MRR Inflow
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${grossAddedMrr.toLocaleString()}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">New + Expansion</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Gross MRR Outflow
            </span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ${grossLostMrr.toLocaleString()}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Churn + Contraction</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Venture Capital Benchmark: </strong>
          {gradeDescription}
        </div>
      </div>
    </div>
  );
}
