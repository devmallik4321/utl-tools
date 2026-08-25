"use client";

import { useState } from "react";
import { Columns, AlignLeft, Copy, Check, RefreshCw, Plus, Minus, Equal } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_ORIGINAL = `function calculateTotal(items) {
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    subtotal += items[i].price;
  }
  return subtotal;
}`;

const SAMPLE_MODIFIED = `function calculateTotal(items, taxRate = 0.05) {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price;
  }
  const tax = subtotal * taxRate;
  return subtotal + tax;
}`;

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
  origLineNo?: number;
  modLineNo?: number;
}

export function DiffChecker() {
  const [originalText, setOriginalText] = useState<string>(SAMPLE_ORIGINAL);
  const [modifiedText, setModifiedText] = useState<string>(SAMPLE_MODIFIED);
  const [viewMode, setViewMode] = useState<"split" | "unified">("unified");
  const [copied, setCopied] = useState<boolean>(false);

  // Simple Longest Common Subsequence (LCS) line diff algorithm
  const computeDiff = (): DiffLine[] => {
    const origLines = originalText.split("\n");
    const modLines = modifiedText.split("\n");

    const m = origLines.length;
    const n = modLines.length;

    // LCS Matrix
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (origLines[i - 1] === modLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to get diff
    const result: DiffLine[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
        result.unshift({ type: "unchanged", text: origLines[i - 1], origLineNo: i, modLineNo: j });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: "added", text: modLines[j - 1], modLineNo: j });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        result.unshift({ type: "removed", text: origLines[i - 1], origLineNo: i });
        i--;
      }
    }

    return result;
  };

  const diffLines = computeDiff();
  const addedCount = diffLines.filter((l) => l.type === "added").length;
  const removedCount = diffLines.filter((l) => l.type === "removed").length;
  const unchangedCount = diffLines.filter((l) => l.type === "unchanged").length;

  const handleCopy = async () => {
    const output = diffLines
      .map((l) => (l.type === "added" ? `+ ${l.text}` : l.type === "removed" ? `- ${l.text}` : `  ${l.text}`))
      .join("\n");
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Editors Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Original Text / Code
            </span>
            <button
              type="button"
              onClick={() => setOriginalText("")}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={8}
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste original text here..."
            className="w-full p-3 font-mono text-xs bg-background border border-border rounded-lg focus:outline-none resize-y"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Modified Text / Code
            </span>
            <button
              type="button"
              onClick={() => setModifiedText("")}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={8}
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste modified text here..."
            className="w-full p-3 font-mono text-xs bg-background border border-border rounded-lg focus:outline-none resize-y"
          />
        </div>
      </div>

      {/* Difference Statistics & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> {addedCount} Additions
          </span>
          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <Minus className="w-3.5 h-3.5" /> {removedCount} Deletions
          </span>
          <span className="text-muted-foreground flex items-center gap-1">
            <Equal className="w-3.5 h-3.5" /> {unchangedCount} Unchanged
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 bg-muted rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("unified")}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === "unified" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" /> Unified View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === "split" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Side-by-Side
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Diff"}</span>
          </button>
        </div>
      </div>

      {/* Diff Result Rendering Canvas */}
      <div className="p-4 bg-card border border-border rounded-xl font-mono text-xs overflow-x-auto">
        {viewMode === "unified" ? (
          <div className="divide-y divide-border/20">
            {diffLines.map((line, idx) => (
              <div
                key={idx}
                className={`py-1 px-2 flex items-start gap-3 ${
                  line.type === "added"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium"
                    : line.type === "removed"
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 line-through opacity-80"
                    : "text-foreground hover:bg-muted/30"
                }`}
              >
                <span className="w-5 select-none font-bold text-center shrink-0">
                  {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                </span>
                <span className="whitespace-pre-wrap break-all flex-1">{line.text || " "}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 divide-x divide-border">
            <div className="space-y-0.5 pr-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase pb-1 block">Original</span>
              {diffLines.filter((l) => l.type !== "added").map((line, idx) => (
                <div
                  key={idx}
                  className={`py-0.5 px-1.5 whitespace-pre-wrap break-all ${
                    line.type === "removed"
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300"
                      : "text-foreground"
                  }`}
                >
                  {line.text || " "}
                </div>
              ))}
            </div>
            <div className="space-y-0.5 pl-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase pb-1 block">Modified</span>
              {diffLines.filter((l) => l.type !== "removed").map((line, idx) => (
                <div
                  key={idx}
                  className={`py-0.5 px-1.5 whitespace-pre-wrap break-all ${
                    line.type === "added"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                      : "text-foreground"
                  }`}
                >
                  {line.text || " "}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
