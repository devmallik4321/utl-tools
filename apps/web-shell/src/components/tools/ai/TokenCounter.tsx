"use client";

import { useState } from "react";
import { Sparkles, DollarSign, Brain, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_PROMPT = `You are a Senior Principal Software Architect.
Analyze the following high-throughput API architecture and identify potential single points of failure, concurrency bottlenecks, and data consistency risks.

Please return your evaluation in structured markdown with actionable code remediation examples.`;

export function TokenCounter() {
  const [text, setText] = useState<string>(SAMPLE_PROMPT);
  const [copied, setCopied] = useState<boolean>(false);

  const estimateTokens = (input: string): number => {
    if (!input.trim()) return 0;
    // BPE tokenization approximation:
    // English text is ~4 chars per token.
    // Code/symbols/numbers are ~2.5 - 3 chars per token.
    const clean = input.trim();
    const words = clean.split(/\s+/).length;
    const chars = clean.length;

    // Weight based on code characters
    const codeChars = (clean.match(/[{}[\]()<>=;:,"`]/g) || []).length;
    const baseTokens = chars / 4;
    const adjustedTokens = Math.round(baseTokens + codeChars * 0.35);

    return Math.max(words, adjustedTokens);
  };

  const tokens = estimateTokens(text);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsPerToken = tokens > 0 ? (chars / tokens).toFixed(2) : "0.0";

  // Pricing calculations (per 1M input tokens)
  const gpt4oCost = ((tokens / 1000000) * 5.0).toFixed(5);
  const claude35Cost = ((tokens / 1000000) * 3.0).toFixed(5);
  const gemini15Cost = ((tokens / 1000000) * 1.25).toFixed(5);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Estimated Tokens
          </span>
          <p className="text-3xl sm:text-4xl font-black font-mono text-blue-600 dark:text-blue-400">
            {tokens.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground font-mono">~{charsPerToken} chars / token</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Word Count
          </span>
          <p className="text-3xl sm:text-4xl font-black font-mono text-foreground">
            {words.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground">Natural language words</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Characters
          </span>
          <p className="text-3xl sm:text-4xl font-black font-mono text-foreground">
            {chars.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground">Bytes / total string length</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Context % (128k)
          </span>
          <p className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {((tokens / 128000) * 100).toFixed(2)}%
          </p>
          <span className="text-xs text-muted-foreground">Of 128k context window</span>
        </div>
      </div>

      {/* Editor Textarea */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Prompt / Context Textarea
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
            <button
              type="button"
              onClick={() => setText("")}
              className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste prompt, JSON payload, code, or context here..."
          className="w-full p-4 text-xs sm:text-sm font-mono bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y leading-relaxed"
        />
      </div>

      {/* Model Cost Estimates Comparison */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Estimated LLM API Input Cost Comparison
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-foreground block">OpenAI GPT-4o</span>
              <span className="text-[10px] text-muted-foreground">$5.00 / 1M tokens</span>
            </div>
            <span className="font-mono font-bold text-sm text-foreground">${gpt4oCost}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-foreground block">Claude 3.5 Sonnet</span>
              <span className="text-[10px] text-muted-foreground">$3.00 / 1M tokens</span>
            </div>
            <span className="font-mono font-bold text-sm text-foreground">${claude35Cost}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-foreground block">Google Gemini 1.5 Pro</span>
              <span className="text-[10px] text-muted-foreground">$1.25 / 1M tokens</span>
            </div>
            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">${gemini15Cost}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
