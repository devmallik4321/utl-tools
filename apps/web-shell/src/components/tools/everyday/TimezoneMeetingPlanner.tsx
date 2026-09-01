"use client";

import { useState } from "react";
import { Globe, Clock, Plus, Trash2, Copy, Check, Sun, Moon } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface CityTimezone {
  id: string;
  name: string;
  tz: string;
  offset: number; // Offset from UTC in hours
}

const DEFAULT_CITIES: CityTimezone[] = [
  { id: "1", name: "San Francisco / Los Angeles (PST/PDT)", tz: "America/Los_Angeles", offset: -7 },
  { id: "2", name: "New York / Eastern (EST/EDT)", tz: "America/New_York", offset: -4 },
  { id: "3", name: "London / UTC (GMT/BST)", tz: "Europe/London", offset: 1 },
  { id: "4", name: "Dubai / Gulf (GST)", tz: "Asia/Dubai", offset: 4 },
  { id: "5", name: "Tokyo / Japan (JST)", tz: "Asia/Tokyo", offset: 9 },
];

export function TimezoneMeetingPlanner() {
  const [cities, setCities] = useState<CityTimezone[]>(DEFAULT_CITIES);
  const [selectedUtcHour, setSelectedUtcHour] = useState<number>(14); // 14:00 UTC default
  const [copied, setCopied] = useState<boolean>(false);

  // Time slot quality: Green = 9am to 6pm, Amber = 7-9am or 6-9pm, Red = 9pm to 7am
  const getSlotColor = (hour: number) => {
    const h = (hour + 24) % 24;
    if (h >= 9 && h <= 17) return "bg-emerald-500 text-white font-bold";
    if ((h >= 7 && h < 9) || (h >= 18 && h <= 21)) return "bg-amber-400 text-amber-950 font-medium";
    return "bg-muted text-muted-foreground opacity-50";
  };

  const getFormattedHour = (hour: number) => {
    const h = (hour + 24) % 24;
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${ampm}`;
  };

  const handleCopy = async () => {
    let summary = `Meeting Schedule (${selectedUtcHour}:00 UTC)\n`;
    cities.forEach((c) => {
      const localH = (selectedUtcHour + c.offset + 24) % 24;
      summary += `• ${c.name}: ${getFormattedHour(localH)}\n`;
    });
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Slider */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            Selected Meeting Time: <span className="font-mono text-blue-600 dark:text-blue-400 text-sm">{selectedUtcHour}:00 UTC</span>
          </label>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Work (9–18)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Morning/Evening</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" /> Night</span>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={23}
          value={selectedUtcHour}
          onChange={(e) => setSelectedUtcHour(parseInt(e.target.value))}
          className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* City Overlap Comparison Grid */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-500" />
            Participating Timezones
          </span>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Schedule"}</span>
          </button>
        </div>

        <div className="space-y-3">
          {cities.map((city) => {
            const currentLocalHour = (selectedUtcHour + city.offset + 24) % 24;
            return (
              <div key={city.id} className="p-3 bg-muted/20 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground block">{city.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">UTC {city.offset >= 0 ? `+${city.offset}` : city.offset}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold font-mono text-foreground block">
                      {getFormattedHour(currentLocalHour)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      currentLocalHour >= 9 && currentLocalHour <= 17
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : currentLocalHour >= 7 && currentLocalHour <= 21
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {currentLocalHour >= 9 && currentLocalHour <= 17 ? "Working Hours" : currentLocalHour >= 7 && currentLocalHour <= 21 ? "Extended Hours" : "Night / Sleep"}
                    </span>
                  </div>
                </div>

                {/* 24-Hour Visual Bar */}
                <div className="grid grid-cols-24 gap-0.5 pt-1">
                  {Array.from({ length: 24 }).map((_, h) => {
                    const localH = (h + city.offset + 24) % 24;
                    const isSelected = h === selectedUtcHour;
                    return (
                      <div
                        key={h}
                        onClick={() => setSelectedUtcHour(h)}
                        title={`UTC ${h}:00 ➔ Local ${getFormattedHour(localH)}`}
                        className={`h-6 rounded text-[9px] flex items-center justify-center cursor-pointer transition-all ${getSlotColor(localH)} ${
                          isSelected ? "ring-2 ring-blue-600 scale-110 z-10 shadow" : "hover:opacity-80"
                        }`}
                      >
                        {localH}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
