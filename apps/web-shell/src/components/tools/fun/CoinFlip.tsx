"use client";

import { useState } from "react";
import { RotateCcw, Play, BarChart2, Sparkles, Layers } from "lucide-react";

type FlipMode = "2-sided" | "3-sided" | "custom";

interface CustomOption {
  id: string;
  name: string;
  count: number;
}

export function CoinFlip() {
  const [mode, setMode] = useState<FlipMode>("2-sided");
  const [flipping, setFlipping] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<string>("HEADS");
  const [history, setHistory] = useState<string[]>([]);
  const [batchCount, setBatchCount] = useState<number>(1);

  // 2-sided state
  const [headsCount, setHeadsCount] = useState<number>(0);
  const [tailsCount, setTailsCount] = useState<number>(0);

  // 3-sided state (Side A, Side B, Side C)
  const [side1Count, setSide1Count] = useState<number>(0);
  const [side2Count, setSide2Count] = useState<number>(0);
  const [side3Count, setSide3Count] = useState<number>(0);
  const [side3Labels, setSide3Labels] = useState<[string, string, string]>(["SIDE A", "SIDE B", "SIDE C"]);

  // Custom N-sided options
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([
    { id: "1", name: "Option 1", count: 0 },
    { id: "2", name: "Option 2", count: 0 },
    { id: "3", name: "Option 3", count: 0 },
    { id: "4", name: "Option 4", count: 0 },
  ]);

  const flipCoin = () => {
    if (flipping) return;
    setFlipping(true);

    setTimeout(() => {
      const newFlips: string[] = [];

      if (mode === "2-sided") {
        let newHeads = 0;
        let newTails = 0;
        for (let i = 0; i < batchCount; i++) {
          const isHeads = Math.random() < 0.5;
          if (isHeads) {
            newHeads++;
            newFlips.push("HEADS");
          } else {
            newTails++;
            newFlips.push("TAILS");
          }
        }
        setCurrentResult(newFlips[newFlips.length - 1]);
        setHeadsCount((h) => h + newHeads);
        setTailsCount((t) => t + newTails);
      } else if (mode === "3-sided") {
        let s1 = 0, s2 = 0, s3 = 0;
        for (let i = 0; i < batchCount; i++) {
          const r = Math.random();
          if (r < 1 / 3) {
            s1++;
            newFlips.push(side3Labels[0]);
          } else if (r < 2 / 3) {
            s2++;
            newFlips.push(side3Labels[1]);
          } else {
            s3++;
            newFlips.push(side3Labels[2]);
          }
        }
        setCurrentResult(newFlips[newFlips.length - 1]);
        setSide1Count((c) => c + s1);
        setSide2Count((c) => c + s2);
        setSide3Count((c) => c + s3);
      } else {
        // Custom N-sided
        const activeOpts = customOptions.filter((o) => o.name.trim().length > 0);
        if (activeOpts.length === 0) return;
        const countsMap: Record<string, number> = {};
        activeOpts.forEach((o) => (countsMap[o.id] = 0));

        for (let i = 0; i < batchCount; i++) {
          const idx = Math.floor(Math.random() * activeOpts.length);
          const chosen = activeOpts[idx];
          countsMap[chosen.id]++;
          newFlips.push(chosen.name);
        }

        setCurrentResult(newFlips[newFlips.length - 1]);
        setCustomOptions((prev) =>
          prev.map((opt) => ({
            ...opt,
            count: opt.count + (countsMap[opt.id] || 0),
          }))
        );
      }

      setHistory((prev) => [...newFlips.slice(-10), ...prev].slice(0, 30));
      setFlipping(false);
    }, 500);
  };

  const reset = () => {
    setHeadsCount(0);
    setTailsCount(0);
    setSide1Count(0);
    setSide2Count(0);
    setSide3Count(0);
    setCustomOptions((prev) => prev.map((o) => ({ ...o, count: 0 })));
    setHistory([]);
  };

  // Stats calculation
  const total2 = headsCount + tailsCount;
  const total3 = side1Count + side2Count + side3Count;
  const totalCustom = customOptions.reduce((sum, o) => sum + o.count, 0);

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/50 rounded-xl border border-border">
        <button
          onClick={() => { setMode("2-sided"); setCurrentResult("HEADS"); }}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            mode === "2-sided" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Standard (2 Sides)</span>
        </button>

        <button
          onClick={() => { setMode("3-sided"); setCurrentResult(side3Labels[0]); }}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            mode === "3-sided" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>3-Sided Coin Decider</span>
        </button>

        <button
          onClick={() => { setMode("custom"); setCurrentResult(customOptions[0]?.name || "RESULT"); }}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            mode === "custom" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>N-Way Custom Decider</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Interactive Coin Canvas */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl">
          <div
            onClick={flipCoin}
            className={`w-40 h-40 rounded-full border-4 shadow-xl flex items-center justify-center cursor-pointer select-none transition-transform duration-500 text-center font-black tracking-wider ${
              mode === "2-sided"
                ? "border-amber-400 bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 text-xl"
                : mode === "3-sided"
                ? "border-purple-400 bg-gradient-to-br from-purple-300 to-indigo-500 text-purple-950 text-base"
                : "border-blue-400 bg-gradient-to-br from-blue-300 to-cyan-500 text-blue-950 text-base"
            } ${flipping ? "rotate-[720deg] scale-90" : "hover:scale-105"}`}
          >
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-black/20 flex items-center justify-center p-2 break-words">
              {currentResult}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Flips:</span>
              <select
                value={batchCount}
                onChange={(e) => setBatchCount(parseInt(e.target.value))}
                className="px-2 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none"
              >
                <option value={1}>1 Flip</option>
                <option value={5}>5 Flips</option>
                <option value={10}>10 Flips</option>
                <option value={50}>50 Flips</option>
                <option value={100}>100 Flips</option>
              </select>
            </div>

            <button
              type="button"
              onClick={flipCoin}
              disabled={flipping}
              className="px-6 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-sm rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{flipping ? "Flipping..." : mode === "3-sided" ? "Flip 3-Sided Coin" : mode === "custom" ? "Spin Decider" : "Flip Coin"}</span>
            </button>
          </div>
        </div>

        {/* Live Probability & Custom Controls */}
        <div className="md:col-span-6 space-y-4">
          <div className="p-5 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue-500" />
                <span>{mode === "2-sided" ? "2-Sided Statistics" : mode === "3-sided" ? "3-Sided Statistics" : "Custom Decider Statistics"}</span>
              </h4>
              <button
                type="button"
                onClick={reset}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* 2-SIDED STATS */}
            {mode === "2-sided" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/40 rounded-lg border border-border">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Heads</span>
                    <p className="text-2xl font-bold text-foreground mt-1">{headsCount}</p>
                    <span className="text-xs text-muted-foreground font-mono">{total2 > 0 ? ((headsCount / total2) * 100).toFixed(1) : "0.0"}%</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-lg border border-border">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Tails</span>
                    <p className="text-2xl font-bold text-foreground mt-1">{tailsCount}</p>
                    <span className="text-xs text-muted-foreground font-mono">{total2 > 0 ? ((tailsCount / total2) * 100).toFixed(1) : "0.0"}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3-SIDED STATS & LABELS */}
            {mode === "3-sided" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: side3Labels[0], count: side1Count, setLabel: (v: string) => setSide3Labels([v, side3Labels[1], side3Labels[2]]) },
                    { label: side3Labels[1], count: side2Count, setLabel: (v: string) => setSide3Labels([side3Labels[0], v, side3Labels[2]]) },
                    { label: side3Labels[2], count: side3Count, setLabel: (v: string) => setSide3Labels([side3Labels[0], side3Labels[1], v]) },
                  ].map((side, i) => (
                    <div key={i} className="p-2.5 bg-muted/40 rounded-lg border border-border space-y-1">
                      <input
                        type="text"
                        value={side.label}
                        onChange={(e) => side.setLabel(e.target.value)}
                        className="text-[11px] font-bold text-foreground bg-transparent border-b border-border/60 w-full focus:outline-none"
                      />
                      <p className="text-lg font-bold text-foreground">{side.count}</p>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {total3 > 0 ? ((side.count / total3) * 100).toFixed(1) : "33.3"}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CUSTOM N-SIDED STATS & LABELS */}
            {mode === "custom" && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {customOptions.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border">
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}.</span>
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomOptions((prev) => prev.map((o) => (o.id === opt.id ? { ...o, name: val } : o)));
                      }}
                      className="text-xs font-medium text-foreground bg-transparent flex-1 focus:outline-none"
                      placeholder={`Option ${i + 1}`}
                    />
                    <span className="text-xs font-bold text-foreground">{opt.count}</span>
                    <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">
                      {totalCustom > 0 ? `${((opt.count / totalCustom) * 100).toFixed(1)}%` : "0%"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent History log */}
            {history.length > 0 && (
              <div className="pt-2 border-t border-border">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Recent Outcomes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {history.map((res, i) => (
                    <span
                      key={i}
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border"
                    >
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
