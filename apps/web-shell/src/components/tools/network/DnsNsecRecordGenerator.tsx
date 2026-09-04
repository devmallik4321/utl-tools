'use client';

import React, { useState, useId } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Server,
  Terminal,
  Lock,
  Copy,
  Check,
  RotateCcw,
  Info,
  Layers
} from 'lucide-react';

const COMMON_TYPES = ['A', 'AAAA', 'NS', 'SOA', 'MX', 'TXT', 'RRSIG', 'NSEC', 'DNSKEY', 'CAA'];

const TYPE_CODES: Record<string, number> = {
  A: 1,
  NS: 2,
  SOA: 6,
  MX: 15,
  TXT: 16,
  AAAA: 28,
  RRSIG: 46,
  NSEC: 47,
  DNSKEY: 48,
  CAA: 257,
};

interface NsecPreset {
  name: string;
  owner: string;
  nextDomain: string;
  ttl: number;
  types: string[];
}

const PRESETS: NsecPreset[] = [
  {
    name: 'Canonical Alphabetical Gap Proof',
    owner: 'alfa.example.com.',
    nextDomain: 'charlie.example.com.',
    ttl: 3600,
    types: ['A', 'AAAA', 'RRSIG', 'NSEC'],
  },
  {
    name: 'Zone Apex Root NSEC',
    owner: 'example.com.',
    nextDomain: 'admin.example.com.',
    ttl: 86400,
    types: ['A', 'NS', 'SOA', 'MX', 'TXT', 'RRSIG', 'NSEC', 'DNSKEY'],
  },
];

export function DnsNsecRecordGenerator() {
  const ownerId = useId();
  const nextId = useId();
  const ttlId = useId();

  const [owner, setOwner] = useState<string>('alfa.example.com.');
  const [nextDomain, setNextDomain] = useState<string>('charlie.example.com.');
  const [ttl, setTtl] = useState<number>(3600);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['A', 'AAAA', 'RRSIG', 'NSEC']);
  const [copiedBind, setCopiedBind] = useState<boolean>(false);
  const [copiedHex, setCopiedHex] = useState<boolean>(false);

  const toggleType = (t: string) => {
    if (selectedTypes.includes(t)) {
      if (t === 'NSEC' || t === 'RRSIG') return; // mandatory for NSEC records
      setSelectedTypes(selectedTypes.filter((x) => x !== t));
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const bindRecord = `${owner.padEnd(24, ' ')} ${ttl}  IN  NSEC  ${nextDomain} ${selectedTypes.join(' ')}`;

  // Encode Type Bit Map Window 0 (types 0..255)
  const computeTypeBitmapHex = () => {
    const bytes = new Uint8Array(32);
    let maxByteIndex = 0;

    for (const t of selectedTypes) {
      const code = TYPE_CODES[t] || 0;
      if (code < 256) {
        const byteIndex = Math.floor(code / 8);
        const bitIndex = 7 - (code % 8);
        bytes[byteIndex] |= 1 << bitIndex;
        if (byteIndex > maxByteIndex) maxByteIndex = byteIndex;
      }
    }

    const windowLen = maxByteIndex + 1;
    const windowBytes = Array.from(bytes.slice(0, windowLen))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');

    return `Window Block: 00 | Length: ${windowLen.toString(16).padStart(2, '0')} | Bitmap: ${windowBytes}`;
  };

  const hexRepresentation = computeTypeBitmapHex();

  const applyPreset = (p: NsecPreset) => {
    setOwner(p.owner);
    setNextDomain(p.nextDomain);
    setTtl(p.ttl);
    setSelectedTypes(p.types);
  };

  return (
    <div className="space-y-8">
      {/* Presets Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Presets:</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => applyPreset(PRESETS[0])}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Security Advisory Card: Zone Walking Warning */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/50 flex items-start gap-3 text-xs text-amber-300">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold">DNSSEC NSEC Zone Walking Advisory (RFC 5155 Transition):</span>
          <p className="text-slate-400">
            NSEC chains all domain names in a zone in alphabetical order. Because each NSEC record points to the exact next owner name, external attackers can systematically query nonexistent names to map every single host in your zone (known as &quot;zone walking&quot;). For privacy-sensitive zones, NSEC3 hashed denial of existence is recommended.
          </p>
        </div>
      </div>

      {/* Main Grid: Form Inputs + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            NSEC Canonical Parameters
          </h3>

          <div>
            <label htmlFor={ownerId} className="block text-xs font-medium text-slate-400 mb-1">
              Current Owner Domain Name
            </label>
            <input
              id={ownerId}
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              placeholder="alfa.example.com."
            />
          </div>

          <div>
            <label htmlFor={nextId} className="block text-xs font-medium text-slate-400 mb-1">
              Next Domain Name (Canonical Order)
            </label>
            <input
              id={nextId}
              type="text"
              value={nextDomain}
              onChange={(e) => setNextDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              placeholder="charlie.example.com."
            />
          </div>

          <div>
            <label htmlFor={ttlId} className="block text-xs font-medium text-slate-400 mb-1">
              Time to Live (TTL seconds)
            </label>
            <input
              id={ttlId}
              type="number"
              step="300"
              value={ttl}
              onChange={(e) => setTtl(Number(e.target.value) || 300)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Type Bit Map (Record Types Existing at Owner):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_TYPES.map((t) => {
                const isSelected = selectedTypes.includes(t);
                const isLocked = t === 'NSEC' || t === 'RRSIG';
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={isLocked}
                    onClick={() => toggleType(t)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-mono font-medium border transition ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7 space-y-4">
          {/* BIND Master File Format */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                BIND / RFC 4034 Master Zone Format
              </h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(bindRecord);
                  setCopiedBind(true);
                  setTimeout(() => setCopiedBind(false), 2000);
                }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedBind ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedBind ? 'Copied' : 'Copy Record'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800/80">
              <code>{bindRecord}</code>
            </pre>
          </div>

          {/* Type Bit Map Octet Wire Format */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-sky-400" />
                RFC 4034 Wire Type Bit Map Hex
              </h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(hexRepresentation);
                  setCopiedHex(true);
                  setTimeout(() => setCopiedHex(false), 2000);
                }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedHex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedHex ? 'Copied' : 'Copy Hex'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800/80">
              <code>{hexRepresentation}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Explanatory Guide */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          How DNSSEC Proves Non-Existence (Authenticated Denial)
        </h4>
        <p>
          In standard DNS, querying a nonexistent hostname returns <code>NXDOMAIN</code> without cryptographic proof. In DNSSEC, an authoritative server cannot sign dynamically on the fly without keeping private keys online. Instead, the zone is signed offline: NSEC records create a circular linked list of all existing names. When someone queries <code>bravo.example.com</code>, the resolver provides the signed NSEC spanning from <code>alfa</code> to <code>charlie</code>, cryptographically proving no record named <code>bravo</code> exists.
        </p>
      </div>
    </div>
  );
}

export default DnsNsecRecordGenerator;
