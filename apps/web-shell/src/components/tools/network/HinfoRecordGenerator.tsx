'use client';

import React, { useState, useId } from 'react';
import {
  Server,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  Cpu,
  Globe,
  Info
} from 'lucide-react';

interface HinfoPreset {
  name: string;
  domain: string;
  ttl: number;
  cpu: string;
  os: string;
  isRfc8482: boolean;
  description: string;
}

const PRESETS: HinfoPreset[] = [
  {
    name: 'RFC 8482 Anti-DDoS ANY Response',
    domain: 'example.com.',
    ttl: 3788,
    cpu: 'RFC8482',
    os: '',
    isRfc8482: true,
    description: 'Modern DNS standard suppressing DNS ANY reflection amplification attacks (RFC 8482).',
  },
  {
    name: 'Enterprise Cloud Kubernetes Worker',
    domain: 'node-01.k8s.internal.',
    ttl: 3600,
    cpu: 'ARM64 / Graviton3',
    os: 'Linux 6.6 Amazon-Linux-2023',
    isRfc8482: false,
    description: 'Internal infrastructure node inventory record for non-public split-horizon DNS.',
  },
  {
    name: 'Hardened Bastion Gateway',
    domain: 'gw-ext.secure.net.',
    ttl: 86400,
    cpu: 'Intel Xeon x86_64',
    os: 'OpenBSD 7.5-RELEASE',
    isRfc8482: false,
    description: 'Hardened edge gateway server host specification.',
  },
  {
    name: 'Classic RFC 1035 Historical VAX',
    domain: 'vax1.mit.edu.',
    ttl: 86400,
    cpu: 'DEC-VAX-11/780',
    os: '4.3BSD UNIX',
    isRfc8482: false,
    description: 'Original ARPANET/RFC 1035 computing system specification style.',
  },
];

