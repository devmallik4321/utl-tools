"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { trackUtilityFeedback } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface UtilityFeedbackProps {
  utilityId: string;
  utilityName?: string;
  className?: string;
}

export function UtilityFeedback({ utilityId, utilityName, className }: UtilityFeedbackProps) {
  const [feedbackState, setFeedbackState] = useState<"idle" | "positive" | "negative_reasons" | "submitted">("idle");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const reasons = [
    "Inaccurate result",
    "Missing option",
    "Hard to understand",
    "Other",
  ];

  const handlePositive = () => {
    trackUtilityFeedback(utilityId, true);
    setFeedbackState("submitted");
  };

  const handleNegativeClick = () => {
    setFeedbackState("negative_reasons");
  };

  const handleReasonSubmit = (reason: string) => {
    setSelectedReason(reason);
    trackUtilityFeedback(utilityId, false, reason);
    setFeedbackState("submitted");
  };

  if (feedbackState === "submitted") {
    return (
      <div className={cn("flex items-center justify-center gap-2 p-3 bg-muted/30 border border-border rounded-xl text-xs text-muted-foreground", className)}>
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span>Thank you for your feedback! This helps us refine {utilityName || "this utility"}.</span>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-muted/20 border border-border rounded-xl space-y-3", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          Was this calculation helpful?
        </span>

        {feedbackState === "idle" && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePositive}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card hover:bg-muted border border-border text-foreground transition-colors"
              aria-label="Helpful"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Yes</span>
            </button>
            <button
              onClick={handleNegativeClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card hover:bg-muted border border-border text-foreground transition-colors"
              aria-label="Not Helpful"
            >
              <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
              <span>No</span>
            </button>
          </div>
        )}
      </div>

      {feedbackState === "negative_reasons" && (
        <div className="space-y-2 pt-2 border-t border-border/60">
          <p className="text-[11px] text-muted-foreground">
            How could this result be improved? (Anonymous)
          </p>
          <div className="flex flex-wrap gap-2">
            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => handleReasonSubmit(r)}
                className="px-2.5 py-1 text-xs rounded-md bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
