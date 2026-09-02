"use client";

import { useState, useMemo } from "react";
import { Clock, Calendar, Copy, Check, Sparkles, AlertCircle, Play } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Every 15 Minutes", exp: "*/15 * * * *" },
  { name: "Daily at Midnight UTC", exp: "0 0 * * *" },
  { name: "Every Monday at 9:00 AM", exp: "0 9 * * 1" },
  { name: "First of Every Month", exp: "0 0 1 * *" },
  { name: "Every Weekday at 5:00 PM", exp: "0 17 * * 1-5" },
];

export function CronNextRunsCalculator() {
  const [expression, setExpression] = useState<string>("*/15 * * * *");
  const [copied, setCopied] = useState<boolean>(false);

  const { runs, isValid, errorMsg } = useMemo(() => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      return { runs: [], isValid: false, errorMsg: "A valid cron expression must contain exactly 5 space-separated fields." };
    }

    const [minPart, hourPart, domPart, monthPart, dowPart] = parts;

    // In-memory matcher for each field
    const matchField = (val: number, part: string, minLimit: number, maxLimit: number): boolean => {
      if (part === "*") return true;
      if (part.startsWith("*/")) {
        const step = parseInt(part.slice(2));
        return !isNaN(step) && step > 0 && val % step === 0;
      }
      if (part.includes(",")) {
        return part.split(",").some((sub) => matchField(val, sub, minLimit, maxLimit));
      }
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        return val >= start && val <= end;
      }
      return parseInt(part) === val;
    };

    try {
      const results: { utc: string; local: string }[] = [];
      const cursor = new Date();
      cursor.setSeconds(0, 0);
      cursor.setMinutes(cursor.getMinutes() + 1); // Start from next minute

      let iterations = 0;
      const MAX_ITERATIONS = 50000; // safety ceiling

      while (results.length < 10 && iterations < MAX_ITERATIONS) {
        iterations++;
        const curMin = cursor.getUTCMinutes();
        const curHour = cursor.getUTCHours();
        const curDom = cursor.getUTCDate();
        const curMonth = cursor.getUTCMonth() + 1; // 1-12
        const curDow = cursor.getUTCDay(); // 0-6

        const mMatch = matchField(curMin, minPart, 0, 59);
        const hMatch = matchField(curHour, hourPart, 0, 23);
        const domMatch = matchField(curDom, domPart, 1, 31);
        const monMatch = matchField(curMonth, monthPart, 1, 12);
        const dowMatch = matchField(curDow, dowPart, 0, 6);

        if (mMatch && hMatch && domMatch && monMatch && dowMatch) {
          results.push({
            utc: cursor.toUTCString(),
            local: cursor.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
          });
        }

        cursor.setMinutes(cursor.getMinutes() + 1);
      }

      if (results.length === 0) {
        return { runs: [], isValid: false, errorMsg: "No scheduled execution found within the next 35 days." };
      }

      return { runs: results, isValid: true, errorMsg: "" };
    } catch (e: any) {
      return { runs: [], isValid: false, errorMsg: e.message || "Failed to parse cron schedule" };
    }
  }, [expression]);

  const handleCopy = async () => {
    if (!isValid || runs.length === 0) return;
    const text = `Next 10 Scheduled Runs for [${expression}]:\n` + runs.map((r, i) => `${i + 1}. ${r.utc} (Local: ${r.local})`).join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setExpression(p.exp)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              expression === p.exp
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-sm">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Crontab Expression (5 Fields)
        </label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="* * * * *"
          className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-[10px] text-muted-foreground font-mono">Minute Hour Day Month Weekday</span>
      </div>

      {/* Output Schedule Table */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-500" />
            Upcoming 10 Scheduled Executions
          </h4>
          <button
            onClick={handleCopy}
            disabled={!isValid || runs.length === 0}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Schedule"}</span>
          </button>
        </div>

        {isValid ? (
          <div className="space-y-2">
            {runs.map((r, i) => (
              <div
                key={i}
                className="p-2.5 bg-card rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="font-bold text-foreground">{r.utc}</span>
                </div>
                <span className="text-muted-foreground text-[11px] font-sans">Local: {r.local}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
