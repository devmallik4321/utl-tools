"use client";

import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, PieChart, Copy, Check, Sparkles, Plus, Trash2, ArrowUpRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function NetWorthCalculator() {
  // Assets
  const [cash, setCash] = useState<number>(25000);
  const [investments, setInvestments] = useState<number>(65000);
  const [retirement, setRetirement] = useState<number>(110000);
  const [realEstate, setRealEstate] = useState<number>(380000);
  const [vehiclesOther, setVehiclesOther] = useState<number>(25000);

  // Liabilities
  const [mortgage, setMortgage] = useState<number>(210000);
  const [autoLoans, setAutoLoans] = useState<number>(12000);
  const [studentLoans, setStudentLoans] = useState<number>(18000);
  const [creditCards, setCreditCards] = useState<number>(2500);

  // Monthly Savings Rate for Projections
  const [monthlySavings, setMonthlySavings] = useState<number>(2000);
  const [annualReturn, setAnnualReturn] = useState<number>(7.0);

  const [copied, setCopied] = useState<boolean>(false);

  const { totalAssets, totalLiabilities, netWorth, debtToAssetRatio } = useMemo(() => {
    const assets = cash + investments + retirement + realEstate + vehiclesOther;
    const liabilities = mortgage + autoLoans + studentLoans + creditCards;
    const nw = assets - liabilities;
    const ratio = assets > 0 ? (liabilities / assets) * 100 : 0;

    return {
      totalAssets: assets,
      totalLiabilities: liabilities,
      netWorth: nw,
      debtToAssetRatio: ratio,
    };
  }, [cash, investments, retirement, realEstate, vehiclesOther, mortgage, autoLoans, studentLoans, creditCards]);

  // Milestone Calculations
  const milestones = [100000, 250000, 500000, 1000000];
  const milestoneProjections = milestones.map((target) => {
    if (netWorth >= target) {
      return { target, reached: true, years: 0 };
    }
    const r = annualReturn / 100 / 12;
    let months = 0;
    let current = Math.max(0, netWorth);
    while (current < target && months < 600) {
      current = current * (1 + r) + monthlySavings;
      months++;
    }
    return {
      target,
      reached: false,
      years: (months / 12).toFixed(1),
    };
  });

  const handleCopy = async () => {
    const summary = `Personal Net Worth Statement\n• Total Assets: $${totalAssets.toLocaleString()}\n• Total Liabilities: $${totalLiabilities.toLocaleString()} (${debtToAssetRatio.toFixed(1)}% Debt-to-Asset)\n• NET WORTH: $${netWorth.toLocaleString()}\n• Monthly Savings Contribution: $${monthlySavings.toLocaleString()}/mo\n• Estimated Milestone: $1M in ${milestoneProjections.find((m) => m.target === 1000000)?.years || "N/A"} years (@ ${annualReturn}% return)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Sheet: Assets & Liabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets Column */}
        <div className="p-4 bg-card border-2 border-emerald-500/20 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Assets
            </span>
            <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
              +${totalAssets.toLocaleString()}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="text-muted-foreground block">Cash / Checking / HYSA ($)</label>
              <input
                type="number"
                min={0}
                value={cash}
                onChange={(e) => setCash(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Brokerage &amp; Stocks ($)</label>
              <input
                type="number"
                min={0}
                value={investments}
                onChange={(e) => setInvestments(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Retirement Accounts (401k, IRA) ($)</label>
              <input
                type="number"
                min={0}
                value={retirement}
                onChange={(e) => setRetirement(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Real Estate Property Market Value ($)</label>
              <input
                type="number"
                min={0}
                value={realEstate}
                onChange={(e) => setRealEstate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Vehicles &amp; Other Valuables ($)</label>
              <input
                type="number"
                min={0}
                value={vehiclesOther}
                onChange={(e) => setVehiclesOther(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Liabilities Column */}
        <div className="p-4 bg-card border-2 border-rose-500/20 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Total Liabilities (Debts)
            </span>
            <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
              -${totalLiabilities.toLocaleString()}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="text-muted-foreground block">Mortgage Balance ($)</label>
              <input
                type="number"
                min={0}
                value={mortgage}
                onChange={(e) => setMortgage(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Auto Loans ($)</label>
              <input
                type="number"
                min={0}
                value={autoLoans}
                onChange={(e) => setAutoLoans(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Student Loans ($)</label>
              <input
                type="number"
                min={0}
                value={studentLoans}
                onChange={(e) => setStudentLoans(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Credit Cards &amp; Personal Loans ($)</label>
              <input
                type="number"
                min={0}
                value={creditCards}
                onChange={(e) => setCreditCards(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Net Worth Summary */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Total Net Worth &amp; Financial Position
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Net Worth"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Current Net Worth</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${netWorth.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Assets minus all debts</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Debt-to-Asset Ratio</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {debtToAssetRatio.toFixed(1)}%
            </p>
            <span className="text-[10px] text-muted-foreground">Lower is healthier</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Savings Rate</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2 py-1 text-sm font-bold font-mono bg-background border border-border rounded-md"
              />
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
            <span className="text-[10px] text-muted-foreground">For milestone projection</span>
          </div>
        </div>

        {/* Milestone Milestones */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Future Wealth Milestones (at {annualReturn}% avg market return)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {milestoneProjections.map((m) => (
              <div key={m.target} className="p-3 bg-card rounded-lg border border-border space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-sans font-bold block">
                  ${(m.target / 1000).toFixed(0)}K TARGET
                </span>
                <p className="text-foreground font-bold text-sm">${m.target.toLocaleString()}</p>
                <span
                  className={`text-[10px] font-sans font-bold block ${
                    m.reached ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {m.reached ? "✓ Reached" : `~${m.years} Years`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
