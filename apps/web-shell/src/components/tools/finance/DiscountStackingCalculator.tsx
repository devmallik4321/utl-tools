"use client";

import { useState } from "react";
import { Tag, Plus, Trash2, DollarSign, Percent, Copy, Check, ArrowDown } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface DiscountLayer {
  id: string;
  name: string;
  type: "percent" | "fixed";
  value: number;
}

export function DiscountStackingCalculator() {
  const [originalPrice, setOriginalPrice] = useState<number>(150);
  const [discounts, setDiscounts] = useState<DiscountLayer[]>([
    { id: "1", name: "Storewide Sale", type: "percent", value: 20 },
    { id: "2", name: "Promo Coupon", type: "fixed", value: 15 },
    { id: "3", name: "Member Discount", type: "percent", value: 5 },
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  // Sequential Discount Calculation
  let current = originalPrice;
  const steps: { name: string; discountAmount: number; priceAfter: number; desc: string }[] = [];

  for (const d of discounts) {
    let discountAmount = 0;
    let desc = "";

    if (d.type === "percent") {
      discountAmount = (current * d.value) / 100;
      desc = `${d.value}% off remaining $${current.toFixed(2)}`;
    } else {
      discountAmount = Math.min(current, d.value);
      desc = `$${d.value.toFixed(2)} fixed off`;
    }

    const priceAfter = Math.max(0, current - discountAmount);
    steps.push({
      name: d.name || "Discount",
      discountAmount,
      priceAfter,
      desc,
    });
    current = priceAfter;
  }

  const finalPrice = current;
  const totalSavings = Math.max(0, originalPrice - finalPrice);
  const effectivePct = originalPrice > 0 ? ((totalSavings / originalPrice) * 100).toFixed(1) : "0";

  const addDiscount = () => {
    setDiscounts((prev) => [
      ...prev,
      { id: Date.now().toString(), name: `Discount ${prev.length + 1}`, type: "percent", value: 10 },
    ]);
  };

  const removeDiscount = (id: string) => {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDiscount = (id: string, field: keyof DiscountLayer, val: any) => {
    setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: val } : d)));
  };

  const handleCopy = async () => {
    const summary = `Discount Stacking Calculation\n• Original Price: $${originalPrice.toFixed(2)}\n• Final Price: $${finalPrice.toFixed(2)}\n• Total Savings: $${totalSavings.toFixed(2)} (${effectivePct}% Effective Discount)\n• Stacked: ${discounts.map((d) => `${d.name} (${d.type === "percent" ? `${d.value}%` : `$${d.value}`})`).join(" + ")}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Base Price Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Original Item / Cart Price ($)
        </label>
        <input
          type="number"
          value={originalPrice}
          onChange={(e) => setOriginalPrice(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stacked Discount Layers */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Stacked Discount Sequence (Applied in order)
          </label>
          <button
            type="button"
            onClick={addDiscount}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Discount Layer</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {discounts.map((d, index) => (
            <div key={d.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-muted/30 rounded-lg border border-border">
              <span className="text-xs font-mono text-muted-foreground w-6">#{index + 1}</span>
              <input
                type="text"
                value={d.name}
                onChange={(e) => updateDiscount(d.id, "name", e.target.value)}
                placeholder="Discount name"
                className="text-xs px-2.5 py-1.5 bg-background border border-border rounded-md flex-1"
              />
              <div className="flex items-center gap-2">
                <select
                  value={d.type}
                  onChange={(e) => updateDiscount(d.id, "type", e.target.value)}
                  className="text-xs px-2 py-1.5 bg-background border border-border rounded-md"
                >
                  <option value="percent">% Percentage Off</option>
                  <option value="fixed">$ Fixed Amount Off</option>
                </select>
                <input
                  type="number"
                  value={d.value}
                  onChange={(e) => updateDiscount(d.id, "value", Math.max(0, parseFloat(e.target.value) || 0))}
                  className="text-xs w-20 px-2.5 py-1.5 bg-background border border-border rounded-md font-mono"
                />
                {discounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDiscount(d.id)}
                    className="p-1.5 text-muted-foreground hover:text-rose-500 rounded"
                    title="Remove discount"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-500" />
            Final Stacked Price &amp; Total Savings
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Final Payable Price</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${finalPrice.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Original: ${originalPrice.toFixed(2)}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Money Saved</span>
            <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              ${totalSavings.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Direct cash saved</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Effective Total Discount</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {effectivePct}%
            </p>
            <span className="text-[10px] text-muted-foreground">True net percentage discount</span>
          </div>
        </div>

        {/* Step-by-Step Sequence */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Step-by-Step Discount Breakdown:
          </span>
          <div className="space-y-1.5 font-mono text-xs">
            {steps.map((step, idx) => (
              <div key={idx} className="p-2.5 bg-card border border-border rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">Step {idx + 1}: {step.name}</span>
                  <span className="text-muted-foreground ml-2 text-[11px]">({step.desc})</span>
                </div>
                <div className="text-right">
                  <span className="text-rose-500 font-semibold">-${step.discountAmount.toFixed(2)}</span>
                  <span className="text-muted-foreground ml-2">➔ ${step.priceAfter.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
