"use client";

import { useState, useMemo, useEffect } from "react";
import { Key, ShieldCheck, ShieldAlert, Clock, Copy, Check, Sparkles, Lock } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyMDgwMDAwMDAwfQ.e-sample-signature-here";

export function JwtInspector() {
  const [token, setToken] = useState<string>(SAMPLE_JWT);
  const [secret, setSecret] = useState<string>("your-256-bit-secret");
  const [sigStatus, setSigStatus] = useState<"unchecked" | "valid" | "invalid">("unchecked");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Decode JWT Parts locally
  const parsed = useMemo(() => {
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      return { isValid: false, header: null, payload: null, signature: "" };
    }

    const base64UrlDecode = (str: string) => {
      let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      try {
        return decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      } catch {
        return atob(base64);
      }
    };

    try {
      const headerStr = base64UrlDecode(parts[0]);
      const payloadStr = base64UrlDecode(parts[1]);
      const header = JSON.parse(headerStr);
      const payload = JSON.parse(payloadStr);

      return {
        isValid: true,
        header,
        payload,
        rawHeader: parts[0],
        rawPayload: parts[1],
        signature: parts[2],
      };
    } catch {
      return { isValid: false, header: null, payload: null, signature: parts[2] || "" };
    }
  }, [token]);

  // Expiration calculation
  const expStatus = useMemo(() => {
    if (!parsed.isValid || !parsed.payload || typeof parsed.payload.exp !== "number") {
      return null;
    }
    const expMs = parsed.payload.exp * 1000;
    const now = Date.now();
    const isExpired = now > expMs;
    const diffMin = Math.round(Math.abs(expMs - now) / 60000);
    const diffHours = (Math.abs(expMs - now) / 3600000).toFixed(1);

    return {
      isExpired,
      expDate: new Date(expMs).toLocaleString(),
      label: isExpired ? `Expired ${diffHours} hours ago` : `Active (Expires in ${diffHours} hours)`,
    };
  }, [parsed]);

  // Client-Side WebCrypto HMAC-SHA256 signature verification
  const verifySignature = async () => {
    if (!parsed.isValid || !secret.trim()) {
      setSigStatus("invalid");
      return;
    }
    try {
      const enc = new TextEncoder();
      const keyData = enc.encode(secret);
      const key = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const message = enc.encode(`${parsed.rawHeader}.${parsed.rawPayload}`);
      const signatureBuffer = await window.crypto.subtle.sign("HMAC", key, message);
      const signatureBytes = new Uint8Array(signatureBuffer);

      // Convert buffer to base64url
      let binary = "";
      for (let i = 0; i < signatureBytes.byteLength; i++) {
        binary += String.fromCharCode(signatureBytes[i]);
      }
      const calculatedSig = btoa(binary)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      if (calculatedSig === parsed.signature) {
        setSigStatus("valid");
      } else {
        setSigStatus("invalid");
      }
    } catch {
      setSigStatus("invalid");
    }
  };

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>100% Client-Side Web Crypto Execution. Your JWTs, private claims, and secrets never leave your device.</span>
      </div>

      {/* Raw JWT Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Encoded JSON Web Token (JWT)
        </label>
        <textarea
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setSigStatus("unchecked");
          }}
          rows={3}
          placeholder="Paste eyJhbGciOiJIUzI1NiIs..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 break-all"
        />
      </div>

      {/* Decoded Header & Payload View */}
      {parsed.isValid && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Header */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                HEADER: Algorithm &amp; Type
              </span>
              <button
                onClick={() => handleCopy("header", JSON.stringify(parsed.header, null, 2))}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copiedKey === "header" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 bg-background rounded-lg border border-border text-xs font-mono text-foreground overflow-x-auto">
              {JSON.stringify(parsed.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                PAYLOAD: Claims &amp; Data
              </span>
              <button
                onClick={() => handleCopy("payload", JSON.stringify(parsed.payload, null, 2))}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copiedKey === "payload" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 bg-background rounded-lg border border-border text-xs font-mono text-foreground overflow-x-auto">
              {JSON.stringify(parsed.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Expiration Claims Overview */}
      {expStatus && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
          expStatus.isExpired
            ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
            : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-bold">{expStatus.label}</span>
          </div>
          <span className="font-mono">Expires: {expStatus.expDate}</span>
        </div>
      )}

      {/* Signature Verification Section */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-blue-500" />
          Verify Signature (HMAC-SHA256)
        </h4>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value);
              setSigStatus("unchecked");
            }}
            placeholder="Enter HMAC SHA256 secret key..."
            className="flex-1 px-3 py-2 text-xs sm:text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={verifySignature}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Verify Signature</span>
          </button>
        </div>

        {sigStatus === "valid" && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Signature Verified! The token has not been tampered with and matches the secret.</span>
          </div>
        )}

        {sigStatus === "invalid" && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Invalid Signature! Secret key does not match token signature or payload was modified.</span>
          </div>
        )}
      </div>
    </div>
  );
}
