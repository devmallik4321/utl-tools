"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, Clock, Server, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Daily at 4:00 AM", exp: "0 4 * * *" },
  { name: "Every 15 Minutes", exp: "*/15 * * * *" },
  { name: "Every Monday at 9:00 AM", exp: "0 9 * * 1" },
  { name: "First of Every Month", exp: "0 0 1 * *" },
  { name: "Hourly at Minute 0", exp: "0 * * * *" },
];

export function CronToSystemdConverter() {
  const [cronExp, setCronExp] = useState<string>("0 4 * * *");
  const [serviceName, setServiceName] = useState<string>("backup-job");
  const [commandPath, setCommandPath] = useState<string>("/usr/local/bin/backup.sh");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { onCalendar, timerUnit, serviceUnit, bashCommands } = useMemo(() => {
    const parts = cronExp.trim().split(/\s+/);
    let cal = "*-*-* 04:00:00";

    if (parts.length === 5) {
      const [m, h, dom, mon, dow] = parts;

      if (m.startsWith("*/")) {
        cal = `*:0/${m.slice(2)}:00`;
      } else if (h === "*" && m !== "*") {
        cal = `*:00,${m}:00`;
      } else if (dom === "*" && mon === "*" && dow === "*") {
        const hh = h.padStart(2, "0");
        const mm = m.padStart(2, "0");
        cal = `*-*-* ${hh}:${mm}:00`;
      } else if (dow !== "*" && dom === "*") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = days[parseInt(dow)] || "Mon";
        const hh = h.padStart(2, "0");
        const mm = m.padStart(2, "0");
        cal = `${dayName} *-*-* ${hh}:${mm}:00`;
      } else if (dom !== "*" && mon === "*") {
        const dd = dom.padStart(2, "0");
        const hh = h.padStart(2, "0");
        const mm = m.padStart(2, "0");
        cal = `*-*-${dd} ${hh}:${mm}:00`;
      }
    }

    const timer = `[Unit]
Description=Timer for ${serviceName}
Requires=${serviceName}.service

[Timer]
Unit=${serviceName}.service
OnCalendar=${cal}
Persistent=true

[Install]
WantedBy=timers.target`;

    const service = `[Unit]
Description=Service for ${serviceName}
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
ExecStart=${commandPath}
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`;

    const bash = `# 1. Write timer and service to systemd directory
sudo tee /etc/systemd/system/${serviceName}.timer << 'EOF'
${timer}
EOF

sudo tee /etc/systemd/system/${serviceName}.service << 'EOF'
${service}
EOF

# 2. Reload daemon and start timer
sudo systemctl daemon-reload
sudo systemctl enable --now ${serviceName}.timer
sudo systemctl status ${serviceName}.timer`;

    return { onCalendar: cal, timerUnit: timer, serviceUnit: service, bashCommands: bash };
  }, [cronExp, serviceName, commandPath]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setCronExp(p.exp)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              cronExp === p.exp
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Crontab Expression
          </label>
          <input
            type="text"
            value={cronExp}
            onChange={(e) => setCronExp(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Service / Timer Name
          </label>
          <input
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Command to Execute
          </label>
          <input
            type="text"
            value={commandPath}
            onChange={(e) => setCommandPath(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Output Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              {serviceName}.timer
            </h4>
            <button
              onClick={() => handleCopy("timer", timerUnit)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "timer" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "timer" ? "Copied!" : "Copy .timer"}</span>
            </button>
          </div>
          <pre className="p-3 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
            {timerUnit}
          </pre>
        </div>

        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-500" />
              {serviceName}.service
            </h4>
            <button
              onClick={() => handleCopy("service", serviceUnit)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "service" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "service" ? "Copied!" : "Copy .service"}</span>
            </button>
          </div>
          <pre className="p-3 bg-card border border-border rounded-xl font-mono text-xs text-purple-600 dark:text-purple-400 overflow-x-auto select-all">
            {serviceUnit}
          </pre>
        </div>
      </div>
    </div>
  );
}
