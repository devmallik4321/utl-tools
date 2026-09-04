'use client';

import React, { useState, useId, useMemo } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Code2,
  Zap,
  RotateCcw,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

const SAMPLE_CURL = `curl -X POST "https://api.example.com/v1/orders" \\
  -H "Authorization: Bearer my_api_secret_jwt_token" \\
  -H "Content-Type: application/json" \\
  -H "X-Client-ID: mobile-app-ios" \\
  -d '{"itemId": "prod-994", "quantity": 3, "giftWrap": true}'`;

export function CurlToHttpieConverter() {
  const inputId = useId();
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [copied, setCopied] = useState<boolean>(false);

  const parsed = useMemo(() => {
    let method = 'GET';
    let url = 'https://api.example.com/v1/orders';
    const headers: { name: string; value: string }[] = [];
    let jsonBody: Record<string, any> | null = null;
    let rawBody = '';

    // Method
    const methodMatch = curlInput.match(/-X\s+([A-Z]+)/i) || curlInput.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    } else if (curlInput.includes('-d ') || curlInput.includes('--data ') || curlInput.includes('--data-raw ')) {
      method = 'POST';
    }

    // URL
    const urlMatch = curlInput.match(/curl\s+(?:-[^\s]+\s+)*['"]?([^'"\s\\]+)['"]?/i);
    if (urlMatch) {
      url = urlMatch[1];
    }

    // Headers
    const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = headerRegex.exec(curlInput)) !== null) {
      const parts = match[1].split(':');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        headers.push({ name, value });
      }
    }

    // Data / Body
    const bodyMatch = curlInput.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?:\s|$)/);
    if (bodyMatch) {
      rawBody = bodyMatch[1];
      try {
        jsonBody = JSON.parse(rawBody);
      } catch {
        jsonBody = null;
      }
    }

    return { method, url, headers, jsonBody, rawBody };
  }, [curlInput]);

  const httpieCommand = useMemo(() => {
    const isHttps = parsed.url.startsWith('https://');
    const baseCmd = isHttps ? 'https' : 'http';

    // HTTPie method: if GET, method is optional; if POST with data, POST is implicit
    // But explicit method is clearer for complex commands
    const methodPart = parsed.method === 'GET' && !parsed.rawBody ? '' : `${parsed.method} `;

    // Headers in HTTPie format: Name:'Value'
    const headerParts = parsed.headers
      .filter((h) => h.name.toLowerCase() !== 'content-type') // HTTPie sets Content-Type automatically
      .map((h) => {
        if (h.name.toLowerCase() === 'authorization' && h.value.startsWith('Bearer ')) {
          return `-A bearer -a "${h.value.replace(/^Bearer\s+/, '')}"`;
        }
        return `"${h.name}:${h.value}"`;
      });

    // Body items in HTTPie format: key=val or key:=number/boolean
    const bodyParts: string[] = [];
    if (parsed.jsonBody && typeof parsed.jsonBody === 'object') {
      for (const [k, v] of Object.entries(parsed.jsonBody)) {
        if (typeof v === 'string') {
          bodyParts.push(`${k}="${v}"`);
        } else if (typeof v === 'number' || typeof v === 'boolean') {
          bodyParts.push(`${k}:=${v}`);
        } else if (v === null) {
          bodyParts.push(`${k}:='null'`);
        } else {
          bodyParts.push(`${k}:='${JSON.stringify(v)}'`);
        }
      }
    } else if (parsed.rawBody) {
      bodyParts.push(`<<< '${parsed.rawBody}'`);
    }

    // Combine
    const allArgs = [
      methodPart.trim(),
      `"${parsed.url}"`,
      ...headerParts,
      ...bodyParts,
    ].filter(Boolean);

    return `${baseCmd} ${allArgs.join(' \\\n  ')}`;
  }, [parsed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(httpieCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            cURL to HTTPie CLI Human-Friendly Syntax Converter
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied HTTPie' : 'Copy HTTPie Command'}
          </button>
          <button
            onClick={() => setCurlInput(SAMPLE_CURL)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sample
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* cURL Input */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              Source cURL Command
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              {parsed.method}
            </span>
          </div>

          <div>
            <label htmlFor={inputId} className="block text-xs font-medium text-slate-400 mb-1">
              Paste raw cURL syntax:
            </label>
            <textarea
              id={inputId}
              rows={8}
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed resize-none"
              placeholder="curl -X POST https://..."
            />
          </div>

          {/* Quick Info Tags */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Detected Parameters</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-sky-300 font-mono">
                Method: {parsed.method}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                Headers: {parsed.headers.length}
              </span>
              {parsed.jsonBody && (
                <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-[10px] text-emerald-300 font-mono border border-emerald-800/40">
                  JSON Fields: {Object.keys(parsed.jsonBody).length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* HTTPie Output */}
        <div className="lg:col-span-6 space-y-3">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Modern HTTPie Command
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">CLI Syntax</span>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800/80 leading-relaxed min-h-[160px]">
              <code>{httpieCommand}</code>
            </pre>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">HTTPie Syntax Rules Applied:</span>
            <ul className="list-disc list-inside space-y-0.5">
              <li><code>Header:Value</code> &mdash; HTTP request header</li>
              <li><code>field=value</code> &mdash; JSON string field</li>
              <li><code>number:=42</code> &mdash; Raw JSON non-string (numbers, booleans)</li>
              <li><code>-A bearer -a &quot;TOKEN&quot;</code> &mdash; Native Bearer token authorization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          Why Developers Prefer HTTPie over cURL for Terminal Testing
        </h4>
        <p>
          HTTPie provides clean, readable syntax designed specifically for debugging modern JSON APIs. Unlike cURL which requires cumbersome escape sequences (<code>-H &quot;Content-Type: application/json&quot; -d &apos;&#123;...&#125;&apos;</code>), HTTPie formats JSON automatically, colors output in the terminal, and formats nested fields effortlessly.
        </p>
      </div>
    </div>
  );
}

export default CurlToHttpieConverter;
