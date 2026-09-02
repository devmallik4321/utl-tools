"use client";

import { useState, useMemo } from "react";
import { TrendingDown, DollarSign, Calendar, Copy, Check, Sparkles, Scale } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function PurchasingPowerCalculator() {
  const [cashAmount, setCashAmount] = useState<number>(100000);
  const [inflationRate, setInflationRate] = useState<number>(3.5);
  const [years, setYears] = useState<number>(20);
  const [copied, setCopied] = useState<boolean>(false);

  const { futurePurchasingPower, futureCostOfGoods, lostValueAmount, lostValuePercent, schedule } = useMemo(() => {
    const r = inflationRate / 100;
    // Purchasing power decay: Cash / (1 + r)^years
    const power = cashAmount / Math.pow(1 + r, years);
    // Cost to buy same basket of goods: Cash * (1 + r)^years
    const costGoods = cashAmount * Math.pow(1 + r, years);

    const lost = cashAmount - power;
    const lostPct = cashAmount > 0 ? (lost / cashAmount) * 100 : 0;

    const milestones = [5, 10, 15, 20, 25, 30].filter((y) => y <= Math.max(years, 30)).map((y) => {
      const p = cashAmount / Math.pow(1 + r, y);
      const c = cashAmount * Math.pow(1 + r, y);
      return {
        year: y,
        purchasingPower: p,
        basketCost: c,
        percentLoss: ((cashAmount - p) / cashAmount) * 100,
      };
    });

    return {
      futurePurchasingPower: power,
      futureCostOfGoods: costGoods,
      lostValueAmount: lost,
      lostValuePercent: lostPct,
      schedule: milestones,
    };
  }, [cashAmount, inflationRate, years]);

  const handleCopy = async () => {
    const summary = `Inflation Purchasing Power Decay Analysis ($${cashAmount.toLocaleString()} @ ${inflationRate}% Inflation over ${years} Years)\n• Future Real Value of $${cashAmount.toLocaleString()} Cash: $${futurePurchasingPower.toFixed(0)} (${lostValuePercent.toFixed(1)}% purchasing power loss)\n• Future Cost to Buy the Same Goods: $${futureCostOfGoods.toFixed(0)}\n• Cumulative Inflation Drag: -$${lostValueAmount.toFixed(0)}`;
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
            Current Cash Savings ($)
          </label>
          <input
            type="number"
            min={100}
            value={cashAmount}
            onChange={(e) => setCashAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Inflation Rate (%)
          </label>
          <input
            type="number"
            min={0}
            step="0.25"
            value={inflationRate}
            onChange={(e) => setInflationRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Time Horizon (Years)
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={years}
            onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Purchasing Power Erosion &amp; Future Basket Cost
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Inflation Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Future Purchasing Power</span>
            <p className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              ${futurePurchasingPower.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {lostValuePercent.toFixed(1)}% of your real wealth eroded
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Future Basket Price</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${futureCostOfGoods.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Cost to buy $${cashAmount} of goods today</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Lost Real Value</span>
            <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              -${lostValueAmount.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Invisible cash drag over {years} yrs</span>
          </div>
        </div>

        {/* Milestone Schedule */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Purchasing Power Decay Over Time
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
            {schedule.map((m) => (
              <div key={m.year} className="p-3 bg-card rounded-lg border border-border space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-sans font-bold block">{m.year} YEARS</span>
                <p className="text-rose-600 dark:text-rose-400 font-bold">${m.purchasingPower.toFixed(0)}</p>
                <span className="text-[10px] text-muted-foreground font-sans block">
                  -{m.percentLoss.toFixed(0)}% Power
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
