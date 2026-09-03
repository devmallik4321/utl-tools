"use client";

import { useState, useMemo } from "react";
import { Server, Copy, Check, Sparkles, Terminal, Globe, Network, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function ArpaZoneGenerator() {
  const [ipSubnet, setIpSubnet] = useState<string>("198.51.100.32");
  const [cidrPrefix, setCidrPrefix] = useState<number>(28); // /25 to /29
  const [nameserver, setNameserver] = useState<string>("ns1.example.com.");
  const [domainSuffix, setDomainSuffix] = useState<string>("example.com");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    parentZoneName,
    childZoneName,
    childZoneFile,
    parentCnameSnippet,
    digTest,
  } = useMemo(() => {
    const octets = ipSubnet.trim().split(".").map((o) => parseInt(o) || 0);
    const o0 = octets[0] || 198;
    const o1 = octets[1] || 51;
    const o2 = octets[2] || 100;
    const o3 = octets[3] || 0;

    const blockSize = Math.pow(2, 32 - cidrPrefix);
    const startHost = o3;
    const endHost = o3 + blockSize - 1;

    const parentZone = `${o2}.${o1}.${o0}.in-addr.arpa`;
    const childOrigin = `${startHost}/${cidrPrefix}.${parentZone}`;

    // Generate Customer Zone File
    let child = `; RFC 2317 Classless Reverse DNS Zone File\n`;
    child += `$TTL 86400\n`;
    child += `$ORIGIN ${childOrigin}.\n\n`;
    child += `@   IN  SOA  ${nameserver} hostmaster.${domainSuffix}. (\n`;
    child += `        2026090401 ; Serial (YYYYMMDDNN)\n`;
    child += `        10800      ; Refresh\n`;
    child += `        3600       ; Retry\n`;
    child += `        604800     ; Expire\n`;
    child += `        86400 )    ; Minimum TTL\n\n`;
    child += `@   IN  NS   ${nameserver}\n\n`;
    child += `; PTR Host Records for Subnet Range .${startHost} to .${endHost}\n`;

    for (let h = startHost + 1; h < endHost; h++) {
      const hostName = h === startHost + 1 ? `router.${domainSuffix}.` : h === startHost + 2 ? `mail.${domainSuffix}.` : `host-${h}.${domainSuffix}.`;
      child += `${h}    IN  PTR  ${hostName}\n`;
    }

    // Generate ISP Parent CNAME Delegation
    let parent = `; Parent ISP Zone Delegation Snippet for ${parentZone}.\n`;
    parent += `; Paste into parent ISP zone to delegate ${ipSubnet}/${cidrPrefix} to customer NS:\n\n`;
    parent += `${startHost}/${cidrPrefix}    IN  NS  ${nameserver}\n\n`;
    parent += `; RFC 2317 CNAME Aliases:\n`;
    for (let h = startHost + 1; h < endHost; h++) {
      parent += `${h}    IN  CNAME  ${h}.${startHost}/${cidrPrefix}.${parentZone}.\n`;
    }

    const dig = `dig PTR ${startHost + 2}.${parentZone} +trace`;

    return {
      parentZoneName: parentZone,
      childZoneName: childOrigin,
      childZoneFile: child,
      parentCnameSnippet: parent,
      digTest: dig,
    };
  }, [ipSubnet, cidrPrefix, nameserver, domainSuffix]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Base Subnet IP
          </label>
          <input
            type="text"
            value={ipSubnet}
            onChange={(e) => setIpSubnet(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Subnet Prefix
          </label>
          <select
            value={cidrPrefix}
            onChange={(e) => setCidrPrefix(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={25}>/25 (128 IP Addresses)</option>
            <option value={26}>/26 (64 IP Addresses)</option>
            <option value={27}>/27 (32 IP Addresses)</option>
            <option value={28}>/28 (16 IP Addresses)</option>
            <option value={29}>/29 (8 IP Addresses)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Primary Nameserver (FQDN)
          </label>
          <input
            type="text"
            value={nameserver}
            onChange={(e) => setNameserver(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Customer Domain Suffix
          </label>
          <input
            type="text"
            value={domainSuffix}
            onChange={(e) => setDomainSuffix(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* RFC 2317 Origin Banner */}
      <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl flex items-center justify-between font-mono">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block font-sans">
            RFC 2317 Child Origin Zone
          </span>
          <span className="text-[11px] text-muted-foreground font-sans">
            Delegated zone name for classless sub-/24 PTR records
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-card rounded-lg text-xs font-extrabold text-foreground border border-border">
            {childZoneName}
          </span>
        </div>
      </div>

      {/* Customer Zone & ISP Snippet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Customer Child Zone File (BIND)</span>
            <button
              onClick={() => handleCopy("child", childZoneFile)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "child" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "child" ? "Copied!" : "Copy Zone"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all max-h-[340px]">
            {childZoneFile}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">ISP Parent CNAME Delegation Snippet</span>
            <button
              onClick={() => handleCopy("parent", parentCnameSnippet)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "parent" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "parent" ? "Copied!" : "Copy Snippet"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all max-h-[340px]">
            {parentCnameSnippet}
          </pre>
        </div>
      </div>

      {/* Dig Test Command */}
      <div className="p-3 bg-card border border-border rounded-xl space-y-1 font-mono text-xs">
        <div className="flex justify-between items-center font-sans">
          <span className="font-bold text-muted-foreground">Terminal Query Test:</span>
          <button
            onClick={() => handleCopy("dig", digTest)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {copiedKey === "dig" ? "Copied!" : "Copy Command"}
          </button>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 select-all">{digTest}</p>
      </div>
    </div>
  );
}
