'use client';

import React, { useState, useId, useMemo } from 'react';
import { Terminal, Copy, Check, Code2, Zap, RotateCcw, Info, Layers } from 'lucide-react';

const SAMPLE_CURL = `curl -X POST "https://api.example.com/v2/items" \\
  -H "Authorization: Bearer sk_live_secret_token_994" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"name": "Industrial Sensor", "quantity": 10, "enabled": true}'`;

export function CurlToUrllib3Converter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [copied, setCopied] = useState<boolean>(false);
  const [enableRetries, setEnableRetries] = useState<boolean>(true);
  const [timeoutSecs, setTimeoutSecs] = useState<number>(10);

  const parsed = useMemo(() => {
    let method = 'GET';
    let url = 'https://api.example.com/v2/items';
    const headers: { name: string; value: string }[] = [];
    let jsonBody: any = null;
    let rawBody = '';

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
        headers.push({ name: parts[0].trim(), value: parts.slice(1).join(':').trim() });
      }
    }

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

  const pythonSnippet = useMemo(() => {
    const headerDict: Record<string, string> = {};
    parsed.headers.forEach((h) => {
      headerDict[h.name] = h.value;
    });

    const headersStr = JSON.stringify(headerDict, null, 4)
      .split('\n')
      .map((l, i) => (i === 0 ? l : '    ' + l))
      .join('\n');

    let bodyArg = '';
    let imports = `import urllib3\nimport json`;

    if (parsed.jsonBody) {
      bodyArg = `body=json.dumps(payload).encode('utf-8')`;
    } else if (parsed.rawBody) {
      bodyArg = `body='''${parsed.rawBody}'''.encode('utf-8')`;
    }

    const retryConfig = enableRetries
      ? `from urllib3.util import Retry

# Configure robust exponential backoff retries
retries = Retry(
    total=3,
    backoff_factor=0.5,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["HEAD", "GET", "PUT", "DELETE", "OPTIONS", "POST"]
)
http = urllib3.PoolManager(retries=retries, timeout=${timeoutSecs}.0)`
      : `http = urllib3.PoolManager(timeout=${timeoutSecs}.0)`;

    let payloadDef = '';
    if (parsed.jsonBody) {
      payloadDef = `\n# Request payload\npayload = ${JSON.stringify(parsed.jsonBody, null, 4)}\n`;
    }

    return `${imports}
${enableRetries ? 'from urllib3.util import Retry\n' : ''}
${retryConfig}

headers = ${headersStr}
${payloadDef}
response = http.request(
    "${parsed.method}",
    "${parsed.url}",
    headers=headers,${bodyArg ? '\n    ' + bodyArg + ',' : ''}
)

print(f"Status: {response.status}")
try:
    data = json.loads(response.data.decode('utf-8'))
    print(data)
except Exception:
    print(response.data.decode('utf-8'))
`;
  }, [parsed, enableRetries, timeoutSecs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">cURL to Python urllib3 Converter</h1>
            <p className="text-sm text-slate-400">
              Convert cURL commands to high-performance Python urllib3 PoolManager code with connection pooling, retries, and timeout management.
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
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Reset Sample
            </button>
          </div>

          <textarea
            rows={8}
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            placeholder="curl -X POST https://api.com/v1 -H 'Authorization: Bearer ...' -d '{...}'"
          />

          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400">urllib3 Pool Configuration</h3>
            <label className="flex items-center space-x-2 text-xs cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={enableRetries}
                onChange={(e) => setEnableRetries(e.target.checked)}
                className="rounded text-blue-500 focus:ring-0"
              />
              <span>Enable Exponential Backoff Retries (429, 500, 502, 503)</span>
            </label>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Socket Timeout (Seconds)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={timeoutSecs}
                onChange={(e) => setTimeoutSecs(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-semibold text-slate-200">Generated Python Code (urllib3 v2.x)</h2>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Python'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre max-h-96 leading-relaxed">
              {pythonSnippet}
            </pre>
          </div>

          <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl text-xs text-slate-400">
            <span className="font-semibold text-blue-300 block mb-1">Why urllib3?</span>
            <p>
              <code>urllib3</code> powers Python's <code>requests</code> library and AWS SDK. Using <code>urllib3.PoolManager</code> directly eliminates extra layers, supports HTTP/1.1 connection reuse, thread-safety, and granular socket timeouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurlToUrllib3Converter;
