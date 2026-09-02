"use client";

import { useState } from "react";
import { Code, Copy, Check, Sparkles, Search, CheckCircle, XCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const REGEX_ITEMS = [
  { category: "Character Classes", token: "\\d", name: "Digit", desc: "Matches any digit (0-9). Equivalent to [0-9]." },
  { category: "Character Classes", token: "\\D", name: "Non-digit", desc: "Matches any character that is not a digit." },
  { category: "Character Classes", token: "\\w", name: "Word Character", desc: "Matches alphanumeric characters plus underscore (a-z, A-Z, 0-9, _)." },
  { category: "Character Classes", token: "\\W", name: "Non-word Character", desc: "Matches any non-alphanumeric character (spaces, symbols)." },
  { category: "Character Classes", token: "\\s", name: "Whitespace", desc: "Matches spaces, tabs, line breaks, form feeds." },
  { category: "Character Classes", token: ".", name: "Any Character", desc: "Matches any single character except newline (unless 's' dotAll flag is set)." },

  { category: "Quantifiers", token: "*", name: "0 or more", desc: "Matches 0 or more occurrences of the preceding token (greedy)." },
  { category: "Quantifiers", token: "+", name: "1 or more", desc: "Matches 1 or more occurrences of the preceding token (greedy)." },
  { category: "Quantifiers", token: "?", name: "0 or 1 (Optional)", desc: "Makes the preceding item optional, or makes a quantifier lazy (*?, +?)." },
  { category: "Quantifiers", token: "{n,m}", name: "Between N and M", desc: "Matches at least N and at most M times (e.g. \\d{3,5})." },

  { category: "Anchors & Boundaries", token: "^", name: "Start of String", desc: "Asserts position at the start of string (or start of line in multiline mode)." },
  { category: "Anchors & Boundaries", token: "$", name: "End of String", desc: "Asserts position at the end of string (or end of line in multiline mode)." },
  { category: "Anchors & Boundaries", token: "\\b", name: "Word Boundary", desc: "Matches at a word boundary (transition between word and non-word)." },

  { category: "Lookarounds", token: "(?=...)", name: "Positive Lookahead", desc: "Asserts that what follows immediately matches the given pattern without consuming characters." },
  { category: "Lookarounds", token: "(?!...)", name: "Negative Lookahead", desc: "Asserts that what follows immediately does not match the given pattern." },
  { category: "Lookarounds", token: "(?<=...)", name: "Positive Lookbehind", desc: "Asserts that what precedes immediately matches the given pattern." },
  { category: "Lookarounds", token: "(?<!...)", name: "Negative Lookbehind", desc: "Asserts that what precedes immediately does not match the given pattern." },

  { category: "Flags", token: "g", name: "Global Flag", desc: "Find all matches rather than stopping after the first match." },
  { category: "Flags", token: "i", name: "Case Insensitive", desc: "Make matching case-insensitive (ignores uppercase vs lowercase)." },
  { category: "Flags", token: "m", name: "Multiline Flag", desc: "Causes ^ and $ to match begin/end of each line rather than whole string." },
];

export function RegexReference() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [testPattern, setTestPattern] = useState<string>("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
  const [testString, setTestString] = useState<string>("user.name@example.com");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Live quick match tester
  let isMatch = false;
  let hasError = false;
  try {
    const reg = new RegExp(testPattern);
    isMatch = reg.test(testString);
  } catch {
    hasError = true;
  }

  const handleCopy = async (token: string) => {
    const ok = await copyToClipboard(token);
    if (ok) {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  const filtered = REGEX_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Quick Test Sandbox */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
          Interactive Regex Quick Tester
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Regex Pattern</label>
            <input
              type="text"
              value={testPattern}
              onChange={(e) => setTestPattern(e.target.value)}
              className="w-full px-3 py-1.5 font-mono text-xs bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Test String</label>
            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="w-full px-3 py-1.5 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 text-xs">
          {hasError ? (
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Invalid Regex Syntax
            </span>
          ) : isMatch ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Match Found ✓
            </span>
          ) : (
            <span className="text-muted-foreground font-semibold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> No Match
            </span>
          )}
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Code className="w-4 h-4 text-blue-500" />
          Regular Expressions Cheat Sheet &amp; Reference
        </h4>
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search token or name..."
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
          />
        </div>
      </div>

      {/* Tokens Master Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((item) => (
          <div
            key={item.token + item.name}
            className="p-3 bg-card border border-border rounded-xl space-y-1.5 hover:border-blue-500 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 font-mono font-bold text-xs bg-muted rounded-md text-emerald-600 dark:text-emerald-400 border border-border">
                {item.token}
              </span>
              <button
                onClick={() => handleCopy(item.token)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copiedToken === item.token ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedToken === item.token ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div>
              <strong className="text-xs text-foreground block">{item.name}</strong>
              <span className="text-[10px] text-muted-foreground block">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
