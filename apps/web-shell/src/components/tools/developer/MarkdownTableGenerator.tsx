"use client";

import { useState, useMemo } from "react";
import { Table, Copy, Check, Plus, Trash2, Sparkles, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type Align = "left" | "center" | "right";

export function MarkdownTableGenerator() {
  const [headers, setHeaders] = useState<string[]>(["Feature", "Starter Plan", "Pro Plan", "Enterprise"]);
  const [alignments, setAlignments] = useState<Align[]>(["left", "center", "center", "center"]);
  const [rows, setRows] = useState<string[][]>([
    ["Client-Side Speed", "✓ Instant", "✓ Instant", "✓ Instant"],
    ["Zero Data Tracking", "✓ 100%", "✓ 100%", "✓ 100%"],
    ["Monthly Price", "$0 / mo", "$19 / mo", "$99 / mo"],
    ["Support SLA", "Community", "24/7 Priority", "Dedicated Engineer"],
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  const addColumn = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`]);
    setAlignments([...alignments, "left"]);
    setRows(rows.map((r) => [...r, ""]));
  };

  const removeColumn = (colIdx: number) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, i) => i !== colIdx));
    setAlignments(alignments.filter((_, i) => i !== colIdx));
    setRows(rows.map((r) => r.filter((_, i) => i !== colIdx)));
  };

  const addRow = () => {
    setRows([...rows, new Array(headers.length).fill("")]);
  };

  const removeRow = (rowIdx: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== rowIdx));
  };

  const updateHeader = (idx: number, val: string) => {
    const next = [...headers];
    next[idx] = val;
    setHeaders(next);
  };

  const updateCell = (rowIdx: number, colIdx: number, val: string) => {
    const next = rows.map((r, rI) => (rI === rowIdx ? r.map((c, cI) => (cI === colIdx ? val : c)) : r));
    setRows(next);
  };

  const toggleAlign = (colIdx: number) => {
    const order: Align[] = ["left", "center", "right"];
    const curr = alignments[colIdx] || "left";
    const nextAlign = order[(order.indexOf(curr) + 1) % order.length];
    const next = [...alignments];
    next[colIdx] = nextAlign;
    setAlignments(next);
  };

  const markdownOutput = useMemo(() => {
    if (headers.length === 0) return "";

    const headerLine = `| ${headers.map((h) => h.trim() || " ").join(" | ")} |`;
    const separatorLine = `| ${alignments
      .map((a) => {
        if (a === "center") return ":---:";
        if (a === "right") return "---:";
        return ":---";
      })
      .join(" | ")} |`;

    const rowLines = rows.map((r) => `| ${r.map((cell) => cell.trim() || " ").join(" | ")} |`);

    return [headerLine, separatorLine, ...rowLines].join("\n");
  }, [headers, alignments, rows]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(markdownOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Buttons */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={addColumn}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Column</span>
          </button>
          <button
            onClick={addRow}
            className="px-3 py-1.5 bg-card border border-border text-foreground hover:bg-muted text-xs font-bold rounded-lg inline-flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {headers.length} Columns × {rows.length} Rows
        </span>
      </div>

      {/* Interactive Table Grid */}
      <div className="border border-border rounded-xl overflow-x-auto bg-card">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {headers.map((h, colIdx) => (
                <th key={colIdx} className="p-2 min-w-36">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => updateHeader(colIdx, e.target.value)}
                      className="w-full px-2 py-1 bg-background border border-border rounded-md font-bold text-foreground font-mono"
                    />
                    <button
                      onClick={() => toggleAlign(colIdx)}
                      title={`Alignment: ${alignments[colIdx]}`}
                      className="p-1 text-muted-foreground hover:text-blue-600 bg-background border border-border rounded-md shrink-0"
                    >
                      {alignments[colIdx] === "left" && <AlignLeft className="w-3 h-3" />}
                      {alignments[colIdx] === "center" && <AlignCenter className="w-3 h-3" />}
                      {alignments[colIdx] === "right" && <AlignRight className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => removeColumn(colIdx)}
                      disabled={headers.length <= 1}
                      className="p-1 text-muted-foreground hover:text-rose-500 disabled:opacity-30 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="p-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-muted/20">
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="p-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                      className="w-full px-2 py-1 bg-background border border-border rounded-md text-foreground"
                    />
                  </td>
                ))}
                <td className="p-2 text-center">
                  <button
                    onClick={() => removeRow(rowIdx)}
                    disabled={rows.length <= 1}
                    className="text-muted-foreground hover:text-rose-500 disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generated Markdown Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Table className="w-4 h-4 text-emerald-500" />
            GitHub Flavored Markdown (GFM) Output
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Markdown!" : "Copy Markdown"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {markdownOutput}
        </pre>
      </div>
    </div>
  );
}
