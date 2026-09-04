"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, PieChart, TrendingDown, AlertTriangle, ShieldCheck, Copy, Check } from "lucide-react";

interface Preset {
  name: string;
  priorPrice: number;
  downPrice: number;
  downRoundInvestment: number;
  investorShares: number;
  commonShares: number;
  unallocatedPool: number;
}

const PRESETS: Preset[] = [
  {
    name: "50% Down Round (Series B $10 → $5)",
    priorPrice: 10.0,
    downPrice: 5.0,
    downRoundInvestment: 10000000, // $10M raised
    investorShares: 2000000,
    commonShares: 8000000,
    unallocatedPool: 1500000
  },
  {
    name: "Mild 20% Down Round ($15 → $12)",
    priorPrice: 15.0,
    downPrice: 12.0,
    downRoundInvestment: 6000000,
    investorShares: 1000000,
    commonShares: 6000000,
    unallocatedPool: 1000000
  },
  {
    name: "Severe 70% Down Round ($20 → $6)",
    priorPrice: 20.0,
    downPrice: 6.0,
    downRoundInvestment: 15000000,
    investorShares: 3000000,
    commonShares: 12000000,
    unallocatedPool: 2000000
  }
];

export function StartupAntiDilutionCalculator() {
  const [priorPrice, setPriorPrice] = useState<number>(10.0);
  const [downPrice, setDownPrice] = useState<number>(5.0);
  const [downRoundInvestment, setDownRoundInvestment] = useState<number>(10000000);
  const [investorShares, setInvestorShares] = useState<number>(2000000);
  const [commonShares, setCommonShares] = useState<number>(8000000);
  const [unallocatedPool, setUnallocatedPool] = useState<number>(1500000);

  const [copied, setCopied] = useState(false);

  const loadPreset = (p: Preset) => {
    setPriorPrice(p.priorPrice);
    setDownPrice(p.downPrice);
    setDownRoundInvestment(p.downRoundInvestment);
    setInvestorShares(p.investorShares);
    setCommonShares(p.commonShares);
    setUnallocatedPool(p.unallocatedPool);
  };

  const results = useMemo(() => {
    const cp1 = Math.max(0.01, priorPrice);
    const p2 = Math.max(0.01, downPrice);
    const actualSharesIssued = downRoundInvestment / p2; // C
    const sharesPurchasableAtOldPrice = downRoundInvestment / cp1; // B

    // 1. Broad-Based Weighted Average
    // A includes common + preferred + options + unallocated pool
    const A_broad = commonShares + investorShares + unallocatedPool;
    const cp2_broad = cp1 * ((A_broad + sharesPurchasableAtOldPrice) / (A_broad + actualSharesIssued));
    const ratio_broad = cp1 / cp2_broad;
    const newShares_broad = investorShares * ratio_broad;
    const additionalShares_broad = newShares_broad - investorShares;

    // 2. Narrow-Based Weighted Average
    // A only includes common + preferred (excludes unallocated option pool)
    const A_narrow = commonShares + investorShares;
    const cp2_narrow = cp1 * ((A_narrow + sharesPurchasableAtOldPrice) / (A_narrow + actualSharesIssued));
    const ratio_narrow = cp1 / cp2_narrow;
    const newShares_narrow = investorShares * ratio_narrow;
    const additionalShares_narrow = newShares_narrow - investorShares;

    // 3. Full Ratchet
    const cp2_ratchet = p2;
    const ratio_ratchet = cp1 / cp2_ratchet;
    const newShares_ratchet = investorShares * ratio_ratchet;
    const additionalShares_ratchet = newShares_ratchet - investorShares;

    return {
      actualSharesIssued: Math.round(actualSharesIssued),
      sharesPurchasableAtOldPrice: Math.round(sharesPurchasableAtOldPrice),
      broad: {
        newPrice: Number(cp2_broad.toFixed(3)),
        ratio: Number(ratio_broad.toFixed(3)),
        additionalShares: Math.round(additionalShares_broad),
        totalShares: Math.round(newShares_broad)
      },
      narrow: {
        newPrice: Number(cp2_narrow.toFixed(3)),
        ratio: Number(ratio_narrow.toFixed(3)),
        additionalShares: Math.round(additionalShares_narrow),
        totalShares: Math.round(newShares_narrow)
      },
      ratchet: {
        newPrice: Number(cp2_ratchet.toFixed(3)),
        ratio: Number(ratio_ratchet.toFixed(3)),
        additionalShares: Math.round(additionalShares_ratchet),
        totalShares: Math.round(newShares_ratchet)
      }
    };
  }, [priorPrice, downPrice, downRoundInvestment, investorShares, commonShares, unallocatedPool]);

  const handleCopy = async () => {
    const text = [
      `=== STARTUP DOWN-ROUND ANTI-DILUTION AUDIT ===`,
      `Prior Round Price: $${priorPrice.toFixed(2)} | Down Round Price: $${downPrice.toFixed(2)}`,
      `New Capital Raised: $${downRoundInvestment.toLocaleString()}`,
      `Investor Preferred Shares Owned: ${investorShares.toLocaleString()}`,
      `----------------------------------------------`,
      `1. Broad-Based Weighted Average (Market Standard):`,
      `- New Conversion Price: $${results.broad.newPrice}`,
      `- Conversion Ratio: ${results.broad.ratio}:1`,
      `- Additional Anti-Dilution Shares: +${results.broad.additionalShares.toLocaleString()}`,
      `----------------------------------------------`,
      `2. Narrow-Based Weighted Average:`,
      `- New Conversion Price: $${results.narrow.newPrice}`,
      `- Additional Anti-Dilution Shares: +${results.narrow.additionalShares.toLocaleString()}`,
      `----------------------------------------------`,
      `3. Full Ratchet (Harsh Founder Dilution):`,
      `- New Conversion Price: $${results.ratchet.newPrice}`,
      `- Conversion Ratio: ${results.ratchet.ratio}:1`,
      `- Additional Anti-Dilution Shares: +${results.ratchet.additionalShares.toLocaleString()}`,
      `==============================================`
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                VC Down-Round Protection
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Broad-Based vs. Full Ratchet
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-rose-400" />
              Startup Anti-Dilution Down-Round Calculator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Model conversion price adjustments and additional anti-dilution share issuances across Broad-Based Weighted Average, Narrow-Based, and Full Ratchet covenants.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(p)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg border border-slate-700 transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Pricing & Financing Terms</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Prior Round Price ($ CP1)</label>
                <input
                  type="number"
                  step="0.5"
                  value={priorPrice}
                  onChange={(e) => setPriorPrice(Math.max(0.01, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Down Round Price ($ P2)</label>
                <input
                  type="number"
                  step="0.5"
                  value={downPrice}
                  onChange={(e) => setDownPrice(Math.max(0.01, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-rose-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">New Down-Round Capital Raised ($)</label>
              <input
                type="number"
                value={downRoundInvestment}
                onChange={(e) => setDownRoundInvestment(Math.max(10000, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-white">Pre-Round Cap Table Base</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block">Investor Preferred</label>
                  <input
                    type="number"
                    value={investorShares}
                    onChange={(e) => setInvestorShares(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Common Shares</label>
                  <input
                    type="number"
                    value={commonShares}
                    onChange={(e) => setCommonShares(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Unallocated Options</label>
                  <input
                    type="number"
                    value={unallocatedPool}
                    onChange={(e) => setUnallocatedPool(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Comparison (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Anti-Dilution Comparison</h4>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Audit"}
              </button>
            </div>

            {/* Broad Based Card */}
            <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">Broad-Based Weighted Average</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">Standard</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-400">New Conversion Price:</span>
                <span className="font-mono text-emerald-400 font-bold">${results.broad.newPrice}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Additional Shares to Investor:</span>
                <span className="font-mono text-slate-200">+{results.broad.additionalShares.toLocaleString()}</span>
              </div>
            </div>

            {/* Narrow Based Card */}
            <div className="bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-800/60 space-y-1">
              <div className="text-xs font-bold text-indigo-300">Narrow-Based Weighted Average</div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-400">New Conversion Price:</span>
                <span className="font-mono text-indigo-400 font-bold">${results.narrow.newPrice}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Additional Shares to Investor:</span>
                <span className="font-mono text-slate-200">+{results.narrow.additionalShares.toLocaleString()}</span>
              </div>
            </div>

            {/* Full Ratchet Card */}
            <div className="bg-rose-950/40 p-3.5 rounded-xl border border-rose-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300">Full Ratchet (Punitive)</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-semibold">Aggressive</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-400">New Conversion Price:</span>
                <span className="font-mono text-rose-400 font-bold">${results.ratchet.newPrice}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Additional Shares to Investor:</span>
                <span className="font-mono text-rose-300 font-bold">+{results.ratchet.additionalShares.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartupAntiDilutionCalculator;
