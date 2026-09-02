"use client";

import { useState, useMemo } from "react";
import { HeartPulse, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HsaCalculator() {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retireAge, setRetireAge] = useState<number>(65);
  const [coverageType, setCoverageType] = useState<"individual" | "family">("individual");
  const [currentBalance, setCurrentBalance] = useState<number>(5000);
  const [annualContribution, setAnnualContribution] = useState<number>(4150); // 2024/2026 limit
  const [annualReturn, setAnnualReturn] = useState<number>(7.5);
  const [taxBracket, setTaxBracket] = useState<number>(24);
  const [copied, setCopied] = useState<boolean>(false);

  const { finalBalance, totalContributed, totalGrowth, immediateAnnualTaxSaved, years } = useMemo(() => {
    const y = Math.max(1, retireAge - currentAge);
    const r = annualReturn / 100;

    let balance = currentBalance;
    let contributions = 0;

    for (let i = 1; i <= y; i++) {
      balance = (balance + annualContribution) * (1 + r);
      contributions += annualContribution;
    }

    const growth = Math.max(0, balance - currentBalance - contributions);
    const annualTaxSaved = annualContribution * (taxBracket / 100);

    return {
      finalBalance: balance,
      totalContributed: contributions,
      totalGrowth: growth,
      immediateAnnualTaxSaved: annualTaxSaved,
      years: y,
    };
  }, [currentAge, retireAge, currentBalance, annualContribution, annualReturn, taxBracket]);

  const handleCoverageChange = (type: "individual" | "family") => {
    setCoverageType(type);
    setAnnualContribution(type === "individual" ? 4150 : 8300);
  };

  const handleCopy = async () => {
    const summary = `HSA Triple Tax Advantage Growth (${years} Years to Age ${retireAge})\n• Projected HSA Medical Nest Egg: $${finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Total Contributions: $${totalContributed.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Compound Tax-Free Growth: +$${totalGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n• Immediate Annual Tax Deduction: $${immediateAnnualTaxSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}/year`;
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
            Coverage Plan
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCoverageChange("individual")}
              className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                coverageType === "individual"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-background border-border text-foreground"
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => handleCoverageChange("family")}
              className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                coverageType === "family"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-background border-border text-foreground"
              }`}
            >
              Family
            </button>
          </div>
          <span className="text-[10px] text-muted-foreground">Max limit: ${coverageType === "individual" ? "4,150" : "8,300"}/yr</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current / Retire Age
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={18}
              max={80}
              value={currentAge}
              onChange={(e) => setCurrentAge(parseInt(e.target.value) || 30)}
              className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
            />
            <input
              type="number"
              min={currentAge + 1}
              max={90}
              value={retireAge}
              onChange={(e) => setRetireAge(parseInt(e.target.value) || 65)}
              className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{years} compounding years</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Balance ($)
          </label>
          <input
            type="number"
            min={0}
            value={currentBalance}
            onChange={(e) => setCurrentBalance(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Deposit ($)
          </label>
          <input
            type="number"
            min={0}
            value={annualContribution}
            onChange={(e) => setAnnualContribution(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Projection Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            HSA Triple Tax-Advantaged Projection at Age {retireAge}
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
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Projected Nest Egg</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">100% Tax-free for healthcare</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Your Contributions</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totalContributed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Pre-tax payroll deposits</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Compound Growth</span>
            <p className="text-2xl font-bold text-foreground">
              +${totalGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Tax-free investment returns</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Annual Tax Saved</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +${immediateAnnualTaxSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Immediate tax deduction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
