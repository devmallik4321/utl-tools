"use client";

import { useState, useMemo } from "react";
import { FileJson, Copy, Check, Sparkles, Download, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_YAML = `server:
  port: 8080
  host: "0.0.0.0"
  ssl:
    enabled: true
    cert: "/etc/ssl/cert.pem"

database:
  name: "production_db"
  poolSize: 10
  replicaHosts:
    - "db-replica-1.internal"
    - "db-replica-2.internal"

features:
  analytics: true
  rateLimiting: false`;

export function YamlToJsonConverter() {
  const [yamlInput, setYamlInput] = useState<string>(SAMPLE_YAML);
  const [copied, setCopied] = useState<boolean>(false);

  const { jsonOutput, isValid, errorMsg } = useMemo(() => {
    if (!yamlInput.trim()) return { jsonOutput: "", isValid: true, errorMsg: "" };

    try {
      // Lightweight client-side YAML-to-JSON parser
      const lines = yamlInput.split("\n");
      const root: any = {};
      const stack: { indent: number; obj: any; key?: string }[] = [{ indent: -1, obj: root }];

      const parseVal = (v: string): any => {
        const trimmed = v.trim();
        if (trimmed === "true") return true;
        if (trimmed === "false") return false;
        if (trimmed === "null" || trimmed === "~") return null;
        if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
        if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      };

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        if (!rawLine.trim() || rawLine.trim().startsWith("#")) continue;

        const indent = rawLine.search(/\S/);
        const line = rawLine.trim();

        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }

        const parent = stack[stack.length - 1].obj;

        if (line.startsWith("- ")) {
          // List item
          const valStr = line.slice(2).trim();
          if (!Array.isArray(parent)) {
            // Need array container
            continue;
          }
          parent.push(parseVal(valStr));
        } else if (line.includes(":")) {
          const colonIdx = line.indexOf(":");
          const key = line.slice(0, colonIdx).trim();
          const valStr = line.slice(colonIdx + 1).trim();

          if (!valStr) {
            // Check next line to decide whether it's an array or object
            let isNextArray = false;
            for (let j = i + 1; j < lines.length; j++) {
              const nextTrim = lines[j].trim();
              if (!nextTrim || nextTrim.startsWith("#")) continue;
              if (nextTrim.startsWith("- ")) isNextArray = true;
              break;
            }
            const newChild = isNextArray ? [] : {};
            if (Array.isArray(parent)) {
              parent.push({ [key]: newChild });
            } else {
              parent[key] = newChild;
            }
            stack.push({ indent, obj: newChild, key });
          } else {
            const val = parseVal(valStr);
            if (Array.isArray(parent)) {
              parent.push({ [key]: val });
            } else {
              parent[key] = val;
            }
          }
        }
      }

      const formatted = JSON.stringify(root, null, 2);
      return { jsonOutput: formatted, isValid: true, errorMsg: "" };
    } catch (e: any) {
      return { jsonOutput: "", isValid: false, errorMsg: e.message || "Invalid YAML syntax" };
    }
  }, [yamlInput]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(jsonOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!jsonOutput || !isValid) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* YAML Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">YAML Input</label>
          <span className="font-mono">In-Memory Parser</span>
        </div>
        <textarea
          value={yamlInput}
          onChange={(e) => setYamlInput(e.target.value)}
          rows={8}
          placeholder="server:\n  port: 8080..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* JSON Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileJson className="w-4 h-4 text-emerald-500" />
            Generated JSON Output
          </h4>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={!isValid || !jsonOutput}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy JSON"}</span>
            </button>
          </div>
        </div>

        <pre
          className={`p-4 bg-card border border-border rounded-xl font-mono text-xs overflow-x-auto select-all max-h-80 ${
            isValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isValid ? jsonOutput : `// Error parsing YAML:\n${errorMsg}`}
        </pre>
      </div>
    </div>
  );
}
