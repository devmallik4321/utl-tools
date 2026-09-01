"use client";

import { useState, useMemo } from "react";
import { Divide, Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function DecimalFractionConverter() {
  const [decimalInput, setDecimalInput] = useState<string>("0.375");
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    const val = parseFloat(decimalInput);
    if (isNaN(val)) {
      return { isValid: false, numerator: 0, denominator: 1, whole: 0, remNum: 0, pct: "0" };
    }

    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

    // Handle decimal precision
    const str = decimalInput.trim();
    const parts = str.split(".");
    let num = 0;
    let den = 1;

    if (parts.length === 2) {
      const decPlaces = parts[1].length;
      den = Math.pow(10, decPlaces);
      num = Math.round(val * den);
    } else {
      num = Math.round(val);
      den = 1;
    }

    const common = gcd(Math.abs(num), den);
    const simpNum = num / common;
    const simpDen = den / common;

    const whole = Math.floor(Math.abs(val));
    const remNum = Math.abs(simpNum) % simpDen;
    const pct = (val * 100).toFixed(2);

    return {
      isValid: true,
      val,
      numerator: simpNum,
      denominator: simpDen,
      whole: val < 0 ? -whole : whole,
      remNum,
      pct,
      gcdVal: common,
    };
  }, [decimalInput]);

  const handleCopy = async () => {
    if (!result.isValid) return;
    const fractionStr = result.whole !== 0 && result.remNum !== 0
      ? `${result.whole} ${result.remNum}/${result.denominator}`
      : `${result.numerator}/${result.denominator}`;
    const summary = `Decimal to Fraction Conversion\n• Decimal: ${decimalInput}\n• Simplified Fraction: ${result.numerator}/${result.denominator}\n• Mixed Fraction: ${fractionStr}\n• Percentage: ${result.pct}%`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameter */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Enter Decimal Number
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={decimalInput}
            onChange={(e) => setDecimalInput(e.target.value)}
            placeholder="e.g. 0.375, 2.625, 0.5"
            className="flex-1 px-4 py-2.5 text-lg font-mono font-bold bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-1">
          <span>Try common fractions:</span>
          {["0.125", "0.25", "0.3333", "0.375", "0.5", "0.625", "0.75", "0.875", "1.5"].map((d) => (
            <button
              key={d}
              onClick={() => setDecimalInput(d)}
              className="text-blue-600 dark:text-blue-400 font-mono hover:underline"
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Results Overview */}
      {result.isValid && (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Divide className="w-4 h-4 text-emerald-500" />
              Simplified Fraction &amp; Mixed Number
            </h4>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Fraction"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Simplified Fraction</span>
              <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {result.numerator}/{result.denominator}
              </p>
              <span className="text-[10px] text-muted-foreground">Reduced using GCD ({result.gcdVal})</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Mixed Number</span>
              <p className="text-2xl font-bold font-mono text-foreground">
                {Math.abs(result.whole) > 0 && result.remNum > 0
                  ? `${result.whole} ${result.remNum}/${result.denominator}`
                  : `${result.numerator}/${result.denominator}`}
              </p>
              <span className="text-[10px] text-muted-foreground">Whole integer + proper remainder</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Percentage Equivalent</span>
              <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {result.pct}%
              </p>
              <span className="text-[10px] text-muted-foreground">Decimal value × 100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
