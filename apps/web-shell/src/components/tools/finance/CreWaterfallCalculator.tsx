"use client";

import { useState, useMemo } from "react";
import { Building, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, ShieldCheck, PieChart, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CreWaterfallCalculator() {
  const [totalEquity, setTotalEquity] = useState<number>(4000000); // $4M total equity
  const [lpSharePct, setLpSharePct] = useState<number>(90); // 90% LP / 10% GP
  const [prefHurdlePct, setPrefHurdlePct] = useState<number>(8); // 8% Pref hurdle
  const [holdPeriodYears, setHoldPeriodYears] = useState<number>(4);
  const [totalDistributableProceeds, setTotalDistributableProceeds] = useState<number>(7500000); // $7.5M exit cash
  const [tier2PromoteGpPct, setTier2PromoteGpPct] = useState<number>(20); // 80/20 Tier 2
  const [tier3HurdleMultiple, setTier3HurdleMultiple] = useState<number>(1.5); // 1.5x equity multiple threshold
  const [tier3PromoteGpPct, setTier3PromoteGpPct] = useState<number>(35); // 65/35 Tier 3
  const [copied, setCopied] = useState<boolean>(false);

  const {
    lpInvested,
    gpInvested,
    lpPrefAmount,
    tier1Total,
    lpTotalReturn,
    gpTotalReturn,
    lpEquityMultiple,
    gpEquityMultiple,
    gpPromoteDollar,
    tierBreakdown,
  } = useMemo(() => {
    const lpCap = totalEquity * (lpSharePct / 100);
    const gpCap = totalEquity * ((100 - lpSharePct) / 100);

    // Tier 1: Return of Capital + Preferred Return (simple annualized)
    const prefReturn = lpCap * (prefHurdlePct / 100) * holdPeriodYears;
    const gpPrefReturn = gpCap * (prefHurdlePct / 100) * holdPeriodYears;
    const t1Required = totalEquity + prefReturn + gpPrefReturn;

    const t1Distributed = Math.min(totalDistributableProceeds, t1Required);
    const t1Lp = t1Distributed * (lpSharePct / 100);
    const t1Gp = t1Distributed * ((100 - lpSharePct) / 100);

    let remainingCash = Math.max(0, totalDistributableProceeds - t1Required);

    // Tier 2: Up to Tier 3 Hurdle (Total return reaches 1.5x equity)
    const tier2CapTarget = totalEquity * tier3HurdleMultiple;
    const tier2MaxCapacity = Math.max(0, tier2CapTarget - t1Required);
    const t2Distributed = Math.min(remainingCash, tier2MaxCapacity);

    const t2GpPct = tier2PromoteGpPct / 100;
    const t2LpPct = 1 - t2GpPct;
    const t2Lp = t2Distributed * t2LpPct;
    const t2Gp = t2Distributed * t2GpPct;

    remainingCash = Math.max(0, remainingCash - t2Distributed);

    // Tier 3: Remainder with higher promote
    const t3GpPct = tier3PromoteGpPct / 100;
    const t3LpPct = 1 - t3GpPct;
    const t3Lp = remainingCash * t3LpPct;
    const t3Gp = remainingCash * t3GpPct;

    const totalLp = t1Lp + t2Lp + t3Lp;
    const totalGp = t1Gp + t2Gp + t3Gp;

    const lpMult = lpCap > 0 ? totalLp / lpCap : 0;
    const gpMult = gpCap > 0 ? totalGp / gpCap : 0;

    // GP Promote = Total GP proceeds minus what GP would get on purely pro-rata basis
    const gpProRata = totalDistributableProceeds * ((100 - lpSharePct) / 100);
    const promoteDollar = Math.max(0, totalGp - gpProRata);

    return {
      lpInvested: Math.round(lpCap),
      gpInvested: Math.round(gpCap),
      lpPrefAmount: Math.round(prefReturn),
      tier1Total: Math.round(t1Distributed),
      lpTotalReturn: Math.round(totalLp),
      gpTotalReturn: Math.round(totalGp),
      lpEquityMultiple: lpMult.toFixed(2),
      gpEquityMultiple: gpMult.toFixed(2),
      gpPromoteDollar: Math.round(promoteDollar),
      tierBreakdown: [
        { tier: "Tier 1: Capital Return + Pref Return", lp: Math.round(t1Lp), gp: Math.round(t1Gp), total: Math.round(t1Distributed) },
        { tier: `Tier 2: Up to ${tier3HurdleMultiple}x Multiple (${100 - tier2PromoteGpPct}/${tier2PromoteGpPct} Split)`, lp: Math.round(t2Lp), gp: Math.round(t2Gp), total: Math.round(t2Distributed) },
        { tier: `Tier 3: Residual Above ${tier3HurdleMultiple}x (${100 - tier3PromoteGpPct}/${tier3PromoteGpPct} Split)`, lp: Math.round(t3Lp), gp: Math.round(t3Gp), total: Math.round(remainingCash) },
      ],
    };
  }, [totalEquity, lpSharePct, prefHurdlePct, holdPeriodYears, totalDistributableProceeds, tier2PromoteGpPct, tier3HurdleMultiple, tier3PromoteGpPct]);

  const handleCopy = async () => {
    const summary = `Commercial Real Estate Waterfall Distribution Analysis:\n• Total Equity: $${totalEquity.toLocaleString()} (LP: $${lpInvested.toLocaleString()} [${lpSharePct}%], GP: $${gpInvested.toLocaleString()} [${100 - lpSharePct}%])\n• Total Distributable Proceeds: $${totalDistributableProceeds.toLocaleString()}\n• LP Proceeds: $${lpTotalReturn.toLocaleString()} (${lpEquityMultiple}x Equity Multiple)\n• GP Proceeds: $${gpTotalReturn.toLocaleString()} (${gpEquityMultiple}x Equity Multiple)\n• GP Promote (Carried Interest): $${gpPromoteDollar.toLocaleString()}\n\nTier Breakdown:\n${tierBreakdown.map((t) => `• ${t.tier}: Total $${t.total.toLocaleString()} (LP: $${t.lp.toLocaleString()}, GP: $${t.gp.toLocaleString()})`).join("\n")}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Total Equity Capital ($)
          </label>
          <input
            type="number"
            step={250000}
            value={totalEquity}
            onChange={(e) => setTotalEquity(Math.max(10000, parseFloat(e.target.value) || 10000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            LP / GP Capital Split (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={50}
              max={99}
              value={lpSharePct}
              onChange={(e) => setLpSharePct(Math.max(50, Math.min(99, parseInt(e.target.value) || 90)))}
              className="w-20 px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
            />
            <span className="text-xs font-mono text-muted-foreground">LP% / {100 - lpSharePct}% GP</span>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Preferred Return Hurdle (%)
          </label>
          <input
            type="number"
            step={0.5}
            value={prefHurdlePct}
            onChange={(e) => setPrefHurdlePct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">Annual compounding / simple pref</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Hold Period (Years)
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={holdPeriodYears}
            onChange={(e) => setHoldPeriodYears(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Total Distributable Exit Cash ($)
          </label>
          <input
            type="number"
            step={250000}
            value={totalDistributableProceeds}
            onChange={(e) => setTotalDistributableProceeds(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">Sale proceeds net of mortgage debt</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Tier 2 GP Promote (%)
          </label>
          <input
            type="number"
            min={5}
            max={50}
            value={tier2PromoteGpPct}
            onChange={(e) => setTier2PromoteGpPct(parseInt(e.target.value) || 20)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">{100 - tier2PromoteGpPct}% LP / {tier2PromoteGpPct}% GP</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Tier 3 GP Promote (%)
          </label>
          <input
            type="number"
            min={10}
            max={60}
            value={tier3PromoteGpPct}
            onChange={(e) => setTier3PromoteGpPct(parseInt(e.target.value) || 35)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">{100 - tier3PromoteGpPct}% LP / {tier3PromoteGpPct}% GP</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-500" />
            LP / GP Waterfall Distribution Summary
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Waterfall"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-blue-500/40 space-y-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase font-sans">
              LP Total Proceeds
            </span>
            <p className="text-3xl font-extrabold text-foreground">${lpTotalReturn.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">{lpEquityMultiple}x Equity Multiple</span>
          </div>

          <div className="p-4 bg-card rounded-xl border-2 border-purple-500/40 space-y-1">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase font-sans">
              GP Total Proceeds
            </span>
            <p className="text-3xl font-extrabold text-foreground">${gpTotalReturn.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">{gpEquityMultiple}x Equity Multiple</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              GP Promote (Carried)
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +${gpPromoteDollar.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Bonus above pro-rata</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Pref Return Paid
            </span>
            <p className="text-2xl font-bold text-foreground">
              ${lpPrefAmount.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">{prefHurdlePct}% over {holdPeriodYears} yrs</span>
          </div>
        </div>

        {/* Tier Distribution Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-sans">
                <th className="py-2.5 px-3">Hurdle Tier</th>
                <th className="py-2.5 px-3">Total Distributed</th>
                <th className="py-2.5 px-3">LP Share</th>
                <th className="py-2.5 px-3">GP Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tierBreakdown.map((t, idx) => (
                <tr key={idx} className="hover:bg-muted/40">
                  <td className="py-2.5 px-3 font-bold text-foreground">{t.tier}</td>
                  <td className="py-2.5 px-3 text-foreground">${t.total.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-bold">${t.lp.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-purple-600 dark:text-purple-400 font-bold">${t.gp.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
