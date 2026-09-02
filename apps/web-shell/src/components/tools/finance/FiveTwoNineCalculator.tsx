"use client";

import { useState, useMemo } from "react";
import { GraduationCap, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Award } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function FiveTwoNineCalculator() {
  const [childAge, setChildAge] = useState<number>(3);
  const [collegeAge, setCollegeAge] = useState<number>(18);
  const [currentBalance, setCurrentBalance] = useState<number>(8000);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(450);
  const [annualReturn, setAnnualReturn] = useState<number>(7.0);
  const [expectedTuition, setExpectedTuition] = useState<number>(135000); // 4-year public/private estimate
  const [copied, setCopied] = useState<boolean>(false);

  const { finalBalance, totalDeposited, compoundEarnings, coveragePct, years } = useMemo(() => {
    const y = Math.max(1, collegeAge - childAge);
    const months = y * 12;
    const monthlyRate = annualReturn / 100 / 12;

    let balance = currentBalance;
    let deposits = 0;

    for (let m = 1; m <= months; m++) {
      balance = (balance + monthlyDeposit) * (1 + monthlyRate);
      deposits += monthlyDeposit;
    }

    const earnings = Math.max(0, balance - currentBalance - deposits);
    const cov = expectedTuition > 0 ? (balance / expectedTuition) * 100 : 0;

    return {
      finalBalance: Math.round(balance),
      totalDeposited: Math.round(deposits + currentBalance),
      compoundEarnings: Math.round(earnings),
      coveragePct: cov.toFixed(1),
      years: y,
    };
  }, [childAge, collegeAge, currentBalance, monthlyDeposit, annualReturn, expectedTuition]);

  const handleCopy = async () => {
    const summary = `529 College Savings Projection (${years} Years to College):\n• Projected 529 Fund Value: $${finalBalance.toLocaleString()}\n• Your Total Deposits: $${totalDeposited.toLocaleString()}\n• Tax-Free Compound Growth: +$${compoundEarnings.toLocaleString()}\n• Projected 4-Year Tuition Covered: ${coveragePct}%\n• Target 4-Year University Cost: $${expectedTuition.toLocaleString()}`;
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
            Child Age / College Age
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              max={17}
              value={childAge}
              onChange={(e) => setChildAge(parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
            />
            <input
              type="number"
              min={childAge + 1}
              max={25}
              value={collegeAge}
              onChange={(e) => setCollegeAge(parseInt(e.target.value) || 18)}
              className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{years} compounding years</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current 529 Balance ($)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={currentBalance}
            onChange={(e) => setCurrentBalance(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly Contribution ($)
          </label>
          <input
            type="number"
            min={25}
            step={25}
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            4-Year College Cost ($)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={expectedTuition}
            onChange={(e) => setExpectedTuition(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Tuition, room &amp; board</span>
        </div>
      </div>

      {/* Projection Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            529 Fund Growth &amp; College Readiness at Age {collegeAge}
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
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Projected 529 Fund</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${finalBalance.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">100% Tax-free college money</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Tuition Covered</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{coveragePct}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Of ${expectedTuition.toLocaleString()} goal</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Your Deposits</span>
            <p className="text-2xl font-bold text-foreground">${totalDeposited.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Principal invested</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Compound Growth</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              +${compoundEarnings.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Tax-free investment returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
