"use client";

import { useState, useMemo } from "react";
import { Clock, Calendar, AlertCircle, Copy, Check, Sparkles, Globe } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface CronPreset {
  name: string;
  expr: string;
  desc: string;
}

const PRESETS: CronPreset[] = [
  { name: "Every 5 Minutes", expr: "*/5 * * * *", desc: "Runs at minute 0, 5, 10, 15... every hour" },
  { name: "Every Hour on the Hour", expr: "0 * * * *", desc: "Runs at :00 of every hour" },
  { name: "Daily at Midnight", expr: "0 0 * * *", desc: "Runs every night at 00:00 (12:00 AM)" },
  { name: "Weekdays at 9:00 AM", expr: "0 9 * * 1-5", desc: "Runs Mon-Fri at 09:00 AM" },
  { name: "Every Sunday at Midnight", expr: "0 0 * * 0", desc: "Runs once a week on Sunday at 00:00" },
  { name: "1st Day of Every Month", expr: "0 0 1 * *", desc: "Runs at 00:00 on day 1 of every month" },
];

export function CronScheduleTester() {
  const [expression, setExpression] = useState<string>("0 9 * * 1-5");
  const [useUtc, setUseUtc] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Field parser & Next runs calculator
  const { fields, nextRuns, error, description } = useMemo(() => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      return {
        fields: [],
        nextRuns: [],
        error: "Cron expression must contain exactly 5 space-separated fields (minute, hour, day, month, day-of-week).",
        description: "Invalid format",
      };
    }

    const [minStr, hourStr, domStr, monthStr, dowStr] = parts;

    const parseField = (str: string, minVal: number, maxVal: number): number[] | null => {
      const result = new Set<number>();
      if (str === "*") {
        for (let i = minVal; i <= maxVal; i++) result.add(i);
        return Array.from(result);
      }

      const items = str.split(",");
      for (const item of items) {
        if (item.includes("/")) {
          const [range, stepStr] = item.split("/");
          const step = parseInt(stepStr, 10);
          if (isNaN(step) || step <= 0) return null;
          let start = minVal;
          let end = maxVal;
          if (range !== "*") {
            if (range.includes("-")) {
              const [rStart, rEnd] = range.split("-").map((v) => parseInt(v, 10));
              if (isNaN(rStart) || isNaN(rEnd)) return null;
              start = rStart;
              end = rEnd;
            } else {
              start = parseInt(range, 10);
              if (isNaN(start)) return null;
            }
          }
          for (let i = start; i <= end; i += step) {
            if (i >= minVal && i <= maxVal) result.add(i);
          }
        } else if (item.includes("-")) {
          const [rStart, rEnd] = item.split("-").map((v) => parseInt(v, 10));
          if (isNaN(rStart) || isNaN(rEnd)) return null;
          for (let i = rStart; i <= rEnd; i++) {
            if (i >= minVal && i <= maxVal) result.add(i);
          }
        } else {
          const val = parseInt(item, 10);
          if (isNaN(val) || val < minVal || val > maxVal) return null;
          result.add(val);
        }
      }
      return Array.from(result).sort((a, b) => a - b);
    };

    const validMinutes = parseField(minStr, 0, 59);
    const validHours = parseField(hourStr, 0, 23);
    const validDom = parseField(domStr, 1, 31);
    const validMonths = parseField(monthStr, 1, 12);
    const validDow = parseField(dowStr, 0, 6);

    if (!validMinutes || !validHours || !validDom || !validMonths || !validDow) {
      return {
        fields: [],
        nextRuns: [],
        error: "Invalid field values in expression. Ensure numbers are within standard ranges.",
        description: "Syntax error",
      };
    }

    // Calculate next 10 run timestamps
    const runs: Date[] = [];
    const now = new Date();
    // Start at next minute boundary
    let curr = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);

    let safetyIterations = 0;
    while (runs.length < 10 && safetyIterations < 100000) {
      safetyIterations++;

      const m = useUtc ? curr.getUTCMinutes() : curr.getMinutes();
      const h = useUtc ? curr.getUTCHours() : curr.getHours();
      const dom = useUtc ? curr.getUTCDate() : curr.getDate();
      const month = (useUtc ? curr.getUTCMonth() : curr.getMonth()) + 1;
      const dow = useUtc ? curr.getUTCDay() : curr.getDay();

      if (
        validMonths.includes(month) &&
        validDom.includes(dom) &&
        validDow.includes(dow) &&
        validHours.includes(h) &&
        validMinutes.includes(m)
      ) {
        runs.push(new Date(curr));
      }

      curr.setMinutes(curr.getMinutes() + 1);
    }

    return {
      fields: [
        { label: "Minute", raw: minStr, range: "0–59", matchCount: validMinutes.length },
        { label: "Hour", raw: hourStr, range: "0–23", matchCount: validHours.length },
        { label: "Day of Month", raw: domStr, range: "1–31", matchCount: validDom.length },
        { label: "Month", raw: monthStr, range: "1–12", matchCount: validMonths.length },
        { label: "Day of Week", raw: dowStr, range: "0–6 (Sun–Sat)", matchCount: validDow.length },
      ],
      nextRuns: runs,
      error: null,
      description: `Schedule matches ${validMinutes.length} min(s), ${validHours.length} hr(s), ${validDow.length} day(s) of week.`,
    };
  }, [expression, useUtc]);

  const handleCopy = async () => {
    let summary = `Cron Schedule: ${expression} (${useUtc ? "UTC" : "Local Time"})\n`;
    nextRuns.forEach((r, idx) => {
      summary += `${idx + 1}. ${useUtc ? r.toUTCString() : r.toLocaleString()}\n`;
    });
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Common Cron Presets:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setExpression(p.expr)}
              className={`p-2 rounded-lg border text-left transition-all ${
                expression === p.expr
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-foreground font-bold"
                  : "border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-xs font-mono font-bold block truncate">{p.expr}</span>
              <span className="text-[10px] text-muted-foreground block truncate mt-0.5">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Cron Expression (5-Field Standard Crontab)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUseUtc(!useUtc)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                useUtc
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{useUtc ? "Timezone: UTC" : "Timezone: Local"}</span>
            </button>
          </div>
        </div>

        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="* * * * *"
          className="w-full px-4 py-2.5 text-base sm:text-lg font-mono font-bold bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
        />

        {error ? (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Field-by-Field Breakdown */}
      {fields.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {fields.map((f, i) => (
            <div key={i} className="p-3 bg-card border border-border rounded-xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">{f.label}</span>
              <p className="text-lg font-mono font-extrabold text-blue-600 dark:text-blue-400">{f.raw}</p>
              <span className="text-[9px] font-mono text-muted-foreground block">Allowed: {f.range}</span>
            </div>
          ))}
        </div>
      )}

      {/* Next 10 Runs List */}
      {nextRuns.length > 0 && (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              Next 10 Scheduled Execution Runs ({useUtc ? "UTC" : "Local Browser Time"})
            </h4>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Schedule"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {nextRuns.map((r, idx) => (
              <div
                key={idx}
                className="p-3 bg-card rounded-lg border border-border flex items-center justify-between text-xs font-mono"
              >
                <span className="text-muted-foreground font-bold w-6">#{idx + 1}</span>
                <span className="text-foreground font-semibold">
                  {useUtc ? r.toUTCString() : r.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">Scheduled</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
