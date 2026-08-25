"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, Volume2, Bell, BellOff, Plus, Trash2, CheckCircle2, AlertCircle, Play, Pause, Sparkles } from "lucide-react";

interface AlarmItem {
  id: string;
  time: string; // "HH:MM" 24h format
  label: string;
  enabled: boolean;
  recurring: boolean;
  spoken: boolean;
}

export function TalkingAlarmClock() {
  const [time, setTime] = useState<Date | null>(null);
  const [use24Hour, setUse24Hour] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Alarms
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: "1", time: "08:00", label: "Morning Wake Up", enabled: false, recurring: true, spoken: true },
    { id: "2", time: "12:30", label: "Lunch Break", enabled: false, recurring: false, spoken: true },
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState<string>("07:30");
  const [newAlarmLabel, setNewAlarmLabel] = useState<string>("New Alarm");
  const [newAlarmSpoken, setNewAlarmSpoken] = useState<boolean>(true);
  const [newAlarmRecurring, setNewAlarmRecurring] = useState<boolean>(true);
  const [activeTrigger, setActiveTrigger] = useState<AlarmItem | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);

    // Check Speech Synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true);
    }

    // Check Notification Permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => clearInterval(interval);
  }, []);

  // Web Audio Beeper fallback
  const playBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  // Speak time / announcement
  const speakText = (text: string) => {
    if (!speechSupported || typeof window === "undefined") {
      playBeep();
      return;
    }

    window.speechSynthesis.cancel(); // Clear any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      playBeep();
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakCurrentTime = () => {
    if (!time) return;
    const hours = time.getHours();
    const minutes = time.getMinutes();

    let text = "";
    if (use24Hour) {
      text = `The current time is ${hours} hours and ${minutes} minutes.`;
    } else {
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      const minStr = minutes === 0 ? "o'clock" : minutes < 10 ? `oh ${minutes}` : `${minutes}`;
      text = `The time is ${h12} ${minStr} ${ampm}.`;
    }

    speakText(text);
  };

  // Request Notification
  const requestNotification = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    }
  };

  // Check active alarms every second
  useEffect(() => {
    if (!time) return;
    const currentH = String(time.getHours()).padStart(2, "0");
    const currentM = String(time.getMinutes()).padStart(2, "0");
    const currentS = time.getSeconds();
    const currentFormatted = `${currentH}:${currentM}`;

    // Trigger on 0 seconds of the minute
    if (currentS === 0) {
      alarms.forEach((alarm) => {
        if (alarm.enabled && alarm.time === currentFormatted) {
          setActiveTrigger(alarm);

          // Audio and voice
          if (alarm.spoken) {
            speakText(`Alarm alert: ${alarm.label}. It is now ${alarm.time}.`);
          } else {
            playBeep();
          }

          // Browser Notification
          if (notificationPermission === "granted") {
            try {
              new Notification(`Alarm: ${alarm.label}`, {
                body: `It is now ${alarm.time}.`,
                icon: "/favicon.ico",
              });
            } catch {}
          }

          // If not recurring, disable it
          if (!alarm.recurring) {
            setAlarms((prev) =>
              prev.map((a) => (a.id === alarm.id ? { ...a, enabled: false } : a))
            );
          }
        }
      });
    }
  }, [time]);

  const addAlarm = () => {
    if (!newAlarmTime) return;
    const newEntry: AlarmItem = {
      id: Date.now().toString(),
      time: newAlarmTime,
      label: newAlarmLabel || "Alarm",
      enabled: true,
      recurring: newAlarmRecurring,
      spoken: newAlarmSpoken,
    };
    setAlarms([...alarms, newEntry]);
    setNewAlarmLabel("Alarm");
  };

  const toggleAlarm = (id: string) => {
    setAlarms(
      alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter((a) => a.id !== id));
  };

  // Format digital clock
  const getFormattedTime = () => {
    if (!time) return { hours: "--", minutes: "--", seconds: "--", ampm: "" };
    let h = time.getHours();
    const m = String(time.getMinutes()).padStart(2, "0");
    const s = String(time.getSeconds()).padStart(2, "0");
    let ampm = "";

    if (!use24Hour) {
      ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
    }

    return {
      hours: String(h).padStart(2, "0"),
      minutes: m,
      seconds: s,
      ampm,
    };
  };

  const clock = getFormattedTime();

  return (
    <div className="space-y-6">
      {/* Primary Big Clock Canvas */}
      <div className="p-8 sm:p-12 bg-card border border-border rounded-2xl text-center space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Live Digital Clock</span>
          </div>

          <div className="flex gap-1.5 p-1 bg-muted rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setUse24Hour(false)}
              className={`px-2.5 py-1 rounded transition-colors ${
                !use24Hour ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
            >
              12H (AM/PM)
            </button>
            <button
              type="button"
              onClick={() => setUse24Hour(true)}
              className={`px-2.5 py-1 rounded transition-colors ${
                use24Hour ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
            >
              24H (Military)
            </button>
          </div>
        </div>

        {/* Big Time Display */}
        <div className="flex items-baseline justify-center gap-2 sm:gap-4 select-none font-mono">
          <div className="text-5xl sm:text-7xl md:text-8xl font-black text-foreground tracking-tight">
            {clock.hours}:{clock.minutes}
          </div>
          <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">
            :{clock.seconds}
          </div>
          {clock.ampm && (
            <div className="text-lg sm:text-2xl font-bold text-muted-foreground ml-1">
              {clock.ampm}
            </div>
          )}
        </div>

        {/* Date & Spoken Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <span className="text-sm font-medium text-muted-foreground">
            {time ? time.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : ""}
          </span>

          <button
            type="button"
            onClick={speakCurrentTime}
            disabled={isSpeaking}
            className="px-6 py-3 bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-pulse" : ""}`} />
            <span>{isSpeaking ? "Speaking Time..." : "Speak Current Time"}</span>
          </button>
        </div>
      </div>

      {/* Alarm Banner if Triggered */}
      {activeTrigger && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-600 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-amber-600 animate-spin" />
            <div>
              <h4 className="font-bold text-sm text-foreground">Alarm Ringing: {activeTrigger.label}</h4>
              <p className="text-xs text-muted-foreground">Scheduled for {activeTrigger.time}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTrigger(null)}
            className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90"
          >
            Dismiss Alarm
          </button>
        </div>
      )}

      {/* Alarm Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Create New Alarm */}
        <div className="md:col-span-5 p-6 bg-card border border-border rounded-xl space-y-4">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            Set New Alarm
          </span>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Alarm Time (24h)</label>
              <input
                type="time"
                value={newAlarmTime}
                onChange={(e) => setNewAlarmTime(e.target.value)}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Alarm Label</label>
              <input
                type="text"
                value={newAlarmLabel}
                onChange={(e) => setNewAlarmLabel(e.target.value)}
                placeholder="e.g. Daily Standup, Workout"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newAlarmSpoken}
                  onChange={(e) => setNewAlarmSpoken(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Voice announcement (Speaks label &amp; time)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newAlarmRecurring}
                  onChange={(e) => setNewAlarmRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Repeat daily at this time</span>
              </label>
            </div>

            <button
              type="button"
              onClick={addAlarm}
              className="w-full py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Alarm</span>
            </button>
          </div>
        </div>

        {/* Active Alarms List */}
        <div className="md:col-span-7 p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-500" />
              Your Configured Alarms ({alarms.length})
            </span>

            {notificationPermission !== "granted" && (
              <button
                type="button"
                onClick={requestNotification}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Enable Notifications
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {alarms.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No alarms currently set. Use the panel on the left to set your first alarm.
              </p>
            ) : (
              alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    alarm.enabled
                      ? "bg-card border-border shadow-xs"
                      : "bg-muted/30 border-border/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleAlarm(alarm.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        alarm.enabled
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                      title={alarm.enabled ? "Disable Alarm" : "Enable Alarm"}
                    >
                      {alarm.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-foreground">{alarm.time}</span>
                        {alarm.spoken && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                            Voice
                          </span>
                        )}
                        {alarm.recurring && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                            Daily
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{alarm.label}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteAlarm(alarm.id)}
                    className="p-1.5 text-muted-foreground hover:text-rose-600 transition-colors"
                    title="Delete Alarm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
