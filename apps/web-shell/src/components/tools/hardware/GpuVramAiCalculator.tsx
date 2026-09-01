"use client";

import { useState } from "react";
import { HardDrive, Cpu, Zap, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface QuantizationOption {
  id: string;
  name: string;
  bytesPerParam: number;
  description: string;
}

const QUANTIZATIONS: QuantizationOption[] = [
  { id: "fp16", name: "16-bit (FP16/BF16)", bytesPerParam: 2.0, description: "Unquantized full precision. Highest fidelity." },
  { id: "q8", name: "8-bit (Q8_0)", bytesPerParam: 1.1, description: "Near-lossless quality with ~50% VRAM reduction." },
  { id: "q5", name: "5-bit (Q5_K_M)", bytesPerParam: 0.75, description: "Sweet spot between speed, quality, and memory." },
  { id: "q4", name: "4-bit (Q4_K_M)", bytesPerParam: 0.60, description: "Default Ollama & llama.cpp standard balance." },
  { id: "q3", name: "3-bit (Q3_K_M)", bytesPerParam: 0.48, description: "Aggressive quantization. Noticeable quality loss." },
  { id: "q2", name: "2-bit (Q2_K)", bytesPerParam: 0.38, description: "Extreme compression for constrained VRAM." },
];

export function GpuVramAiCalculator() {
  const [paramSize, setParamSize] = useState<number>(8); // In Billions (e.g. 8B)
  const [quantId, setQuantId] = useState<string>("q4");
  const [contextLength, setContextLength] = useState<number>(8192); // tokens
  const [batchSize, setBatchSize] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedQuant = QUANTIZATIONS.find((q) => q.id === quantId) || QUANTIZATIONS[3];

  // 1. Model Weights VRAM: Parameters (B) * bytesPerParam (GB)
  const weightsVram = paramSize * selectedQuant.bytesPerParam;

  // 2. KV Cache VRAM: 2 * layers * hidden_dim * context * bytes (approx 0.0000005 GB per token for 8B, scaling with param size)
  const kvCacheVram = (contextLength * 2 * (paramSize >= 70 ? 0.000002 : paramSize >= 30 ? 0.000001 : 0.0000005) * batchSize);

  // 3. CUDA & Context Overhead (approx 1.2 GB)
  const cudaOverhead = 1.2;

  // Total Estimated VRAM in GB
  const totalVram = weightsVram + kvCacheVram + cudaOverhead;

  // GPU Tier Matcher
  const getRecommendedGpus = (vram: number) => {
    if (vram <= 8) {
      return [
        { name: "RTX 3060 12GB / RTX 4060 8GB", type: "Consumer GPU", tier: "Budget" },
        { name: "Apple Mac M2/M3 (16GB Unified)", type: "Apple Silicon", tier: "Laptop" },
      ];
    } else if (vram <= 12) {
      return [
        { name: "NVIDIA RTX 3060 12GB / RTX 4070 12GB", type: "Consumer GPU", tier: "Recommended" },
        { name: "Apple Mac M2/M3 (18GB/24GB Unified)", type: "Apple Silicon", tier: "Mac Mini / Studio" },
      ];
    } else if (vram <= 16) {
      return [
        { name: "NVIDIA RTX 4080 16GB / RTX 4070 Ti Super 16GB", type: "High-End Consumer", tier: "Power User" },
        { name: "AMD Radeon RX 7800 XT 16GB", type: "Consumer GPU", tier: "Budget 16GB" },
      ];
    } else if (vram <= 24) {
      return [
        { name: "NVIDIA RTX 3090 24GB (Used) / RTX 4090 24GB", type: "Enthusiast GPU", tier: "Gold Standard" },
        { name: "Apple Mac Studio M2 Max (32GB Unified)", type: "Apple Silicon", tier: "Workstation" },
      ];
    } else if (vram <= 48) {
      return [
        { name: "2x NVIDIA RTX 3090 / 4090 (48GB NVLink/Split)", type: "Dual GPU Rig", tier: "Prosumer" },
        { name: "Apple Mac Studio M2 Ultra (64GB/128GB Unified)", type: "Apple Silicon", tier: "Workstation" },
        { name: "NVIDIA RTX A6000 48GB", type: "Professional", tier: "Workstation" },
      ];
    } else {
      return [
        { name: "Apple Mac Studio M2/M3 Ultra (128GB/192GB Unified)", type: "Apple Silicon", tier: "Heavy Local LLM" },
        { name: "NVIDIA A100 80GB / H100 80GB Cloud GPU (RunPod/Lambda)", type: "Cloud GPU", tier: "Enterprise" },
      ];
    }
  };

  const gpus = getRecommendedGpus(totalVram);

  const handleCopy = async () => {
    const summary = `Local LLM VRAM Calculator\n• Model Size: ${paramSize}B Parameters (${selectedQuant.name})\n• Context Length: ${contextLength.toLocaleString()} tokens\n• Model Weights: ${weightsVram.toFixed(1)} GB\n• KV Cache & Overhead: ${(kvCacheVram + cudaOverhead).toFixed(1)} GB\n• Total Required VRAM: ${totalVram.toFixed(1)} GB\n• Recommended Hardware: ${gpus.map((g) => g.name).join(", ")}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameter Presets & Inputs */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          1. Select Model Size (Parameters in Billions)
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "3B (Llama 3.2)", val: 3 },
            { label: "7B/8B (Llama 3 / Mistral)", val: 8 },
            { label: "13B/14B (Qwen 2.5)", val: 14 },
            { label: "32B (Qwen 2.5 32B)", val: 32 },
            { label: "70B (Llama 3 70B)", val: 70 },
          ].map((preset) => (
            <button
              key={preset.val}
              onClick={() => setParamSize(preset.val)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                paramSize === preset.val
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-sm"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Custom Parameter Size:</span>
            <span className="font-bold text-foreground font-mono">{paramSize} Billion Parameters</span>
          </div>
          <input
            type="range"
            min={1}
            max={120}
            step={1}
            value={paramSize}
            onChange={(e) => setParamSize(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Quantization & Context Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quantization Selector */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            2. Quantization Precision (Bit-Width)
          </label>
          <select
            value={quantId}
            onChange={(e) => setQuantId(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {QUANTIZATIONS.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name} — {q.description}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            {selectedQuant.description} (~{selectedQuant.bytesPerParam} GB / 1B params)
          </p>
        </div>

        {/* Context Length Selector */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            3. Context Window Size
          </label>
          <select
            value={contextLength}
            onChange={(e) => setContextLength(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2048}>2,048 tokens (2k)</option>
            <option value={4096}>4,096 tokens (4k)</option>
            <option value={8192}>8,192 tokens (8k - Standard)</option>
            <option value={16384}>16,384 tokens (16k)</option>
            <option value={32768}>32,768 tokens (32k)</option>
            <option value={65536}>65,536 tokens (64k)</option>
            <option value={131072}>131,072 tokens (128k)</option>
          </select>
          <p className="text-[11px] text-muted-foreground">
            Higher context windows consume additional VRAM for the KV cache during generation.
          </p>
        </div>
      </div>

      {/* Results & GPU Hardware Matches */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Estimated VRAM & Compatible Hardware
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        {/* Primary VRAM Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Required VRAM</span>
            <p className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {totalVram.toFixed(1)} GB
            </p>
            <span className="text-[10px] text-muted-foreground">Minimum video memory for smooth inference</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Model Weights Memory</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {weightsVram.toFixed(1)} GB
            </p>
            <span className="text-[10px] text-muted-foreground">Base weights at {selectedQuant.name.split(" ")[0]}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">KV Cache & CUDA Overhead</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {(kvCacheVram + cudaOverhead).toFixed(1)} GB
            </p>
            <span className="text-[10px] text-muted-foreground">{contextLength.toLocaleString()} tokens + CUDA runtime</span>
          </div>
        </div>

        {/* Recommended GPUs */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Recommended Compatible GPUs & Hardware Tiers:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {gpus.map((gpu, i) => (
              <div key={i} className="p-3 bg-card border border-border rounded-lg flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">{gpu.name}</span>
                  <span className="text-[10px] text-muted-foreground">{gpu.type}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  {gpu.tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
