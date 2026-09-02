"use client";

import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, Copy, Check, Sparkles, Plus, Trash2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface BuyLot {
  id: string;
  coins: number;
  buyPrice: number;
}

const DEFAULT_LOTS: BuyLot[] = [
  { id: "1", coins: 0.5, buyPrice: 52000 },
  { id: "2", coins: 0.25, buyPrice: 58000 },
  { id: "3", coins: 0.75, buyPrice: 62000 },
];

export function CryptoPnlCalculator() {
  const [assetName, setAssetName] = useState<string>("Bitcoin (BTC)");
  const [currentPrice, setCurrentPrice] = useState<number>(68500);
  const [lots, setLots] = useState<BuyLot[]>(DEFAULT_LOTS);
  const [copied, setCopied] = useState<boolean>(false);

  const { totalCoins, totalCost, avgPrice, currentValue, pnlAmount, pnlPercent } = useMemo(() => {
    let coins = 0;
    let cost = 0;

    lots.forEach((lot) => {
      const c = lot.coins || 0;
      const p = lot.buyPrice || 0;
      coins += c;
      cost += c * p;
    });

    const avg = coins > 0 ? cost / coins : 0;
    const curVal = coins * currentPrice;
    const pnl = curVal - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;

    return {
      totalCoins: coins,
      totalCost: cost,
      avgPrice: avg,
      currentValue: curVal,
      pnlAmount: pnl,
      pnlPercent: pnlPct,
    };
  }, [lots, currentPrice]);

  const addLot = () => {
    setLots([
      ...lots,
      { id: Date.now().toString(), coins: 0.1, buyPrice: currentPrice },
    ]);
  };

  const removeLot = (id: string) => {
    if (lots.length <= 1) return;
    setLots(lots.filter((l) => l.id !== id));
  };

  const updateLot = (id: string, field: keyof BuyLot, val: number) => {
    setLots(lots.map((l) => (l.id === id ? { ...l, [field]: Math.max(0, val) } : l)));
  };

  const handleCopy = async () => {
    const summary = `Crypto Portfolio P&L Report (${assetName})\n• Current Price: $${currentPrice.toLocaleString()}\n• Total Coins: ${totalCoins.toFixed(4)}\n• Average Buy Price (DCA): $${avgPrice.toFixed(2)}\n• Total Cost Basis: $${totalCost.toLocaleString()}\n• Current Portfolio Value: $${currentValue.toLocaleString()}\n• Net P&L: ${pnlAmount >= 0 ? "+" : ""}$${pnlAmount.toFixed(2)} (${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}% ROI)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Asset Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Cryptocurrency / Asset Name
          </label>
          <input
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="e.g. Bitcoin (BTC), Ethereum (ETH)"
            className="w-full px-3 py-2 text-sm font-semibold bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Market Price ($)
          </label>
          <input
            type="number"
            min={0}
            step="any"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Buy Lots Table */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Purchase Lots ({lots.length} orders)
          </span>
          <button
            onClick={addLot}
            className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg inline-flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Buy Lot</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {lots.map((lot, idx) => (
            <div
              key={lot.id}
              className="p-3 bg-muted/20 border border-border rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
            >
              <div className="sm:col-span-1 font-bold text-muted-foreground font-mono">
                #{idx + 1}
              </div>

              <div className="sm:col-span-5">
                <label className="text-[10px] text-muted-foreground block sm:hidden">Coins Amount</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={lot.coins}
                  onChange={(e) => updateLot(lot.id, "coins", parseFloat(e.target.value) || 0)}
                  placeholder="Amount of Coins"
                  className="w-full px-2.5 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="text-[10px] text-muted-foreground block sm:hidden">Buy Price per Coin ($)</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={lot.buyPrice}
                  onChange={(e) => updateLot(lot.id, "buyPrice", parseFloat(e.target.value) || 0)}
                  placeholder="Buy Price ($)"
                  className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
                />
              </div>

              <div className="sm:col-span-1 flex justify-center">
                <button
                  onClick={() => removeLot(lot.id)}
                  disabled={lots.length <= 1}
                  className="text-muted-foreground hover:text-rose-500 disabled:opacity-30 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* P&L Overview Cards */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Portfolio Value &amp; Profit/Loss
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Net Profit / Loss</span>
            <p
              className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                pnlAmount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {pnlAmount >= 0 ? "+" : ""}${pnlAmount.toFixed(2)}
            </p>
            <span className="text-[10px] font-bold font-mono block">
              {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}% ROI
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Current Value</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-muted-foreground">{totalCoins.toFixed(4)} Coins</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Average Buy Price (DCA)</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${avgPrice.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Weighted DCA cost basis</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Cost Invested</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-muted-foreground">Capital put into asset</span>
          </div>
        </div>
      </div>
    </div>
  );
}
