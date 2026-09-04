"use client";

import React, { useState, useMemo } from "react";
import { Activity, AlertTriangle, ShieldCheck, AlertCircle, TrendingUp, DollarSign, Copy, Check, RefreshCw } from "lucide-react";

interface AccountPreset {
  name: string;
  arr: number;
  productAdoption: number;
  licenseUtilization: number;
  nps: number;
  supportFriction: number;
  daysToRenewal: number;
}

const PRESETS: AccountPreset[] = [
  {
    name: "Enterprise Account (Healthy)",
    arr: 120000,
    productAdoption: 88,
    licenseUtilization: 94,
    nps: 9,
    supportFriction: 15,
    daysToRenewal: 180
  },
  {
    name: "Mid-Market Account (Warning / Disengaged)",
    arr: 36000,
    productAdoption: 42,
    licenseUtilization: 50,
    nps: 6,
    supportFriction: 45,
    daysToRenewal: 45
  },
  {
    name: "High Churn Risk (Executive Escalation)",
    arr: 85000,
    productAdoption: 25,
    licenseUtilization: 30,
    nps: 3,
    supportFriction: 80,
    daysToRenewal: 28
  }
];

export function SaasCustomerHealthScoreCalculator() {
  const [arr, setArr] = useState<number>(120000);
  const [productAdoption, setProductAdoption] = useState<number>(85); // 0-100
  const [licenseUtilization, setLicenseUtilization] = useState<number>(90); // 0-100%
  const [nps, setNps] = useState<number>(9); // 0-10
  const [supportFriction, setSupportFriction] = useState<number>(20); // 0-100 (higher = worse)
  const [daysToRenewal, setDaysToRenewal] = useState<number>(120);

  // Weights
  const [weightAdoption, setWeightAdoption] = useState<number>(35);
  const [weightUtilization, setWeightUtilization] = useState<number>(25);
  const [weightNps, setWeightNps] = useState<number>(20);
  const [weightFriction, setWeightFriction] = useState<number>(20);

  const [copied, setCopied] = useState(false);

  const loadPreset = (p: AccountPreset) => {
    setArr(p.arr);
    setProductAdoption(p.productAdoption);
    setLicenseUtilization(p.licenseUtilization);
    setNps(p.nps);
    setSupportFriction(p.supportFriction);
    setDaysToRenewal(p.daysToRenewal);
  };

  const results = useMemo(() => {
    const totalWeight = weightAdoption + weightUtilization + weightNps + weightFriction || 1;
    const normWeightAdoption = weightAdoption / totalWeight;
    const normWeightUtilization = weightUtilization / totalWeight;
    const normWeightNps = weightNps / totalWeight;
    const normWeightFriction = weightFriction / totalWeight;

    // Component scores (0-100)
    const sAdoption = Math.min(100, Math.max(0, productAdoption));
    const sUtilization = Math.min(100, Math.max(0, licenseUtilization));
    const sNps = Math.min(100, Math.max(0, nps * 10));
    const sFriction = Math.min(100, Math.max(0, 100 - supportFriction));

    // Composite Base Health Score
    let composite = (
      sAdoption * normWeightAdoption +
      sUtilization * normWeightUtilization +
      sNps * normWeightNps +
      sFriction * normWeightFriction
    );

    // Renewal urgency multiplier
    let renewalPenalty = 0;
    if (daysToRenewal < 30 && composite < 70) {
      renewalPenalty = 15;
    } else if (daysToRenewal < 60 && composite < 60) {
      renewalPenalty = 10;
    }
    const finalScore = Math.max(0, Math.round(composite - renewalPenalty));

    // Classification
    let status: "HEALTHY" | "NEUTRAL" | "RISK";
    let colorClass = "text-emerald-400";
    let bgClass = "bg-emerald-500/10 border-emerald-500/30";
    let churnProbability = 0;
    let playbook = "";

    if (finalScore >= 75) {
      status = "HEALTHY";
      colorClass = "text-emerald-400";
      bgClass = "bg-emerald-500/10 border-emerald-500/30";
      churnProbability = Math.max(2, Math.round((100 - finalScore) * 0.2));
      playbook = "Prime candidate for contract expansion, multi-year prepay discounts, and customer advocacy / case study participation.";
    } else if (finalScore >= 50) {
      status = "NEUTRAL";
      colorClass = "text-amber-400";
      bgClass = "bg-amber-500/10 border-amber-500/30";
      churnProbability = Math.round(20 + (75 - finalScore) * 1.2);
      playbook = "Schedule proactive Business Review (QBR). Inspect unused seats, offer tailored admin enablement, and address open support tickets.";
    } else {
      status = "RISK";
      colorClass = "text-rose-400";
      bgClass = "bg-rose-500/10 border-rose-500/30";
      churnProbability = Math.min(95, Math.round(50 + (50 - finalScore) * 0.9));
      playbook = "CRITICAL CHURN HAZARD: Immediate VP / Executive Sponsor outreach. Triage support tickets, unblock workflow hurdles, and evaluate contract concession or rollback.";
    }

    const arrAtRisk = Math.round(arr * (churnProbability / 100));

    return {
      finalScore,
      status,
      colorClass,
      bgClass,
      churnProbability,
      arrAtRisk,
      playbook,
      renewalPenalty,
      sAdoption,
      sUtilization,
      sNps,
      sFriction
    };
  }, [
    arr,
    productAdoption,
    licenseUtilization,
    nps,
    supportFriction,
    daysToRenewal,
    weightAdoption,
    weightUtilization,
    weightNps,
    weightFriction
  ]);

  const handleCopyReport = async () => {
    const text = [
      `=== SAAS CUSTOMER HEALTH & CHURN RISK AUDIT ===`,
      `Account ARR: $${arr.toLocaleString()}`,
      `Days Until Renewal: ${daysToRenewal} days`,
      `Health Score: ${results.finalScore}/100 (${results.status})`,
      `Estimated Churn Probability: ${results.churnProbability}%`,
      `ARR at Risk: $${results.arrAtRisk.toLocaleString()}`,
      `----------------------------------------------`,
      `Metric Breakdown:`,
      `- Product Adoption: ${productAdoption}%`,
      `- Seat Utilization: ${licenseUtilization}%`,
      `- NPS Rating: ${nps}/10`,
      `- Support Friction Index: ${supportFriction}% (Inverted score: ${results.sFriction}/100)`,
      `----------------------------------------------`,
      `Recommended Playbook:`,
      results.playbook,
      `==============================================`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Customer Success & CS Ops
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Predictive Churn Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-400" />
              SaaS Customer Health Score & Churn Risk Index Calculator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Synthesize product telemetry, seat utilization, support friction, and contract renewal proximity into an actionable composite health score and weighted revenue risk index.
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Account Financials & Timeline</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Annual Recurring Revenue ($ ARR)</label>
                <input
                  type="number"
                  value={arr}
                  onChange={(e) => setArr(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Days Until Renewal</label>
                <input
                  type="number"
                  value={daysToRenewal}
                  onChange={(e) => setDaysToRenewal(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Health Dimension Metrics & Weights</span>
              <span className="text-xs text-slate-500 font-normal">Weights auto-normalize</span>
            </h3>

            {/* Product Adoption */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Product Adoption / Feature Depth</span>
                <span className="font-mono text-indigo-400">{productAdoption}% (Weight: {weightAdoption}%)</span>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={productAdoption}
                  onChange={(e) => setProductAdoption(Number(e.target.value))}
                  className="col-span-9 accent-indigo-500 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weightAdoption}
                  onChange={(e) => setWeightAdoption(Number(e.target.value))}
                  className="col-span-3 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-center font-mono"
                  title="Weight percentage"
                />
              </div>
            </div>

            {/* License Utilization */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">License / Seat Utilization</span>
                <span className="font-mono text-indigo-400">{licenseUtilization}% (Weight: {weightUtilization}%)</span>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={licenseUtilization}
                  onChange={(e) => setLicenseUtilization(Number(e.target.value))}
                  className="col-span-9 accent-indigo-500 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weightUtilization}
                  onChange={(e) => setWeightUtilization(Number(e.target.value))}
                  className="col-span-3 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-center font-mono"
                  title="Weight percentage"
                />
              </div>
            </div>

            {/* NPS */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Customer NPS / CSAT (0 - 10)</span>
                <span className="font-mono text-indigo-400">{nps}/10 (Weight: {weightNps}%)</span>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={nps}
                  onChange={(e) => setNps(Number(e.target.value))}
                  className="col-span-9 accent-indigo-500 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weightNps}
                  onChange={(e) => setWeightNps(Number(e.target.value))}
                  className="col-span-3 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-center font-mono"
                  title="Weight percentage"
                />
              </div>
            </div>

            {/* Support Friction */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Support Ticket Friction & Escalations</span>
                <span className="font-mono text-rose-400">{supportFriction}% severity (Weight: {weightFriction}%)</span>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={supportFriction}
                  onChange={(e) => setSupportFriction(Number(e.target.value))}
                  className="col-span-9 accent-rose-500 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weightFriction}
                  onChange={(e) => setWeightFriction(Number(e.target.value))}
                  className="col-span-3 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-center font-mono"
                  title="Weight percentage"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Health Card */}
          <div className={`p-6 rounded-xl border ${results.bgClass} shadow-lg transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Composite Health</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${results.bgClass} ${results.colorClass}`}>
                {results.status}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <div className={`text-5xl font-black ${results.colorClass}`}>
                {results.finalScore}
              </div>
              <div className="text-slate-400 text-sm font-medium">/ 100</div>
            </div>

            {results.renewalPenalty > 0 && (
              <div className="text-xs text-rose-400 flex items-center gap-1.5 mb-3 bg-rose-950/40 p-2 rounded border border-rose-800/40">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Renewal penalty applied: -{results.renewalPenalty} pts ({daysToRenewal} days to expiry)</span>
              </div>
            )}

            {/* Financial Risk Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
              <div>
                <div className="text-[11px] text-slate-400">Churn Probability</div>
                <div className={`text-lg font-bold font-mono ${results.colorClass}`}>
                  {results.churnProbability}%
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">ARR at Risk</div>
                <div className="text-lg font-bold font-mono text-rose-400">
                  ${results.arrAtRisk.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Intervention Playbook Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Recommended Playbook
              </h4>
              <button
                onClick={handleCopyReport}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Audit"}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              {results.playbook}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaasCustomerHealthScoreCalculator;
