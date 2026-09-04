"use client";

import React, { useState, useMemo } from "react";
import { Activity, Heart, ShieldCheck, AlertCircle, TrendingUp, Gauge, Copy, Check, RefreshCw } from "lucide-react";

interface HrvPreset {
  name: string;
  rrIntervals: string;
}

const PRESETS: HrvPreset[] = [
  {
    name: "Optimal Recovery (Parasympathetic Dominant)",
    rrIntervals: "840, 895, 830, 915, 850, 930, 860, 920, 875, 940, 880, 955, 870, 935"
  },
  {
    name: "Moderate Baseline (Normal Rest)",
    rrIntervals: "800, 835, 810, 845, 815, 850, 820, 840, 805, 830, 815, 845, 825, 835"
  },
  {
    name: "Acute Stress / Overtraining (Sympathetic Surge)",
    rrIntervals: "720, 730, 725, 735, 728, 732, 722, 736, 725, 730, 726, 731, 724, 729"
  }
];

export function HrvRmssdRecoveryCalculator() {
  const [rawText, setRawText] = useState<string>(PRESETS[0].rrIntervals);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    // Parse comma or whitespace separated numbers
    const tokens = rawText.split(/[,\s\n]+/).filter(Boolean);
    const intervals = tokens.map((t) => Number(t)).filter((n) => !isNaN(n) && n >= 300 && n <= 2000);

    if (intervals.length < 3) {
      return null;
    }

    // Mean RR
    const sumRR = intervals.reduce((acc, v) => acc + v, 0);
    const meanRR = sumRR / intervals.length;
    const heartRateBpm = Math.round(60000 / meanRR);

    // rMSSD calculation
    let sumSquaredDiffs = 0;
    for (let i = 0; i < intervals.length - 1; i++) {
      const diff = intervals[i + 1] - intervals[i];
      sumSquaredDiffs += diff * diff;
    }
    const meanSquaredDiff = sumSquaredDiffs / (intervals.length - 1);
    const rmssd = Math.sqrt(meanSquaredDiff);
    const lnRmssd = Math.log(Math.max(1, rmssd));

    // Recovery Score (0-100) scaled from ln(rMSSD) typical human range [2.0 to 5.0]
    // 2.0 = ~7ms (Score 20), 3.5 = ~33ms (Score 65), 4.5 = ~90ms (Score 95)
    let recoveryScore = Math.round(((lnRmssd - 1.5) / 3.2) * 100);
    recoveryScore = Math.max(5, Math.min(100, recoveryScore));

    // Readiness evaluation
    let status: "OPTIMAL" | "MODERATE" | "SUPPRESSED";
    let statusColor = "text-emerald-400";
    let statusBg = "bg-emerald-500/10 border-emerald-500/30";
    let guidance = "";

    if (recoveryScore >= 75) {
      status = "OPTIMAL";
      statusColor = "text-emerald-400";
      statusBg = "bg-emerald-500/10 border-emerald-500/30";
      guidance = "Parasympathetic tone is elevated. Cardiovascular system is fully primed for high-intensity intervals (HIIT), heavy resistance training, or competitive race efforts.";
    } else if (recoveryScore >= 50) {
      status = "MODERATE";
      statusColor = "text-indigo-400";
      statusBg = "bg-indigo-500/10 border-indigo-500/30";
      guidance = "Autonomic nervous system is stable. Suitable for standard aerobic base building, tempo training, and moderate technical drills.";
    } else {
      status = "SUPPRESSED";
      statusColor = "text-rose-400";
      statusBg = "bg-rose-500/10 border-rose-500/30";
      guidance = "Autonomic strain detected (low rMSSD variability). Suggests systemic fatigue, incomplete sleep, or immune challenge. Recommend active recovery, mobility, or zone 1 light activity.";
    }

    return {
      sampleCount: intervals.length,
      meanRR: Math.round(meanRR),
      heartRateBpm,
      rmssd: Number(rmssd.toFixed(1)),
      lnRmssd: Number(lnRmssd.toFixed(2)),
      recoveryScore,
      status,
      statusColor,
      statusBg,
      guidance
    };
  }, [rawText]);

  const handleCopy = async () => {
    if (!results) return;
    const text = [
      `=== HEART RATE VARIABILITY (rMSSD) AUDIT ===`,
      `RR Sample Intervals: ${results.sampleCount} beats analyzed`,
      `Mean RR Interval: ${results.meanRR} ms (Average Heart Rate: ${results.heartRateBpm} BPM)`,
      `rMSSD: ${results.rmssd} ms`,
      `ln(rMSSD): ${results.lnRmssd}`,
      `Autonomic Recovery Readiness: ${results.recoveryScore}/100 (${results.status})`,
      `--------------------------------------------`,
      `Physiological Training Guidance:`,
      results.guidance,
      `============================================`
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
                Exercise Physiology & ANS
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                rMSSD & ln(rMSSD) Standard
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-rose-400" />
              Heart Rate Variability (HRV) rMSSD & Recovery Score Calculator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Calculate root mean square of successive differences (<code className="text-rose-300">rMSSD</code>) and natural log <code className="text-rose-300">ln(rMSSD)</code> from raw inter-beat R-R interval data to measure autonomic recovery.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setRawText(p.rrIntervals)}
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
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" /> Raw R-R Intervals (Milliseconds)
              </label>
              <button
                onClick={() => setRawText("")}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3" /> Clear
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Paste comma, space, or newline-separated R-R intervals (e.g., from Polar, Garmin, Oura, or Whoop raw exports):
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-rose-300 font-mono focus:ring-1 focus:ring-rose-500 outline-none resize-none leading-relaxed"
              placeholder="820, 860, 835, 890, 845, 910..."
            />
          </div>
        </div>

        {/* Right Dashboard (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {results ? (
            <div className={`p-6 rounded-xl border ${results.statusBg} shadow-xl space-y-4`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Autonomic Recovery</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${results.statusBg} ${results.statusColor}`}>
                  {results.status}
                </span>
              </div>

              {/* Main Score & rMSSD */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Recovery Readiness</div>
                  <div className={`text-4xl font-black font-mono mt-0.5 ${results.statusColor}`}>
                    {results.recoveryScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">rMSSD Metric</div>
                  <div className="text-3xl font-black font-mono text-white mt-0.5">
                    {results.rmssd} <span className="text-xs font-normal text-slate-500">ms</span>
                  </div>
                  <div className="text-[10px] text-indigo-400 font-mono mt-1">
                    ln(rMSSD): {results.lnRmssd}
                  </div>
                </div>
              </div>

              {/* Training Guidance */}
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-slate-200">Recommended Action:</div>
                <p className="text-slate-400 leading-relaxed">{results.guidance}</p>
              </div>

              {/* Underlying Beat Data */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Sample Beats:</span>
                  <span className="font-mono text-slate-200">{results.sampleCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Mean HR:</span>
                  <span className="font-mono text-slate-200">{results.heartRateBpm} BPM</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy HRV Summary"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              Enter at least 3 valid R-R intervals in milliseconds (300ms – 2000ms range).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HrvRmssdRecoveryCalculator;
