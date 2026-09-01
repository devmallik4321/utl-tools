"use client";

import { useState, useMemo } from "react";
import { GitCompare, Copy, Check, Sparkles, FileText, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_ORIGINAL = `The quick brown fox jumps over the lazy dog.
This agreement shall remain in effect for a period of 12 months.
All notices must be delivered via registered postal mail.`;

const SAMPLE_MODIFIED = `The fast brown fox leaps over the lazy dog.
This agreement shall remain in effect for an initial period of 24 months.
All notices must be delivered via email or registered postal mail.`;

export function TextDiffHighlighter() {
  const [originalText, setOriginalText] = useState<string>(SAMPLE_ORIGINAL);
  const [modifiedText, setModifiedText] = useState<string>(SAMPLE_MODIFIED);
  const [diffGranularity, setDiffGranularity] = useState<"word" | "char" | "line">("word");
  const [viewMode, setViewMode] = useState<"inline" | "split">("inline");
  const [copied, setCopied] = useState<boolean>(false);

  // Simple LCS word/token diff algorithm
  const diffResult = useMemo(() => {
    const tokenize = (text: string, gran: "word" | "char" | "line") => {
      if (gran === "line") return text.split("\n");
      if (gran === "char") return text.split("");
      // Split by words and whitespace
      return text.match(/\S+|\s+/g) || [];
    };

    const tokensA = tokenize(originalText, diffGranularity);
    const tokensB = tokenize(modifiedText, diffGranularity);

    // LCS table
    const n = tokensA.length;
    const m = tokensB.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (tokensA[i - 1] === tokensB[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to build diff segments
    let i = n;
    let j = m;
    const result: { type: "added" | "removed" | "unchanged"; value: string }[] = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && tokensA[i - 1] === tokensB[j - 1]) {
        result.unshift({ type: "unchanged", value: tokensA[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: "added", value: tokensB[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        result.unshift({ type: "removed", value: tokensA[i - 1] });
        i--;
      }
    }

    // Counts
    const addedCount = result.filter((r) => r.type === "added").length;
    const removedCount = result.filter((r) => r.type === "removed").length;
    const unchangedCount = result.filter((r) => r.type === "unchanged").length;
    const total = addedCount + removedCount + unchangedCount;
    const similarity = total > 0 ? ((unchangedCount / total) * 100).toFixed(1) : "100";

    return { segments: result, addedCount, removedCount, similarity };
  }, [originalText, modifiedText, diffGranularity]);

  const handleCopy = async () => {
    let summary = `Text Comparison Summary\n• Similarity: ${diffResult.similarity}%\n• Changes: +${diffResult.addedCount} additions, -${diffResult.removedCount} deletions\n\n`;
    summary += originalText === modifiedText ? "Text is identical." : "Differences detected.";
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Diff Settings
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Granularity:</span>
            <div className="flex p-0.5 bg-muted rounded-lg border border-border">
              {(["word", "char", "line"] as const).map((gran) => (
                <button
                  key={gran}
                  type="button"
                  onClick={() => setDiffGranularity(gran)}
                  className={`px-3 py-1 text-xs font-semibold rounded capitalize ${
                    diffGranularity === gran ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  {gran}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">View:</span>
            <div className="flex p-0.5 bg-muted rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setViewMode("inline")}
                className={`px-3 py-1 text-xs font-semibold rounded ${viewMode === "inline" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}
              >
                Unified Inline
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-3 py-1 text-xs font-semibold rounded ${viewMode === "split" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}
              >
                Side-by-Side
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Original Text
            </label>
            <span className="text-xs font-mono text-muted-foreground">{originalText.length} chars</span>
          </div>
          <textarea
            rows={7}
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Modified Text
            </label>
            <span className="text-xs font-mono text-muted-foreground">{modifiedText.length} chars</span>
          </div>
          <textarea
            rows={7}
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
      </div>

      {/* Visual Diff Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-blue-500" />
              Visual Diff Result
            </h4>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{diffResult.addedCount} additions</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">-{diffResult.removedCount} deletions</span>
              <span className="text-muted-foreground">({diffResult.similarity}% match)</span>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        {/* Diff Canvas */}
        <div className="p-4 bg-card rounded-xl border border-border font-mono text-xs sm:text-sm leading-relaxed min-h-[140px] whitespace-pre-wrap select-text">
          {diffResult.segments.map((seg, idx) => {
            if (seg.type === "added") {
              return (
                <span
                  key={idx}
                  className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 px-0.5 rounded font-bold underline decoration-emerald-500"
                >
                  {seg.value}
                </span>
              );
            }
            if (seg.type === "removed") {
              return (
                <span
                  key={idx}
                  className="bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 line-through px-0.5 rounded opacity-75"
                >
                  {seg.value}
                </span>
              );
            }
            return <span key={idx}>{seg.value}</span>;
          })}
        </div>
      </div>
    </div>
  );
}
