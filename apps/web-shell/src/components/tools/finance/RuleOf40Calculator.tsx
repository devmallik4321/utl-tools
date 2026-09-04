'use client';

import React, { useState, useMemo } from 'react';
import { Gauge, TrendingUp, DollarSign, Award, ShieldAlert, CheckCircle2, ArrowRight, Info } from 'lucide-react';

export function RuleOf40Calculator() {
  const [arrGrowthRate, setArrGrowthRate] = useState<number>(35); // 35% YoY ARR growth
  const [marginType, setMarginType] = useState<'fcf' | 'ebitda'>('fcf');
  const [profitMargin, setProfitMargin] = useState<number>(12); // 12% FCF margin
  const [currentArr, setCurrentArr] = useState<number>(25000000); // $25M ARR

  const calculation = useMemo(() => {
    const score = arrGrowthRate + profitMargin;

    // Benchmarks & Tiering
    let tier = 'Elite';
    let tierColor = 'text-emerald-400';
    let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    let valuationMultiple = 10.5; // typical ARR multiple

    if (score >= 60) {
      tier = 'Hyper-Scale Elite (>60%)';
      valuationMultiple = 14.0;
      tierColor = 'text-emerald-300 font-extrabold';
    } else if (score >= 40) {
      tier = 'Passing Rule of 40 (Top Quartile)';
      valuationMultiple = 8.5;
      tierColor = 'text-emerald-400';
    } else if (score >= 20) {
      tier = 'Developing / Growth Drag (20% - 40%)';
      valuationMultiple = 4.5;
      tierColor = 'text-amber-400';
      badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    } else {
      tier = 'Distressed Efficiency (<20%)';
      valuationMultiple = 2.0;
      tierColor = 'text-rose-400';
      badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }

    const estimatedEnterpriseValue = currentArr * valuationMultiple;

    return {
      score,
      tier,
      tierColor,
      badgeColor,
      valuationMultiple,
      estimatedEnterpriseValue,
      passed: score >= 40
    };
  }, [arrGrowthRate, profitMargin, currentArr]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">SaaS Rule of 40 Efficiency Calculator</h1>
            <p className="text-sm text-slate-400">
              Benchmark software company operating health (YoY ARR Growth Rate + Profitability Margin) and evaluate enterprise valuation multiples.
            </p>
          </div>
        </div>

        {/* Score Banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Combined Rule of 40 Score</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-4xl font-black font-mono ${calculation.tierColor}`}>
                {calculation.score.toFixed(1)}%
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${calculation.badgeColor}`}>
                {calculation.passed ? 'Rule of 40 Met' : 'Below Rule of 40'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Est. EV / ARR Multiple</span>
            <span className="text-2xl font-bold text-slate-100 font-mono">
              ~{calculation.valuationMultiple.toFixed(1)}x ARR
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Operational Metrics</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Annual Recurring Revenue (ARR)</label>
            <input
              type="number"
              min="0"
              step="1000000"
              value={currentArr}
              onChange={(e) => setCurrentArr(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
              <span>YoY ARR Growth Rate</span>
              <span className="font-mono text-emerald-400">{arrGrowthRate}%</span>
            </div>
            <input
              type="range"
              min="-20"
              max="150"
              value={arrGrowthRate}
              onChange={(e) => setArrGrowthRate(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Profitability Metric</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => setMarginType('fcf')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    marginType === 'fcf' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  FCF Margin
                </button>
                <button
                  onClick={() => setMarginType('ebitda')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    marginType === 'ebitda' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  EBITDA Margin
                </button>
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
              <span>{marginType.toUpperCase()} Margin (%)</span>
              <span className="font-mono text-emerald-400">{profitMargin}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="60"
              value={profitMargin}
              onChange={(e) => setProfitMargin(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Rule Formula:</span>
            <p className="font-mono text-emerald-300">
              Rule of 40 = Growth Rate ({arrGrowthRate}%) + {marginType.toUpperCase()} Margin ({profitMargin}%) = {calculation.score}%
            </p>
          </div>
        </div>

        {/* Breakdown & Multiples */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Valuation & Benchmark Performance</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1">Efficiency Tier</span>
              <span className={`text-base font-bold ${calculation.tierColor}`}>{calculation.tier}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1">Est. Enterprise Value</span>
              <span className="text-base font-bold font-mono text-white">
                ${(calculation.estimatedEnterpriseValue / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bessemer / Bain SaaS Benchmarks</h3>
            <div className="space-y-1.5 text-xs">
              <div className={`p-2.5 rounded-lg border flex justify-between items-center ${calculation.score >= 60 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 font-bold' : 'bg-slate-800/40 border-slate-700/40 text-slate-400'}`}>
                <span>Top Decile (&gt;60% Score)</span>
                <span>12x - 18x EV/ARR</span>
              </div>
              <div className={`p-2.5 rounded-lg border flex justify-between items-center ${calculation.score >= 40 && calculation.score < 60 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 font-bold' : 'bg-slate-800/40 border-slate-700/40 text-slate-400'}`}>
                <span>Top Quartile (40% - 60% Score)</span>
                <span>7x - 11x EV/ARR</span>
              </div>
              <div className={`p-2.5 rounded-lg border flex justify-between items-center ${calculation.score >= 20 && calculation.score < 40 ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 font-bold' : 'bg-slate-800/40 border-slate-700/40 text-slate-400'}`}>
                <span>Median SaaS (20% - 40% Score)</span>
                <span>4x - 6x EV/ARR</span>
              </div>
              <div className={`p-2.5 rounded-lg border flex justify-between items-center ${calculation.score < 20 ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 font-bold' : 'bg-slate-800/40 border-slate-700/40 text-slate-400'}`}>
                <span>Bottom Quartile (&lt;20% Score)</span>
                <span>1.5x - 3x EV/ARR</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs text-slate-400 flex items-start space-x-2">
            <Info className="w-4 h-4 flex-shrink-0 text-slate-300 mt-0.5" />
            <span>
              Popularized by Brad Feld, the Rule of 40 allows early-stage companies with rapid growth (e.g. 70% ARR growth) to operate with negative cash flow (-30% margin) while still demonstrating exceptional business quality.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RuleOf40Calculator;
