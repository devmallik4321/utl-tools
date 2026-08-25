"use client";

import { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Activity, Wifi, CheckCircle2, AlertTriangle, XCircle, Gamepad2, Video, PhoneCall, Monitor } from "lucide-react";

interface PingNode {
  name: string;
  url: string;
  region: string;
}

const NODES: PingNode[] = [
  { name: "Cloudflare Edge", url: "https://1.1.1.1/cdn-cgi/trace", region: "Global Anycast" },
  { name: "Google Public DNS", url: "https://dns.google/resolve?name=example.com", region: "Global Anycast" },
  { name: "GitHub CDN", url: "https://github.githubassets.com/favicons/favicon.png", region: "Global Edge" },
  { name: "Wikipedia Foundation", url: "https://en.wikipedia.org/static/favicon/wikipedia.ico", region: "Global CDN" },
];

export function PingTest() {
  const [running, setRunning] = useState<boolean>(false);
  const [pings, setPings] = useState<Record<string, number[]>>({});
  const [activeNode, setActiveNode] = useState<string>("Cloudflare Edge");
  const stopRef = useRef<boolean>(false);

  const measureOnce = async (url: string): Promise<number> => {
    const start = performance.now();
    try {
      await fetch(`${url}?_t=${Date.now()}`, { mode: "no-cors", cache: "no-store" });
      const duration = Math.round(performance.now() - start);
      return duration;
    } catch {
      return Math.round(performance.now() - start);
    }
  };

  const startTest = async () => {
    if (running) return;
    setRunning(true);
    stopRef.current = false;

    const node = NODES.find((n) => n.name === activeNode) || NODES[0];

    for (let i = 0; i < 8; i++) {
      if (stopRef.current) break;
      const latency = await measureOnce(node.url);
      setPings((prev) => {
        const currentList = prev[node.name] || [];
        return {
          ...prev,
          [node.name]: [...currentList, latency],
        };
      });
      // Small pause between pings
      await new Promise((r) => setTimeout(r, 400));
    }

    setRunning(false);
  };

  const stopTest = () => {
    stopRef.current = true;
    setRunning(false);
  };

  const currentList = pings[activeNode] || [];
  const minPing = currentList.length > 0 ? Math.min(...currentList) : 0;
  const maxPing = currentList.length > 0 ? Math.max(...currentList) : 0;
  const avgPing = currentList.length > 0 ? Math.round(currentList.reduce((a, b) => a + b, 0) / currentList.length) : 0;
  const latestPing = currentList.length > 0 ? currentList[currentList.length - 1] : 0;

  // Jitter (mean deviation)
  const jitter = currentList.length > 1
    ? Math.round(
        currentList.slice(1).reduce((acc, val, i) => acc + Math.abs(val - currentList[i]), 0) / (currentList.length - 1)
      )
    : 0;

  const reset = () => {
    stopTest();
    setPings({});
  };

  // Activity suitability evaluation
  const getActivityStatus = (maxMs: number, maxJitter: number) => {
    if (currentList.length === 0) return { label: "Awaiting Test", color: "text-muted-foreground", bg: "bg-muted", status: "idle" };
    if (avgPing <= maxMs && jitter <= maxJitter) {
      return { label: "Excellent", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800", status: "good" };
    }
    if (avgPing <= maxMs * 1.5) {
      return { label: "Moderate / Playable", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800", status: "fair" };
    }
    return { label: "Lag Expected", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800", status: "poor" };
  };

  const gaming = getActivityStatus(45, 15);
  const videoCalls = getActivityStatus(80, 25);
  const streaming = getActivityStatus(100, 40);
  const remoteDesktop = getActivityStatus(60, 20);

  return (
    <div className="space-y-6">
      {/* Node selector & Actions */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Select Edge Test Endpoint
            </label>
            <div className="flex flex-wrap gap-2">
              {NODES.map((n) => (
                <button
                  key={n.name}
                  type="button"
                  onClick={() => setActiveNode(n.name)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    activeNode === n.name
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-background text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {n.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {running ? (
              <button
                type="button"
                onClick={stopTest}
                className="px-5 py-2.5 bg-rose-600 text-white font-semibold text-xs rounded-xl hover:bg-rose-700 transition-colors"
              >
                Stop Test
              </button>
            ) : (
              <button
                type="button"
                onClick={startTest}
                className="px-6 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Ping Test</span>
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="p-2.5 bg-muted hover:bg-muted/80 border border-border rounded-xl text-foreground transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Latency Dashboard KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Latest Ping
          </span>
          <p className="text-3xl font-black font-mono text-foreground">
            {latestPing} <span className="text-sm font-normal text-muted-foreground">ms</span>
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Average Latency
          </span>
          <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
            {avgPing} <span className="text-sm font-normal text-muted-foreground">ms</span>
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Min / Max
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">
            {minPing} / {maxPing} <span className="text-xs text-muted-foreground">ms</span>
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Network Jitter
          </span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            &plusmn;{jitter} <span className="text-xs text-muted-foreground">ms</span>
          </p>
        </div>
      </div>

      {/* Real-Time Activity Suitability Scorecard */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Connection Quality by Activity (Estimate)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-xl border ${gaming.bg} space-y-1`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-blue-500" /> Online Gaming
              </span>
              <span className={`text-[10px] font-bold uppercase ${gaming.color}`}>{gaming.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Requires low latency &lt; 50ms &amp; jitter &lt; 15ms.</p>
          </div>

          <div className={`p-3.5 rounded-xl border ${videoCalls.bg} space-y-1`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-emerald-500" /> Zoom / Calls
              </span>
              <span className={`text-[10px] font-bold uppercase ${videoCalls.color}`}>{videoCalls.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Requires consistent RTT without packet jitter.</p>
          </div>

          <div className={`p-3.5 rounded-xl border ${streaming.bg} space-y-1`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Video className="w-4 h-4 text-purple-500" /> 4K Video Streaming
              </span>
              <span className={`text-[10px] font-bold uppercase ${streaming.color}`}>{streaming.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Buffers smoothly even with moderate latency.</p>
          </div>

          <div className={`p-3.5 rounded-xl border ${remoteDesktop.bg} space-y-1`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-amber-500" /> Remote Desktop
              </span>
              <span className={`text-[10px] font-bold uppercase ${remoteDesktop.color}`}>{remoteDesktop.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Requires responsive mouse/keyboard feedback.</p>
          </div>
        </div>
      </div>

      {/* Real-time packet timeline */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Packet Stream ({currentList.length} samples)
        </span>

        {currentList.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Click 'Run Ping Test' to measure network round-trip time.
          </p>
        ) : (
          <div className="flex items-end gap-2 h-28 pt-4">
            {currentList.map((val, i) => {
              const heightPct = Math.min(100, Math.max(15, (val / (maxPing || 100)) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[10px] font-mono text-muted-foreground">{val}ms</span>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground">#{i + 1}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
