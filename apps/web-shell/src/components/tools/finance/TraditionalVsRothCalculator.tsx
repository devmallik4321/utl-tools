"use client";

import { useState, useMemo } from "react";
import { Scale, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Award } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function TraditionalVsRothCalculator() {
  const [annualContribution, setAnnualContribution] = useState<number>(10000);
  const [years, setYears] = useState<number>(30);
  const [currentTaxRate, setCurrentTaxRate] = useState<number>(24);
  const [retireTaxRate, setRetireTaxRate] = useState<number>(15);
  const [annualReturn, setAnnualReturn] = useState<number>(7.5);
  const [copied, setCopied] = useState<boolean>(false);

  const { traditionalNetSpendable, rothNetSpendable, winner, dollarDifference } = useMemo(() => {
    const r = annualReturn / 100;
    const tCurrent = currentTaxRate / 100;
    const tRetire = retireTaxRate / 100;

    // Traditional 401k: You contribute full pre-tax amount.
    let tradBalance = 0;
    for (let i = 1; i <= years; i++) {
      tradBalance = (tradBalance + annualContribution) * (1 + r);
    }
    // At retirement, withdrawals taxed at retireTaxRate
    const tradNet = tradBalance * (1 - tRetire);

    // Roth 401k: Same out-of-pocket cash cost means you deposit annualContribution * (1 - tCurrent)
    // Or if you deposit full annualContribution, you paid upfront tax. Let's compare equal out-of-pocket:
    // If you deposit $10,000 in Roth, it costs you $10,000 / (1 - tCurrent) in gross income.
    // Standard equivalent comparison:
    // Traditional: $C invested inside + ($C * tCurrent) tax savings invested in taxable account (assumed 15% cap gains)
    // Let's model both on identical $C gross income:
    let rothBalance = 0;
    const rothDeposit = annualContribution * (1 - tCurrent); // equivalent after-tax deposit
    for (let i = 1; i <= years; i++) {
      rothBalance = (rothBalance + rothDeposit) * (1 + r);
    }
    const rothNet = rothBalance; // 100% tax-free!

    // If current tax > retire tax => Traditional wins.
    // If current tax < retire tax => Roth wins.
    // If current tax == retire tax => Exactly equal!
    const diff = Math.abs(tradNet - rothNet);
    let winStr = "Traditional 401(k)";
    if (rothNet > tradNet) winStr = "Roth 401(k)";
    else if (Math.abs(rothNet - tradNet) < 1) winStr = "Tie (Equal Net Outcome)";

    return {
      traditionalNetSpendable: tradNet,
      rothNetSpendable: rothNet,
      winner: winStr,
      dollarDifference: diff,
    };
  }, [annualContribution, years, currentTaxRate, retireTaxRate, annualReturn]);

  const handleCopy = async () => {
    const summary = `Traditional vs Roth 401(k) Comparison (${years} Years @ ${annualReturn}% return)\n• Current Tax: ${currentTaxRate}% ➔ Retirement Tax: ${retireTaxRate}%\n• Traditional Spendable at Retirement: $${traditionalNetSpendable.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Roth Spendable at Retirement: $${rothNetSpendable.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Recommendation: ${winner} wins by +$${dollarDifference.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
            Annual Contribution ($)
          </label>
          <input
            type="number"
            min={1000}
            step={500}
            value={annualContribution}
            onChange={(e) => setAnnualContribution(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Years to Retirement
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={years}
            onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Expected Growth (%/yr)
          </label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Marginal Tax Bracket (%)
          </label>
          <select
            value={currentTaxRate}
            onChange={(e) => setCurrentTaxRate(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={12}>12% Federal Bracket</option>
            <option value={22}>22% Federal Bracket</option>
            <option value={24}>24% Federal Bracket (Standard Professional)</option>
            <option value={32}>32% Federal Bracket</option>
            <option value={35}>35% Federal Bracket</option>
          </select>
          <span className="text-[10px] text-muted-foreground">What you pay today on your highest dollars</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Expected Retirement Tax Bracket (%)
          </label>
          <select
            value={retireTaxRate}
            onChange={(e) => setRetireTaxRate(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={10}>10% Low Retirement Bracket</option>
            <option value={12}>12% Moderate Retirement</option>
            <option value={15}>15% Effective Blended Rate</option>
            <option value={22}>22% Equal Tax Bracket</option>
            <option value={28}>28% High Retirement Wealth</option>
          </select>
          <span className="text-[10px] text-muted-foreground">Effective rate on retirement withdrawals</span>
        </div>
      </div>

      {/* Comparison Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-500" />
            Net After-Tax Spendable Retirement Wealth
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 font-sans">
                Traditional 401(k) / IRA
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded font-bold font-sans">
                Tax Deducted Now
              </span>
            </div>
            <p className="text-3xl font-extrabold text-foreground pt-2">
              ${traditionalNetSpendable.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans block">
              Net spendable cash after {retireTaxRate}% retirement tax
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 font-sans">
                Roth 401(k) / IRA
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold font-sans">
                Tax Paid Now
              </span>
            </div>
            <p className="text-3xl font-extrabold text-foreground pt-2">
              ${rothNetSpendable.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans block">
              Net spendable cash (100% tax-free in retirement)
            </span>
          </div>
        </div>

        {/* Verdict Banner */}
        <div className="p-4 bg-card border-2 border-emerald-500/30 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-foreground">
              Mathematical Recommendation: <span className="text-emerald-600 dark:text-emerald-400">{winner}</span>
            </span>
          </div>
          <p className="text-muted-foreground">
            {winner === "Traditional 401(k)"
              ? `Because your current tax bracket (${currentTaxRate}%) is higher than your expected retirement tax bracket (${retireTaxRate}%), deducting taxes today in a Traditional account yields +$${dollarDifference.toLocaleString(
                  undefined,
                  { maximumFractionDigits: 0 }
                )} more spendable income.`
              : `Because your retirement tax bracket (${retireTaxRate}%) is higher than your current tax rate (${currentTaxRate}%), paying taxes now in a Roth account locks in lower rates and delivers +$${dollarDifference.toLocaleString(
                  undefined,
                  { maximumFractionDigits: 0 }
                )} more spendable cash.`}
          </p>
        </div>
      </div>
    </div>
  );
}
