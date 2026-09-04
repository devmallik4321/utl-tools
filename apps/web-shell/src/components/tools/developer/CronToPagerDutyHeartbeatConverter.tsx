'use client';

import React, { useState, useId } from 'react';
import {
  BellRing,
  AlertTriangle,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Layers,
  Info
} from 'lucide-react';

interface PdPreset {
  name: string;
  cronExpr: string;
  command: string;
  routingKey: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
}

const PRESETS: PdPreset[] = [
  {
    name: 'Critical Postgres DB Backup',
    cronExpr: '0 3 * * *',
    command: '/usr/local/bin/backup-pg-prod.sh',
    routingKey: 'pd_prod_routing_key_9021aef45',
    severity: 'critical',
  },
  {
    name: 'Hourly ETL Pipeline Ingestion',
    cronExpr: '0 * * * *',
    command: 'python /opt/etl/run_sync.py',
    routingKey: 'pd_data_eng_key_4412bc900',
    severity: 'error',
  },
  {
    name: 'Nightly Container Vulnerability Scan',
    cronExpr: '30 1 * * *',
    command: 'trivy fs /srv/app --severity HIGH,CRITICAL',
    routingKey: 'pd_secops_key_1109aa782',
    severity: 'warning',
  },
];

export function CronToPagerDutyHeartbeatConverter() {
  const cronId = useId();
  const cmdId = useId();
  const keyId = useId();
  const sevId = useId();

  const [cronExpr, setCronExpr] = useState<string>('0 3 * * *');
  const [command, setCommand] = useState<string>('/usr/local/bin/backup-pg-prod.sh');
  const [routingKey, setRoutingKey] = useState<string>('pd_prod_routing_key_9021aef45');
  const [severity, setSeverity] = useState<'critical' | 'error' | 'warning' | 'info'>('critical');
  const [copied, setCopied] = useState<boolean>(false);

  const bashScript = `#!/usr/bin/env bash
# ==============================================================================
# PagerDuty Events API v2 Hardened Cron Wrapper
# Schedule: ${cronExpr} | Severity: ${severity}
# Target:   ${command}
# ==============================================================================
set -Eeuo pipefail

ROUTING_KEY="${routingKey}"
LOG_FILE=$(mktemp)

cleanup() {
  rm -f "$LOG_FILE"
}
trap cleanup EXIT

send_pd_event() {
  local event_action="$1"
  local summary="$2"
  local details="$3"

  curl -fsS -m 10 --retry 3 \\
    -X POST "https://events.pagerduty.com/v2/enqueue" \\
    -H "Content-Type: application/json" \\
    -d @- <<EOF >/dev/null 2>&1 || true
{
  "routing_key": "\${ROUTING_KEY}",
  "event_action": "\${event_action}",
  "payload": {
    "summary": "\${summary}",
    "source": "$(hostname -f 2>/dev/null || echo 'cron-runner')",
    "severity": "${severity}",
    "component": "cron-scheduler",
    "custom_details": {
      "command": "${command}",
      "output_log": "\${details}"
    }
  }
}
EOF
}

# Execute command
START_TIME=$(date +%s)
set +e
${command} > "$LOG_FILE" 2>&1
EXIT_CODE=$?
set -e
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ $EXIT_CODE -ne 0 ]; then
  ERROR_SNIPPET=$(tail -c 2000 "$LOG_FILE" | tr '\\n' ' ')
  send_pd_event "trigger" "CRON FAILURE: ${command} exited with code \${EXIT_CODE}" "$ERROR_SNIPPET"
  exit $EXIT_CODE
fi
`;

  const applyPreset = (p: PdPreset) => {
    setCronExpr(p.cronExpr);
    setCommand(p.command);
    setRoutingKey(p.routingKey);
    setSeverity(p.severity);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bashScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Presets Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Presets:</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => applyPreset(PRESETS[0])}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-400" />
            PagerDuty Event Configuration
          </h3>

          <div>
            <label htmlFor={cronId} className="block text-xs font-medium text-slate-400 mb-1">
              Cron Schedule
            </label>
            <input
              id={cronId}
              type="text"
              value={cronExpr}
              onChange={(e) => setCronExpr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label htmlFor={cmdId} className="block text-xs font-medium text-slate-400 mb-1">
              Shell Command
            </label>
            <input
              id={cmdId}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label htmlFor={keyId} className="block text-xs font-medium text-slate-400 mb-1">
              PagerDuty Integration / Routing Key
            </label>
            <input
              id={keyId}
              type="text"
              value={routingKey}
              onChange={(e) => setRoutingKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label htmlFor={sevId} className="block text-xs font-medium text-slate-400 mb-1">
              Alert Severity Level
            </label>
            <select
              id={sevId}
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="critical">critical (Paging On-Call Engineer)</option>
              <option value="error">error (High Priority Ticket)</option>
              <option value="warning">warning (Warning Incident)</option>
              <option value="info">info (Informational Log)</option>
            </select>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Hardened PagerDuty Runner Script
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Bash Script'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800/80 max-h-[420px] leading-relaxed">
              <code>{bashScript}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          PagerDuty Events API v2 Incident Triggering
        </h4>
        <p>
          This wrapper catches any non-zero exit status code and uploads the last 2,000 characters of stdout/stderr directly to PagerDuty&apos;s Events API v2 (<code>/v2/enqueue</code>). The on-call on-duty engineer receives the exact failure log immediately in the alert payload.
        </p>
      </div>
    </div>
  );
}

export default CronToPagerDutyHeartbeatConverter;
