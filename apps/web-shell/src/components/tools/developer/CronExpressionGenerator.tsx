"use client";

import { useState } from "react";
import { Clock, Play, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface CronPreset {
  name: string;
  expression: string;
  description: string;
}

const PRESETS: CronPreset[] = [
  { name: "Every Minute", expression: "* * * * *", description: "Runs every minute" },
  { name: "Every 5 Minutes", expression: "*/5 * * * *", description: "Runs every 5 minutes" },
  { name: "Every 15 Minutes", expression: "*/15 * * * *", description: "Runs every 15 minutes" },
  { name: "Every Hour (at :00)", expression: "0 * * * *", description: "Runs at minute 0 of every hour" },
  { name: "Every 6 Hours", expression: "0 */6 * * *", description: "Runs at 00:00, 06:00, 12:00, 18:00" },
  { name: "Daily at Midnight", expression: "0 0 * * *", description: "Runs once a day at 00:00 UTC" },
  { name: "Daily at 08:00 AM", expression: "0 8 * * *", description: "Runs once a day at 08:00 AM" },
  { name: "Every Monday at 9 AM", expression: "0 9 * * 1", description: "Runs every Monday at 09:00 AM" },
  { name: "1st of Every Month", expression: "0 0 1 * *", description: "Runs at 00:00 on day 1 of every month" },
];

export function CronExpressionGenerator() {
  const [minute, setMinute] = useState<string>("*");
  const [hour, setHour] = useState<string>("*");
  const [dayOfMonth, setDayOfMonth] = useState<string>("*");
  const [month, setMonth] = useState<string>("*");
  const [dayOfWeek, setDayOfWeek] = useState<string>("*");
  const [customCron, setCustomCron] = useState<string>("* * * * *");
  const [copied, setCopied] = useState<boolean>(false);

  const cronString = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const handlePresetSelect = (preset: CronPreset) => {
    const parts = preset.expression.split(" ");
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
      setCustomCron(preset.expression);
    }
  };

  const handleCustomCronChange = (val: string) => {
    setCustomCron(val);
    const parts = val.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  };

  // Simple Human-Readable Description Generator
  const getHumanDescription = (m: string, h: string, dom: string, mon: string, dow: string): string => {
    if (m === "*" && h === "*" && dom === "*" && mon === "*" && dow === "*") return "Runs every single minute.";
    if (m.startsWith("*/") && h === "*" && dom === "*" && mon === "*" && dow === "*") return `Runs every ${m.slice(2)} minutes.`;
    if (m === "0" && h.startsWith("*/")) return `Runs at minute 0 every ${h.slice(2)} hours.`;
    if (m === "0" && h === "*") return "Runs at the start of every hour.";
    if (dom === "*" && mon === "*" && dow === "*") return `Runs every day at ${h.padStart(2, "0")}:${m.padStart(2, "0")}.`;
    if (dow !== "*" && dom === "*") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = days[parseInt(dow)] || `Day ${dow}`;
      return `Runs every ${dayName} at ${h.padStart(2, "0")}:${m.padStart(2, "0")}.`;
    }
    if (dom !== "*") return `Runs on day ${dom} of the month at ${h.padStart(2, "0")}:${m.padStart(2, "0")}.`;
    return `Custom cron schedule: "${m} ${h} ${dom} ${mon} ${dow}"`;
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(cronString);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Common Cron Schedule Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handlePresetSelect(p)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                cronString === p.expression
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 5-Field Builder */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-card border border-border rounded-xl space-y-1.5">
          <label className="block text-[11px] font-bold text-muted-foreground uppercase">
            1. Minute (0-59)
          </label>
          <input
            type="text"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-center bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground block text-center">* or */5 or 0,15,30</span>
        </div>

        <div className="p-3.5 bg-card border border-border rounded-xl space-y-1.5">
          <label className="block text-[11px] font-bold text-muted-foreground uppercase">
            2. Hour (0-23)
          </label>
          <input
            type="text"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-center bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground block text-center">* or */2 or 0,12</span>
        </div>

        <div className="p-3.5 bg-card border border-border rounded-xl space-y-1.5">
          <label className="block text-[11px] font-bold text-muted-foreground uppercase">
            3. Day of Month (1-31)
          </label>
          <input
            type="text"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-center bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground block text-center">* or 1,15</span>
        </div>

        <div className="p-3.5 bg-card border border-border rounded-xl space-y-1.5">
          <label className="block text-[11px] font-bold text-muted-foreground uppercase">
            4. Month (1-12)
          </label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-center bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground block text-center">* or 1-12</span>
        </div>

        <div className="p-3.5 bg-card border border-border rounded-xl space-y-1.5 col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-bold text-muted-foreground uppercase">
            5. Day of Week (0-6)
          </label>
          <input
            type="text"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-center bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground block text-center">0=Sun, 1=Mon, 6=Sat</span>
        </div>
      </div>

      {/* Resulting Expression Banner */}
      <div className="p-6 bg-muted/40 border border-border rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Generated Cron Syntax
            </span>
            <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400 tracking-wider">
              {cronString}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-6 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow self-start sm:self-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy Expression"}</span>
          </button>
        </div>

        {/* Human Readable Interpretation */}
        <div className="p-4 bg-card rounded-xl border border-border flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-foreground block">Schedule Description:</span>
            <p className="text-sm text-foreground font-medium mt-0.5">
              {getHumanDescription(minute, hour, dayOfMonth, month, dayOfWeek)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
