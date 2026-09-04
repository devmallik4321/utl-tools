"use client";

import React, { useState, useMemo } from "react";
import { ShieldCheck, DollarSign, Calculator, TrendingUp, Copy, Check, Info } from "lucide-react";

interface ScheduleYear {
  year: number;
  startBalance: number;
  growthAmount: number;
  annuityPayment: number;
  endBalance: number;
}

export function GratTrustCalculator() {
  const [fundingAmount, setFundingAmount] = useState<number>(5000000); // $5M
  const [termYears, setTermYears] = useState<number>(3); // 3 years
  const [hurdleRate, setHurdleRate] = useState<number>(5.0); // 5.0% IRS 7520 rate
  const [growthRate, setGrowthRate] = useState<number>(20.0); // 20% expected appreciation
  const [useIncreasingAnnuity, setUseIncreasingAnnuity] = useState<boolean>(true); // 20% escalation

  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const P = Math.max(10000, fundingAmount);
    const n = Math.max(2, Math.min(15, termYears));
    const r = Math.max(0.1, hurdleRate) / 100;
    const g = Math.max(0, growthRate) / 100;
    const escalation = useIncreasingAnnuity ? 0.20 : 0.0; // 20% max permitted step-up

    // Solve for initial year-1 annuity A1 such that sum( A_t / (1 + r)^t ) = P
    let discountSum = 0;
    for (let t = 1; t <= n; t++) {
      discountSum += Math.pow(1 + escalation, t - 1) / Math.pow(1 + r, t);
    }
    const initialAnnuity = discountSum > 0 ? P / discountSum : 0;

    // Simulate year-by-year cash flows
    const schedule: ScheduleYear[] = [];
    let currentBalance = P;
    let totalAnnuityPaid = 0;

    for (let t = 1; t <= n; t++) {
      const yearAnnuity = initialAnnuity * Math.pow(1 + escalation, t - 1);
      const yearGrowth = currentBalance * g;
      const endBalance = Math.max(0, currentBalance + yearGrowth - yearAnnuity);

      schedule.push({
        year: t,
        startBalance: Math.round(currentBalance),
        growthAmount: Math.round(yearGrowth),
        annuityPayment: Math.round(yearAnnuity),
        endBalance: Math.round(endBalance)
      });

      totalAnnuityPaid += yearAnnuity;
      currentBalance = endBalance;
    }

    const remainderToBeneficiaries = Math.round(currentBalance);
    // 40% federal estate/gift tax savings
    const estateTaxSaved = Math.round(remainderToBeneficiaries * 0.40);

    return {
      initialAnnuity: Math.round(initialAnnuity),
      totalAnnuityPaid: Math.round(totalAnnuityPaid),
      remainderToBeneficiaries,
      estateTaxSaved,
      schedule
    };
  }, [fundingAmount, termYears, hurdleRate, growthRate, useIncreasingAnnuity]);

  const handleCopy = async () => {
    const text = [
      `=== ZEROED-OUT GRAT (SECTION 7520) AUDIT ===`,
      `Initial Funding: $${fundingAmount.toLocaleString()}`,
      `Term: ${termYears} Years | IRS § 7520 Rate: ${hurdleRate}%`,
      `Expected Growth Rate: ${growthRate}%/yr`,
      `Annuity Structure: ${useIncreasingAnnuity ? "20% Annual Escalation" : "Level Annuity"}`,
      `Taxable Gift at Formation: $0.00 (Zeroed-Out Walton GRAT)`,
      `-------------------------------------------`,
      `Year 1 Annuity Payment: $${results.initialAnnuity.toLocaleString()}`,
      `Total Annuity Returned to Grantor: $${results.totalAnnuityPaid.toLocaleString()}`,
      `Wealth Transferred Free of Gift/Estate Tax: $${results.remainderToBeneficiaries.toLocaleString()}`,
      `Estimated Federal Estate Tax Saved (40%): $${results.estateTaxSaved.toLocaleString()}`,
      `===========================================`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            IRC § 2702 & § 7520
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Zeroed-Out Walton GRAT
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Grantor Retained Annuity Trust (GRAT) Section 7520 Calculator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Model zeroed-out Grantor Retained Annuity Trusts (GRATs). Calculate statutory hurdle annuities, 20% escalating payouts, and tax-free surplus wealth transfers escaping the 40% federal estate tax.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Trust Funding & Statutory Assumptions</h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Asset Value Transferred to GRAT ($)</label>
              <input
                type="number"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(Math.max(10000, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Trust Term (Years)</label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={termYears}
                  onChange={(e) => setTermYears(Math.max(2, Math.min(15, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">IRS § 7520 Hurdle Rate (%)</label>
                <input
                  type="number"
                  step="0.2"
                  value={hurdleRate}
                  onChange={(e) => setHurdleRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Expected Annual Asset Appreciation</span>
                <span className="font-mono text-emerald-400 font-bold">{growthRate}%/yr</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={growthRate}
                onChange={(e) => setGrowthRate(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useIncreasingAnnuity}
                  onChange={(e) => setUseIncreasingAnnuity(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                />
                <span>Apply 20% Annual Annuity Escalation (Treas. Reg. § 25.2702-3)</span>
              </label>
              <p className="text-[11px] text-slate-500 mt-1">
                Escalating back-loaded annuities keep capital compounding inside the trust longer, maximizing tax-free transfers.
              </p>
            </div>
          </div>
        </div>

        {/* Right Dashboard & Amortization (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Tax-Free Wealth Transfer
              </h4>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Audit"}
              </button>
            </div>

            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60">
              <div className="text-[11px] text-emerald-300">Net Wealth Passed to Beneficiaries</div>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
                ${results.remainderToBeneficiaries.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Federal Estate Tax Saved (40% rate): <span className="text-emerald-300 font-bold">${results.estateTaxSaved.toLocaleString()}</span>
              </div>
            </div>

            {/* Year-by-Year Schedule */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-slate-300">Annuity Payout Schedule</div>
              <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden text-xs">
                <div className="grid grid-cols-4 p-2 bg-slate-900/80 text-[10px] uppercase font-semibold text-slate-400">
                  <div>Year</div>
                  <div>Growth</div>
                  <div>Annuity</div>
                  <div className="text-right">End Balance</div>
                </div>
                {results.schedule.map((row) => (
                  <div key={row.year} className="grid grid-cols-4 p-2 border-t border-slate-800/60 font-mono text-[11px]">
                    <div className="text-slate-400">Year {row.year}</div>
                    <div className="text-emerald-400">+${row.growthAmount.toLocaleString()}</div>
                    <div className="text-rose-400">-${row.annuityPayment.toLocaleString()}</div>
                    <div className="text-right text-slate-200">${row.endBalance.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GratTrustCalculator;
