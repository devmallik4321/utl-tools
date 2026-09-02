"use client";

import { useState, useMemo } from "react";
import { FileCode, Copy, Check, Sparkles, Code2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JSON = `{
  "id": 101,
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "isAdmin": true,
  "roles": ["admin", "billing"],
  "profile": {
    "avatarUrl": "https://example.com/avatar.png",
    "theme": "dark",
    "loginCount": 42
  },
  "tags": [1, 2, 3]
}`;

export function JsonSchemaToTypeConverter() {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);
  const [rootName, setRootName] = useState<string>("UserPayload");
  const [copied, setCopied] = useState<boolean>(false);

  const { typeScriptCode, isValid } = useMemo(() => {
    if (!jsonInput.trim()) return { typeScriptCode: "// Paste JSON above to generate TypeScript interfaces", isValid: true };

    try {
      const parsed = JSON.parse(jsonInput);
      const interfaces: string[] = [];

      const generateType = (val: any, name: string): string => {
        if (val === null || val === undefined) return "any";
        if (typeof val === "string") return "string";
        if (typeof val === "number") return "number";
        if (typeof val === "boolean") return "boolean";

        if (Array.isArray(val)) {
          if (val.length === 0) return "any[]";
          const subType = generateType(val[0], `${name}Item`);
          return `${subType}[]`;
        }

        if (typeof val === "object") {
          const subInterfaceName = name.charAt(0).toUpperCase() + name.slice(1);
          let body = `export interface ${subInterfaceName} {\n`;
          for (const key of Object.keys(val)) {
            const propType = generateType(val[key], key);
            body += `  ${key}: ${propType};\n`;
          }
          body += `}\n`;
          interfaces.push(body);
          return subInterfaceName;
        }

        return "any";
      };

      const safeRoot = rootName.trim() || "RootObject";
      generateType(parsed, safeRoot);

      // If root was an array of objects
      let fullCode = interfaces.join("\n");
      if (Array.isArray(parsed) && interfaces.length > 0) {
        fullCode += `\nexport type ${safeRoot} = ${safeRoot}Item[];\n`;
      }

      return { typeScriptCode: fullCode, isValid: true };
    } catch {
      return { typeScriptCode: "// Error: Invalid JSON syntax. Please check for trailing commas or unmatched braces.", isValid: false };
    }
  }, [jsonInput, rootName]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(typeScriptCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Root Name */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-sm">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Root Interface Name
        </label>
        <input
          type="text"
          value={rootName}
          onChange={(e) => setRootName(e.target.value)}
          placeholder="RootObject"
          className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
        />
      </div>

      {/* JSON Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">Paste JSON Object</label>
          <span className="font-mono">JSON AST Parser</span>
        </div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={7}
          placeholder="{ ... }"
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Generated TypeScript Interfaces */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-emerald-500" />
            Generated TypeScript Interfaces &amp; Types
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy TypeScript"}</span>
          </button>
        </div>

        <pre
          className={`p-4 bg-card border border-border rounded-xl font-mono text-xs overflow-x-auto select-all max-h-80 ${
            isValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {typeScriptCode}
        </pre>
      </div>
    </div>
  );
}
