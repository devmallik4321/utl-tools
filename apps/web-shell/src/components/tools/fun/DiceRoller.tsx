"use client";

import { useState } from "react";
import { Play, RotateCcw, Sparkles } from "lucide-react";

interface DieRoll {
  die: string;
  sides: number;
  value: number;
}

const DIE_TYPES = [
  { label: "d4", sides: 4 },
  { label: "d6", sides: 6 },
  { label: "d8", sides: 8 },
  { label: "d10", sides: 10 },
  { label: "d12", sides: 12 },
  { label: "d20", sides: 20 },
  { label: "d100", sides: 100 },
];

export function DiceRoller() {
  const [selectedDie, setSelectedDie] = useState<number>(20);
  const [dieCount, setDieCount] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [rolls, setRolls] = useState<DieRoll[]>([{ die: "d20", sides: 20, value: 20 }]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [history, setHistory] = useState<{ notation: string; total: number; rolls: number[] }[]>([]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);

    setTimeout(() => {
      const currentRolls: DieRoll[] = [];
      const rollValues: number[] = [];

      for (let i = 0; i < dieCount; i++) {
        const val = Math.floor(Math.random() * selectedDie) + 1;
        currentRolls.push({
          die: `d${selectedDie}`,
          sides: selectedDie,
          value: val,
        });
        rollValues.push(val);
      }

      setRolls(currentRolls);
      const subtotal = rollValues.reduce((a, b) => a + b, 0);
      const totalWithMod = subtotal + modifier;

      const notation = `${dieCount}d${selectedDie}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`;
      setHistory((prev) => [{ notation, total: totalWithMod, rolls: rollValues }, ...prev].slice(0, 15));
      setIsRolling(false);
    }, 350);
  };

  const rawSum = rolls.reduce((acc, r) => acc + r.value, 0);
  const finalTotal = rawSum + modifier;

  return (
    <div className="space-y-6">
      {/* Die Type Selectors */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Select Die Type
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {DIE_TYPES.map((dt) => (
            <button
              key={dt.sides}
              type="button"
              onClick={() => setSelectedDie(dt.sides)}
              className={`py-3 rounded-xl font-bold text-sm border transition-all ${
                selectedDie === dt.sides
                  ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                  : "bg-muted/40 text-foreground border-border hover:bg-muted"
              }`}
            >
              {dt.label}
            </button>
          ))}
        </div>

        {/* Count and Modifier Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Number of Dice: {dieCount}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={dieCount}
              onChange={(e) => setDieCount(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Modifier (+/- static bonus): {modifier > 0 ? `+${modifier}` : modifier}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModifier((m) => m - 1)}
                className="px-3 py-1 bg-muted rounded-lg text-sm font-bold border border-border"
              >
                -1
              </button>
              <input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 text-center text-sm bg-background border border-border rounded-lg"
              />
              <button
                type="button"
                onClick={() => setModifier((m) => m + 1)}
                className="px-3 py-1 bg-muted rounded-lg text-sm font-bold border border-border"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => setModifier(0)}
                className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
              >
                Reset mod
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Roll Action Button */}
      <div>
        <button
          type="button"
          onClick={rollDice}
          disabled={isRolling}
          className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isRolling ? "Rolling..." : `Roll ${dieCount}d${selectedDie}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`}</span>
        </button>
      </div>

      {/* Results Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Roll Result
            </span>
            {selectedDie === 20 && rolls.some((r) => r.value === 20) && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> CRITICAL HIT!
              </span>
            )}
          </div>

          {/* Dice Tokens */}
          <div className="flex flex-wrap gap-3">
            {rolls.map((r, i) => {
              const isNat20 = r.sides === 20 && r.value === 20;
              const isNat1 = r.sides === 20 && r.value === 1;

              return (
                <div
                  key={i}
                  className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center font-mono font-black shadow-sm transition-all ${
                    isNat20
                      ? "bg-emerald-500 text-white border-emerald-600 scale-105"
                      : isNat1
                      ? "bg-rose-500 text-white border-rose-600"
                      : "bg-muted/60 text-foreground border-border"
                  }`}
                >
                  <span className="text-xl leading-none">{r.value}</span>
                  <span className="text-[10px] opacity-75 font-sans font-normal">{r.die}</span>
                </div>
              );
            })}
          </div>

          {/* Total display */}
          <div className="pt-4 border-t border-border flex items-baseline justify-between">
            <div className="text-xs text-muted-foreground">
              Formula: sum({rolls.map((r) => r.value).join(" + ")})
              {modifier !== 0 && ` ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`}
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase font-bold block">Grand Total</span>
              <span className="text-3xl font-black text-foreground">{finalTotal}</span>
            </div>
          </div>
        </div>

        {/* Roll History */}
        <div className="md:col-span-4 p-5 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Roll Log</h4>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
            {history.length === 0 ? (
              <p className="text-muted-foreground">No rolls logged yet.</p>
            ) : (
              history.map((h, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/40">
                  <span className="font-medium text-foreground">{h.notation}</span>
                  <span className="text-muted-foreground">[{h.rolls.join(", ")}]</span>
                  <span className="font-bold font-mono text-foreground">{h.total}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
