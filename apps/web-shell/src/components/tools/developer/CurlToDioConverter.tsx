"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Code2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST "https://api.example.com/v1/users/profile" \\
  -H "Authorization: Bearer my_flutter_token_77a" \\
  -H "Content-Type: application/json" \\
  -d '{"displayName": "Alex Rivera", "role": "engineer", "notificationsEnabled": true}'`;

export function CurlToDioConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [copied, setCopied] = useState<boolean>(false);

  const { method, url, headers, body } = useMemo(() => {
    let m = "GET";
    let u = "https://api.example.com";
    const hdrs: { name: string; value: string }[] = [];
    let b = "";

    const methodMatch = curlInput.match(/-X\s+([A-Z]+)/i) || curlInput.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      m = methodMatch[1].toUpperCase();
    } else if (curlInput.includes("-d ") || curlInput.includes("--data ") || curlInput.includes("--data-raw ")) {
      m = "POST";
    }

    const urlMatch = curlInput.match(/curl\s+(?:-[^\s]+\s+)*['"]?([^'"\s\\]+)['"]?/i);
    if (urlMatch) {
      u = urlMatch[1];
    }

    const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = headerRegex.exec(curlInput)) !== null) {
      const parts = match[1].split(":");
      if (parts.length >= 2) {
        hdrs.push({
          name: parts[0].trim(),
          value: parts.slice(1).join(":").trim(),
        });
      }
    }

    const dataMatch =
      curlInput.match(/(?:-d|--data|--data-raw)\s+'([^']+)'/) ||
      curlInput.match(/(?:-d|--data|--data-raw)\s+"([^"]+)"/) ||
      curlInput.match(/(?:-d|--data|--data-raw)\s+([^\s\\]+)/);

    if (dataMatch) {
      b = dataMatch[1];
    }

    return { method: m, url: u, headers: hdrs, body: b };
  }, [curlInput]);

  const generatedDartCode = useMemo(() => {
    let headersMap = "";
    if (headers.length > 0) {
      const items = headers
        .map((h) => `      '${h.name}': '${h.value.replace(/'/g, "\\'")}'`)
        .join(",\n");
      headersMap = `      headers: {\n${items},\n      },\n`;
    }

    let dataParam = "";
    if (body) {
      const isJson = headers.some(
        (h) => h.name.toLowerCase() === "content-type" && h.value.includes("json")
      ) || body.trim().startsWith("{") || body.trim().startsWith("[");

      if (isJson) {
        dataParam = `\n    final data = ${body};\n`;
      } else {
        dataParam = `\n    final data = '${body.replace(/'/g, "\\'")}';\n`;
      }
    }

    const dataArg = body ? ", data: data" : "";

    return `// Generated with UTL.tools cURL to Dart Dio Converter
// Add to pubspec.yaml: dio: ^5.7.0

import 'package:dio/dio.dart';

Future<void> sendHttpRequest() async {
  final dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ),
  );
${dataParam}
  try {
    final response = await dio.request(
      '${url}',
      options: Options(
        method: '${method}',
${headersMap}      )${dataArg},
    );

    print('Status Code: \${response.statusCode}');
    print('Response Data: \${response.data}');
  } on DioException catch (e) {
    if (e.response != null) {
      print('Dio error response: \${e.response?.statusCode} - \${e.response?.data}');
    } else {
      print('Dio network/request error: \${e.message}');
    }
  }
}
`;
  }, [method, url, headers, body]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(generatedDartCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Dart Dio (Flutter) HTTP Client Request Generator
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          dio: ^5.7.0 • Flutter &amp; Dart VM
        </span>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              Source cURL Command
            </label>
            <button
              onClick={() => setCurlInput(SAMPLE_CURL)}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Load Sample
            </button>
          </div>
          <textarea
            rows={12}
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground resize-none"
            placeholder="curl -X POST https://api.example.com -H '...' -d '...'"
          />
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
            <span>Method: <strong className="text-foreground">{method}</strong></span>
            <span>•</span>
            <span>Headers: <strong className="text-foreground">{headers.length}</strong></span>
            <span>•</span>
            <span>Payload: <strong className="text-foreground">{body ? "Detected" : "None"}</strong></span>
          </div>
        </div>

        {/* Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Dart Code (package:dio)
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Dart" : "Copy Dart Code"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-[320px]">
            {generatedDartCode}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default CurlToDioConverter;
