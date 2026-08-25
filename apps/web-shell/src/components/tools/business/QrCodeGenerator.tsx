"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, Download, Copy, Check, Wifi, Globe, User, Mail, Sparkles, Printer, AlertTriangle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type QrType = "url" | "text" | "wifi" | "vcard" | "email";

export function QrCodeGenerator() {
  const [qrType, setQrType] = useState<QrType>("url");
  const [url, setUrl] = useState<string>("https://utl.tools");
  const [text, setText] = useState<string>("Hello from UTL.tools!");
  const [wifiSsid, setWifiSsid] = useState<string>("Office_WiFi_5G");
  const [wifiPass, setWifiPass] = useState<string>("SecurePassword123");
  const [wifiAuth, setWifiAuth] = useState<string>("WPA");
  const [vcardName, setVcardName] = useState<string>("Alex Morgan");
  const [vcardPhone, setVcardPhone] = useState<string>("+1 (555) 019-2834");
  const [vcardEmail, setVcardEmail] = useState<string>("alex@example.com");
  const [vcardCompany, setVcardCompany] = useState<string>("Acme Technologies");
  const [emailTo, setEmailTo] = useState<string>("support@example.com");
  const [emailSubject, setEmailSubject] = useState<string>("Customer Inquiry");

  // Custom styling
  const [fgColor, setFgColor] = useState<string>("#000000");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [size, setSize] = useState<number>(300);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const getPayload = (): string => {
    switch (qrType) {
      case "url":
        return url.startsWith("http") ? url : `https://${url}`;
      case "text":
        return text;
      case "wifi":
        return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiPass};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardCompany}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
    }
  };

  const payload = getPayload();

  useEffect(() => {
    QRCode.toDataURL(
      payload,
      {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: "H",
      },
      (err, uri) => {
        if (!err && uri) {
          setDataUrl(uri);
        }
      }
    );
  }, [payload, fgColor, bgColor, size]);

  const handleDownload = (format: "png" | "svg") => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrcode-utl-tools.${format}`;
    a.click();
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(payload);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Type Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-card border border-border rounded-xl">
        <button
          type="button"
          onClick={() => setQrType("url")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            qrType === "url" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Website URL</span>
        </button>

        <button
          type="button"
          onClick={() => setQrType("wifi")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            qrType === "wifi" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>WiFi Access</span>
        </button>

        <button
          type="button"
          onClick={() => setQrType("vcard")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            qrType === "vcard" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>vCard Contact</span>
        </button>

        <button
          type="button"
          onClick={() => setQrType("email")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            qrType === "email" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Send Email</span>
        </button>

        <button
          type="button"
          onClick={() => setQrType("text")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            qrType === "text" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Plain Text</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Input Parameters Form */}
        <div className="md:col-span-7 p-6 bg-card border border-border rounded-xl space-y-4">
          {qrType === "url" && (
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Destination Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
              />
            </div>
          )}

          {qrType === "wifi" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Network Name (SSID)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                    WiFi Password
                  </label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                    Security Encryption
                  </label>
                  <select
                    value={wifiAuth}
                    onChange={(e) => setWifiAuth(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open Network)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {qrType === "vcard" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={vcardName}
                    onChange={(e) => setVcardName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={vcardCompany}
                    onChange={(e) => setVcardCompany(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={vcardPhone}
                    onChange={(e) => setVcardPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={vcardEmail}
                    onChange={(e) => setVcardEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {qrType === "email" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Pre-filled Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
                />
              </div>
            </div>
          )}

          {qrType === "text" && (
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Plain Text Message
              </label>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 text-sm bg-background border border-border rounded-lg focus:outline-none resize-none"
              />
            </div>
          )}

          {/* Color pickers */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                QR Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer"
                />
                <span className="text-xs font-mono">{fgColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer"
                />
                <span className="text-xs font-mono">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview & Download Actions */}
        <div className="md:col-span-5 flex flex-col items-center p-6 bg-card border border-border rounded-xl space-y-4 text-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            High-Resolution QR Preview
          </span>

          <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
            {dataUrl ? (
              <img src={dataUrl} alt="Generated QR Code" className="w-56 h-56 rounded" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-muted-foreground text-xs">
                Generating QR...
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button
              type="button"
              onClick={() => handleDownload("png")}
              className="flex-1 px-4 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 bg-muted text-foreground border border-border font-semibold text-xs rounded-xl hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Data"}</span>
            </button>
          </div>

          {/* Sizing & Scan Distance Ratio Guideline */}
          <div className="p-3 bg-muted/40 border border-border rounded-xl text-left text-[11px] text-muted-foreground space-y-1 w-full">
            <div className="flex items-center gap-1 font-bold text-foreground">
              <Printer className="w-3.5 h-3.5 text-blue-500" />
              <span>Print Guideline (10:1 Ratio)</span>
            </div>
            <p>
              For a 1-meter (40 in) scan distance, print at least <strong>10 cm &times; 10 cm (4 &times; 4 in)</strong> with high contrast for reliable phone camera detection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
