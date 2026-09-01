"use client";

import { useState, useMemo } from "react";
import { Radio, Copy, Check, Volume2, Sparkles, ArrowRightLeft } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
  "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "@": ".--.-.",
};

const REVERSE_MORSE: Record<string, string> = Object.entries(MORSE_MAP).reduce(
  (acc, [char, code]) => ({ ...acc, [code]: char }),
  {}
);

export function MorseCodeTranslator() {
  const [input, setInput] = useState<string>("SOS MAYDAY");
  const [mode, setMode] = useState<"textToMorse" | "morseToText">("textToMorse");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const translated = useMemo(() => {
    if (!input) return "";

    if (mode === "textToMorse") {
      return input
        .toUpperCase()
        .split("")
        .map((c) => (c === " " ? "/" : MORSE_MAP[c] || c))
        .join(" ");
    } else {
      return input
        .trim()
        .split(/\s+/)
        .map((code) => (code === "/" ? " " : REVERSE_MORSE[code] || "?"))
        .join("");
    }
  }, [input, mode]);

  const playMorseAudio = () => {
    if (typeof window === "undefined" || !window.AudioContext) return;
    const morseString = mode === "textToMorse" ? translated : input;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dotDuration = 0.08;
    let time = ctx.currentTime + 0.05;

    setIsPlaying(true);

    morseString.split("").forEach((symbol) => {
      if (symbol === "." || symbol === "-") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 750;
        osc.connect(gain);
        gain.connect(ctx.destination);

        const duration = symbol === "." ? dotDuration : dotDuration * 3;
        osc.start(time);
        osc.stop(time + duration);
        time += duration + dotDuration;
      } else if (symbol === " ") {
        time += dotDuration * 2;
      } else if (symbol === "/") {
        time += dotDuration * 4;
      }
    });

    setTimeout(() => {
      setIsPlaying(false);
    }, (time - ctx.currentTime) * 1000);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(translated);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-muted/50 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => {
            setMode("textToMorse");
            setInput("SOS MAYDAY");
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            mode === "textToMorse" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground"
          }`}
        >
          Text ➔ Morse Code
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("morseToText");
            setInput("... --- ... / -- .- -.-- -.. .- -.--");
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            mode === "morseToText" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground"
          }`}
        >
          Morse Code ➔ Text
        </button>
      </div>

      {/* Input / Output Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="font-semibold uppercase text-foreground">
              {mode === "textToMorse" ? "Plain Text Message" : "Morse Code (. and -)"}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder={mode === "textToMorse" ? "Type English message..." : "Type ... --- ..."}
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              {mode === "textToMorse" ? "Translated Morse Code" : "Decoded English Text"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={playMorseAudio}
                disabled={isPlaying}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-50"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlaying ? "Playing..." : "Play Audio"}</span>
              </button>
              <span>•</span>
              <button
                onClick={handleCopy}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={translated}
            rows={5}
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none select-all text-emerald-600 dark:text-emerald-400 font-bold"
          />
        </div>
      </div>

      {/* Lookup Alphabet Matrix */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-blue-500" />
          ITU-R International Morse Code Alphabet Lookup
        </h4>

        <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-9 gap-2 text-xs font-mono">
          {Object.entries(MORSE_MAP).slice(0, 36).map(([char, code]) => (
            <div key={char} className="p-2 bg-card rounded-lg border border-border text-center space-y-0.5">
              <span className="font-bold text-foreground block text-sm">{char}</span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold block">{code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
