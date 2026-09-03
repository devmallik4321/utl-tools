"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, Cloud, Code, Server } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Daily at Midnight UTC", cron: "0 0 * * *" },
  { name: "Every 15 Minutes", cron: "*/15 * * * *" },
  { name: "Weekdays at 9:00 AM UTC", cron: "0 9 * * 1-5" },
  { name: "1st of Every Month at 6 AM", cron: "0 6 1 * *" },
  { name: "Every Hour on the Hour", cron: "0 * * * *" },
];

export function CronToEventBridgeConverter() {
  const [posixCron, setPosixCron] = useState<string>("0 9 * * 1-5");
  const [ruleName, setRuleName] = useState<string>("daily-sync-scheduler");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { awsCron, awsCli, terraformHcl, cdkSnippet } = useMemo(() => {
    const parts = posixCron.trim().split(/\s+/);
    let awsExpr = "cron(0 9 ? * MON-FRI *)";

    if (parts.length === 5) {
      const [m, h, dom, mon, dow] = parts;

      let awsDom = dom;
      let awsDow = dow;

      // AWS EventBridge rule: One of DOM or DOW must be '?'
      if (dow !== "*" && dom === "*") {
        awsDom = "?";
        // Map dow if needed
        if (dow === "1-5") awsDow = "MON-FRI";
        else if (dow === "0" || dow === "7") awsDow = "SUN";
        else if (dow === "1") awsDow = "MON";
      } else if (dom !== "*" && dow === "*") {
        awsDow = "?";
      } else if (dom === "*" && dow === "*") {
        awsDow = "?";
      } else {
        // Both specified
        awsDow = "?";
      }

      awsExpr = `cron(${m} ${h} ${awsDom} ${mon} ${awsDow} *)`;
    }

    const cli = `aws events put-rule \\
  --name "${ruleName}" \\
  --schedule-expression "${awsExpr}" \\
  --state "ENABLED" \\
  --description "EventBridge scheduled rule triggered by ${posixCron}"`;

    const tf = `resource "aws_cloudwatch_event_rule" "${ruleName.replace(/-/g, "_")}" {
  name                = "${ruleName}"
  description         = "Trigger schedule for ${ruleName}"
  schedule_expression = "${awsExpr}"
  is_enabled          = true
}`;

    const cdk = `new events.Rule(this, '${ruleName}', {
  ruleName: '${ruleName}',
  schedule: events.Schedule.expression('${awsExpr}'),
  enabled: true,
});`;

    return { awsCron: awsExpr, awsCli: cli, terraformHcl: tf, cdkSnippet: cdk };
  }, [posixCron, ruleName]);

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
            onClick={() => setPosixCron(p.cron)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              posixCron === p.cron
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Standard POSIX Crontab (5 Fields)
          </label>
          <input
            type="text"
            value={posixCron}
            onChange={(e) => setPosixCron(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            AWS EventBridge Rule Name
          </label>
          <input
            type="text"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Output Grid */}
      <div className="space-y-4">
        {/* AWS Cron Expression */}
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-emerald-500" />
              AWS EventBridge 6-Field Schedule Expression
            </h4>
            <button
              onClick={() => handleCopy("cron", awsCron)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "cron" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "cron" ? "Copied!" : "Copy Expression"}</span>
            </button>
          </div>
          <pre className="p-4 bg-card border border-border rounded-xl font-mono text-sm text-emerald-600 dark:text-emerald-400 select-all">
            {awsCron}
          </pre>
        </div>

        {/* CLI and Terraform Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-card rounded-xl border border-border space-y-2">
            <div className="flex justify-between items-center font-sans">
              <span className="font-bold text-foreground">AWS CLI Command</span>
              <button
                onClick={() => handleCopy("cli", awsCli)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copiedKey === "cli" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "cli" ? "Copied!" : "Copy CLI"}</span>
              </button>
            </div>
            <pre className="p-3 bg-muted/50 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
              {awsCli}
            </pre>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-2">
            <div className="flex justify-between items-center font-sans">
              <span className="font-bold text-foreground">Terraform HCL</span>
              <button
                onClick={() => handleCopy("tf", terraformHcl)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copiedKey === "tf" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "tf" ? "Copied!" : "Copy HCL"}</span>
              </button>
            </div>
            <pre className="p-3 bg-muted/50 rounded-lg text-purple-600 dark:text-purple-400 overflow-x-auto select-all">
              {terraformHcl}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
