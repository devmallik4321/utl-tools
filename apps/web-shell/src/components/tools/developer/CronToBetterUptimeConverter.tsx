"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, ShieldCheck, Clock, Server } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CronToBetterUptimeConverter() {
  const [cronExpr, setCronExpr] = useState<string>("0 3 * * *"); // Daily at 3 AM
  const [heartbeatToken, setHeartbeatToken] = useState<string>("usr_hb_789a42fbc9e");
  const [command, setCommand] = useState<string>("/usr/local/bin/pg_backup.sh --all");
  const [graceMinutes, setGraceMinutes] = useState<number>(10);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    intervalSeconds,
    intervalHuman,
    graceSeconds,
    heartbeatUrl,
    bashWrapper,
    terraformCode,
  } = useMemo(() => {
    let secs = 86400; // default daily
    let human = "Daily (every 24 hours)";

    if (cronExpr.startsWith("*/5")) {
      secs = 300;
      human = "Every 5 minutes";
    } else if (cronExpr.startsWith("*/15")) {
      secs = 900;
      human = "Every 15 minutes";
    } else if (cronExpr.startsWith("*/30")) {
      secs = 1800;
      human = "Every 30 minutes";
    } else if (cronExpr.startsWith("0 *") || cronExpr.startsWith("*/60")) {
      secs = 3600;
      human = "Hourly";
    } else if (cronExpr.includes("* * 0") || cronExpr.includes("* * 7")) {
      secs = 604800;
      human = "Weekly";
    }

    const graceSec = graceMinutes * 60;
    const url = `https://betteruptime.com/api/v1/heartbeat/${heartbeatToken}`;

    const bash = `#!/usr/bin/env bash
# Better Uptime (Better Stack) Cron Heartbeat Wrapper
# Generated with UTL.tools

set -Eeuo pipefail

HEARTBEAT_URL="${url}"

# 1. Signal job started
curl -s -m 10 "\${HEARTBEAT_URL}/start" > /dev/null 2>&1 || true

# 2. Execute target cron job command and measure duration
START_TIME=$(date +%s)
if ${command}; then
  EXIT_CODE=0
else
  EXIT_CODE=$?
fi
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# 3. Send final status ping
if [ "$EXIT_CODE" -eq 0 ]; then
  # Success signal with execution duration telemetry
  curl -s -m 10 "\${HEARTBEAT_URL}?duration=\${DURATION}" > /dev/null 2>&1
else
  # Failure signal (triggers immediate alerting in Better Stack)
  curl -s -m 10 "\${HEARTBEAT_URL}/fail" > /dev/null 2>&1
  exit "$EXIT_CODE"
fi
`;

    const tf = `# Terraform Configuration for Better Uptime Heartbeat Monitor
# Provider: https://registry.terraform.io/providers/BetterStackHQ/better-uptime/latest

resource "betteruptime_heartbeat" "cron_task" {
  name         = "Database Backup Scheduled Task"
  period       = ${secs}
  grace        = ${graceSec}
  email        = true
  push         = true
  sms          = false
  call         = false
}
`;

    return {
      intervalSeconds: secs,
      intervalHuman: human,
      graceSeconds: graceSec,
      heartbeatUrl: url,
      bashWrapper: bash,
      terraformCode: tf,
    };
  }, [cronExpr, heartbeatToken, command, graceMinutes]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(bashWrapper);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Better Uptime (Better Stack) Scheduled Heartbeat Monitor Generator
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Interval: <strong className="text-foreground">{intervalHuman}</strong> • Grace: <strong className="text-foreground">{graceMinutes}m</strong>
        </div>
      </div>

      {/* Input Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Crontab Expression
          </label>
          <input
            type="text"
            value={cronExpr}
            onChange={(e) => setCronExpr(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
            placeholder="0 3 * * *"
          />
          <span className="text-[11px] text-muted-foreground block">
            e.g. 0 3 * * * (Daily at 03:00)
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Heartbeat Token / Slug
          </label>
          <input
            type="text"
            value={heartbeatToken}
            onChange={(e) => setHeartbeatToken(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            placeholder="usr_hb_789a42fbc9e"
          />
          <span className="text-[11px] text-muted-foreground block">
            Token from your Better Stack dashboard
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Grace Period (Minutes)
          </label>
          <input
            type="number"
            min={1}
            max={120}
            value={graceMinutes}
            onChange={(e) => setGraceMinutes(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[11px] text-muted-foreground block">
            Buffer for job runtime variations
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Command to Run
          </label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            placeholder="/path/to/script.sh"
          />
        </div>
      </div>

      {/* Output Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bash Wrapper */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              Hardened Bash Wrapper Script
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Wrapper"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-[340px]">
            {bashWrapper}
          </pre>
        </div>

        {/* Terraform */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Terraform Monitor Resource
            </span>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-[340px]">
            {terraformCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
