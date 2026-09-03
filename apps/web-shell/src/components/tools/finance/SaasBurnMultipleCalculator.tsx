"use client";

import { useState, useMemo } from "react";
import { Flame, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SaasBurnMultipleCalculator() {
  const [netBurn, setNetBurn] = useState<number>(1500000); // Net cash burned in period
  const [netNewArr, setNetNewArr] = useState<number>(1200000); // Net new ARR added
  const [cashBalance, setCashBalance] = useState<number>(3800000); // Cash in bank
  const [periodMonths, setPeriodMonths] = useState<number>(12); // Evaluation period
  const [copied, setCopied] = useState<boolean>(false);

  const {
    burnMultiple,
    efficiencyRating,
    ratingColor,
    monthlyBurn,
    runwayMonths,
    craftVenturesRule,
  } = useMemo(() => {
    const multiple = netNewArr > 0 ? netBurn / netNewArr : 99.9;
    const mBurn = periodMonths > 0 ? netBurn / periodMonths : 0;
    const runway = mBurn > 0 ? cashBalance / mBurn : 99.9;

    let rating = "Good (1.0x – 1.5x)";
    let color = "text-blue-500 border-blue-500/30";
    let rule = "Healthy capital efficiency. The company converts burn into enterprise value at an acceptable venture-backed rate.";

    if (multiple < 1.0) {
      rating = "Amazing (< 1.0x)";
      color = "text-emerald-500 border-emerald-500/30";
      rule = "Top-tier capital efficiency. You burn less than $1 to generate $1 of ARR. Prime candidate for aggressive growth financing.";
    } else if (multiple <= 2.0) {
      rating = "Suspect (1.5x – 2.0x)";
      color = "text-amber-500 border-amber-500/30";
      rule = "Efficiency is slipping. You are spending significantly more than you add in recurring revenue. Review CAC and sales cycles.";
    } else {
      rating = "Dangerous / Leaky (> 2.0x)";
      color = "text-rose-500 border-rose-500/30";
      rule = "Severe capital inefficiency. Burning more than $2 for every $1 of new ARR. Runway will evaporate without drastic cost restructuring.";
    }

    return {
      burnMultiple: multiple.toFixed(2),
      efficiencyRating: rating,
      ratingColor: color,
      monthlyBurn: Math.round(mBurn),
      runwayMonths: runway.toFixed(1),
      craftVenturesRule: rule,
    };
  }, [netBurn, netNewArr, cashBalance, periodMonths]);

  const handleCopy = async () => {
    const summary = `Craft Ventures SaaS Burn Multiple Analysis:\n• Burn Multiple: ${burnMultiple}x (${efficiencyRating})\n• Financial Metrics:\n  - Net Cash Burn: $${netBurn.toLocaleString()} (Over ${periodMonths} mo)\n  - Net New ARR Added: $${netNewArr.toLocaleString()}\n  - Average Monthly Burn: $${monthlyBurn.toLocaleString()}/mo\n  - Cash Runway: ${runwayMonths} months (Current Cash: $${cashBalance.toLocaleString()})\n• Venture Assessment: ${craftVenturesRule}`;
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
            Net Cash Burn ($)
          </label>
          <input
            type="number"
            step={50000}
            value={netBurn}
            onChange={(e) => setNetBurn(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
          <span className="text-[10px] text-muted-foreground">Cash Out minus Cash In</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Net New ARR Added ($)
          </label>
          <input
            type="number"
            step={50000}
            value={netNewArr}
            onChange={(e) => setNetNewArr(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">New bookings minus churn</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Cash Balance in Bank ($)
          </label>
          <input
            type="number"
            step={100000}
            value={cashBalance}
            onChange={(e) => setCashBalance(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground">Liquid runway capital</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Evaluation Period
          </label>
          <select
            value={periodMonths}
            onChange={(e) => setPeriodMonths(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={12}>Trailing 12 Months (Annual)</option>
            <option value={6}>Trailing 6 Months</option>
            <option value={3}>Trailing 3 Months (Quarterly)</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500" />
            Craft Ventures Burn Multiple Assessment
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
              Burn Multiple
            </span>
            <p className="text-3xl font-extrabold text-foreground">{burnMultiple}x</p>
            <span className="text-[10px] text-muted-foreground font-sans">Net Burn / Net New ARR</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Efficiency Grade
            </span>
            <p className="text-base font-bold text-foreground font-sans">{efficiencyRating}</p>
            <span className="text-[10px] text-muted-foreground font-sans">David Sacks venture scale</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Monthly Burn Rate
            </span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ${monthlyBurn.toLocaleString()}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Average cash outflow</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Remaining Runway
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {runwayMonths} mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Months until zero cash</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Venture Rule: </strong>
          {craftVenturesRule}
        </div>
      </div>
    </div>
  );
}
