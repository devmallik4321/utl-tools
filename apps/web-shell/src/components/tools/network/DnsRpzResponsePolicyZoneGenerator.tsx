'use client';

import React, { useState, useId } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Server,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  Info,
  Layers,
  Flame
} from 'lucide-react';

type RpzAction = 'nxdomain' | 'nodata' | 'passthru' | 'drop' | 'redirect';

interface RpzPreset {
  name: string;
  domain: string;
  action: RpzAction;
  redirectTarget: string;
  zoneName: string;
}

const PRESETS: RpzPreset[] = [
  {
    name: 'Malware & Phishing Sinkhole (NXDOMAIN)',
    domain: 'c2.malware-botnet.cc.',
    action: 'nxdomain',
    redirectTarget: '',
    zoneName: 'rpz.threat-feed.internal.',
  },
  {
    name: 'Executive Whitelist (PASSTHRU)',
    domain: 'partner-portal.trusted.com.',
    action: 'passthru',
    redirectTarget: '',
    zoneName: 'rpz.threat-feed.internal.',
  },
  {
    name: 'Walled Garden Corporate Security Redirect',
    domain: 'phishing-login.steal-creds.org.',
    action: 'redirect',
    redirectTarget: '192.0.2.128',
    zoneName: 'rpz.threat-feed.internal.',
  },
  {
    name: 'Stealth Packet Drop (DROP)',
    domain: 'ddos-amplification-target.net.',
    action: 'drop',
    redirectTarget: '',
    zoneName: 'rpz.threat-feed.internal.',
  },
];

export function DnsRpzResponsePolicyZoneGenerator() {
  const domainId = useId();
  const actionId = useId();
  const redirectId = useId();
  const zoneId = useId();

  const [domain, setDomain] = useState<string>('c2.malware-botnet.cc.');
  const [action, setAction] = useState<RpzAction>('nxdomain');
  const [redirectTarget, setRedirectTarget] = useState<string>('192.0.2.128');
  const [zoneName, setZoneName] = useState<string>('rpz.threat-feed.internal.');
  const [copiedZone, setCopiedZone] = useState<boolean>(false);
  const [copiedBind, setCopiedBind] = useState<boolean>(false);

  // Normalize domain
  const cleanDomain = domain.endsWith('.') ? domain : `${domain}.`;

  // Compute RPZ Rule
  const getRpzRecord = () => {
    switch (action) {
      case 'nxdomain':
        return `${cleanDomain.padEnd(32, ' ')} CNAME  .`;
      case 'nodata':
        return `${cleanDomain.padEnd(32, ' ')} CNAME  *.`;
      case 'passthru':
        return `${cleanDomain.padEnd(32, ' ')} CNAME  rpz-passthru.`;
      case 'drop':
        return `${cleanDomain.padEnd(32, ' ')} CNAME  rpz-drop.`;
      case 'redirect':
        if (redirectTarget.includes('.')) {
          return `${cleanDomain.padEnd(32, ' ')} A      ${redirectTarget}`;
        }
        return `${cleanDomain.padEnd(32, ' ')} CNAME  ${redirectTarget.endsWith('.') ? redirectTarget : `${redirectTarget}.`}`;
    }
  };

  const fullZoneFile = `; ==============================================================================
; DNS Response Policy Zone (RPZ / DNS Firewall) Master File
; RFC Draft / BIND 9 Compatible Zone
; ==============================================================================
$TTL 1h
@  IN  SOA  localhost. root.localhost. (
            2026090401 ; Serial YYYYMMDDNN
            3h         ; Refresh
            1h         ; Retry
            1w         ; Expire
            1h )       ; Negative Cache TTL
@  IN  NS   localhost.

; --- Policy Trigger Rule ---
${getRpzRecord()}
`;

  const bindNamedConf = `// /etc/bind/named.conf.options (BIND 9 Resolver Configuration)
options {
    directory "/var/cache/bind";
    recursion yes;

    // Enable DNS Response Policy Zone
    response-policy {
        zone "${zoneName.replace(/\.$/, '')}";
    };
};

zone "${zoneName.replace(/\.$/, '')}" {
    type master;
    file "/etc/bind/db.rpz";
    allow-query { none; };
};
`;

  const applyPreset = (p: RpzPreset) => {
    setDomain(p.domain);
    setAction(p.action);
    setRedirectTarget(p.redirectTarget);
    setZoneName(p.zoneName);
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            RPZ Policy Rule Trigger
          </h3>

          <div>
            <label htmlFor={domainId} className="block text-xs font-medium text-slate-400 mb-1">
              Target FQDN Domain Trigger
            </label>
            <input
              id={domainId}
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              placeholder="malware.example.com."
            />
          </div>

          <div>
            <label htmlFor={actionId} className="block text-xs font-medium text-slate-400 mb-1">
              Firewall Policy Action
            </label>
            <select
              id={actionId}
              value={action}
              onChange={(e) => setAction(e.target.value as RpzAction)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="nxdomain">NXDOMAIN (CNAME .) &mdash; Domain Does Not Exist</option>
              <option value="nodata">NODATA (CNAME *.) &mdash; NOERROR Zero Records</option>
              <option value="passthru">PASSTHRU (CNAME rpz-passthru.) &mdash; Whitelist Bypass</option>
              <option value="drop">DROP (CNAME rpz-drop.) &mdash; Silent Packet Drop</option>
              <option value="redirect">Local Redirect / Walled Garden (A / CNAME)</option>
            </select>
          </div>

          {action === 'redirect' && (
            <div>
              <label htmlFor={redirectId} className="block text-xs font-medium text-slate-400 mb-1">
                Walled Garden Redirect Destination (IP or CNAME)
              </label>
              <input
                id={redirectId}
                type="text"
                value={redirectTarget}
                onChange={(e) => setRedirectTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                placeholder="192.0.2.128 or warning.portal.internal."
              />
            </div>
          )}

          <div>
            <label htmlFor={zoneId} className="block text-xs font-medium text-slate-400 mb-1">
              RPZ Zone Name
            </label>
            <input
              id={zoneId}
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                RPZ Master Zone Record File (db.rpz)
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fullZoneFile);
                  setCopiedZone(true);
                  setTimeout(() => setCopiedZone(false), 2000);
                }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedZone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedZone ? 'Copied' : 'Copy Zone File'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800/80">
              <code>{fullZoneFile}</code>
            </pre>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                BIND 9 named.conf.options Activation
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(bindNamedConf);
                  setCopiedBind(true);
                  setTimeout(() => setCopiedBind(false), 2000);
                }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedBind ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedBind ? 'Copied' : 'Copy Config'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800/80">
              <code>{bindNamedConf}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          How DNS Firewalls (RPZ) Intercept Cyber Threats
        </h4>
        <p>
          Response Policy Zones (RPZ) allow recursive DNS servers to dynamically modify responses based on threat intelligence feeds. By converting malicious domains into <code>CNAME .</code> (NXDOMAIN), resolvers prevent enterprise workstations and IoT devices from resolving malware, phishing, and ransomware C2 endpoints before an IP connection is ever established.
        </p>
      </div>
    </div>
  );
}

export default DnsRpzResponsePolicyZoneGenerator;
