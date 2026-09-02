"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, Copy, Check, Sparkles, Hourglass, PartyPopper } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CountdownTimer() {
  const [eventName, setEventName] = useState<string>("New Year 2027");
  const [targetDateStr, setTargetDateStr] = useState<string>("2027-01-01T00:00");
  const [now, setNow] = useState<number>(Date.now());
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const targetTime = new Date(targetDateStr).getTime();
  const diffMs = Math.max(0, targetTime - now);

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  const isCompleted = diffMs <= 0;

  const handleCopy = async () => {
    const summary = `Countdown to ${eventName} (${targetDateStr}):\n• ${days} Days, ${hours} Hours, ${minutes} Minutes, ${seconds} Seconds remaining!`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Event or Goal Name
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Event name..."
            className="w-full px-3 py-2 text-sm font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Date &amp; Time
          </label>
          <input
            type="datetime-local"
            value={targetDateStr}
            onChange={(e) => setTargetDateStr(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Countdown Clock Display */}
      <div className="p-6 bg-muted/30 border border-border rounded-2xl space-y-5 text-center">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Hourglass className="w-4 h-4 text-emerald-500" />
            {eventName} Countdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Countdown"}</span>
          </button>
        </div>

        {isCompleted ? (
          <div className="py-8 space-y-2">
            <PartyPopper className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-foreground">The event has arrived!</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-4 bg-card rounded-2xl border border-border space-y-1 shadow-xs">
              <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{days}</p>
              <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Days</span>
            </div>

            <div className="p-4 bg-card rounded-2xl border border-border space-y-1 shadow-xs">
              <p className="text-4xl font-extrabold text-foreground">{hours}</p>
              <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Hours</span>
            </div>

            <div className="p-4 bg-card rounded-2xl border border-border space-y-1 shadow-xs">
              <p className="text-4xl font-extrabold text-foreground">{minutes}</p>
              <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Minutes</span>
            </div>

            <div className="p-4 bg-card rounded-2xl border border-border space-y-1 shadow-xs">
              <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{seconds}</p>
              <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Seconds</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
