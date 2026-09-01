"use client";

import { useState } from "react";
import { Link2, Copy, Check, Sparkles, QrCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface UtmPreset {
  name: string;
  source: string;
  medium: string;
  campaign: string;
}

const PRESETS: UtmPreset[] = [
  { name: "Google Search Ads (CPC)", source: "google", medium: "cpc", campaign: "search_brand" },
  { name: "Email Newsletter", source: "newsletter", medium: "email", campaign: "weekly_digest" },
  { name: "LinkedIn Organic Post", source: "linkedin", medium: "social", campaign: "product_launch" },
  { name: "Twitter / X Post", source: "twitter", medium: "social", campaign: "community_update" },
  { name: "YouTube Description", source: "youtube", medium: "video", campaign: "tutorial_link" },
];

export function UtmBuilder() {
  const [baseUrl, setBaseUrl] = useState<string>("https://utl.tools");
  const [source, setSource] = useState<string>("google");
  const [medium, setMedium] = useState<string>("cpc");
  const [campaign, setCampaign] = useState<string>("spring_sale");
  const [term, setTerm] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Generate URL
  const buildUrl = (): string => {
    try {
      let rawBase = baseUrl.trim();
      if (!rawBase) return "";
      if (!/^https?:\/\//i.test(rawBase)) {
        rawBase = "https://" + rawBase;
      }
      const url = new URL(rawBase);
      if (source.trim()) url.searchParams.set("utm_source", source.trim().toLowerCase());
      if (medium.trim()) url.searchParams.set("utm_medium", medium.trim().toLowerCase());
      if (campaign.trim()) url.searchParams.set("utm_campaign", campaign.trim().toLowerCase());
      if (term.trim()) url.searchParams.set("utm_term", term.trim());
      if (content.trim()) url.searchParams.set("utm_content", content.trim());
      return url.toString();
    } catch {
      return baseUrl;
    }
  };

  const finalUrl = buildUrl();

  const handleCopy = async () => {
    const ok = await copyToClipboard(finalUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Campaign Channel Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => { setSource(p.source); setMedium(p.medium); setCampaign(p.campaign); }}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Base URL */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            1. Target Website URL (Required)
          </label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://example.com/pricing"
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Core Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Campaign Source (utm_source)
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="google, newsletter, linkedin"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg"
            />
            <span className="text-[10px] text-muted-foreground block">Referrer platform</span>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Campaign Medium (utm_medium)
            </label>
            <input
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="cpc, email, social, banner"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg"
            />
            <span className="text-[10px] text-muted-foreground block">Marketing medium type</span>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Campaign Name (utm_campaign)
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="summer_launch, promo_2026"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg"
            />
            <span className="text-[10px] text-muted-foreground block">Specific promo or product</span>
          </div>
        </div>

        {/* Optional Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Campaign Term (Optional: utm_term)
            </label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. running+shoes, developer+tools"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg"
            />
          </div>

          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Campaign Content (Optional: utm_content)
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. header_cta, sidebar_link"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Generated Final Campaign URL */}
      <div className="p-5 bg-muted/40 border border-border rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-blue-500" />
            Generated Tracking URL
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy Campaign Link"}</span>
          </button>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border font-mono text-xs text-foreground break-all select-all">
          {finalUrl}
        </div>
      </div>
    </div>
  );
}
