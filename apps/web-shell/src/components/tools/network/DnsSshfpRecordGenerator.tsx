"use client";

import React, { useState, useId } from "react";
import { ShieldCheck, Copy, Check, Terminal, Globe, Server, Info } from "lucide-react";

interface AlgorithmOption {
  id: number;
  name: string;
  rfc: string;
}

const ALGORITHMS: AlgorithmOption[] = [
  { id: 4, name: "Ed25519 (Modern Default)", rfc: "RFC 7479" },
  { id: 3, name: "ECDSA", rfc: "RFC 6594" },
  { id: 1, name: "RSA", rfc: "RFC 4255" },
  { id: 2, name: "DSA (Deprecated)", rfc: "RFC 4255" }
];

const DIGEST_TYPES = [
  { id: 2, name: "2 - SHA-256 (64 hex characters, Recommended)", length: 64 },
  { id: 1, name: "1 - SHA-1 (40 hex characters, Legacy)", length: 40 }
];

export function DnsSshfpRecordGenerator() {
  const [hostname, setHostname] = useState<string>("bastion.infra.internal");
  const [algorithm, setAlgorithm] = useState<number>(4); // Ed25519
  const [digestType, setDigestType] = useState<number>(2); // SHA-256
  const [ttl, setTtl] = useState<number>(3600);
  const [rawFingerprint, setRawFingerprint] = useState<string>(
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  );
  const [copiedBind, setCopiedBind] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  // Clean hex fingerprint (strip colons, spaces, prefix SHA256:)
  const cleanFingerprint = (input: string): string => {
    let clean = input.trim();
    if (clean.toUpperCase().startsWith("SHA256:")) {
      clean = clean.substring(7);
    }
    // If base64 from ssh-keygen, user might have pasted it; but RFC 4255 requires hex.
    // Clean hex delimiters
    return clean.replace(/[:\s-]/g, "").toLowerCase();
  };

  const fingerprintHex = cleanFingerprint(rawFingerprint);
  const expectedLen = digestType === 2 ? 64 : 40;
  const isValidHex = /^[0-9a-f]+$/i.test(fingerprintHex) && fingerprintHex.length === expectedLen;

  // BIND Zone Format
  const formattedHostname = hostname.trim().endsWith(".") ? hostname.trim() : `${hostname.trim()}.`;
  const bindRecord = `${formattedHostname}  ${ttl}  IN  SSHFP  ${algorithm}  ${digestType}  ${fingerprintHex.toUpperCase()}`;

  // AWS Route53 JSON
  const route53Json = JSON.stringify(
    {
      Name: formattedHostname,
      Type: "SSHFP",
      TTL: ttl,
      ResourceRecords: [{ Value: `${algorithm} ${digestType} ${fingerprintHex.toUpperCase()}` }]
    },
    null,
    2
  );

  const verificationCommand = `ssh -o VerifyHostKeyDNS=yes -o StrictHostKeyChecking=ask user@${hostname.trim()}`;
  const digCommand = `dig +dnssec -t SSHFP ${hostname.trim()}`;

  const handleCopyBind = async () => {
    try {
      await navigator.clipboard.writeText(bindRecord);
      setCopiedBind(true);
      setTimeout(() => setCopiedBind(false), 2000);
    } catch {}
  };

  const handleCopyCli = async () => {
    try {
      await navigator.clipboard.writeText(`${digCommand}\n${verificationCommand}`);
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            RFC 4255 / RFC 7479
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            DNSSEC Host Key Verification
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          DNS SSHFP (SSH Fingerprint) Record Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate standards-compliant DNS SSHFP resource records for secure out-of-band SSH host key verification via DNSSEC, neutralizing Man-In-The-Middle (MITM) attacks.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" /> Record Parameters
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Host FQDN</label>
              <input
                type="text"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="bastion.infra.example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Key Algorithm</label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  {ALGORITHMS.map((algo) => (
                    <option key={algo.id} value={algo.id}>
                      {algo.id}: {algo.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Digest Type</label>
                <select
                  value={digestType}
                  onChange={(e) => setDigestType(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  {DIGEST_TYPES.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Time to Live (TTL seconds)</label>
              <input
                type="number"
                value={ttl}
                onChange={(e) => setTtl(Math.max(60, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Public Key Hex Fingerprint</span>
                <span className={`font-mono text-[11px] ${isValidHex ? "text-emerald-400" : "text-amber-400"}`}>
                  {fingerprintHex.length} / {expectedLen} chars
                </span>
              </div>
              <textarea
                value={rawFingerprint}
                onChange={(e) => setRawFingerprint(e.target.value)}
                placeholder="Paste hexadecimal fingerprint (e.g. from ssh-keygen -r host.example.com)"
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
              />
              {!isValidHex && (
                <p className="text-[11px] text-amber-400 mt-1">
                  Expected {expectedLen} valid hex characters for digest type {digestType}.
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2 text-slate-400">
            <div className="text-indigo-400 font-semibold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> How to generate SSHFP on Linux/macOS
            </div>
            <p>Run either of the following commands on your server:</p>
            <pre className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
              ssh-keygen -r {hostname} -f /etc/ssh/ssh_host_ed25519_key.pub
            </pre>
          </div>
        </div>

        {/* Right Output (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* BIND Master File Format */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" /> BIND / Cloudflare Zone Record
              </span>
              <button
                onClick={handleCopyBind}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded flex items-center gap-1 transition shadow-sm"
              >
                {copiedBind ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedBind ? "Copied" : "Copy Record"}
              </button>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-emerald-300 border border-slate-800 rounded-xl p-4 overflow-x-auto leading-relaxed shadow-inner">
              <code>{bindRecord}</code>
            </pre>
          </div>

          {/* Route53 JSON */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <span className="text-xs font-semibold text-slate-300">AWS Route53 / JSON Representation</span>
            <pre className="w-full bg-slate-950/90 font-mono text-[11px] text-slate-300 border border-slate-800 rounded-xl p-3 overflow-x-auto max-h-[160px] leading-relaxed">
              <code>{route53Json}</code>
            </pre>
          </div>

          {/* Verification Commands */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" /> Client Verification Shell Commands
              </span>
              <button
                onClick={handleCopyCli}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 transition"
              >
                {copiedCli ? "Copied!" : "Copy Commands"}
              </button>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-cyan-300 border border-slate-800 rounded-xl p-3 overflow-x-auto space-y-1">
              <code>{`# Verify DNS publication:\n${digCommand}\n\n# Connect with strict DNS verification:\n${verificationCommand}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DnsSshfpRecordGenerator;
