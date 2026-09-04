'use client';

import React, { useState, useId } from 'react';
import {
  Clock,
  Terminal,
  Activity,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  FileCode,
  Layers,
  Info
} from 'lucide-react';

interface CronHCPreset {
  name: string;
  cronExpr: string;
  command: string;
  pingUuid: string;
  graceMinutes: number;
}

const PRESETS: CronHCPreset[] = [
  {
    name: 'Nightly Postgres DB Backup',
    cronExpr: '0 2 * * *',
    command: '/usr/local/bin/backup-postgres.sh --gzip',
    pingUuid: '550e8400-e29b-41d4-a716-446655440000',
    graceMinutes: 60,
  },
  {
    name: '15-Minute Stripe Webhook Sync',
    cronExpr: '*/15 * * * *',
    command: 'python /opt/app/sync_stripe_events.py',
    pingUuid: '7b9c6f2a-11e4-48f5-932d-3c9902641bce',
    graceMinutes: 15,
  },
  {
    name: 'Daily Let\'s Encrypt Cert Renewal',
    cronExpr: '30 3 * * 1',
    command: 'certbot renew --quiet --post-hook "systemctl reload nginx"',
    pingUuid: '9e41b2aa-872f-4124-b150-a92c421712bb',
    graceMinutes: 120,
  },
  {
    name: 'Hourly Search Index Pruning',
    cronExpr: '0 * * * *',
    command: 'node /srv/indexer/prune_stale.mjs',
    pingUuid: '312fd8a9-4673-455b-80a1-9a72df910243',
    graceMinutes: 30,
  },
];

