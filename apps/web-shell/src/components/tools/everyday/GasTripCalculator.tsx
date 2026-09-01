"use client";

import { useState } from "react";
import { Fuel, DollarSign, Navigation, Copy, Check, Users, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function GasTripCalculator() {
  const [distance, setDistance] = useState<number>(350);
  const [distanceUnit, setDistanceUnit] = useState<"miles" | "km">("miles");
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(28); // 28 MPG
  const [gasPrice, setGasPrice] = useState<number>(3.65); // $3.65 per gallon
  const [passengers, setPassengers] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  // Normalize to Gallons
  // If miles & MPG -> gallons = distance / MPG
  // If km & L/100km -> liters = (distance / 100) * L_100km
  let totalFuelNeeded = 0;
  if (distanceUnit === "miles") {
    totalFuelNeeded = fuelEfficiency > 0 ? distance / fuelEfficiency : 0;
  } else {
    totalFuelNeeded = (distance / 100) * fuelEfficiency;
  }

  const totalFuelCost = totalFuelNeeded * gasPrice;
  const costPerPerson = passengers > 0 ? totalFuelCost / passengers : 0;
  const costPerMileOrKm = distance > 0 ? totalFuelCost / distance : 0;

  const handleCopy = async () => {
    const summary = `Road Trip Gas Cost Calculation\n• Trip Distance: ${distance} ${distanceUnit} (${fuelEfficiency} ${distanceUnit === "miles" ? "MPG" : "L/100km"})\n• Fuel Price: $${gasPrice.toFixed(2)} / ${distanceUnit === "miles" ? "gallon" : "liter"}\n• Fuel Required: ${totalFuelNeeded.toFixed(1)} ${distanceUnit === "miles" ? "Gallons" : "Liters"}\n• Total Trip Fuel Cost: $${totalFuelCost.toFixed(2)}\n• Cost per Person (${passengers} people): $${costPerPerson.toFixed(2)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Distance */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Trip Distance
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={distance}
              onChange={(e) => setDistance(Math.max(1, parseFloat(e.target.value) || 0))}
              className="flex-1 px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
            />
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value as any)}
              className="w-24 px-2 py-2 text-xs font-bold bg-background border border-border rounded-lg"
            >
              <option value="miles">Miles</option>
              <option value="km">Kilometers</option>
            </select>
          </div>
        </div>

        {/* Fuel Economy */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Fuel Economy ({distanceUnit === "miles" ? "MPG" : "L / 100km"})
          </label>
          <input
            type="number"
            min={1}
            step="0.5"
            value={fuelEfficiency}
            onChange={(e) => setFuelEfficiency(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground">{distanceUnit === "miles" ? "Miles per gallon" : "Liters per 100 km"}</span>
        </div>

        {/* Gas Price */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Gas Price ($ / {distanceUnit === "miles" ? "Gal" : "Liter"})
          </label>
          <input
            type="number"
            min={0}
            step="0.05"
            value={gasPrice}
            onChange={(e) => setGasPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg font-bold"
          />
          <span className="text-[10px] text-muted-foreground">Price at fuel pump</span>
        </div>

        {/* Passengers */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Passengers Splitting
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={passengers}
            onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[10px] text-muted-foreground">Number of people in car</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Fuel className="w-4 h-4 text-emerald-500" />
            Road Trip Fuel Cost &amp; Per-Person Share
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Trip Cost"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Fuel Cost</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${totalFuelCost.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">For {distance} {distanceUnit} trip</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Cost Per Person</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${costPerPerson.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Split among {passengers} people</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Fuel Volume Needed</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {totalFuelNeeded.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">{distanceUnit === "miles" ? "Gallons" : "Liters"}</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Total pump consumption</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Cost per {distanceUnit === "miles" ? "Mile" : "Km"}</span>
            <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              ${costPerMileOrKm.toFixed(3)}
            </p>
            <span className="text-[10px] text-muted-foreground">Direct fuel expense per unit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
