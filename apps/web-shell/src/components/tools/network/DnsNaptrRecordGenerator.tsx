'use client';

import React, { useState, useMemo } from 'react';
import { Phone, Shield, Copy, Check, Terminal, ExternalLink, Info, Code2 } from 'lucide-react';

interface NaptrPreset {
  name: string;
  domain: string;
  order: number;
  preference: number;
  flags: string;
  services: string;
  regex: string;
  replacement: string;
}

const PRESETS: NaptrPreset[] = [
  {
    name: 'ENUM to SIP URI (+1-800-555-0199)',
    domain: '9.9.1.0.5.5.5.0.0.8.1.e164.arpa.',
    order: 100,
    preference: 10,
    flags: 'u',
    services: 'E2U+sip',
    regex: '!^.*$!sip:customer-support@sip.carrier.net!',
    replacement: '.'
  },
  {
    name: 'ENUM Voice Mail (E2U+voice:mailto)',
    domain: '9.9.1.0.5.5.5.0.0.8.1.e164.arpa.',
    order: 100,
    preference: 20,
    flags: 'u',
    services: 'E2U+voice:mailto',
    regex: '!^.*$!mailto:voicemail@carrier.net!',
    replacement: '.'
  },
  {
    name: 'SIP SIPS TLS Delegation (Terminal S Flag)',
    domain: 'example.com.',
    order: 50,
    preference: 50,
    flags: 's',
    services: 'SIPS+D2T',
    regex: '',
    replacement: '_sips._tcp.example.com.'
  }
];

export function DnsNaptrRecordGenerator() {
  const [domain, setDomain] = useState<string>('9.9.1.0.5.5.5.0.0.8.1.e164.arpa.');
  const [order, setOrder] = useState<number>(100);
  const [preference, setPreference] = useState<number>(10);
  const [flags, setFlags] = useState<string>('u');
  const [services, setServices] = useState<string>('E2U+sip');
  const [regex, setRegex] = useState<string>('!^.*$!sip:customer-support@sip.carrier.net!');
  const [replacement, setReplacement] = useState<string>('.');
  const [ttl, setTtl] = useState<number>(3600);
  const [copied, setCopied] = useState<boolean>(false);

  const applyPreset = (p: NaptrPreset) => {
    setDomain(p.domain);
    setOrder(p.order);
    setPreference(p.preference);
    setFlags(p.flags);
    setServices(p.services);
    setRegex(p.regex);
    setReplacement(p.replacement);
  };

  const zoneRecord = useMemo(() => {
    const d = domain.endsWith('.') ? domain : domain + '.';
    const repl = replacement.endsWith('.') ? replacement : replacement + '.';
    const regexPart = regex ? `"${regex}"` : '""';
    return `${d}    ${ttl}    IN    NAPTR    ${order}    ${preference}    "${flags}"    "${services}"    ${regexPart}    ${repl}`;
  }, [domain, ttl, order, preference, flags, services, regex, replacement]);

  const handleCopy = () => {
    navigator.clipboard.writeText(zoneRecord);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">DNS NAPTR Record Generator (ENUM & SIP)</h1>
            <p className="text-sm text-slate-400">
              Generate RFC 2915 / RFC 3403 / RFC 3761 compliant Naming Authority Pointer (NAPTR) resource records for VoIP, E.164 telephony, and SIP routing.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">NAPTR Fields</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Preset Configurations</label>
            <div className="space-y-1">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="w-full text-left p-2 rounded bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 truncate border border-slate-700"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Owner Name (FQDN / ENUM arpa)</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Order (Evaluation Order)</label>
              <input
                type="number"
                min="0"
                max="65535"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Preference (Tie-breaker)</label>
              <input
                type="number"
                min="0"
                max="65535"
                value={preference}
                onChange={(e) => setPreference(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Flags (u, s, a, p, "")</label>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="u"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Services</label>
              <input
                type="text"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="E2U+sip"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">RegExp Substitution</label>
            <input
              type="text"
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
              placeholder="!^.*$!sip:user@host.com!"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Replacement Domain</label>
            <input
              type="text"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-semibold text-slate-200">BIND9 / RFC Zone File Record</h2>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Zone Record'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {zoneRecord}
            </pre>
          </div>

          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-slate-400 space-y-2">
            <span className="font-semibold text-slate-300 block">RFC 3403 NAPTR Flag Reference:</span>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li><code>&quot;u&quot;</code> (URI): Indicates a terminal lookup where the output is a URI (e.g. <code>sip:...</code> or <code>mailto:...</code>).</li>
              <li><code>&quot;s&quot;</code> (SRV): Terminal lookup resulting in an SRV record query (e.g. <code>_sips._tcp.domain</code>).</li>
              <li><code>&quot;a&quot;</code> (Address): Terminal lookup resulting in an A or AAAA query.</li>
              <li><code>&quot;&quot;</code> (Non-terminal): Feeds into subsequent NAPTR lookups.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DnsNaptrRecordGenerator;
