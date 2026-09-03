"use client";

import { useState, useMemo } from "react";
import { Heart, Activity, Copy, Check, Sparkles, Flame, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HeartRateRecoveryCalculator() {
  const [peakHr, setPeakHr] = useState<number>(172);
  const [oneMinHr, setOneMinHr] = useState<number>(140);
  const [twoMinHr, setTwoMinHr] = useState<number>(118);
  const [posture, setPosture] = useState<"standing" | "seated">("standing");
  const [copied, setCopied] = useState<boolean>(false);

  const {
    drop1Min,
    drop2Min,
    tier1Min,
    tier2Min,
    color1Min,
    clinicalVerdict,
  } = useMemo(() => {
    const d1 = Math.max(0, peakHr - oneMinHr);
    const d2 = Math.max(0, peakHr - twoMinHr);

    // 1-minute clinical threshold (Cole et al. NEJM: <= 12 bpm is abnormal standing)
    const abnormalThreshold = posture === "standing" ? 12 : 18;

    let t1 = "Normal / Average (13 – 20 bpm)";
    let c1 = "text-blue-500 border-blue-500/30";
    let verdict = "Healthy parasympathetic reactivation. Your heart recovers at an average rate following peak exertion.";

    if (d1 <= abnormalThreshold) {
      t1 = `Abnormal / High Risk (≤ ${abnormalThreshold} bpm)`;
      c1 = "text-rose-500 border-rose-500/30";
      verdict = "Delayed heart rate recovery. In clinical cardiology, a drop of 12 bpm or less at 1 minute is associated with impaired vagal reactivation and warrants evaluation by a physician.";
    } else if (d1 > 30) {
      t1 = "Elite / Athletic (> 30 bpm)";
      c1 = "text-emerald-500 border-emerald-500/30";
      verdict = "Outstanding autonomic nervous system tone. Your vagus nerve rapidly decelerates cardiac output, typical of high-level endurance athletes.";
    } else if (d1 >= 21) {
      t1 = "Good / Well-Conditioned (21 – 30 bpm)";
      c1 = "text-emerald-500 border-emerald-500/30";
      verdict = "Above-average cardiovascular conditioning. Heart rate drops swiftly during the primary recovery phase.";
    }

    let t2 = "Normal (23 – 40 bpm)";
    if (d2 <= 22) {
      t2 = "Below Average (≤ 22 bpm)";
    } else if (d2 > 50) {
      t2 = "Elite / Highly Trained (> 50 bpm)";
    } else if (d2 >= 41) {
      t2 = "Good (41 – 50 bpm)";
    }

    return {
      drop1Min: d1,
      drop2Min: d2,
      tier1Min: t1,
      tier2Min: t2,
      color1Min: c1,
      clinicalVerdict: verdict,
    };
  }, [peakHr, oneMinHr, twoMinHr, posture]);

  const handleCopy = async () => {
    const summary = `Heart Rate Recovery (HRR) Clinical Fitness Assessment:\n• Peak Exertion HR: ${peakHr} bpm\n• 1-Minute Recovery: ${oneMinHr} bpm (Drop: -${drop1Min} bpm, Rating: ${tier1Min})\n• 2-Minute Recovery: ${twoMinHr} bpm (Drop: -${drop2Min} bpm, Rating: ${tier2Min})\n• Posture: ${posture.toUpperCase()}\n• Clinical Cardiology Assessment: ${clinicalVerdict}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Peak Exercise HR (bpm)
          </label>
          <input
            type="number"
            min={90}
            max={230}
            value={peakHr}
            onChange={(e) => setPeakHr(Math.max(50, parseInt(e.target.value) || 50))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
          <span className="text-[10px] text-muted-foreground">Immediate end of workout</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            1-Min Post-Exercise (bpm)
          </label>
          <input
            type="number"
            min={40}
            max={200}
            value={oneMinHr}
            onChange={(e) => setOneMinHr(Math.max(30, parseInt(e.target.value) || 30))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Measured at exactly 60s rest</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            2-Min Post-Exercise (bpm)
          </label>
          <input
            type="number"
            min={40}
            max={200}
            value={twoMinHr}
            onChange={(e) => setTwoMinHr(Math.max(30, parseInt(e.target.value) || 30))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Measured at exactly 120s rest</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Recovery Posture
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPosture("standing")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                posture === "standing" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              Standing
            </button>
            <button
              onClick={() => setPosture("seated")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                posture === "seated" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              Seated
            </button>
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            Heart Rate Recovery (HRR) Clinical Diagnostics
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              1-Minute HR Drop
            </span>
            <p className="text-3xl font-extrabold text-foreground">-{drop1Min} bpm</p>
            <span className="text-[10px] text-muted-foreground font-sans">Primary clinical marker</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              1-Minute Fitness Tier
            </span>
            <p className="text-base font-bold text-foreground font-sans">{tier1Min}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Cole et al. NEJM standards</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              2-Minute HR Drop
            </span>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">-{drop2Min} bpm</p>
            <span className="text-[10px] text-muted-foreground font-sans">Secondary baseline marker</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              2-Minute Rating
            </span>
            <p className="text-base font-bold text-foreground font-sans">{tier2Min}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Sustained parasympathetic tone</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Cardiology Assessment: </strong>
          {clinicalVerdict}
        </div>
      </div>
    </div>
  );
}
