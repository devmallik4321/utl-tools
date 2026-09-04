'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, Globe, Copy, Check, Terminal, Info, Code2 } from 'lucide-react';

function toDms(decimal: number, isLat: boolean): { deg: number; min: number; sec: number; dir: string } {
  const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = parseFloat(((minFloat - min) * 60).toFixed(3));
  return { deg, min, sec, dir };
}

export function DnsLocRecordGenerator() {
  const [domain, setDomain] = useState<string>('datacenter1.example.com.');
  const [lat, setLat] = useState<number>(37.7749); // San Francisco
  const [lon, setLon] = useState<number>(-122.4194);
  const [altitude, setAltitude] = useState<number>(15); // meters
  const [sizeMeters, setSizeMeters] = useState<number>(50); // size / diameter of site
  const [horizPrecision, setHorizPrecision] = useState<number>(10);
  const [vertPrecision, setVertPrecision] = useState<number>(5);
  const [ttl, setTtl] = useState<number>(3600);
  const [copied, setCopied] = useState<boolean>(false);

  const locString = useMemo(() => {
    const latDms = toDms(lat, true);
    const lonDms = toDms(lon, false);

    const latStr = `${latDms.deg} ${latDms.min} ${latDms.sec} ${latDms.dir}`;
    const lonStr = `${lonDms.deg} ${lonDms.min} ${lonDms.sec} ${lonDms.dir}`;
    const altStr = `${altitude >= 0 ? '' : '-'}${Math.abs(altitude)}m`;

    const d = domain.endsWith('.') ? domain : domain + '.';
    return `${d}    ${ttl}    IN    LOC    ${latStr} ${lonStr} ${altStr} ${sizeMeters}m ${horizPrecision}m ${vertPrecision}m`;
  }, [domain, lat, lon, altitude, sizeMeters, horizPrecision, vertPrecision, ttl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(locString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">DNS LOC Geographic Record Generator</h1>
            <p className="text-sm text-slate-400">
              Generate RFC 1876 compliant DNS Location (LOC) resource records: converts GPS decimal coordinates to degrees-minutes-seconds with altitude and site precision.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Coordinates & Parameters</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Host FQDN</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Latitude (Decimal)</label>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Longitude (Decimal)</label>
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={lon}
                onChange={(e) => setLon(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Altitude (Meters)</label>
              <input
                type="number"
                min="-10000"
                max="50000"
                value={altitude}
                onChange={(e) => setAltitude(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Site Diameter / Size (m)</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={sizeMeters}
                onChange={(e) => setSizeMeters(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Horizontal Precision (m)</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={horizPrecision}
                onChange={(e) => setHorizPrecision(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Vertical Precision (m)</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={vertPrecision}
                onChange={(e) => setVertPrecision(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-sky-400" />
                <h2 className="text-sm font-semibold text-slate-200">BIND9 RFC 1876 Zone Entry</h2>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Record'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {locString}
            </pre>
          </div>

          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-slate-400 space-y-2">
            <span className="font-semibold text-slate-300 block">RFC 1876 Specification:</span>
            <p>
              The DNS <code>LOC</code> record stores geographical coordinates for a host or network. It is widely queried by network diagnostic utilities (like <code>traceroute</code>) and NTP time servers to map internet topological topology to real-world geography.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DnsLocRecordGenerator;
