"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Scale } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function PensionLumpSumCalculator() {
  const [lumpSum, setLumpSum] = useState<number>(450000);
  const [monthlyPension, setMonthlyPension] = useState<number>(2800);
  const [currentAge, setCurrentAge] = useState<number>(62);
  const [expectedReturn, setExpectedReturn] = useState<number>(6.0); // If lump sum is invested
  const [colaPct, setColaPct] = useState<number>(0); // Cost of living adjustment %
  const [copied, setCopied] = useState<boolean>(false);

  const { simpleBreakEvenYears, simpleBreakEvenAge, totalAnnuityAt85, lumpSumAt85, crossoverRecommendation } =
    useMemo(() => {
      const annualPension = monthlyPension * 12;

      // Simple break-even: LumpSum / AnnualPension
      const breakEvenY = annualPension > 0 ? lumpSum / annualPension : 0;
      const breakEvenAge = Math.round(currentAge + breakEvenY);

      // Value at age 85
      const yearsTo85 = Math.max(1, 85 - currentAge);

      // Cumulative annuity by 85
      let totalAnnuity = 0;
      let curAnn = annualPension;
      for (let y = 1; y <= yearsTo85; y++) {
        totalAnnuity += curAnn;
        curAnn *= 1 + colaPct / 100;
      }

      // If lump sum is invested at expectedReturn, withdrawing monthlyPension
      let investedBalance = lumpSum;
      const r = expectedReturn / 100 / 12;
      for (let m = 1; m <= yearsTo85 * 12; m++) {
        investedBalance = investedBalance * (1 + r) - monthlyPension;
      }

      let rec = "";
      if (breakEvenAge <= 78) {
        rec = "Monthly Annuity favored if you have normal or above-average family longevity.";
      } else {
        rec = "Lump Sum favored if you want portfolio control, bequest wealth, or have health concerns.";
      }

      return {
        simpleBreakEvenYears: breakEvenY.toFixed(1),
        simpleBreakEvenAge: breakEvenAge,
        totalAnnuityAt85: Math.round(totalAnnuity),
        lumpSumAt85: Math.max(0, Math.round(investedBalance)),
        crossoverRecommendation: rec,
      };
    }, [lumpSum, monthlyPension, currentAge, expectedReturn, colaPct]);

  const handleCopy = async () => {
    const summary = `Pension Lump Sum vs Annuity Decision ($${lumpSum.toLocaleString()} vs $${monthlyPension.toLocaleString()}/mo @ Age ${currentAge}):\n• Simple Break-Even Age: ${simpleBreakEvenAge} years old (${simpleBreakEvenYears} years)\n• Total Annuity Received by Age 85: $${totalAnnuityAt85.toLocaleString()}\n• Remaining Invested Lump Sum at Age 85: $${lumpSumAt85.toLocaleString()} (at ${expectedReturn}% return)\n• Longevity Guidance: ${crossoverRecommendation}`;
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
            Lump-Sum Offer ($)
          </label>
          <input
            type="number"
            min={10000}
            step={10000}
            value={lumpSum}
            onChange={(e) => setLumpSum(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly Annuity ($/mo)
          </label>
          <input
            type="number"
            min={100}
            step={100}
            value={monthlyPension}
            onChange={(e) => setMonthlyPension(Math.max(10, parseFloat(e.target.value) || 10))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Retirement Age
          </label>
          <input
            type="number"
            min={50}
            max={80}
            value={currentAge}
            onChange={(e) => setCurrentAge(Math.max(45, parseInt(e.target.value) || 62))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Expected Return (%/yr)
          </label>
          <input
            type="number"
            min={1.0}
            max={12.0}
            step={0.5}
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Break-Even Longevity &amp; Portfolio Comparison
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Analysis"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Break-Even Age
            </span>
            <p className="text-3xl font-extrabold text-foreground">Age {simpleBreakEvenAge}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {simpleBreakEvenYears} years of monthly payouts
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Annuity Sum by Age 85
            </span>
            <p className="text-2xl font-bold text-foreground">${totalAnnuityAt85.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Total guaranteed cash paid</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Invested Lump at 85
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${lumpSumAt85.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              Remaining balance after withdrawals
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Annual Payout</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${(monthlyPension * 12).toLocaleString()}/yr
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {((monthlyPension * 12 / lumpSum) * 100).toFixed(1)}% annual withdrawal rate
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Retirement Takeaway: </strong>
          {crossoverRecommendation}
        </div>
      </div>
    </div>
  );
}
