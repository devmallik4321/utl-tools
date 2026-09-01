"use client";

import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Calendar, Copy, Check, Sparkles, Plus, Trash2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface AssetEntry {
  id: string;
  name: string;
  startVal: number;
  endVal: number;
  years: number;
}

const DEFAULT_ASSETS: AssetEntry[] = [
  { id: "1", name: "S&P 500 Index ETF", startVal: 10000, endVal: 21500, years: 5 },
  { id: "2", name: "Tech Growth Portfolio", startVal: 10000, endVal: 28400, years: 5 },
  { id: "3", name: "Real Estate Property", startVal: 200000, endVal: 275000, years: 5 },
  { id: "4", name: "High-Yield Savings (HYSA)", startVal: 10000, endVal: 12400, years: 5 },
];

export function CagrMatrixCalculator() {
  const [assets, setAssets] = useState<AssetEntry[]>(DEFAULT_ASSETS);
  const [copied, setCopied] = useState<boolean>(false);

  const calculatedAssets = useMemo(() => {
    return assets.map((a) => {
      const totalGain = a.endVal - a.startVal;
      const totalReturnPct = a.startVal > 0 ? (totalGain / a.startVal) * 100 : 0;
      let cagr = 0;
      if (a.startVal > 0 && a.endVal > 0 && a.years > 0) {
        cagr = (Math.pow(a.endVal / a.startVal, 1 / a.years) - 1) * 100;
      }
      return {
        ...a,
        totalGain,
        totalReturnPct,
        cagr,
      };
    });
  }, [assets]);

  const addAsset = () => {
    setAssets([
      ...assets,
      { id: Date.now().toString(), name: `Asset #${assets.length + 1}`, startVal: 10000, endVal: 15000, years: 3 },
    ]);
  };

  const removeAsset = (id: string) => {
    if (assets.length <= 1) return;
    setAssets(assets.filter((a) => a.id !== id));
  };

  const updateAsset = (id: string, field: keyof AssetEntry, val: any) => {
    setAssets(assets.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  };

  const handleCopy = async () => {
    const lines = calculatedAssets.map(
      (a) =>
        `• ${a.name}: CAGR ${a.cagr.toFixed(2)}% APY (Start: $${a.startVal.toLocaleString()} ➔ End: $${a.endVal.toLocaleString()} over ${a.years} Yrs | Total Return: +${a.totalReturnPct.toFixed(1)}%)`
    );
    const summary = `CAGR Investment Asset Comparison Matrix\n\n${lines.join("\n")}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Assets Matrix Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Investment Assets &amp; Portfolios
          </span>
          <button
            onClick={addAsset}
            className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg inline-flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {assets.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-muted/20 border border-border rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
            >
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateAsset(item.id, "name", e.target.value)}
                  placeholder="Asset Name"
                  className="w-full px-2.5 py-1.5 font-semibold bg-background border border-border rounded-lg"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] text-muted-foreground block sm:hidden">Initial ($)</label>
                <input
                  type="number"
                  min={1}
                  value={item.startVal}
                  onChange={(e) => updateAsset(item.id, "startVal", Math.max(1, parseFloat(e.target.value) || 0))}
                  placeholder="Start ($)"
                  className="w-full px-2 py-1.5 font-mono bg-background border border-border rounded-lg"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] text-muted-foreground block sm:hidden">Final ($)</label>
                <input
                  type="number"
                  min={1}
                  value={item.endVal}
                  onChange={(e) => updateAsset(item.id, "endVal", Math.max(1, parseFloat(e.target.value) || 0))}
                  placeholder="Final ($)"
                  className="w-full px-2 py-1.5 font-mono bg-background border border-border rounded-lg"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-[10px] text-muted-foreground block sm:hidden">Years</label>
                <input
                  type="number"
                  min={0.1}
                  step="0.5"
                  value={item.years}
                  onChange={(e) => updateAsset(item.id, "years", Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-full px-1.5 py-1.5 font-mono text-center bg-background border border-border rounded-lg"
                />
              </div>

              <div className="sm:col-span-1 flex justify-center">
                <button
                  onClick={() => removeAsset(item.id)}
                  disabled={assets.length <= 1}
                  className="text-muted-foreground hover:text-rose-500 disabled:opacity-30 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CAGR Comparison Matrix Table */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Compound Annual Growth Rate (CAGR) Comparison
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy CAGR Matrix"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {calculatedAssets.map((a) => (
            <div key={a.id} className="p-4 bg-card rounded-xl border border-border space-y-1.5 shadow-2xs">
              <span className="text-xs font-bold text-foreground block truncate">{a.name}</span>
              <p className={`text-2xl font-extrabold font-mono ${a.cagr >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {a.cagr >= 0 ? "+" : ""}{a.cagr.toFixed(2)}%<span className="text-xs font-normal text-muted-foreground font-sans"> /yr</span>
              </p>
              <div className="pt-1 border-t border-border flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>Total: +{a.totalReturnPct.toFixed(1)}%</span>
                <span>{a.years} Yrs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
