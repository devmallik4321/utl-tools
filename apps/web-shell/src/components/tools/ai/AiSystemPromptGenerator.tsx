"use client";

import { useState } from "react";
import { Sparkles, Bot, ShieldAlert, Code, Copy, Check, Plus, Trash2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface FewShotExample {
  id: string;
  input: string;
  output: string;
}

export function AiSystemPromptGenerator() {
  const [role, setRole] = useState<string>("Senior TypeScript & Next.js Software Architect");
  const [objective, setObjective] = useState<string>("Provide concise, production-ready code solutions with zero boilerplate, following strict type-safety and web performance invariants.");
  const [constraints, setConstraints] = useState<string[]>(
    [
      "Never use 'any' types; provide explicit interfaces.",
      "Do not output conversational filler or self-congratulatory intros.",
      "Execute calculations locally and verify mathematical invariants.",
      "Preserve existing codebase structure and comments.",
    ]
  );
  const [format, setFormat] = useState<"markdown" | "json" | "xml">("markdown");
  const [examples, setExamples] = useState<FewShotExample[]>([
    { id: "1", input: "User asks for a debounce helper in TypeScript.", output: "```typescript\nexport function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {\n  let timeoutId: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn(...args), delay);\n  };\n}\n```" }
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  // Construct generated prompt
  const generatePrompt = (): string => {
    let prompt = `You are a ${role}.\n\n`;
    prompt += `## PRIMARY OBJECTIVE\n${objective}\n\n`;

    if (constraints.length > 0) {
      prompt += `## BEHAVIORAL CONSTRAINTS & RULES\n`;
      constraints.forEach((c) => {
        if (c.trim()) prompt += `- ${c.trim()}\n`;
      });
      prompt += `\n`;
    }

    prompt += `## OUTPUT FORMAT\n`;
    if (format === "json") {
      prompt += `Output strictly valid RFC 8259 JSON without surrounding markdown blocks or markdown formatting.\n\n`;
    } else if (format === "xml") {
      prompt += `Enclose structured data within explicit XML semantic tags (e.g. <response>, <data>, <analysis>).\n\n`;
    } else {
      prompt += `Format responses with clean, semantic GitHub-flavored Markdown with clear headings and syntax-highlighted code blocks.\n\n`;
    }

    if (examples.length > 0) {
      prompt += `## FEW-SHOT DEMONSTRATIONS\n`;
      examples.forEach((ex, idx) => {
        if (ex.input.trim() || ex.output.trim()) {
          prompt += `### Example ${idx + 1}\n**Input:**\n${ex.input.trim()}\n\n**Output:**\n${ex.output.trim()}\n\n`;
        }
      });
    }

    return prompt.trim();
  };

  const fullPrompt = generatePrompt();

  const handleCopy = async () => {
    const ok = await copyToClipboard(fullPrompt);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addConstraint = () => {
    setConstraints((prev) => [...prev, ""]);
  };

  const updateConstraint = (index: number, val: string) => {
    setConstraints((prev) => prev.map((c, i) => (i === index ? val : c)));
  };

  const removeConstraint = (index: number) => {
    setConstraints((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Role & Objective */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-purple-500" />
            1. Role / Persona Definition
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg"
            placeholder="e.g. Senior Machine Learning Engineer"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Code className="w-4 h-4 text-blue-500" />
            2. Output Format Style
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg"
          >
            <option value="markdown">Markdown (Headings, bullet points, code blocks)</option>
            <option value="json">Strict JSON (Raw data schema output)</option>
            <option value="xml">XML Semantic Tags (&lt;data&gt; tags)</option>
          </select>
        </div>
      </div>

      {/* Primary Objective */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          3. Core Mission &amp; Objective
        </label>
        <textarea
          rows={3}
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          className="w-full p-2.5 text-xs sm:text-sm bg-background border border-border rounded-lg resize-y focus:outline-none"
        />
      </div>

      {/* Rules & Negative Constraints */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            4. Behavioral Rules &amp; Invariants
          </label>
          <button
            type="button"
            onClick={addConstraint}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rule</span>
          </button>
        </div>

        <div className="space-y-2">
          {constraints.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={c}
                onChange={(e) => updateConstraint(i, e.target.value)}
                placeholder="e.g. Do not output conversational filler"
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeConstraint(i)}
                className="p-1.5 text-muted-foreground hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Generated System Prompt */}
      <div className="p-5 bg-muted/40 border border-border rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Generated System Prompt ({fullPrompt.length} chars)
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy System Prompt"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card rounded-xl border border-border font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap select-all">
          {fullPrompt}
        </pre>
      </div>
    </div>
  );
}
