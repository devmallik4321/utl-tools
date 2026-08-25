"use client";

import { useState } from "react";
import { FileText, Copy, Check, RefreshCw, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt",
  "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde", "omnis", "iste", "natus",
  "error", "voluptatem", "accusantium", "doloremque", "laudantium", "totam", "rem", "aperiam",
  "eaque", "ipsa", "quae", "ab", "illo", "inventore", "veritatis", "quasi", "architecto",
  "beatae", "vitae", "dicta", "explicabo", "nemo", "ipsam", "quia", "voluptas", "aspernatur"
];

export function LoremIpsumGenerator() {
  const [type, setType] = useState<"paragraphs" | "sentences" | "words" | "lists">("paragraphs");
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [asHtml, setAsHtml] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const generateSentence = (wordsCount: number = 10): string => {
    const words: string[] = [];
    for (let i = 0; i < wordsCount; i++) {
      const w = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
      words.push(w);
    }
    const str = words.join(" ");
    return str.charAt(0).toUpperCase() + str.slice(1) + ".";
  };

  const generateText = (): string => {
    if (type === "words") {
      const words: string[] = [];
      if (startWithLorem && count >= 5) {
        words.push("Lorem", "ipsum", "dolor", "sit", "amet");
      }
      while (words.length < count) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      return words.slice(0, count).join(" ");
    }

    if (type === "sentences") {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        if (i === 0 && startWithLorem) {
          sentences.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
        } else {
          sentences.push(generateSentence(Math.floor(Math.random() * 8) + 8));
        }
      }
      return asHtml ? sentences.map((s) => `<span>${s}</span>`).join("\n") : sentences.join(" ");
    }

    if (type === "lists") {
      const items: string[] = [];
      for (let i = 0; i < count; i++) {
        items.push(generateSentence(Math.floor(Math.random() * 5) + 4).replace(".", ""));
      }
      return asHtml
        ? `<ul>\n${items.map((it) => `  <li>${it}</li>`).join("\n")}\n</ul>`
        : items.map((it) => `• ${it}`).join("\n");
    }

    // Paragraphs
    const paragraphs: string[] = [];
    for (let p = 0; p < count; p++) {
      const pSentences: string[] = [];
      const numSentences = Math.floor(Math.random() * 4) + 4;
      for (let s = 0; s < numSentences; s++) {
        if (p === 0 && s === 0 && startWithLorem) {
          pSentences.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.");
        } else {
          pSentences.push(generateSentence(Math.floor(Math.random() * 8) + 7));
        }
      }
      paragraphs.push(pSentences.join(" "));
    }

    return asHtml
      ? paragraphs.map((p) => `<p>${p}</p>`).join("\n\n")
      : paragraphs.join("\n\n");
  };

  const output = generateText();

  const handleCopy = async () => {
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Form */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Generation Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
              <option value="lists">Bullet List Items</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Quantity Count ({count})
            </label>
            <input
              type="number"
              min={1}
              max={type === "words" ? 500 : 50}
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
            />
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Start with "Lorem ipsum..."</span>
            </label>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={asHtml}
                onChange={(e) => setAsHtml(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Wrap in HTML tags (&lt;p&gt;, &lt;ul&gt;)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Output Canvas */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Generated Placeholder Text
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Text"}</span>
          </button>
        </div>

        <textarea
          rows={11}
          readOnly
          value={output}
          className="w-full p-4 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-xl select-all focus:outline-none resize-y leading-relaxed"
        />
      </div>
    </div>
  );
}
