'use client';

import React, { useState, useMemo } from 'react';
import { Terminal, Shield, Activity, Copy, Check, ExternalLink, Code2, Server } from 'lucide-react';

export function CronToCronitorHeartbeatConverter() {
  const [crontabLine, setCrontabLine] = useState<string>(
    '0 4 * * 1-5 /opt/scripts/db-backup.sh --full > /var/log/backup.log 2>&1'
  );
  const [monitorKey, setMonitorKey] = useState<string>('database-backup-prod');
  const [apiKey, setApiKey] = useState<string>('d9a4b8c2f1e0');
  const [environment, setEnvironment] = useState<string>('production');
  const [graceSeconds, setGraceSeconds] = useState<number>(300);
  const [activeTab, setActiveTab] = useState<'cli' | 'curl' | 'bash' | 'python' | 'node'>('cli');
  const [copied, setCopied] = useState(false);

  // Parse Crontab Line into Schedule and Command
  const parsed = useMemo(() => {
    const trimmed = crontabLine.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return {
        schedule: '* * * * *',
        command: '/bin/echo "running job"',
        valid: false
      };
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length >= 6) {
      const schedule = parts.slice(0, 5).join(' ');
      const command = parts.slice(5).join(' ');
      return { schedule, command, valid: true };
    }

    return {
      schedule: '* * * * *',
      command: trimmed,
      valid: false
    };
  }, [crontabLine]);

  // Code Generations for different methods
  const snippets = useMemo(() => {
    const { schedule, command } = parsed;

    // 1. Cronitor CLI `cronitor exec`
    const cliCronLine = `${schedule} cronitor exec ${monitorKey} -- ${command}`;

    // 2. Pure cURL wrapper inline in crontab
    const curlCronLine = `${schedule} curl -sS -m 10 "https://cronitor.link/p/${apiKey}/${monitorKey}?state=run" && (${command}) && curl -sS -m 10 "https://cronitor.link/p/${apiKey}/${monitorKey}?state=complete" || curl -sS -m 10 "https://cronitor.link/p/${apiKey}/${monitorKey}?state=fail"`;

    // 3. Robust Bash wrapper script
    const bashScript = `#!/usr/bin/env bash
# Cronitor Heartbeat Wrapper for: ${monitorKey}
# Generated automatically by UTL.tools
set -euo pipefail

CRONITOR_KEY="${monitorKey}"
CRONITOR_URL="https://cronitor.link/p/${apiKey}/$CRONITOR_KEY"

# Send Run ping
curl -sS -m 10 "$CRONITOR_URL?state=run&env=${environment}" > /dev/null 2>&1 || true

START_TIME=$(date +%s)

# Error Trap for Failure Ping
trap 'EXIT_CODE=$?; DURATION=$(( $(date +%s) - START_TIME )); curl -sS -m 10 "$CRONITOR_URL?state=fail&env=${environment}&code=$EXIT_CODE&metrics[duration]=$DURATION" > /dev/null 2>&1 || true; exit $EXIT_CODE' ERR

# Execute payload
${command}

# Send Complete ping
DURATION=$(( $(date +%s) - START_TIME ))
curl -sS -m 10 "$CRONITOR_URL?state=complete&env=${environment}&metrics[duration]=$DURATION" > /dev/null 2>&1 || true
`;

    // 4. Python Cronitor snippet
    const pythonScript = `import cronitor
import subprocess
import time

cronitor.api_key = "${apiKey}"
cronitor.environment = "${environment}"

# Initialize Monitor
monitor = cronitor.Monitor("${monitorKey}")

monitor.ping(state="run")
start_time = time.time()

try:
    # Execute crontab command
    res = subprocess.run("""${command}""", shell=True, check=True)
    duration = time.time() - start_time
    monitor.ping(state="complete", metrics={"duration": duration})
except subprocess.CalledProcessError as e:
    duration = time.time() - start_time
    monitor.ping(state="fail", message=str(e), metrics={"duration": duration})
    raise
`;

    // 5. Node.js Cronitor snippet
    const nodeScript = `const cronitor = require('cronitor')('${apiKey}');
const { execSync } = require('child_process');

cronitor.environment = '${environment}';

async function runMonitoredJob() {
  const monitor = new cronitor.Monitor('${monitorKey}');
  await monitor.ping({ state: 'run' });
  const start = Date.now();

  try {
    execSync('${command.replace(/'/g, "\\'")}', { stdio: 'inherit' });
    const duration = (Date.now() - start) / 1000;
    await monitor.ping({ state: 'complete', metrics: { duration } });
  } catch (err) {
    const duration = (Date.now() - start) / 1000;
    await monitor.ping({ state: 'fail', message: err.message, metrics: { duration } });
    process.exit(1);
  }
}

runMonitoredJob();
`;

    return {
      cli: cliCronLine,
      curl: curlCronLine,
      bash: bashScript,
      python: pythonScript,
      node: nodeScript
    };
  }, [parsed, monitorKey, apiKey, environment]);

  const currentSnippet = snippets[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Crontab to Cronitor Telemetry Converter</h1>
            <p className="text-sm text-slate-400">
              Wrap cron jobs with Cronitor heartbeat monitoring, dead man's switch telemetry, and error traps via CLI, cURL, Bash, Python, or Node.js.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-violet-400" />
            <span>Cron Job & Monitor Configuration</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Existing Crontab Entry</label>
            <textarea
              rows={3}
              value={crontabLine}
              onChange={(e) => setCrontabLine(e.target.value)}
              placeholder="0 4 * * 1-5 /opt/scripts/backup.sh > /dev/null 2>&1"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Monitor Key / Code</label>
              <input
                type="text"
                value={monitorKey}
                onChange={(e) => setMonitorKey(e.target.value)}
                placeholder="db-backup-prod"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cronitor API / Ping Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="d9a4b8c2f1e0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              >
                <option value="production">production</option>
                <option value="staging">staging</option>
                <option value="development">development</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Grace Period (Sec)</label>
              <input
                type="number"
                min="0"
                step="30"
                value={graceSeconds}
                onChange={(e) => setGraceSeconds(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Parsed Info */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-800/60 font-mono">
              <span className="text-slate-400 block mb-1">Detected Schedule:</span>
              <span className="text-emerald-400 font-bold">{parsed.schedule}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-800/60 font-mono">
              <span className="text-slate-400 block mb-1">Extracted Command:</span>
              <span className="text-violet-300 break-all">{parsed.command}</span>
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between text-white space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex space-x-1.5 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('cli')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'cli' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cronitor CLI
                </button>
                <button
                  onClick={() => setActiveTab('curl')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'curl' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Pure cURL
                </button>
                <button
                  onClick={() => setActiveTab('bash')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'bash' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Bash Script
                </button>
                <button
                  onClick={() => setActiveTab('python')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'python' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveTab('node')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'node' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Node.js
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm ml-2 flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-96 leading-relaxed">
              {currentSnippet}
            </pre>
          </div>

          <div className="p-3 bg-violet-950/20 border border-violet-500/20 rounded-xl text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-violet-300 block">Integration Tip:</span>
            {activeTab === 'cli' && (
              <p>Install the Cronitor CLI via <code className="text-violet-300">curl -s https://cronitor.io/install.sh | bash</code>. The CLI automatically captures stderr, exit codes, and execution duration without modifying your crontab script.</p>
            )}
            {activeTab === 'curl' && (
              <p>Pure cURL requires zero dependencies on any Linux/Unix machine. Uses chained <code className="text-violet-300">&amp;&amp;</code> and <code className="text-violet-300">||</code> operators to ping <code className="text-violet-300">run</code>, <code className="text-violet-300">complete</code>, and <code className="text-violet-300">fail</code> states.</p>
            )}
            {activeTab === 'bash' && (
              <p>Save this wrapper as an executable script in <code className="text-violet-300">/opt/cronitor-wrappers/</code> and invoke it from crontab. It traps unhandled errors and computes duration metrics accurately.</p>
            )}
            {activeTab === 'python' && (
              <p>Requires <code className="text-violet-300">pip install cronitor</code>. Can also be used as a function decorator: <code className="text-violet-300">@cronitor.job('{monitorKey}')</code>.</p>
            )}
            {activeTab === 'node' && (
              <p>Requires <code className="text-violet-300">npm install cronitor</code>. Supports promises and async execution tracing.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CronToCronitorHeartbeatConverter;
