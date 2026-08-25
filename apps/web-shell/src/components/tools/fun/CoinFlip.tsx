"use client";

import { useState } from "react";
import { RotateCcw, Play, BarChart2 } from "lucide-react";

export function CoinFlip() {
  const [flipping, setFlipping] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<"heads" | "tails">("heads");
  const [headsCount, setHeadsCount] = useState<number>(0);
  const [tailsCount, setTailsCount] = useState<number>(0);
  const [history, setHistory] = useState<("heads" | "tails")[]>([]);
  const [batchCount, setBatchCount] = useState<number>(1);

  const flipCoin = () => {
    if (flipping) return;
    setFlipping(true);

    setTimeout(() => {
      let newHeads = 0;
      let newTails = 0;
      const newFlips: ("heads" | "tails")[] = [];

      for (let i = 0; i < batchCount; i++) {
        const isHeads = Math.random() < 0.5;
        if (isHeads) {
          newHeads++;
          newFlips.push("heads");
        } else {
          newTails++;
          newFlips.push("tails");
        }
      }

      const finalOutcome = newFlips[newFlips.length - 1];
      setCurrentResult(finalOutcome);
      setHeadsCount((h) => h + newHeads);
      setTailsCount((t) => t + newTails);
      setHistory((prev) => [...newFlips.slice(-10), ...prev].slice(0, 30));
      setFlipping(false);
    }, 600);
  };

  const total = headsCount + tailsCount;
  const headsPct = total > 0 ? ((headsCount / total) * 100).toFixed(1) : "0.0";
  const tailsPct = total > 0 ? ((tailsCount / total) * 100).toFixed(1) : "0.0";

  const reset = () => {
    setHeadsCount(0);
    setTailsCount(0);
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Interactive Coin View */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl">
          <div
            onClick={flipCoin}
            className={`w-36 h-36 rounded-full border-4 border-amber-400 bg-gradient-to-br from-amber-300 to-amber-500 shadow-xl flex items-center justify-center cursor-pointer select-none transition-transform duration-500 text-amber-950 font-black text-2xl tracking-wider ${
              flipping ? "rotate-[720deg] scale-90" : "hover:scale-105"
            }`}
          >
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-amber-600/60 flex items-center justify-center text-center">
              {currentResult === "heads" ? "HEADS" : "TAILS"}
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
              <span>{flipping ? "Flipping..." : "Flip Coin"}</span>
            </button>
          </div>
        </div>

        {/* Live Probability & Stats */}
        <div className="md:col-span-6 space-y-4">
          <div className="p-5 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue-500" />
                Flip Statistics
              </h4>
              <button
                type="button"
                onClick={reset}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Stats
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/40 rounded-lg border border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Heads</span>
                <p className="text-2xl font-bold text-foreground mt-1">{headsCount}</p>
                <span className="text-xs text-muted-foreground font-mono">{headsPct}%</span>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg border border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Tails</span>
                <p className="text-2xl font-bold text-foreground mt-1">{tailsCount}</p>
                <span className="text-xs text-muted-foreground font-mono">{tailsPct}%</span>
              </div>
            </div>

            {/* Probability Progress Bar */}
            <div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${headsPct}%` }}
                />
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${tailsPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>Total Flips: {total}</span>
                <span>Expected Ratio: 50 / 50</span>
              </div>
            </div>

            {/* Recent History log */}
            {history.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Recent Outcomes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {history.map((res, i) => (
                    <span
                      key={i}
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        res === "heads"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {res === "heads" ? "H" : "T"}
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
