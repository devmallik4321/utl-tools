"use client";

import { useState } from "react";
import { FileText, Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function LoremMarkdownGenerator() {
  const [includeHeadings, setIncludeHeadings] = useState<boolean>(true);
  const [includeLists, setIncludeLists] = useState<boolean>(true);
  const [includeTable, setIncludeTable] = useState<boolean>(true);
  const [includeCode, setIncludeCode] = useState<boolean>(true);
  const [includeQuotes, setIncludeQuotes] = useState<boolean>(true);
  const [paragraphsCount, setParagraphsCount] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);

  const generateMarkdown = (): string => {
    let md = "";

    if (includeHeadings) {
      md += `# Modern Web Development: Architectural Patterns\n\n`;
      md += `> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra\n\n`;
    }

    md += `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n`;

    if (includeHeadings) {
      md += `## 1. Core Principles & Design Invariants\n\n`;
    }

    md += `Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n`;

    if (includeLists) {
      md += `### Essential Checklist:\n\n`;
      md += `- [x] **Zero-Knowledge Architecture:** Client-side compute with zero remote telemetry leakage.\n`;
      md += `- [x] **Static Generation (SSG):** Instant page loads via global Edge CDN caching.\n`;
      md += `- [ ] **WCAG 2.1 Accessibility:** High-contrast text ratios across all theme modes.\n`;
      md += `- [ ] **Deterministic Testing:** Automated contract invariants and validation pipelines.\n\n`;
    }

    if (includeCode) {
      md += `### Implementation Example (TypeScript)\n\n`;
      md += `\`\`\`typescript\ninterface CacheConfig<T> {\n  key: string;\n  ttlMs: number;\n  fetcher: () => Promise<T>;\n}\n\nexport async function getOrSetCache<T>(config: CacheConfig<T>): Promise<T> {\n  const cached = localStorage.getItem(config.key);\n  if (cached) return JSON.parse(cached);\n  \n  const fresh = await config.fetcher();\n  localStorage.setItem(config.key, JSON.stringify(fresh));\n  return fresh;\n}\n\`\`\`\n\n`;
    }

    if (includeTable) {
      md += `### Performance Benchmark Comparison\n\n`;
      md += `| Framework / Pattern | Latency (TTFB) | First Contentful Paint | Bundle Size |\n`;
      md += `| :--- | :---: | :---: | :---: |\n`;
      md += `| **Next.js 14 SSG** | **12 ms** | **0.3s** | **88 kB** |\n`;
      md += `| Traditional SSR | 180 ms | 1.1s | 240 kB |\n`;
      md += `| Client Single-Page App | 85 ms | 1.8s | 512 kB |\n\n`;
    }

    if (includeQuotes) {
      md += `## Summary Note\n\n`;
      md += `> **Important Note:** Always measure empirical production metrics before attempting premature optimizations in web client applications.\n\n`;
    }

    return md.trim();
  };

  const markdownContent = generateMarkdown();

  const handleCopy = async () => {
    const ok = await copyToClipboard(markdownContent);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggles */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Include Markdown Elements
        </label>
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeHeadings}
              onChange={(e) => setIncludeHeadings(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>Headings (H1, H2, H3)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLists}
              onChange={(e) => setIncludeLists(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>Task Lists &amp; Bullets</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeTable}
              onChange={(e) => setIncludeTable(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>Markdown Table</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCode}
              onChange={(e) => setIncludeCode(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>TypeScript Code Block</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeQuotes}
              onChange={(e) => setIncludeQuotes(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <span>Blockquotes</span>
          </label>
        </div>
      </div>

      {/* Editor / Output */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-500" />
            Generated Markdown ({markdownContent.length} chars)
          </span>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Markdown"}</span>
          </button>
        </div>

        <textarea
          rows={14}
          readOnly
          value={markdownContent}
          className="w-full p-4 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all"
        />
      </div>
    </div>
  );
}
