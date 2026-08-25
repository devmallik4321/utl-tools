"use client";

import { useState } from "react";
import { Calendar, Cake, Clock, Sparkles } from "lucide-react";

export function AgeCalculator() {
  const [birthDate, setBirthDate] = useState<string>("1995-06-15");
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const calculateAge = () => {
    const start = new Date(birthDate);
    const end = new Date(targetDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return null;
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDiffMs = end.getTime() - start.getTime();
    const totalDays = Math.floor(totalDiffMs / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    // Day of the week born
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bornDay = daysOfWeek[start.getDay()];

    // Next Birthday
    const nextBday = new Date(end.getFullYear(), start.getMonth(), start.getDate());
    if (nextBday < end) {
      nextBday.setFullYear(end.getFullYear() + 1);
    }
    const daysToNextBday = Math.ceil((nextBday.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      bornDay,
      daysToNextBday,
    };
  };

  const ageData = calculateAge();

  return (
    <div className="space-y-6">
      {/* Date Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-card border border-border rounded-xl">
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Date of Birth
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Calculate Age As Of (Target Date)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Main Age Card */}
      {ageData ? (
        <div className="space-y-6">
          <div className="p-8 bg-card border border-border rounded-xl text-center space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Exact Chronological Age
            </span>
            <div className="flex flex-wrap items-baseline justify-center gap-2 sm:gap-4 font-mono font-black text-foreground">
              <span className="text-4xl sm:text-6xl text-blue-600 dark:text-blue-400">{ageData.years}</span>
              <span className="text-sm sm:text-lg text-muted-foreground font-sans">years</span>
              <span className="text-3xl sm:text-5xl">{ageData.months}</span>
              <span className="text-sm sm:text-lg text-muted-foreground font-sans">months</span>
              <span className="text-3xl sm:text-5xl">{ageData.days}</span>
              <span className="text-sm sm:text-lg text-muted-foreground font-sans">days</span>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <span className="px-3 py-1 bg-muted rounded-full">
                Born on a <strong>{ageData.bornDay}</strong>
              </span>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full font-medium">
                🎂 Next Birthday in <strong>{ageData.daysToNextBday} days</strong>
              </span>
            </div>
          </div>

          {/* Granular Total Units Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Days Lived
              </span>
              <p className="text-xl font-bold font-mono text-foreground">
                {ageData.totalDays.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Hours
              </span>
              <p className="text-xl font-bold font-mono text-foreground">
                {ageData.totalHours.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Minutes
              </span>
              <p className="text-xl font-bold font-mono text-foreground">
                {ageData.totalMinutes.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Seconds
              </span>
              <p className="text-xl font-bold font-mono text-foreground">
                {ageData.totalSeconds.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs">
          Please select a valid birth date in the past.
        </div>
      )}
    </div>
  );
}
