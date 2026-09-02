"use client";

import { useState, useMemo } from "react";
import { FileSpreadsheet, Copy, Check, Sparkles, Download, Code } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JSON = `[
  { "id": 101, "name": "Alice Smith", "email": "alice@example.com", "role": "Engineer", "active": true },
  { "id": 102, "name": "Bob Jones", "email": "bob@example.com", "role": "Designer", "active": false },
  { "id": 103, "name": "Charlie Brown", "email": "charlie@example.com", "role": "Product", "active": true }
]`;

export function JsonToCsvConverter() {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);
  const [copied, setCopied] = useState<boolean>(false);

  const { csvOutput, rowCount, isValid } = useMemo(() => {
    if (!jsonInput.trim()) return { csvOutput: "", rowCount: 0, isValid: true };

    try {
      const parsed = JSON.parse(jsonInput);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      if (items.length === 0 || typeof items[0] !== "object") {
        return { csvOutput: "// Please provide an array of JSON objects.", rowCount: 0, isValid: false };
      }

      // Collect all unique column headers
      const headers = Array.from(new Set(items.flatMap((obj) => Object.keys(obj))));

      const escapeField = (val: any): string => {
        if (val === null || val === undefined) return "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows: string[] = [];
      // Header row
      rows.push(headers.map(escapeField).join(","));

      // Data rows
      for (const item of items) {
        const row = headers.map((h) => escapeField(item[h]));
        rows.push(row.join(","));
      }

      return { csvOutput: rows.join("\n"), rowCount: items.length, isValid: true };
    } catch {
      return { csvOutput: "// Error: Invalid JSON syntax. Please verify commas and curly braces.", rowCount: 0, isValid: false };
    }
  }, [jsonInput]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(csvOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!csvOutput || !isValid) return;
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted_data_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* JSON Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">JSON Input (Array of Objects)</label>
          <span className="font-mono">RFC 4180 CSV Engine</span>
        </div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={6}
          placeholder="[ { ... } ]"
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* CSV Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Generated CSV Output ({rowCount} Rows)
          </h4>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={!isValid || !csvOutput}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .csv</span>
            </button>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy CSV"}</span>
            </button>
          </div>
        </div>

        <pre
          className={`p-4 bg-card border border-border rounded-xl font-mono text-xs overflow-x-auto select-all max-h-64 ${
            isValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {csvOutput}
        </pre>
      </div>
    </div>
  );
}
