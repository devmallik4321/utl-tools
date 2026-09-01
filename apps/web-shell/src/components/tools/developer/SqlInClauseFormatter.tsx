"use client";

import { useState, useMemo } from "react";
import { Database, Copy, Check, Sparkles, Filter, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_IDS = `usr_98124
usr_88219
usr_77312
usr_98124
usr_12093
usr_66541
usr_44321`;

export function SqlInClauseFormatter() {
  const [rawInput, setRawInput] = useState<string>(SAMPLE_IDS);
  const [columnName, setColumnName] = useState<string>("user_id");
  const [quoteStyle, setQuoteStyle] = useState<"single" | "double" | "none" | "backtick">("single");
  const [deduplicate, setDeduplicate] = useState<boolean>(true);
  const [chunkSize, setChunkSize] = useState<number>(1000);
  const [includeWhere, setIncludeWhere] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const { outputSql, rawCount, distinctCount, chunksCount } = useMemo(() => {
    let items = rawInput
      .split(/[\r\n,;\t]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const totalRaw = items.length;

    if (deduplicate) {
      items = Array.from(new Set(items));
    }

    const totalDistinct = items.length;

    if (totalDistinct === 0) {
      return { outputSql: "-- Paste items above to generate SQL IN clause", rawCount: 0, distinctCount: 0, chunksCount: 0 };
    }

    const formatItem = (val: string) => {
      if (quoteStyle === "single") return `'${val.replace(/'/g, "''")}'`;
      if (quoteStyle === "double") return `"${val.replace(/"/g, '""')}"`;
      if (quoteStyle === "backtick") return `\`${val}\``;
      return val;
    };

    // Chunking logic (e.g. for Oracle 1000-item limit)
    const chunks: string[][] = [];
    const size = Math.max(1, chunkSize);
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }

    const clauseParts = chunks.map((chunk) => {
      const formattedList = chunk.map(formatItem).join(", ");
      const col = columnName.trim() || "id";
      return `${col} IN (${formattedList})`;
    });

    const prefix = includeWhere ? "WHERE " : "";
    const sql = prefix + clauseParts.join("\n   OR ");

    return {
      outputSql: sql,
      rawCount: totalRaw,
      distinctCount: totalDistinct,
      chunksCount: chunks.length,
    };
  }, [rawInput, columnName, quoteStyle, deduplicate, chunkSize, includeWhere]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(outputSql);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Configuration Bar */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1">
              Column / Field Name
            </label>
            <input
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="e.g. user_id, email"
              className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1">
              Quotation Style
            </label>
            <select
              value={quoteStyle}
              onChange={(e) => setQuoteStyle(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg"
            >
              <option value="single">Single Quotes ('string')</option>
              <option value="double">Double Quotes ("string")</option>
              <option value="none">No Quotes (Numeric 123)</option>
              <option value="backtick">Backticks (`name`)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1">
              Batch Chunk Size
            </label>
            <input
              type="number"
              min={1}
              max={5000}
              value={chunkSize}
              onChange={(e) => setChunkSize(Math.max(1, parseInt(e.target.value) || 1000))}
              className="w-full px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1.5 pt-1 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={deduplicate}
                onChange={(e) => setDeduplicate(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <span>Deduplicate Unique ({distinctCount})</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeWhere}
                onChange={(e) => setIncludeWhere(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <span>Include "WHERE" prefix</span>
            </label>
          </div>
        </div>
      </div>

      {/* Input / Output Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="font-semibold uppercase text-foreground">Raw Items / IDs List</span>
            <span>{rawCount} total lines ({distinctCount} distinct)</span>
          </div>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={8}
            placeholder="Paste list of IDs here (one per line, comma or tab separated)..."
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              SQL Query IN Clause ({chunksCount} chunk{chunksCount !== 1 ? "s" : ""})
            </span>
            <button
              onClick={handleCopy}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy SQL"}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={outputSql}
            rows={8}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none select-all text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>
    </div>
  );
}
