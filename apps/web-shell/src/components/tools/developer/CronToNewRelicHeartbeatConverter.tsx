'use client';

import React, { useState, useMemo } from 'react';
import { Activity, Terminal, Shield, Copy, Check, ExternalLink, Code2 } from 'lucide-react';

export function CronToNewRelicHeartbeatConverter() {
  const [crontabLine, setCrontabLine] = useState<string>(
    '15 3 * * * /opt/scripts/database-vacuum.sh --analyze > /dev/null 2>&1'
  );
  const [insertApiKey, setInsertApiKey] = useState<string>('NRAK-ABC123XYZ456789DEF');
  const [jobName, setJobName] = useState<string>('database-vacuum-prod');
  const [region, setRegion] = useState<'us' | 'eu'>('us');
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

  const endpoint = region === 'us'
    ? 'https://metric-api.newrelic.com/metric/v1'
    : 'https://metric-api.eu.newrelic.com/metric/v1';

  const snippets = useMemo(() => {
    const { schedule, command } = parsed;
    const key = insertApiKey || 'YOUR_NEW_RELIC_INSERT_KEY';

    const curlOneLiner = `${schedule} START=$(date +%s); (${command}) && STATUS="success" || STATUS="failure"; DURATION=$(( $(date +%s) - START )); curl -sS -m 10 -X POST "${endpoint}" -H "Api-Key: ${key}" -H "Content-Type: application/json" -d "[{\\"metrics\\":[{\\"name\\":\\"cron.job.execution\\",\\"type\\":\\"gauge\\",\\"value\\":\$DURATION,\\"attributes\\":{\\"job\\":\\"${jobName}\\",\\"status\\":\\"\$STATUS\\"}}]]" > /dev/null 2>&1`;

    const bashScript = `#!/usr/bin/env bash
# New Relic Cron Telemetry Wrapper for: ${jobName}
set -euo pipefail

NR_API_KEY="${key}"
NR_ENDPOINT="${endpoint}"
JOB_NAME="${jobName}"

START_TIME=$(date +%s)
STATUS="success"
EXIT_CODE=0

# Trap errors to report failure
trap 'EXIT_CODE=$?; STATUS="failure"; send_metric; exit $EXIT_CODE' ERR

send_metric() {
  local DURATION=$(( $(date +%s) - START_TIME ))
  local PAYLOAD='[{"metrics":[{"name":"cron.job.duration_seconds","type":"gauge","value":'\$DURATION',"attributes":{"job":"'\$JOB_NAME'","status":"'\$STATUS'","exit_code":'\$EXIT_CODE'}}]}]'

  curl -sS -m 10 -X POST "$NR_ENDPOINT" \\
    -H "Api-Key: $NR_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d "$PAYLOAD" > /dev/null 2>&1 || true
}

# Run command
${command}

send_metric
`;

    const pythonScript = `import urllib.request
import json
import time
import subprocess
import sys

NR_API_KEY = "${key}"
NR_ENDPOINT = "${endpoint}"
JOB_NAME = "${jobName}"

start_time = time.time()
status = "success"
exit_code = 0

try:
    subprocess.run("""${command}""", shell=True, check=True)
except subprocess.CalledProcessError as e:
    status = "failure"
    exit_code = e.returncode
finally:
    duration = time.time() - start_time
    payload = [{
        "metrics": [{
            "name": "cron.job.duration_seconds",
            "type": "gauge",
            "value": duration,
            "attributes": {
                "job": JOB_NAME,
                "status": status,
                "exit_code": exit_code
            }
        }]
    }]
    
    req = urllib.request.Request(
        NR_ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Api-Key": NR_API_KEY,
            "Content-Type": "application/json"
        }
    )
    try:
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"Failed sending New Relic telemetry: {e}", file=sys.stderr)
        
if exit_code != 0:
    sys.exit(exit_code)
`;

    return {
      curl: curlOneLiner,
      bash: bashScript,
      python: pythonScript
    };
  }, [parsed, insertApiKey, endpoint, jobName]);

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
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Crontab to New Relic Telemetry Converter</h1>
            <p className="text-sm text-slate-400">
              Wrap cron jobs with New Relic Metric API telemetry: track job duration, success/failure status, and alert on missed runs.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Configuration</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Crontab Line</label>
            <textarea
              rows={3}
              value={crontabLine}
              onChange={(e) => setCrontabLine(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Job Name</label>
            <input
              type="text"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. database-vacuum-prod"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Relic API Key</label>
              <input
                type="text"
                value={insertApiKey}
                onChange={(e) => setInsertApiKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                placeholder="NRAK-..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="us">US (metric-api.newrelic.com)</option>
                <option value="eu">EU (metric-api.eu.newrelic.com)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1 font-mono">
            <span className="text-slate-400 block font-sans">Schedule:</span>
            <span className="text-emerald-400">{parsed.schedule}</span>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('curl')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${activeTab === 'curl' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Inline cURL
                </button>
                <button
                  onClick={() => setActiveTab('bash')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${activeTab === 'bash' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Bash Script
                </button>
                <button
                  onClick={() => setActiveTab('python')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${activeTab === 'python' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Python
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-80 leading-relaxed">
              {currentSnippet}
            </pre>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-slate-400">
            Metrics are ingested into New Relic Telemetry Data Platform as <code>cron.job.duration_seconds</code> with NRQL alert capabilities.
          </div>
        </div>
      </div>
    </div>
  );
}

export default CronToNewRelicHeartbeatConverter;
