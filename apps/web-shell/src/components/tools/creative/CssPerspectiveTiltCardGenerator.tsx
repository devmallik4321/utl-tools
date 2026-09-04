'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Layers, Sliders, Copy, Check, Eye, Sparkles, Code2 } from 'lucide-react';

export function CssPerspectiveTiltCardGenerator() {
  const [perspective, setPerspective] = useState<number>(1000);
  const [maxRotation, setMaxRotation] = useState<number>(20);
  const [scale, setScale] = useState<number>(1.05);
  const [glareOpacity, setGlareOpacity] = useState<number>(0.3);
  const [depthZ, setDepthZ] = useState<number>(40);

  // Interactive mouse state
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = -((y - centerY) / centerY) * maxRotation;
    const rY = ((x - centerX) / centerX) * maxRotation;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const cssSnippet = useMemo(() => {
    return `.perspective-container {
  perspective: ${perspective}px;
}

.tilt-card {
  transform-style: preserve-3d;
  transition: transform 0.15s ease-out;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(${scale});
}

.tilt-card-content {
  transform: translateZ(${depthZ}px);
}`;
  }, [perspective, scale, depthZ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">CSS 3D Perspective Card Tilt Generator</h1>
            <p className="text-sm text-slate-400">
              Interactive 3D card tilt and holographic parallax generator with CSS perspective, matrix transforms, specular glare, and Tailwind export.
            </p>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">3D Transform Parameters</h2>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">CSS Perspective Depth</span>
              <span className="font-mono text-violet-400">{perspective}px</span>
            </div>
            <input
              type="range"
              min="400"
              max="2000"
              step="50"
              value={perspective}
              onChange={(e) => setPerspective(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Max Rotation Angle</span>
              <span className="font-mono text-violet-400">&plusmn;{maxRotation}&deg;</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              value={maxRotation}
              onChange={(e) => setMaxRotation(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Hover Zoom Scale</span>
              <span className="font-mono text-violet-400">{scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="1.20"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Inner Layer Parallax (translateZ)</span>
              <span className="font-mono text-violet-400">{depthZ}px</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={depthZ}
              onChange={(e) => setDepthZ(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Specular Glare Reflection</span>
              <span className="font-mono text-violet-400">{Math.round(glareOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={glareOpacity}
              onChange={(e) => setGlareOpacity(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>
        </div>

        {/* Live Interactive Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between text-white space-y-6">
          <div className="flex flex-col items-center justify-center p-6 min-h-[320px]">
            <div
              style={{ perspective: `${perspective}px` }}
              className="w-full max-w-sm flex justify-center cursor-pointer select-none"
            >
              <div
                ref={cardRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isHovered
                    ? `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`
                    : 'rotateX(0deg) rotateY(0deg) scale(1)',
                  transition: isHovered ? 'transform 0.05s ease-out' : 'transform 0.5s ease-out'
                }}
                className="relative w-72 h-96 rounded-2xl p-6 bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-900 border border-violet-400/30 shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Glare overlay */}
                {glareOpacity > 0 && isHovered && (
                  <div
                    style={{
                      background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glareOpacity}) 0%, rgba(255,255,255,0) 70%)`
                    }}
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                  />
                )}

                {/* Parallax inner content */}
                <div
                  style={{
                    transform: `translateZ(${depthZ}px)`,
                    transformStyle: 'preserve-3d'
                  }}
                  className="space-y-2 pointer-events-none"
                >
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-semibold text-white inline-block">
                    PRO MEMBER
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">Enterprise Pass</h3>
                  <p className="text-xs text-violet-200">Interact and hover over this card to preview true 3D spatial depth.</p>
                </div>

                <div
                  style={{
                    transform: `translateZ(${depthZ * 0.75}px)`
                  }}
                  className="flex justify-between items-end text-xs text-violet-200 font-mono pointer-events-none"
                >
                  <span>rx: {rotateX.toFixed(1)}&deg;</span>
                  <span>ry: {rotateY.toFixed(1)}&deg;</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Code */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">CSS 3D Transforms Snippet</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy CSS'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre max-h-36">
              {cssSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CssPerspectiveTiltCardGenerator;
