"use client";

import { useState, useMemo } from "react";
import { Clock, Copy, Check, Sparkles, Download, ArrowRightLeft } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TIMESTAMPS = `1772496000
1772582400000
2026-03-03T12:00:00Z
1700000000
1710000000`;

interface ConvertedEntry {
  original: string;
  epochSec: number;
  epochMs: number;
  utcIso: string;
  localStr: string;
  isValid: boolean;
}

export function BatchTimestampConverter() {
  const [inputText, setInputText] = useState<string>(SAMPLE_TIMESTAMPS);
  const [copied, setCopied] = useState<boolean>(false);

  const convertedList = useMemo<ConvertedEntry[]>(() => {
    const lines = inputText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return lines.map((line) => {
      let date: Date | null = null;
      let epochSec = 0;
      let epochMs = 0;

      // Check if pure number
      if (/^\d+$/.test(line)) {
        const num = parseInt(line, 10);
        if (line.length <= 10) {
          // Seconds
          epochSec = num;
          epochMs = num * 1000;
          date = new Date(epochMs);
        } else {
          // Milliseconds or microseconds
          epochMs = num;
          epochSec = Math.floor(num / 1000);
          date = new Date(num);
        }
      } else {
        // Try date parse
        const parsed = Date.parse(line);
        if (!isNaN(parsed)) {
          date = new Date(parsed);
          epochMs = parsed;
          epochSec = Math.floor(parsed / 1000);
        }
      }

      if (date && !isNaN(date.getTime())) {
        return {
          original: line,
          epochSec,
          epochMs,
          utcIso: date.toISOString(),
          localStr: date.toLocaleString(),
          isValid: true,
        };
      } else {
        return {
          original: line,
          epochSec: 0,
          epochMs: 0,
          utcIso: "Invalid Date",
          localStr: "Invalid Date",
          isValid: false,
        };
      }
    });
  }, [inputText]);

  const handleCopyAll = async () => {
    const csvContent = [
      "Original,Epoch (s),Epoch (ms),UTC ISO 8601,Local Time",
      ...convertedList.map(
        (e) => `"${e.original}",${e.epochSec},${e.epochMs},"${e.utcIso}","${e.localStr}"`
      ),
    ].join("\n");

    const ok = await copyToClipboard(csvContent);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCsv = () => {
    const csvContent = [
      "Original,Epoch (s),Epoch (ms),UTC ISO 8601,Local Time",
      ...convertedList.map(
        (e) => `"${e.original}",${e.epochSec},${e.epochMs},"${e.utcIso}","${e.localStr}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted-timestamps-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Paste Timestamps or Dates (One per line)
          </label>
          <span className="text-xs text-muted-foreground">
            {convertedList.length} items parsed
          </span>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={5}
          placeholder="Paste Unix timestamps in seconds/ms or ISO strings..."
          className="w-full px-3 py-2.5 text-xs sm:text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span>Supports: 10-digit Unix (s), 13-digit Unix (ms), ISO 8601, RFC 2822 dates</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="px-3 py-1.5 bg-background border border-border text-foreground text-xs font-bold rounded-lg hover:bg-muted/50 inline-flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied CSV!" : "Copy CSV"}</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 bg-background border border-border text-foreground text-xs font-bold rounded-lg hover:bg-muted/50 inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        <button
          onClick={() => setInputText(`${Math.floor(Date.now() / 1000)}\n${Date.now()}\n${new Date().toISOString()}`)}
          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Insert Current Timestamps</span>
        </button>
      </div>

      {/* Results Table */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3 overflow-hidden">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-500" />
          Batch Converted Timestamp Matrix
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-sans uppercase text-[10px]">
                <th className="py-2 px-3">Original Input</th>
                <th className="py-2 px-3">Epoch (s)</th>
                <th className="py-2 px-3">UTC ISO 8601</th>
                <th className="py-2 px-3">Local Formatted Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {convertedList.map((row, idx) => (
                <tr key={idx} className="hover:bg-card/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground max-w-[150px] truncate">
                    {row.original}
                  </td>
                  <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400">
                    {row.isValid ? row.epochSec : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">
                    {row.utcIso}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground font-sans">
                    {row.localStr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
