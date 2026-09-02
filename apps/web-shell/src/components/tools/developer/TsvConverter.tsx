"use client";

import { useState, useMemo } from "react";
import { FileSpreadsheet, Copy, Check, Sparkles, FileCode, Table } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TSV = `id\tname\trole\tsalary\tdepartment
101\tAlice Smith\tSenior Engineer\t145000\tPlatform
102\tBob Johnson\tProduct Manager\t138000\tGrowth
103\tCarol Williams\tUX Designer\t122000\tDesign
104\tDavid Brown\tData Scientist\t150000\tAI/ML`;

export function TsvConverter() {
  const [tsvInput, setTsvInput] = useState<string>(SAMPLE_TSV);
  const [activeTab, setActiveTab] = useState<"json" | "csv" | "markdown">("json");
  const [copied, setCopied] = useState<boolean>(false);

  const { jsonOutput, csvOutput, markdownOutput, rowCount, colCount } = useMemo(() => {
    if (!tsvInput.trim()) {
      return { jsonOutput: "[]", csvOutput: "", markdownOutput: "", rowCount: 0, colCount: 0 };
    }

    const lines = tsvInput.trim().split(/\r?\n/).filter((l) => l.length > 0);
    if (lines.length === 0) {
      return { jsonOutput: "[]", csvOutput: "", markdownOutput: "", rowCount: 0, colCount: 0 };
    }

    const headers = lines[0].split("\t").map((h) => h.trim());
    const dataRows = lines.slice(1).map((l) => l.split("\t").map((c) => c.trim()));

    // 1. JSON Array of Objects
    const jsonArr = dataRows.map((row) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        const val = row[idx] !== undefined ? row[idx] : "";
        // Auto parse number or boolean
        if (/^-?\d+(\.\d+)?$/.test(val)) {
          obj[h] = Number(val);
        } else if (val.toLowerCase() === "true") {
          obj[h] = true;
        } else if (val.toLowerCase() === "false") {
          obj[h] = false;
        } else {
          obj[h] = val;
        }
      });
      return obj;
    });

    // 2. CSV Output
    const csvHeader = headers.map((h) => (h.includes(",") || h.includes('"') ? `"${h.replace(/"/g, '""')}"` : h)).join(",");
    const csvRows = dataRows.map((row) =>
      row.map((c) => (c.includes(",") || c.includes('"') ? `"${c.replace(/"/g, '""')}"` : c)).join(",")
    );
    const csv = [csvHeader, ...csvRows].join("\n");

    // 3. Markdown Output
    const mdHeader = `| ${headers.join(" | ")} |`;
    const mdSep = `| ${headers.map(() => "---").join(" | ")} |`;
    const mdRows = dataRows.map((r) => `| ${r.join(" | ")} |`);
    const md = [mdHeader, mdSep, ...mdRows].join("\n");

    return {
      jsonOutput: JSON.stringify(jsonArr, null, 2),
      csvOutput: csv,
      markdownOutput: md,
      rowCount: dataRows.length,
      colCount: headers.length,
    };
  }, [tsvInput]);

  const currentResult = activeTab === "json" ? jsonOutput : activeTab === "csv" ? csvOutput : markdownOutput;

  const handleCopy = async () => {
    const ok = await copyToClipboard(currentResult);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* TSV Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">Tab-Separated Values (TSV) Input</label>
          <span className="font-mono">Paste from Excel or Sheets</span>
        </div>
        <textarea
          value={tsvInput}
          onChange={(e) => setTsvInput(e.target.value)}
          rows={6}
          placeholder="Paste TSV data here..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Conversion Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Converted Output ({colCount} Columns × {rowCount} Rows)
            </h4>
            <div className="flex p-0.5 bg-muted rounded-lg border border-border text-xs">
              <button
                onClick={() => setActiveTab("json")}
                className={`px-2.5 py-0.5 rounded-md font-semibold ${
                  activeTab === "json" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setActiveTab("csv")}
                className={`px-2.5 py-0.5 rounded-md font-semibold ${
                  activeTab === "csv" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                }`}
              >
                CSV
              </button>
              <button
                onClick={() => setActiveTab("markdown")}
                className={`px-2.5 py-0.5 rounded-md font-semibold ${
                  activeTab === "markdown" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                }`}
              >
                Markdown
              </button>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : `Copy ${activeTab.toUpperCase()}`}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all max-h-96">
          {currentResult}
        </pre>
      </div>
    </div>
  );
}
