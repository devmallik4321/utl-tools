"use client";

import { useState, useMemo } from "react";
import { Flame, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck, AlertCircle, Award } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SaasNetBurnRunwayCalculator() {
  const [cashBalance, setCashBalance] = useState<number>(1800000); // $1.8M
  const [grossBurn, setGrossBurn] = useState<number>(120000); // $120k/mo
  const [mrr, setMrr] = useState<number>(45000); // $45k/mo
  const [mrrGrowthPct, setMrrGrowthPct] = useState<number>(5); // 5% MoM growth
  const [expenseGrowthPct, setExpenseGrowthPct] = useState<number>(1.5); // 1.5% MoM expense ramp
  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    const initialNetBurn = Math.max(0, grossBurn - mrr);
    const staticRunwayMonths = initialNetBurn > 0 ? cashBalance / initialNetBurn : 999;

    // Simulate month-by-month dynamic runway
    let currentCash = cashBalance;
    let currentRev = mrr;
    let currentExp = grossBurn;
    let monthsElapsed = 0;
    let reachedBreakeven = false;
    let breakevenMonth = null;

    const timeline = [];

    while (currentCash > 0 && monthsElapsed < 60) {
      const net = currentExp - currentRev;

      timeline.push({
        month: monthsElapsed + 1,
        cash: Math.max(0, currentCash),
        revenue: currentRev,
        expense: currentExp,
        netBurn: net,
      });

      if (net <= 0 && !reachedBreakeven) {
        reachedBreakeven = true;
        breakevenMonth = monthsElapsed + 1;
      }

      currentCash -= net;
      currentRev *= 1 + mrrGrowthPct / 100;
      currentExp *= 1 + expenseGrowthPct / 100;
      monthsElapsed++;

      if (reachedBreakeven && currentCash > cashBalance) {
        // Cash is growing, company is self-sustaining!
        break;
      }
    }

    const dynamicRunwayMonths = reachedBreakeven && currentCash > 0 ? "Infinite (Default Alive)" : `${monthsElapsed} Months`;
    const isDefaultAlive = reachedBreakeven && currentCash > 0;

    const zeroDate = new Date();
    zeroDate.setMonth(zeroDate.getMonth() + monthsElapsed);
    const zeroDateFormatted = isDefaultAlive
      ? "N/A — Reaches Profitability"
      : zeroDate.toLocaleDateString(undefined, { month: "short", year: "numeric" });

    return {
      initialNetBurn,
      staticRunwayMonths: staticRunwayMonths.toFixed(1),
      dynamicRunwayMonths,
      isDefaultAlive,
      monthsElapsed,
      breakevenMonth,
      zeroDateFormatted,
      timeline: timeline.slice(0, 12), // First 12 months preview
    };
  }, [cashBalance, grossBurn, mrr, mrrGrowthPct, expenseGrowthPct]);

  const handleCopy = async () => {
    const text = `SaaS Net Burn & Cash Runway Analysis:
• Cash in Bank: $${cashBalance.toLocaleString()}
• Monthly Gross Burn: $${grossBurn.toLocaleString()}/mo
• Monthly Recurring Revenue (MRR): $${mrr.toLocaleString()}/mo
• Current Net Burn: $${results.initialNetBurn.toLocaleString()}/mo
--------------------------------------------------
RUNWAY FORECAST:
• Simple Static Runway: ${results.staticRunwayMonths} months
• Dynamic Modeled Runway: ${results.dynamicRunwayMonths}
• Paul Graham Classification: ${results.isDefaultAlive ? "DEFAULT ALIVE (Reaches profitability before zero cash)" : "DEFAULT DEAD (Requires next financing round)"}
• Projected Zero Cash Date: ${results.zeroDateFormatted}
${results.breakevenMonth ? `• Projected Cash-Flow Breakeven Month: Month ${results.breakevenMonth}` : ""}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Cash in Bank ($)
          </label>
          <input
            type="number"
            step={100000}
            value={cashBalance}
            onChange={(e) => setCashBalance(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly Gross Burn (Expenses) ($)
          </label>
          <input
            type="number"
            step={10000}
            value={grossBurn}
            onChange={(e) => setGrossBurn(Math.max(100, parseFloat(e.target.value) || 100))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-500"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly Revenue / MRR ($)
          </label>
          <input
            type="number"
            step={5000}
            value={mrr}
            onChange={(e) => setMrr(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            MoM Revenue Growth Rate (%)
          </label>
          <input
            type="number"
            step={0.5}
            value={mrrGrowthPct}
            onChange={(e) => setMrrGrowthPct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            MoM Expense Ramp Rate (%)
          </label>
          <input
            type="number"
            step={0.5}
            value={expenseGrowthPct}
            onChange={(e) => setExpenseGrowthPct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Net Monthly Cash Burn ($)
          </label>
          <div className="w-full px-3 py-2 text-base font-mono font-black text-foreground bg-muted/30 border border-border rounded-lg">
            ${results.initialNetBurn.toLocaleString()} / mo
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-card border border-border rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Static Runway
          </span>
          <div className="text-3xl font-mono font-black text-foreground mt-1">
            {results.staticRunwayMonths} <span className="text-lg">Mo</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Cash / Initial Net Burn (Zero Growth Model)
          </p>
        </div>

        <div className={`p-5 rounded-2xl border ${results.isDefaultAlive ? "bg-emerald-500/10 border-emerald-500/30" : "bg-card border-border"}`}>
          <span className={`text-xs uppercase font-bold tracking-wider ${results.isDefaultAlive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
            Dynamic Modeled Runway
          </span>
          <div className={`text-3xl font-mono font-black mt-1 ${results.isDefaultAlive ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
            {results.dynamicRunwayMonths}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Accounts for {mrrGrowthPct}% MoM revenue growth
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              Zero Cash Date
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded border border-border transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="text-3xl font-mono font-black text-foreground mt-1">
            {results.zeroDateFormatted}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {results.isDefaultAlive ? "Self-sustaining cash flow achieved" : `Fundraise before ${results.zeroDateFormatted}`}
          </p>
        </div>
      </div>

      {/* 12-Month Runway Projection Table */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          12-Month Cash &amp; Revenue Projection Timeline
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2.5 font-semibold">Month</th>
                <th className="pb-2.5 font-semibold">Cash Balance</th>
                <th className="pb-2.5 font-semibold text-emerald-600 dark:text-emerald-400">MRR</th>
                <th className="pb-2.5 font-semibold text-rose-500">Gross Expenses</th>
                <th className="pb-2.5 font-semibold">Net Burn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {results.timeline.map((row) => (
                <tr key={row.month} className="hover:bg-muted/20 transition-colors">
                  <td className="py-2 font-bold text-foreground">Month {row.month}</td>
                  <td className="py-2 font-mono font-semibold text-foreground">
                    ${row.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2 font-mono text-emerald-600 dark:text-emerald-400">
                    ${row.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2 font-mono text-rose-500">
                    ${row.expense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`py-2 font-mono font-bold ${row.netBurn <= 0 ? "text-emerald-500" : "text-foreground"}`}>
                    {row.netBurn <= 0 ? "+$" + Math.abs(row.netBurn).toLocaleString(undefined, { maximumFractionDigits: 0 }) + " (Profitable)" : "-$" + row.netBurn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
