"use client";

import { useState, useMemo } from "react";
import { DollarSign, Percent, Copy, Check, PieChart, ShieldAlert, Award, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SafeNoteCalculator() {
  const [safe1Amount, setSafe1Amount] = useState<number>(500000);
  const [safe1Cap, setSafe1Cap] = useState<number>(5000000); // $5M cap
  const [safe2Amount, setSafe2Amount] = useState<number>(1000000);
  const [safe2Cap, setSafe2Cap] = useState<number>(8000000); // $8M cap
  const [seriesAPreMoney, setSeriesAPreMoney] = useState<number>(15000000); // $15M Series A
  const [seriesAInvestment, setSeriesAInvestment] = useState<number>(3000000); // $3M Series A
  const [optionPoolPct, setOptionPoolPct] = useState<number>(10); // 10% unallocated pool
  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    // 1. Post-Money SAFE Model (Standard Y Combinator Post-2018)
    // Each SAFE investor gets exactly Amount / Cap ownership before Series A new money
    const postSafe1Pct = safe1Cap > 0 ? (safe1Amount / safe1Cap) * 100 : 0;
    const postSafe2Pct = safe2Cap > 0 ? (safe2Amount / safe2Cap) * 100 : 0;
    const totalPostSafePct = postSafe1Pct + postSafe2Pct;

    // Series A new money dilution
    const postSeriesAPostMoney = seriesAPreMoney + seriesAInvestment;
    const seriesAInvestorPct = (seriesAInvestment / postSeriesAPostMoney) * 100;

    // Dilution factor after Series A & Option pool
    const postSeriesACommonAndSafePool = 100 - seriesAInvestorPct - optionPoolPct;

    // In Post-Money SAFE, SAFEs are non-dilutive to other SAFEs
    const finalPostSafe1Pct = postSafe1Pct * ((100 - seriesAInvestorPct) / 100);
    const finalPostSafe2Pct = postSafe2Pct * ((100 - seriesAInvestorPct) / 100);
    const finalPostTotalSafePct = finalPostSafe1Pct + finalPostSafe2Pct;
    const finalPostFounderPct = Math.max(0, 100 - seriesAInvestorPct - optionPoolPct - finalPostTotalSafePct);

    // 2. Pre-Money SAFE Model (Legacy Y Combinator Pre-2018)
    // Pre-money SAFEs dilute each other along with the founders
    const totalSafeCapital = safe1Amount + safe2Amount;
    const preEffectiveCap = (safe1Cap + safe2Cap) / 2; // blended cap approximation
    const preSafeEquityShare = (totalSafeCapital / (preEffectiveCap + totalSafeCapital)) * 100;

    const finalPreTotalSafePct = preSafeEquityShare * ((100 - seriesAInvestorPct) / 100);
    const finalPreFounderPct = Math.max(0, 100 - seriesAInvestorPct - optionPoolPct - finalPreTotalSafePct);

    const founderDilutionDelta = finalPreFounderPct - finalPostFounderPct;

    return {
      postSafe1Pct: postSafe1Pct.toFixed(2),
      postSafe2Pct: postSafe2Pct.toFixed(2),
      totalPostSafePct: totalPostSafePct.toFixed(2),
      seriesAInvestorPct: seriesAInvestorPct.toFixed(2),
      postMoney: {
        founderPct: finalPostFounderPct.toFixed(2),
        safePct: finalPostTotalSafePct.toFixed(2),
        seriesAPct: seriesAInvestorPct.toFixed(2),
        poolPct: optionPoolPct.toFixed(2),
      },
      preMoney: {
        founderPct: finalPreFounderPct.toFixed(2),
        safePct: finalPreTotalSafePct.toFixed(2),
        seriesAPct: seriesAInvestorPct.toFixed(2),
        poolPct: optionPoolPct.toFixed(2),
      },
      founderDilutionDelta: Math.abs(founderDilutionDelta).toFixed(2),
      isPostMoreDilutiveToFounders: founderDilutionDelta > 0,
    };
  }, [safe1Amount, safe1Cap, safe2Amount, safe2Cap, seriesAPreMoney, seriesAInvestment, optionPoolPct]);

  const handleCopy = async () => {
    const text = `Y Combinator Pre-Money vs Post-Money SAFE Conversion Comparison:
• SAFE 1: $${safe1Amount.toLocaleString()} at $${safe1Cap.toLocaleString()} Cap
• SAFE 2: $${safe2Amount.toLocaleString()} at $${safe2Cap.toLocaleString()} Cap
• Series A: $${seriesAInvestment.toLocaleString()} on $${seriesAPreMoney.toLocaleString()} Pre-Money (${results.seriesAInvestorPct}% ownership)
• Post-Financing Option Pool: ${optionPoolPct}%
--------------------------------------------------
POST-MONEY SAFE MODEL (Modern YC Standard):
• Founder Ownership: ${results.postMoney.founderPct}%
• Total SAFE Investors: ${results.postMoney.safePct}%
• Series A Lead Investor: ${results.postMoney.seriesAPct}%
• Unallocated Option Pool: ${results.postMoney.poolPct}%
--------------------------------------------------
PRE-MONEY SAFE MODEL (Legacy Model):
• Founder Ownership: ${results.preMoney.founderPct}%
• Total SAFE Investors: ${results.preMoney.safePct}%
• Series A Lead Investor: ${results.preMoney.seriesAPct}%
--------------------------------------------------
KEY TAKEAWAY:
• In Post-Money SAFEs, SAFEs do not dilute each other; all pre-Series A dilution falls exclusively onto the founders.
• Founder dilution impact: ${results.isPostMoreDilutiveToFounders ? `Post-Money SAFE dilutes founders by ${results.founderDilutionDelta}% more equity than Pre-Money.` : "Pre-Money and Post-Money yield equivalent dilution."}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            SAFE 1 Amount ($)
          </label>
          <input
            type="number"
            step={50000}
            value={safe1Amount}
            onChange={(e) => setSafe1Amount(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            SAFE 1 Valuation Cap ($)
          </label>
          <input
            type="number"
            step={500000}
            value={safe1Cap}
            onChange={(e) => setSafe1Cap(Math.max(10000, parseFloat(e.target.value) || 10000))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[11px] text-muted-foreground block">
            Target Ownership: {results.postSafe1Pct}%
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            SAFE 2 Amount ($)
          </label>
          <input
            type="number"
            step={100000}
            value={safe2Amount}
            onChange={(e) => setSafe2Amount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            SAFE 2 Valuation Cap ($)
          </label>
          <input
            type="number"
            step={500000}
            value={safe2Cap}
            onChange={(e) => setSafe2Cap(Math.max(10000, parseFloat(e.target.value) || 10000))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[11px] text-muted-foreground block">
            Target Ownership: {results.postSafe2Pct}%
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Series A Pre-Money ($)
          </label>
          <input
            type="number"
            step={1000000}
            value={seriesAPreMoney}
            onChange={(e) => setSeriesAPreMoney(Math.max(10000, parseFloat(e.target.value) || 10000))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Series A Investment ($)
          </label>
          <input
            type="number"
            step={500000}
            value={seriesAInvestment}
            onChange={(e) => setSeriesAInvestment(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Unallocated Option Pool Target (%)
          </label>
          <input
            type="number"
            min={0}
            max={30}
            step={1}
            value={optionPoolPct}
            onChange={(e) => setOptionPoolPct(Math.max(0, Math.min(40, parseFloat(e.target.value) || 0)))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Comparison Callout */}
      <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <div className="text-xs sm:text-sm">
            <span className="text-muted-foreground">Founder Dilution Difference: </span>
            <strong className="text-foreground font-bold">
              {results.founderDilutionDelta}%
            </strong>
            <span className="text-muted-foreground ml-1">
              (Post-Money SAFEs guarantee investor ownership, concentrating all dilution on the founders before Series A)
            </span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied Analysis" : "Copy Comparison"}</span>
        </button>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          Post-Financing Cap Table Ownership Distribution
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-semibold">Stakeholder Group</th>
                <th className="pb-3 font-semibold text-emerald-600 dark:text-emerald-400">
                  Post-Money SAFE (Modern YC Standard)
                </th>
                <th className="pb-3 font-semibold text-indigo-600 dark:text-indigo-400">
                  Pre-Money SAFE (Legacy)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-2.5 font-bold text-foreground">Founders &amp; Existing Common</td>
                <td className="py-2.5 font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                  {results.postMoney.founderPct}%
                </td>
                <td className="py-2.5 font-mono font-black text-indigo-600 dark:text-indigo-400 text-base">
                  {results.preMoney.founderPct}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-muted-foreground">Combined SAFE Seed Investors</td>
                <td className="py-2.5 font-mono font-bold text-foreground">
                  {results.postMoney.safePct}%
                </td>
                <td className="py-2.5 font-mono font-bold text-foreground">
                  {results.preMoney.safePct}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-muted-foreground">Series A Lead Investor</td>
                <td className="py-2.5 font-mono font-bold text-foreground">
                  {results.postMoney.seriesAPct}%
                </td>
                <td className="py-2.5 font-mono font-bold text-foreground">
                  {results.preMoney.seriesAPct}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-muted-foreground">Unallocated Employee Option Pool</td>
                <td className="py-2.5 font-mono font-semibold text-muted-foreground">
                  {results.postMoney.poolPct}%
                </td>
                <td className="py-2.5 font-mono font-semibold text-muted-foreground">
                  {results.preMoney.poolPct}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
