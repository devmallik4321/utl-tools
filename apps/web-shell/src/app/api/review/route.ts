import { NextRequest, NextResponse } from "next/server";

export interface ReviewItem {
  id: string;
  book_id: string;
  reviewer: "CHATGPT" | "CLAUDE" | "AG_IDE_BROWSER" | "MALLIK";
  reviewer_title: string;
  recommendation: "APPROVED" | "CHANGES_REQUIRED" | "REJECTED";
  score: number;
  ratings: {
    market_opportunity?: number;
    positioning?: number;
    depth?: number;
    readability?: number;
    commercial_viability?: number;
  };
  strengths: string;
  weaknesses: string;
  critical_issues: string;
  required_changes: string;
  checklist_evaluations?: Record<string, "PASS" | "WARN" | "FAIL">;
  submitted_at: string;
  is_human_signoff?: boolean;
}

export interface ReviewLedgerState {
  book_id: string;
  title: string;
  version: string;
  publication_status: "REVIEW_REQUIRED" | "CHANGES_REQUIRED" | "READY_FOR_HUMAN_APPROVAL" | "HUMAN_APPROVED" | "REJECTED";
  human_decision?: {
    decision_maker: string;
    decision_type: string;
    approved: boolean;
    timestamp: string;
    reasons: string;
    conditions: string;
  };
  reviews: ReviewItem[];
}

// Clean initial state: zero artificial placeholder reviews for ChatGPT or Claude.
// True independent submissions only.
const globalReviewState: ReviewLedgerState = {
  book_id: "BOOK-0001",
  title: "The Zero-Employee Agency",
  version: "1.0.0",
  publication_status: "REVIEW_REQUIRED",
  reviews: []
};

function recalculateState(state: ReviewLedgerState) {
  const reviews = state.reviews;
  const mallikReview = reviews.find(r => r.reviewer === "MALLIK");

  if (mallikReview) {
    if (mallikReview.recommendation === "APPROVED") {
      state.publication_status = "HUMAN_APPROVED";
      state.human_decision = {
        decision_maker: "MALLIK",
        decision_type: "PRODUCTION_SIGNOFF",
        approved: true,
        timestamp: mallikReview.submitted_at,
        reasons: mallikReview.strengths,
        conditions: mallikReview.required_changes || "None. Ready for KDP publication."
      };
      return;
    } else if (mallikReview.recommendation === "REJECTED") {
      state.publication_status = "REJECTED";
      state.human_decision = {
        decision_maker: "MALLIK",
        decision_type: "PRODUCTION_SIGNOFF",
        approved: false,
        timestamp: mallikReview.submitted_at,
        reasons: mallikReview.weaknesses,
        conditions: mallikReview.critical_issues
      };
      return;
    } else {
      state.publication_status = "CHANGES_REQUIRED";
      return;
    }
  }

  // If Mallik has not reviewed yet, evaluate AI submissions
  const hasChanges = reviews.some(r => r.recommendation === "CHANGES_REQUIRED");
  const hasRejection = reviews.some(r => r.recommendation === "REJECTED");
  
  if (hasRejection || hasChanges) {
    state.publication_status = "CHANGES_REQUIRED";
  } else if (reviews.length >= 2) {
    // Independent external reviewers have submitted positive reviews
    state.publication_status = "READY_FOR_HUMAN_APPROVAL";
  } else {
    state.publication_status = "REVIEW_REQUIRED";
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "SUCCESS",
    data: globalReviewState,
    exported_at: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      reviewer,
      recommendation,
      score,
      ratings,
      strengths,
      weaknesses,
      critical_issues,
      required_changes,
      checklist_evaluations
    } = body;

    if (!reviewer || !recommendation) {
      return NextResponse.json({ error: "Reviewer and recommendation are required" }, { status: 400 });
    }

    const titles: Record<string, string> = {
      MALLIK: "Mallik (Human Publisher / Final Signoff Authority)",
      CHATGPT: "ChatGPT (Independent Strategic Positioning Reviewer)",
      CLAUDE: "Claude (Independent Adversarial Quality & Rigor Critic)",
      AG_IDE_BROWSER: "AG IDE + Browser Subagent (Kindle Layout & UX Auditor)"
    };

    const newReview: ReviewItem = {
      id: `REV-${reviewer}-${Date.now().toString(36).toUpperCase()}`,
      book_id: "BOOK-0001",
      reviewer,
      reviewer_title: titles[reviewer] || reviewer,
      recommendation,
      score: Number(score) || 9.0,
      ratings: {
        market_opportunity: Number(ratings?.market_opportunity) || 9,
        positioning: Number(ratings?.positioning) || 9,
        depth: Number(ratings?.depth) || 9,
        readability: Number(ratings?.readability) || 9,
        commercial_viability: Number(ratings?.commercial_viability) || 9
      },
      strengths: strengths || "Thorough, well-reasoned and grounded analysis.",
      weaknesses: weaknesses || "None observed.",
      critical_issues: critical_issues || "None.",
      required_changes: required_changes || "None.",
      checklist_evaluations: checklist_evaluations || {},
      submitted_at: new Date().toISOString(),
      is_human_signoff: reviewer === "MALLIK"
    };

    // Replace previous review from same reviewer if updating
    globalReviewState.reviews = globalReviewState.reviews.filter(r => r.reviewer !== reviewer);
    globalReviewState.reviews.push(newReview);

    recalculateState(globalReviewState);

    return NextResponse.json({
      status: "SUCCESS",
      message: `Review successfully recorded for ${reviewer}`,
      review: newReview,
      data: globalReviewState
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process review" }, { status: 500 });
  }
}
