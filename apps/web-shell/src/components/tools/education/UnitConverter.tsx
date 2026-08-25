"use client";

import { useState } from "react";
import { ArrowLeftRight, Copy, Check, Scale, Ruler, Thermometer, Gauge, Box } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type UnitCategory = "length" | "weight" | "temperature" | "speed" | "area" | "volume";

const UNITS: Record<UnitCategory, { name: string; icon: any; units: Record<string, number | ((val: number, toBase: boolean) => number)> }> = {
  length: {
    name: "Length & Distance",
    icon: Ruler,
    units: {
      "Meters (m)": 1,
      "Kilometers (km)": 1000,
      "Centimeters (cm)": 0.01,
      "Millimeters (mm)": 0.001,
      "Miles (mi)": 1609.344,
      "Yards (yd)": 0.9144,
      "Feet (ft)": 0.3048,
      "Inches (in)": 0.0254,
    },
  },
  weight: {
    name: "Weight & Mass",
    icon: Scale,
    units: {
      "Kilograms (kg)": 1,
      "Grams (g)": 0.001,
      "Milligrams (mg)": 0.000001,
      "Metric Tons (t)": 1000,
      "Pounds (lbs)": 0.45359237,
      "Ounces (oz)": 0.028349523125,
      "Stone (st)": 6.35029318,
    },
  },
  temperature: {
    name: "Temperature",
    icon: Thermometer,
    units: {
      "Celsius (°C)": 1,
      "Fahrenheit (°F)": 1,
      "Kelvin (K)": 1,
    },
  },
  speed: {
    name: "Speed & Velocity",
    icon: Gauge,
    units: {
      "Kilometers / Hour (km/h)": 1,
      "Miles / Hour (mph)": 1.609344,
      "Meters / Second (m/s)": 3.6,
      "Knots (kn)": 1.852,
    },
  },
  area: {
    name: "Area",
    icon: Box,
    units: {
      "Square Meters (m²)": 1,
      "Square Kilometers (km²)": 1000000,
      "Square Feet (ft²)": 0.092903,
      "Acres (ac)": 4046.86,
      "Hectares (ha)": 10000,
      "Square Miles (mi²)": 2589988.11,
    },
  },
  volume: {
    name: "Volume & Liquid",
    icon: Scale,
    units: {
      "Liters (L)": 1,
      "Milliliters (mL)": 0.001,
      "Cubic Meters (m³)": 1000,
      "US Gallons (gal)": 3.78541,
      "US Fluid Ounces (fl oz)": 0.0295735,
      "US Cups": 0.236588,
    },
  },
};

export function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [fromUnit, setFromUnit] = useState<string>("Meters (m)");
  const [toUnit, setToUnit] = useState<string>("Feet (ft)");
  const [inputValue, setInputValue] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);

  const calculateConversion = (): number => {
    if (isNaN(inputValue)) return 0;

    if (category === "temperature") {
      let celsius = inputValue;
      if (fromUnit === "Fahrenheit (°F)") celsius = ((inputValue - 32) * 5) / 9;
      else if (fromUnit === "Kelvin (K)") celsius = inputValue - 273.15;

      if (toUnit === "Celsius (°C)") return Math.round(celsius * 10000) / 10000;
      if (toUnit === "Fahrenheit (°F)") return Math.round(((celsius * 9) / 5 + 32) * 10000) / 10000;
      if (toUnit === "Kelvin (K)") return Math.round((celsius + 273.15) * 10000) / 10000;
      return celsius;
    }

    const currentUnits = UNITS[category].units as Record<string, number>;
    const fromFactor = currentUnits[fromUnit] || 1;
    const toFactor = currentUnits[toUnit] || 1;

    const baseValue = inputValue * fromFactor;
    const converted = baseValue / toFactor;
    return Math.round(converted * 100000) / 100000;
  };

  const result = calculateConversion();

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(`${inputValue} ${fromUnit} = ${result} ${toUnit}`);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const unitList = Object.keys(UNITS[category].units);

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-card border border-border rounded-xl">
        {(Object.keys(UNITS) as UnitCategory[]).map((cat) => {
          const Icon = UNITS[cat].icon;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                const keys = Object.keys(UNITS[cat].units);
                setFromUnit(keys[0]);
                setToUnit(keys[1] || keys[0]);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                category === cat
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{UNITS[cat].name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Conversion Controls */}
      <div className="p-6 bg-card border border-border rounded-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* From Unit */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              From ({fromUnit})
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 text-lg font-mono font-bold bg-background border border-border rounded-xl focus:outline-none"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-background border border-border rounded-lg focus:outline-none"
            >
              {unitList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-2">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 bg-muted hover:bg-muted/80 border border-border rounded-xl text-foreground transition-colors shadow-xs"
              title="Swap Units"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* To Unit Result */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              To ({toUnit})
            </label>
            <div className="w-full px-4 py-3 text-lg font-mono font-black bg-muted/40 border border-border rounded-xl text-blue-600 dark:text-blue-400 select-all overflow-x-auto">
              {result.toLocaleString()}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-background border border-border rounded-lg focus:outline-none"
            >
              {unitList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Copy Result & Quick Reference */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground font-mono">
            1 {fromUnit} = {calculateConversion() / (inputValue || 1)} {toUnit}
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Conversion Copied!" : "Copy Result"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
