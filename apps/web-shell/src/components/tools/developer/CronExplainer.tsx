"use client";

import { useState, useMemo } from "react";
import { Clock, Copy, Check, Sparkles, HelpCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const EXAMPLES = [
  { exp: "*/15 9-17 * * 1-5", label: "Every 15 min during business hours (Mon-Fri)" },
  { exp: "0 0 * * *", label: "Every day at midnight (00:00)" },
  { exp: "30 2 * * 0", label: "Every Sunday at 02:30 AM" },
  { exp: "0 12 1 * *", label: "At 12:00 PM on the 1st of every month" },
  { exp: "0 */2 * * *", label: "Every 2 hours on the hour" },
];

export function CronExplainer() {
  const [cronInput, setCronInput] = useState<string>("*/15 9-17 * * 1-5");
  const [copied, setCopied] = useState<boolean>(false);

  const { explanation, fields, isValid } = useMemo(() => {
    const parts = cronInput.trim().split(/\s+/);
    if (parts.length < 5) {
      return {
        explanation: "Please enter a valid 5-field cron expression (e.g. */15 9-17 * * 1-5).",
        fields: [],
        isValid: false,
      };
    }

    const [min, hour, dom, mon, dow] = parts;

    // Build field descriptions
    const fieldDescs = [
      { name: "Minute", val: min, desc: min === "*" ? "Every minute" : min.startsWith("*/") ? `Every ${min.slice(2)} minutes` : `At minute ${min}` },
      { name: "Hour", val: hour, desc: hour === "*" ? "Every hour" : hour.includes("-") ? `Between ${hour.split("-")[0]}:00 and ${hour.split("-")[1]}:59` : hour.startsWith("*/") ? `Every ${hour.slice(2)} hours` : `At ${hour}:00` },
      { name: "Day of Month", val: dom, desc: dom === "*" ? "Every day of the month" : `On day ${dom}` },
      { name: "Month", val: mon, desc: mon === "*" ? "Every month" : `In month ${mon}` },
      { name: "Day of Week", val: dow, desc: dow === "*" ? "Every day of the week" : dow === "1-5" ? "Monday through Friday" : dow === "0,6" || dow === "6,0" ? "Saturday and Sunday" : `On day ${dow} of week` },
    ];

    // Sentence synthesis
    let sentence = "Runs ";
    if (min.startsWith("*/")) {
      sentence += `every ${min.slice(2)} minutes`;
    } else if (min === "0") {
      sentence += "at the start of the hour";
    } else if (min === "*") {
      sentence += "every minute";
    } else {
      sentence += `at minute ${min}`;
    }

    if (hour.includes("-")) {
      sentence += `, between ${hour.split("-")[0]}:00 and ${hour.split("-")[1]}:59`;
    } else if (hour.startsWith("*/")) {
      sentence += `, every ${hour.slice(2)} hours`;
    } else if (hour !== "*") {
      sentence += `, at ${hour.padStart(2, "0")}:${min !== "*" && !min.startsWith("*/") ? min.padStart(2, "0") : "00"}`;
    }

    if (dom !== "*") {
      sentence += `, on day ${dom} of the month`;
    }

    if (mon !== "*") {
      sentence += `, in month ${mon}`;
    }

    if (dow === "1-5") {
      sentence += ", Monday through Friday";
    } else if (dow === "0,6" || dow === "6,0") {
      sentence += ", Saturday and Sunday";
    } else if (dow !== "*") {
      sentence += `, on day-of-week ${dow}`;
    } else if (dom === "*") {
      sentence += ", every day";
    }

    sentence += ".";

    return {
      explanation: sentence,
      fields: fieldDescs,
      isValid: true,
    };
  }, [cronInput]);

  const handleCopy = async () => {
    const summary = `Cron Expression: ${cronInput}\nPlain English Meaning: "${explanation}"`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Enter 5-Field Cron Expression
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cronInput}
            onChange={(e) => setCronInput(e.target.value)}
            placeholder="* * * * *"
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1">
          <span>Presets:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.exp}
              onClick={() => setCronInput(ex.exp)}
              className="hover:underline text-blue-600 dark:text-blue-400"
            >
              {ex.exp}
            </button>
          ))}
        </div>
      </div>

      {/* English Meaning Card */}
      <div className="p-6 bg-muted/30 border border-border rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-500" />
            Plain English Schedule
          </span>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Meaning"}</span>
          </button>
        </div>

        <p className="text-xl sm:text-2xl font-bold text-foreground leading-relaxed">
          "{explanation}"
        </p>
      </div>

      {/* 5-Field Breakdown Grid */}
      {isValid && fields.length === 5 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          {fields.map((f) => (
            <div key={f.name} className="p-3 bg-card border border-border rounded-xl space-y-1 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold block">{f.name}</span>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{f.val}</p>
              <span className="text-[10px] text-muted-foreground font-sans block truncate">{f.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
