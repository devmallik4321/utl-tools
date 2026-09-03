"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const IRS_EMPLOYEE_MAX_2024 = 23000;
const IRS_CATCHUP_2024 = 7500;
const IRS_COMBINED_MAX_2024 = 69000;

export function Solo401kCalculator() {
  const [netProfit, setNetProfit] = useState<number>(95000);
  const [isAge50Plus, setIsAge50Plus] = useState<boolean>(false);
  const [businessType, setBusinessType] = useState<"sole_prop" | "scorp">("sole_prop");
  const [w2Salary, setW2Salary] = useState<number>(75000); // For S-Corp
  const [marginalTaxBracket, setMarginalTaxBracket] = useState<number>(24);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    employeeDeferral,
    employerProfitSharing,
    totalSolo401kContribution,
    sepIraComparison,
    solo401kAdvantage,
    taxSavings,
  } = useMemo(() => {
    const employeeCap = isAge50Plus ? IRS_EMPLOYEE_MAX_2024 + IRS_CATCHUP_2024 : IRS_EMPLOYEE_MAX_2024;
    const combinedCap = isAge50Plus ? IRS_COMBINED_MAX_2024 + IRS_CATCHUP_2024 : IRS_COMBINED_MAX_2024;

    let compBase = 0;
    let employerMaxPct = 0.20;

    if (businessType === "sole_prop") {
      // Net Profit minus half SE tax
      const seEarnings = netProfit * 0.9235;
      const seTax = Math.min(seEarnings, 168600) * 0.124 + seEarnings * 0.029;
      compBase = Math.max(0, netProfit - seTax / 2);
      employerMaxPct = 0.20; // 0.25 / 1.25 = 0.20
    } else {
      // S-Corp: based on W-2 salary
      compBase = w2Salary;
      employerMaxPct = 0.25;
    }

    // 1. Employee deferral: up to 100% of compBase, capped at employeeCap
    const empDef = Math.min(compBase, employeeCap);

    // 2. Employer contribution: up to employerMaxPct of compBase
    const empShare = compBase * employerMaxPct;

    // 3. Combined total capped at IRS combined limit
    const combined = Math.min(combinedCap, empDef + empShare);
    const actualEmployer = Math.max(0, combined - empDef);

    // SEP-IRA comparison: only employer portion
    const sepContribution = Math.min(IRS_COMBINED_MAX_2024, compBase * employerMaxPct);
    const advantage = Math.max(0, combined - sepContribution);

    const saved = combined * (marginalTaxBracket / 100);

    return {
      employeeDeferral: Math.round(empDef),
      employerProfitSharing: Math.round(actualEmployer),
      totalSolo401kContribution: Math.round(combined),
      sepIraComparison: Math.round(sepContribution),
      solo401kAdvantage: Math.round(advantage),
      taxSavings: Math.round(saved),
    };
  }, [netProfit, isAge50Plus, businessType, w2Salary, marginalTaxBracket]);

  const handleCopy = async () => {
    const summary = `Solo 401(k) Maximum Contribution Analysis:\n• Total Solo 401(k) Contribution: $${totalSolo401kContribution.toLocaleString()}/yr\n• Breakdown:\n  - Employee Elective Deferral: $${employeeDeferral.toLocaleString()}\n  - Employer Profit-Sharing: $${employerProfitSharing.toLocaleString()}\n• Solo 401(k) Advantage over SEP-IRA: +$${solo401kAdvantage.toLocaleString()} extra tax shelter\n• Estimated Federal Tax Savings: $${taxSavings.toLocaleString()} (at ${marginalTaxBracket}% bracket)\n• Eligibility: Self-employed with zero full-time W-2 employees (spouses allowed).`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Entity & Age Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Business Structure
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBusinessType("sole_prop")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                businessType === "sole_prop" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              Sole Prop / LLC (1099)
            </button>
            <button
              onClick={() => setBusinessType("scorp")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                businessType === "scorp" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              S-Corporation (W-2)
            </button>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-foreground block">Catch-Up Contribution (Age 50+)</span>
            <span className="text-[11px] text-muted-foreground">Allows an additional $7,500 in employee deferrals.</span>
          </div>
          <button
            onClick={() => setIsAge50Plus(!isAge50Plus)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
              isAge50Plus ? "bg-emerald-600 text-white border-emerald-600" : "bg-muted text-foreground border-border"
            }`}
          >
            {isAge50Plus ? "Age 50+ Active" : "Under 50"}
          </button>
        </div>
      </div>

      {/* Financial Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {businessType === "sole_prop" ? (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Net 1099 / Schedule C Profit ($)
            </label>
            <input
              type="number"
              step={5000}
              value={netProfit}
              onChange={(e) => setNetProfit(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>
        ) : (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Owner W-2 Salary ($)
            </label>
            <input
              type="number"
              step={5000}
              value={w2Salary}
              onChange={(e) => setW2Salary(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>
        )}

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Marginal Federal Tax Bracket (%)
          </label>
          <select
            value={marginalTaxBracket}
            onChange={(e) => setMarginalTaxBracket(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={12}>12% Federal Bracket</option>
            <option value={22}>22% Federal Bracket</option>
            <option value={24}>24% Federal Bracket</option>
            <option value={32}>32% Federal Bracket</option>
            <option value={35}>35% Federal Bracket</option>
            <option value={37}>37% Federal Bracket</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Solo 401(k) Maximum Tax Shelter
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy 401(k) Sheet"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Total Solo 401(k) Max
            </span>
            <p className="text-3xl font-extrabold text-foreground">
              ${totalSolo401kContribution.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Employee + Employer combined</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Employee Deferral
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${employeeDeferral.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">100% of comp up to limit</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Employer Profit Share
            </span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${employerProfitSharing.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">20% to 25% profit share</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Advantage vs SEP-IRA
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +${solo401kAdvantage.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Extra tax shelter capacity</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Why Solo 401(k) beats SEP-IRA for moderate earners: </strong>
          With a SEP-IRA, you can only contribute ~20% of net earnings. With a Solo 401(k), you can contribute the first <span className="font-mono text-foreground">${IRS_EMPLOYEE_MAX_2024.toLocaleString()}</span> dollar-for-dollar as an employee, AND THEN add the 20% employer profit-sharing portion on top.
        </div>
      </div>
    </div>
  );
}
