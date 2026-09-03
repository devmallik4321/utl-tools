"use client";

import { useState, useMemo } from "react";
import { Briefcase, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Scale } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BusinessValuationCalculator() {
  const [revenue, setRevenue] = useState<number>(1250000);
  const [netProfit, setNetProfit] = useState<number>(190000);
  const [ownerSalary, setOwnerSalary] = useState<number>(115000);
  const [discretionaryAddBacks, setDiscretionaryAddBacks] = useState<number>(28000);
  const [depreciation, setDepreciation] = useState<number>(16000);
  const [interestExpense, setInterestExpense] = useState<number>(9000);
  const [sdeMultiple, setSdeMultiple] = useState<number>(2.85); // 2.0x - 4.5x
  const [copied, setCopied] = useState<boolean>(false);

  const {
    totalSde,
    totalEbitda,
    estimatedValuation,
    sbaDownPayment,
    sdeMarginPct,
  } = useMemo(() => {
    // SDE = Net Profit + Owner Salary + Add-backs + Depreciation + Interest
    const sde = netProfit + ownerSalary + discretionaryAddBacks + depreciation + interestExpense;
    // EBITDA = Net Profit + Depreciation + Interest + Taxes (assuming standard pass-through)
    const ebitda = netProfit + depreciation + interestExpense;

    const val = sde * sdeMultiple;
    const down10 = val * 0.10; // 10% SBA down payment
    const margin = revenue > 0 ? (sde / revenue) * 100 : 0;

    return {
      totalSde: Math.round(sde),
      totalEbitda: Math.round(ebitda),
      estimatedValuation: Math.round(val),
      sbaDownPayment: Math.round(down10),
      sdeMarginPct: margin.toFixed(1),
    };
  }, [revenue, netProfit, ownerSalary, discretionaryAddBacks, depreciation, interestExpense, sdeMultiple]);

  const handleCopy = async () => {
    const summary = `Small Business Acquisition Valuation ($${revenue.toLocaleString()} Revenue):\n• Total SDE (Seller's Discretionary Earnings): $${totalSde.toLocaleString()}/yr (${sdeMarginPct}% margin)\n• Total EBITDA: $${totalEbitda.toLocaleString()}/yr\n• Enterprise Value (at ${sdeMultiple}x SDE Multiple): $${estimatedValuation.toLocaleString()}\n• 10% SBA 7(a) Equity Down Payment: $${sbaDownPayment.toLocaleString()}\n• Add-Back Breakdown:\n  - Net Profit: $${netProfit.toLocaleString()}\n  - Owner Salary & Perks: $${ownerSalary.toLocaleString()}\n  - Discretionary Add-Backs: $${discretionaryAddBacks.toLocaleString()}\n  - Depreciation & Interest: $${(depreciation + interestExpense).toLocaleString()}`;
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
            Annual Gross Revenue ($)
          </label>
          <input
            type="number"
            min={10000}
            step={25000}
            value={revenue}
            onChange={(e) => setRevenue(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Reported Net Profit ($)
          </label>
          <input
            type="number"
            step={10000}
            value={netProfit}
            onChange={(e) => setNetProfit(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Owner's W-2 Salary &amp; Perks ($)
          </label>
          <input
            type="number"
            step={5000}
            value={ownerSalary}
            onChange={(e) => setOwnerSalary(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Second Row Add-Backs & Multiple */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Discretionary Add-Backs ($)
          </label>
          <input
            type="number"
            step={2500}
            value={discretionaryAddBacks}
            onChange={(e) => setDiscretionaryAddBacks(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Personal auto, phone, travel</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Depreciation &amp; Amort ($)
          </label>
          <input
            type="number"
            step={1000}
            value={depreciation}
            onChange={(e) => setDepreciation(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Non-cash paper deductions</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Interest Expense ($)
          </label>
          <input
            type="number"
            step={1000}
            value={interestExpense}
            onChange={(e) => setInterestExpense(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Seller's existing debt service</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>SDE Multiple</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{sdeMultiple}x</span>
          </div>
          <input
            type="range"
            min={1.5}
            max={5.0}
            step={0.05}
            value={sdeMultiple}
            onChange={(e) => setSdeMultiple(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
          <span className="text-[10px] text-muted-foreground">Main St. avg: 2.5x - 3.2x</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-500" />
            Normalized Cash Flow &amp; Enterprise Valuation
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Valuation"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Estimated Enterprise Value
            </span>
            <p className="text-3xl font-extrabold text-foreground">${estimatedValuation.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">{sdeMultiple}x Seller's Earnings</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Total SDE Cash Flow
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${totalSde.toLocaleString()}/yr
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">{sdeMarginPct}% adjusted profit margin</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Total EBITDA
            </span>
            <p className="text-2xl font-bold text-foreground">${totalEbitda.toLocaleString()}/yr</p>
            <span className="text-[10px] text-muted-foreground font-sans">Without owner compensation</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              10% SBA Down Payment
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${sbaDownPayment.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Buyer equity injection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
