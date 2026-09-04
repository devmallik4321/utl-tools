"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, Activity, FileCode, Layers, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Every 5 Minutes", cron: "*/5 * * * *" },
  { name: "Hourly at Minute 0", cron: "0 * * * *" },
  { name: "Daily at 3:00 AM", cron: "0 3 * * *" },
  { name: "Weekly on Sunday Midnight", cron: "0 0 * * 0" },
];

export function CronToUptimeKumaConverter() {
  const [cronExpr, setCronExpr] = useState<string>("0 3 * * *");
  const [monitorName, setMonitorName] = useState<string>("Nightly DB Backup Heartbeat");
  const [monitorType, setMonitorType] = useState<"push" | "http">("push");
  const [pushToken, setPushToken] = useState<string>("abc123xyz789");
  const [kumaHost, setKumaHost] = useState<string>("https://uptime.example.com");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { kumaJson, bashSnippet, terraformCode } = useMemo(() => {
    const name = monitorName.trim() || "Cron Job Monitor";
    const host = kumaHost.trim().replace(/\/$/, "") || "https://uptime.example.com";
    const token = pushToken.trim() || "TOKEN_ABC123";
    const sched = cronExpr.trim() || "0 3 * * *";

    const jsonConfig = {
      name: name,
      type: monitorType,
      cron: sched,
      interval: 60,
      retryInterval: 60,
      maxretries: 2,
      resendInterval: 0,
      notificationIDList: [],
      ...(monitorType === "push"
        ? { pushToken: token }
        : { url: `${host}/health`, method: "GET" }),
    };

    const bash = `# Paste at the end of your bash script or crontab:
curl -fsS -m 10 --retry 3 "${host}/api/push/${token}?status=up&msg=OK&ping="`;

    const tf = `resource "uptimekuma_monitor" "${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}" {
  name        = "${name}"
  type        = "${monitorType}"
  cron        = "${sched}"
  interval    = 60
  max_retries = 2

  ${monitorType === "push" ? `push_token  = "${token}"` : `url         = "${host}/health"\n  method      = "GET"`}
}`;

    return {
      kumaJson: JSON.stringify(jsonConfig, null, 2),
      bashSnippet: bash,
      terraformCode: tf,
    };
  }, [cronExpr, monitorName, monitorType, pushToken, kumaHost]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setCronExpr(p.cron)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              cronExpr === p.cron
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Cron Expression
          </label>
          <input
            type="text"
            value={cronExpr}
            onChange={(e) => setCronExpr(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">min hour day month dow</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monitor Name
          </label>
          <input
            type="text"
            value={monitorName}
            onChange={(e) => setMonitorName(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monitor Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMonitorType("push")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                monitorType === "push" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              Push Heartbeat
            </button>
            <button
              onClick={() => setMonitorType("http")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                monitorType === "http" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              HTTP Poll
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Uptime Kuma Host URL
          </label>
          <input
            type="text"
            value={kumaHost}
            onChange={(e) => setKumaHost(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        {monitorType === "push" && (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Push Token
            </label>
            <input
              type="text"
              value={pushToken}
              onChange={(e) => setPushToken(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
            />
          </div>
        )}
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">
              {monitorType === "push" ? "Crontab Bash Heartbeat Script" : "Uptime Kuma JSON Payload"}
            </span>
            <button
              onClick={() => handleCopy("main", monitorType === "push" ? bashSnippet : kumaJson)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "main" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "main" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all max-h-[280px]">
            {monitorType === "push" ? bashSnippet : kumaJson}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Terraform IaC Definition</span>
            <button
              onClick={() => handleCopy("tf", terraformCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "tf" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "tf" ? "Copied!" : "Copy Terraform"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all max-h-[280px]">
            {terraformCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
