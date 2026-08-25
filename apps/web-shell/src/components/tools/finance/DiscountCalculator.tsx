"use client";

import { useState } from "react";
import { Tag, DollarSign, Percent } from "lucide-react";

export function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState<number>(120);
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [additionalCoupon, setAdditionalCoupon] = useState<number>(10);
  const [salesTax, setSalesTax] = useState<number>(8.5);

  // Math
  const priceAfterDiscount = originalPrice * (1 - discountPercent / 100);
  const priceAfterCoupon = priceAfterDiscount * (1 - additionalCoupon / 100);
  const taxAmount = (priceAfterCoupon * salesTax) / 100;
  const finalPrice = priceAfterCoupon + taxAmount;
  const totalSavings = originalPrice - priceAfterCoupon;
  const totalSavingsPercent = originalPrice > 0 ? ((totalSavings / originalPrice) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-card border border-border rounded-xl">
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Original Price ($)
          </label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Primary Discount (%)
          </label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Extra Coupon (%)
          </label>
          <input
            type="number"
            value={additionalCoupon}
            onChange={(e) => setAdditionalCoupon(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Sales Tax (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={salesTax}
            onChange={(e) => setSalesTax(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Final Checkout Price
          </span>
          <p className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ${finalPrice.toFixed(2)}
          </p>
          <span className="text-xs text-muted-foreground">Including ${taxAmount.toFixed(2)} sales tax</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            You Save
          </span>
          <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
            ${totalSavings.toFixed(2)}
          </p>
          <span className="text-xs text-muted-foreground">{totalSavingsPercent}% total effective discount</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Pre-Tax Price
          </span>
          <p className="text-3xl font-black font-mono text-foreground">
            ${priceAfterCoupon.toFixed(2)}
          </p>
          <span className="text-xs text-muted-foreground">Original: ${originalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
