"use client";

import { useState, useEffect } from "react";
import { Keyboard, Copy, Check, Sparkles, Search } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const COMMON_KEYS = [
  { key: "Enter", code: "Enter", which: 13 },
  { key: "Escape", code: "Escape", which: 27 },
  { key: " ", code: "Space", which: 32, label: "Space" },
  { key: "Tab", code: "Tab", which: 9 },
  { key: "Backspace", code: "Backspace", which: 8 },
  { key: "Shift", code: "ShiftLeft", which: 16 },
  { key: "Control", code: "ControlLeft", which: 17 },
  { key: "Alt", code: "AltLeft", which: 18 },
  { key: "ArrowUp", code: "ArrowUp", which: 38 },
  { key: "ArrowDown", code: "ArrowDown", which: 40 },
  { key: "ArrowLeft", code: "ArrowLeft", which: 37 },
  { key: "ArrowRight", code: "ArrowRight", which: 39 },
  { key: "Delete", code: "Delete", which: 46 },
  { key: "CapsLock", code: "CapsLock", which: 20 },
];

export function KeycodeVisualizer() {
  const [currentEvent, setCurrentEvent] = useState<{
    key: string;
    code: string;
    which: number;
    location: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
  }>({
    key: "Enter",
    code: "Enter",
    which: 13,
    location: 0,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setCurrentEvent({
        key: e.key,
        code: e.code,
        which: e.which || e.keyCode,
        location: e.location,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopy = async () => {
    const summary = `JS Keyboard Event:\n• event.key = "${currentEvent.key}"\n• event.code = "${currentEvent.code}"\n• event.which = ${currentEvent.which}\n• event.keyCode = ${currentEvent.which}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredKeys = COMMON_KEYS.filter(
    (k) =>
      k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.which.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Interactive Press Key Banner */}
      <div className="p-8 bg-card border-2 border-blue-500/40 rounded-2xl text-center space-y-4 shadow-sm">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
          Press Any Key on Your Keyboard to Inspect
        </span>

        <div className="py-2">
          <div className="text-6xl sm:text-7xl font-extrabold font-mono text-foreground inline-block px-6 py-2 bg-muted/40 rounded-2xl border border-border">
            {currentEvent.which}
          </div>
          <span className="text-xs font-mono text-muted-foreground block pt-2">
            event.which / event.keyCode
          </span>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied JS Event!" : "Copy JS Event Data"}</span>
          </button>
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-4 bg-card rounded-xl border border-border space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold">event.key</span>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {currentEvent.key === " " ? "(Space)" : currentEvent.key}
          </p>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold">event.code</span>
          <p className="text-lg font-bold text-foreground truncate">{currentEvent.code}</p>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold">event.location</span>
          <p className="text-lg font-bold text-foreground">{currentEvent.location}</p>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold">Modifiers</span>
          <div className="flex flex-wrap gap-1 text-[10px] font-bold">
            <span className={currentEvent.shiftKey ? "text-blue-600" : "text-muted-foreground/40"}>SHIFT</span>
            <span className={currentEvent.ctrlKey ? "text-blue-600" : "text-muted-foreground/40"}>CTRL</span>
            <span className={currentEvent.altKey ? "text-blue-600" : "text-muted-foreground/40"}>ALT</span>
            <span className={currentEvent.metaKey ? "text-blue-600" : "text-muted-foreground/40"}>CMD</span>
          </div>
        </div>
      </div>

      {/* Searchable Common Keys Reference */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Keyboard className="w-4 h-4 text-blue-500" />
            Common JavaScript KeyCodes Reference
          </h4>
          <div className="w-full sm:w-48">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search key or code..."
              className="w-full px-2.5 py-1 text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs font-mono">
          {filteredKeys.map((k) => (
            <div
              key={k.code}
              onClick={() =>
                setCurrentEvent({
                  key: k.key,
                  code: k.code,
                  which: k.which,
                  location: 0,
                  altKey: false,
                  ctrlKey: false,
                  shiftKey: false,
                  metaKey: false,
                })
              }
              className="p-2.5 bg-card rounded-lg border border-border hover:border-blue-500 transition-colors cursor-pointer text-center space-y-0.5 shadow-2xs"
            >
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 block">{k.which}</span>
              <p className="text-[11px] text-foreground font-semibold truncate">{k.label || k.key}</p>
              <span className="text-[10px] text-muted-foreground block truncate">{k.code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
