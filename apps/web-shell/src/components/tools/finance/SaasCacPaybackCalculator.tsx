"use client";

import { useState, useMemo } from "react";
import { DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SaasCacPaybackCalculator() {
  const [cac, setCac] = useState<number>(5500); // Customer acquisition cost
  const [arpuMonthly, setArpuMonthly] = useState<number>(500); // Monthly recurring revenue per customer
  const [grossMarginPct, setGrossMarginPct] = useState<number>(78); // Subscription Gross Margin %
  const [customerLifespanMonths, setCustomerLifespanMonths] = useState<number>(36); // Churn-implied lifespan
  const [copied, setCopied] = useState<boolean>(false);

  const {
    paybackMonthsAdjusted,
    paybackMonthsUnadjusted,
    monthlyGrossProfit,
    ltv,
    ltvCacRatio,
    benchmarkTier,
    tierColor,
    vcVerdict,
  } = useMemo(() => {
    const monthlyGp = arpuMonthly * (grossMarginPct / 100);
    const paybackAdj = monthlyGp > 0 ? cac / monthlyGp : 99.9;
    const paybackUnadj = arpuMonthly > 0 ? cac / arpuMonthly : 99.9;

    const lifetimeValue = monthlyGp * customerLifespanMonths;
    const ratio = cac > 0 ? lifetimeValue / cac : 0;

    let tier = "Good / Healthy (12 – 18 Months)";
    let color = "text-blue-500 border-blue-500/30";
    let verdict = "Solid unit economics. Customer acquisition pays back within 18 months of gross margin.";

    if (paybackAdj <= 12) {
      tier = "Outstanding (< 12 Months)";
      color = "text-emerald-500 border-emerald-500/30";
      verdict = "Top-tier SaaS unit economics. You recover sales & marketing spend in under a year. Prime for aggressive paid acquisition scaling.";
    } else if (paybackAdj <= 24) {
      tier = "Mediocre (18 – 24 Months)";
      color = "text-amber-500 border-amber-500/30";
      verdict = "Long payback cycle. Requires substantial working capital. Look to reduce sales cycle or increase expansion revenue.";
    } else {
      tier = "Dangerous (> 24 Months)";
      color = "text-rose-500 border-rose-500/30";
      verdict = "High cash burn risk. Acquiring customers ties up capital for over 2 years, often exceeding typical customer lifespan before break-even.";
    }

    return {
      paybackMonthsAdjusted: paybackAdj.toFixed(1),
      paybackMonthsUnadjusted: paybackUnadj.toFixed(1),
      monthlyGrossProfit: Math.round(monthlyGp),
      ltv: Math.round(lifetimeValue),
      ltvCacRatio: ratio.toFixed(1),
      benchmarkTier: tier,
      tierColor: color,
      vcVerdict: verdict,
    };
  }, [cac, arpuMonthly, grossMarginPct, customerLifespanMonths]);

  const handleCopy = async () => {
    const summary = `B2B SaaS CAC Payback Period Analysis:\n• Margin-Adjusted CAC Payback: ${paybackMonthsAdjusted} Months (${benchmarkTier})\n• Unadjusted Revenue Payback: ${paybackMonthsUnadjusted} Months\n• Customer Acquisition Cost (CAC): $${cac.toLocaleString()}\n• Monthly ARPU: $${arpuMonthly.toLocaleString()} (Gross Margin: ${grossMarginPct}%)\n• Monthly Gross Profit per Customer: $${monthlyGrossProfit.toLocaleString()}/mo\n• Customer Lifetime Value (LTV): $${ltv.toLocaleString()}\n• LTV : CAC Ratio: ${ltvCacRatio}x\n• Venture Verdict: ${vcVerdict}`;
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
            Blended CAC ($)
          </label>
          <input
            type="number"
            step={250}
            value={cac}
            onChange={(e) => setCac(Math.max(10, parseFloat(e.target.value) || 10))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
          <span className="text-[10px] text-muted-foreground">Total S&amp;M spend per customer</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly ARPU ($)
          </label>
          <input
            type="number"
            step={50}
            value={arpuMonthly}
            onChange={(e) => setArpuMonthly(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">Average monthly recurring revenue</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Gross Margin (%)
          </label>
          <input
            type="number"
            min={10}
            max={100}
            value={grossMarginPct}
            onChange={(e) => setGrossMarginPct(Math.max(1, Math.min(100, parseFloat(e.target.value) || 1)))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground">Revenue minus hosting &amp; support COGS</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Customer Lifespan (Months)
          </label>
          <input
            type="number"
            min={1}
            value={customerLifespanMonths}
            onChange={(e) => setCustomerLifespanMonths(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">1 / Monthly Churn Rate</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Unit Economics &amp; CAC Payback Analysis
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
              Gross Margin CAC Payback
            </span>
            <p className="text-3xl font-extrabold text-foreground">{paybackMonthsAdjusted} mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">True cash-in-bank recovery</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Benchmark Tier
            </span>
            <p className="text-base font-bold text-foreground font-sans">{benchmarkTier}</p>
            <span className="text-[10px] text-muted-foreground font-sans">B2B SaaS VC criteria</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              LTV : CAC Ratio
            </span>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {ltvCacRatio}x
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">LTV: ${ltv.toLocaleString()}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Monthly Gross Profit
            </span>
            <p className="text-2xl font-bold text-foreground">
              ${monthlyGrossProfit}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">ARPU × Gross Margin</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Why Gross Margin Adjustment Matters: </strong>
          Many founders calculate CAC Payback simply as CAC / ARPU ({paybackMonthsUnadjusted} months), which dangerously ignores server hosting, customer support, and merchant fees. A business with 65% gross margins takes 54% longer to actually recover spent acquisition capital!
        </div>
      </div>
    </div>
  );
}
