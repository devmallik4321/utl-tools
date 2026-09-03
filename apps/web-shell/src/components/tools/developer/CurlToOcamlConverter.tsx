"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/data \\
  -H "Authorization: Bearer token_sample_ocaml_99" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "active", "limit": 50}'`;

export function CurlToOcamlConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [useCohttp, setUseCohttp] = useState<boolean>(true); // cohttp-lwt-unix vs ezcurl
  const [copied, setCopied] = useState<boolean>(false);

  const ocamlCode = useMemo(() => {
    if (!curlInput.trim()) return "(* Paste a cURL command above to generate OCaml code. *)";

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

    if (useCohttp) {
      let code = `open Lwt\nopen Cohttp\nopen Cohttp_lwt_unix\n\n`;
      code += `let make_request () =\n`;
      code += `  let uri = Uri.of_string "${rawUrl}" in\n`;

      if (headers.length > 0) {
        code += `  let headers = Header.init ()\n`;
        headers.forEach((h) => {
          code += `    |> fun h -> Header.add h "${h.key}" "${h.val}"\n`;
        });
        code += `  in\n`;
      } else {
        code += `  let headers = Header.init () in\n`;
      }

      if (dataPayload) {
        code += `  let body = Cohttp_lwt.Body.of_string "${dataPayload.replace(/"/g, '\\"')}" in\n`;
        code += `  Client.call ~headers ~body \`${method} uri >>= fun (resp, body) ->\n`;
      } else {
        code += `  Client.call ~headers \`${method} uri >>= fun (resp, body) ->\n`;
      }

      code += `  let code = resp |> Response.status |> Code.code_of_status in\n`;
      code += `  Printf.printf "Response HTTP status: %d\\n" code;\n`;
      code += `  Cohttp_lwt.Body.to_string body >>= fun body_str ->\n`;
      code += `  Printf.printf "Body: %s\\n" body_str;\n`;
      code += `  Lwt.return_unit\n\n`;
      code += `let () = Lwt_main.run (make_request ())\n`;
      return code;
    } else {
      // Ezcurl
      let code = `(* Using Ezcurl (mirage/ocaml-cohttp or ezcurl) *)\n`;
      code += `let run () =\n`;
      code += `  let url = "${rawUrl}" in\n`;

      if (headers.length > 0) {
        const hList = headers.map((h) => `("${h.key}", "${h.val}")`).join("; ");
        code += `  let headers = [ ${hList} ] in\n`;
      }

      if (dataPayload) {
        code += `  let payload = "${dataPayload.replace(/"/g, '\\"')}" in\n`;
        code += `  match Ezcurl.post ~headers ~params:[] ~content:(\`String payload) ~url with\n`;
      } else {
        code += `  match Ezcurl.get ~headers ~url with\n`;
      }

      code += `  | Ok resp ->\n`;
      code += `      Printf.printf "Status: %d\\n" resp.Ezcurl.code;\n`;
      code += `      Printf.printf "Response: %s\\n" resp.Ezcurl.body\n`;
      code += `  | Error (_, msg) ->\n`;
      code += `      Printf.eprintf "Curl Error: %s\\n" msg\n\n`;
      code += `let () = run ()\n`;
      return code;
    }
  }, [curlInput, useCohttp]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(ocamlCode);
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
          onClick={() => setUseCohttp(true)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            useCohttp ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Cohttp Lwt (Recommended)
        </button>
        <button
          onClick={() => setUseCohttp(false)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            !useCohttp ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Ezcurl
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

      {/* Output OCaml Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            OCaml Script ({useCohttp ? "Cohttp Lwt" : "Ezcurl"})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy OCaml"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {ocamlCode}
        </pre>
      </div>
    </div>
  );
}
