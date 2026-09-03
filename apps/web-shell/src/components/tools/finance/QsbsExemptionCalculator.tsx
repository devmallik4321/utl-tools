"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function QsbsExemptionCalculator() {
  const [costBasis, setCostBasis] = useState<number>(100000);
  const [saleProceeds, setSaleProceeds] = useState<number>(12500000);
  const [holdingPeriodYears, setHoldingPeriodYears] = useState<number>(5.5);
  const [acqDateBracket, setAcqDateBracket] = useState<"after_sep_2010" | "feb_2009_to_sep_2010" | "before_feb_2009">("after_sep_2010");
  const [stateTaxRatePct, setStateTaxRatePct] = useState<number>(0); // e.g. 0% for Texas/Florida or state conforming
  const [copied, setCopied] = useState<boolean>(false);

  const {
    grossGain,
    exclusionLimit,
    exclusionPct,
    taxFreeGain,
    taxableGain,
    federalTaxesSaved,
    holdingPeriodQualified,
  } = useMemo(() => {
    const gain = Math.max(0, saleProceeds - costBasis);
    // Statutory rule: Greater of $10,000,000 or 10x adjusted basis
    const basisMultipleCap = costBasis * 10;
    const maxCap = Math.max(10000000, basisMultipleCap);

    let pct = 1.0;
    if (acqDateBracket === "feb_2009_to_sep_2010") pct = 0.75;
    if (acqDateBracket === "before_feb_2009") pct = 0.50;

    const isQualifiedTime = holdingPeriodYears >= 5.0;

    const effectiveCap = isQualifiedTime ? maxCap : 0;
    const excludable = Math.min(gain, effectiveCap) * pct;
    const taxable = Math.max(0, gain - excludable);

    // Federal tax rate avoided: 20% LTCG + 3.8% Net Investment Income Tax (NIIT) = 23.8%
    const fedSaved = excludable * 0.238;

    return {
      grossGain: Math.round(gain),
      exclusionLimit: Math.round(maxCap),
      exclusionPct: Math.round(pct * 100),
      taxFreeGain: Math.round(excludable),
      taxableGain: Math.round(taxable),
      federalTaxesSaved: Math.round(fedSaved),
      holdingPeriodQualified: isQualifiedTime,
    };
  }, [costBasis, saleProceeds, holdingPeriodYears, acqDateBracket]);

  const handleCopy = async () => {
    const summary = `IRS Section 1202 QSBS Capital Gains Exemption Analysis:\n• Total Gross Gain: $${grossGain.toLocaleString()} (Proceeds: $${saleProceeds.toLocaleString()} - Basis: $${costBasis.toLocaleString()})\n• QSBS Federal Exemption Cap: $${exclusionLimit.toLocaleString()} (Greater of $10M or 10x Basis)\n• Tax-Free Federal Gains: $${taxFreeGain.toLocaleString()} (${exclusionPct}% exclusion)\n• Taxable Residual Gains: $${taxableGain.toLocaleString()}\n• Estimated Federal Tax Saved: $${federalTaxesSaved.toLocaleString()} (at 23.8% LTCG + NIIT)\n• Holding Period Status: ${holdingPeriodQualified ? "Qualified (5+ Years Met)" : "Disqualified (< 5 Years)"}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Original Cost Basis ($)
          </label>
          <input
            type="number"
            step={25000}
            value={costBasis}
            onChange={(e) => setCostBasis(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Original investment or exercise price</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Total Exit / Sale Proceeds ($)
          </label>
          <input
            type="number"
            step={250000}
            value={saleProceeds}
            onChange={(e) => setSaleProceeds(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">Total cash/stock received at liquidity</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Holding Period (Years)
          </label>
          <input
            type="number"
            step={0.5}
            min={0}
            value={holdingPeriodYears}
            onChange={(e) => setHoldingPeriodYears(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground">Strict 5-year minimum holding requirement</span>
        </div>
      </div>

      {/* Acquisition Date Bracket */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Stock Acquisition Date (Determines Federal Exclusion %)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setAcqDateBracket("after_sep_2010")}
            className={`px-3 py-2 text-xs font-bold rounded-xl border text-left transition-colors ${
              acqDateBracket === "after_sep_2010" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            <span className="block font-bold">Acquired After Sept 27, 2010</span>
            <span className="text-[10px] opacity-80">100% Federal Exclusion + 0% AMT/NIIT</span>
          </button>
          <button
            onClick={() => setAcqDateBracket("feb_2009_to_sep_2010")}
            className={`px-3 py-2 text-xs font-bold rounded-xl border text-left transition-colors ${
              acqDateBracket === "feb_2009_to_sep_2010" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            <span className="block font-bold">Feb 18, 2009 – Sept 27, 2010</span>
            <span className="text-[10px] opacity-80">75% Federal Exclusion</span>
          </button>
          <button
            onClick={() => setAcqDateBracket("before_feb_2009")}
            className={`px-3 py-2 text-xs font-bold rounded-xl border text-left transition-colors ${
              acqDateBracket === "before_feb_2009" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            <span className="block font-bold">Acquired Before Feb 18, 2009</span>
            <span className="text-[10px] opacity-80">50% Federal Exclusion</span>
          </button>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Section 1202 QSBS Capital Gain Tax Exemption
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy QSBS Analysis"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              100% Tax-Free Gains
            </span>
            <p className="text-3xl font-extrabold text-foreground">
              ${taxFreeGain.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {holdingPeriodQualified ? "Federal capital gains excluded" : "Disqualified (holding < 5y)"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Federal Taxes Saved
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +${federalTaxesSaved.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">20% LTCG + 3.8% NIIT avoided</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Statutory Cap
            </span>
            <p className="text-2xl font-bold text-foreground">
              ${exclusionLimit.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Max($10M, 10× basis)</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Taxable Residual Gain
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${taxableGain.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Gains exceeding limit</span>
          </div>
        </div>

        {!holdingPeriodQualified && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>5-Year Holding Period Rule: </strong> Your holding period is currently {holdingPeriodYears} years. Under IRC Section 1202, QSBS shares must be held continuously for at least 5 years from issuance/exercise date to claim the tax exemption.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
