"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Wand2, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function PromptEnhancer() {
  const [role, setRole] = useState<string>("Senior Software Engineer");
  const [goal, setGoal] = useState<string>("Write a production-ready Next.js 14 API route that handles Stripe webhook events with signature verification.");
  const [outputFormat, setOutputFormat] = useState<string>("Clean TypeScript code + step-by-step setup guide");
  const [constraints, setConstraints] = useState<string>("No external heavy dependencies. Strict type safety and error logging.");
  const [copied, setCopied] = useState<boolean>(false);

  const getStructuredPrompt = (): string => {
    return `### Role & Persona:
You are an expert ${role}. You provide concise, production-grade solutions following industry best practices and defensive programming.

### Primary Objective:
${goal}

### Constraints & Quality Standards:
- ${constraints.split(".").filter(Boolean).map((s) => s.trim()).join("\n- ")}
- Prioritize high performance, clean readability, and maintainability.
- Avoid unnecessary placeholder comments or incomplete pseudocode.

### Required Output Format:
${outputFormat}

### Context & Execution:
Please reason step-by-step before delivering the final artifact.`;
  };

  const enhancedPrompt = getStructuredPrompt();

  const handleCopy = async () => {
    const ok = await copyToClipboard(enhancedPrompt);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Parameters Form */}
        <div className="lg:col-span-6 p-5 bg-card border border-border rounded-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              AI Persona / System Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Backend Architect, Technical Copywriter"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Core Objective / Task
            </label>
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What should the AI accomplish?"
              className="w-full p-3 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Constraints & Rules
            </label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. Under 200 words. No buzzwords. Use TypeScript."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Desired Output Format
            </label>
            <input
              type="text"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              placeholder="e.g. JSON schema, Markdown table, Step-by-step"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
            />
          </div>
        </div>

        {/* Structured Result Output */}
        <div className="lg:col-span-6 p-5 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Structured AI Prompt
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Prompt!" : "Copy Prompt"}</span>
            </button>
          </div>

          <textarea
            rows={12}
            readOnly
            value={enhancedPrompt}
            className="w-full p-4 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-xl focus:outline-none resize-y leading-relaxed select-all"
          />
        </div>
      </div>
    </div>
  );
}
