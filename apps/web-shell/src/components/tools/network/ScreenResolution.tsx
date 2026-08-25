"use client";

import { useState, useEffect } from "react";
import { Monitor, Smartphone, Tablet, Laptop, RefreshCw } from "lucide-react";

export function ScreenResolution() {
  const [dimensions, setDimensions] = useState({
    screenWidth: 0,
    screenHeight: 0,
    availWidth: 0,
    availHeight: 0,
    viewportWidth: 0,
    viewportHeight: 0,
    dpr: 1,
    colorDepth: 24,
    orientation: "landscape-primary",
  });

  const updateDimensions = () => {
    if (typeof window === "undefined") return;
    setDimensions({
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type || "unknown",
    });
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = dimensions.screenWidth && dimensions.screenHeight ? gcd(dimensions.screenWidth, dimensions.screenHeight) : 1;
  const ratioW = Math.round(dimensions.screenWidth / divisor);
  const ratioH = Math.round(dimensions.screenHeight / divisor);

  return (
    <div className="space-y-6">
      {/* Visual Resolution Display */}
      <div className="p-8 bg-card border border-border rounded-xl text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Monitor className="w-4 h-4 text-blue-500" />
          <span>Current Physical Screen Resolution</span>
        </div>

        <p className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-foreground">
          {dimensions.screenWidth} <span className="text-muted-foreground font-light">&times;</span> {dimensions.screenHeight}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full text-xs font-semibold">
            Aspect Ratio: {ratioW}:{ratioH}
          </span>
          <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
            Device Pixel Ratio (DPR): {dimensions.dpr}x
          </span>
          <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
            Color Depth: {dimensions.colorDepth}-bit
          </span>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-5 bg-card border border-border rounded-xl space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            CSS Viewport (Window Size)
          </span>
          <p className="text-2xl font-bold font-mono text-foreground">
            {dimensions.viewportWidth} &times; {dimensions.viewportHeight} px
          </p>
          <span className="text-xs text-muted-foreground block">
            Updates live as you resize this window
          </span>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Usable Screen Area (Excl. Taskbar)
          </span>
          <p className="text-2xl font-bold font-mono text-foreground">
            {dimensions.availWidth} &times; {dimensions.availHeight} px
          </p>
          <span className="text-xs text-muted-foreground block">
            Total desktop workspace excluding system taskbars
          </span>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Screen Orientation
          </span>
          <p className="text-2xl font-bold font-mono text-foreground capitalize">
            {dimensions.orientation.replace("-", " ")}
          </p>
          <span className="text-xs text-muted-foreground block">
            Physical display alignment
          </span>
        </div>
      </div>
    </div>
  );
}
