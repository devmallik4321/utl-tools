"use client";

import { useState } from "react";
import { Users, DollarSign, Percent, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function TipBillSplitter() {
  const [billAmount, setBillAmount] = useState<number>(120);
  const [tipPct, setTipPct] = useState<number>(18);
  const [taxPct, setTaxPct] = useState<number>(5);
  const [splitCount, setSplitCount] = useState<number>(4);
  const [roundUp, setRoundUp] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const taxAmount = (billAmount * taxPct) / 100;
  const tipAmount = (billAmount * tipPct) / 100;
  let rawTotal = billAmount + taxAmount + tipAmount;
  let totalBill = roundUp ? Math.ceil(rawTotal) : rawTotal;
  let perPerson = splitCount > 0 ? totalBill / splitCount : 0;

  const handleCopy = async () => {
    const summary = `Dining Bill Split\n• Subtotal: $${billAmount.toFixed(2)}\n• Tip (${tipPct}%): $${tipAmount.toFixed(2)}\n• Tax (${taxPct}%): $${taxAmount.toFixed(2)}\n• Total Bill: $${totalBill.toFixed(2)}\n• Split among ${splitCount} people: $${perPerson.toFixed(2)} per person`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bill Subtotal */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Bill Subtotal ($)
        </label>
        <input
          type="number"
          step="0.01"
          value={billAmount}
          onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
        />
      </div>

      {/* Tip Selection Grid */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Tip Percentage
          </label>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{tipPct}% (${tipAmount.toFixed(2)})</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[10, 15, 18, 20, 25].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setTipPct(pct)}
              className={`flex-1 min-w-[55px] py-2 text-xs font-bold font-mono rounded-lg border transition-all ${
                tipPct === pct
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {pct}%
            </button>
          ))}
          <div className="flex items-center gap-1 w-24">
            <input
              type="number"
              value={tipPct}
              onChange={(e) => setTipPct(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-2 py-1.5 text-xs font-mono bg-background border border-border rounded-lg"
              placeholder="Custom"
            />
            <span className="text-xs text-muted-foreground font-bold">%</span>
          </div>
        </div>
      </div>

      {/* Tax & Split Count */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Tax Rate (%)
          </label>
          <input
            type="number"
            value={taxPct}
            onChange={(e) => setTaxPct(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Number of People
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={splitCount}
            onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2 flex flex-col justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
            <input
              type="checkbox"
              checked={roundUp}
              onChange={(e) => setRoundUp(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>Round Up to Nearest Dollar</span>
          </label>
          <span className="text-[10px] text-muted-foreground">Easy cash &amp; digital payments</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-500" />
            Total Split Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Split"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Each Person Pays</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${perPerson.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Divided equally among {splitCount} people</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Tip Amount</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${tipAmount.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">({tipPct}% on ${billAmount.toFixed(2)})</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Final Total Bill</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${totalBill.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Subtotal + Tax (${taxAmount.toFixed(2)}) + Tip</span>
          </div>
        </div>
      </div>
    </div>
  );
}
