"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, AlertTriangle, FileCode, Clock, GitBranch } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Every Night at Midnight UTC", cron: "0 0 * * *" },
  { name: "Every Monday at 9:00 AM UTC", cron: "0 9 * * 1" },
  { name: "Every 6 Hours", cron: "0 */6 * * *" },
  { name: "First of Every Month", cron: "0 0 1 * *" },
  { name: "Every 15 Minutes", cron: "*/15 * * * *" },
];

export function CronToGitHubActionsConverter() {
  const [cronExp, setCronExp] = useState<string>("0 0 * * *");
  const [workflowName, setWorkflowName] = useState<string>("Scheduled Nightly Job");
  const [jobCommand, setJobCommand] = useState<string>("npm test && npm run sync");
  const [copied, setCopied] = useState<boolean>(false);

  const { yamlSnippet, isValidInterval, warningMsg } = useMemo(() => {
    const trimmed = cronExp.trim();
    const parts = trimmed.split(/\s+/);

    let isTooFrequent = false;
    if (parts[0] === "*" || (parts[0].startsWith("*/") && parseInt(parts[0].slice(2)) < 5)) {
      isTooFrequent = true;
    }

    const yaml = `name: "${workflowName}"

on:
  schedule:
    # Triggered automatically via UTC cron schedule
    - cron: '${trimmed}'
  workflow_dispatch: # Allows manual trigger from GitHub UI

jobs:
  scheduled-task:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm ci

      - name: Execute Task
        run: |
          ${jobCommand}
`;

    return {
      yamlSnippet: yaml,
      isValidInterval: !isTooFrequent,
      warningMsg: isTooFrequent
        ? "GitHub Actions limits scheduled workflows to run no more frequently than once every 5 minutes (*/5 * * * *). Shorter intervals may be dropped or delayed."
        : "",
    };
  }, [cronExp, workflowName, jobCommand]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(yamlSnippet);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setCronExp(p.cron)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              cronExp === p.cron
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Cron Expression (UTC)
          </label>
          <input
            type="text"
            value={cronExp}
            onChange={(e) => setCronExp(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Workflow Name
          </label>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Bash Run Command
          </label>
          <input
            type="text"
            value={jobCommand}
            onChange={(e) => setJobCommand(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Frequency Warning if sub-5m */}
      {!isValidInterval && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{warningMsg}</span>
        </div>
      )}

      {/* Generated YAML */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-emerald-500" />
            .github/workflows/scheduled-job.yml
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Workflow YAML"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {yamlSnippet}
        </pre>
      </div>
    </div>
  );
}
