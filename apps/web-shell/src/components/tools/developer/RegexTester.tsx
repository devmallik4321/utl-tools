"use client";

import { useState, useMemo } from "react";
import { Code, Sparkles, Copy, Check, AlertCircle, List } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface RegexPreset {
  name: string;
  pattern: string;
  flags: string;
  testText: string;
}

const PRESETS: RegexPreset[] = [
  {
    name: "Email Address",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "g",
    testText: "Contact support at hello@utl.tools or admin.user+tag@company.co.uk for inquiries.",
  },
  {
    name: "URL / Web Link",
    pattern: "https?:\\/\\/[\\w\\-\\.]+(?::\\d+)?(?:\\/[\\w\\-\\._~:/?#[\\]@!$&'()*+,;=]*)?",
    flags: "g",
    testText: "Visit our site at https://utl.tools/tools/diff-checker or http://localhost:3000 for local testing.",
  },
  {
    name: "IPv4 Address",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    testText: "Connected from 192.168.1.1 and gateway 10.0.0.254, but not 999.999.999.999.",
  },
  {
    name: "Hex Color Code",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b",
    flags: "g",
    testText: "Theme colors: primary #2563eb, dark #0f172a, white #fff, invalid #12345.",
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b",
    flags: "g",
    testText: "Created on 2026-09-01 and finalized by 2026-12-31.",
  },
];

export function RegexTester() {
  const [pattern, setPattern] = useState<string>("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean }>({
    g: true,
    i: false,
    m: true,
    s: false,
  });
  const [testText, setTestText] = useState<string>(
    "Contact support at hello@utl.tools or admin.user+tag@company.co.uk for inquiries."
  );
  const [copied, setCopied] = useState<boolean>(false);

  const flagString = useMemo(() => {
    let f = "";
    if (flags.g) f += "g";
    if (flags.i) f += "i";
    if (flags.m) f += "m";
    if (flags.s) f += "s";
    return f;
  }, [flags]);

  // Execute Regex
  const { matches, error, highlightedHtml } = useMemo(() => {
    if (!pattern.trim()) {
      return { matches: [], error: null, highlightedHtml: testText };
    }

    try {
      const regex = new RegExp(pattern, flagString);
      const allMatches: { match: string; index: number; groups: string[] }[] = [];

      if (flags.g) {
        let m: RegExpExecArray | null;
        let lastIdx = 0;
        let safetyCount = 0;
        while ((m = regex.exec(testText)) !== null && safetyCount < 1000) {
          safetyCount++;
          const groups = m.slice(1);
          allMatches.push({ match: m[0], index: m.index, groups });
          if (regex.lastIndex === lastIdx) {
            regex.lastIndex++; // Avoid infinite loop on zero-length matches
          }
          lastIdx = regex.lastIndex;
        }
      } else {
        const m = regex.exec(testText);
        if (m) {
          allMatches.push({ match: m[0], index: m.index, groups: m.slice(1) });
        }
      }

      // Generate highlighted HTML
      let html = "";
      let lastIndex = 0;
      allMatches.forEach((m) => {
        html += escapeHtml(testText.substring(lastIndex, m.index));
        html += `<mark class="bg-amber-300 dark:bg-amber-600/80 text-foreground px-1 py-0.5 rounded font-mono font-bold">${escapeHtml(
          m.match
        )}</mark>`;
        lastIndex = m.index + m.match.length;
      });
      html += escapeHtml(testText.substring(lastIndex));

      return { matches: allMatches, error: null, highlightedHtml: html };
    } catch (err: any) {
      return { matches: [], error: err.message, highlightedHtml: escapeHtml(testText) };
    }
  }, [pattern, flagString, testText, flags.g]);

  const loadPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
    setTestText(preset.testText);
    setFlags({
      g: preset.flags.includes("g"),
      i: preset.flags.includes("i"),
      m: preset.flags.includes("m"),
      s: preset.flags.includes("s"),
    });
  };

  const handleCopyMatches = async () => {
    const text = matches.map((m) => m.match).join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Patterns */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Quick Preset Patterns:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted/40 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Regex Input & Flags */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Regular Expression &amp; Flags
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center flex-1 bg-background border border-border rounded-lg px-3 py-2 font-mono text-sm focus-within:ring-2 focus-within:ring-blue-500">
            <span className="text-muted-foreground mr-1">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. [a-z0-9]+"
              className="flex-1 bg-transparent border-none outline-none font-mono text-foreground"
            />
            <span className="text-muted-foreground ml-1">/{flagString}</span>
          </div>

          {/* Flag Toggles */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border">
            {[
              { key: "g", label: "g (global)" },
              { key: "i", label: "i (ignore case)" },
              { key: "m", label: "m (multiline)" },
              { key: "s", label: "s (dotAll)" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFlags((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded ${
                  flags[key as keyof typeof flags]
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={label}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Regex Error: {error}</span>
          </div>
        )}
      </div>

      {/* Test String & Live Visual Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Test String Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Test String
          </label>
          <textarea
            rows={8}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Paste text to test your regular expression against..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* Live Highlighted Preview */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Match Highlight ({matches.length} matches found)
            </label>
            {matches.length > 0 && (
              <button
                onClick={handleCopyMatches}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Matches"}</span>
              </button>
            )}
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            className="p-3 min-h-[192px] max-h-[260px] overflow-y-auto font-mono text-xs sm:text-sm bg-muted/30 border border-border rounded-lg whitespace-pre-wrap break-all"
          />
        </div>
      </div>

      {/* Match Table */}
      {matches.length > 0 && (
        <div className="p-5 bg-muted/20 border border-border rounded-xl space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <List className="w-4 h-4 text-blue-500" />
            Match Details &amp; Capture Groups
          </span>

          <div className="max-h-60 overflow-y-auto rounded-lg border border-border bg-card">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="p-2.5 font-semibold">#</th>
                  <th className="p-2.5 font-semibold">Full Match</th>
                  <th className="p-2.5 font-semibold">Index</th>
                  <th className="p-2.5 font-semibold">Capture Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matches.map((m, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="p-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="p-2.5 font-bold text-foreground">{m.match}</td>
                    <td className="p-2.5 text-muted-foreground">{m.index}</td>
                    <td className="p-2.5 text-blue-600 dark:text-blue-400">
                      {m.groups.length > 0 ? m.groups.map((g, gi) => `$${gi + 1}: ${g}`).join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
