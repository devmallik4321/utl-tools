"use client";

import { useState } from "react";
import { ArrowLeftRight, Copy, Check, Code, FileCode, AlertCircle, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JSON = `{
  "apiVersion": "v1",
  "kind": "Pod",
  "metadata": {
    "name": "nginx-web-server",
    "labels": {
      "app": "frontend",
      "env": "production"
    }
  },
  "spec": {
    "replicas": 3,
    "containers": [
      {
        "name": "nginx",
        "image": "nginx:1.25.4-alpine",
        "ports": [
          {
            "containerPort": 80
          }
        ]
      }
    ]
  }
}`;

export function JsonYamlConverter() {
  const [inputCode, setInputCode] = useState<string>(SAMPLE_JSON);
  const [direction, setDirection] = useState<"json2yaml" | "yaml2json">("json2yaml");
  const [indentSpaces, setIndentSpaces] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  // Simple client-side YAML serializer
  const jsonToYaml = (obj: any, indent = 0): string => {
    const pad = " ".repeat(indent);
    if (obj === null) return "null";
    if (typeof obj === "boolean" || typeof obj === "number") return String(obj);
    if (typeof obj === "string") {
      if (obj.includes("\n") || /[:#{}[\]]/.test(obj)) {
        return `"${obj.replace(/"/g, '\\"')}"`;
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";
      return obj
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            const sub = jsonToYaml(item, indent + 2).trimStart();
            return `${pad}- ${sub}`;
          }
          return `${pad}- ${jsonToYaml(item, indent + 2)}`;
        })
        .join("\n");
    }

    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0) return "{}";
      return keys
        .map((k) => {
          const val = obj[k];
          if (typeof val === "object" && val !== null) {
            return `${pad}${k}:\n${jsonToYaml(val, indent + indentSpaces)}`;
          }
          return `${pad}${k}: ${jsonToYaml(val, indent)}`;
        })
        .join("\n");
    }

    return String(obj);
  };

  // Simple client-side YAML to JSON parser for basic key-value structures
  const yamlToJson = (yamlStr: string): any => {
    const lines = yamlStr.split("\n").filter((l) => l.trim().length > 0 && !l.trim().startsWith("#"));
    const root: any = {};
    const stack: { indent: number; obj: any; key?: string }[] = [{ indent: -1, obj: root }];

    for (const line of lines) {
      const indent = line.search(/\S/);
      const trimmed = line.trim();

      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const current = stack[stack.length - 1].obj;

      if (trimmed.startsWith("- ")) {
        // Array item
        const itemVal = trimmed.substring(2).trim();
        const parentKey = stack[stack.length - 1].key;
        if (parentKey && !Array.isArray(current[parentKey])) {
          current[parentKey] = [];
        }
        const targetArray = parentKey ? current[parentKey] : current;

        if (itemVal.includes(":")) {
          const [k, ...rest] = itemVal.split(":");
          const subObj = { [k.trim()]: parseVal(rest.join(":").trim()) };
          targetArray.push(subObj);
          stack.push({ indent, obj: subObj });
        } else {
          targetArray.push(parseVal(itemVal));
        }
      } else if (trimmed.includes(":")) {
        const colonIdx = trimmed.indexOf(":");
        const key = trimmed.substring(0, colonIdx).trim();
        const rest = trimmed.substring(colonIdx + 1).trim();

        if (rest === "") {
          current[key] = {};
          stack.push({ indent, obj: current[key], key });
        } else {
          current[key] = parseVal(rest);
        }
      }
    }

    return root;
  };

  const parseVal = (str: string): any => {
    if (str === "true") return true;
    if (str === "false") return false;
    if (str === "null" || str === "~") return null;
    if (!isNaN(Number(str)) && str !== "") return Number(str);
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }
    return str;
  };

  // Conversion Execution
  let outputResult = "";
  let conversionError: string | null = null;

  try {
    if (direction === "json2yaml") {
      const parsedJson = JSON.parse(inputCode);
      outputResult = jsonToYaml(parsedJson);
    } else {
      const parsedObj = yamlToJson(inputCode);
      outputResult = JSON.stringify(parsedObj, null, indentSpaces);
    }
  } catch (err: any) {
    conversionError = err.message || "Invalid syntax format.";
  }

  const handleSwap = () => {
    if (outputResult && !conversionError) {
      setInputCode(outputResult);
    }
    setDirection(direction === "json2yaml" ? "yaml2json" : "json2yaml");
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(outputResult);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Direction & Settings Bar */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Mode:
          </span>
          <div className="flex p-0.5 bg-muted rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setDirection("json2yaml")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                direction === "json2yaml" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
            >
              JSON ➔ YAML
            </button>
            <button
              type="button"
              onClick={() => setDirection("yaml2json")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                direction === "yaml2json" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
            >
              YAML ➔ JSON
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Indent:</span>
            <select
              value={indentSpaces}
              onChange={(e) => setIndentSpaces(parseInt(e.target.value))}
              className="px-2 py-1 bg-background border border-border rounded-md text-xs font-mono"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted/40 transition-colors flex items-center gap-1.5 text-foreground"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap Input/Output</span>
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Pane */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-500" />
              {direction === "json2yaml" ? "Input JSON" : "Input YAML"}
            </label>
            <span className="text-xs font-mono text-muted-foreground">{inputCode.length} chars</span>
          </div>
          <textarea
            rows={14}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={direction === "json2yaml" ? "Paste JSON here..." : "Paste YAML here..."}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* Output Pane */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-500" />
              {direction === "json2yaml" ? "Converted YAML" : "Converted JSON"}
            </label>
            <button
              onClick={handleCopy}
              disabled={!!conversionError || !outputResult}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Output"}</span>
            </button>
          </div>

          {conversionError ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 min-h-[280px]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Conversion Syntax Error</p>
                <p className="mt-1 font-mono text-[11px]">{conversionError}</p>
              </div>
            </div>
          ) : (
            <textarea
              rows={14}
              readOnly
              value={outputResult}
              className="w-full p-3 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all"
            />
          )}
        </div>
      </div>
    </div>
  );
}
