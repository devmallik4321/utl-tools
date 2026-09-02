"use client";

import { useState, useMemo } from "react";
import { Clock, Copy, Check, Plus, Trash2, Sparkles, ArrowRightLeft } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface TimeEntry {
  id: string;
  hours: number;
  minutes: number;
  operation: "add" | "sub";
}

export function TimeDurationCalculator() {
  const [entries, setEntries] = useState<TimeEntry[]>([
    { id: "1", hours: 4, minutes: 45, operation: "add" },
    { id: "2", hours: 2, minutes: 30, operation: "add" },
    { id: "3", hours: 0, minutes: 45, operation: "sub" },
  ]);

  // Elapsed time mode
  const [startTime, setStartTime] = useState<string>("09:15");
  const [endTime, setEndTime] = useState<string>("17:45");
  const [copied, setCopied] = useState<boolean>(false);

  // Math for Time Addition/Subtraction
  const { totalMinutes, finalHours, finalMins, decimalHours } = useMemo(() => {
    let mins = 0;
    entries.forEach((e) => {
      const m = (e.hours || 0) * 60 + (e.minutes || 0);
      if (e.operation === "add") {
        mins += m;
      } else {
        mins -= m;
      }
    });

    const isNeg = mins < 0;
    const absM = Math.abs(mins);
    const h = Math.floor(absM / 60);
    const m = absM % 60;

    return {
      totalMinutes: mins,
      finalHours: isNeg ? -h : h,
      finalMins: m,
      decimalHours: (mins / 60).toFixed(2),
    };
  }, [entries]);

  // Math for Elapsed Time
  const elapsedMinutes = useMemo(() => {
    const [h1, m1] = startTime.split(":").map(Number);
    const [h2, m2] = endTime.split(":").map(Number);
    let diff = h2 * 60 + m2 - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60; // Crosses midnight
    return diff;
  }, [startTime, endTime]);

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const elapsedMins = elapsedMinutes % 60;
  const elapsedDecimal = (elapsedMinutes / 60).toFixed(2);

  const addEntry = () => {
    setEntries([...entries, { id: Date.now().toString(), hours: 1, minutes: 0, operation: "add" }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    setEntries(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof TimeEntry, val: any) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };

  const handleCopy = async () => {
    const summary = `Time Duration Calculation:\n• Total Duration: ${finalHours} Hours, ${finalMins} Minutes\n• Decimal Equivalent: ${decimalHours} Hours\n• Total Minutes: ${totalMinutes} Minutes`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Add / Subtract Multiple Time Spans */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Add &amp; Subtract Time Durations
          </span>
          <button
            onClick={addEntry}
            className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg inline-flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Time Block</span>
          </button>
        </div>

        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2 text-xs font-mono">
              <select
                value={entry.operation}
                onChange={(e) => updateEntry(entry.id, "operation", e.target.value)}
                className="px-2 py-1.5 font-bold bg-background border border-border rounded-lg"
              >
                <option value="add">+ Add</option>
                <option value="sub">- Subtract</option>
              </select>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  value={entry.hours}
                  onChange={(e) => updateEntry(entry.id, "hours", Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 px-2 py-1.5 bg-background border border-border rounded-lg text-center"
                />
                <span className="text-muted-foreground">hrs</span>
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={entry.minutes}
                  onChange={(e) => updateEntry(entry.id, "minutes", Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 px-2 py-1.5 bg-background border border-border rounded-lg text-center"
                />
                <span className="text-muted-foreground">mins</span>
              </div>

              <button
                onClick={() => removeEntry(entry.id)}
                disabled={entries.length <= 1}
                className="text-muted-foreground hover:text-rose-500 disabled:opacity-30 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Result Cards */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-500" />
            Total Combined Time Duration
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Duration"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Clock Duration</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {finalHours}h {finalMins}m
            </p>
            <span className="text-[10px] text-muted-foreground">Hours and minutes</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Decimal Hours</span>
            <p className="text-2xl font-bold font-mono text-foreground">{decimalHours} <span className="text-xs font-normal text-muted-foreground">Hours</span></p>
            <span className="text-[10px] text-muted-foreground">For payroll &amp; billing invoices</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Minutes</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {totalMinutes} <span className="text-xs font-normal text-muted-foreground">Mins</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Raw total minutes</span>
          </div>
        </div>
      </div>

      {/* 2. Elapsed Time Between Two Clock Times */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
          Elapsed Time Between Start &amp; End Times
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-1.5 font-mono bg-background border border-border rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-1.5 font-mono bg-background border border-border rounded-lg text-xs"
            />
          </div>

          <div className="p-2.5 bg-muted/40 rounded-lg border border-border text-xs font-mono">
            <span className="text-[10px] text-muted-foreground block">Elapsed Time:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
              {elapsedHours}h {elapsedMins}m ({elapsedDecimal} hrs)
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
