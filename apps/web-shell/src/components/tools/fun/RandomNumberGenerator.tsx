"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Shuffle, ArrowDownUp } from "lucide-react";
import { copyToClipboard, downloadFile } from "@/lib/utils";

export function RandomNumberGenerator() {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(5);
  const [unique, setUnique] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [results, setResults] = useState<number[]>([42, 17, 89, 3, 64]);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const generateNumbers = () => {
    setError("");
    const minVal = Math.min(min, max);
    const maxVal = Math.max(min, max);
    const rangeSize = maxVal - minVal + 1;

    if (unique && count > rangeSize) {
      setError(`Cannot generate ${count} unique numbers in a range of size ${rangeSize}. Either reduce count or uncheck 'Unique numbers'.`);
      return;
    }

    if (count > 1000) {
      setError("Maximum limit is 1,000 numbers per generation.");
      return;
    }

    const generated: number[] = [];
    const used = new Set<number>();

    // Cryptographically secure generation
    const cryptoObj = typeof window !== "undefined" ? window.crypto : null;

    while (generated.length < count) {
      let num: number;
      if (cryptoObj && cryptoObj.getRandomValues) {
        const randomUint = new Uint32Array(1);
        cryptoObj.getRandomValues(randomUint);
        num = minVal + (randomUint[0] % rangeSize);
      } else {
        num = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      }

      if (unique) {
        if (!used.has(num)) {
          used.add(num);
          generated.push(num);
        }
      } else {
        generated.push(num);
      }
    }

    if (sortOrder === "asc") {
      generated.sort((a, b) => a - b);
    } else if (sortOrder === "desc") {
      generated.sort((a, b) => b - a);
    }

    setResults(generated);
  };

  const handleCopy = async () => {
    const text = results.join(", ");
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const text = results.join("\n");
    downloadFile(text, "random-numbers.txt");
  };

  return (
    <div className="space-y-6">
      {/* Configuration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-card border border-border rounded-xl">
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Minimum Value
          </label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Maximum Value
          </label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Quantity (Count)
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Sort Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="none">Random Order (As Picked)</option>
            <option value="asc">Ascending (Lowest to Highest)</option>
            <option value="desc">Descending (Highest to Lowest)</option>
          </select>
        </div>
      </div>

      {/* Options Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-xs sm:text-sm text-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={unique}
            onChange={(e) => setUnique(e.target.checked)}
            className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
          />
          <span>Allow unique numbers only (no duplicates)</span>
        </label>

        <div className="flex items-center gap-2">
          {/* Quick Presets */}
          <button
            type="button"
            onClick={() => { setMin(1); setMax(6); setCount(1); }}
            className="px-2.5 py-1 text-xs bg-muted hover:bg-muted/80 rounded border border-border text-muted-foreground"
          >
            1d6
          </button>
          <button
            type="button"
            onClick={() => { setMin(1); setMax(100); setCount(1); }}
            className="px-2.5 py-1 text-xs bg-muted hover:bg-muted/80 rounded border border-border text-muted-foreground"
          >
            1-100
          </button>
          <button
            type="button"
            onClick={() => { setMin(1); setMax(49); setCount(6); setUnique(true); setSortOrder("asc"); }}
            className="px-2.5 py-1 text-xs bg-muted hover:bg-muted/80 rounded border border-border text-muted-foreground"
          >
            Lottery (6/49)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Action Button */}
      <div>
        <button
          type="button"
          onClick={generateNumbers}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
        >
          <Shuffle className="w-4 h-4" />
          <span>Generate Random Numbers</span>
        </button>
      </div>

      {/* Results Display */}
      <div className="border border-border rounded-xl bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Generated Results ({results.length})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
              Web Crypto Secure
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Numbers Badges */}
        <div className="flex flex-wrap gap-2.5 max-h-72 overflow-y-auto p-2 bg-muted/30 rounded-lg">
          {results.map((num, i) => (
            <div
              key={i}
              className="min-w-[48px] h-12 px-3 rounded-lg bg-background border border-border font-mono font-bold text-base sm:text-lg flex items-center justify-center text-foreground shadow-sm animate-in zoom-in-95 duration-100"
            >
              {num}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
