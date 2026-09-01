"use client";

import { useState } from "react";
import { Key, ShieldAlert, CheckCircle2, Copy, Check, Clock } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggTW9yZ2FuIiwiZW1haWwiOiJhbGV4QGV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.sample_signature_hash";

export function JwtDebugger() {
  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_JWT);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  const parseJwt = (token: string) => {
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) {
        return { valid: false, error: "Invalid JWT format. A valid token must have 3 dot-separated parts (Header.Payload.Signature)." };
      }

      // Base64Url decode helper
      const base64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        return decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      };

      const headerJson = JSON.parse(base64UrlDecode(parts[0]));
      const payloadJson = JSON.parse(base64UrlDecode(parts[1]));
      const signature = parts[2];

      // Check timestamps
      let expDate: Date | null = null;
      let isExpired = false;
      if (payloadJson.exp) {
        expDate = new Date(payloadJson.exp * 1000);
        isExpired = expDate.getTime() < Date.now();
      }

      return {
        valid: true,
        header: headerJson,
        payload: payloadJson,
        signature,
        expDate,
        isExpired,
      };
    } catch (e: any) {
      return { valid: false, error: e.message || "Failed to decode JWT string." };
    }
  };

  const parsed = parseJwt(tokenInput);

  const handleCopyPayload = async () => {
    if (parsed.valid) {
      const ok = await copyToClipboard(JSON.stringify(parsed.payload, null, 2));
      if (ok) {
        setCopiedPayload(true);
        setTimeout(() => setCopiedPayload(false), 2000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Encoded Token */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Encoded JWT String
        </label>
        <textarea
          rows={4}
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Paste encoded JWT token here (eyJhbGciOi...)"
          className="w-full p-3 font-mono text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 break-all"
        />
      </div>

      {parsed.valid ? (
        <div className="space-y-4">
          {/* Expiration Status Badge */}
          {parsed.expDate && (
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              parsed.isExpired
                ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
            }`}>
              <div className="flex items-center gap-2 text-xs font-semibold">
                {parsed.isExpired ? <ShieldAlert className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                <span>{parsed.isExpired ? "Token is EXPIRED" : "Token is ACTIVE / VALID"}</span>
              </div>
              <span className="text-xs font-mono">
                Expires: {parsed.expDate.toLocaleString()}
              </span>
            </div>
          )}

          {/* Decoded Header & Payload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Decoded Header */}
            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">
                Header (Algorithm &amp; Token Type)
              </span>
              <pre className="p-3 bg-muted/40 rounded-lg text-xs font-mono text-foreground overflow-x-auto">
                {JSON.stringify(parsed.header, null, 2)}
              </pre>
            </div>

            {/* Decoded Payload */}
            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">
                  Payload (Claims &amp; Data)
                </span>
                <button
                  onClick={handleCopyPayload}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? "Copied!" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="p-3 bg-muted/40 rounded-lg text-xs font-mono text-foreground overflow-x-auto">
                {JSON.stringify(parsed.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
          <strong>Parse Error:</strong> {parsed.error}
        </div>
      )}
    </div>
  );
}
