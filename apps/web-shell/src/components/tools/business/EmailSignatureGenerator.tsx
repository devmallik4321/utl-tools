"use client";

import { useState, useRef } from "react";
import { Copy, Check, Eye, Code, User } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function EmailSignatureGenerator() {
  const [fullName, setFullName] = useState<string>("Sarah Jenkins");
  const [jobTitle, setJobTitle] = useState<string>("Head of Product");
  const [company, setCompany] = useState<string>("Acme Technologies");
  const [phone, setPhone] = useState<string>("+1 (555) 234-5678");
  const [email, setEmail] = useState<string>("sarah@acmetech.io");
  const [website, setWebsite] = useState<string>("https://acmetech.io");
  const [avatarUrl, setAvatarUrl] = useState<string>("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
  const [accentColor, setAccentColor] = useState<string>("#2563eb");
  const [viewMode, setViewMode] = useState<"preview" | "html">("preview");
  const [copied, setCopied] = useState<boolean>(false);
  const signatureRef = useRef<HTMLDivElement | null>(null);

  const getSignatureHtml = (): string => {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.4; color: #333333;">
  <tr>
    ${
      avatarUrl
        ? `<td valign="middle" style="padding-right: 16px;">
      <img src="${avatarUrl}" alt="${fullName}" width="68" height="68" style="border-radius: 50%; display: block; object-fit: cover;" />
    </td>`
        : ""
    }
    <td valign="middle" style="border-left: 2px solid ${accentColor}; padding-left: 14px;">
      <div style="font-size: 15px; font-weight: bold; color: #111827;">${fullName}</div>
      <div style="font-size: 12px; color: ${accentColor}; font-weight: 600; margin-bottom: 6px;">${jobTitle} &bull; ${company}</div>
      <div style="font-size: 12px; color: #64748b;">
        <span><strong>P:</strong> <a href="tel:${phone}" style="color: #64748b; text-decoration: none;">${phone}</a></span><br/>
        <span><strong>E:</strong> <a href="mailto:${email}" style="color: #64748b; text-decoration: none;">${email}</a></span><br/>
        <span><strong>W:</strong> <a href="${website}" target="_blank" style="color: ${accentColor}; text-decoration: none;">${website.replace(/^https?:\/\//, "")}</a></span>
      </div>
    </td>
  </tr>
</table>`;
  };

  const copyRichText = async () => {
    if (!signatureRef.current) return;
    try {
      const html = getSignatureHtml();
      const blobHtml = new Blob([html], { type: "text/html" });
      const blobText = new Blob([signatureRef.current.innerText], { type: "text/plain" });
      const item = new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText,
      });
      await navigator.clipboard.write([item]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ok = await copyToClipboard(getSignatureHtml());
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const copyRawHtml = async () => {
    const ok = await copyToClipboard(getSignatureHtml());
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Fields */}
        <div className="lg:col-span-6 p-5 bg-card border border-border rounded-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Photo / Avatar URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
            />
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Accent Color
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <span className="text-xs font-mono">{accentColor}</span>
            </div>
          </div>
        </div>

        {/* Live Visual Preview & Export */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Live Signature Preview
              </span>
              <div className="flex gap-1 border border-border rounded-lg p-0.5 bg-muted/30">
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    viewMode === "preview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Visual
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("html")}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    viewMode === "html" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  HTML Code
                </button>
              </div>
            </div>

            {viewMode === "preview" ? (
              <div
                ref={signatureRef}
                className="p-6 bg-white rounded-xl shadow-inner border border-slate-200 min-h-[160px] flex items-center"
              >
                <div dangerouslySetInnerHTML={{ __html: getSignatureHtml() }} />
              </div>
            ) : (
              <textarea
                rows={7}
                readOnly
                value={getSignatureHtml()}
                className="w-full p-3 font-mono text-xs bg-muted/40 border border-border rounded-xl focus:outline-none select-all"
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={copyRichText}
                className="py-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs sm:text-sm rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy for Gmail/Outlook"}</span>
              </button>

              <button
                type="button"
                onClick={copyRawHtml}
                className="py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl border border-border transition-colors flex items-center justify-center gap-1.5"
              >
                <Code className="w-4 h-4" />
                <span>Copy HTML Snippet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
