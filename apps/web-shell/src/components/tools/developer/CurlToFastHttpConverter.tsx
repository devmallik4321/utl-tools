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
  Layers
} from 'lucide-react';

const SAMPLE_CURL = `curl -X POST "https://api.fastservice.internal/v1/telemetry/events" \\
  -H "Authorization: Bearer go_fasthttp_token_889" \\
  -H "Content-Type: application/json" \\
  -H "X-Client-Version: 2.4.0" \\
  -d '{"batchId": "b-9021", "eventCount": 42, "compressed": false}'`;

export function CurlToFastHttpConverter() {
  const curlInputId = useId();
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [copied, setCopied] = useState<boolean>(false);

  const parsed = useMemo(() => {
    let method = 'GET';
    let url = 'https://api.fastservice.internal/v1/telemetry/events';
    const headers: { name: string; value: string }[] = [];
    let body = '';

    const methodMatch = curlInput.match(/-X\s+([A-Z]+)/i) || curlInput.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    } else if (curlInput.includes('-d ') || curlInput.includes('--data ') || curlInput.includes('--data-raw ')) {
      method = 'POST';
    }

    const urlMatch = curlInput.match(/curl\s+(?:-[^\s]+\s+)*['"]?([^'"\s\\]+)['"]?/i);
    if (urlMatch) {
      url = urlMatch[1];
    }

    const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = headerRegex.exec(curlInput)) !== null) {
      const parts = match[1].split(':');
      if (parts.length >= 2) {
        headers.push({
          name: parts[0].trim(),
          value: parts.slice(1).join(':').trim(),
        });
      }
    }

    const bodyMatch = curlInput.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?:\s|$)/);
    if (bodyMatch) {
      body = bodyMatch[1];
    }

    return { method, url, headers, body };
  }, [curlInput]);

  const generatedGoCode = useMemo(() => {
    const headerLines = parsed.headers
      .map((h) => `\treq.Header.Set("${h.name}", "${h.value}")`)
      .join('\n');

    const bodySection = parsed.body
      ? `\treq.SetBody([]byte(\`${parsed.body}\`))\n`
      : '';

    return `package main

import (
\t"fmt"
\t"time"

\t"github.com/valyala/fasthttp"
)

func executeRequest() error {
\t// Acquire pooled request and response objects to minimize GC allocations
\treq := fasthttp.AcquireRequest()
\tres := fasthttp.AcquireResponse()
\tdefer fasthttp.ReleaseRequest(req)
\tdefer fasthttp.ReleaseResponse(res)

\treq.SetRequestURI("${parsed.url}")
\treq.Header.SetMethod("${parsed.method}")
${headerLines ? `${headerLines}\n` : ''}${bodySection}
\t// Configure client with custom timeouts and connection pooling
\tclient := &fasthttp.Client{
\t\tReadTimeout:     5 * time.Second,
\t\tWriteTimeout:    5 * time.Second,
\t\tMaxConnsPerHost: 512,
\t}

\tif err := client.Do(req, res); err != nil {
\t\treturn fmt.Errorf("fasthttp request failed: %w", err)
\t}

\tif res.StatusCode() >= 400 {
\t\treturn fmt.Errorf("unexpected HTTP status: %d", res.StatusCode())
\t}

\tfmt.Printf("Status: %d\\n", res.StatusCode())
\tfmt.Printf("Response Body: %s\\n", res.Body())
\treturn nil
}
`;
  }, [parsed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedGoCode);
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
            High-Performance Go HTTP Client Synthesis
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Go Code' : 'Copy Go Code'}
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
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
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
            <label htmlFor={curlInputId} className="block text-xs font-medium text-slate-400 mb-1">
              Paste cURL command here:
            </label>
            <textarea
              id={curlInputId}
              rows={8}
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed resize-none"
              placeholder="curl -X POST https://..."
            />
          </div>

          {/* Parsed Attributes Pill List */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Detected Endpoints</span>
            <div className="text-slate-300 font-mono text-[11px] truncate">
              {parsed.url}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {parsed.headers.map((h, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                  {h.name}
                </span>
              ))}
              {parsed.body && (
                <span className="px-2 py-0.5 rounded bg-amber-950/40 text-[10px] text-amber-300 font-mono border border-amber-800/40">
                  Payload ({parsed.body.length} bytes)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Go fasthttp Code Output */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Go fasthttp (Zero-Allocation) Request
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">github.com/valyala/fasthttp</span>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800/80 max-h-[420px] leading-relaxed">
              <code>{generatedGoCode}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Architecture Guide */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          Why Go fasthttp for High-Throughput Microservices?
        </h4>
        <p>
          Unlike standard library <code>net/http</code> which creates new memory objects for every HTTP request, <code>valyala/fasthttp</code> utilizes object pools (<code>AcquireRequest</code> / <code>AcquireResponse</code>) to achieve virtually zero heap allocations. It handles up to 10x more concurrent requests per second on identical hardware.
        </p>
      </div>
    </div>
  );
}

export default CurlToFastHttpConverter;
