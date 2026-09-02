"use client";

import { useState, useMemo } from "react";
import { FileText, Copy, Check, Sparkles, Download, Code2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JSON = `{
  "port": 3000,
  "nodeEnv": "production",
  "database": {
    "host": "postgres.internal.cluster",
    "port": 5432,
    "user": "app_user",
    "password": "secretDbPassword123"
  },
  "auth": {
    "jwtSecret": "super_jwt_secret_token_99",
    "tokenExpiryDays": 30
  },
  "redis": {
    "enabled": true,
    "url": "redis://10.0.0.5:6379"
  }
}`;

export function JsonToEnvConverter() {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);
  const [prefix, setPrefix] = useState<string>("");
  const [quoteStrings, setQuoteStrings] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const { envOutput, isValid, errorMsg } = useMemo(() => {
    if (!jsonInput.trim()) return { envOutput: "", isValid: true, errorMsg: "" };

    try {
      const parsed = JSON.parse(jsonInput);
      const lines: string[] = [];

      const toSnakeCase = (str: string): string => {
        return str
          .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .toUpperCase();
      };

      const flatten = (obj: any, currentPrefix: string) => {
        if (typeof obj !== "object" || obj === null) {
          let val = String(obj);
          if (quoteStrings || val.includes(" ") || val.includes("#")) {
            val = `"${val.replace(/"/g, '\\"')}"`;
          }
          lines.push(`${currentPrefix}=${val}`);
          return;
        }

        if (Array.isArray(obj)) {
          lines.push(`${currentPrefix}=${JSON.stringify(obj)}`);
          return;
        }

        for (const key of Object.keys(obj)) {
          const snake = toSnakeCase(key);
          const newPrefix = currentPrefix ? `${currentPrefix}_${snake}` : snake;
          flatten(obj[key], newPrefix);
        }
      };

      const basePrefix = prefix.trim() ? toSnakeCase(prefix.trim()) : "";
      flatten(parsed, basePrefix);

      return { envOutput: lines.join("\n"), isValid: true, errorMsg: "" };
    } catch (e: any) {
      return { envOutput: "", isValid: false, errorMsg: e.message || "Invalid JSON syntax" };
    }
  }, [jsonInput, prefix, quoteStrings]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(envOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!envOutput || !isValid) return;
    const blob = new Blob([envOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = ".env";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Optional Key Prefix
          </label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="e.g. APP or NEXT_PUBLIC"
            className="w-full px-3 py-2 text-xs font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2 flex flex-col justify-center">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Formatting Options
          </label>
          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={quoteStrings}
              onChange={(e) => setQuoteStrings(e.target.checked)}
              className="accent-blue-600 rounded"
            />
            <span>Always enclose values in double quotes (`"..."`)</span>
          </label>
        </div>
      </div>

      {/* JSON Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">JSON Input Payload</label>
          <span className="font-mono">Flattens nested keys to SNAKE_CASE</span>
        </div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={7}
          placeholder="{ ... }"
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Generated .env Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-500" />
            Generated `.env` File
          </h4>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={!isValid || !envOutput}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .env</span>
            </button>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy .env"}</span>
            </button>
          </div>
        </div>

        <pre
          className={`p-4 bg-card border border-border rounded-xl font-mono text-xs overflow-x-auto select-all max-h-80 ${
            isValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isValid ? envOutput : `// Error parsing JSON:\n${errorMsg}`}
        </pre>
      </div>
    </div>
  );
}
