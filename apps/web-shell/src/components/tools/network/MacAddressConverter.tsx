"use client";

import { useState, useMemo } from "react";
import { Cpu, Copy, Check, Sparkles, Network, Hash } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function MacAddressConverter() {
  const [macInput, setMacInput] = useState<string>("00:1A:2B:3C:4D:5E");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const parsed = useMemo(() => {
    // Strip everything except hex characters
    const cleanHex = macInput.replace(/[^0-9a-fA-F]/g, "").toUpperCase();

    if (cleanHex.length !== 12) {
      return { isValid: false, colon: "", hyphen: "", cisco: "", raw: "", oui: "", nic: "", isMulticast: false, isLocal: false };
    }

    const colon = cleanHex.match(/.{1,2}/g)?.join(":") || "";
    const hyphen = cleanHex.match(/.{1,2}/g)?.join("-") || "";
    const cisco = cleanHex.toLowerCase().match(/.{1,4}/g)?.join(".") || "";
    const oui = colon.slice(0, 8);
    const nic = colon.slice(9);

    // First byte bit 0 = Multicast bit, bit 1 = Locally Administered bit
    const firstByte = parseInt(cleanHex.slice(0, 2), 16);
    const isMulticast = (firstByte & 1) === 1;
    const isLocal = (firstByte & 2) === 2;

    return {
      isValid: true,
      colon,
      hyphen,
      cisco,
      raw: cleanHex,
      oui,
      nic,
      isMulticast,
      isLocal,
    };
  }, [macInput]);

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedFormat(label);
      setTimeout(() => setCopiedFormat(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          MAC Address (Any Delimiter Format)
        </label>
        <input
          type="text"
          value={macInput}
          onChange={(e) => setMacInput(e.target.value)}
          placeholder="00:1a:2b:3c:4d:5e or 001a.2b3c.4d5e"
          className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
        />
        <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1">
          <span>Presets:</span>
          <button onClick={() => setMacInput("00:1A:2B:3C:4D:5E")} className="hover:underline text-blue-600">Standard Colon</button>
          <span>•</span>
          <button onClick={() => setMacInput("c0-ff-ee-11-22-33")} className="hover:underline text-blue-600">Windows Hyphen</button>
          <span>•</span>
          <button onClick={() => setMacInput("001a.2b3c.4d5e")} className="hover:underline text-blue-600">Cisco Dot</button>
          <span>•</span>
          <button onClick={() => setMacInput("01:00:5E:00:00:01")} className="hover:underline text-blue-600">Multicast</button>
        </div>
      </div>

      {/* Formats Grid */}
      {parsed.isValid ? (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-500" />
            Standardized MAC Address Formats
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-card border border-border rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground font-sans uppercase block">Linux / Unix / macOS (Colon)</span>
                <span className="text-sm font-bold text-foreground">{parsed.colon}</span>
              </div>
              <button
                onClick={() => handleCopy(parsed.colon, "colon")}
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                {copiedFormat === "colon" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-card border border-border rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground font-sans uppercase block">Windows (Hyphen)</span>
                <span className="text-sm font-bold text-foreground">{parsed.hyphen}</span>
              </div>
              <button
                onClick={() => handleCopy(parsed.hyphen, "hyphen")}
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                {copiedFormat === "hyphen" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-card border border-border rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground font-sans uppercase block">Cisco IOS (Dot)</span>
                <span className="text-sm font-bold text-foreground">{parsed.cisco}</span>
              </div>
              <button
                onClick={() => handleCopy(parsed.cisco, "cisco")}
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                {copiedFormat === "cisco" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-card border border-border rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground font-sans uppercase block">Raw Hexadecimal</span>
                <span className="text-sm font-bold text-foreground">{parsed.raw}</span>
              </div>
              <button
                onClick={() => handleCopy(parsed.raw, "raw")}
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                {copiedFormat === "raw" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* OUI & Hardware Architecture Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
            <div className="p-3 bg-card rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">OUI Vendor Prefix</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{parsed.oui}</span>
            </div>

            <div className="p-3 bg-card rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">Device NIC Suffix</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{parsed.nic}</span>
            </div>

            <div className="p-3 bg-card rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">Cast Scope</span>
              <span className="font-sans font-bold text-xs text-foreground">
                {parsed.isMulticast ? "Multicast / Broadcast" : "Unicast (Individual Device)"}
              </span>
            </div>

            <div className="p-3 bg-card rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">Administration</span>
              <span className="font-sans font-bold text-xs text-foreground">
                {parsed.isLocal ? "Locally Administered (LAA)" : "Universally Administered (UAA)"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border border-rose-500/20 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-xs text-rose-600 dark:text-rose-400">
          Please enter a valid 12-character hexadecimal MAC address.
        </div>
      )}
    </div>
  );
}
