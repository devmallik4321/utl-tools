"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, PieChart, TrendingUp, AlertTriangle, ShieldCheck, Copy, Check } from "lucide-react";

interface Preset {
  name: string;
  customers: number;
  arpu: number; // monthly per customer
  cloudHosting: number;
  aiComputePerUser: number;
  thirdPartyApis: number;
  databaseEgress: number;
  supportAllocated: number;
}

const PRESETS: Preset[] = [
  {
    name: "Enterprise B2B SaaS (Healthy 82% Margin)",
    customers: 250,
    arpu: 2400, // $600k MRR
    cloudHosting: 35000,
    aiComputePerUser: 12,
    thirdPartyApis: 15000,
    databaseEgress: 8000,
    supportAllocated: 45000
  },
  {
    name: "AI-Native SaaS (Token Heavy 68% Margin)",
    customers: 5000,
    arpu: 99, // $495k MRR
    cloudHosting: 28000,
    aiComputePerUser: 18, // $90k/mo AI tokens!
    thirdPartyApis: 12000,
    databaseEgress: 6000,
    supportAllocated: 22000
  },
  {
    name: "Self-Serve Developer Tool (86% Elite Margin)",
    customers: 12000,
    arpu: 35, // $420k MRR
    cloudHosting: 22000,
    aiComputePerUser: 1,
    thirdPartyApis: 8000,
    databaseEgress: 11000,
    supportAllocated: 14000
  }
];

