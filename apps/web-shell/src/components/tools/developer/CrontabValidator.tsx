"use client";

import { useState } from "react";
import { Clock, Copy, Check, Sparkles, Terminal, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { label: "Every Minute", min: "*", hr: "*", dom: "*", mon: "*", dow: "*" },
  { label: "Every 5 Minutes", min: "*/5", hr: "*", dom: "*", mon: "*", dow: "*" },
  { label: "Every 15 Minutes", min: "*/15", hr: "*", dom: "*", mon: "*", dow: "*" },
  { label: "Hourly at :00", min: "0", hr: "*", dom: "*", mon: "*", dow: "*" },
  { label: "Daily at Midnight (00:00)", min: "0", hr: "0", dom: "*", mon: "*", dow: "*" },
  { label: "Daily at 3:00 AM", min: "0", hr: "3", dom: "*", mon: "*", dow: "*" },
  { label: "Weekly on Sunday (00:00)", min: "0", hr: "0", dom: "*", mon: "*", "dow": "0" },
  { label: "Monthly on 1st at Midnight", min: "0", hr: "0", dom: "1", mon: "*", dow: "*" },
];

export function CrontabValidator() {
  const [minute, setMinute] = useState<string>("0");
  const [hour, setHour] = useState<string>("2");
  const [dayOfMonth, setDayOfMonth] = useState<string>("*");
  const [month, setMonth] = useState<string>("*");
  const [dayOfWeek, setDayOfWeek] = useState<string>("*");
  const [command, setCommand] = useState<string>("/usr/local/bin/backup.sh >> /var/log/backup.log 2>&1");
  const [copied, setCopied] = useState<boolean>(false);

  const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  const fullCrontabLine = `${cronExpression} ${command}`;

  const applyPreset = (p: typeof PRESETS[0]) => {
    setMinute(p.min);
    setHour(p.hr);
    setDayOfMonth(p.dom);
    setMonth(p.mon);
    setDayOfWeek(p.dow);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(fullCrontabLine);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Interval Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="px-3 py-1 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 5 Field Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-card border border-border rounded-xl space-y-1.5">
          <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Minute (0-59)</label>
          <input
            type="text"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono text-center text-sm font-bold bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1.5">
          <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Hour (0-23)</label>
          <input
            type="text"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono text-center text-sm font-bold bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1.5">
          <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Day of Month (1-31)</label>
          <input
            type="text"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono text-center text-sm font-bold bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1.5">
          <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Month (1-12)</label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono text-center text-sm font-bold bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1.5 col-span-2 sm:col-span-1">
          <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Day of Week (0-6)</label>
          <input
            type="text"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono text-center text-sm font-bold bg-background border border-border rounded-lg"
          />
        </div>
      </div>

      {/* Command to Execute */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Shell Command to Execute
        </label>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="/path/to/script.sh"
          className="w-full px-3 py-2 font-mono text-xs bg-background border border-border rounded-lg text-foreground"
        />
      </div>

      {/* Generated Crontab Line Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-500" />
            Complete Crontab File Line
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Crontab"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {fullCrontabLine}
        </pre>
        <p className="text-[11px] text-muted-foreground">
          Paste directly into your server using <code className="font-mono text-foreground">crontab -e</code>.
        </p>
      </div>
    </div>
  );
}
