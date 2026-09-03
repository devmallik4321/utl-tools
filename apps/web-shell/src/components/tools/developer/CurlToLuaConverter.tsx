"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/messages \\
  -H "Authorization: Bearer lua_token_9934" \\
  -H "Content-Type: application/json" \\
  -d '{"sender": "agent_alpha", "text": "Task completed successfully"}'`;

export function CurlToLuaConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [libChoice, setLibChoice] = useState<"luasocket" | "openresty">("luasocket");
  const [copied, setCopied] = useState<boolean>(false);

  const luaCode = useMemo(() => {
    if (!curlInput.trim()) return "-- Paste a cURL command above to generate Lua code.";

    const clean = curlInput.replace(/\\\n/g, " ").replace(/\n/g, " ");

    // URL
    const urlMatch = clean.match(/https?:\/\/[^\s'"]+/);
    const rawUrl = urlMatch ? urlMatch[0] : "https://api.example.com/endpoint";

    // Method
    let method = "GET";
    const methodMatch = clean.match(/-X\s+([A-Z]+)/i) || clean.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    } else if (clean.includes("-d ") || clean.includes("--data ") || clean.includes("--data-raw ")) {
      method = "POST";
    }

    // Headers
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

    // Body
    let dataPayload = "";
    const dataMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\s+["']([^"']+)["']/);
    if (dataMatch) {
      dataPayload = dataMatch[1];
    }

    let code = "";

    if (libChoice === "luasocket") {
      code = `-- Lua HTTP Request using LuaSocket & ltn12\n`;
      code += `local http = require("socket.http")\n`;
      code += `local ltn12 = require("ltn12")\n\n`;
      code += `local response_body = {}\n`;
      if (dataPayload) {
        code += `local request_body = [==[${dataPayload}]==]\n\n`;
      }

      code += `local res, code, response_headers, status = http.request({\n`;
      code += `    url = "${rawUrl}",\n`;
      code += `    method = "${method}",\n`;

      if (headers.length > 0 || dataPayload) {
        code += `    headers = {\n`;
        headers.forEach((h) => {
          code += `        ["${h.key}"] = "${h.val}",\n`;
        });
        if (dataPayload && !headers.some((h) => h.key.toLowerCase() === "content-length")) {
          code += `        ["Content-Length"] = string.len(request_body),\n`;
        }
        code += `    },\n`;
      }

      if (dataPayload) {
        code += `    source = ltn12.source.string(request_body),\n`;
      }
      code += `    sink = ltn12.sink.table(response_body)\n`;
      code += `})\n\n`;
      code += `print("HTTP Status Code: " .. tostring(code))\n`;
      code += `print("Response Body: " .. table.concat(response_body))\n`;
    } else {
      // OpenResty resty.http
      code = `-- Lua HTTP Request using OpenResty / resty.http\n`;
      code += `local http = require("resty.http")\n`;
      code += `local httpc = http.new()\n\n`;
      code += `local res, err = httpc:request_uri("${rawUrl}", {\n`;
      code += `    method = "${method}",\n`;
      if (dataPayload) {
        code += `    body = [==[${dataPayload}]==],\n`;
      }
      if (headers.length > 0) {
        code += `    headers = {\n`;
        headers.forEach((h) => {
          code += `        ["${h.key}"] = "${h.val}",\n`;
        });
        code += `    },\n`;
      }
      code += `    ssl_verify = true,\n`;
      code += `})\n\n`;
      code += `if not res then\n`;
      code += `    ngx.log(ngx.ERR, "Request failed: ", err)\n`;
      code += `    return\n`;
      code += `end\n\n`;
      code += `ngx.say("Status: ", res.status)\n`;
      code += `ngx.say("Body: ", res.body)\n`;
    }

    return code;
  }, [curlInput, libChoice]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(luaCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Library Picker */}
      <div className="flex gap-2">
        <button
          onClick={() => setLibChoice("luasocket")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            libChoice === "luasocket" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          LuaSocket (socket.http)
        </button>
        <button
          onClick={() => setLibChoice("openresty")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            libChoice === "openresty" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          OpenResty (resty.http)
        </button>
      </div>

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

      {/* Output Lua Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Lua Script ({libChoice === "luasocket" ? "LuaSocket" : "OpenResty resty.http"})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Lua"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {luaCode}
        </pre>
      </div>
    </div>
  );
}
