"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const IRS_415C_LIMIT_2024 = 69000;
const IRS_CATCHUP_2024 = 7500;

export function MegaBackdoorRothCalculator() {
  const [employeeDeferral, setEmployeeDeferral] = useState<number>(23000);
  const [employerContribution, setEmployerContribution] = useState<number>(11500);
  const [isAge50Plus, setIsAge50Plus] = useState<boolean>(false);
  const [annualReturnPct, setAnnualReturnPct] = useState<number>(8);
  const [horizonYears, setHorizonYears] = useState<number>(20);
  const [taxBracketPct, setTaxBracketPct] = useState<number>(32);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    totalIrsCap,
    megaBackdoorRoom,
    totalRothInflow,
    projectedRothValue,
    projectedTaxableValue,
    estimatedTaxSavings,
  } = useMemo(() => {
    const totalCap = isAge50Plus ? IRS_415C_LIMIT_2024 + IRS_CATCHUP_2024 : IRS_415C_LIMIT_2024;
    const existing = employeeDeferral + employerContribution;
    const room = Math.max(0, totalCap - existing);

    // Total Roth inflow = (if employee is Roth) + mega backdoor conversion
    const rothInflow = employeeDeferral + room;

    // Compound growth for 1 year's contribution over horizonYears
    const r = annualReturnPct / 100;
    const fvRoth = rothInflow * Math.pow(1 + r, horizonYears);

    // In taxable brokerage: annual dividend drag + 20% long-term capital gains tax on gains
    const taxDragReturn = r * 0.85; // approx 15% drag on dividends/turnover
    const fvTaxablePreCapGains = rothInflow * Math.pow(1 + taxDragReturn, horizonYears);
    const gains = Math.max(0, fvTaxablePreCapGains - rothInflow);
    const fvTaxablePostTax = fvTaxablePreCapGains - gains * 0.20; // 20% LTCG tax

    const taxSavings = Math.max(0, fvRoth - fvTaxablePostTax);

    return {
      totalIrsCap: totalCap,
      megaBackdoorRoom: Math.round(room),
      totalRothInflow: Math.round(rothInflow),
      projectedRothValue: Math.round(fvRoth),
      projectedTaxableValue: Math.round(fvTaxablePostTax),
      estimatedTaxSavings: Math.round(taxSavings),
    };
  }, [employeeDeferral, employerContribution, isAge50Plus, annualReturnPct, horizonYears, taxBracketPct]);

  const handleCopy = async () => {
    const summary = `Mega Backdoor Roth 401(k) / Solo 401(k) Analysis:\n• Maximum After-Tax Non-Roth Capacity: $${megaBackdoorRoom.toLocaleString()}/yr\n• Total Annual Roth Shelter: $${totalRothInflow.toLocaleString()}/yr\n• Breakdown:\n  - IRS Section 415(c) Ceiling: $${totalIrsCap.toLocaleString()}\n  - Employee Deferral: $${employeeDeferral.toLocaleString()}\n  - Employer Contribution: $${employerContribution.toLocaleString()}\n• Growth Projection (${horizonYears} yrs at ${annualReturnPct}%):\n  - Roth Nest Egg: $${projectedRothValue.toLocaleString()} (100% Tax-Free)\n  - Taxable Brokerage Equivalent: $${projectedTaxableValue.toLocaleString()}\n  - Estimated Lifetime Taxes Saved: $${estimatedTaxSavings.toLocaleString()}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Age & IRS Ceiling Banner */}
      <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-foreground block">
            IRS Section 415(c) Combined Defined Contribution Ceiling
          </span>
          <span className="text-[11px] text-muted-foreground">
            Applies to employee pre-tax/Roth + employer match + after-tax non-Roth contributions combined.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAge50Plus(!isAge50Plus)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
              isAge50Plus ? "bg-emerald-600 text-white border-emerald-600" : "bg-muted text-foreground border-border"
            }`}
          >
            {isAge50Plus ? "Age 50+ ($76,500 Cap)" : "Under 50 ($69,000 Cap)"}
          </button>
        </div>
      </div>

      {/* Contributions Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Employee Elective Deferral ($)
          </label>
          <input
            type="number"
            step={1000}
            max={isAge50Plus ? 30500 : 23000}
            value={employeeDeferral}
            onChange={(e) => setEmployeeDeferral(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Standard employee contribution limit</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Employer Match / Profit Sharing ($)
          </label>
          <input
            type="number"
            step={1000}
            value={employerContribution}
            onChange={(e) => setEmployerContribution(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Company match or solo profit sharing</span>
        </div>
      </div>

      {/* Long-Term Horizon & Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Horizon</span>
            <span className="font-mono">{horizonYears} Years</span>
          </div>
          <input
            type="range"
            min={5}
            max={40}
            value={horizonYears}
            onChange={(e) => setHorizonYears(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Expected Return</span>
            <span className="font-mono">{annualReturnPct}% Annually</span>
          </div>
          <input
            type="range"
            min={4}
            max={12}
            value={annualReturnPct}
            onChange={(e) => setAnnualReturnPct(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Federal Tax Bracket
          </label>
          <select
            value={taxBracketPct}
            onChange={(e) => setTaxBracketPct(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={24}>24% Marginal</option>
            <option value={32}>32% Marginal</option>
            <option value={35}>35% Marginal</option>
            <option value={37}>37% Marginal</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Mega Backdoor After-Tax Capacity &amp; Growth
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
              Mega Backdoor Room
            </span>
            <p className="text-3xl font-extrabold text-foreground">
              ${megaBackdoorRoom.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">After-tax room to convert</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Total Annual Roth Shelter
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totalRothInflow.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Deferrals + Mega Backdoor</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Roth Nest Egg ({horizonYears}y)
            </span>
            <p className="text-2xl font-bold text-foreground">
              ${projectedRothValue.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">100% Tax-free withdrawals</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Taxes Saved vs Taxable
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +${estimatedTaxSavings.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Dividends &amp; LTCG tax avoided</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Plan Requirements: </strong>
          To execute a Mega Backdoor Roth, your employer 401(k) or custom Solo 401(k) adoption agreement must permit <span className="font-semibold text-foreground">After-Tax Non-Roth contributions</span> AND <span className="font-semibold text-foreground">In-Plan Roth Conversions</span> (or in-service non-hardship distributions to a Roth IRA).
        </div>
      </div>
    </div>
  );
}
