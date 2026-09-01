"use client";

import { useState, useMemo } from "react";
import { ListFilter, Copy, Check, Sparkles, ArrowDownAZ, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_LIST = `apple
banana
Orange
apple
  banana  
Grape
mango
Orange
kiwi
`;

export function ListCleaner() {
  const [inputText, setInputText] = useState<string>(SAMPLE_LIST);
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [removeEmpty, setRemoveEmpty] = useState<boolean>(true);
  const [trimSpaces, setTrimSpaces] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<"none" | "az" | "za" | "num">("az");
  const [formatStyle, setFormatStyle] = useState<"lines" | "comma" | "quotes" | "json">("lines");
  const [copied, setCopied] = useState<boolean>(false);

  const { cleanedList, originalCount, uniqueCount, dupesRemoved, formattedOutput } = useMemo(() => {
    let lines = inputText.split("\n");
    const origCount = lines.length;

    if (trimSpaces) {
      lines = lines.map((l) => l.trim());
    }

    if (removeEmpty) {
      lines = lines.filter((l) => l.length > 0);
    }

    // Deduplicate
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const item of lines) {
      const key = caseSensitive ? item : item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    // Sort
    if (sortOrder === "az") {
      unique.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    } else if (sortOrder === "za") {
      unique.sort((a, b) => b.localeCompare(a, undefined, { sensitivity: "base" }));
    } else if (sortOrder === "num") {
      unique.sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
    }

    // Format output
    let output = "";
    if (formatStyle === "lines") {
      output = unique.join("\n");
    } else if (formatStyle === "comma") {
      output = unique.join(", ");
    } else if (formatStyle === "quotes") {
      output = unique.map((u) => `"${u}"`).join(", ");
    } else if (formatStyle === "json") {
      output = JSON.stringify(unique, null, 2);
    }

    return {
      cleanedList: unique,
      originalCount: origCount,
      uniqueCount: unique.length,
      dupesRemoved: Math.max(0, origCount - unique.length),
      formattedOutput: output,
    };
  }, [inputText, caseSensitive, removeEmpty, trimSpaces, sortOrder, formatStyle]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(formattedOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          List Cleaning &amp; Sorting Options
        </label>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={trimSpaces}
              onChange={(e) => setTrimSpaces(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>Trim Whitespace</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={removeEmpty}
              onChange={(e) => setRemoveEmpty(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>Remove Empty Lines</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>Case Sensitive Deduplication</span>
          </label>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="text-xs px-2 py-1 bg-background border border-border rounded-md"
            >
              <option value="none">Preserve Order</option>
              <option value="az">Alphabetical (A ➔ Z)</option>
              <option value="za">Reverse (Z ➔ A)</option>
              <option value="num">Numerical (1 ➔ 9)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Output Format:</span>
            <select
              value={formatStyle}
              onChange={(e) => setFormatStyle(e.target.value as any)}
              className="text-xs px-2 py-1 bg-background border border-border rounded-md"
            >
              <option value="lines">Line by Line</option>
              <option value="comma">Comma Separated (a, b, c)</option>
              <option value="quotes">Quoted CSV ("a", "b")</option>
              <option value="json">JSON Array ["a", "b"]</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inputs & Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input List */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Raw Input List
            </label>
            <span className="text-xs font-mono text-muted-foreground">{originalCount} items</span>
          </div>
          <textarea
            rows={12}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your raw list here (one item per line)..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* Cleaned Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Cleaned Unique Output
              </label>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {uniqueCount} unique
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy List"}</span>
            </button>
          </div>
          <textarea
            rows={12}
            readOnly
            value={formattedOutput}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all"
          />
        </div>
      </div>
    </div>
  );
}
