"use client";

import { useState, useMemo } from "react";
import { Share2, Copy, Check, ExternalLink, Sparkles, MessageCircle, Send } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface PlatformLink {
  name: string;
  url: string;
  color: string;
  badge: string;
}

export function SocialShareLinkGenerator() {
  const [targetUrl, setTargetUrl] = useState<string>("https://utl.tools");
  const [message, setMessage] = useState<string>("Check out this awesome collection of 100+ free client-side developer and productivity utilities!");
  const [hashtags, setHashtags] = useState<string>("webdev,productivity,tools");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const encodedUrl = encodeURIComponent(targetUrl.trim());
  const encodedMsg = encodeURIComponent(message.trim());
  const cleanTags = hashtags.replace(/#/g, "").replace(/\s+/g, "");

  const shareLinks = useMemo<PlatformLink[]>(() => {
    return [
      {
        name: "WhatsApp",
        url: `https://api.whatsapp.com/send?text=${encodedMsg}%20${encodedUrl}`,
        color: "bg-emerald-600 hover:bg-emerald-700 text-white",
        badge: "Direct Message",
      },
      {
        name: "Twitter / X",
        url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedMsg}${cleanTags ? `&hashtags=${cleanTags}` : ""}`,
        color: "bg-slate-900 hover:bg-black text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900",
        badge: "Social Post",
      },
      {
        name: "LinkedIn",
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        color: "bg-blue-700 hover:bg-blue-800 text-white",
        badge: "Professional Feed",
      },
      {
        name: "Telegram",
        url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`,
        color: "bg-sky-500 hover:bg-sky-600 text-white",
        badge: "Instant Channel",
      },
      {
        name: "Reddit",
        url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedMsg}`,
        color: "bg-orange-600 hover:bg-orange-700 text-white",
        badge: "Community Post",
      },
      {
        name: "Facebook",
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        color: "bg-blue-600 hover:bg-blue-700 text-white",
        badge: "Social Share",
      },
      {
        name: "Email Mailto",
        url: `mailto:?subject=${encodeURIComponent("Recommended link")}&body=${encodedMsg}%0A%0A${encodedUrl}`,
        color: "bg-zinc-700 hover:bg-zinc-800 text-white",
        badge: "Direct Email",
      },
    ];
  }, [encodedUrl, encodedMsg, cleanTags]);

  const handleCopy = async (key: string, textToCopy: string) => {
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Target URL to Share
          </label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[11px] text-muted-foreground">The exact webpage destination</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Hashtags (Optional, comma-separated)
          </label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="webdev, javascript, tech"
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[11px] text-muted-foreground">Used primarily on Twitter / X</span>
        </div>

        <div className="sm:col-span-2 p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Pre-Filled Sharing Message / Title
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Enter the default text message that appears when users click share..."
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Generated Share Links Matrix */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-blue-500" />
            Generated 1-Click Social Share Links ({shareLinks.length} Platforms)
          </h4>
          <span className="text-xs text-muted-foreground">Click 'Test' to trigger real share dialog</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shareLinks.map((item) => (
            <div
              key={item.name}
              className="p-4 bg-card rounded-xl border border-border space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{item.name}</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item.name, item.url)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    {copiedKey === item.name ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === item.name ? "Copied" : "Copy"}</span>
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md inline-flex items-center gap-1 shadow-2xs transition-opacity ${item.color}`}
                  >
                    <span>Test</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-2 bg-background rounded-lg border border-border text-[11px] font-mono text-muted-foreground break-all select-all">
                {item.url}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
