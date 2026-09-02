"use client";

import { useState, useMemo } from "react";
import { ShieldCheck, Copy, Check, Sparkles, Code2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JSON = `{
  "id": "usr_9921",
  "username": "coder_alex",
  "email": "alex@example.com",
  "website": "https://alex.dev",
  "age": 29,
  "isActive": true,
  "roles": ["admin", "editor"],
  "settings": {
    "theme": "dark",
    "notificationsEnabled": true
  }
}`;

export function JsonToZodConverter() {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);
  const [schemaName, setSchemaName] = useState<string>("userSchema");
  const [copied, setCopied] = useState<boolean>(false);

  const { zodCode, isValid } = useMemo(() => {
    if (!jsonInput.trim()) return { zodCode: "// Paste JSON above to generate a Zod schema", isValid: true };

    try {
      const parsed = JSON.parse(jsonInput);

      const generateZod = (val: any, indent: string = "  "): string => {
        if (val === null || val === undefined) return "z.null()";
        if (typeof val === "boolean") return "z.boolean()";
        if (typeof val === "number") {
          return Number.isInteger(val) ? "z.number().int()" : "z.number()";
        }
        if (typeof val === "string") {
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "z.string().email()";
          if (/^https?:\/\//.test(val)) return "z.string().url()";
          return "z.string()";
        }
        if (Array.isArray(val)) {
          if (val.length === 0) return "z.array(z.any())";
          return `z.array(${generateZod(val[0], indent)})`;
        }
        if (typeof val === "object") {
          const keys = Object.keys(val);
          if (keys.length === 0) return "z.record(z.any())";

          let body = `z.object({\n`;
          for (const k of keys) {
            body += `${indent}  ${k}: ${generateZod(val[k], indent + "  ")},\n`;
          }
          body += `${indent}})`;
          return body;
        }
        return "z.any()";
      };

      const name = schemaName.trim() || "mySchema";
      const typeName = name.charAt(0).toUpperCase() + name.slice(1).replace(/Schema$/, "Type");

      const generated = `import { z } from "zod";\n\nexport const ${name} = ${generateZod(parsed)};\n\nexport type ${typeName} = z.infer<typeof ${name}>;\n`;

      return { zodCode: generated, isValid: true };
    } catch {
      return { zodCode: "// Error: Invalid JSON syntax. Please check for trailing commas.", isValid: false };
    }
  }, [jsonInput, schemaName]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(zodCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Schema Name */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-sm">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Zod Schema Variable Name
        </label>
        <input
          type="text"
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
          placeholder="userSchema"
          className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
        />
      </div>

      {/* JSON Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">JSON Input Payload</label>
          <span className="font-mono">AST Zod Builder</span>
        </div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={7}
          placeholder="{ ... }"
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Generated Zod Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-emerald-500" />
            TypeScript Zod Schema &amp; Inferred Type
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Zod Schema"}</span>
          </button>
        </div>

        <pre
          className={`p-4 bg-card border border-border rounded-xl font-mono text-xs overflow-x-auto select-all max-h-80 ${
            isValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {zodCode}
        </pre>
      </div>
    </div>
  );
}
