"use client";

import { useState } from "react";
import { Code, FileText, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_HTML = `<h1>Getting Started with Next.js</h1>
<p>Next.js is a flexible <strong>React framework</strong> that gives you building blocks to create fast, full-stack web applications.</p>
<h2>Key Features</h2>
<ul>
  <li>Server-Side Rendering (SSR)</li>
  <li>Static Site Generation (SSG)</li>
  <li>Built-in TypeScript Support</li>
</ul>
<p>Check out the official <a href="https://nextjs.org">Next.js Documentation</a> for guides and tutorials.</p>`;

export function HtmlToMarkdownConverter() {
  const [htmlInput, setHtmlInput] = useState<string>(SAMPLE_HTML);
  const [copied, setCopied] = useState<boolean>(false);

  // Client-side HTML to Markdown Converter
  const convertToMarkdown = (html: string): string => {
    if (!html.trim()) return "";

    try {
      if (typeof window === "undefined") return html;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || "";
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return "";

        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        let childrenText = Array.from(el.childNodes).map(processNode).join("");

        switch (tag) {
          case "h1": return `\n# ${childrenText.trim()}\n\n`;
          case "h2": return `\n## ${childrenText.trim()}\n\n`;
          case "h3": return `\n### ${childrenText.trim()}\n\n`;
          case "h4": return `\n#### ${childrenText.trim()}\n\n`;
          case "h5": return `\n##### ${childrenText.trim()}\n\n`;
          case "h6": return `\n###### ${childrenText.trim()}\n\n`;
          case "p": return `${childrenText.trim()}\n\n`;
          case "strong":
          case "b": return `**${childrenText}**`;
          case "em":
          case "i": return `*${childrenText}*`;
          case "code": return `\`${childrenText}\``;
          case "pre": return `\n\`\`\`\n${childrenText.trim()}\n\`\`\`\n\n`;
          case "blockquote": return `\n> ${childrenText.trim()}\n\n`;
          case "a": {
            const href = el.getAttribute("href") || "#";
            return `[${childrenText}](${href})`;
          }
          case "img": {
            const src = el.getAttribute("src") || "";
            const alt = el.getAttribute("alt") || "Image";
            return `![${alt}](${src})`;
          }
          case "ul": return `${childrenText}\n`;
          case "ol": return `${childrenText}\n`;
          case "li": {
            const parentTag = el.parentElement?.tagName.toLowerCase();
            return parentTag === "ol" ? `1. ${childrenText.trim()}\n` : `- ${childrenText.trim()}\n`;
          }
          case "hr": return `\n---\n\n`;
          case "br": return `\n`;
          default: return childrenText;
        }
      };

      const md = Array.from(doc.body.childNodes).map(processNode).join("");
      return md.replace(/\n{3,}/g, "\n\n").trim();
    } catch {
      return "Conversion error.";
    }
  };

  const markdownOutput = convertToMarkdown(htmlInput);

  const handleCopy = async () => {
    const ok = await copyToClipboard(markdownOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HTML Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-500" />
              Raw HTML Input
            </label>
            <span className="text-xs text-muted-foreground font-mono">{htmlInput.length} chars</span>
          </div>
          <textarea
            rows={12}
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder="Paste raw HTML tags and markup here..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* Markdown Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-500" />
              Converted Markdown
            </label>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Markdown"}</span>
            </button>
          </div>
          <textarea
            rows={12}
            readOnly
            value={markdownOutput}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all"
          />
        </div>
      </div>
    </div>
  );
}
