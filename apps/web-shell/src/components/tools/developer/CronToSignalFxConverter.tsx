'use client';

import React, { useState, useMemo } from 'react';
import { Activity, Terminal, Shield, Copy, Check, ExternalLink, Code2 } from 'lucide-react';

export function CronToSignalFxConverter() {
  const [crontabLine, setCrontabLine] = useState<string>(
    '0 1 * * * /opt/scripts/export-analytics.sh --delta > /dev/null 2>&1'
  );
  const [accessToken, setAccessToken] = useState<string>('SFX_ACCESS_TOKEN_ABC123');
  const [realm, setRealm] = useState<string>('us0');
  const [metricName, setMetricName] = useState<string>('cron.job.duration_ms');
  const [jobName, setJobName] = useState<string>('export-analytics-daily');
  const [activeTab, setActiveTab] = useState<'curl' | 'bash' | 'python'>('curl');
  const [copied, setCopied] = useState<boolean>(false);

  const parsed = useMemo(() => {
    const trimmed = crontabLine.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 6) {
      return {
        schedule: parts.slice(0, 5).join(' '),
        command: parts.slice(5).join(' ')
      };
    }
    return {
      schedule: '* * * * *',
      command: trimmed || '/opt/scripts/job.sh'
    };
  }, [crontabLine]);

  const endpoint = `https://ingest.${realm}.signalfx.com/v2/datapoint`;

  const snippets = useMemo(() => {
    const { schedule, command } = parsed;
    const token = accessToken || 'YOUR_SIGNALFX_TOKEN';

    const curlOneLiner = `${schedule} START=$(date +%s%3N); (${command}) && STATUS="ok" || STATUS="error"; DURATION=$(( $(date +%s%3N) - START )); curl -sS -m 10 -X POST "${endpoint}" -H "X-SF-Token: ${token}" -H "Content-Type: application/json" -d "{\\"gauge\\":[{\\"metric\\":\\"${metricName}\\",\\"value\\":\$DURATION,\\"dimensions\\":{\\"job\\":\\"${jobName}\\",\\"status\\":\\"\$STATUS\\"}}]}" > /dev/null 2>&1`;

    const bashScript = `#!/usr/bin/env bash
# Splunk / SignalFx Cron Heartbeat Wrapper
set -euo pipefail

SFX_TOKEN="${token}"
SFX_INGEST="${endpoint}"
JOB="${jobName}"

START_MS=$(date +%s%3N)
STATUS="ok"

send_telemetry() {
  local DURATION=$(( $(date +%s%3N) - START_MS ))
  curl -sS -m 10 -X POST "$SFX_INGEST" \\
    -H "X-SF-Token: $SFX_TOKEN" \\
    -H "Content-Type: application/json" \\
    -d '{
      "gauge": [{
        "metric": "${metricName}",
        "value": '\$DURATION',
        "dimensions": {
          "job": "'\$JOB'",
          "status": "'\$STATUS'"
        }
      }]
    }' > /dev/null 2>&1 || true
}

trap 'STATUS="error"; send_telemetry; exit 1' ERR

${command}

send_telemetry
`;

    const pythonScript = `import urllib.request
import json
import time
import subprocess
import sys

SFX_TOKEN = "${token}"
SFX_URL = "${endpoint}"
JOB = "${jobName}"

start = time.time()
status = "ok"

try:
    subprocess.run("""${command}""", shell=True, check=True)
except subprocess.CalledProcessError as e:
    status = "error"
    sys.exit(e.returncode)
finally:
    duration_ms = (time.time() - start) * 1000
    payload = {
        "gauge": [{
            "metric": "${metricName}",
            "value": duration_ms,
            "dimensions": {"job": JOB, "status": status}
        }]
    }
    req = urllib.request.Request(
        SFX_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"X-SF-Token": SFX_TOKEN, "Content-Type": "application/json"}
    )
    try:
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"SignalFx Ingest Error: {e}", file=sys.stderr)
`;

    return {
      curl: curlOneLiner,
      bash: bashScript,
      python: pythonScript
    };
  }, [parsed, accessToken, endpoint, metricName, jobName]);

  const currentSnippet = snippets[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Crontab to Splunk (SignalFx) Telemetry Converter</h1>
            <p className="text-sm text-slate-400">
              Wrap cron jobs with Splunk Observability Datapoint Ingest API calls: track execution duration in milliseconds and alert on job anomalies.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">SignalFx Configuration</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Crontab Line</label>
            <textarea
              rows={3}
              value={crontabLine}
              onChange={(e) => setCrontabLine(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">SignalFx Access Token</label>
            <input
              type="text"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Realm</label>
              <select
                value={realm}
                onChange={(e) => setRealm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="us0">us0</option>
                <option value="us1">us1</option>
                <option value="eu0">eu0</option>
                <option value="ap0">ap0</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Tag</label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('curl')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${activeTab === 'curl' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveTab('bash')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${activeTab === 'bash' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Bash Wrapper
                </button>
                <button
                  onClick={() => setActiveTab('python')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${activeTab === 'python' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Python
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-80 leading-relaxed">
              {currentSnippet}
            </pre>
          </div>

          <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-xs text-slate-400">
            Datapoints are sent to Splunk Ingest API as gauge metrics with job dimension tags, enabling real-time alerting on cron timeouts or failures.
          </div>
        </div>
      </div>
    </div>
  );
}

export default CronToSignalFxConverter;
