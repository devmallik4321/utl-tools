"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/orders \\
  -H "Authorization: Bearer token_sample_haskell_42" \\
  -H "Content-Type: application/json" \\
  -d '{"item": "book", "qty": 3}'`;

export function CurlToHaskellConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [useHttpConduit, setUseHttpConduit] = useState<boolean>(true); // http-conduit vs wreq
  const [copied, setCopied] = useState<boolean>(false);

  const haskellCode = useMemo(() => {
    if (!curlInput.trim()) return "-- Paste a cURL command above to generate Haskell code.";

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

    if (useHttpConduit) {
      let code = `{-# LANGUAGE OverloadedStrings #-}\n\n`;
      code += `import Network.HTTP.Simple\n`;
      code += `import qualified Data.ByteString.Lazy.Char8 as L8\n\n`;
      code += `main :: IO ()\n`;
      code += `main = do\n`;
      code += `  initialRequest <- parseRequest "${method} ${rawUrl}"\n`;
      code += `  let request\n`;
      code += `        = setRequestMethod "${method}"\n`;

      headers.forEach((h) => {
        code += `        $ setRequestHeader "${h.key}" ["${h.val}"]\n`;
      });

      if (dataPayload) {
        code += `        $ setRequestBodyLBS (L8.pack "${dataPayload.replace(/"/g, '\\"')}")\n`;
      }

      code += `        $ initialRequest\n\n`;
      code += `  response <- httpLBS request\n`;
      code += `  putStrLn $ "The status code was: " ++ show (getResponseStatusCode response)\n`;
      code += `  L8.putStrLn $ getResponseBody response\n`;
      return code;
    } else {
      // Wreq
      let code = `{-# LANGUAGE OverloadedStrings #-}\n\n`;
      code += `import Network.Wreq\n`;
      code += `import Control.Lens\n`;
      code += `import qualified Data.ByteString.Char8 as B8\n`;
      code += `import qualified Data.ByteString.Lazy.Char8 as L8\n\n`;
      code += `main :: IO ()\n`;
      code += `main = do\n`;

      if (headers.length > 0) {
        code += `  let opts = defaults\n`;
        headers.forEach((h) => {
          code += `        & header "${h.key}" .~ ["${h.val}"]\n`;
        });
      } else {
        code += `  let opts = defaults\n`;
      }

      if (method === "POST" && dataPayload) {
        code += `  r <- postWith opts "${rawUrl}" (B8.pack "${dataPayload.replace(/"/g, '\\"')}")\n`;
      } else if (method === "GET") {
        code += `  r <- getWith opts "${rawUrl}"\n`;
      } else {
        code += `  r <- customMethodWith "${method}" opts "${rawUrl}"\n`;
      }

      code += `  putStrLn $ "Response status: " ++ show (r ^. responseStatus . statusCode)\n`;
      code += `  L8.putStrLn (r ^. responseBody)\n`;
      return code;
    }
  }, [curlInput, useHttpConduit]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(haskellCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Library Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setUseHttpConduit(true)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            useHttpConduit ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          http-conduit (Recommended)
        </button>
        <button
          onClick={() => setUseHttpConduit(false)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            !useHttpConduit ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Wreq
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

      {/* Output Haskell Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Haskell Script ({useHttpConduit ? "http-conduit" : "Wreq"})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Haskell"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {haskellCode}
        </pre>
      </div>
    </div>
  );
}
