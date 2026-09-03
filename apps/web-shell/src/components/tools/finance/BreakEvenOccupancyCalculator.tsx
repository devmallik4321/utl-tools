"use client";

import { useState, useMemo } from "react";
import { Building, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck, AlertTriangle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BreakEvenOccupancyCalculator() {
  const [grossPotentialRent, setGrossPotentialRent] = useState<number>(650000);
  const [operatingExpenses, setOperatingExpenses] = useState<number>(220000);
  const [annualDebtService, setAnnualDebtService] = useState<number>(245000);
  const [currentOccupancy, setCurrentOccupancy] = useState<number>(94);
  const [totalUnits, setTotalUnits] = useState<number>(64);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    breakEvenDollarRevenue,
    breakEvenOccupancyPct,
    safetyMarginPct,
    breakEvenUnits,
    currentUnitsOccupied,
    dscr125OccupancyPct,
    isHealthy,
  } = useMemo(() => {
    const totalObligations = operatingExpenses + annualDebtService;
    const beDollar = totalObligations;
    const beOccupancy = grossPotentialRent > 0 ? (totalObligations / grossPotentialRent) * 100 : 100;
    const margin = currentOccupancy - beOccupancy;

    const unitsNeeded = Math.ceil((beOccupancy / 100) * totalUnits);
    const unitsNow = Math.floor((currentOccupancy / 100) * totalUnits);

    // Occupancy needed to meet 1.25x DSCR: (OpEx + 1.25 * DebtService) / GPR
    const target125 = grossPotentialRent > 0 ? ((operatingExpenses + annualDebtService * 1.25) / grossPotentialRent) * 100 : 100;

    return {
      breakEvenDollarRevenue: Math.round(beDollar),
      breakEvenOccupancyPct: beOccupancy.toFixed(1),
      safetyMarginPct: margin.toFixed(1),
      breakEvenUnits: Math.min(totalUnits, unitsNeeded),
      currentUnitsOccupied: Math.min(totalUnits, unitsNow),
      dscr125OccupancyPct: target125.toFixed(1),
      isHealthy: beOccupancy <= 80, // Fannie/Freddie underwriting typically likes < 80-85%
    };
  }, [grossPotentialRent, operatingExpenses, annualDebtService, currentOccupancy, totalUnits]);

  const handleCopy = async () => {
    const summary = `Commercial Real Estate Break-Even Occupancy Analysis:\n• Break-Even Occupancy Rate: ${breakEvenOccupancyPct}%\n• Break-Even Annual Revenue: $${breakEvenDollarRevenue.toLocaleString()}/yr\n• Minimum Leased Units Needed: ${breakEvenUnits} / ${totalUnits} units\n• Current Occupancy: ${currentOccupancy}% (${currentUnitsOccupied} units leased)\n• Safety Occupancy Cushion: ${safetyMarginPct}%\n• Occupancy Needed for 1.25x DSCR: ${dscr125OccupancyPct}%\n• Underwriting Assessment: ${isHealthy ? "Healthy (Under 80% agency threshold)" : "High Risk (Exceeds 80% break-even cushion)"}`;
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
            Gross Potential Rent (GPR) ($)
          </label>
          <input
            type="number"
            step={25000}
            value={grossPotentialRent}
            onChange={(e) => setGrossPotentialRent(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">100% full capacity scheduled rent</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Operating Expenses ($)
          </label>
          <input
            type="number"
            step={10000}
            value={operatingExpenses}
            onChange={(e) => setOperatingExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Taxes, insurance, utilities, maintenance</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Debt Service (P&amp;I) ($)
          </label>
          <input
            type="number"
            step={10000}
            value={annualDebtService}
            onChange={(e) => setAnnualDebtService(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
          <span className="text-[10px] text-muted-foreground">Total mortgage principal &amp; interest</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Physical Occupancy (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={currentOccupancy}
            onChange={(e) => setCurrentOccupancy(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Total Property Units / Keys
          </label>
          <input
            type="number"
            min={1}
            value={totalUnits}
            onChange={(e) => setTotalUnits(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-500" />
            Lender Underwriting Break-Even Assessment
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
              Break-Even Occupancy
            </span>
            <p className="text-3xl font-extrabold text-foreground">{breakEvenOccupancyPct}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Zero cash-flow threshold</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Safety Margin
            </span>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              +{safetyMarginPct}%
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Current vs break-even buffer</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Break-Even Units
            </span>
            <p className="text-2xl font-bold text-foreground">
              {breakEvenUnits} / {totalUnits}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Current leased: {currentUnitsOccupied}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              1.25x DSCR Target
            </span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {dscr125OccupancyPct}%
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Occupancy for bank covenant</span>
          </div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border text-xs text-muted-foreground space-y-1">
          <p>
            <strong className="text-foreground">Agency Lender Underwriting Rule: </strong>
            Fannie Mae, Freddie Mac, and HUD multifamily lenders typically require break-even occupancy to remain strictly below <strong>80% to 85%</strong>. A break-even occupancy above 85% represents high foreclosure vulnerability during local employment downturns.
          </p>
        </div>
      </div>
    </div>
  );
}
