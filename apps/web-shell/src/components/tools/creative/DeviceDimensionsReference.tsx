"use client";

import { useState, useMemo } from "react";
import { Smartphone, Monitor, Tablet, Laptop, Search, Copy, Check, Sparkles, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface Device {
  name: string;
  category: "mobile" | "tablet" | "laptop" | "desktop";
  physical: string;
  viewport: string;
  width: number;
  height: number;
  dpr: string;
  aspect: string;
}

const DEVICES: Device[] = [
  { name: "iPhone 15 / 15 Pro", category: "mobile", physical: "2556 × 1179", viewport: "393 × 852", width: 393, height: 852, dpr: "3.0x", aspect: "19.5:9" },
  { name: "iPhone 15 Pro Max / Plus", category: "mobile", physical: "2796 × 1290", viewport: "430 × 932", width: 430, height: 932, dpr: "3.0x", aspect: "19.5:9" },
  { name: "Samsung Galaxy S24 Ultra", category: "mobile", physical: "3120 × 1440", viewport: "412 × 915", width: 412, height: 915, dpr: "3.5x", aspect: "19.5:9" },
  { name: "Google Pixel 8 Pro", category: "mobile", physical: "2992 × 1344", viewport: "412 × 923", width: 412, height: 923, dpr: "3.25x", aspect: "20:9" },
  { name: "iPad Pro 11-inch", category: "tablet", physical: "2388 × 1668", viewport: "834 × 1194", width: 834, height: 1194, dpr: "2.0x", aspect: "1.43:1" },
  { name: "iPad Pro 12.9-inch", category: "tablet", physical: "2732 × 2048", viewport: "1024 × 1366", width: 1024, height: 1366, dpr: "2.0x", aspect: "4:3" },
  { name: "MacBook Air 13-inch M2/M3", category: "laptop", physical: "2560 × 1664", viewport: "1470 × 956", width: 1470, height: 956, dpr: "2.0x", aspect: "16:10" },
  { name: "MacBook Pro 16-inch", category: "laptop", physical: "3456 × 2234", viewport: "1728 × 1117", width: 1728, height: 1117, dpr: "2.0x", aspect: "16:10" },
  { name: "1080p FHD Monitor", category: "desktop", physical: "1920 × 1080", viewport: "1920 × 1080", width: 1920, height: 1080, dpr: "1.0x", aspect: "16:9" },
  { name: "1440p QHD Monitor", category: "desktop", physical: "2560 × 1440", viewport: "2560 × 1440", width: 2560, height: 1440, dpr: "1.0x", aspect: "16:9" },
  { name: "4K UHD Monitor", category: "desktop", physical: "3840 × 2160", viewport: "1920 × 1080 (scaled)", width: 3840, height: 2160, dpr: "2.0x", aspect: "16:9" },
];

export function DeviceDimensionsReference() {
  const [search, setSearch] = useState<string>("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [copiedDev, setCopiedDev] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return DEVICES.filter((d) => {
      const matchCat = catFilter === "all" || d.category === catFilter;
      const q = search.toLowerCase().trim();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.viewport.includes(q) || d.aspect.includes(q);
      return matchCat && matchSearch;
    });
  }, [search, catFilter]);

  const handleCopy = async (d: Device) => {
    const text = `@media (max-width: ${d.width}px) /* ${d.name} Viewport */`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedDev(d.name);
      setTimeout(() => setCopiedDev(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search device (e.g. iPhone 15, iPad, MacBook, 1080p)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground"
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
        >
          <option value="all">All Devices</option>
          <option value="mobile">Smartphones</option>
          <option value="tablet">Tablets</option>
          <option value="laptop">Laptops</option>
          <option value="desktop">Monitors &amp; Desktops</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((d) => (
          <div key={d.name} className="p-4 bg-card border border-border rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {d.category === "mobile" && <Smartphone className="w-4 h-4 text-blue-500" />}
                {d.category === "tablet" && <Tablet className="w-4 h-4 text-purple-500" />}
                {d.category === "laptop" && <Laptop className="w-4 h-4 text-emerald-500" />}
                {d.category === "desktop" && <Monitor className="w-4 h-4 text-amber-500" />}
                <h4 className="font-bold text-sm text-foreground">{d.name}</h4>
              </div>
              <button
                onClick={() => handleCopy(d)}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                title="Copy CSS Media Query"
              >
                {copiedDev === d.name ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDev === d.name ? "Copied!" : "Media Query"}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
              <div className="p-2 bg-muted/40 rounded-lg">
                <span className="text-[10px] text-muted-foreground uppercase block font-sans">CSS Viewport</span>
                <span className="font-bold text-foreground">{d.viewport}</span>
              </div>
              <div className="p-2 bg-muted/40 rounded-lg">
                <span className="text-[10px] text-muted-foreground uppercase block font-sans">Physical Pixels</span>
                <span className="font-bold text-foreground">{d.physical}</span>
              </div>
              <div className="p-2 bg-muted/40 rounded-lg">
                <span className="text-[10px] text-muted-foreground uppercase block font-sans">DPR / Ratio</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.dpr} ({d.aspect})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
