"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Calendar, TrendingDown, Copy, Check, Sparkles, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function WashSaleCalculator() {
  const [originalShares, setOriginalShares] = useState<number>(100);
  const [originalBuyPrice, setOriginalBuyPrice] = useState<number>(150); // $15,000 total basis
  const [salePrice, setSalePrice] = useState<number>(110); // $11,000 proceeds -> $4,000 loss
  const [replacementShares, setReplacementShares] = useState<number>(100);
  const [replacementBuyPrice, setReplacementBuyPrice] = useState<number>(115); // $11,500
  const [copied, setCopied] = useState<boolean>(false);

  const {
    realizedLoss,
    disallowedLoss,
    allowedCurrentLoss,
    adjustedTotalBasis,
    adjustedPerShareBasis,
    isFullWash,
  } = useMemo(() => {
    const totalOriginalBasis = originalShares * originalBuyPrice;
    const saleProceeds = originalShares * salePrice;
    const rawGainOrLoss = saleProceeds - totalOriginalBasis;

    // Only losses trigger wash sales
    if (rawGainOrLoss >= 0) {
      return {
        realizedLoss: 0,
        disallowedLoss: 0,
        allowedCurrentLoss: 0,
        adjustedTotalBasis: Math.round(replacementShares * replacementBuyPrice),
        adjustedPerShareBasis: replacementBuyPrice.toFixed(2),
        isFullWash: false,
      };
    }

    const lossTotal = Math.abs(rawGainOrLoss);
    const lossPerShare = lossTotal / originalShares;

    // Wash sale applies to the lesser of shares sold at a loss or replacement shares bought
    const washShares = Math.min(originalShares, replacementShares);
    const disLoss = washShares * lossPerShare;
    const allowLoss = lossTotal - disLoss;

    const repRawTotal = replacementShares * replacementBuyPrice;
    const adjBasis = repRawTotal + disLoss;
    const adjPerShare = replacementShares > 0 ? adjBasis / replacementShares : 0;

    return {
      realizedLoss: Math.round(lossTotal),
      disallowedLoss: Math.round(disLoss),
      allowedCurrentLoss: Math.round(allowLoss),
      adjustedTotalBasis: Math.round(adjBasis),
      adjustedPerShareBasis: adjPerShare.toFixed(2),
      isFullWash: washShares >= originalShares,
    };
  }, [originalShares, originalBuyPrice, salePrice, replacementShares, replacementBuyPrice]);

  const handleCopy = async () => {
    const summary = `IRS Section 1091 Wash Sale Tax Analysis:\n• Realized Capital Loss: -$${realizedLoss.toLocaleString()}\n• Disallowed Wash Sale Loss: -$${disallowedLoss.toLocaleString()} (Not deductible this tax year)\n• Allowable Current Year Capital Loss: -$${allowedCurrentLoss.toLocaleString()}\n• Replacement Shares: ${replacementShares} shares @ $${replacementBuyPrice}/share\n• Adjusted Replacement Cost Basis: $${adjustedTotalBasis.toLocaleString()} ($${adjustedPerShareBasis}/share)\n• IRS Rule: Disallowed loss of $${disallowedLoss.toLocaleString()} is added to replacement cost basis and holding period is tacked on.`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Step 1: Original Position Sold at a Loss
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Original Shares Sold</label>
            <input
              type="number"
              min={1}
              value={originalShares}
              onChange={(e) => setOriginalShares(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Original Cost Basis ($ / share)</label>
            <input
              type="number"
              step={1}
              value={originalBuyPrice}
              onChange={(e) => setOriginalBuyPrice(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Sale Price ($ / share)</label>
            <input
              type="number"
              step={1}
              value={salePrice}
              onChange={(e) => setSalePrice(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Step 2: Replacement Shares Purchased within 30-Day Window
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Replacement Shares Purchased</label>
            <input
              type="number"
              min={1}
              value={replacementShares}
              onChange={(e) => setReplacementShares(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Replacement Purchase Price ($ / share)</label>
            <input
              type="number"
              step={1}
              value={replacementBuyPrice}
              onChange={(e) => setReplacementBuyPrice(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            IRS Section 1091 Wash Sale Adjustment Results
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Tax Sheet"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-rose-500/40 space-y-1">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase font-sans">
              Disallowed Loss
            </span>
            <p className="text-3xl font-extrabold text-foreground">
              ${disallowedLoss.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Cannot claim on Form 8949</span>
          </div>

          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Adjusted Cost Basis
            </span>
            <p className="text-3xl font-extrabold text-foreground">
              ${adjustedPerShareBasis}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Total: ${adjustedTotalBasis.toLocaleString()}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Realized Loss
            </span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              -${realizedLoss.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Gross loss from sale</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Allowable Loss Now
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              -${allowedCurrentLoss.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Unwashed portion deductible</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Tax Benefit Preservation: </strong>
          The disallowed loss of <strong>${disallowedLoss.toLocaleString()}</strong> is NOT permanently lost. Under Section 1091, it is added into your replacement position basis (${replacementBuyPrice} &rarr; <strong>${adjustedPerShareBasis}/share</strong>). When you eventually sell the replacement shares, the higher cost basis will reduce your future capital gains or increase future deductible losses.
        </div>
      </div>
    </div>
  );
}
