"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, Cloud, FileCode, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Daily at Midnight UTC", cron: "0 0 * * *" },
  { name: "Every 10 Minutes", cron: "*/10 * * * *" },
  { name: "Weekdays at 9:00 AM", cron: "0 9 * * 1-5" },
  { name: "First of Every Month", cron: "0 0 1 * *" },
];

export function CronToCloudSchedulerConverter() {
  const [cronExpr, setCronExpr] = useState<string>("0 0 * * *");
  const [jobName, setJobName] = useState<string>("daily-sync-job");
  const [timezone, setTimezone] = useState<string>("Etc/UTC");
  const [targetUrl, setTargetUrl] = useState<string>("https://api.example.com/tasks/daily-sync");
  const [httpMethod, setHttpMethod] = useState<string>("POST");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { gcloudCommand, terraformSnippet } = useMemo(() => {
    const jName = jobName.trim() || "my-scheduler-job";
    const sched = cronExpr.trim() || "0 0 * * *";
    const uri = targetUrl.trim() || "https://api.example.com/cron";

    const gcloud = `gcloud scheduler jobs create http ${jName} \\
    --schedule="${sched}" \\
    --time-zone="${timezone}" \\
    --uri="${uri}" \\
    --http-method=${httpMethod} \\
    --oidc-service-account-email="my-invoker-sa@project-id.iam.gserviceaccount.com" \\
    --oidc-token-audience="${uri}"`;

    const tf = `resource "google_cloud_scheduler_job" "${jName.replace(/-/g, "_")}" {
  name             = "${jName}"
  description      = "Triggered by Google Cloud Scheduler"
  schedule         = "${sched}"
  time_zone        = "${timezone}"
  attempt_deadline = "320s"

  http_target {
    http_method = "${httpMethod}"
    uri         = "${uri}"

    oidc_token {
      service_account_email = "my-invoker-sa@project-id.iam.gserviceaccount.com"
      audience              = "${uri}"
    }
  }
}`;

    return {
      gcloudCommand: gcloud,
      terraformSnippet: tf,
    };
  }, [cronExpr, jobName, timezone, targetUrl, httpMethod]);

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Cron Expression (5-Field)
          </label>
          <input
            type="text"
            value={cronExpr}
            onChange={(e) => setCronExpr(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">min hour day month day-of-week</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Job Name
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
            Time Zone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="Etc/UTC">Etc/UTC (Coordinated Universal Time)</option>
            <option value="America/New_York">America/New_York (Eastern)</option>
            <option value="America/Chicago">America/Chicago (Central)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Europe/Berlin">Europe/Berlin (CET)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Endpoint URL
          </label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            HTTP Method
          </label>
          <select
            value={httpMethod}
            onChange={(e) => setHttpMethod(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
            <option value="PUT">PUT</option>
          </select>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">gcloud CLI Deployment Command</span>
            <button
              onClick={() => handleCopy("cli", gcloudCommand)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "cli" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "cli" ? "Copied!" : "Copy CLI"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all max-h-[300px]">
            {gcloudCommand}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Terraform IaC Resource</span>
            <button
              onClick={() => handleCopy("tf", terraformSnippet)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "tf" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "tf" ? "Copied!" : "Copy Terraform"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all max-h-[300px]">
            {terraformSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
