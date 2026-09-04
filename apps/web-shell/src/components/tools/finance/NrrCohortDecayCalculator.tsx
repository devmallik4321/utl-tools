'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Layers, Award, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface CohortYear {
  year: number;
  cohortValue: number;
  retentionMultiplier: number;
}

export function NrrCohortDecayCalculator() {
  const [initialCohortArr, setInitialCohortArr] = useState<number>(1000000); // $1M initial cohort
  const [netRevenueRetentionPct, setNetRevenueRetentionPct] = useState<number>(118); // 118% NRR
  const [grossRevenueRetentionPct, setGrossRevenueRetentionPct] = useState<number>(92); // 92% GRR
  const [projectionYears, setProjectionYears] = useState<number>(5);

  const cohortData = useMemo(() => {
    const years: CohortYear[] = [];
    const nrrRate = netRevenueRetentionPct / 100;
    const grrRate = grossRevenueRetentionPct / 100;

    let currentNrrVal = initialCohortArr;
    let currentGrrVal = initialCohortArr;

    for (let yr = 0; yr <= projectionYears; yr++) {
      if (yr === 0) {
        years.push({
          year: 0,
          cohortValue: initialCohortArr,
          retentionMultiplier: 1.0
        });
      } else {
        currentNrrVal = currentNrrVal * nrrRate;
        years.push({
          year: yr,
          cohortValue: currentNrrVal,
          retentionMultiplier: Math.pow(nrrRate, yr)
        });
      }
    }

    const yr5Value = years[years.length - 1]?.cohortValue || initialCohortArr;
    const netExpansionDollars = yr5Value - initialCohortArr;

    let tier = 'Top Decile (>120%)';
    let tierColor = 'text-emerald-400 font-extrabold';
    if (netRevenueRetentionPct >= 120) {
      tier = 'Best-in-Class (>120% Enterprise NRR)';
      tierColor = 'text-emerald-400 font-black';
    } else if (netRevenueRetentionPct >= 105) {
      tier = 'Healthy Expansion (105% - 120% NRR)';
      tierColor = 'text-cyan-400';
    } else if (netRevenueRetentionPct >= 95) {
      tier = 'Flat / Net Zero Retention (95% - 105%)';
      tierColor = 'text-amber-400';
    } else {
      tier = 'Severe Net Contraction (<95% NRR)';
      tierColor = 'text-rose-400 font-bold';
    }

    return {
      years,
      yr5Value,
      netExpansionDollars,
      tier,
      tierColor
    };
  }, [initialCohortArr, netRevenueRetentionPct, grossRevenueRetentionPct, projectionYears]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">SaaS Net Revenue Retention (NRR) Cohort Decay Calculator</h1>
            <p className="text-sm text-slate-400">
              Model multi-year revenue compounding and expansion decay across annual customer cohorts under varying Net Revenue Retention (NRR) and Gross Retention (GRR) rates.
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Year {projectionYears} Cohort Value (from $1M base)</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-black font-mono ${cohortData.tierColor}`}>
                ${(cohortData.yr5Value / 1000000).toFixed(2)}M
              </span>
              <span className="text-xs text-emerald-300 font-semibold">
                ({((cohortData.yr5Value / initialCohortArr) * 100).toFixed(0)}% of original cohort)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Benchmark Tier</span>
            <span className="text-sm font-bold text-slate-200">
              {cohortData.tier}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Cohort Retention Parameters</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Starting Cohort ARR ($)</label>
            <input
              type="number"
              min="100000"
              step="250000"
              value={initialCohortArr}
              onChange={(e) => setInitialCohortArr(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Net Revenue Retention (NRR)</span>
              <span className="font-mono text-emerald-400">{netRevenueRetentionPct}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="150"
              value={netRevenueRetentionPct}
              onChange={(e) => setNetRevenueRetentionPct(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Gross Revenue Retention (GRR)</span>
              <span className="font-mono text-cyan-400">{grossRevenueRetentionPct}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="100"
              value={grossRevenueRetentionPct}
              onChange={(e) => setGrossRevenueRetentionPct(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">GRR cannot exceed 100% (excludes upsells/expansion).</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Projection Horizon (Years)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={projectionYears}
              onChange={(e) => setProjectionYears(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Multi-Year Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
          <h2 className="text-base font-semibold text-slate-200">Cohort Revenue Evolution Over Time</h2>

          <div className="space-y-2">
            {cohortData.years.map((c) => (
              <div
                key={c.year}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-emerald-400 block">
                    {c.year === 0 ? 'Initial Acquisition (Year 0)' : `Year ${c.year} Retained Cohort`}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Retention Multiplier: {c.retentionMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-white block">
                    ${c.cohortValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className={`text-[11px] font-mono ${c.cohortValue >= initialCohortArr ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {c.cohortValue >= initialCohortArr ? '+' : ''}
                    {(((c.cohortValue - initialCohortArr) / initialCohortArr) * 100).toFixed(1)}% vs Year 0
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs text-slate-400 flex items-start space-x-2">
            <Info className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
            <span>
              <strong>The Power of Negative Net Churn:</strong> When NRR exceeds 100% (e.g. Snowflake at 158%, Datadog at 130%), existing customer cohorts expand faster than churn erodes them, enabling compounding organic growth even before adding a single new logo.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NrrCohortDecayCalculator;
