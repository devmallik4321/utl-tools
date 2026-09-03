"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, Activity, FileCode, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Every 15 Minutes", cron: "*/15 * * * *" },
  { name: "Hourly at Minute 0", cron: "0 * * * *" },
  { name: "Every 6 Hours", cron: "0 */6 * * *" },
  { name: "Daily at 8:00 AM", cron: "0 8 * * *" },
];

export function CronToDatadogConverter() {
  const [cronExpr, setCronExpr] = useState<string>("*/15 * * * *");
  const [testName, setTestName] = useState<string>("API Gateway Health Check");
  const [targetUrl, setTargetUrl] = useState<string>("https://api.example.com/health");
  const [timezone, setTimezone] = useState<string>("UTC");
  const [httpMethod, setHttpMethod] = useState<string>("GET");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { datadogJson, datadogTerraform } = useMemo(() => {
    const tName = testName.trim() || "API Synthetic Test";
    const uri = targetUrl.trim() || "https://api.example.com/health";
    const sched = cronExpr.trim() || "*/15 * * * *";

    const jsonPayload = {
      name: tName,
      type: "api",
      subtype: "http",
      status: "live",
      message: "Notification handle: @pagerduty-backend-oncall",
      tags: ["env:production", "team:infrastructure", "managed-by:terraform"],
      locations: ["aws:us-east-1", "aws:eu-west-1"],
      options: {
        tick_every: 0, // indicates cron schedule override
        scheduling: {
          timezones: [timezone],
          rules: [
            {
              cron: sched,
            },
          ],
        },
        monitor_options: {
          renotify_interval: 30,
        },
      },
      config: {
        request: {
          method: httpMethod,
          url: uri,
          timeout: 10,
        },
        assertions: [
          {
            type: "statusCode",
            operator: "is",
            target: 200,
          },
        ],
      },
    };

    const tf = `resource "datadog_synthetics_test" "${tName.toLowerCase().replace(/[^a-z0-9]/g, "_")}" {
  name      = "${tName}"
  type      = "api"
  subtype   = "http"
  status    = "live"
  message   = "Notify: @slack-alerts"
  locations = ["aws:us-east-1", "aws:eu-west-1"]
  tags      = ["env:production", "managed-by:terraform"]

  request_definition {
    method = "${httpMethod}"
    url    = "${uri}"
    timeout = 10
  }

  assertion {
    type     = "statusCode"
    operator = "is"
    target   = "200"
  }

  options_list {
    tick_every = 0

    scheduling {
      timezones = ["${timezone}"]
      rule {
        cron = "${sched}"
      }
    }
  }
}`;

    return {
      datadogJson: JSON.stringify(jsonPayload, null, 2),
      datadogTerraform: tf,
    };
  }, [cronExpr, testName, targetUrl, timezone, httpMethod]);

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
            Synthetic Test Name
          </label>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Chicago">America/Chicago</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Monitoring URL
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
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="HEAD">HEAD</option>
          </select>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Datadog Synthetics API Payload (JSON)</span>
            <button
              onClick={() => handleCopy("json", datadogJson)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "json" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "json" ? "Copied!" : "Copy JSON"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all max-h-[320px]">
            {datadogJson}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Datadog Terraform IaC Resource</span>
            <button
              onClick={() => handleCopy("tf", datadogTerraform)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "tf" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "tf" ? "Copied!" : "Copy Terraform"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all max-h-[320px]">
            {datadogTerraform}
          </pre>
        </div>
      </div>
    </div>
  );
}
