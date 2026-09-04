"use client";

import { useState, useMemo } from "react";
import { Globe2, MapPin, Copy, Check, Compass, ShieldCheck, Info } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const CITY_PRESETS = [
  { name: "San Francisco", lat: 37.7749, lon: -122.4194, alt: 16 },
  { name: "New York", lat: 40.7128, lon: -74.006, alt: 10 },
  { name: "London", lat: 51.5074, lon: -0.1278, alt: 25 },
  { name: "Frankfurt", lat: 50.1109, lon: 8.6821, alt: 112 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, alt: 40 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, alt: 15 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, alt: 20 },
];

function decToDms(val: number, isLat: boolean): { deg: number; min: number; sec: string; dir: string } {
  const abs = Math.abs(val);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(3);
  const dir = isLat ? (val >= 0 ? "N" : "S") : val >= 0 ? "E" : "W";
  return { deg, min, sec, dir };
}

export function LocRecordGenerator() {
  const [domain, setDomain] = useState<string>("example.com");
  const [ttl, setTtl] = useState<number>(3600);
  const [lat, setLat] = useState<number>(37.7749);
  const [lon, setLon] = useState<number>(-122.4194);
  const [altitude, setAltitude] = useState<number>(16);
  const [size, setSize] = useState<number>(10);
  const [hPrecision, setHPrecision] = useState<number>(10);
  const [vPrecision, setVPrecision] = useState<number>(2);

  const [copiedBind, setCopiedBind] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);

  const { dmsLat, dmsLon, locRecordString, bindRecord } = useMemo(() => {
    const latDms = decToDms(lat, true);
    const lonDms = decToDms(lon, false);

    const formattedLat = `${latDms.deg} ${latDms.min} ${latDms.sec} ${latDms.dir}`;
    const formattedLon = `${lonDms.deg} ${lonDms.min} ${lonDms.sec} ${lonDms.dir}`;
    const locRdata = `${formattedLat} ${formattedLon} ${altitude}m ${size}m ${hPrecision}m ${vPrecision}m`;

    const bind = `${domain.endsWith(".") ? domain : domain + "."} ${ttl} IN LOC ${locRdata}`;

    return {
      dmsLat: formattedLat,
      dmsLon: formattedLon,
      locRecordString: locRdata,
      bindRecord: bind,
    };
  }, [domain, ttl, lat, lon, altitude, size, hPrecision, vPrecision]);

  const handleCopyBind = async () => {
    const ok = await copyToClipboard(bindRecord);
    if (ok) {
      setCopiedBind(true);
      setTimeout(() => setCopiedBind(false), 2000);
    }
  };

  const handleCopyRaw = async () => {
    const ok = await copyToClipboard(locRecordString);
    if (ok) {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Cities */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          Location Presets:
        </span>
        {CITY_PRESETS.map((c) => (
          <button
            key={c.name}
            onClick={() => {
              setLat(c.lat);
              setLon(c.lon);
              setAltitude(c.alt);
            }}
            className="px-2.5 py-1 text-xs rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Input Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Domain Name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            placeholder="example.com"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            TTL (Seconds)
          </label>
          <input
            type="number"
            step={300}
            value={ttl}
            onChange={(e) => setTtl(Math.max(60, parseInt(e.target.value) || 60))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Latitude (Decimal)
          </label>
          <input
            type="number"
            step={0.0001}
            value={lat}
            onChange={(e) => setLat(Math.max(-90, Math.min(90, parseFloat(e.target.value) || 0)))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[11px] text-muted-foreground block font-mono">
            DMS: {dmsLat}
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Longitude (Decimal)
          </label>
          <input
            type="number"
            step={0.0001}
            value={lon}
            onChange={(e) => setLon(Math.max(-180, Math.min(180, parseFloat(e.target.value) || 0)))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-indigo-600 dark:text-indigo-400"
          />
          <span className="text-[11px] text-muted-foreground block font-mono">
            DMS: {dmsLon}
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Altitude (Meters)
          </label>
          <input
            type="number"
            step={1}
            value={altitude}
            onChange={(e) => setAltitude(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Object Size (Meters)
          </label>
          <input
            type="number"
            min={1}
            value={size}
            onChange={(e) => setSize(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Horizontal Accuracy (m)
          </label>
          <input
            type="number"
            min={1}
            value={hPrecision}
            onChange={(e) => setHPrecision(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Vertical Accuracy (m)
          </label>
          <input
            type="number"
            min={1}
            value={vPrecision}
            onChange={(e) => setVPrecision(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Formatted Records Output */}
      <div className="space-y-4">
        {/* BIND Master Format */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-primary" />
              BIND 9 &amp; Master Zone File Format
            </span>
            <button
              onClick={handleCopyBind}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors"
            >
              {copiedBind ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBind ? "Copied BIND" : "Copy BIND Record"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto">
            {bindRecord}
          </pre>
        </div>

        {/* Raw LOC RDATA */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Cloudflare / Route 53 Raw RDATA String
            </span>
            <button
              onClick={handleCopyRaw}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRaw ? "Copied RDATA" : "Copy RDATA"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs sm:text-sm font-mono text-foreground overflow-x-auto">
            {locRecordString}
          </pre>
        </div>
      </div>

      {/* RFC 1876 Architecture Note */}
      <div className="p-4 bg-muted/40 border border-border rounded-xl flex items-start gap-3">
        <Compass className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground space-y-1">
          <span className="font-semibold text-foreground block">RFC 1876 DNS LOC Specification</span>
          <p>
            RFC 1876 defines an experimental mechanism to publish geographical location information (latitude, longitude, altitude, and precision diameters) directly into DNS. It is used for network telemetry, NTP server localization, Ham radio packet routing, and server geographical mapping.
          </p>
        </div>
      </div>
    </div>
  );
}
