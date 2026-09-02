"use client";

import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Repeat, Copy, Check, Sparkles, PieChart } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function DripCalculator() {
  const [initialInvestment, setInitialInvestment] = useState<number>(25000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [dividendYield, setDividendYield] = useState<number>(3.8); // 3.8% dividend yield
  const [dividendGrowthRate, setDividendGrowthRate] = useState<number>(5.0); // 5% annual dividend growth
  const [capitalAppreciation, setCapitalAppreciation] = useState<number>(4.5); // 4.5% annual stock growth
  const [years, setYears] = useState<number>(20);
  const [copied, setCopied] = useState<boolean>(false);

  const { endingBalanceWithDrip, endingBalanceNoDrip, annualDividendAtEnd, totalDividendsReinvested, milestones } =
    useMemo(() => {
      let balanceDrip = initialInvestment;
      let balanceNoDrip = initialInvestment;
      let currentYield = dividendYield / 100;
      let totalDivs = 0;

      const schedule: { year: number; balDrip: number; balNoDrip: number; annualDiv: number }[] = [];

      for (let y = 1; y <= years; y++) {
        // Stock appreciation + contributions
        const appRate = capitalAppreciation / 100;

        // Calculate year's dividends
        const divIncome = balanceDrip * currentYield;
        totalDivs += divIncome;

        // DRIP reinvests dividend back into balance
        balanceDrip = (balanceDrip + divIncome + monthlyContribution * 12) * (1 + appRate);

        // No DRIP pays cash out without compounding
        balanceNoDrip = (balanceNoDrip + monthlyContribution * 12) * (1 + appRate);

        // Dividend increases each year
        currentYield = currentYield * (1 + dividendGrowthRate / 100);

        if (y % 5 === 0 || y === years) {
          schedule.push({
            year: y,
            balDrip: balanceDrip,
            balNoDrip: balanceNoDrip,
            annualDiv: balanceDrip * currentYield,
          });
        }
      }

      return {
        endingBalanceWithDrip: balanceDrip,
        endingBalanceNoDrip: balanceNoDrip,
        annualDividendAtEnd: balanceDrip * currentYield,
        totalDividendsReinvested: totalDivs,
        milestones: schedule,
      };
    }, [initialInvestment, monthlyContribution, dividendYield, dividendGrowthRate, capitalAppreciation, years]);

  const handleCopy = async () => {
    const summary = `Dividend Reinvestment (DRIP) Snowball Projection (${years} Years)\n• Starting Principal: $${initialInvestment.toLocaleString()} + $${monthlyContribution}/mo\n• Initial Dividend Yield: ${dividendYield}%\n• Portfolio with DRIP: $${endingBalanceWithDrip.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Portfolio without DRIP: $${endingBalanceNoDrip.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• DRIP Advantage: +$${(endingBalanceWithDrip - endingBalanceNoDrip).toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Annual Dividend Income at Year ${years}: $${annualDividendAtEnd.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr ($${(annualDividendAtEnd / 12).toFixed(0)}/mo)`;
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
            Initial Investment ($)
          </label>
          <input
            type="number"
            min={0}
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly Contribution ($)
          </label>
          <input
            type="number"
            min={0}
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Starting Dividend Yield (%)
          </label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={dividendYield}
            onChange={(e) => setDividendYield(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Dividend Growth Rate (%/yr)
          </label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={dividendGrowthRate}
            onChange={(e) => setDividendGrowthRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Capital Growth Rate (%/yr)
          </label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={capitalAppreciation}
            onChange={(e) => setCapitalAppreciation(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Repeat className="w-4 h-4 text-emerald-500" />
            Dividend Snowball &amp; Reinvestment Growth
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy DRIP Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Balance With DRIP</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${endingBalanceWithDrip.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground">Reinvesting 100% of dividends</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Annual Dividend at Year {years}</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${annualDividendAtEnd.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-muted-foreground">/ yr</span>
            </p>
            <span className="text-[10px] text-muted-foreground">~${(annualDividendAtEnd / 12).toFixed(0)}/mo passive cash flow</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Balance Without DRIP</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${endingBalanceNoDrip.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground">DRIP adds +${(endingBalanceWithDrip - endingBalanceNoDrip).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Milestone Schedule */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Compound Snowball Milestones
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {milestones.map((m) => (
              <div key={m.year} className="p-3 bg-card rounded-lg border border-border space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-sans font-bold block">{m.year} YEARS</span>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">DRIP: ${m.balDrip.toFixed(0)}</p>
                <p className="text-muted-foreground">No DRIP: ${m.balNoDrip.toFixed(0)}</p>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-sans">
                  Divs: ${m.annualDiv.toFixed(0)}/yr
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
