"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface Rung {
  id: number;
  termMonths: number;
  label: string;
  apy: number;
}

const DEFAULT_RUNGS: Rung[] = [
  { id: 1, termMonths: 12, label: "1-Year CD", apy: 4.85 },
  { id: 2, termMonths: 24, label: "2-Year CD", apy: 4.45 },
  { id: 3, termMonths: 36, label: "3-Year CD", apy: 4.20 },
  { id: 4, termMonths: 48, label: "4-Year CD", apy: 4.05 },
  { id: 5, termMonths: 60, label: "5-Year CD", apy: 3.90 },
];

export function CdLadderCalculator() {
  const [totalDeposit, setTotalDeposit] = useState<number>(25000);
  const [rungs, setRungs] = useState<Rung[]>(DEFAULT_RUNGS);
  const [copied, setCopied] = useState<boolean>(false);

  const { trancheAmount, blendedApy, totalAnnualInterest, totalInterestAtMaturity } = useMemo(() => {
    const numRungs = rungs.length;
    if (numRungs === 0 || totalDeposit <= 0) {
      return { trancheAmount: 0, blendedApy: 0, totalAnnualInterest: 0, totalInterestAtMaturity: 0 };
    }

    const perTranche = totalDeposit / numRungs;
    const avgApy = rungs.reduce((acc, r) => acc + r.apy, 0) / numRungs;
    const annualInterest = (totalDeposit * avgApy) / 100;

    let interestAtMaturity = 0;
    rungs.forEach((r) => {
      const years = r.termMonths / 12;
      interestAtMaturity += perTranche * Math.pow(1 + r.apy / 100, years) - perTranche;
    });

    return {
      trancheAmount: perTranche,
      blendedApy: avgApy,
      totalAnnualInterest: annualInterest,
      totalInterestAtMaturity: interestAtMaturity,
    };
  }, [totalDeposit, rungs]);

  const updateApy = (id: number, val: number) => {
    setRungs(rungs.map((r) => (r.id === id ? { ...r, apy: val } : r)));
  };

  const handleCopy = async () => {
    const summary = `CD Ladder Strategy Summary ($${totalDeposit.toLocaleString()} across ${rungs.length} Rungs)\n• Amount per Rung: $${trancheAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Blended Portfolio APY: ${blendedApy.toFixed(2)}%\n• Annual Passive Interest: $${totalAnnualInterest.toFixed(0)}/year\n• Total Compound Earnings at Maturity: +$${totalInterestAtMaturity.toFixed(0)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Total Deposit */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-sm">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Total Investment Capital ($)
        </label>
        <input
          type="number"
          min={1000}
          step={1000}
          value={totalDeposit}
          onChange={(e) => setTotalDeposit(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
        />
        <span className="text-[10px] text-muted-foreground">
          ${trancheAmount.toFixed(0)} allocated across each of {rungs.length} rungs
        </span>
      </div>

      {/* Rungs Table */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">CD Maturity Tranches &amp; APY</h4>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {rungs.map((r) => (
            <div key={r.id} className="p-3 bg-muted/40 rounded-xl border border-border space-y-1.5 text-center">
              <span className="text-xs font-bold text-foreground block">{r.label}</span>
              <span className="text-[10px] text-muted-foreground font-mono block">${trancheAmount.toFixed(0)}</span>
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  min={0}
                  step={0.05}
                  value={r.apy}
                  onChange={(e) => updateApy(r.id, Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-16 px-1.5 py-1 text-xs font-mono font-bold text-center bg-background border border-border rounded-md text-emerald-600 dark:text-emerald-400"
                />
                <span className="text-xs font-bold text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overview Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            CD Ladder Yield &amp; Liquidity Schedule
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
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Blended APY</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {blendedApy.toFixed(2)}%
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Weighted portfolio return</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Annual Interest</span>
            <p className="text-2xl font-bold text-foreground">${totalAnnualInterest.toFixed(0)}/yr</p>
            <span className="text-[10px] text-muted-foreground font-sans">Guaranteed FDIC insured</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Total Growth</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              +${totalInterestAtMaturity.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Cumulative at end of ladder</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Rolling Liquidity</span>
            <p className="text-lg font-bold text-foreground">Every 12 Mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">${trancheAmount.toFixed(0)} rolls over</span>
          </div>
        </div>
      </div>
    </div>
  );
}
