"use client";

import { useState } from "react";
import { Shuffle, Trophy, Copy, Check, RotateCcw, UserCheck, Edit3, Sparkles, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import { copyToClipboard } from "@/lib/utils";

const PRESETS: Record<string, string> = {
  names: `Alice Smith\nBob Johnson\nCharlie Brown\nDiana Prince\nEthan Hunt\nFiona Gallagher\nGeorge Clark\nHannah Abbott`,
  lunch: `Pizza\nSushi\nTacos\nBurgers\nThai Curry\nSalad Bar\nRamen\nSandwiches`,
  raffle: `Ticket #101\nTicket #102\nTicket #103\nTicket #104\nTicket #105\nTicket #106\nTicket #107\nTicket #108`,
  decisions: `Option A (Proceed)\nOption B (Wait 1 Week)\nOption C (Pivot)\nOption D (Rethink Scope)`
};

export function RandomPicker() {
  const [inputText, setInputText] = useState<string>(PRESETS.names);
  const [pickCount, setPickCount] = useState<number>(1);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const getCleanList = (): string[] => {
    return inputText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const pickWinners = () => {
    setError("");
    const items = getCleanList();

    if (items.length === 0) {
      setError("Your list is currently empty. Please type or paste at least one item.");
      return;
    }

    if (!allowDuplicates && pickCount > items.length) {
      setError(`Cannot pick ${pickCount} unique winners from a list of only ${items.length} items. Either reduce winner count or check 'Allow duplicate wins'.`);
      return;
    }

    const pool = [...items];
    const picked: string[] = [];

    for (let i = 0; i < pickCount; i++) {
      if (pool.length === 0) break;
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool[idx]);
      if (!allowDuplicates) {
        pool.splice(idx, 1);
      }
    }

    setWinners(picked);

    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const shuffleList = () => {
    const items = getCleanList();
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    setInputText(items.join("\n"));
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(winners.join("\n"));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const count = getCleanList().length;

  return (
    <div className="space-y-6">
      {/* Quick Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/40 border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-semibold text-foreground">Load Preset List:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setInputText(PRESETS.names)}
              className="px-2.5 py-1 text-xs bg-card border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
            >
              Sample Names
            </button>
            <button
              type="button"
              onClick={() => setInputText(PRESETS.lunch)}
              className="px-2.5 py-1 text-xs bg-card border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
            >
              Lunch Options
            </button>
            <button
              type="button"
              onClick={() => setInputText(PRESETS.raffle)}
              className="px-2.5 py-1 text-xs bg-card border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
            >
              Raffle Tickets
            </button>
            <button
              type="button"
              onClick={() => setInputText(PRESETS.decisions)}
              className="px-2.5 py-1 text-xs bg-card border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
            >
              Decisions
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setInputText("")}
          className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Clear Text
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Input Text Area */}
        <div className="md:col-span-6 space-y-4">
          <div className="p-5 bg-card border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                <span>Your Editable List ({count} items)</span>
              </label>
              <button
                type="button"
                onClick={shuffleList}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded border border-border"
              >
                <Shuffle className="w-3 h-3" /> Shuffle
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Type or paste your candidates below. Each line counts as one distinct entry.
            </p>

            <textarea
              rows={10}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter names or items here (one per line)..."
              className="w-full p-3.5 text-xs sm:text-sm font-mono bg-background border-2 border-border focus:border-blue-500 rounded-xl focus:outline-none resize-y leading-relaxed"
            />

            {/* Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Winner Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, count)}
                  value={pickCount}
                  onChange={(e) => setPickCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none font-bold"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowDuplicates}
                    onChange={(e) => setAllowDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Allow duplicate wins</span>
                </label>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={pickWinners}
              className="w-full py-3.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-sm rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Draw {pickCount === 1 ? "Random Winner" : `${pickCount} Random Winners`}</span>
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="md:col-span-6 space-y-4">
          <div className="p-5 bg-card border border-border rounded-xl space-y-4 min-h-[380px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  Selected Winner(s)
                </span>
                {winners.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium bg-muted px-2.5 py-1 rounded-lg border border-border"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Winners"}</span>
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-2.5">
                {winners.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-xs sm:text-sm space-y-1">
                    <p className="font-semibold text-foreground">Ready to Draw</p>
                    <p>Enter your items on the left and click "Draw Random Winner".</p>
                  </div>
                ) : (
                  winners.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between animate-in zoom-in-95 duration-150 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-foreground text-sm sm:text-base">{w}</span>
                      </div>
                      <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {winners.length > 0 && (
              <div className="pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                <span>Drawn fairly using client-side Web Crypto</span>
                <button
                  type="button"
                  onClick={() => setWinners([])}
                  className="text-muted-foreground hover:text-foreground underline"
                >
                  Clear Results
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
