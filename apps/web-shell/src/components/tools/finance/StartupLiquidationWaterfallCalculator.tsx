"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, PieChart, TrendingUp, AlertCircle, RefreshCw, Copy, Check } from "lucide-react";

type PreferenceType = "NON_PARTICIPATING" | "FULL_PARTICIPATING" | "CAPPED_PARTICIPATING";

export function StartupLiquidationWaterfallCalculator() {
  const [exitValuation, setExitValuation] = useState<number>(25000000); // $25M exit
  const [prefType, setPrefType] = useState<PreferenceType>("NON_PARTICIPATING");
  const [capMultiple, setCapMultiple] = useState<number>(3.0); // 3x cap if capped

  // Series A
  const [seriesAInvested, setSeriesAInvested] = useState<number>(8000000); // $8M invested
  const [seriesAPercent, setSeriesAPercent] = useState<number>(25); // 25% ownership
  const [seriesAMultiple, setSeriesAMultiple] = useState<number>(1.0); // 1x

  // Seed
  const [seedInvested, setSeedInvested] = useState<number>(2000000); // $2M invested
  const [seedPercent, setSeedPercent] = useState<number>(15); // 15% ownership
  const [seedMultiple, setSeedMultiple] = useState<number>(1.0); // 1x

  // Common is remaining 60%
  const commonPercent = Math.max(0, 100 - seriesAPercent - seedPercent);

  const [copied, setCopied] = useState(false);

  const calculation = useMemo(() => {
    const exit = Math.max(0, exitValuation);

    // Seniority: Series A > Seed > Common
    const seriesAPrefAmount = seriesAInvested * seriesAMultiple;
    const seedPrefAmount = seedInvested * seedMultiple;

    let seriesAPayout = 0;
    let seedPayout = 0;
    let commonPayout = 0;
    let seriesAConverted = false;
    let seedConverted = false;

    if (prefType === "NON_PARTICIPATING") {
      // Non-participating: Preferred chooses between (A) Liquidation Preference or (B) Converting to Common %
      const seriesAAsCommon = exit * (seriesAPercent / 100);
      const seedAsCommon = exit * (seedPercent / 100);

      // Check conversion decisions
      seriesAConverted = seriesAAsCommon > seriesAPrefAmount;
      seedConverted = seedAsCommon > seedPrefAmount;

      if (seriesAConverted && seedConverted) {
        // Everyone shares pro-rata
        seriesAPayout = seriesAAsCommon;
        seedPayout = seedAsCommon;
        commonPayout = exit * (commonPercent / 100);
      } else {
        // Waterfall payout
        let remaining = exit;
        
        // Series A takes preference or converted
        if (!seriesAConverted) {
          seriesAPayout = Math.min(remaining, seriesAPrefAmount);
          remaining -= seriesAPayout;
        }

        // Seed takes preference or converted
        if (!seedConverted) {
          seedPayout = Math.min(remaining, seedPrefAmount);
          remaining -= seedPayout;
        }

        // What if one converted and one didn't?
        if (seriesAConverted) {
          // Series A shares remaining pool pro-rata with common
          const poolShares = seriesAPercent + commonPercent || 1;
          seriesAPayout = remaining * (seriesAPercent / poolShares);
          commonPayout = remaining * (commonPercent / poolShares);
        } else if (seedConverted) {
          const poolShares = seedPercent + commonPercent || 1;
          seedPayout = remaining * (seedPercent / poolShares);
          commonPayout = remaining * (commonPercent / poolShares);
        } else {
          commonPayout = remaining;
        }
      }
    } else if (prefType === "FULL_PARTICIPATING") {
      // Full participating: takes preference FIRST, then shares remaining exit pro-rata with everyone
      let remaining = exit;

      const aPref = Math.min(remaining, seriesAPrefAmount);
      seriesAPayout += aPref;
      remaining -= aPref;

      const sPref = Math.min(remaining, seedPrefAmount);
      seedPayout += sPref;
      remaining -= sPref;

      // Pro-rata distribution of remainder
      seriesAPayout += remaining * (seriesAPercent / 100);
      seedPayout += remaining * (seedPercent / 100);
      commonPayout += remaining * (commonPercent / 100);
    } else {
      // CAPPED_PARTICIPATING
      // Takes preference first, participates in remainder up to Cap * Invested. If converting to pure common yields more, converts!
      const aMaxPayout = seriesAInvested * capMultiple;
      const sMaxPayout = seedInvested * capMultiple;

      const seriesAAsCommon = exit * (seriesAPercent / 100);
      const seedAsCommon = exit * (seedPercent / 100);

      seriesAConverted = seriesAAsCommon > aMaxPayout;
      seedConverted = seedAsCommon > sMaxPayout;

      if (seriesAConverted && seedConverted) {
        seriesAPayout = seriesAAsCommon;
        seedPayout = seedAsCommon;
        commonPayout = exit * (commonPercent / 100);
      } else {
        let remaining = exit;

        // Take base preferences
        const aPref = Math.min(remaining, seriesAPrefAmount);
        seriesAPayout += aPref;
        remaining -= aPref;

        const sPref = Math.min(remaining, seedPrefAmount);
        seedPayout += sPref;
        remaining -= sPref;

        // Participate in remaining pool up to cap
        const aRoomToCap = Math.max(0, aMaxPayout - seriesAPayout);
        const sRoomToCap = Math.max(0, sMaxPayout - seedPayout);

        const aShare = remaining * (seriesAPercent / 100);
        const aAdded = Math.min(aRoomToCap, aShare);
        seriesAPayout += aAdded;

        const sShare = remaining * (seedPercent / 100);
        const sAdded = Math.min(sRoomToCap, sShare);
        seedPayout += sAdded;

        commonPayout = Math.max(0, exit - seriesAPayout - seedPayout);
      }
    }

    // Returns on investment (MOIC)
    const seriesAMoic = seriesAInvested > 0 ? (seriesAPayout / seriesAInvested).toFixed(2) : "0.00";
    const seedMoic = seedInvested > 0 ? (seedPayout / seedInvested).toFixed(2) : "0.00";

    return {
      exit,
      seriesAPayout: Math.round(seriesAPayout),
      seedPayout: Math.round(seedPayout),
      commonPayout: Math.round(commonPayout),
      seriesAMoic,
      seedMoic,
      seriesAConverted,
      seedConverted,
      seriesAPrefAmount,
      seedPrefAmount
    };
  }, [
    exitValuation,
    prefType,
    capMultiple,
    seriesAInvested,
    seriesAPercent,
    seriesAMultiple,
    seedInvested,
    seedPercent,
    seedMultiple,
    commonPercent
  ]);

  const handleCopy = async () => {
    const text = [
      `=== STARTUP EXIT LIQUIDATION WATERFALL ===`,
      `Total Exit Valuation: $${calculation.exit.toLocaleString()}`,
      `Preference Structure: ${prefType}`,
      `-----------------------------------------`,
      `Series A ($${seriesAInvested.toLocaleString()} invested, ${seriesAPercent}%):`,
      `- Payout: $${calculation.seriesAPayout.toLocaleString()} (${calculation.seriesAMoic}x MOIC)`,
      `- Converted to Common: ${calculation.seriesAConverted ? "YES" : "NO"}`,
      `-----------------------------------------`,
      `Seed ($${seedInvested.toLocaleString()} invested, ${seedPercent}%):`,
      `- Payout: $${calculation.seedPayout.toLocaleString()} (${calculation.seedMoic}x MOIC)`,
      `- Converted to Common: ${calculation.seedConverted ? "YES" : "NO"}`,
      `-----------------------------------------`,
      `Common Stock (Founders & Options, ${commonPercent}%):`,
      `- Payout: $${calculation.commonPayout.toLocaleString()} (${((calculation.commonPayout / calculation.exit) * 100 || 0).toFixed(1)}% of exit)`,
      `=========================================`
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
            Venture Capital Term Sheet
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Participating vs. Non-Participating
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          Startup Liquidation Preference Waterfall Calculator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Model exit proceeds distribution across Series A, Seed, and Founder Common equity tranches under participating, non-participating, and capped preference provisions.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Exit Valuation & Preference Type */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Exit Valuation & Preference Structure</h3>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Exit Proceeds / Purchase Price</span>
                <span className="font-mono text-emerald-400 font-bold">${exitValuation.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000000"
                max="100000000"
                step="500000"
                value={exitValuation}
                onChange={(e) => setExitValuation(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[5000000, 15000000, 25000000, 50000000, 80000000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setExitValuation(val)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 rounded border border-slate-700 font-mono transition"
                  >
                    ${val / 1000000}M
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs text-slate-400 block">Preference Terms</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: "NON_PARTICIPATING", label: "Non-Participating (Standard)" },
                  { id: "FULL_PARTICIPATING", label: "Full Participating (Aggressive)" },
                  { id: "CAPPED_PARTICIPATING", label: "Capped Participating" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPrefType(t.id as PreferenceType)}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition ${
                      prefType === t.id
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {prefType === "CAPPED_PARTICIPATING" && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Participation Cap Multiple</span>
                  <span className="font-mono text-indigo-400">{capMultiple}x</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="5.0"
                  step="0.5"
                  value={capMultiple}
                  onChange={(e) => setCapMultiple(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Capital Structure */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Investment Tranches</h3>

            {/* Series A */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-indigo-300">Series A Preferred (Senior)</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block">Capital Invested ($)</label>
                  <input
                    type="number"
                    value={seriesAInvested}
                    onChange={(e) => setSeriesAInvested(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Ownership %</label>
                  <input
                    type="number"
                    value={seriesAPercent}
                    onChange={(e) => setSeriesAPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Liquidation Multiple</label>
                  <input
                    type="number"
                    step="0.5"
                    value={seriesAMultiple}
                    onChange={(e) => setSeriesAMultiple(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Seed */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-cyan-300">Seed Preferred (Junior Preferred)</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block">Capital Invested ($)</label>
                  <input
                    type="number"
                    value={seedInvested}
                    onChange={(e) => setSeedInvested(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Ownership %</label>
                  <input
                    type="number"
                    value={seedPercent}
                    onChange={(e) => setSeedPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Liquidation Multiple</label>
                  <input
                    type="number"
                    step="0.5"
                    value={seedMultiple}
                    onChange={(e) => setSeedMultiple(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Common */}
            <div className="flex justify-between items-center text-xs text-slate-400 px-1">
              <span>Common Stock (Founders & Employees):</span>
              <span className="font-mono text-emerald-400 font-semibold">{commonPercent}% of company</span>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Visual Distribution Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Exit Waterfall Distribution</h4>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Breakdown"}
              </button>
            </div>

            {/* Progress Stack */}
            <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${(calculation.seriesAPayout / (calculation.exit || 1)) * 100}%` }}
                className="bg-indigo-500 h-full transition-all"
                title="Series A"
              />
              <div
                style={{ width: `${(calculation.seedPayout / (calculation.exit || 1)) * 100}%` }}
                className="bg-cyan-500 h-full transition-all"
                title="Seed"
              />
              <div
                style={{ width: `${(calculation.commonPayout / (calculation.exit || 1)) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title="Common"
              />
            </div>

            {/* Tranche Cards */}
            <div className="space-y-3">
              {/* Series A Card */}
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-indigo-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Series A Preferred
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    ${calculation.seriesAPayout.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Multiple on Invested Capital:</span>
                  <span className="font-mono text-slate-200">{calculation.seriesAMoic}x MOIC</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {calculation.seriesAConverted ? "Converted to common stock (optimal yield)" : "Exercised liquidation preference"}
                </div>
              </div>

              {/* Seed Card */}
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-cyan-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Seed Preferred
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    ${calculation.seedPayout.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Multiple on Invested Capital:</span>
                  <span className="font-mono text-slate-200">{calculation.seedMoic}x MOIC</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {calculation.seedConverted ? "Converted to common stock (optimal yield)" : "Exercised liquidation preference"}
                </div>
              </div>

              {/* Common Card */}
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-emerald-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Common / Founders & Team
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    ${calculation.commonPayout.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Share of Total Exit:</span>
                  <span className="font-mono text-slate-200">
                    {((calculation.commonPayout / (calculation.exit || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartupLiquidationWaterfallCalculator;
