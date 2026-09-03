"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/items \\
  -H "Authorization: Bearer token_sample_zig_88" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "server_node", "cores": 8}'`;

export function CurlToZigConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [copied, setCopied] = useState<boolean>(false);

  const zigCode = useMemo(() => {
    if (!curlInput.trim()) return "// Paste a cURL command above to generate Zig code.";

    const clean = curlInput.replace(/\\\n/g, " ").replace(/\n/g, " ");

    // Extract URL
    const urlMatch = clean.match(/https?:\/\/[^\s'"]+/);
    const rawUrl = urlMatch ? urlMatch[0] : "https://api.example.com/endpoint";

    // Extract Method
    let method = "GET";
    const methodMatch = clean.match(/-X\s+([A-Z]+)/i) || clean.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    } else if (clean.includes("-d ") || clean.includes("--data ") || clean.includes("--data-raw ")) {
      method = "POST";
    }

    // Extract Headers
    const headers: { key: string; val: string }[] = [];
    const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
    let hMatch;
    while ((hMatch = headerRegex.exec(clean)) !== null) {
      const parts = hMatch[1].split(":");
      if (parts.length >= 2) {
        headers.push({
          key: parts[0].trim(),
          val: parts.slice(1).join(":").trim(),
        });
      }
    }

    // Extract Body
    let dataPayload = "";
    const dataMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\s+["']([^"']+)["']/);
    if (dataMatch) {
      dataPayload = dataMatch[1];
    }

    let code = `const std = @import("std");\n\n`;
    code += `pub fn main() !void {\n`;
    code += `    var gpa = std.heap.GeneralPurposeAllocator(.{}){};\n`;
    code += `    defer _ = gpa.deinit();\n`;
    code += `    const allocator = gpa.allocator();\n\n`;
    code += `    var client = std.http.Client{ .allocator = allocator };\n`;
    code += `    defer client.deinit();\n\n`;
    code += `    const uri = try std.Uri.parse("${rawUrl}");\n`;

    if (headers.length > 0) {
      code += `    const extra_headers = [_]std.http.Header{\n`;
      headers.forEach((h) => {
        code += `        .{ .name = "${h.key}", .value = "${h.val}" },\n`;
      });
      code += `    };\n\n`;
    }

    if (dataPayload) {
      code += `    const payload = "${dataPayload.replace(/"/g, '\\"')}";\n`;
      code += `    var req = try client.request(.${method.toLowerCase()}, uri, .{\n`;
      code += `        .allocator = allocator,\n`;
      if (headers.length > 0) {
        code += `        .extra_headers = &extra_headers,\n`;
      }
      code += `    });\n`;
      code += `    defer req.deinit();\n\n`;
      code += `    req.transfer_encoding = .{ .content_length = payload.len };\n`;
      code += `    try req.start();\n`;
      code += `    try req.writer().writeAll(payload);\n`;
      code += `    try req.finish();\n`;
      code += `    try req.wait();\n\n`;
    } else {
      code += `    var req = try client.request(.${method.toLowerCase()}, uri, .{\n`;
      code += `        .allocator = allocator,\n`;
      if (headers.length > 0) {
        code += `        .extra_headers = &extra_headers,\n`;
      }
      code += `    });\n`;
      code += `    defer req.deinit();\n\n`;
      code += `    try req.start();\n`;
      code += `    try req.finish();\n`;
      code += `    try req.wait();\n\n`;
    }

    code += `    std.debug.print("HTTP Status: {d}\\n", .{req.response.status});\n`;
    code += `    const body = try req.reader().readAllAlloc(allocator, 1024 * 1024);\n`;
    code += `    defer allocator.free(body);\n`;
    code += `    std.debug.print("Response: {s}\\n", .{body});\n`;
    code += `}\n`;

    return code;
  }, [curlInput]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(zigCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* cURL Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">cURL Command Input</label>
          <span className="font-mono">Bash CLI format</span>
        </div>
        <textarea
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          rows={5}
          placeholder="Paste curl command here..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Output Zig Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Zig Script (`std.http.Client`)
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Zig"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {zigCode}
        </pre>
      </div>
    </div>
  );
}
