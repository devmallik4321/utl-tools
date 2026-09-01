"use client";

import { useState } from "react";
import { Code, Sparkles, Copy, Check, FileCode2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JSON = `{
  "id": 101,
  "name": "Sarah Jenkins",
  "email": "sarah.j@example.com",
  "isActive": true,
  "roles": ["admin", "developer"],
  "profile": {
    "age": 29,
    "avatarUrl": "https://example.com/avatar.png",
    "settings": {
      "theme": "dark",
      "notificationsEnabled": true
    }
  },
  "metadata": null
}`;

export function JsonToTypeScriptConverter() {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);
  const [rootName, setRootName] = useState<string>("RootObject");
  const [typeStyle, setTypeStyle] = useState<"interface" | "type">("interface");
  const [copied, setCopied] = useState<boolean>(false);

  // JSON to TypeScript recursive parser
  const convertJsonToTs = (raw: string, root: string, isType: boolean) => {
    if (!raw.trim()) return "";

    try {
      const parsed = JSON.parse(raw);
      const interfaces: string[] = [];

      const parseObject = (obj: any, name: string): string => {
        if (obj === null || obj === undefined) return "any";
        if (Array.isArray(obj)) {
          if (obj.length === 0) return "any[]";
          const elemType = parseObject(obj[0], `${name}Item`);
          return `${elemType}[]`;
        }
        if (typeof obj === "object") {
          const lines: string[] = [];
          for (const [key, value] of Object.entries(obj)) {
            const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
            let propType = "any";

            if (value === null) {
              propType = "any | null";
            } else if (Array.isArray(value)) {
              if (value.length === 0) {
                propType = "any[]";
              } else if (typeof value[0] === "object" && value[0] !== null) {
                const subName = capitalize(key.endsWith("s") ? key.slice(0, -1) : key);
                parseObject(value[0], subName);
                propType = `${subName}[]`;
              } else {
                propType = `${typeof value[0]}[]`;
              }
            } else if (typeof value === "object") {
              const subName = capitalize(key);
              parseObject(value, subName);
              propType = subName;
            } else {
              propType = typeof value;
            }

            lines.push(`  ${formattedKey}: ${propType};`);
          }

          const decl = isType
            ? `export type ${name} = {\n${lines.join("\n")}\n};`
            : `export interface ${name} {\n${lines.join("\n")}\n}`;

          interfaces.push(decl);
          return name;
        }

        return typeof obj;
      };

      parseObject(parsed, root);
      return interfaces.reverse().join("\n\n");
    } catch (err: any) {
      return `// Invalid JSON: ${err.message}`;
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const tsOutput = convertJsonToTs(jsonInput, rootName, typeStyle === "type");

  const handleCopy = async () => {
    const ok = await copyToClipboard(tsOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Configuration
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Root Name:</span>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value || "RootObject")}
              className="text-xs px-2.5 py-1 bg-background border border-border rounded-lg font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Style:</span>
            <div className="flex p-0.5 bg-muted rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setTypeStyle("interface")}
                className={`px-3 py-1 text-xs font-semibold rounded ${typeStyle === "interface" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}
              >
                Interface
              </button>
              <button
                type="button"
                onClick={() => setTypeStyle("type")}
                className={`px-3 py-1 text-xs font-semibold rounded ${typeStyle === "type" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}
              >
                Type Alias
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* JSON Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-500" />
              Raw JSON Input
            </label>
            <span className="text-xs font-mono text-muted-foreground">{jsonInput.length} chars</span>
          </div>
          <textarea
            rows={12}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste raw JSON object here..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* TypeScript Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4 text-emerald-500" />
              Generated TypeScript Definitions
            </label>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy TypeScript"}</span>
            </button>
          </div>
          <textarea
            rows={12}
            readOnly
            value={tsOutput}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all"
          />
        </div>
      </div>
    </div>
  );
}
