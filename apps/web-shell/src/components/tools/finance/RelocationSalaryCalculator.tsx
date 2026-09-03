"use client";

import { useState, useMemo } from "react";
import { Plane, DollarSign, Building, TrendingUp, TrendingDown, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const CITIES = [
  { name: "New York City (Manhattan), NY", coli: 222 },
  { name: "San Francisco / Bay Area, CA", coli: 180 },
  { name: "Seattle, WA", coli: 148 },
  { name: "Los Angeles, CA", coli: 152 },
  { name: "Boston, MA", coli: 145 },
  { name: "Chicago, IL", coli: 116 },
  { name: "Denver, CO", coli: 112 },
  { name: "Austin, TX", coli: 101 },
  { name: "Atlanta, GA", coli: 103 },
  { name: "Dallas / Fort Worth, TX", coli: 102 },
  { name: "Phoenix, AZ", coli: 104 },
  { name: "Tampa / St. Petersburg, FL", coli: 100 },
  { name: "Raleigh / Durham, NC", coli: 96 },
  { name: "National Average (Baseline)", coli: 100 },
];

export function RelocationSalaryCalculator() {
  const [currentSalary, setCurrentSalary] = useState<number>(115000);
  const [originIdx, setOriginIdx] = useState<number>(1); // San Francisco
  const [targetIdx, setTargetIdx] = useState<number>(7); // Austin
  const [offeredSalary, setOfferedSalary] = useState<number>(105000); // What target city is offering
  const [copied, setCopied] = useState<boolean>(false);

  const origin = CITIES[originIdx];
  const target = CITIES[targetIdx];

  const {
    equivalentSalary,
    coliDeltaPct,
    isCheaper,
    offeredRealDelta,
    effectiveRaise,
  } = useMemo(() => {
    // Equivalent salary = currentSalary * (targetCOLI / originCOLI)
    const eq = currentSalary * (target.coli / origin.coli);
    const deltaPct = ((target.coli - origin.coli) / origin.coli) * 100;
    const realDiff = offeredSalary - eq;

    return {
      equivalentSalary: Math.round(eq),
      coliDeltaPct: Math.abs(deltaPct).toFixed(1),
      isCheaper: target.coli < origin.coli,
      offeredRealDelta: Math.round(realDiff),
      effectiveRaise: ((realDiff / eq) * 100).toFixed(1),
    };
  }, [currentSalary, origin, target, offeredSalary]);

  const handleCopy = async () => {
    const summary = `Relocation Cost of Living Analysis (${origin.name} ➔ ${target.name}):\n• Current Salary: $${currentSalary.toLocaleString()}\n• Equivalent Salary Needed: $${equivalentSalary.toLocaleString()}\n• Living Cost Delta: ${isCheaper ? "-" : "+"}${coliDeltaPct}% in ${target.name}\n• Offered Salary Evaluation ($${offeredSalary.toLocaleString()}): ${offeredRealDelta >= 0 ? `+$${offeredRealDelta.toLocaleString()} effective surplus (+${effectiveRaise}%)` : `-$${Math.abs(offeredRealDelta).toLocaleString()} effective shortfall (${effectiveRaise}%)`}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* City Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current City (Origin)
          </label>
          <select
            value={originIdx}
            onChange={(e) => setOriginIdx(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            {CITIES.map((c, i) => (
              <option key={c.name} value={i}>
                {c.name} (Index {c.coli})
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Destination City (Target)
          </label>
          <select
            value={targetIdx}
            onChange={(e) => setTargetIdx(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            {CITIES.map((c, i) => (
              <option key={c.name} value={i}>
                {c.name} (Index {c.coli})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Salary Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Salary ($/year)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={currentSalary}
            onChange={(e) => setCurrentSalary(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Offered Target Salary ($/year)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={offeredSalary}
            onChange={(e) => setOfferedSalary(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Plane className="w-4 h-4 text-emerald-500" />
            Cost of Living Equivalent &amp; Offer Assessment
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
              Equivalent Target Salary
            </span>
            <p className="text-3xl font-extrabold text-foreground">${equivalentSalary.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Matches today's lifestyle</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Cost of Living Delta
            </span>
            <p className={`text-2xl font-bold ${isCheaper ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {isCheaper ? `-${coliDeltaPct}%` : `+${coliDeltaPct}%`}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {isCheaper ? "Cheaper overall in target" : "More expensive in target"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Effective Offer Delta
            </span>
            <p className={`text-2xl font-bold ${offeredRealDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {offeredRealDelta >= 0 ? `+$${offeredRealDelta.toLocaleString()}` : `-$${Math.abs(offeredRealDelta).toLocaleString()}`}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Against required equivalent</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Real Purchasing Power
            </span>
            <p className={`text-2xl font-bold ${parseFloat(effectiveRaise) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {parseFloat(effectiveRaise) >= 0 ? `+${effectiveRaise}%` : `${effectiveRaise}%`}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Real net raise / cut</span>
          </div>
        </div>
      </div>
    </div>
  );
}
