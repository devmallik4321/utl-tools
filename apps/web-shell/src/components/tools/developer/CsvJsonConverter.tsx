"use client";

import { useState } from "react";
import { ArrowLeftRight, Copy, Check, Download, Table, FileSpreadsheet } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CSV = `id,name,role,department,salary
1,Sarah Connor,Security Lead,Engineering,125000
2,John Doe,Senior Architect,Infrastructure,140000
3,Elena Rostova,Data Scientist,Analytics,118000
4,Marcus Aurelius,Operations Manager,Strategy,132000`;

export function CsvJsonConverter() {
  const [direction, setDirection] = useState<"csvToJson" | "jsonToCsv">("csvToJson");
  const [inputData, setInputData] = useState<string>(SAMPLE_CSV);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const convertData = (): string => {
    setError("");
    if (!inputData.trim()) return "";

    try {
      if (direction === "csvToJson") {
        const lines = inputData.trim().split("\n");
        if (lines.length < 2) return "[]";

        const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const result = [];

        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ""));
          const obj: Record<string, any> = {};
          headers.forEach((header, idx) => {
            const val = currentLine[idx] ?? "";
            // Parse number if valid
            obj[header] = !isNaN(Number(val)) && val !== "" ? Number(val) : val;
          });
          result.push(obj);
        }

        return JSON.stringify(result, null, 2);
      } else {
        // JSON to CSV
        const parsed = JSON.parse(inputData);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error("JSON input must be a non-empty array of objects.");
        }

        const headers = Array.from(new Set(parsed.flatMap((item) => Object.keys(item))));
        const csvRows = [headers.join(delimiter)];

        parsed.forEach((item) => {
          const values = headers.map((header) => {
            let val = item[header] ?? "";
            if (typeof val === "object") val = JSON.stringify(val);
            if (String(val).includes(delimiter) || String(val).includes('"') || String(val).includes("\n")) {
              val = `"${String(val).replace(/"/g, '""')}"`;
            }
            return val;
          });
          csvRows.push(values.join(delimiter));
        });

        return csvRows.join("\n");
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse data. Please verify input formatting.");
      return "";
    }
  };

  const output = convertData();

  const handleCopy = async () => {
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: direction === "csvToJson" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = direction === "csvToJson" ? "converted-data.json" : "converted-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Direction Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDirection("csvToJson");
              setInputData(SAMPLE_CSV);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              direction === "csvToJson"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-muted"
            }`}
          >
            CSV to JSON
          </button>
          <button
            type="button"
            onClick={() => {
              setDirection("jsonToCsv");
              setInputData(output || "[\n  {\"id\": 1, \"name\": \"Alice\"}\n]");
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              direction === "jsonToCsv"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-muted"
            }`}
          >
            JSON to CSV
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-foreground">Delimiter:</label>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="px-3 py-1 text-xs bg-background border border-border rounded-lg focus:outline-none"
          >
            <option value=",">Comma (,)</option>
            <option value="&#9;">Tab (\t)</option>
            <option value=";">Semicolon (;)</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Input Text Area */}
        <div className="md:col-span-6 p-5 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {direction === "csvToJson" ? "Input CSV / TSV Data" : "Input JSON Array"}
            </span>
            <button
              type="button"
              onClick={() => setInputData("")}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              Clear
            </button>
          </div>

          <textarea
            rows={13}
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder={direction === "csvToJson" ? "Paste CSV rows here..." : "Paste JSON array here..."}
            className="w-full p-3 font-mono text-xs bg-background border border-border rounded-xl focus:outline-none resize-y"
          />

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded border border-rose-200">
              {error}
            </p>
          )}
        </div>

        {/* Output Text Area */}
        <div className="md:col-span-6 p-5 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {direction === "csvToJson" ? "Converted JSON Output" : "Converted CSV Output"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1 bg-muted text-foreground text-xs font-semibold rounded-lg border border-border hover:bg-muted/80 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <textarea
            rows={13}
            readOnly
            value={output}
            className="w-full p-3 font-mono text-xs bg-muted/40 border border-border rounded-xl select-all focus:outline-none resize-y"
          />
        </div>
      </div>
    </div>
  );
}
