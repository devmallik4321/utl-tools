"use client";

import { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Plus, Trash2, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

const DEFAULT_SLICES = [
  "Pizza",
  "Burgers",
  "Sushi",
  "Tacos",
  "Salad",
  "Pasta",
  "Curry",
  "BBQ",
];

const COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#6366F1", // Indigo
];

export function SpinWheel() {
  const [items, setItems] = useState<string[]>(DEFAULT_SLICES);
  const [newItem, setNewItem] = useState<string>("");
  const [spinning, setSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [eliminateWinner, setEliminateWinner] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Draw wheel on canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 15;
    const numSlices = items.length;
    const sliceAngle = (2 * Math.PI) / (numSlices || 1);

    ctx.clearRect(0, 0, size, size);

    if (numSlices === 0) {
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#e2e8f0";
      ctx.fill();
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Add items to spin", center, center);
      return;
    }

    // Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 4;

      const text = items[i];
      const maxTextLen = 14;
      const displayText = text.length > maxTextLen ? text.slice(0, maxTextLen) + "..." : text;
      ctx.fillText(displayText, radius - 20, 5);
      ctx.restore();
    }

    // Center Hub Pin
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
  };

  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [items]);

  const spin = () => {
    if (spinning || items.length < 2) return;
    setSpinning(true);
    setWinner(null);

    const fullRotations = (5 + Math.random() * 5) * 2 * Math.PI;
    const targetAngle = currentAngleRef.current + fullRotations;
    const duration = 4000;
    const startTime = performance.now();
    const initialAngle = currentAngleRef.current;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = initialAngle + (targetAngle - initialAngle) * easeOut;
      currentAngleRef.current = current;

      drawWheel(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        // Calculate winner slice at 0 radians (right side pointer)
        const normalizedAngle = (current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const sliceAngle = (2 * Math.PI) / items.length;
        // Pointer is on the right (0 rad)
        const index = Math.floor(((2 * Math.PI - normalizedAngle) % (2 * Math.PI)) / sliceAngle);
        const winningItem = items[index];
        setWinner(winningItem);

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        if (eliminateWinner) {
          setTimeout(() => {
            setItems((prev) => prev.filter((_, i) => i !== index));
          }, 2000);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const addItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.trim()) return;
    setItems([...items, newItem.trim()]);
    setNewItem("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const resetItems = () => {
    setItems(DEFAULT_SLICES);
    setWinner(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Wheel Canvas Section */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl">
          <div className="relative">
            {/* Pointer Indicator */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-0 h-0 border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent border-r-[26px] border-r-slate-900 dark:border-r-slate-100 drop-shadow-md" />

            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="max-w-full rounded-full shadow-inner cursor-pointer"
              onClick={spin}
            />
          </div>

          <button
            type="button"
            onClick={spin}
            disabled={spinning || items.length < 2}
            className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-base transition-all shadow-md flex items-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{spinning ? "Spinning..." : "Spin the Wheel"}</span>
          </button>

          {winner && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl text-center animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <Trophy className="w-4 h-4" /> Winner Selected!
              </div>
              <p className="text-xl font-black text-foreground mt-1">{winner}</p>
            </div>
          )}
        </div>

        {/* Slice Items Management */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Wheel Slices ({items.length})</h4>
              <button
                type="button"
                onClick={resetItems}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Add Item Form */}
            <form onSubmit={addItem} className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter choice (e.g. Tacos)"
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>

            {/* Eliminate toggle */}
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={eliminateWinner}
                onChange={(e) => setEliminateWinner(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Remove winner slice after spin</span>
            </label>

            {/* Items List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-border/40 pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium text-foreground">{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-muted-foreground hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
