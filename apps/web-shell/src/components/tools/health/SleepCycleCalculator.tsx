"use client";

import { useState, useMemo } from "react";
import { Moon, Sun, Clock, Copy, Check, Sparkles, Bed, Sparkle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SleepCycleCalculator() {
  const [mode, setMode] = useState<"wake" | "bed">("wake");
  const [targetTime, setTargetTime] = useState<string>("07:00");
  const [copied, setCopied] = useState<boolean>(false);

  const cycles = useMemo(() => {
    // 90 minutes per sleep cycle + 14 minutes average time to fall asleep
    const fallAsleepMins = 14;

    const [hours, minutes] = targetTime.split(":").map(Number);
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    const results: { cycles: number; hours: number; timeStr: string; label: string; isOptimal: boolean }[] = [];

    if (mode === "wake") {
      // Calculate bedtimes before wake up time
      for (let c = 6; c >= 3; c--) {
        const totalSleepMinutes = c * 90 + fallAsleepMins;
        const bedDate = new Date(targetDate.getTime() - totalSleepMinutes * 60 * 1000);
        const timeStr = bedDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        results.push({
          cycles: c,
          hours: c * 1.5,
          timeStr,
          label: c === 5 ? "Recommended (7.5h)" : c === 6 ? "Ideal Full Rest (9h)" : `${c * 1.5}h Sleep`,
          isOptimal: c === 5 || c === 6,
        });
      }
    } else {
      // "If I go to bed now" -> calculate wake up times
      const now = new Date();
      for (let c = 3; c <= 6; c++) {
        const totalSleepMinutes = c * 90 + fallAsleepMins;
        const wakeDate = new Date(now.getTime() + totalSleepMinutes * 60 * 1000);
        const timeStr = wakeDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        results.push({
          cycles: c,
          hours: c * 1.5,
          timeStr,
          label: c === 5 ? "Recommended (7.5h)" : c === 6 ? "Ideal Full Rest (9h)" : `${c * 1.5}h Sleep`,
          isOptimal: c === 5 || c === 6,
        });
      }
    }

    return results;
  }, [mode, targetTime]);

  const handleCopy = async () => {
    const summary = `Sleep Cycle Schedule (${mode === "wake" ? `Wake up at ${targetTime}` : "Going to bed now"}):\n` +
      cycles.map((c) => `• ${c.timeStr} (${c.cycles} Cycles / ${c.hours}h) - ${c.label}`).join("\n");
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMode("wake")}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
            mode === "wake"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          <Sun className="w-4 h-4" />
          I need to wake up at...
        </button>
        <button
          onClick={() => setMode("bed")}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
            mode === "bed"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          <Moon className="w-4 h-4" />
          If I go to bed right now...
        </button>
      </div>

      {/* Target Time Picker */}
      {mode === "wake" && (
        <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-xs">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Wake-Up Time
          </label>
          <input
            type="time"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      )}

      {/* Cycles Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-emerald-500" />
            {mode === "wake" ? "Optimal Bedtimes (Includes 14 min to fall asleep)" : "Optimal Wake-Up Times"}
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Schedule"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          {cycles.map((c) => (
            <div
              key={c.cycles}
              className={`p-4 rounded-xl border space-y-1 ${
                c.isOptimal
                  ? "bg-card border-emerald-500/40 shadow-sm"
                  : "bg-card/70 border-border"
              }`}
            >
              <div className="flex justify-between items-center font-sans">
                <span className="text-xs font-semibold text-muted-foreground">{c.cycles} Sleep Cycles</span>
                {c.isOptimal && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded">
                    Optimal
                  </span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-foreground pt-1">{c.timeStr}</p>
              <span className="text-[10px] text-muted-foreground font-sans block">{c.label}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground pt-1">
          Waking up at the end of a 90-minute REM sleep cycle prevents sleep inertia, helping you wake up feeling energetic and alert.
        </p>
      </div>
    </div>
  );
}
