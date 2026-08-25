"use client";

import { useState } from "react";
import { FileText, Code2, Copy, Check, Eye, Download } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_MARKDOWN = `# Project Roadmap & Architecture

Welcome to **UTL.tools** — the permanent digital toolbox!

## Key Features
- [x] 100% Client-side execution
- [x] Zero server tracking or telemetry
- [x] Sub-100ms instant responsiveness

### Code Example
\`\`\`javascript
function calculateEntropy(length, poolSize) {
  return Math.round(length * Math.log2(poolSize));
}
\`\`\`

> "Simple tools that solve everyday problems without friction."

| Utility Category | Tools Count | Status |
| :--- | :--- | :--- |
| Developer | 12+ | Production |
| Network | 8+ | Production |
| Finance | 6+ | Production |
`;

export function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);
  const [activeTab, setActiveTab] = useState<"preview" | "html">("preview");
  const [copied, setCopied] = useState<boolean>(false);

  // Lightweight, secure client-side Markdown to HTML parser
  const renderMarkdownToHtml = (md: string): string => {
    let html = md
      // Escape HTML entities to prevent XSS
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold mt-4 mb-1.5 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-5 mb-2 text-foreground border-b border-border pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black mt-2 mb-3 text-foreground">$1</h1>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-3 py-1 my-2 italic text-muted-foreground bg-muted/20 rounded-r">$1</blockquote>')
      // Code blocks
      .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre class="bg-muted p-3.5 rounded-xl font-mono text-xs overflow-x-auto my-3 text-foreground border border-border"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-blue-600 dark:text-blue-400">$1</code>')
      // Bold & Italic
      .replace(/\*\*([^*]+)\*\*/gim, '<strong class="font-bold text-foreground">$1</strong>')
      .replace(/\*([^*]+)\*/gim, '<em class="italic">$1</em>')
      // Checkbox list items
      .replace(/^- \[x\] (.*$)/gim, '<li class="flex items-center gap-2 list-none my-1"><span class="text-emerald-500 font-bold">☑</span> <span>$1</span></li>')
      .replace(/^- \[ \] (.*$)/gim, '<li class="flex items-center gap-2 list-none my-1"><span class="text-muted-foreground font-bold">☐</span> <span>$1</span></li>')
      // Unordered list items
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc my-1">$1</li>')
      // Tables (simple line-by-line replacement)
      .replace(/\|(.+)\|/gim, (match) => {
        const cells = match.split("|").slice(1, -1);
        if (cells.some((c) => c.includes("---"))) return ""; // separator
        const cellHtml = cells.map((c) => `<td class="border border-border px-3 py-1.5">${c.trim()}</td>`).join("");
        return `<tr class="hover:bg-muted/30">${cellHtml}</tr>`;
      })
      // Paragraphs
      .replace(/\n\s*\n/gim, '</p><p class="my-2 leading-relaxed text-foreground/90">');

    return `<div class="prose dark:prose-invert max-w-none text-xs sm:text-sm"><p class="my-2 leading-relaxed text-foreground/90">${html}</p></div>`;
  };

  const htmlOutput = renderMarkdownToHtml(markdown);

  const handleCopyHtml = async () => {
    const ok = await copyToClipboard(htmlOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Markdown Source Editor */}
        <div className="md:col-span-6 p-5 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Markdown Editor
            </span>
            <button
              type="button"
              onClick={() => setMarkdown("")}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              Clear
            </button>
          </div>

          <textarea
            rows={14}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type or paste markdown content here..."
            className="w-full p-4 font-mono text-xs bg-background border border-border rounded-xl focus:outline-none resize-y leading-relaxed"
          />
        </div>

        {/* Live Preview / HTML Output */}
        <div className="md:col-span-6 p-5 bg-card border border-border rounded-xl space-y-3 min-h-[380px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex gap-1 p-1 bg-muted rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                    activeTab === "preview" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Live Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("html")}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                    activeTab === "html" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" /> HTML Markup
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyHtml}
                className="px-3.5 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "HTML Copied!" : "Copy HTML"}</span>
              </button>
            </div>

            <div className="pt-3">
              {activeTab === "preview" ? (
                <div
                  className="p-4 bg-background border border-border rounded-xl min-h-[280px] overflow-y-auto leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: htmlOutput }}
                />
              ) : (
                <textarea
                  rows={12}
                  readOnly
                  value={htmlOutput}
                  className="w-full p-4 font-mono text-xs bg-muted/40 border border-border rounded-xl select-all focus:outline-none leading-relaxed"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
