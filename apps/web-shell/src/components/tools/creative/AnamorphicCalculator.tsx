"use client";

import { useState, useMemo } from "react";
import { Film, Video, Copy, Check, Sparkles, Sliders, Maximize2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SENSOR_MODES = [
  { name: "4:3 Open Gate (1.33:1)", ratio: 4 / 3, desc: "Classic Alexa / GH6 Anamorphic" },
  { name: "3:2 Full Frame (1.50:1)", ratio: 3 / 2, desc: "Sony FX3 / Panasonic S1H Open Gate" },
  { name: "16:9 Standard Video (1.78:1)", ratio: 16 / 9, desc: "Standard 4K 16:9 Sensor" },
  { name: "17:9 DCI Cinema (1.89:1)", ratio: 17 / 9, desc: "RED / Blackmagic DCI Sensor" },
];

const SQUEEZE_FACTORS = [
  { name: "1.33x (Adapter / Sirui)", squeeze: 1.33 },
  { name: "1.5x (Great Joy / Blazar)", squeeze: 1.5 },
  { name: "1.6x (Atlas Mercury / Sirui FF)", squeeze: 1.6 },
  { name: "1.8x (Cooke Anamorphic)", squeeze: 1.8 },
  { name: "2.0x (Classic Panavision / Hawk)", squeeze: 2.0 },
];

export function AnamorphicCalculator() {
  const [sensorIdx, setSensorIdx] = useState<number>(0);
  const [squeezeIdx, setSqueezeIdx] = useState<number>(4); // 2.0x
  const [pixelHeight, setPixelHeight] = useState<number>(2160); // 4K vertical
  const [copied, setCopied] = useState<boolean>(false);

  const { desqueezedRatio, desqueezedWidth, targetCinemascopeWidth, cropLossPct } = useMemo(() => {
    const sensor = SENSOR_MODES[sensorIdx];
    const sq = SQUEEZE_FACTORS[squeezeIdx];

    const desqRatio = sensor.ratio * sq.squeeze;
    const desqWidth = Math.round(pixelHeight * desqRatio);
    const scopeWidth = Math.round(pixelHeight * 2.39);

    let cropLoss = 0;
    if (desqRatio > 2.39) {
      cropLoss = ((desqWidth - scopeWidth) / desqWidth) * 100;
    } else if (desqRatio < 2.39) {
      cropLoss = ((scopeWidth - desqWidth) / scopeWidth) * 100;
    }

    return {
      desqueezedRatio: desqRatio.toFixed(2),
      desqueezedWidth: desqWidth,
      targetCinemascopeWidth: scopeWidth,
      cropLossPct: cropLoss.toFixed(1),
    };
  }, [sensorIdx, squeezeIdx, pixelHeight]);

  const handleCopy = async () => {
    const summary = `Cinema Anamorphic Lens Desqueeze Analysis:\n• Sensor Aspect: ${SENSOR_MODES[sensorIdx].name}\n• Lens Squeeze Factor: ${SQUEEZE_FACTORS[squeezeIdx].name}\n• Final Desqueezed Aspect Ratio: ${desqueezedRatio}:1\n• Timeline Canvas Resolution: ${desqueezedWidth} × ${pixelHeight} px\n• Standard 2.39:1 Cinemascope Delivery Canvas: ${targetCinemascopeWidth} × ${pixelHeight} px (Crop: ${cropLossPct}%)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sensor Presets */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Camera Sensor Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SENSOR_MODES.map((s, idx) => (
            <button
              key={s.name}
              onClick={() => setSensorIdx(idx)}
              className={`p-2 text-left rounded-lg border transition-colors ${
                sensorIdx === idx
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-muted/40 border-border text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-xs font-bold block">{s.name}</span>
              <span className="text-[10px] opacity-75">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Squeeze Factor Selector */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Anamorphic Lens Squeeze Factor
        </label>
        <div className="flex flex-wrap gap-2">
          {SQUEEZE_FACTORS.map((sq, idx) => (
            <button
              key={sq.name}
              onClick={() => setSqueezeIdx(idx)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                squeezeIdx === idx
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              {sq.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Film className="w-4 h-4 text-emerald-500" />
            Desqueezed Anamorphic Projection
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Geometry"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Desqueezed Ratio
            </span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{desqueezedRatio}:1</p>
            <span className="text-[10px] text-muted-foreground font-sans">Full uncropped frame</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Timeline Canvas</span>
            <p className="text-xl font-bold text-foreground">
              {desqueezedWidth} × {pixelHeight}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Square pixel NLE canvas</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              2.39:1 Cinemascope
            </span>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {targetCinemascopeWidth} × {pixelHeight}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">DCI / theatrical delivery</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">2.39 Crop Delta</span>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{cropLossPct}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Side crop or pillarbox needed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
