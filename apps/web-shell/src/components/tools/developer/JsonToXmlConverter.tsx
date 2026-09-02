"use client";

import { useState, useMemo } from "react";
import { Code, Copy, Check, Sparkles, Download, FileCode2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JSON = `{
  "catalog": {
    "book": [
      {
        "id": "bk101",
        "author": "Gambardella, Matthew",
        "title": "XML Developer's Guide",
        "genre": "Computer",
        "price": 44.95,
        "publish_date": "2000-10-01"
      },
      {
        "id": "bk102",
        "author": "Ralls, Kim",
        "title": "Midnight Rain",
        "genre": "Fantasy",
        "price": 5.95,
        "publish_date": "2000-12-16"
      }
    ]
  }
}`;

export function JsonToXmlConverter() {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);
  const [rootTag, setRootTag] = useState<string>("root");
  const [copied, setCopied] = useState<boolean>(false);

  const { xmlOutput, isValid, errorMsg } = useMemo(() => {
    if (!jsonInput.trim()) return { xmlOutput: "", isValid: true, errorMsg: "" };

    try {
      const parsed = JSON.parse(jsonInput);

      const escapeXml = (unsafe: any): string => {
        return String(unsafe)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");
      };

      const toXml = (obj: any, indent: string = "  "): string => {
        if (obj === null || obj === undefined) return "";
        if (typeof obj !== "object") return escapeXml(obj);

        let xml = "";
        for (const prop in obj) {
          if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue;
          const val = obj[prop];

          // Sanitize XML tag name
          const tag = prop.replace(/[^a-zA-Z0-9_-]/g, "_") || "item";

          if (Array.isArray(val)) {
            for (const item of val) {
              if (typeof item === "object" && item !== null) {
                xml += `${indent}<${tag}>\n${toXml(item, indent + "  ")}\n${indent}</${tag}>\n`;
              } else {
                xml += `${indent}<${tag}>${escapeXml(item)}</${tag}>\n`;
              }
            }
          } else if (typeof val === "object" && val !== null) {
            xml += `${indent}<${tag}>\n${toXml(val, indent + "  ")}\n${indent}</${tag}>\n`;
          } else {
            xml += `${indent}<${tag}>${escapeXml(val)}</${tag}>\n`;
          }
        }
        return xml.trimEnd();
      };

      const root = rootTag.trim() || "root";
      const fullXml = `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>\n${toXml(parsed, "  ")}\n</${root}>`;

      return { xmlOutput: fullXml, isValid: true, errorMsg: "" };
    } catch (e: any) {
      return { xmlOutput: "", isValid: false, errorMsg: e.message || "Invalid JSON syntax" };
    }
  }, [jsonInput, rootTag]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(xmlOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!xmlOutput || !isValid) return;
    const blob = new Blob([xmlOutput], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `document_${Date.now()}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Root Tag Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-xs">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Root XML Element Tag
        </label>
        <input
          type="text"
          value={rootTag}
          onChange={(e) => setRootTag(e.target.value)}
          placeholder="root"
          className="w-full px-3 py-2 text-xs font-mono font-bold bg-background border border-border rounded-lg text-foreground"
        />
      </div>

      {/* JSON Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">JSON Input Payload</label>
          <span className="font-mono">In-Memory XML Serializer</span>
        </div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={7}
          placeholder="{ ... }"
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* XML Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-emerald-500" />
            Serialized XML Document
          </h4>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={!isValid || !xmlOutput}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .xml</span>
            </button>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy XML"}</span>
            </button>
          </div>
        </div>

        <pre
          className={`p-4 bg-card border border-border rounded-xl font-mono text-xs overflow-x-auto select-all max-h-80 ${
            isValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isValid ? xmlOutput : `// Error parsing JSON:\n${errorMsg}`}
        </pre>
      </div>
    </div>
  );
}
