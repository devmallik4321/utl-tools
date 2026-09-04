"use client";

import React, { useState, useMemo } from "react";
import { KeyRound, ShieldCheck, Copy, Check, Terminal, Globe, Info } from "lucide-react";

// SHA-256 in browser or fallback
async function sha256Hex(str: string): Promise<string> {
  const enc = new TextEncoder().encode(str);
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const buf = await window.crypto.subtle.digest("SHA-256", enc);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback simple hash for testing
  return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
}

export function DnsOpenPgpKeyRecordGenerator() {
  const [email, setEmail] = useState<string>("alice@security.corp");
  const [ttl, setTtl] = useState<number>(3600);
  const [armoredKey, setArmoredKey] = useState<string>(
    `-----BEGIN PGP PUBLIC KEY BLOCK-----
Comment: Sample Test Key
mQENBF4v27MBCADR3m2Yh2O...EXAMPLE...bWlzc2luZw==
=sH3r
-----END PGP PUBLIC KEY BLOCK-----`
  );
  const [localPartHash, setLocalPartHash] = useState<string>("2b8813a48e7e1f44e1e8284e36502e604f325d7b1348b990f1e29a8b");
  const [copiedBind, setCopiedBind] = useState(false);
  const [copiedDig, setCopiedDig] = useState(false);

  // Compute local-part hash on email change
  React.useEffect(() => {
    const parts = email.trim().split("@");
    if (parts.length === 2 && parts[0].length > 0) {
      sha256Hex(parts[0].toLowerCase()).then((fullHash) => {
        // RFC 7929 Section 3: first 28 octets of the SHA-256 hash (56 hex chars)
        setLocalPartHash(fullHash.substring(0, 56));
      });
    }
  }, [email]);

  const recordData = useMemo(() => {
    const parts = email.trim().split("@");
    const domain = parts.length === 2 ? parts[1] : "example.com";
    const subDomain = `${localPartHash}._openpgpkey.${domain}.`;

    // Strip PGP Armor headers, blank lines, and CRC "=..."
    const lines = armoredKey.split("\n");
    let base64Content = "";
    let insideBody = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith("-----BEGIN PGP PUBLIC KEY BLOCK")) {
        insideBody = true;
        continue;
      }
      if (line.startsWith("-----END PGP PUBLIC KEY BLOCK")) {
        insideBody = false;
        break;
      }
      if (insideBody) {
        if (line.includes(":") || line === "") {
          continue; // header comments
        }
        if (line.startsWith("=")) {
          continue; // CRC checksum
        }
        base64Content += line;
      }
    }

    // Convert base64 to hex
    let hexKey = "";
    try {
      const bin = typeof window !== "undefined" ? atob(base64Content) : Buffer.from(base64Content, "base64").toString("binary");
      const bytes: string[] = [];
      for (let i = 0; i < bin.length; i++) {
        bytes.push(bin.charCodeAt(i).toString(16).padStart(2, "0"));
      }
      hexKey = bytes.join("").toUpperCase();
    } catch {
      hexKey = "990100A0...<HEX_DATA>...";
    }

    const bindRecord = `${subDomain}  ${ttl}  IN  OPENPGPKEY  ${hexKey}`;
    const genericRfc3597 = `${subDomain}  ${ttl}  IN  TYPE61  \\# ${Math.round(hexKey.length / 2)} ${hexKey}`;
    const digCmd = `dig -t OPENPGPKEY ${subDomain}`;

    return {
      domain,
      subDomain,
      bindRecord,
      genericRfc3597,
      digCmd,
      hexLength: Math.round(hexKey.length / 2)
    };
  }, [email, localPartHash, ttl, armoredKey]);

  const handleCopyBind = async () => {
    try {
      await navigator.clipboard.writeText(recordData.bindRecord);
      setCopiedBind(true);
      setTimeout(() => setCopiedBind(false), 2000);
    } catch {}
  };

  const handleCopyDig = async () => {
    try {
      await navigator.clipboard.writeText(recordData.digCmd);
      setCopiedDig(true);
      setTimeout(() => setCopiedDig(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            RFC 7929 DANE Standard
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            DNSSEC Email Encryption
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-emerald-400" />
          DNS OPENPGPKEY Record Generator (RFC 7929)
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Publish OpenPGP public encryption keys directly into DNS via RFC 7929 DANE OPENPGPKEY resource records, allowing email clients to automatically discover recipient keys without centralized keyservers.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" /> Target Identity & TTL
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Recipient Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@domain.org"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>RFC 7929 Local-Part SHA-256 Hash (28 Octets)</span>
                <span className="font-mono text-indigo-400">56 hex chars</span>
              </div>
              <input
                type="text"
                readOnly
                value={localPartHash}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Time to Live (TTL seconds)</label>
              <input
                type="number"
                value={ttl}
                onChange={(e) => setTtl(Math.max(60, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">ASCII-Armored PGP Public Key</label>
              <textarea
                value={armoredKey}
                onChange={(e) => setArmoredKey(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                placeholder="-----BEGIN PGP PUBLIC KEY BLOCK----- ... -----END PGP PUBLIC KEY BLOCK-----"
              />
            </div>
          </div>
        </div>

        {/* Right Outputs (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* BIND Record */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> BIND / RFC 7929 Zone Record
              </span>
              <button
                onClick={handleCopyBind}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1 transition shadow-sm"
              >
                {copiedBind ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedBind ? "Copied" : "Copy Record"}
              </button>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-emerald-300 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[160px] leading-relaxed shadow-inner">
              <code>{recordData.bindRecord}</code>
            </pre>
          </div>

          {/* RFC 3597 Unknown Type Fallback */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <span className="text-xs font-semibold text-slate-300">RFC 3597 Generic Fallback (TYPE61)</span>
            <pre className="w-full bg-slate-950/90 font-mono text-[11px] text-slate-300 border border-slate-800 rounded-xl p-3 overflow-x-auto max-h-[120px] leading-relaxed">
              <code>{recordData.genericRfc3597}</code>
            </pre>
          </div>

          {/* CLI Dig Command */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" /> Verification Dig Command
              </span>
              <button
                onClick={handleCopyDig}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 transition"
              >
                {copiedDig ? "Copied!" : "Copy Command"}
              </button>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-cyan-300 border border-slate-800 rounded-xl p-3 overflow-x-auto">
              <code>{recordData.digCmd}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DnsOpenPgpKeyRecordGenerator;
