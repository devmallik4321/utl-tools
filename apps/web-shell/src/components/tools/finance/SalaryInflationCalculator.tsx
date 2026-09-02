"use client";

import { useState, useMemo } from "react";
import { DollarSign, TrendingDown, TrendingUp, Calendar, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SalaryInflationCalculator() {
  const [startingSalary, setStartingSalary] = useState<number>(85000);
  const [years, setYears] = useState<number>(3);
  const [annualInflationRate, setAnnualInflationRate] = useState<number>(4.0);
  const [actualRaisePct, setActualRaisePct] = useState<number>(3.0); // Annual raise
  const [copied, setCopied] = useState<boolean>(false);

  const { requiredSalary, actualNewSalary, purchasingPowerDiff, isBeatingInflation } = useMemo(() => {
    const rInflation = annualInflationRate / 100;
    const rRaise = actualRaisePct / 100;

    // What salary is required to match inflation
    const req = startingSalary * Math.pow(1 + rInflation, years);
    // What actual salary became after raises
    const actual = startingSalary * Math.pow(1 + rRaise, years);

    const diff = actual - req;
    const isBeating = diff >= 0;

    return {
      requiredSalary: req,
      actualNewSalary: actual,
      purchasingPowerDiff: diff,
      isBeatingInflation: isBeating,
    };
  }, [startingSalary, years, annualInflationRate, actualRaisePct]);

  const handleCopy = async () => {
    const summary = `Inflation-Adjusted Salary Analysis ($${startingSalary.toLocaleString()} over ${years} Years)\n• Required Salary to Match Inflation (${annualInflationRate}%/yr): $${requiredSalary.toFixed(0)}\n• Actual Salary Received (${actualRaisePct}%/yr raises): $${actualNewSalary.toFixed(0)}\n• Real Purchasing Power Gap: ${purchasingPowerDiff >= 0 ? "+" : ""}$${purchasingPowerDiff.toFixed(0)} (${isBeatingInflation ? "Real Pay Increase ✓" : "Ghost Pay Cut ✗"})`;
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
            Starting Base Salary ($)
          </label>
          <input
            type="number"
            min={1000}
            value={startingSalary}
            onChange={(e) => setStartingSalary(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Time Span (Years)
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={years}
            onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Inflation (%/yr)
          </label>
          <input
            type="number"
            min={0}
            step="0.25"
            value={annualInflationRate}
            onChange={(e) => setAnnualInflationRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Your Annual Raise (%/yr)
          </label>
          <input
            type="number"
            min={0}
            step="0.25"
            value={actualRaisePct}
            onChange={(e) => setActualRaisePct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Salary Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Purchasing Power &amp; Ghost Pay Cut Evaluation
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
            <span className="text-xs font-semibold text-muted-foreground uppercase">Required Salary</span>
            <p className="text-3xl font-extrabold font-mono text-foreground">
              ${requiredSalary.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">To maintain exact same lifestyle</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Actual Salary</span>
            <p className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              ${actualNewSalary.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">After {actualRaisePct}% raises over {years} yrs</span>
          </div>

          <div className="p-4 bg-card rounded-xl border-2 border-border space-y-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Real Net Purchasing Gap</span>
            <p
              className={`text-3xl font-extrabold font-mono ${
                isBeatingInflation ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {purchasingPowerDiff >= 0 ? "+" : ""}${purchasingPowerDiff.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {isBeatingInflation ? "Beat inflation by +" : "Lost purchasing power by "}
              ${Math.abs(purchasingPowerDiff).toFixed(0)}/yr
            </span>
          </div>
        </div>

        {/* Evaluation Banner */}
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            isBeatingInflation
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/20 border-rose-500/30 text-rose-800 dark:text-rose-300"
          }`}
        >
          {isBeatingInflation ? (
            <TrendingUp className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <div>
            <strong className="block font-bold">
              {isBeatingInflation ? "Positive Real Wage Growth ✓" : "Warning: Experiencing a Ghost Pay Cut ✗"}
            </strong>
            <span>
              {isBeatingInflation
                ? `Your annual raises (${actualRaisePct}%) exceeded inflation (${annualInflationRate}%), resulting in a genuine standard-of-living increase.`
                : `Even though your salary increased on paper, high inflation eroded your purchasing power. You are effectively making $${Math.abs(
                    purchasingPowerDiff
                  ).toFixed(0)} LESS per year in real terms than ${years} years ago.`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
