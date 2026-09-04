'use client';

import React, { useState, useId } from 'react';
import {
  DollarSign,
  Scale,
  Percent,
  TrendingDown,
  PieChart,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Info
} from 'lucide-react';

interface SafeTranche {
  id: string;
  name: string;
  investment: number;
  valuationCap: number;
}

export function PreMoneyVsPostMoneySafesCalculator() {
  const [safes, setSafes] = useState<SafeTranche[]>([
    { id: '1', name: 'Angel SAFE #1', investment: 500000, valuationCap: 6000000 },
    { id: '2', name: 'Seed Fund SAFE #2', investment: 1500000, valuationCap: 12000000 },
  ]);

  const [seriesAPreMoney, setSeriesAPreMoney] = useState<number>(20000000);
  const [seriesANewMoney, setSeriesANewMoney] = useState<number>(5000000);
  const [optionPoolPct, setOptionPoolPct] = useState<number>(10);
  const [copied, setCopied] = useState<boolean>(false);

  const totalSafeInvestment = safes.reduce((sum, s) => sum + s.investment, 0);

  // POST-MONEY SAFE CALCULATIONS (Standard YC)
  // Each post-money SAFE owns fixed % = investment / valuationCap
  const postSafePcts = safes.map((s) => ({
    name: s.name,
    ownershipPct: (s.investment / s.valuationCap) * 100,
  }));
  const totalPostSafePct = postSafePcts.reduce((sum, s) => sum + s.ownershipPct, 0);
  const postFounderPreSeriesAPct = Math.max(0, 100 - totalPostSafePct);

  // In Series A: Dilution by Series A new money & Option Pool
  const seriesAPct = (seriesANewMoney / (seriesAPreMoney + seriesANewMoney)) * 100;
  const postFounderPostSeriesAPct = postFounderPreSeriesAPct * (1 - (seriesAPct + optionPoolPct) / 100);

  // PRE-MONEY SAFE CALCULATIONS (Legacy SAFE)
  // Pre-money SAFEs dilute together with founders.
  // Effective pre-money company valuation includes SAFEs in denominator.
  const preSafeDilutionEstimate = safes.map((s) => {
    // In pre-money, SAFE shares = Investment / min(SeriesA PPS, Cap / PreMoneyShares)
    // Approximate ownership percentage
    const rawPct = (s.investment / (s.valuationCap + totalSafeInvestment)) * 100;
    return { name: s.name, ownershipPct: rawPct };
  });
  const totalPreSafePct = preSafeDilutionEstimate.reduce((sum, s) => sum + s.ownershipPct, 0);
  const preFounderPostSeriesAPct = Math.max(0, 100 - totalPreSafePct) * (1 - (seriesAPct + optionPoolPct) / 100);

  const founderDifferencePct = preFounderPostSeriesAPct - postFounderPostSeriesAPct;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleAddSafe = () => {
    const newId = (safes.length + 1).toString();
    setSafes([
      ...safes,
      { id: newId, name: `SAFE Tranche #${newId}`, investment: 500000, valuationCap: 15000000 },
    ]);
  };

  const handleRemoveSafe = (id: string) => {
    if (safes.length > 1) {
      setSafes(safes.filter((s) => s.id !== id));
    }
  };

  const handleUpdateSafe = (id: string, field: 'name' | 'investment' | 'valuationCap', value: string | number) => {
    setSafes(
      safes.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const handleCopy = () => {
    const text = [
      `Pre-Money vs Post-Money SAFE Dilution Stack Comparison`,
      `-------------------------------------------------------`,
      `Total SAFE Capital Raised:    ${formatCurrency(totalSafeInvestment)} across ${safes.length} tranches`,
      `Series A Pre-Money:           ${formatCurrency(seriesAPreMoney)}`,
      `Series A New Money:           ${formatCurrency(seriesANewMoney)} (${seriesAPct.toFixed(1)}% ownership)`,
      `Option Pool Expansion:        ${optionPoolPct}%`,
      `-------------------------------------------------------`,
      `Founder Post-Money Ownership: ${postFounderPostSeriesAPct.toFixed(2)}%`,
      `Founder Pre-Money Ownership:  ${preFounderPostSeriesAPct.toFixed(2)}%`,
      `Founder Retention Difference: +${founderDifferencePct.toFixed(2)}% retained under Pre-Money`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            YC SAFE Structural Dilution Modeling
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Analysis'}
          </button>
          <button
            onClick={() => {
              setSafes([
                { id: '1', name: 'Angel SAFE #1', investment: 500000, valuationCap: 6000000 },
                { id: '2', name: 'Seed Fund SAFE #2', investment: 1500000, valuationCap: 12000000 },
              ]);
              setSeriesAPreMoney(20000000);
              setSeriesANewMoney(5000000);
              setOptionPoolPct(10);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Comparison Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Founder Post-Round (Post-Money SAFE)</span>
          <div className="mt-1 text-2xl font-bold text-amber-400 tracking-tight">{postFounderPostSeriesAPct.toFixed(1)}%</div>
          <div className="mt-1 text-xs text-slate-400">Total SAFE Dilution: {totalPostSafePct.toFixed(1)}%</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Founder Post-Round (Pre-Money SAFE)</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400 tracking-tight">{preFounderPostSeriesAPct.toFixed(1)}%</div>
          <div className="mt-1 text-xs text-slate-400">Total SAFE Dilution: {totalPreSafePct.toFixed(1)}%</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Founder Equity Delta</span>
          <div className="mt-1 text-2xl font-bold text-sky-400 tracking-tight">
            +{Math.abs(founderDifferencePct).toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {founderDifferencePct >= 0 ? 'Pre-Money preserves more founder equity' : 'Post-Money favors investors'}
          </div>
        </div>
      </div>

      {/* Input Controls & SAFE Stack List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left SAFE Stacking Table */}
        <div className="lg:col-span-7 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              SAFE Tranche Stack ({safes.length})
            </h3>
            <button
              onClick={handleAddSafe}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add SAFE
            </button>
          </div>

          <div className="space-y-3">
            {safes.map((s) => (
              <div key={s.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-0.5">Tranche Name</label>
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => handleUpdateSafe(s.id, 'name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-0.5">Investment ($)</label>
                  <input
                    type="number"
                    step="50000"
                    value={s.investment}
                    onChange={(e) => handleUpdateSafe(s.id, 'investment', Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-0.5">Valuation Cap ($)</label>
                  <input
                    type="number"
                    step="500000"
                    value={s.valuationCap}
                    onChange={(e) => handleUpdateSafe(s.id, 'valuationCap', Number(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    onClick={() => handleRemoveSafe(s.id)}
                    disabled={safes.length <= 1}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-slate-400 flex justify-between font-mono">
            <span>Total SAFE Capital:</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(totalSafeInvestment)}</span>
          </div>
        </div>

        {/* Right Series A Parameters & Cap Table View */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-sky-400" />
            Priced Series A Round
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Series A Pre-Money Valuation ($)
            </label>
            <input
              type="number"
              step="1000000"
              value={seriesAPreMoney}
              onChange={(e) => setSeriesAPreMoney(Math.max(1000000, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Series A New Money Investment ($)
            </label>
            <input
              type="number"
              step="500000"
              value={seriesANewMoney}
              onChange={(e) => setSeriesANewMoney(Math.max(100000, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Unallocated Option Pool (% Post-Round)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="30"
              value={optionPoolPct}
              onChange={(e) => setOptionPoolPct(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Quick Comparison Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-slate-300">Post-Series A Founder Ownership</span>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-amber-400">Post-Money SAFE:</span>
                <span className="font-mono text-amber-400 font-bold">{postFounderPostSeriesAPct.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-emerald-400">Pre-Money SAFE:</span>
                <span className="font-mono text-emerald-400 font-bold">{preFounderPostSeriesAPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          Pre-Money vs Post-Money SAFE Mechanics
        </h4>
        <p>
          In 2018, Y Combinator replaced the legacy Pre-Money SAFE with the Post-Money SAFE to provide investors with absolute ownership clarity: a $1M check on a $10M post-money cap guarantees exactly 10% ownership of the pre-Series-A company. However, when founders stack multiple post-money SAFEs, all subsequent SAFE dilution is absorbed entirely by the founders rather than shared among the SAFE holders.
        </p>
      </div>
    </div>
  );
}

export default PreMoneyVsPostMoneySafesCalculator;