export function HinfoRecordGenerator() {
  const domainId = useId();
  const ttlId = useId();
  const cpuId = useId();
  const osId = useId();

  const [domain, setDomain] = useState<string>('example.com.');
  const [ttl, setTtl] = useState<number>(3788);
  const [cpu, setCpu] = useState<string>('RFC8482');
  const [os, setOs] = useState<string>('');
  const [isRfc8482, setIsRfc8482] = useState<boolean>(true);
  const [copiedBind, setCopiedBind] = useState<boolean>(false);
  const [copiedWire, setCopiedWire] = useState<boolean>(false);

  const applyPreset = (p: HinfoPreset) => {
    setDomain(p.domain);
    setTtl(p.ttl);
    setCpu(p.cpu);
    setOs(p.os);
    setIsRfc8482(p.isRfc8482);
  };

  const handleToggleRfc8482 = () => {
    if (!isRfc8482) {
      setCpu('RFC8482');
      setOs('');
      setIsRfc8482(true);
    } else {
      setCpu('x86_64');
      setOs('Linux 6.8');
      setIsRfc8482(false);
    }
  };

  // Ensure trailing dot if needed
  const normalizedDomain = domain.endsWith('.') ? domain : `${domain}.`;

  // BIND Zone Format: <domain> <ttl> IN HINFO "<cpu>" "<os>"
  const bindRecord = `${normalizedDomain.padEnd(24, ' ')} ${ttl}  IN  HINFO  "${cpu}" "${os}"`;

  // PowerDNS generic format
  const powerDnsRecord = `INSERT INTO records (domain_id, name, type, content, ttl) VALUES (1, '${normalizedDomain}', 'HINFO', '"${cpu}" "${os}"', ${ttl});`;

  // Compute wire format byte representation (character-string: 1-byte length followed by octets)
  const encodeWireString = (str: string): string => {
    const bytes = Array.from(new TextEncoder().encode(str));
    const len = bytes.length.toString(16).padStart(2, '0');
    const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ');
    return `${len} ${hex}`.trim();
  };

  const wireCpu = encodeWireString(cpu);
  const wireOs = encodeWireString(os);
  const wireFormat = `CPU Octets: [len=${cpu.length}] ${wireCpu || '00'}\nOS  Octets: [len=${os.length}] ${wireOs || '00'}`;

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

      {/* RFC 8482 Mode Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
        isRfc8482
          ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
          : 'bg-amber-950/20 border-amber-800/60 text-amber-300'
      }`}>
        {isRfc8482 ? (
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="text-xs space-y-1">
          <div className="font-semibold flex items-center gap-2">
            <span>{isRfc8482 ? 'RFC 8482 Anti-Amplification Mode Active' : 'Traditional RFC 1035 Host Inventory Mode'}</span>
            <button
              onClick={handleToggleRfc8482}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-normal transition"
            >
              Switch to {isRfc8482 ? 'Custom Hardware Mode' : 'RFC 8482 Mode'}
            </button>
          </div>
          <p className="text-slate-400">
            {isRfc8482
              ? 'RFC 8482 standardizes returning a minimal HINFO record ("RFC8482" "") when queried with QTYPE=ANY, preventing attackers from using authoritative DNS servers as massive DDoS amplification reflectors.'
              : 'Warning: Publishing actual hardware & OS versions on public authoritative DNS creates an information disclosure vector (host OS fingerprinting for exploit scanners). Recommended only for private intranets.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            HINFO Record Parameters
          </h3>

          <div>
            <label htmlFor={domainId} className="block text-xs font-medium text-slate-400 mb-1">
              Fully Qualified Domain Name (FQDN)
            </label>
            <input
              id={domainId}
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              placeholder="example.com."
            />
          </div>

          <div>
            <label htmlFor={ttlId} className="block text-xs font-medium text-slate-400 mb-1">
              Time to Live (TTL in seconds)
            </label>
            <input
              id={ttlId}
              type="number"
              min="60"
              max="604800"
              step="60"
              value={ttl}
              onChange={(e) => setTtl(Number(e.target.value) || 300)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label htmlFor={cpuId} className="block text-xs font-medium text-slate-400 mb-1">
              Hardware Architecture (CPU string)
            </label>
            <input
              id={cpuId}
              type="text"
              value={cpu}
              disabled={isRfc8482}
              onChange={(e) => setCpu(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none ${
                isRfc8482
                  ? 'bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-sky-500'
              }`}
              placeholder="e.g. x86_64, ARM64, DEC-VAX"
            />
          </div>

          <div>
            <label htmlFor={osId} className="block text-xs font-medium text-slate-400 mb-1">
              Operating System (OS string)
            </label>
            <input
              id={osId}
              type="text"
              value={os}
              disabled={isRfc8482}
              onChange={(e) => setOs(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none ${
                isRfc8482
                  ? 'bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-sky-500'
              }`}
              placeholder="e.g. Linux 6.8, FreeBSD 14, or blank"
            />
          </div>
        </div>

        {/* Output Previews */}
        <div className="lg:col-span-7 space-y-5">
          {/* BIND Zone File Syntax */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                BIND / RFC 1035 Master File Format
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
                {copiedBind ? 'Copied' : 'Copy Zone Record'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800/80">
              <code>{bindRecord}</code>
            </pre>
          </div>

          {/* SQL / PowerDNS */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-400" />
              PowerDNS SQL Backend Insert
            </h4>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800/80">
              <code>{powerDnsRecord}</code>
            </pre>
          </div>

          {/* RFC 1035 Wire Format Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-amber-400" />
                Wire Representation (RDATA Octets)
              </h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(wireFormat);
                  setCopiedWire(true);
                  setTimeout(() => setCopiedWire(false), 2000);
                }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedWire ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedWire ? 'Copied' : 'Copy Octets'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800/80 whitespace-pre">
              <code>{wireFormat}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Technical Background */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          RFC 1035 & RFC 8482 Technical Specifications
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/70 space-y-1">
            <span className="font-semibold text-slate-200">RFC 1035 Section 3.3.2 (HINFO RDATA)</span>
            <p>
              An HINFO record holds host CPU architecture and Operating System identification as two length-prefixed &lt;character-string&gt; fields, each up to 255 octets. Originally designed in the 1980s for network inventory mapping.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/70 space-y-1">
            <span className="font-semibold text-slate-200">RFC 8482 (Providing Minimal ANY Responses)</span>
            <p>
              DNS QTYPE=ANY queries were historically weaponized by botnets to generate 50x-70x bandwidth amplification in volumetric DDoS attacks. Cloudflare, Google Public DNS, and Akamai adopted RFC 8482 which synthesizes a lightweight HINFO record with CPU="RFC8482" and OS="" to neutralize amplification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HinfoRecordGenerator;

