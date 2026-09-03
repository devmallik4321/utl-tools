"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, Cloud, FileCode, Play } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Every Day at 4:00 AM UTC", cron: "0 4 * * *" },
  { name: "Every 5 Minutes", cron: "*/5 * * * *" },
  { name: "Weekdays at 8:30 AM", cron: "30 8 * * 1-5" },
  { name: "First of Every Month", cron: "0 0 1 * *" },
];

export function CronToAzureFunctionsConverter() {
  const [standardCron, setStandardCron] = useState<string>("0 4 * * *");
  const [functionName, setFunctionName] = useState<string>("ProcessDailyReports");
  const [langTab, setLangTab] = useState<"csharp" | "ts" | "python">("csharp");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { ncrontab, codeSnippet } = useMemo(() => {
    const parts = standardCron.trim().split(/\s+/);
    let ncro = "";

    if (parts.length === 5) {
      // Convert standard 5-field to Azure 6-field NCRONTAB ({second} {minute} {hour} {day} {month} {day-of-week})
      ncro = `0 ${parts.join(" ")}`;
    } else if (parts.length === 6) {
      ncro = parts.join(" ");
    } else {
      ncro = "0 0 4 * * *";
    }

    const fn = functionName.trim() || "TimerFunction";
    let code = "";

    if (langTab === "csharp") {
      code = `// C# .NET Isolated Worker Azure Function
using System;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

public class ${fn}
{
    private readonly ILogger _logger;

    public ${fn}(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<${fn}>();
    }

    [Function("${fn}")]
    public void Run([TimerTrigger("${ncro}")] TimerInfo myTimer)
    {
        _logger.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");
    }
}`;
    } else if (langTab === "ts") {
      code = `// TypeScript / Node.js Azure Functions v4 Model
import { app, InvocationContext, Timer } from "@azure/functions";

export async function ${fn}(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('TypeScript Timer trigger function executed at:', new Date().toISOString());
}

app.timer('${fn}', {
    schedule: '${ncro}',
    handler: ${fn}
});`;
    } else {
      // Python
      code = `# Python v2 Azure Functions Model
import datetime
import logging
import azure.functions as func

app = func.FunctionApp()

@app.timer_trigger(schedule="${ncro}", arg_name="myTimer", run_on_startup=False, use_monitor=False)
def ${fn}(myTimer: func.TimerRequest) -> None:
    utc_timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    logging.info('Python timer trigger function ran at %s', utc_timestamp)`;
    }

    return { ncrontab: ncro, codeSnippet: code };
  }, [standardCron, functionName, langTab]);

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
          <span className="text-[10px] text-muted-foreground font-mono">min hour day month day-of-week</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Function Name
          </label>
          <input
            type="text"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Azure NCRONTAB Result Banner */}
      <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
            Azure Functions 6-Field NCRONTAB Expression
          </span>
          <span className="text-[11px] text-muted-foreground">
            Prepends mandatory second-precision field ({"{second} {minute} {hour} {day} {month} {day-of-week}"})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-card rounded-lg font-mono font-extrabold text-sm text-foreground border border-border">
            {ncrontab}
          </span>
          <button
            onClick={() => handleCopy("ncro", ncrontab)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {copiedKey === "ncro" ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Language Tabs & Code Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {(["csharp", "ts", "python"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLangTab(l)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                  langTab === l
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-card border-border text-foreground hover:bg-muted"
                }`}
              >
                {l === "csharp" ? "C# (.NET)" : l === "ts" ? "TypeScript (v4)" : "Python (v2)"}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCopy("code", codeSnippet)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "code" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "code" ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {codeSnippet}
        </pre>
      </div>
    </div>
  );
}
