"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, Server, FileCode, Box } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Nightly Backup (2:00 AM)", cron: "0 2 * * *" },
  { name: "Every 15 Minutes", cron: "*/15 * * * *" },
  { name: "Every Hour at :00", cron: "0 * * * *" },
  { name: "Weekly on Sunday Midnight", cron: "0 0 * * 0" },
];

export function CronToKubernetesConverter() {
  const [cronExp, setCronExp] = useState<string>("0 2 * * *");
  const [jobName, setJobName] = useState<string>("nightly-db-backup");
  const [containerImage, setContainerImage] = useState<string>("postgres:16-alpine");
  const [command, setCommand] = useState<string>("pg_dump -U postgres app_prod > /backup/dump.sql");
  const [concurrencyPolicy, setConcurrencyPolicy] = useState<string>("Forbid"); // Forbid, Allow, Replace
  const [copied, setCopied] = useState<boolean>(false);

  const k8sYaml = useMemo(() => {
    const cleanCron = cronExp.trim() || "0 2 * * *";
    const cleanName = jobName.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-") || "scheduled-cronjob";

    return `apiVersion: batch/v1
kind: CronJob
metadata:
  name: ${cleanName}
  labels:
    app.kubernetes.io/name: ${cleanName}
    app.kubernetes.io/part-of: batch-jobs
spec:
  schedule: "${cleanCron}"
  concurrencyPolicy: ${concurrencyPolicy}
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  startingDeadlineSeconds: 200
  jobTemplate:
    spec:
      backoffLimit: 2
      template:
        metadata:
          labels:
            app: ${cleanName}
        spec:
          restartPolicy: OnFailure
          containers:
            - name: job-worker
              image: ${containerImage.trim()}
              command:
                - /bin/sh
                - -c
                - |
                  ${command}
              resources:
                requests:
                  cpu: 100m
                  memory: 128Mi
                limits:
                  cpu: 500m
                  memory: 512Mi
`;
  }, [cronExp, jobName, containerImage, command, concurrencyPolicy]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(k8sYaml);
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
            Cron Schedule
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
            CronJob Resource Name
          </label>
          <input
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Container Image
          </label>
          <input
            type="text"
            value={containerImage}
            onChange={(e) => setContainerImage(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Command & Concurrency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Execution Command / Script
          </label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Concurrency Policy
          </label>
          <select
            value={concurrencyPolicy}
            onChange={(e) => setConcurrencyPolicy(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="Forbid">Forbid (Prevents Concurrent Runs)</option>
            <option value="Allow">Allow (Allows Overlapping Runs)</option>
            <option value="Replace">Replace (Kills Previous Run)</option>
          </select>
        </div>
      </div>

      {/* Generated Kubernetes Manifest */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-500" />
            Kubernetes CronJob Manifest (batch/v1)
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy YAML"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {k8sYaml}
        </pre>
      </div>
    </div>
  );
}
