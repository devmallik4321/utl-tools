"use client";

import { useState, useMemo } from "react";
import { Table, Copy, Check, Download, Filter, Sparkles, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CSV = `id,first_name,last_name,email,department,salary,status
101,John,Doe,john@example.com,Engineering,115000,Active
102,Jane,Smith,jane@example.com,Marketing,95000,Active
103,Alex,Taylor,alex@example.com,Design,88000,Pending
104,Sarah,Connor,sarah@example.com,Engineering,130000,Active
105,Michael,Scott,michael@example.com,Sales,75000,Inactive`;

export function CsvColumnExtractor() {
  const [csvInput, setCsvInput] = useState<string>(SAMPLE_CSV);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["first_name", "last_name", "email", "department"]);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [dropEmpty, setDropEmpty] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Parse CSV
  const { headers, rows } = useMemo(() => {
    const lines = csvInput.trim().split("\n").filter(Boolean);
    if (lines.length === 0) return { headers: [], rows: [] };

    const rawHeaders = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    const dataRows = lines.slice(1).map((l) => {
      const cols = l.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const rowObj: Record<string, string> = {};
      rawHeaders.forEach((h, i) => {
        rowObj[h] = cols[i] || "";
      });
      return rowObj;
    });

    return { headers: rawHeaders, rows: dataRows };
  }, [csvInput]);

  const toggleColumn = (col: string) => {
    if (selectedColumns.includes(col)) {
      if (selectedColumns.length > 1) {
        setSelectedColumns(selectedColumns.filter((c) => c !== col));
      }
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (searchFilter) {
        const matches = Object.values(r).some((v) => v.toLowerCase().includes(searchFilter.toLowerCase()));
        if (!matches) return false;
      }
      if (dropEmpty) {
        const hasEmptySelected = selectedColumns.some((col) => !r[col] || r[col].trim() === "");
        if (hasEmptySelected) return false;
      }
      return true;
    });
  }, [rows, searchFilter, dropEmpty, selectedColumns]);

  // Formatted CSV output
  const outputCsv = useMemo(() => {
    if (selectedColumns.length === 0 || filteredRows.length === 0) return "";
    const headerLine = selectedColumns.join(",");
    const rowLines = filteredRows.map((r) => selectedColumns.map((c) => r[c] || "").join(","));
    return [headerLine, ...rowLines].join("\n");
  }, [selectedColumns, filteredRows]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(outputCsv);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted_columns.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Input CSV Box */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">Raw CSV Dataset Input</label>
          <span>{rows.length} records parsed ({headers.length} columns)</span>
        </div>
        <textarea
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          rows={5}
          placeholder="Paste CSV text here..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Column Selectors & Filters */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Select Columns to Extract ({selectedColumns.length}/{headers.length})
          </span>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setSelectedColumns([...headers])}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Select All
            </button>
            <span>•</span>
            <button
              onClick={() => setSelectedColumns(headers.slice(0, 2))}
              className="text-muted-foreground hover:underline"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {headers.map((h) => {
            const isSelected = selectedColumns.includes(h);
            return (
              <button
                key={h}
                onClick={() => toggleColumn(h)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {h}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search / filter rows..."
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg"
            />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dropEmpty}
              onChange={(e) => setDropEmpty(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600"
            />
            <span>Drop rows with missing values</span>
          </label>
        </div>
      </div>

      {/* Extracted Output Table & Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Table className="w-4 h-4 text-emerald-500" />
            Extracted CSV Output ({filteredRows.length} rows)
          </h4>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy CSV"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 inline-flex items-center gap-1 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-x-auto bg-card">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border text-foreground font-bold">
              <tr>
                {selectedColumns.map((c) => (
                  <th key={c} className="px-3 py-2 font-mono">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {filteredRows.slice(0, 10).map((r, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  {selectedColumns.map((c) => (
                    <td key={c} className="px-3 py-2 truncate max-w-xs">{r[c]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
