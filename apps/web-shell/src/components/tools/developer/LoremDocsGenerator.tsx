"use client";

import { useState, useMemo } from "react";
import { FileText, Copy, Check, Sparkles, BookOpen } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const TEMPLATES: Record<string, { title: string; content: string }> = {
  api: {
    title: "REST API Endpoint Reference",
    content: `# Authentication API v1.0

The Authentication API provides stateless OAuth2 bearer token issuance and validation.

## Endpoints

### \`POST /v1/auth/token\`

Issue a new JSON Web Token (JWT) given valid client credentials.

#### Request Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| \`Authorization\` | string | Yes | Basic \`base64(client_id:client_secret)\` |
| \`Content-Type\` | string | Yes | \`application/json\` |

#### Request Payload
\`\`\`json
{
  "grant_type": "client_credentials",
  "scope": "read:analytics write:reports"
}
\`\`\`

#### Response \`200 OK\`
\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "Bearer",
  "expires_in": 3600
}
\`\`\`

> [!NOTE]
> Access tokens expire after 60 minutes. Refresh automatically in your client SDK.`,
  },
  getting_started: {
    title: "Developer Quickstart Guide",
    content: `# Quickstart Guide

Get up and running with the client-side utility SDK in under 2 minutes.

## 1. Installation

Install via npm or yarn:

\`\`\`bash
npm install @utl-tools/core
\`\`\`

## 2. Basic Usage

Import the client and initialize zero-knowledge computation:

\`\`\`typescript
import { createEngine } from '@utl-tools/core';

const engine = createEngine({
  deterministic: true,
  zeroKnowledge: true
});

const result = engine.compute({
  input: "user_payload_sample"
});

console.log("Output:", result);
\`\`\`

> [!TIP]
> All processing occurs entirely in-memory with zero network latency.`,
  },
  changelog: {
    title: "Changelog & Release Notes",
    content: `# Release v2.4.0 (2026-09-02)

## 🚀 New Features
- Added 10 high-intent developer and finance utilities.
- Pre-rendered 196 static HTML routes with Next.js SSG.
- Full TypeScript type-safety across all dynamic tool components.

## ⚡ Performance Improvements
- Reduced client bundle size by 14% via lazy dynamic imports.
- Instant zero-layout-shift UI hydration.

## 🐛 Bug Fixes
- Fixed minor precision rounding issue in compound growth matrix.
- Resolved dark-mode contrast styling on monospace code blocks.`,
  },
};

export function LoremDocsGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("api");
  const [copied, setCopied] = useState<boolean>(false);

  const docContent = TEMPLATES[selectedTemplate].content;

  const handleCopy = async () => {
    const ok = await copyToClipboard(docContent);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selector Bar */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider mr-1">
            Template:
          </span>
          {Object.entries(TEMPLATES).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                selectedTemplate === key
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 inline-flex items-center gap-1.5 shadow-2xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied Markdown!" : "Copy Markdown"}</span>
        </button>
      </div>

      {/* Generated Markdown Preview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-foreground overflow-x-auto select-all max-h-[500px]">
          {docContent}
        </pre>
      </div>
    </div>
  );
}
