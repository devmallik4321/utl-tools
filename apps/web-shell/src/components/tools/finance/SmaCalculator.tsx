"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Copy, Check, Sparkles, LineChart } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_PRICES = "142.50, 144.20, 143.80, 146.10, 148.50, 147.90, 150.20, 152.40, 151.00, 154.60, 156.80, 155.30";

export function SmaCalculator() {
  const [pricesInput, setPricesInput] = useState<string>(SAMPLE_PRICES);
  const [period, setPeriod] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);

  const { prices, currentPrice, currentSma, currentEma, trend, isBullish } = useMemo(() => {
    const raw = pricesInput
      .split(/[\s,]+/)
      .map((x) => parseFloat(x.trim()))
      .filter((x) => !isNaN(x) && x > 0);

    if (raw.length === 0) {
      return { prices: [], currentPrice: 0, currentSma: 0, currentEma: 0, trend: "No Data", isBullish: false };
    }

    const n = Math.min(Math.max(2, period), raw.length);
    const lastN = raw.slice(-n);
    const sma = lastN.reduce((a, b) => a + b, 0) / n;

    // EMA calculation
    const k = 2 / (n + 1);
    let ema = raw[0];
    for (let i = 1; i < raw.length; i++) {
      ema = raw[i] * k + ema * (1 - k);
    }

    const latest = raw[raw.length - 1];
    const bullish = latest >= sma;

    return {
      prices: raw,
      currentPrice: latest,
      currentSma: sma,
      currentEma: ema,
      trend: bullish ? "Bullish (Price > SMA)" : "Bearish (Price < SMA)",
      isBullish: bullish,
    };
  }, [pricesInput, period]);

  const handleCopy = async () => {
    const summary = `Moving Average Technical Analysis (${period}-Period)\n• Current Price: $${currentPrice.toFixed(2)}\n• Simple Moving Average (SMA-${period}): $${currentSma.toFixed(2)}\n• Exponential Moving Average (EMA-${period}): $${currentEma.toFixed(2)}\n• Technical Trend Signal: ${trend}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2 col-span-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Closing Price Series (Comma or Space Separated)
          </label>
          <input
            type="text"
            value={pricesInput}
            onChange={(e) => setPricesInput(e.target.value)}
            placeholder="100.5, 102.3, 105.1..."
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">{prices.length} price points detected</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            MA Period (N)
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={5}>5-Period (Short-term)</option>
            <option value={10}>10-Period</option>
            <option value={20}>20-Period (Bollinger baseline)</option>
            <option value={50}>50-Period (Intermediate)</option>
            <option value={200}>200-Period (Institutional trend)</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-emerald-500" />
            Moving Average Indicators &amp; Trend Signal
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Signal"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Latest Price</span>
            <p className="text-2xl font-extrabold text-foreground">${currentPrice.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Most recent data point</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">SMA ({period})</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${currentSma.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Simple moving average</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">EMA ({period})</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${currentEma.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Exponential weighted average</span>
          </div>

          <div className="p-4 bg-card rounded-xl border-2 border-border space-y-1">
            <span className="text-xs font-semibold uppercase font-sans text-muted-foreground">Trend Signal</span>
            <p
              className={`text-lg font-bold ${
                isBullish ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isBullish ? "Bullish ↑" : "Bearish ↓"}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {isBullish ? "Trading above SMA" : "Trading below SMA"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