export function CronToHealthchecksConverter() {
  const cronInputId = useId();
  const commandInputId = useId();
  const uuidInputId = useId();
  const graceInputId = useId();

  const [cronExpr, setCronExpr] = useState<string>('0 2 * * *');
  const [command, setCommand] = useState<string>('/usr/local/bin/backup-postgres.sh --gzip');
  const [pingUuid, setPingUuid] = useState<string>('550e8400-e29b-41d4-a716-446655440000');
  const [graceMinutes, setGraceMinutes] = useState<number>(60);
  const [activeTab, setActiveTab] = useState<'bash' | 'cronline' | 'systemd' | 'k8s'>('bash');
  const [copied, setCopied] = useState<boolean>(false);

  const cleanUuid = pingUuid.trim().replace(/^https?:\/\/hc-ping\.com\//, '');
  const baseUrl = `https://hc-ping.com/${cleanUuid}`;

  // Generated Hardened Bash Script
  const bashScript = `#!/usr/bin/env bash
# ==============================================================================
# Healthchecks.io Hardened Wrapper Script
# Schedule: ${cronExpr} | Grace: ${graceMinutes}m
# Target:   ${command}
# ==============================================================================
set -Eeuo pipefail

PING_URL="${baseUrl}"
LOG_FILE=$(mktemp)

cleanup() {
  rm -f "$LOG_FILE"
}
trap cleanup EXIT

# 1. Send /start ping to signal execution has begun (measuring duration)
curl -fsS -m 10 --retry 3 "\${PING_URL}/start" >/dev/null 2>&1 || true

# 2. Execute target command and capture combined stdout/stderr
START_TIME=$(date +%s)
set +e
${command} > "$LOG_FILE" 2>&1
EXIT_CODE=$?
set -e
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# 3. Report completion status with last 10KB of output log
if [ $EXIT_CODE -eq 0 ]; then
  # Success ping
  tail -c 10000 "$LOG_FILE" | curl -fsS -m 10 --retry 3 --data-binary @- "\${PING_URL}" >/dev/null
else
  # Failure ping with non-zero exit status code
  tail -c 10000 "$LOG_FILE" | curl -fsS -m 10 --retry 3 --data-binary @- "\${PING_URL}/\${EXIT_CODE}" >/dev/null
  exit $EXIT_CODE
fi
`;

  // Inline Crontab Line
  const crontabLine = `${cronExpr} curl -fsS -m 10 --retry 3 "${baseUrl}/start" && ${command} && curl -fsS -m 10 --retry 3 "${baseUrl}" || curl -fsS -m 10 --retry 3 "${baseUrl}/fail"`;

  // Systemd Service & Timer
  const systemdService = `# /etc/systemd/system/job-${cleanUuid.slice(0, 8)}.service
[Unit]
Description=Healthchecks Monitored Job
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
ExecStartPre=/usr/bin/curl -fsS -m 10 --retry 3 ${baseUrl}/start
ExecStart=${command}
ExecStopPost=/usr/bin/curl -fsS -m 10 --retry 3 ${baseUrl}/$SERVICE_RESULT

# /etc/systemd/system/job-${cleanUuid.slice(0, 8)}.timer
[Unit]
Description=Timer for Monitored Job

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
`;

  // Kubernetes CronJob Manifest
  const k8sCronJob = `apiVersion: batch/v1
kind: CronJob
metadata:
  name: hc-job-${cleanUuid.slice(0, 8)}
spec:
  schedule: "${cronExpr}"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: runner
            image: alpine:latest
            command: ["/bin/sh", "-c"]
            args:
              - |
                wget -q -O - "${baseUrl}/start" || true
                if ${command}; then
                  wget -q -O - "${baseUrl}"
                else
                  wget -q -O - "${baseUrl}/fail"
                  exit 1
                fi
`;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'bash':
        return bashScript;
      case 'cronline':
        return crontabLine;
      case 'systemd':
        return systemdService;
      case 'k8s':
        return k8sCronJob;
      default:
        return bashScript;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (p: CronHCPreset) => {
    setCronExpr(p.cronExpr);
    setCommand(p.command);
    setPingUuid(p.pingUuid);
    setGraceMinutes(p.graceMinutes);
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

      {/* Main Grid: Config Inputs + Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Heartbeat & Job Configuration
          </h3>

          <div>
            <label htmlFor={cronInputId} className="block text-xs font-medium text-slate-400 mb-1">
              Cron Schedule Expression
            </label>
            <input
              id={cronInputId}
              type="text"
              value={cronExpr}
              onChange={(e) => setCronExpr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              placeholder="0 2 * * *"
            />
          </div>

          <div>
            <label htmlFor={commandInputId} className="block text-xs font-medium text-slate-400 mb-1">
              Shell Command to Execute & Monitor
            </label>
            <input
              id={commandInputId}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              placeholder="/usr/local/bin/backup.sh"
            />
          </div>

          <div>
            <label htmlFor={uuidInputId} className="block text-xs font-medium text-slate-400 mb-1">
              Healthchecks Ping UUID or Full URL
            </label>
            <input
              id={uuidInputId}
              type="text"
              value={pingUuid}
              onChange={(e) => setPingUuid(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              placeholder="https://hc-ping.com/your-uuid-here"
            />
          </div>

          <div>
            <label htmlFor={graceInputId} className="block text-xs font-medium text-slate-400 mb-1">
              Recommended Grace Period (Minutes)
            </label>
            <input
              id={graceInputId}
              type="number"
              min="1"
              max="1440"
              value={graceMinutes}
              onChange={(e) => setGraceMinutes(Number(e.target.value) || 15)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Hardened Features Included
            </span>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Automatic <code>/start</code> duration tracking</li>
              <li>Exit status propagation (<code>/0</code> vs <code>/fail</code>)</li>
              <li>Last 10KB log upload via <code>--data-binary</code></li>
              <li>Network timeouts (<code>-m 10 --retry 3</code>)</li>
            </ul>
          </div>
        </div>

        {/* Right Output Tabs & Code Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            {/* Format Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('bash')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'bash'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hardened Bash Script
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cronline')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'cronline'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Inline Crontab
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('systemd')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'systemd'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Systemd Timer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('k8s')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'k8s'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                K8s CronJob
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                {activeTab === 'bash' && 'runner-healthcheck.sh'}
                {activeTab === 'cronline' && 'crontab -e'}
                {activeTab === 'systemd' && 'systemd.service + .timer'}
                {activeTab === 'k8s' && 'cronjob-manifest.yaml'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Client-Side Pure Static
              </span>
            </div>
            <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
              <code>{getActiveCode()}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          Dead Man&apos;s Switch Monitoring Principles
        </h4>
        <p>
          Unlike active monitors that probe an open HTTP port from the outside, Healthchecks.io acts as a passive &quot;dead man&apos;s switch&quot; listening for inbound pings. If your background cron job fails to send a ping within the scheduled window plus grace period, an alert fires via Slack, PagerDuty, email, or SMS.
        </p>
      </div>
    </div>
  );
}

export default CronToHealthchecksConverter;

