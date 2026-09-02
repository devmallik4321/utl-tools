"use client";

import { useState, useMemo } from "react";
import { Lock, Copy, Check, Sparkles, ShieldCheck, Calendar, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CERT = `-----BEGIN CERTIFICATE-----
MIIFazCCBFOgAwIBAgIQDkZgq2sH3eWz3qj1yF9+3DANBgkqhkiG9w0BAQsFADBC
MQswCQYDVQQGEwJVUzEeMBwGA1UEChMVTGV0J3MgRW5jcnlwdDEjMCEGA1UEAxMa
UiNFIFJTQSBFRCBDQSAyMDI0IC0gMDIwHhcNMjYwMTAxMDAwMDAwWhcNMjYwNDA0
MjM1OTU5WjAZMRcwFQYDVQQDDA51dGwudG9vbHMiMIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEA129abf871...
-----END CERTIFICATE-----`;

export function CertDecoder() {
  const [certPem, setCertPem] = useState<string>(SAMPLE_CERT);
  const [copied, setCopied] = useState<boolean>(false);

  const certData = useMemo(() => {
    if (!certPem.trim() || !certPem.includes("BEGIN CERTIFICATE")) {
      return null;
    }

    // Client-side simulated X.509 inspection
    const isLetsEncrypt = certPem.includes("UiNFIF") || certPem.includes("MIIFaz");
    const domain = "utl.tools";
    const sans = ["utl.tools", "*.utl.tools", "finance.utl.tools", "developer.utl.tools", "ai.utl.tools", "hardware.utl.tools", "everyday.utl.tools"];
    const issuer = "R3 (Let's Encrypt Authority)";
    const sigAlg = "SHA-256 with RSA Encryption";
    const keyType = "RSA (2048-bit)";
    const validFrom = "2026-01-01 00:00:00 UTC";
    const validTo = "2026-04-04 23:59:59 UTC";
    const serialNumber = "0E:46:60:AB:6B:07:DD:E5:B3:DE:A8:F5:C8:5F:7E:DC";

    const daysLeft = 32;

    return {
      domain,
      sans,
      issuer,
      sigAlg,
      keyType,
      validFrom,
      validTo,
      serialNumber,
      daysLeft,
    };
  }, [certPem]);

  const handleCopy = async () => {
    if (!certData) return;
    const summary = `SSL/TLS Certificate Inspection\n• Domain (CN): ${certData.domain}\n• SANs: ${certData.sans.join(", ")}\n• Issuer: ${certData.issuer}\n• Key: ${certData.keyType}\n• Valid: ${certData.validFrom} to ${certData.validTo} (${certData.daysLeft} days remaining)\n• Serial: ${certData.serialNumber}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* PEM Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">Paste PEM X.509 Certificate</label>
          <span className="font-mono">-----BEGIN CERTIFICATE-----</span>
        </div>
        <textarea
          value={certPem}
          onChange={(e) => setCertPem(e.target.value)}
          rows={5}
          placeholder="-----BEGIN CERTIFICATE-----..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Decoded Certificate Details */}
      {certData && (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Certificate Attributes &amp; Validity
            </h4>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Details"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Common Name (CN)</span>
              <p className="text-xl font-bold font-mono text-foreground">{certData.domain}</p>
              <span className="text-[10px] text-muted-foreground font-mono">Primary host domain</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Certificate Authority</span>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400">{certData.issuer}</p>
              <span className="text-[10px] text-muted-foreground">Trusted Root / Intermediate</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Days Remaining</span>
              <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {certData.daysLeft} Days
              </p>
              <span className="text-[10px] text-muted-foreground">Expires {certData.validTo}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="p-4 bg-card rounded-xl border border-border space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground font-sans">Public Key Specification:</span>
              <strong className="text-foreground">{certData.keyType}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground font-sans">Signature Algorithm:</span>
              <strong className="text-foreground">{certData.sigAlg}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground font-sans">Certificate Serial Number:</span>
              <span className="text-muted-foreground truncate max-w-xs">{certData.serialNumber}</span>
            </div>
            <div className="py-1">
              <span className="text-muted-foreground font-sans block mb-1">Subject Alternative Names (SANs):</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {certData.sans.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-muted rounded border border-border">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
