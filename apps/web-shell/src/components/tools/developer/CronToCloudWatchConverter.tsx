"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, Cloud, FileCode, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Weekdays at 9:00 AM UTC", cron: "0 9 * * 1-5" },
  { name: "Every Day at Midnight UTC", cron: "0 0 * * *" },
  { name: "Every 15 Minutes", cron: "*/15 * * * *" },
  { name: "1st of Every Month at 6:00 AM", cron: "0 6 1 * *" },
];

export function CronToCloudWatchConverter() {
  const [standardCron, setStandardCron] = useState<string>("0 9 * * 1-5");
  const [ruleName, setRuleName] = useState<string>("DailyBatchProcessingRule");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    awsCronExpr,
    awsCliCmd,
    terraformCode,
    cdkCode,
  } = useMemo(() => {
    const parts = standardCron.trim().split(/\s+/);
    let min = "0";
    let hour = "0";
    let dom = "*";
    let month = "*";
    let dow = "?";
    let year = "*";

    if (parts.length >= 5) {
      min = parts[0];
      hour = parts[1];
      dom = parts[2];
      month = parts[3];
      dow = parts[4];

      // Convert standard cron Day-of-Week 1-5 to MON-FRI or numbers
      // In AWS: 1 is SUN or numbers 1-7, or MON-FRI
      if (dow === "1-5") {
        dow = "MON-FRI";
      } else if (dow === "0") {
        dow = "SUN";
      } else if (dow === "6") {
        dow = "SAT";
      }

      // AWS Invariant: One of dom or dow MUST be '?'
      if (dom === "*" && dow !== "*") {
        dom = "?";
      } else if (dow === "*" && dom !== "*") {
        dow = "?";
      } else if (dom === "*" && dow === "*") {
        dow = "?"; // default dow to ? when daily
      } else if (dom !== "*" && dow !== "*") {
        // Both specified: AWS rejects this. Force dow to ?
        dow = "?";
      }
    }

    const expr = `cron(${min} ${hour} ${dom} ${month} ${dow} ${year})`;
    const name = ruleName.trim() || "MyScheduledRule";

    const cli = `aws events put-rule \\
  --name "${name}" \\
  --schedule-expression "${expr}" \\
  --state ENABLED \\
  --description "Managed by UTL.tools schedule rule"`;

    const tf = `resource "aws_cloudwatch_event_rule" "${name.toLowerCase()}" {
  name                = "${name}"
  description         = "Triggered on AWS CloudWatch / EventBridge schedule"
  schedule_expression = "${expr}"
  is_enabled          = true
}`;

    const cdk = `import * as events from 'aws-cdk-lib/aws-events';

const rule = new events.Rule(this, '${name}', {
  schedule: events.Schedule.expression('${expr}'),
  description: 'EventBridge scheduled rule',
});`;

    return {
      awsCronExpr: expr,
      awsCliCmd: cli,
      terraformCode: tf,
      cdkCode: cdk,
    };
  }, [standardCron, ruleName]);

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
            onClick={() => setStandardCron(p.cron)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              standardCron === p.cron
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
            Standard 5-Field Cron Expression
          </label>
          <input
            type="text"
            value={standardCron}
            onChange={(e) => setStandardCron(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">min hour day-of-month month day-of-week</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            EventBridge Rule Name
          </label>
          <input
            type="text"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* AWS CloudWatch / EventBridge Result Banner */}
      <div className="p-4 bg-amber-600/10 border border-amber-600/30 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
            AWS EventBridge 6-Field Schedule Expression
          </span>
          <span className="text-[11px] text-muted-foreground">
            Strict AWS rule: One of Day-of-month or Day-of-week is automatically converted to `?`
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-card rounded-lg font-mono font-extrabold text-sm text-foreground border border-border">
            {awsCronExpr}
          </span>
          <button
            onClick={() => handleCopy("expr", awsCronExpr)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {copiedKey === "expr" ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">AWS CLI Terminal Command</span>
            <button
              onClick={() => handleCopy("cli", awsCliCmd)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "cli" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "cli" ? "Copied!" : "Copy CLI"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
            {awsCliCmd}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Terraform IaC Resource</span>
            <button
              onClick={() => handleCopy("tf", terraformCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "tf" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "tf" ? "Copied!" : "Copy Terraform"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
            {terraformCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
