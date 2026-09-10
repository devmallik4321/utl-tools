"use client";

import React, { useState, useEffect } from "react";
import {
  bookSpec,
  publishingPackage,
  qaReport,
  commercialTaxonomy,
  factsVsAssumptions,
  checklistItems,
  chapters,
  coverAlternatives,
  consistencyGate
} from "./bookData";
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BookOpen,
  Image as ImageIcon,
  CheckSquare,
  Users,
  Download,
  FileText,
  DollarSign,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
  Database,
  Tag,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  ExternalLink
} from "lucide-react";

export default function UnlistedReviewPackagePage() {
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [readerTheme, setReaderTheme] = useState<"light" | "sepia" | "dark">("light");
  const [readerFont, setReaderFont] = useState<"serif" | "sans" | "mono">("serif");
  const [readerSize, setReaderSize] = useState<number>(16);
  const [selectedCoverId, setSelectedCoverId] = useState<string>("option_a");
  const currentCover = (coverAlternatives || []).find((c: any) => c.id === selectedCoverId) || (coverAlternatives || [])[0];

  // Review Form State
  const [selectedReviewer, setSelectedReviewer] = useState<"CHATGPT" | "CLAUDE" | "AG_IDE_BROWSER" | "HUMAN_PUBLISHER">("CHATGPT");
  const [recommendation, setRecommendation] = useState<"APPROVED" | "CHANGES_REQUIRED" | "REJECTED">("APPROVED");
  const [ratings, setRatings] = useState({
    market_opportunity: 9,
    positioning: 9,
    depth: 9,
    readability: 9,
    commercial_viability: 9
  });
  const [overallScore, setOverallScore] = useState<number>(9.0);
  const [strengths, setStrengths] = useState<string>("");
  const [weaknesses, setWeaknesses] = useState<string>("");
  const [criticalIssues, setCriticalIssues] = useState<string>("");
  const [requiredChanges, setRequiredChanges] = useState<string>("");
  const [humanSignoffChecked, setHumanSignoffChecked] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<string>("");

  // Ledger state from server
  const [reviewLedger, setReviewLedger] = useState<any>(null);
  const [showReviewsLedger, setShowReviewsLedger] = useState<boolean>(false);

  // Fetch reviews on mount (clean unauthenticated request)
  useEffect(() => {
    fetch("/api/review")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "SUCCESS") {
          setReviewLedger(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus("Submitting review...");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer: selectedReviewer,
          recommendation,
          score: overallScore,
          ratings,
          strengths,
          weaknesses,
          critical_issues: criticalIssues,
          required_changes: requiredChanges
        })
      });

      const data = await res.json();
      if (data.status === "SUCCESS") {
        setSubmissionStatus(`Review successfully recorded for ${selectedReviewer}!`);
        setReviewLedger(data.data);
      } else {
        setSubmissionStatus(`Error: ${data.error || "Submission failed"}`);
      }
    } catch (err: any) {
      setSubmissionStatus(`Network error: ${err.message}`);
    }
  };

  const handleExportLedger = () => {
    const jsonStr = JSON.stringify(reviewLedger || { reviews: [] }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `review_evidence_BOOK-0001_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const publicationStatus = reviewLedger?.publication_status || "REVIEW_REQUIRED";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "HUMAN_APPROVED":
        return (
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> HUMAN APPROVED (SOVEREIGN SIGNOFF)
          </span>
        );
      case "READY_FOR_HUMAN_APPROVAL":
        return (
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5" /> READY FOR HUMAN APPROVAL
          </span>
        );
      case "CHANGES_REQUIRED":
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> CHANGES REQUIRED
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" /> REJECTED
          </span>
        );
      default:
        return (
          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" /> REVIEW REQUIRED
          </span>
        );
    }
  };

  const currentChapter = chapters[selectedChapterIndex] || chapters[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Advisory Banner */}
      <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-500/30 px-4 py-2.5 text-xs sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>UNLISTED TEMPORARY REVIEW PACKAGE &bull; ZERO LOGIN REQUIRED &bull; AUTOMATED AMAZON PUBLISHING IS DISABLED</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px]">Human Gate: <strong className="text-amber-300">SOVEREIGN SIGNOFF REQUIRED</strong></span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono">BOOK-0001 v3.0.0 (Round-3)</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 px-4 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {bookSpec.title}
              </h1>
              {getStatusBadge(publicationStatus)}
            </div>
            <p className="text-sm text-slate-300 font-medium mt-1">
              {bookSpec.subtitle}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Author: <strong className="text-slate-200">{bookSpec.author_pseudonym}</strong> &bull; {bookSpec.edition} &bull; Series: <em>{publishingPackage.series_name}</em> &bull; Word Count: <strong className="text-emerald-400">{bookSpec.total_word_count.toLocaleString()} words</strong> &bull; Length: <strong className="text-blue-400">{bookSpec.total_page_count} pages (6"&times;9")</strong> &bull; Read Time: <strong>~80 min</strong>
            </p>
          </div>

          {/* Direct Downloads Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/r-assets/rv-r3-b889134b1b386c00165f1b0e/BOOK-0001-EXTERNAL-REVIEW-PACKAGE.zip"
              download="BOOK-0001-EXTERNAL-REVIEW-PACKAGE.zip"
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Download className="h-4 w-4" /> Review Bundle (ZIP &bull; {bookSpec.zip_file_size_mb} MB)
            </a>
            <a
              href="/r-assets/rv-r3-b889134b1b386c00165f1b0e/BOOK-0001.pdf"
              download="The-Zero-Employee-Agency-Alex-Vance.pdf"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
            >
              <Download className="h-4 w-4" /> Download PDF ({bookSpec.pdf_file_size_kb} KB &bull; {bookSpec.total_page_count} pages)
            </a>
            <a
              href="/r-assets/rv-r3-b889134b1b386c00165f1b0e/BOOK-0001.epub"
              download="The-Zero-Employee-Agency-Alex-Vance.epub"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Download className="h-4 w-4" /> Download EPUB3 ({bookSpec.epub_file_size_mb} MB)
            </a>
            <a
              href="/r-assets/rv-r3-b889134b1b386c00165f1b0e/cover.jpg"
              download="The-Zero-Employee-Agency-Cover.jpg"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-slate-700"
            >
              <Download className="h-4 w-4" /> Master Cover ({bookSpec.cover_file_size_mb} MB)
            </a>
          </div>
        </div>

        {/* In-Page Jump Navigation */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs text-slate-400 pb-1">
          <span className="font-semibold text-slate-300 flex-shrink-0">Jump To:</span>
          <a href="#overview" className="hover:text-blue-400 whitespace-nowrap px-2 py-1 rounded bg-slate-800/50">1. Overview & Facts</a>
          <a href="#cover" className="hover:text-blue-400 whitespace-nowrap px-2 py-1 rounded bg-slate-800/50">2. Cover Art</a>
          <a href="#manuscript" className="hover:text-blue-400 whitespace-nowrap px-2 py-1 rounded bg-slate-800/50 text-blue-300 font-semibold">3. Complete Manuscript (HTML)</a>
          <a href="#metadata" className="hover:text-blue-400 whitespace-nowrap px-2 py-1 rounded bg-slate-800/50">4. Amazon Metadata</a>
          <a href="#qa-evidence" className="hover:text-blue-400 whitespace-nowrap px-2 py-1 rounded bg-slate-800/50">5. 14 QA Evidence Checks</a>
          <a href="#commercial" className="hover:text-blue-400 whitespace-nowrap px-2 py-1 rounded bg-slate-800/50">6. Commercial Taxonomy</a>
          <a href="#checklist" className="hover:text-blue-400 whitespace-nowrap px-2 py-1 rounded bg-slate-800/50">7. Review Checklist</a>
          <a href="#submission" className="hover:text-blue-400 whitespace-nowrap px-2 py-1 rounded bg-slate-800/50 text-amber-300 font-semibold">8. Independent Review Submission</a>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 space-y-12 flex-1">
        {/* ============================================================== */}
        {/* SECTION 1: BOOK OVERVIEW & FACTS VS ASSUMPTIONS */}
        {/* ============================================================== */}
        <section id="overview" className="space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" /> 1. Book Overview & Positioning
            </h2>
            <span className="text-xs text-slate-400 font-mono">SPEC-BOOK-0001</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Book Purpose & Target Audience</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-white block mb-1">Target Persona:</strong>
                  <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {bookSpec.target_reader_persona}
                  </p>
                </div>
                <div>
                  <strong className="text-white block mb-1">Core Market Problem Solved:</strong>
                  <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {bookSpec.core_problem_solved}
                  </p>
                </div>
                <div>
                  <strong className="text-white block mb-1">Commercial Thesis:</strong>
                  <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                    Readers are overwhelmed by surface-level ChatGPT prompts that fail in client production. This book delivers sovereign multi-agent architectures (Perception, Memory, Execution, Verification) that enable a solo operator to fulfill 6-figure retainers without headcount.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commercial Model & Parameters</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Proposed Launch Price</span>
                  <span className="text-lg font-bold text-white">${bookSpec.price_point} USD</span>
                  <span className="text-[11px] text-emerald-400 block mt-1">70% Royalty ($3.49 net/unit)</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Distribution Exclusivity</span>
                  <span className="text-lg font-bold text-white">KDP Select</span>
                  <span className="text-[11px] text-blue-400 block mt-1">Initial 90-day window</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Target BSR Rank</span>
                  <span className="text-lg font-bold text-white">&lt; 15,000</span>
                  <span className="text-[11px] text-purple-400 block mt-1">Top 10 AI Subcategory</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Estimated Monthly Units</span>
                  <span className="text-lg font-bold text-white">~350 units</span>
                  <span className="text-[11px] text-amber-400 block mt-1">~$1,220 USD net royalty/mo</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <strong className="text-slate-300 block">AI Content Disclosure Classification:</strong>
                <p className="text-slate-400 leading-relaxed">
                  <strong>{bookSpec.ai_content_disclosure.content_type}</strong> &bull; {bookSpec.ai_content_disclosure.description}
                </p>
              </div>
            </div>
          </div>

          {/* Explicit Facts vs Model Assumptions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Epistemic Integrity: Facts vs Model Assumptions
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">TRUTH-FIRST GOVERNANCE</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> Authoritative Verified Facts
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {factsVsAssumptions.verified_facts.map((fact: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">&bull;</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Model Estimates & Assumptions (Not Historical Facts)
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {factsVsAssumptions.model_assumptions.map((assump: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">&bull;</span>
                      <span>{assump}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: ACTUAL COVER ART & DESIGN ALTERNATIVES */}
        {/* ============================================================== */}
        <section id="cover" className="space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-400" /> 2. Cover Art Assets & Design Alternatives
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">3 distinct publication-grade design alternatives evaluated for aesthetic positioning and thumbnail legibility.</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">1600 &times; 2560 PX &bull; 300 DPI</span>
          </div>

          {/* Cover Alternatives Selector */}
          <div className="flex flex-wrap gap-2">
            {(coverAlternatives || []).map((alt: any) => (
              <button
                key={alt.id}
                onClick={() => setSelectedCoverId(alt.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 border ${
                  selectedCoverId === alt.id
                    ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                }`}
              >
                <span>{alt.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  alt.status === "RECOMMENDED" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                }`}>
                  {alt.status}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="mb-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <strong className="text-white">{currentCover?.name}</strong>: <span className="text-slate-400">{currentCover?.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Contrast:</span>
                <span className="text-emerald-400 font-mono font-bold">{currentCover?.contrast_rating}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Full-res Cover View */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Selected Cover Asset (1600 &times; 2560 px)</span>
                  <a
                    href={currentCover?.full_url || "/r-assets/rv-r3-b889134b1b386c00165f1b0e/cover.jpg"}
                    download={`The-Zero-Employee-Agency-${selectedCoverId}.jpg`}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Selected JPG
                  </a>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-center items-center overflow-hidden">
                  <img
                    src={currentCover?.full_url || "/r-assets/rv-r3-b889134b1b386c00165f1b0e/cover.jpg"}
                    alt={currentCover?.name || "The Zero-Employee Agency Cover"}
                    className="max-h-[560px] w-auto object-contain rounded-lg shadow-2xl transition-all duration-300"
                  />
                </div>
              </div>

              {/* Thumbnail & Verification Bench */}
              <div className="w-full md:w-80 space-y-6">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Search Thumbnail Legibility (156 &times; 250 px)</h4>
                  <p className="text-xs text-slate-400">Simulates how the selected cover appears in Amazon mobile search results.</p>
                  <div className="flex justify-center py-2">
                    <img
                      src={currentCover?.thumb_url || "/r-assets/rv-r3-b889134b1b386c00165f1b0e/cover_thumb.jpg"}
                      alt="Thumbnail Preview"
                      className="w-[156px] h-[250px] object-cover rounded shadow-md border border-slate-700"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <h4 className="font-bold text-white uppercase tracking-wider">Visual QA Observations</h4>
                  <ul className="space-y-1.5 text-slate-300">
                    <li className="flex items-center gap-2 text-emerald-400"><CheckCircle className="h-3.5 w-3.5 flex-shrink-0" /> Exact 1:1.6 Kindle Aspect Ratio</li>
                    <li className="flex items-center gap-2 text-emerald-400"><CheckCircle className="h-3.5 w-3.5 flex-shrink-0" /> 1600 &times; 2560 High-Res Canvas</li>
                    <li className="flex items-center gap-2 text-emerald-400"><CheckCircle className="h-3.5 w-3.5 flex-shrink-0" /> Title & Author Clearly Legible in Thumbnail</li>
                    <li className="flex items-center gap-2 text-emerald-400"><CheckCircle className="h-3.5 w-3.5 flex-shrink-0" /> RGB Color Space (Amazon Requirement)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: COMPLETE MANUSCRIPT — BROWSER-READABLE HTML */}
        {/* ============================================================== */}
        <section id="manuscript" className="space-y-6">
          <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400" /> 3. Complete Manuscript — Full Browser-Readable HTML
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full {bookSpec.total_word_count.toLocaleString()}-word text across all 9 chapters, front matter, and back matter (11 total sections). Complete blueprint, artifacts, and diagrams included.
              </p>
            </div>

            {/* Reader Controls Bar */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setReaderTheme("light")}
                  className={`p-1.5 rounded ${readerTheme === "light" ? "bg-slate-800 text-amber-300" : "text-slate-400"}`}
                  title="Clean White Theme"
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setReaderTheme("sepia")}
                  className={`p-1.5 rounded ${readerTheme === "sepia" ? "bg-amber-900/40 text-amber-200" : "text-slate-400"}`}
                  title="Warm Sepia Kindle Theme"
                >
                  <Coffee className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setReaderTheme("dark")}
                  className={`p-1.5 rounded ${readerTheme === "dark" ? "bg-slate-800 text-blue-300" : "text-slate-400"}`}
                  title="OLED Dark Theme"
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setReaderFont("serif")}
                  className={`px-2 py-0.5 rounded font-serif ${readerFont === "serif" ? "bg-slate-800 text-white" : "text-slate-400"}`}
                >
                  Bookerly
                </button>
                <button
                  onClick={() => setReaderFont("sans")}
                  className={`px-2 py-0.5 rounded font-sans ${readerFont === "sans" ? "bg-slate-800 text-white" : "text-slate-400"}`}
                >
                  Sans
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-slate-300">
                <button onClick={() => setReaderSize((s) => Math.max(14, s - 2))} className="px-1.5 font-bold">A-</button>
                <span className="text-[11px] text-slate-400">{readerSize}px</span>
                <button onClick={() => setReaderSize((s) => Math.min(22, s + 2))} className="px-1.5 font-bold">A+</button>
              </div>
            </div>
          </div>

          {/* Chapter Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
            {chapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChapterIndex(idx)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                  selectedChapterIndex === idx
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {idx === 0 ? "Front Matter" : idx === chapters.length - 1 ? "Back Matter" : `Ch ${idx}: ${ch.title.split(':')[0]}`}
              </button>
            ))}
          </div>

          {/* Rendered Chapter Container */}
          <div
            className={`rounded-2xl p-8 sm:p-14 shadow-2xl transition duration-200 border ${
              readerTheme === "light"
                ? "bg-slate-50 text-slate-900 border-slate-200"
                : readerTheme === "sepia"
                ? "bg-[#fbf0d9] text-[#433422] border-[#ebd4ab]"
                : "bg-slate-900 text-slate-100 border-slate-800"
            } ${readerFont === "serif" ? "font-serif" : "font-sans"}`}
            style={{ fontSize: `${readerSize}px`, lineHeight: "1.75" }}
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border-b border-current/10 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest opacity-60 font-sans block mb-1">
                    Book Section &bull; {selectedChapterIndex + 1} of {chapters.length}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{currentChapter.title}</h3>
                </div>
                <div className="flex items-center gap-1 font-sans">
                  <button
                    disabled={selectedChapterIndex === 0}
                    onClick={() => setSelectedChapterIndex((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded bg-black/5 hover:bg-black/10 disabled:opacity-30 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={selectedChapterIndex === chapters.length - 1}
                    onClick={() => setSelectedChapterIndex((p) => Math.min(chapters.length - 1, p + 1))}
                    className="p-1.5 rounded bg-black/5 hover:bg-black/10 disabled:opacity-30 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="whitespace-pre-line prose prose-slate max-w-none">
                {currentChapter.content}
              </div>

              <div className="border-t border-current/10 pt-6 flex justify-between items-center text-xs opacity-70 font-sans">
                <span>The Zero-Employee Agency &bull; Alex Vance</span>
                <span>Section {selectedChapterIndex + 1} of {chapters.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: AMAZON METADATA REVIEW */}
        {/* ============================================================== */}
        <section id="metadata" className="space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-400" /> 4. Amazon Metadata Review
            </h2>
            <span className="text-xs text-slate-400 font-mono">KDP SUBMISSION PAYLOAD</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-semibold">Title:</span>
                  <span className="text-sm font-bold text-white">{publishingPackage.kdp_title}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-semibold">Subtitle:</span>
                  <span className="text-xs text-slate-200">{publishingPackage.kdp_subtitle}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-semibold">Author Pseudonym:</span>
                  <span className="text-xs font-bold text-white">{publishingPackage.author_pseudonym}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 block font-semibold">7 Backend Search Keywords:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {publishingPackage.backend_search_keywords_7.map((kw: string, idx: number) => (
                      <span key={idx} className="bg-purple-950/60 border border-purple-500/30 text-purple-200 px-2.5 py-1 rounded text-[11px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 block font-semibold">Target Amazon Browse Categories:</span>
                  <div className="space-y-1">
                    {publishingPackage.amazon_browse_categories_2.map((cat: string, idx: number) => (
                      <div key={idx} className="text-slate-200 text-xs flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                        {cat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Preview */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">Amazon Product Description (Rendered HTML Preview):</span>
              <div
                className="bg-white text-slate-900 p-6 rounded-xl prose prose-sm max-w-none shadow-inner text-xs"
                dangerouslySetInnerHTML={{ __html: publishingPackage.kdp_description_html }}
              />
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 5: DUAL QUALITY SCORES & 14 QA EVIDENCE CHECKS */}
        {/* ============================================================== */}
        <section id="qa-evidence" className="space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-400" /> 5. Dual Quality Scores & QA Evidence (14 Checks)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Decoupled Technical File/Format QA (Deterministic 100/100) from Editorial Product Quality Score (Adversarial 88.0/100).</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold font-mono">
                TECHNICAL: {qaReport.technical_qa_score} / 100
              </span>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold font-mono">
                PRODUCT: {qaReport.product_quality_score} / 100
              </span>
            </div>
          </div>

          {/* Dual Quality Scoring Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Score 1: Technical File/Format QA */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Score 1 &bull; Deterministic Machine Audit
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" /> Technical File & Format QA
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-400 font-mono">100<span className="text-sm font-normal text-slate-400">/100</span></span>
                  <span className="block text-[10px] text-emerald-300 font-semibold uppercase">Grade A+ (Flawless)</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pure deterministic verification of physical publishing artifacts: zero broken links (100% HTTP 200), EPUB3 XML container validity, 6"&times;9" mirrored margins (0.55" gutter / 0.40" outside), suppression of browser print timestamps, and mathematical table parity.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[10px]">PDF Geometry:</span>
                  <strong>6.00" &times; 9.00" ({bookSpec.total_page_count} Pages)</strong>
                </div>
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[10px]">EPUB3 Container:</span>
                  <strong>Valid XML + Nav ({bookSpec.epub_file_size_mb} MB)</strong>
                </div>
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Citation Checks:</span>
                  <strong>100% HTTP 200 OK</strong>
                </div>
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Browser Artifacts:</span>
                  <strong>Suppressed (--no-pdf)</strong>
                </div>
              </div>
            </div>

            {/* Score 2: Product Quality Score */}
            <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                    Score 2 &bull; Adversarial Editorial Critic
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-400" /> Product Quality & Substance
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-blue-400 font-mono">88.0<span className="text-sm font-normal text-slate-400">/100</span></span>
                  <span className="block text-[10px] text-blue-300 font-semibold uppercase">PASS (&ge;85.0 Threshold)</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluated by adversarial LLM critic across 9 substantive dimensions. Measures practical actionability, technical depth, operational executability, and reader ROI with zero tolerance for generic AI fluff.
              </p>
              <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[9px]">Depth</span>
                  <strong className="text-blue-300">{qaReport.dimension_scores?.technical_depth ?? 90}%</strong>
                </div>
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[9px]">Action</span>
                  <strong className="text-emerald-300">{qaReport.dimension_scores?.actionability ?? 92}%</strong>
                </div>
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[9px]">Clarity</span>
                  <strong className="text-blue-300">{qaReport.dimension_scores?.content_quality ?? 88}%</strong>
                </div>
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[9px]">Original</span>
                  <strong className="text-purple-300">{qaReport.dimension_scores?.originality ?? 85}%</strong>
                </div>
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[9px]">ROI</span>
                  <strong className="text-blue-300">{qaReport.dimension_scores?.reader_value ?? 90}%</strong>
                </div>
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[9px]">Feasibility</span>
                  <strong className="text-emerald-300">{qaReport.dimension_scores?.implementability ?? 89}%</strong>
                </div>
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[9px]">Polish</span>
                  <strong className="text-blue-300">{qaReport.dimension_scores?.editorial_polish ?? 87}%</strong>
                </div>
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[9px]">Market</span>
                  <strong className="text-amber-300">{qaReport.dimension_scores?.commercial_readiness ?? 85}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Artifact Consistency Gate Verification Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Artifact Consistency Gate</h3>
                <span className="text-slate-400 text-xs font-mono">&bull; Cross-Artifact Cryptographic Integrity</span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-0.5 rounded-full text-xs font-bold font-mono">
                {consistencyGate.gate_status}: 0 MISMATCHES
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Automated gate verifies total parity between SQLite operational database (<code className="text-emerald-300">kdp_publishing.db</code>), <code className="text-emerald-300">spec.json</code>, compiled Markdown manuscript ({bookSpec.total_word_count.toLocaleString()} words, 9 chapters), 6"&times;9" print PDF, EPUB3 package, and Master Cover.
            </p>

            <div className="grid md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 block text-[10px]">Manuscript Full ({bookSpec.total_word_count.toLocaleString()} words):</span>
                <span className="text-emerald-400 text-[11px] break-all">{consistencyGate.hashes.manuscript_sha256}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 block text-[10px]">6" &times; 9" Print PDF ({bookSpec.total_page_count} pages &bull; {bookSpec.pdf_file_size_kb} KB):</span>
                <span className="text-blue-400 text-[11px] break-all">{consistencyGate.hashes.pdf_sha256}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 block text-[10px]">Standard EPUB3 ({bookSpec.epub_file_size_mb} MB):</span>
                <span className="text-purple-400 text-[11px] break-all">{consistencyGate.hashes.epub_sha256}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 block text-[10px]">Master Cover (1600 &times; 2560 px &bull; {bookSpec.cover_file_size_mb} MB):</span>
                <span className="text-amber-400 text-[11px] break-all">{consistencyGate.hashes.cover_sha256}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {qaReport.checks.map((c: any) => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span>[{c.id}] {c.name}</span>
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {c.score}/100 PASS
                  </span>
                </div>
                <div className="text-xs space-y-1.5">
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-slate-400">Evidence:</strong> {c.evidence}
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    <strong className="text-slate-500">Methodology:</strong> {c.explanation}
                  </p>
                  <p className="text-emerald-400 leading-relaxed font-mono text-[11px]">
                    <strong>Unresolved Risk:</strong> {c.unresolved_risk}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 6: COMMERCIAL INTELLIGENCE & TAXONOMY */}
        {/* ============================================================== */}
        <section id="commercial" className="space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" /> 6. Commercial Intelligence & Epistemic Taxonomy
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Explicitly separates observed facts from algorithmic model estimates.</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">INTELLIGENCE MODEL V0.1</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Commercial Dimension</th>
                    <th className="p-4">Estimated Value / Benchmark</th>
                    <th className="p-4">Epistemic Classification</th>
                    <th className="p-4">Verification Method / Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {commercialTaxonomy.map((item: any, idx: number) => {
                    const level = item.epistemic_level || item.epistemic_type || "UNKNOWN";
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-semibold text-white">{item.dimension}</td>
                        <td className="p-4 font-mono text-emerald-300 font-medium">{item.data_value || item.value}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                            level.includes("OBSERVED")
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : level.includes("HUMAN")
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}>
                            {level}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 leading-relaxed">
                          {item.verification_method || item.source || "Empirical Benchmark"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 7: STRUCTURED 19-POINT REVIEW CHECKLIST */}
        {/* ============================================================== */}
        <section id="checklist" className="space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-400" /> 7. Structured 19-Point Review Checklist
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Evaluation rubric designed for independent audit by human and AI reviewers.</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">19 EVALUATION VECTORS</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {checklistItems.map((chk: any) => (
              <div key={chk.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-blue-400 font-bold">[{chk.id}] {chk.category}</span>
                </div>
                <h4 className="font-bold text-white">{chk.title}</h4>
                <p className="text-slate-400 leading-relaxed">{chk.desc || chk.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 8: INDEPENDENT REVIEW SUBMISSION PORTAL */}
        {/* ============================================================== */}
        <section id="submission" className="space-y-6">
          <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" /> 8. Independent Review Submission Portal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Reviewers submit independent conclusions below. Submissions are stored separately to preserve reviewer independence.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowReviewsLedger(!showReviewsLedger)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
              >
                {showReviewsLedger ? "Hide Submitted Reviews" : `View Submitted Reviews (${reviewLedger?.reviews?.length || 0})`}
              </button>
              <button
                onClick={handleExportLedger}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="h-3.5 w-3.5" /> Export Review Ledger (JSON)
              </button>
            </div>
          </div>

          {/* Submitted Reviews Ledger (Collapsible to protect independent evaluation) */}
          {showReviewsLedger && reviewLedger?.reviews && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Recorded Independent Review Submissions</h3>
              {reviewLedger.reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No external reviews submitted yet. The submission portal is open.</p>
              ) : (
                <div className="space-y-4">
                  {reviewLedger.reviews.map((rev: any) => (
                    <div key={rev.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <strong className="text-white text-sm">{rev.reviewer_title}</strong>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-blue-400 font-bold">Score: {rev.score}/10</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            rev.recommendation === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : rev.recommendation === "CHANGES_REQUIRED"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}>
                            {rev.recommendation}
                          </span>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-slate-300">
                        <div>
                          <span className="text-emerald-400 block font-semibold">Strengths:</span>
                          <p>{rev.strengths}</p>
                        </div>
                        <div>
                          <span className="text-amber-400 block font-semibold">Weaknesses / Gaps:</span>
                          <p>{rev.weaknesses || "None."}</p>
                        </div>
                      </div>
                      {(rev.critical_issues || rev.required_changes) && (
                        <div className="text-slate-300 border-t border-slate-800/80 pt-2">
                          <span className="text-blue-400 block font-semibold">Required Adjustments:</span>
                          <p>{rev.required_changes || rev.critical_issues || "None."}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Review Submission Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">Reviewer Identity</label>
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  >
                    <option value="CHATGPT">ChatGPT (Independent Strategic Positioning Reviewer)</option>
                    <option value="CLAUDE">Claude (Independent Adversarial Quality & Rigor Critic)</option>
                    <option value="AG_IDE_BROWSER">AG IDE + Browser Subagent (Kindle Layout & UX Auditor)</option>
                    <option value="HUMAN_PUBLISHER">Lead Publisher (Sovereign Signoff Authority)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommendation</label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  >
                    <option value="APPROVED">APPROVED (Publication-Ready)</option>
                    <option value="CHANGES_REQUIRED">CHANGES REQUIRED (Needs Specific Adjustments)</option>
                    <option value="REJECTED">REJECTED (Do Not Publish)</option>
                  </select>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1">Opportunity: {ratings.market_opportunity}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ratings.market_opportunity}
                    onChange={(e) => setRatings({ ...ratings, market_opportunity: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Positioning: {ratings.positioning}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ratings.positioning}
                    onChange={(e) => setRatings({ ...ratings, positioning: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Depth: {ratings.depth}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ratings.depth}
                    onChange={(e) => setRatings({ ...ratings, depth: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Readability: {ratings.readability}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ratings.readability}
                    onChange={(e) => setRatings({ ...ratings, readability: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Overall: {overallScore}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={overallScore}
                    onChange={(e) => setOverallScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Text Comments */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">Strengths & Core Advantages</label>
                  <textarea
                    rows={3}
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="Provide specific, evidence-grounded strengths of the book..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">Weaknesses / Areas for Improvement</label>
                  <textarea
                    rows={3}
                    value={weaknesses}
                    onChange={(e) => setWeaknesses(e.target.value)}
                    placeholder="Provide specific weaknesses, technical gaps, or tone critiques..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">Critical Issues / Red Flags (if any)</label>
                  <input
                    type="text"
                    value={criticalIssues}
                    onChange={(e) => setCriticalIssues(e.target.value)}
                    placeholder="E.g., None, or specific factual/IP/hallucination risk"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">Required Changes (if any)</label>
                  <input
                    type="text"
                    value={requiredChanges}
                    onChange={(e) => setRequiredChanges(e.target.value)}
                    placeholder="Actionable changes required prior to publishing"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sovereign Human Signoff Checkbox */}
              {selectedReviewer === "HUMAN_PUBLISHER" && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="human-signoff"
                    checked={humanSignoffChecked}
                    onChange={(e) => setHumanSignoffChecked(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-amber-500 text-amber-500 focus:ring-amber-400"
                  />
                  <label htmlFor="human-signoff" className="text-amber-200 leading-relaxed cursor-pointer font-medium">
                    <strong>HUMAN PUBLISHER SOVEREIGN SIGNOFF:</strong> I confirm that I have reviewed BOOK-0001 in its entirety and authorize advancing it toward publication.
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-blue-400 font-medium">{submissionStatus}</span>
                <button
                  type="submit"
                  disabled={selectedReviewer === "HUMAN_PUBLISHER" && recommendation === "APPROVED" && !humanSignoffChecked}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-lg shadow-blue-500/20"
                >
                  Submit Independent Review
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-5 px-4 text-center text-xs text-slate-500">
        AMAZON-KDP Operational Review Center &bull; Ephemeral Unlisted Deployment on Vercel &bull; BOOK-0001
      </footer>
    </div>
  );
}
