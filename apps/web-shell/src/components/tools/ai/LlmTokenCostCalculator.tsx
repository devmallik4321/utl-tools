"use client";

import { useState } from "react";
import { Cpu, DollarSign, Calculator, Layers, Sparkles, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface LlmModelPricing {
  id: string;
  provider: string;
  name: string;
  inputPerMillion: number;
  outputPerMillion: number;
  contextWindow: string;
}

const MODELS: LlmModelPricing[] = [
  { id: "gpt-4o", provider: "OpenAI", name: "GPT-4o", inputPerMillion: 2.50, outputPerMillion: 10.00, contextWindow: "128k" },
  { id: "gpt-4o-mini", provider: "OpenAI", name: "GPT-4o mini", inputPerMillion: 0.15, outputPerMillion: 0.60, contextWindow: "128k" },
  { id: "o1-preview", provider: "OpenAI", name: "o1-preview", inputPerMillion: 15.00, outputPerMillion: 60.00, contextWindow: "128k" },
  { id: "claude-3-5-sonnet", provider: "Anthropic", name: "Claude 3.5 Sonnet", inputPerMillion: 3.00, outputPerMillion: 15.00, contextWindow: "200k" },
  { id: "claude-3-5-haiku", provider: "Anthropic", name: "Claude 3.5 Haiku", inputPerMillion: 0.80, outputPerMillion: 4.00, contextWindow: "200k" },
  { id: "gemini-1-5-pro", provider: "Google", name: "Gemini 1.5 Pro", inputPerMillion: 1.25, outputPerMillion: 5.00, contextWindow: "2M" },
  { id: "gemini-1-5-flash", provider: "Google", name: "Gemini 1.5 Flash", inputPerMillion: 0.075, outputPerMillion: 0.30, contextWindow: "1M" },
  { id: "deepseek-v3", provider: "DeepSeek", name: "DeepSeek V3", inputPerMillion: 0.14, outputPerMillion: 0.28, contextWindow: "64k" },
  { id: "custom", provider: "Custom", name: "Custom Rates", inputPerMillion: 1.00, outputPerMillion: 2.00, contextWindow: "Custom" },
];

export function LlmTokenCostCalculator() {
  const [selectedModelId, setSelectedModelId] = useState<string>("gpt-4o");
  const [inputTokens, setInputTokens] = useState<number>(1500);
  const [outputTokens, setOutputTokens] = useState<number>(500);
  const [requestsPerDay, setRequestsPerDay] = useState<number>(100);
  const [customInputRate, setCustomInputRate] = useState<number>(1.00);
  const [customOutputRate, setCustomOutputRate] = useState<number>(2.00);
  const [promptText, setPromptText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const selectedModel = MODELS.find((m) => m.id === selectedModelId) || MODELS[0];
  const inputRate = selectedModel.id === "custom" ? customInputRate : selectedModel.inputPerMillion;
  const outputRate = selectedModel.id === "custom" ? customOutputRate : selectedModel.outputPerMillion;

  // Costs
  const costPerInput = (inputTokens / 1_000_000) * inputRate;
  const costPerOutput = (outputTokens / 1_000_000) * outputRate;
  const singleRequestCost = costPerInput + costPerOutput;
  const dailyCost = singleRequestCost * requestsPerDay;
  const monthlyCost = dailyCost * 30;

  const handlePromptInput = (text: string) => {
    setPromptText(text);
    if (text.length > 0) {
      // Standard English heuristic: ~4 characters per token
      const estimatedTokens = Math.ceil(text.length / 4);
      setInputTokens(estimatedTokens);
    }
  };

  const handleCopy = async () => {
    const summary = `LLM Cost Estimate (${selectedModel.name})\n• Input Tokens: ${inputTokens.toLocaleString()} ($${costPerInput.toFixed(6)})\n• Output Tokens: ${outputTokens.toLocaleString()} ($${costPerOutput.toFixed(6)})\n• Per Call: $${singleRequestCost.toFixed(5)}\n• Monthly (${(requestsPerDay * 30).toLocaleString()} calls): $${monthlyCost.toFixed(2)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Select AI Model & Pricing Tier
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModelId(model.id)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedModelId === model.id
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-foreground"
                  : "border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block text-muted-foreground">
                {model.provider}
              </span>
              <p className="text-xs font-bold truncate mt-0.5 text-foreground">{model.name}</p>
              <span className="text-[10px] font-mono text-muted-foreground block mt-1">
                ${model.inputPerMillion} / ${model.outputPerMillion} (1M)
              </span>
            </button>
          ))}
        </div>

        {selectedModel.id === "custom" && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Custom Input Rate ($ / 1M Tokens)
              </label>
              <input
                type="number"
                step="0.01"
                value={customInputRate}
                onChange={(e) => setCustomInputRate(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Custom Output Rate ($ / 1M Tokens)
              </label>
              <input
                type="number"
                step="0.01"
                value={customOutputRate}
                onChange={(e) => setCustomOutputRate(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Token Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input Tokens */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Input / Prompt Tokens
          </label>
          <input
            type="number"
            value={inputTokens}
            onChange={(e) => setInputTokens(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground block">
            Approx. {(inputTokens * 4).toLocaleString()} characters
          </span>
        </div>

        {/* Output Tokens */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Output / Completion Tokens
          </label>
          <input
            type="number"
            value={outputTokens}
            onChange={(e) => setOutputTokens(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground block">
            Approx. {(outputTokens * 4).toLocaleString()} characters
          </span>
        </div>

        {/* Volume / Scale */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            API Requests / Day
          </label>
          <input
            type="number"
            value={requestsPerDay}
            onChange={(e) => setRequestsPerDay(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground block">
            {(requestsPerDay * 30).toLocaleString()} calls / month
          </span>
        </div>
      </div>

      {/* Optional Prompt Text Estimator */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Optional: Paste Prompt to Auto-Estimate Tokens
        </span>
        <textarea
          rows={3}
          value={promptText}
          onChange={(e) => handlePromptInput(e.target.value)}
          placeholder="Paste prompt text here to calculate character count and estimate input tokens..."
          className="w-full p-2.5 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none"
        />
      </div>

      {/* Results Summary */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Cost Projection Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Estimate"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-lg border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Cost Per Single API Call</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${singleRequestCost < 0.0001 ? singleRequestCost.toFixed(6) : singleRequestCost.toFixed(4)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Input: ${costPerInput.toFixed(5)} • Output: ${costPerOutput.toFixed(5)}
            </p>
          </div>

          <div className="p-4 bg-card rounded-lg border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Daily Projected Cost</span>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${dailyCost.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {requestsPerDay.toLocaleString()} requests / day
            </p>
          </div>

          <div className="p-4 bg-card rounded-lg border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Projected Cost</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${monthlyCost.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {(requestsPerDay * 30).toLocaleString()} requests / month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
