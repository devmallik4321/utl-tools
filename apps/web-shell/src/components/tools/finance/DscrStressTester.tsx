"use client";

import { useState, useMemo } from "react";
import { Building, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function DscrStressTester() {
  const [grossPotentialRent, setGrossPotentialRent] = useState<number>(500000);
  const [operatingExpenses, setOperatingExpenses] = useState<number>(195000);
  const [baseVacancyPct, setBaseVacancyPct] = useState<number>(5);
  const [loanBalance, setLoanBalance] = useState<number>(3200000);
  const [baseInterestRate, setBaseInterestRate] = useState<number>(6.25);
  const [amortizationYears, setAmortizationYears] = useState<number>(30);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate annual debt service given rate and principal
  const calcAnnualDebtService = (principal: number, annualRatePct: number, years: number) => {
    const monthlyRate = annualRatePct / 100 / 12;
    const n = years * 12;
    if (monthlyRate === 0) return principal / years;
    const monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1);
    return monthlyPayment * 12;
  };

  const {
    baseNoi,
    baseDebtService,
    baseDscr,
    stressMatrix,
  } = useMemo(() => {
    const calcNoi = (vacPct: number) => {
      const effectiveGrossIncome = grossPotentialRent * (1 - vacPct / 100);
      return Math.max(0, effectiveGrossIncome - operatingExpenses);
    };

    const bNoi = calcNoi(baseVacancyPct);
    const bAds = calcAnnualDebtService(loanBalance, baseInterestRate, amortizationYears);
    const bDscr = bAds > 0 ? bNoi / bAds : 0;

    // Build Stress Scenarios: Rates [Base, +1%, +2%, +3%] x Vacancy [Base, +5%, +10%]
    const rateIncrements = [
      { label: `Base (${baseInterestRate.toFixed(2)}%)`, deltaRate: 0 },
      { label: `+100 bps (${(baseInterestRate + 1).toFixed(2)}%)`, deltaRate: 1.0 },
      { label: `+200 bps (${(baseInterestRate + 2).toFixed(2)}%)`, deltaRate: 2.0 },
      { label: `+300 bps (${(baseInterestRate + 3).toFixed(2)}%)`, deltaRate: 3.0 },
    ];

    const vacIncrements = [
      { label: `Base Vac (${baseVacancyPct}%)`, vac: baseVacancyPct },
      { label: `+5% Vac (${baseVacancyPct + 5}%)`, vac: baseVacancyPct + 5 },
      { label: `+10% Vac (${baseVacancyPct + 10}%)`, vac: baseVacancyPct + 10 },
    ];

    const matrix = rateIncrements.map((r) => {
      const annualDebt = calcAnnualDebtService(loanBalance, baseInterestRate + r.deltaRate, amortizationYears);
      const cells = vacIncrements.map((v) => {
        const noi = calcNoi(v.vac);
        const dscr = annualDebt > 0 ? noi / annualDebt : 0;
        return {
          vacLabel: v.label,
          noi: Math.round(noi),
          dscr: dscr.toFixed(2),
          dscrNum: dscr,
        };
      });

      return {
        rateLabel: r.label,
        debtService: Math.round(annualDebt),
        cells,
      };
    });

    return {
      baseNoi: Math.round(bNoi),
      baseDebtService: Math.round(bAds),
      baseDscr: bDscr.toFixed(2),
      stressMatrix: matrix,
    };
  }, [grossPotentialRent, operatingExpenses, baseVacancyPct, loanBalance, baseInterestRate, amortizationYears]);

  const handleCopy = async () => {
    let summary = `Commercial Real Estate DSCR Sensitivity Stress Test:\n• Base NOI: $${baseNoi.toLocaleString()}/yr\n• Base Debt Service: $${baseDebtService.toLocaleString()}/yr\n• Base Underwritten DSCR: ${baseDscr}x\n\nStress Scenarios Matrix:\n`;
    stressMatrix.forEach((r) => {
      summary += `Rate: ${r.rateLabel} (Debt Service: $${r.debtService.toLocaleString()}):\n`;
      r.cells.forEach((c) => {
        summary += `  - ${c.vacLabel}: DSCR ${c.dscr}x (NOI: $${c.noi.toLocaleString()})\n`;
      });
    });
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Property & Loan Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Gross Potential Rent (GPR) ($)
          </label>
          <input
            type="number"
            step={25000}
            value={grossPotentialRent}
            onChange={(e) => setGrossPotentialRent(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Operating Expenses ($)
          </label>
          <input
            type="number"
            step={10000}
            value={operatingExpenses}
            onChange={(e) => setOperatingExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Base Vacancy Rate (%)
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={baseVacancyPct}
            onChange={(e) => setBaseVacancyPct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Mortgage Loan Balance ($)
          </label>
          <input
            type="number"
            step={50000}
            value={loanBalance}
            onChange={(e) => setLoanBalance(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Base Interest Rate (%)
          </label>
          <input
            type="number"
            step={0.125}
            value={baseInterestRate}
            onChange={(e) => setBaseInterestRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Amortization Period (Years)
          </label>
          <input
            type="number"
            value={amortizationYears}
            onChange={(e) => setAmortizationYears(Math.max(5, parseInt(e.target.value) || 5))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Base Metrics Banner */}
      <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between font-mono">
        <div>
          <span className="text-xs font-bold text-foreground block font-sans">Underwritten Base Performance</span>
          <span className="text-[11px] text-muted-foreground font-sans">
            Base NOI: ${baseNoi.toLocaleString()} • Debt Service: ${baseDebtService.toLocaleString()}/yr
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-sans">Base DSCR:</span>
          <span
            className={`px-3 py-1 rounded-lg text-base font-extrabold ${
              parseFloat(baseDscr) >= 1.25
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40"
            }`}
          >
            {baseDscr}x
          </span>
        </div>
      </div>

      {/* Stress Matrix Table */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-500" />
            Interest Rate &amp; Vacancy Sensitivity Matrix (DSCR Multiples)
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Stress Sheet"}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-sans">
                <th className="py-2.5 px-3">Interest Rate Scenario</th>
                <th className="py-2.5 px-3">Annual Debt</th>
                <th className="py-2.5 px-3">Base Vacancy ({baseVacancyPct}%)</th>
                <th className="py-2.5 px-3">+5% Vacancy ({baseVacancyPct + 5}%)</th>
                <th className="py-2.5 px-3">+10% Vacancy ({baseVacancyPct + 10}%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stressMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/40">
                  <td className="py-3 px-3 font-bold text-foreground">{row.rateLabel}</td>
                  <td className="py-3 px-3 text-muted-foreground">${row.debtService.toLocaleString()}</td>
                  {row.cells.map((cell, cIdx) => {
                    const isSafe = cell.dscrNum >= 1.25;
                    const isBreach = cell.dscrNum < 1.0;
                    return (
                      <td key={cIdx} className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md font-bold ${
                            isSafe
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : isBreach
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {cell.dscr}x
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground font-sans pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
            <span>&ge; 1.25x (Lender Compliant)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
            <span>1.00x – 1.24x (Covenant Cash-Trap Risk)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500" />
            <span>&lt; 1.00x (Negative Cash Flow / Default)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
