'use client';

import React, { useState, useMemo } from 'react';
import { Terminal, Copy, Check, Code2, Gem, RotateCcw, Info } from 'lucide-react';

const SAMPLE_CURL = `curl -X POST "https://api.stripe.com/v1/payment_intents" \\
  -H "Authorization: Bearer sk_test_51Mz..." \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "amount=2000&currency=usd&payment_method_types[]=card"`;

export function CurlToFaradayConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [useJsonMiddleware, setUseJsonMiddleware] = useState<boolean>(true);
  const [timeoutSecs, setTimeoutSecs] = useState<number>(10);
  const [copied, setCopied] = useState<boolean>(false);

  const parsed = useMemo(() => {
    let method = 'get';
    let url = 'https://api.stripe.com/v1/payment_intents';
    const headers: { name: string; value: string }[] = [];
    let rawBody = '';

    const methodMatch = curlInput.match(/-X\s+([A-Z]+)/i) || curlInput.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toLowerCase();
    } else if (curlInput.includes('-d ') || curlInput.includes('--data ') || curlInput.includes('--data-raw ')) {
      method = 'post';
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
        headers.push({ name: parts[0].trim(), value: parts.slice(1).join(':').trim() });
      }
    }

    const bodyMatch = curlInput.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?:\s|$)/);
    if (bodyMatch) {
      rawBody = bodyMatch[1];
    }

    return { method, url, headers, rawBody };
  }, [curlInput]);

  const rubySnippet = useMemo(() => {
    let urlObj: URL;
    try {
      urlObj = new URL(parsed.url);
    } catch {
      urlObj = new URL('https://api.example.com/v1/endpoint');
    }

    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    const path = urlObj.pathname + urlObj.search;

    const authHeader = parsed.headers.find((h) => h.name.toLowerCase() === 'authorization');
    const bearerToken = authHeader && authHeader.value.startsWith('Bearer ')
      ? authHeader.value.replace(/^Bearer\s+/, '')
      : null;

    const filteredHeaders = parsed.headers.filter(
      (h) => h.name.toLowerCase() !== 'authorization' && h.name.toLowerCase() !== 'content-type'
    );

    let bodyPayload = 'nil';
    if (parsed.rawBody) {
      try {
        const json = JSON.parse(parsed.rawBody);
        bodyPayload = JSON.stringify(json, null, 2);
      } catch {
        bodyPayload = `'${parsed.rawBody}'`;
      }
    }

    return `require 'faraday'
${useJsonMiddleware ? "require 'faraday/net_http'\nrequire 'json'" : ''}

client = Faraday.new(url: '${baseUrl}') do |f|
  f.request :url_encoded
  ${useJsonMiddleware ? 'f.request :json\n  f.response :json\n  f.response :raise_error' : ''}
  f.adapter :net_http
  f.options.timeout = ${timeoutSecs}
  f.options.open_timeout = 5
end

response = client.${parsed.method}('${path}') do |req|
  ${bearerToken ? `req.headers['Authorization'] = 'Bearer ${bearerToken}'` : ''}
  ${filteredHeaders.map((h) => `req.headers['${h.name}'] = '${h.value}'`).join('\n  ')}
  ${bodyPayload !== 'nil' ? `req.body = ${bodyPayload}` : ''}
end

puts "Status: #{response.status}"
puts response.body
`;
  }, [parsed, useJsonMiddleware, timeoutSecs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rubySnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <Gem className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">cURL to Ruby Faraday Converter</h1>
            <p className="text-sm text-slate-400">
              Convert cURL commands to modern Ruby Faraday HTTP client code with middleware stack, JSON serialization, and timeout handling.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">cURL Input</h2>
            <button
              onClick={() => setCurlInput(SAMPLE_CURL)}
              className="text-xs text-rose-400 hover:text-rose-300"
            >
              Reset Sample
            </button>
          </div>

          <textarea
            rows={7}
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-rose-500"
          />

          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400">Faraday Options</h3>
            <label className="flex items-center space-x-2 text-xs cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={useJsonMiddleware}
                onChange={(e) => setUseJsonMiddleware(e.target.checked)}
                className="rounded text-rose-500 focus:ring-0"
              />
              <span>Enable JSON & RaiseError Middleware</span>
            </label>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Socket Timeout (Seconds)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={timeoutSecs}
                onChange={(e) => setTimeoutSecs(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-rose-400" />
                <h2 className="text-sm font-semibold text-slate-200">Generated Ruby Faraday Code</h2>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Ruby'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre max-h-96 leading-relaxed">
              {rubySnippet}
            </pre>
          </div>

          <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs text-slate-400">
            Faraday is the gold standard HTTP client library for Ruby and Rails, featuring a modular middleware architecture that supports connection pooling, OAuth2, and automatic JSON deserialization.
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurlToFaradayConverter;
