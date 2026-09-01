"use client";

import { useState } from "react";
import { Database, Copy, Check, Sparkles, Minimize2, Maximize2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_SQL = `select u.id, u.username, u.email, count(o.id) as total_orders, sum(o.total_amount) as lifetime_spend from users u left join orders o on u.id = o.user_id where u.created_at >= '2026-01-01' and u.status in ('active', 'verified') group by u.id, u.username, u.email having count(o.id) > 2 order by lifetime_spend desc limit 50;`;

export function SqlFormatter() {
  const [rawSql, setRawSql] = useState<string>(SAMPLE_SQL);
  const [indentSpaces, setIndentSpaces] = useState<number>(2);
  const [keywordCase, setKeywordCase] = useState<"upper" | "lower" | "preserve">("upper");
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");
  const [copied, setCopied] = useState<boolean>(false);

  // Client-side SQL Formatter
  const formatSql = (sql: string, indent: number, kCase: "upper" | "lower" | "preserve", isMinify: boolean): string => {
    if (!sql.trim()) return "";

    if (isMinify) {
      return sql
        .replace(/\s+/g, " ")
        .replace(/\s*([,;()=><])\s*/g, "$1 ")
        .trim();
    }

    const keywords = [
      "SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET",
      "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "CROSS JOIN", "JOIN", "ON",
      "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "UNION ALL", "UNION",
      "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "AND", "OR", "CASE", "WHEN", "THEN", "ELSE", "END", "AS", "IN", "NOT IN", "EXISTS", "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL", "ASC", "DESC"
    ];

    const majorClauses = [
      "SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET",
      "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "CROSS JOIN", "JOIN",
      "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "UNION ALL", "UNION"
    ];

    let clean = sql.replace(/\s+/g, " ").trim();

    // Standardize keywords casing
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      clean = clean.replace(regex, (match) => {
        if (kCase === "upper") return match.toUpperCase();
        if (kCase === "lower") return match.toLowerCase();
        return match;
      });
    });

    // Break lines before major clauses
    const spaceStr = " ".repeat(indent);
    majorClauses.forEach((kw) => {
      const targetKw = kCase === "lower" ? kw.toLowerCase() : kw;
      const regex = new RegExp(`\\s*\\b(${targetKw})\\b\\s*`, "gi");
      clean = clean.replace(regex, `\n$1\n${spaceStr}`);
    });

    // Clean up commas in SELECT / GROUP BY lists
    clean = clean.replace(/,\s*/g, `,\n${spaceStr}`);

    // Clean up multiple newlines
    const lines = clean
      .split("\n")
      .map((l) => l.trimEnd())
      .filter((l) => l.trim().length > 0);

    return lines.join("\n").trim();
  };

  const outputSql = formatSql(rawSql, indentSpaces, keywordCase, mode === "minify");

  const handleCopy = async () => {
    const ok = await copyToClipboard(outputSql);
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
          Formatter Controls
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mode:</span>
            <div className="flex p-0.5 bg-muted rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setMode("beautify")}
                className={`px-3 py-1 text-xs font-semibold rounded ${mode === "beautify" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}
              >
                Beautify
              </button>
              <button
                type="button"
                onClick={() => setMode("minify")}
                className={`px-3 py-1 text-xs font-semibold rounded ${mode === "minify" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}
              >
                Minify
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Keywords:</span>
            <select
              value={keywordCase}
              onChange={(e) => setKeywordCase(e.target.value as any)}
              className="text-xs px-2.5 py-1 bg-background border border-border rounded-lg"
            >
              <option value="upper">UPPERCASE (Standard)</option>
              <option value="lower">lowercase</option>
              <option value="preserve">Preserve</option>
            </select>
          </div>

          {mode === "beautify" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Indent:</span>
              <select
                value={indentSpaces}
                onChange={(e) => setIndentSpaces(parseInt(e.target.value))}
                className="text-xs px-2.5 py-1 bg-background border border-border rounded-lg"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Raw SQL Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-500" />
              Raw SQL Query
            </label>
            <span className="text-xs font-mono text-muted-foreground">{rawSql.length} chars</span>
          </div>
          <textarea
            rows={12}
            value={rawSql}
            onChange={(e) => setRawSql(e.target.value)}
            placeholder="Paste your unformatted SQL query here..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* Formatted Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              {mode === "beautify" ? "Formatted SQL" : "Minified SQL"}
            </label>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy SQL"}</span>
            </button>
          </div>
          <textarea
            rows={12}
            readOnly
            value={outputSql}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all"
          />
        </div>
      </div>
    </div>
  );
}
