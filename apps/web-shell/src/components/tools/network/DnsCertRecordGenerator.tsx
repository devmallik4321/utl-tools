"use client";

import React, { useState, useMemo } from "react";
import { ShieldCheck, Copy, Check, Terminal, Globe, Server, Info } from "lucide-react";

interface CertTypeOption {
  id: number;
  name: string;
  description: string;
}

const CERT_TYPES: CertTypeOption[] = [
  { id: 1, name: "PKIX (X.509 Certificate)", description: "Standard X.509 TLS/SSL certificate conforming to RFC 5280" },
  { id: 2, name: "SPKI", description: "Simple Public Key Infrastructure certificate" },
  { id: 3, name: "PGP", description: "OpenPGP packet conforming to RFC 4880" },
  { id: 4, name: "IPKIX (URL to X.509)", description: "URI pointing to an X.509 certificate" },
  { id: 6, name: "IPGP (URL to PGP)", description: "URI pointing to an OpenPGP public key" },
  { id: 253, name: "URI", description: "Generic Uniform Resource Identifier" }
];

const ALGORITHMS = [
  { id: 13, name: "13 - ECDSA P-256 with SHA-256 (Modern Default)" },
  { id: 15, name: "15 - Ed25519 (RFC 8080)" },
  { id: 8, name: "8 - RSA / SHA-256" },
  { id: 7, name: "7 - RSASHA1-NSEC3-SHA1" },
  { id: 0, name: "0 - None / Unspecified" }
];

export function DnsCertRecordGenerator() {
  const [hostname, setHostname] = useState<string>("vpn.infra.corp.net");
  const [certType, setCertType] = useState<number>(1); // PKIX
  const [keyTag, setKeyTag] = useState<number>(45812);
  const [algorithm, setAlgorithm] = useState<number>(13); // ECDSA P-256
  const [ttl, setTtl] = useState<number>(3600);
  const [rawCertData, setRawCertData] = useState<string>(
    `MIIC+zCCAeOgAwIBAgIUW4+qM9W5Vb2eEXAMPLE
kG0lF8cT3o7yL6QwEgYDVR0TAQH/BAgwBgEB/wIB
ADANBgkqhkiG9w0BAQsFAAOCAQEAMk3...`
  );

  const [copiedBind, setCopiedBind] = useState(false);
  const [copiedDig, setCopiedDig] = useState(false);

  // Clean data
  const cleanCertData = useMemo(() => {
    let clean = rawCertData.trim();
    // Strip PEM headers if pasted
    clean = clean.replace(/-----BEGIN [^-]+-----/g, "");
    clean = clean.replace(/-----END [^-]+-----/g, "");
    return clean.replace(/\s+/g, "");
  }, [rawCertData]);

  const fqdn = hostname.trim().endsWith(".") ? hostname.trim() : `${hostname.trim()}.`;

  const bindRecord = `${fqdn}  ${ttl}  IN  CERT  ${certType}  ${keyTag}  ${algorithm}  ${cleanCertData}`;
  const digCommand = `dig +dnssec -t CERT ${hostname.trim()}`;

  const handleCopyBind = async () => {
    try {
      await navigator.clipboard.writeText(bindRecord);
      setCopiedBind(true);
      setTimeout(() => setCopiedBind(false), 2000);
    } catch {}
  };

  const handleCopyDig = async () => {
    try {
      await navigator.clipboard.writeText(digCommand);
      setCopiedDig(true);
      setTimeout(() => setCopiedDig(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            RFC 4398 Standard
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            DNS Public Key Infrastructure
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          DNS CERT (Certificate) Record Generator (RFC 4398)
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Store and distribute X.509, SPKI, and PGP public key certificates directly inside DNS resource records for zero-out-of-band certificate distribution.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" /> Certificate DNS Parameters
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Host FQDN</label>
              <input
                type="text"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="vpn.domain.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Certificate Type</label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  {CERT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id}: {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Key Tag (0 - 65535)</label>
                <input
                  type="number"
                  min="0"
                  max="65535"
                  value={keyTag}
                  onChange={(e) => setKeyTag(Math.max(0, Math.min(65535, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Cryptographic Algorithm</label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  {ALGORITHMS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">TTL (Seconds)</label>
                <input
                  type="number"
                  value={ttl}
                  onChange={(e) => setTtl(Math.max(60, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Certificate Payload (Base64 / PEM / URI)</label>
              <textarea
                value={rawCertData}
                onChange={(e) => setRawCertData(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                placeholder="Paste base64 certificate bytes or certificate URL..."
              />
            </div>
          </div>
        </div>

        {/* Right Output (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* BIND Master File */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" /> BIND Master Zone Record
              </span>
              <button
                onClick={handleCopyBind}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded flex items-center gap-1 transition shadow-sm"
              >
                {copiedBind ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedBind ? "Copied" : "Copy Record"}
              </button>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-emerald-300 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[220px] leading-relaxed shadow-inner">
              <code>{bindRecord}</code>
            </pre>
          </div>

          {/* Verification Dig Command */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" /> DNS Query Verification Command
              </span>
              <button
                onClick={handleCopyDig}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 transition"
              >
                {copiedDig ? "Copied!" : "Copy Command"}
              </button>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-cyan-300 border border-slate-800 rounded-xl p-3 overflow-x-auto">
              <code>{digCommand}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DnsCertRecordGenerator;