export function SaasGrossMarginCogsCalculator() {
  const [customers, setCustomers] = useState<number>(500);
  const [arpu, setArpu] = useState<number>(1200); // monthly revenue per tenant

  // Direct COGS costs (Monthly)
  const [cloudHosting, setCloudHosting] = useState<number>(45000);
  const [aiComputePerUser, setAiComputePerUser] = useState<number>(8); // $/mo/user
  const [thirdPartyApis, setThirdPartyApis] = useState<number>(12000);
  const [databaseEgress, setDatabaseEgress] = useState<number>(9000);
  const [supportAllocated, setSupportAllocated] = useState<number>(35000);

  const [copied, setCopied] = useState(false);

  const loadPreset = (p: Preset) => {
    setCustomers(p.customers);
    setArpu(p.arpu);
    setCloudHosting(p.cloudHosting);
    setAiComputePerUser(p.aiComputePerUser);
    setThirdPartyApis(p.thirdPartyApis);
    setDatabaseEgress(p.databaseEgress);
    setSupportAllocated(p.supportAllocated);
  };

  const results = useMemo(() => {
    const mrr = Math.max(0, customers * arpu);
    const arr = mrr * 12;

    const totalAiCompute = customers * aiComputePerUser;
    const totalCogs = Math.max(
      0,
      cloudHosting + totalAiCompute + thirdPartyApis + databaseEgress + supportAllocated
    );

    const grossProfit = mrr - totalCogs;
    const grossMarginPercent = mrr > 0 ? (grossProfit / mrr) * 100 : 0;
    const cogsPerCustomer = customers > 0 ? totalCogs / customers : 0;
    const contributionMarginPerCustomer = arpu - cogsPerCustomer;

    // Benchmark classification
    let tier: "ELITE" | "HEALTHY" | "BELOW_BENCHMARK";
    let tierColor = "text-emerald-400";
    let tierBg = "bg-emerald-500/10 border-emerald-500/30";
    let tierFeedback = "";

    if (grossMarginPercent >= 80) {
      tier = "ELITE";
      tierColor = "text-emerald-400";
      tierBg = "bg-emerald-500/10 border-emerald-500/30";
      tierFeedback = "World-class SaaS gross margin (>80%). Prime valuation multiple expansion candidate with massive operational cash flow leverage.";
    } else if (grossMarginPercent >= 70) {
      tier = "HEALTHY";
      tierColor = "text-indigo-400";
      tierBg = "bg-indigo-500/10 border-indigo-500/30";
      tierFeedback = "Solid VC-fundable gross margin (70% - 79%). Look for opportunities to optimize cloud database instances and consolidate multi-model AI token caching.";
    } else {
      tier = "BELOW_BENCHMARK";
      tierColor = "text-rose-400";
      tierBg = "bg-rose-500/10 border-rose-500/30";
      tierFeedback = "Margin compression hazard (<70%). Investigate AI prompt caching, reserved cloud compute pricing, or support automation to prevent margin drag on valuation.";
    }

    return {
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      totalAiCompute: Math.round(totalAiCompute),
      totalCogs: Math.round(totalCogs),
      grossProfit: Math.round(grossProfit),
      annualGrossProfit: Math.round(grossProfit * 12),
      grossMarginPercent: Number(grossMarginPercent.toFixed(1)),
      cogsPerCustomer: Math.round(cogsPerCustomer),
      contributionMarginPerCustomer: Math.round(contributionMarginPerCustomer),
      tier,
      tierColor,
      tierBg,
      tierFeedback
    };
  }, [
    customers,
    arpu,
    cloudHosting,
    aiComputePerUser,
    thirdPartyApis,
    databaseEgress,
    supportAllocated
  ]);

  const handleCopy = async () => {
    const text = [
      `=== SAAS COGS & GROSS MARGIN AUDIT ===`,
      `Active Customers: ${customers.toLocaleString()}`,
      `Monthly Recurring Revenue (MRR): $${results.mrr.toLocaleString()} ($${results.arr.toLocaleString()} ARR)`,
      `Monthly Cost of Goods Sold (COGS): $${results.totalCogs.toLocaleString()}`,
      `Gross Profit: $${results.grossProfit.toLocaleString()}/mo ($${results.annualGrossProfit.toLocaleString()}/yr)`,
      `Gross Margin: ${results.grossMarginPercent}% (${results.tier})`,
      `---------------------------------------`,
      `Unit Economics (Per Customer):`,
      `- ARPU: $${arpu.toLocaleString()}/mo`,
      `- COGS: $${results.cogsPerCustomer.toLocaleString()}/mo`,
      `- Net Contribution Margin: $${results.contributionMarginPerCustomer.toLocaleString()}/mo`,
      `---------------------------------------`,
      `COGS Breakdown:`,
      `- Cloud Compute (AWS/GCP): $${cloudHosting.toLocaleString()}`,
      `- AI/LLM Inferencing: $${results.totalAiCompute.toLocaleString()} ($${aiComputePerUser}/user)`,
      `- Database & Egress: $${databaseEgress.toLocaleString()}`,
      `- Third-Party APIs: $${thirdPartyApis.toLocaleString()}`,
      `- Support / SRE Allocation: $${supportAllocated.toLocaleString()}`,
      `---------------------------------------`,
      `Strategic Assessment:`,
      results.tierFeedback,
      `=======================================`
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Unit Economics Model
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                SaaS Valuation Multiplier
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              SaaS Gross Margin & COGS Unit Economics Calculator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Model cloud hosting, AI inferencing compute, database egress, and technical support allocations to calculate blended Gross Margin % and per-tenant unit economics.
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
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Revenue */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Revenue & Scale Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Active Accounts / Customers</label>
                <input
                  type="number"
                  value={customers}
                  onChange={(e) => setCustomers(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">ARPU ($/mo per account)</label>
                <input
                  type="number"
                  value={arpu}
                  onChange={(e) => setArpu(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cost of Goods Sold Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Monthly Cost of Goods Sold (COGS)</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cloud Infrastructure (AWS/GCP)</label>
                <input
                  type="number"
                  value={cloudHosting}
                  onChange={(e) => setCloudHosting(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">AI Tokens ($/mo per user)</label>
                <input
                  type="number"
                  step="0.5"
                  value={aiComputePerUser}
                  onChange={(e) => setAiComputePerUser(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Database & Bandwidth Egress ($)</label>
                <input
                  type="number"
                  value={databaseEgress}
                  onChange={(e) => setDatabaseEgress(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Third-Party APIs (Stripe, etc.) ($)</label>
                <input
                  type="number"
                  value={thirdPartyApis}
                  onChange={(e) => setThirdPartyApis(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Support & DevOps Allocation ($)</label>
              <input
                type="number"
                value={supportAllocated}
                onChange={(e) => setSupportAllocated(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Margin Card */}
          <div className={`p-6 rounded-xl border ${results.tierBg} shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Blended Gross Margin</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${results.tierBg} ${results.tierColor}`}>
                {results.tier}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <div className={`text-5xl font-black ${results.tierColor}`}>
                {results.grossMarginPercent}%
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 mb-4 leading-relaxed">
              {results.tierFeedback}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <div>
                <div className="text-[11px] text-slate-400">Monthly Revenue</div>
                <div className="text-base font-bold font-mono text-emerald-400">
                  ${results.mrr.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Monthly COGS</div>
                <div className="text-base font-bold font-mono text-rose-400">
                  ${results.totalCogs.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Unit Economics Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Unit Economics Per Tenant</h4>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Audit"}
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Average Revenue (ARPU):</span>
                <span className="font-mono text-slate-200">${arpu.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Cost to Serve (COGS):</span>
                <span className="font-mono text-rose-400">${results.cogsPerCustomer.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span className="text-slate-200">Net Contribution Margin:</span>
                <span className="font-mono text-emerald-400">${results.contributionMarginPerCustomer.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaasGrossMarginCogsCalculator;
