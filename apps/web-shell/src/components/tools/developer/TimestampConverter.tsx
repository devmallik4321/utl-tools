"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Clock, Calendar, ArrowRight, Play } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function TimestampConverter() {
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [inputEpoch, setInputEpoch] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const parseEpochToDate = (epochStr: string): Date | null => {
    const num = parseInt(epochStr.trim());
    if (isNaN(num)) return null;
    // Check if milliseconds (13 digits) or seconds (10 digits)
    const ms = epochStr.trim().length >= 13 ? num : num * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  };

  const parsedDate = parseEpochToDate(inputEpoch);

  const getRelativeTime = (d: Date | null): string => {
    if (!d) return "Invalid date";
    const now = Date.now();
    const diffSeconds = Math.round((d.getTime() - now) / 1000);
    const absSec = Math.abs(diffSeconds);

    const isPast = diffSeconds < 0;
    if (absSec < 60) return `${absSec} seconds ${isPast ? "ago" : "from now"}`;
    if (absSec < 3600) return `${Math.round(absSec / 60)} minutes ${isPast ? "ago" : "from now"}`;
    if (absSec < 86400) return `${Math.round(absSec / 3600)} hours ${isPast ? "ago" : "from now"}`;
    return `${Math.round(absSec / 86400)} days ${isPast ? "ago" : "from now"}`;
  };

  const handleConvertDateToEpoch = () => {
    const d = new Date(inputDate);
    if (!isNaN(d.getTime())) {
      setInputEpoch(Math.floor(d.getTime() / 1000).toString());
    }
  };

  const handleCopy = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Current Epoch Banner */}
      <div className="p-5 bg-card border border-border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Current Unix Epoch (Live Ticking)
            </span>
            <p className="text-2xl font-black font-mono text-foreground">{currentEpoch}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setInputEpoch(currentEpoch.toString())}
          className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg border border-border transition-colors"
        >
          Use Current Timestamp
        </button>
      </div>

      {/* Converter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Epoch to Date */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Enter Unix Timestamp (Seconds or Milliseconds)
            </label>
            <input
              type="text"
              value={inputEpoch}
              onChange={(e) => setInputEpoch(e.target.value)}
              placeholder="e.g. 1718000000"
              className="w-full px-3 py-2.5 font-mono text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {parsedDate ? (
            <div className="space-y-2.5 pt-2 border-t border-border font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-muted/40">
                <span className="text-muted-foreground">UTC Format:</span>
                <span className="font-bold text-foreground">{parsedDate.toUTCString()}</span>
                <button onClick={() => handleCopy(parsedDate.toUTCString(), "utc")}>
                  {copiedKey === "utc" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-muted/40">
                <span className="text-muted-foreground">Local Time:</span>
                <span className="font-bold text-foreground">{parsedDate.toString().slice(0, 33)}</span>
                <button onClick={() => handleCopy(parsedDate.toString(), "local")}>
                  {copiedKey === "local" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-muted/40">
                <span className="text-muted-foreground">ISO-8601:</span>
                <span className="font-bold text-foreground">{parsedDate.toISOString()}</span>
                <button onClick={() => handleCopy(parsedDate.toISOString(), "iso")}>
                  {copiedKey === "iso" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-muted/40">
                <span className="text-muted-foreground">Relative:</span>
                <span className="font-bold text-foreground font-sans">{getRelativeTime(parsedDate)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-500">Invalid Unix epoch value.</p>
          )}
        </div>

        {/* Date to Epoch */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Convert Human Date to Epoch
            </label>
            <input
              type="datetime-local"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleConvertDateToEpoch}
            className="w-full py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <span>Convert to Timestamp</span>
          </button>

          <div className="pt-2 border-t border-border space-y-2 font-mono text-xs">
            <div className="p-2 rounded bg-muted/40 flex items-center justify-between">
              <span className="text-muted-foreground">Seconds:</span>
              <span className="font-bold text-foreground">
                {Math.floor(new Date(inputDate).getTime() / 1000) || 0}
              </span>
            </div>

            <div className="p-2 rounded bg-muted/40 flex items-center justify-between">
              <span className="text-muted-foreground">Milliseconds:</span>
              <span className="font-bold text-foreground">
                {new Date(inputDate).getTime() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
