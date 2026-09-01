"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, Calendar, Copy, Check, Sparkles, Scale } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState<number>(10000);
  const [ratePct, setRatePct] = useState<number>(6.0);
  const [years, setYears] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);

  // Simple Interest: I = P * r * t
  const rate = ratePct / 100;
  const simpleInterest = principal * rate * years;
  const simpleTotal = principal + simpleInterest;

  // Compound Interest: A = P * (1 + r)^t
  const compoundTotal = principal * Math.pow(1 + rate, years);
  const compoundInterest = compoundTotal - principal;
  const compoundDelta = compoundInterest - simpleInterest;

  // Yearly Schedule
  const schedule: { year: number; simpleBal: number; compoundBal: number }[] = [];
  if (years > 0 && years <= 30) {
    for (let y = 1; y <= Math.floor(years); y++) {
      schedule.push({
        year: y,
        simpleBal: principal + principal * rate * y,
        compoundBal: principal * Math.pow(1 + rate, y),
      });
    }
  }

  const handleCopy = async () => {
    const summary = `Simple Interest Calculation\n• Principal: $${principal.toLocaleString()}\n• Annual Rate: ${ratePct}% (${years} Years)\n• Simple Interest Earned: $${simpleInterest.toLocaleString()}\n• Total Simple Balance: $${simpleTotal.toLocaleString()}\n• Compound Comparison: Compound interest yields $${compoundInterest.toLocaleString()} (+$${compoundDelta.toLocaleString()} extra)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Starting Principal ($)
          </label>
          <input
            type="number"
            min={1}
            value={principal}
            onChange={(e) => setPrincipal(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Initial money deposited or borrowed</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            min={0}
            step="0.25"
            value={ratePct}
            onChange={(e) => setRatePct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[11px] text-muted-foreground">Annual percentage rate (APR)</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Time Horizon (Years)
          </label>
          <input
            type="number"
            min={0.1}
            step="0.5"
            value={years}
            onChange={(e) => setYears(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Loan or deposit duration</span>
        </div>
      </div>

      {/* Simple vs Compound Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Simple Interest vs Compound Growth
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Simple Interest Earned</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${simpleInterest.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">I = Principal × Rate × Time</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Simple Balance</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${simpleTotal.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Principal + Simple Interest</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Compound Difference</span>
            <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              +${compoundDelta.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Extra earned by compounding</span>
          </div>
        </div>

        {/* Schedule Table */}
        {schedule.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Year-by-Year Growth Comparison:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
              {schedule.map((row) => (
                <div key={row.year} className="p-2.5 bg-card rounded-lg border border-border space-y-0.5">
                  <span className="text-[10px] text-muted-foreground font-sans font-bold block">YEAR {row.year}</span>
                  <p className="text-foreground font-bold">${row.simpleBal.toFixed(0)}</p>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-sans">
                    Compound: ${row.compoundBal.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
