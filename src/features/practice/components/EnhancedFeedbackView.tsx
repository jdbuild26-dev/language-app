"use client";
import type { TopicSummary } from "../hooks/useTopicEvaluation";
import { stripReportHeading } from "../lib/reportHeading";

import React, { useState } from "react";
import { 
  Star, 
  MessageCircle, 
  Info, 
  BookOpen, 
  FileDown,
  Volume2,
  Eye,
  CircleCheck,
  CircleAlert,
  Lightbulb,
  BarChart3,
  PencilLine,
  type LucideIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { jsPDF } from "jspdf";
import type { WriteImageCorrection, WriteImageSegment } from "@/features/practice/hooks/useWriteImageEvaluation";
import { downloadWriteImagePdf } from "./writeImagePdf";

interface FeedbackTweak {
  original: string;
  corrected: string;
  explanation: string;
  native_version?: string;
}

interface ProfessionalChecks {
  register: string;
  tone_appropriatness: boolean;
  politeness: boolean;
  task_fulfillment: boolean;
}

type ImageReportSummary = {
  overall_description: string;
  what_the_learner_did_well: string;
  what_was_missing_or_could_have_been_better: string;
  how_the_learner_can_improve: string[];
};

export interface EnhancedAnalysisData {
  report_kind?: "write_topic" | "speak_topic" | "speak_image";
  learning_language?: string;
  topic_session_summary?: TopicSummary;
  overall_score: number;
  cefr_level: string;
  vocab_diversity: number;
  grammar_diversity: number;
  executive_summary: string;
  improved_version: string;
  literal_translation?: string;
  detailed_tweaks?: FeedbackTweak[];
  professional_checks?: ProfessionalChecks;
  intent_prediction?: string;
  message_success?: boolean;
  pronunciation_tip?: string;
  parameters?: { name: string; tooltip: string; score: number }[];
  overall_session_summary?: ImageReportSummary;
  grammar_language_feedback?: string;
  corrected_response_segments?: WriteImageSegment[];
  grammar_correction_table?: WriteImageCorrection[];
  overall_content_score?: number;
  sample_descriptions?: string[];
}

interface EnhancedFeedbackViewProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  data: EnhancedAnalysisData | null;
  mode: "writing" | "speaking" | "interactive";
  title?: string;
  userText?: string;
  originalImage?: string;
}

// ---------------------------------------------------------------------------
// Annotated text renderer — highlights corrections inline in the user's text
// ---------------------------------------------------------------------------
function renderAnnotatedText(text: string, tweaks: FeedbackTweak[]) {
  // Build a list of replacements sorted by position of first occurrence
  type Segment = { start: number; end: number; original: string; corrected: string };
  const segments: Segment[] = [];

  for (const tweak of tweaks) {
    if (!tweak.original) continue;
    const idx = text.indexOf(tweak.original);
    if (idx !== -1) {
      // Avoid overlapping segments
      const overlaps = segments.some((s) => idx < s.end && idx + tweak.original.length > s.start);
      if (!overlaps) {
        segments.push({ start: idx, end: idx + tweak.original.length, original: tweak.original, corrected: tweak.corrected });
      }
    }
  }

  segments.sort((a, b) => a.start - b.start);

  // Build React nodes
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const seg of segments) {
    if (seg.start > cursor) {
      nodes.push(<span key={cursor}>{text.slice(cursor, seg.start)}</span>);
    }
    nodes.push(
      <span key={seg.start}>
        <span className="line-through text-red-500 decoration-red-500">{seg.original}</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold"> {seg.corrected}</span>
      </span>
    );
    cursor = seg.end;
  }

  if (cursor < text.length) {
    nodes.push(<span key={cursor}>{text.slice(cursor)}</span>);
  }

  // Wrap in paragraphs by splitting on newlines
  const fullText = nodes;
  return <p className="leading-[1.9]">{fullText}</p>;
}

export default function EnhancedFeedbackView({
  isOpen,
  onClose,
  onContinue,
  data,
  mode,
  userText = "",
}: EnhancedFeedbackViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tweaks" | "sample">("overview");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { speak, isSpeaking } = useTextToSpeech();

  if (!data) return null;
  const isStructuredReport = Boolean(data.corrected_response_segments);

  const handlePlaySample = (text?: string) => {
    const locales: Record<string, string> = { French: "fr-FR", English: "en-GB", German: "de-DE", Spanish: "es-ES", Italian: "it-IT", Portuguese: "pt-PT", Dutch: "nl-NL" };
    speak(text || data.improved_version, locales[data.learning_language || "French"] || data.learning_language || "fr-FR");
  };

  const handleDownloadPDF = async () => {
    if (data.corrected_response_segments) {
      setDownloadError(null);
      try {
        await downloadWriteImagePdf(data, userText);
      } catch {
        setDownloadError("The report could not be downloaded. Please try again.");
      }
      return;
    }
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("LINGUA PRACTICE REPORT", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${mode.toUpperCase()} SESSION | ${timestamp}`, 20, 30);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Overview", 20, 55);
    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 60, 170, 30, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("OVERALL SCORE", 30, 70);
    doc.text("CEFR LEVEL", 80, 70);
    doc.text("VOCAB DIVERSITY", 120, 70);
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text(`${data.overall_score}%`, 30, 82);
    doc.text(data.cefr_level, 80, 82);
    doc.text(`${data.vocab_diversity}%`, 120, 82);
    
    // Executive Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 20, 105);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(`"${data.executive_summary}"`, 170);
    doc.text(summaryLines, 20, 115);
    
    // Content Section
    let currentY = 115 + (summaryLines.length * 7);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Your Submission", 20, currentY + 10);
    
    currentY += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const submissionLines = doc.splitTextToSize(userText || "No text provided", 170);
    doc.text(submissionLines, 20, currentY + 5);
    
    currentY += (submissionLines.length * 6) + 15;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Improved Selection", 20, currentY);
    
    currentY += 8;
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105); // Emerald-600
    const improvedLines = doc.splitTextToSize(data.improved_version, 170);
    doc.text(improvedLines, 20, currentY);
    
    currentY += (improvedLines.length * 6) + 15;
    
    // Tweaks
    if (data.detailed_tweaks && data.detailed_tweaks.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Detailed Analysis & Minor Fixes", 20, currentY);
      
      currentY += 10;
      data.detailed_tweaks.forEach((tweak) => {
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(239, 68, 68); // Red-500
        doc.text(`ORIGINAL: ${tweak.original}`, 25, currentY);
        
        currentY += 5;
        doc.setTextColor(16, 185, 129); // Emerald-500
        doc.text(`CORRECTION: ${tweak.corrected}`, 25, currentY);
        
        currentY += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const explLines = doc.splitTextToSize(`Note: ${tweak.explanation}`, 160);
        doc.text(explLines, 30, currentY);
        
        currentY += (explLines.length * 5) + 10;
      });
    }
    
    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Personalized Language Learning Report", 105, 285, { align: "center" });
    
    doc.save(`LinguaReport-${mode}-${new Date().getTime()}.pdf`);
  };

  const tabs = [
    { id: "overview", label: isStructuredReport ? "Session Summary" : "Overview & Insights", shortLabel: "Summary" },
    { id: "tweaks", label: isStructuredReport ? "Suggested Corrections" : "Grammar and vocabulary tweaks", shortLabel: "Corrections" },
    { id: "sample", label: isStructuredReport ? "Sample Answers" : "Sample answer", shortLabel: "Samples" },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: 10 }}
           className="fixed inset-0 z-[100] overflow-y-auto bg-slate-50 dark:bg-slate-950"
        >
          <div className={cn("max-w-7xl mx-auto p-4 md:p-8 space-y-6", isStructuredReport && "md:space-y-8")}>
            
            {/* Top Navigation Tabs */}
            <div className={cn(
              "border-b border-slate-200 dark:border-slate-800",
              isStructuredReport && "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            )}>
               <div className={cn("flex gap-8", isStructuredReport && "min-w-0 flex-1 gap-5 overflow-x-auto sm:gap-7")}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "pb-4 px-1 text-sm font-black uppercase tracking-tighter transition-all relative",
                        isStructuredReport && "shrink-0 whitespace-nowrap text-sm font-semibold normal-case tracking-normal sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                        activeTab === tab.id 
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-blue-600"
                        />
                      )}
                    </button>
                  ))}
               </div>
               {isStructuredReport && (
                 <div className="shrink-0 pb-3 sm:pb-4">
                   <Button
                     onClick={handleDownloadPDF}
                     variant="outline"
                     className="h-10 w-full sm:w-auto rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-white gap-2 transition-transform duration-150 active:scale-[0.97]"
                   >
                     <FileDown className="w-4 h-4" />
                     Download Analysis Report
                   </Button>
                   {downloadError && <p role="alert" className="mt-1 text-sm text-red-600">{downloadError}</p>}
                 </div>
               )}
            </div>

            {/* Tab Content Area */}
            <div className="min-h-[600px]">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview-tab"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={isStructuredReport ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"}
                  >
                    {isStructuredReport && (
                      <ImageSessionSummary
                        data={data}
                        userText={userText}
                        onContinue={onContinue || onClose}
                      />
                    )}
                    {!isStructuredReport && <>
                    {/* Left Column (60%) */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Original Submission Card */}
                      <div className={cn(
                        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative",
                        data.corrected_response_segments ? "p-6 sm:p-8" : "p-8 min-h-[400px]"
                      )}>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Original Submission</h3>
                          {!data.corrected_response_segments && <button className="text-blue-600 text-sm font-bold hover:underline">Edit Content</button>}
                        </div>
                        
                        <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-lg">
                          {userText
                            ? data.corrected_response_segments
                              ? <p className="whitespace-pre-wrap leading-[1.9]">{userText}</p>
                              : renderAnnotatedText(userText, data.detailed_tweaks ?? [])
                            : <p className="italic text-slate-400">No original text provided.</p>
                          }
                        </div>
                      </div>

                      {/* AI Executive Summary Card */}
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-blue-600">
                            <MessageCircle className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">Summary</h3>
                        </div>
                        {data.overall_session_summary ? (
                          <ReportSummary summary={data.overall_session_summary} className="text-blue-800 dark:text-blue-200" />
                        ) : (
                          <p className="text-lg font-medium text-blue-800 dark:text-blue-200 italic leading-relaxed">
                            "{data.executive_summary}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Column (40%) */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Score & CEFR micro-cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative flex flex-col items-center justify-center min-h-[140px]">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest absolute top-6 left-6">Overall SCORE</p>
                          <div className={cn(
                            "text-white font-black text-3xl px-6 py-2 rounded-lg shadow-lg mt-4",
                            data.overall_score >= 70
                              ? "bg-emerald-500"
                              : data.overall_score >= 40
                              ? "bg-amber-500"
                              : "bg-red-500"
                          )}>
                            {data.overall_score}
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative flex flex-col items-center justify-center min-h-[140px]">
                          <div className="absolute top-6 right-6">
                            <Info className="w-4 h-4 text-slate-300" />
                          </div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest absolute top-6 left-6">CEFR Level detected</p>
                          <div className="text-5xl font-black text-slate-900 dark:text-white mt-4 flex items-baseline">
                            {data.cefr_level}
                          </div>
                        </div>
                      </div>

                      {/* Writing Analysis Card */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">
                          Writing Analysis{data.overall_content_score !== undefined ? ` · Content ${data.overall_content_score}/100` : ""}
                        </h4>
                        
                        <div className="space-y-10">
                          {data.parameters && data.parameters.length > 0
                            ? data.parameters.map((p) => (
                                <AnalysisRow key={p.name} label={p.name} value={p.score} tooltip={p.tooltip} ratingOutOfTen={Boolean(data.overall_session_summary)} />
                              ))
                            : (
                              <>
                                <AnalysisRow label="Vocabulary Diversity" value={data.vocab_diversity} />
                                <AnalysisRow label="Grammar Diversity" value={data.grammar_diversity} />
                                <AnalysisRow label="Contextual match" value={85} />
                              </>
                            )
                          }
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 pt-2">
                        <Button 
                          onClick={onContinue || onClose}
                          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-100 dark:shadow-none"
                        >
                          Continue
                        </Button>
                        {!isStructuredReport && (
                          <>
                            <Button
                              onClick={handleDownloadPDF}
                              variant="outline"
                              className="w-full h-12 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-white flex items-center justify-center gap-2"
                            >
                              <FileDown className="w-5 h-5" />
                              Download Transcript (PDF)
                            </Button>
                            {downloadError && <p role="alert" className="text-sm text-red-600">{downloadError}</p>}
                          </>
                        )}
                      </div>
                    </div>
                    </>}
                  </motion.div>
                )}

                {activeTab === 'tweaks' && (
                  <motion.div 
                    key="tweaks-tab"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-0"
                  >
                    {!isStructuredReport && <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Grammar & Vocabulary Tweaks</h3>}

                    {data.grammar_language_feedback && data.corrected_response_segments && data.grammar_correction_table ? (
                      <V2GrammarReport
                        feedback={data.grammar_language_feedback}
                        segments={data.corrected_response_segments}
                        corrections={data.grammar_correction_table}
                      />
                    ) : !data.detailed_tweaks || data.detailed_tweaks.filter(t => (t.original ?? "").trim() !== (t.corrected ?? "").trim()).length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-lg font-bold text-slate-500 dark:text-slate-400">No corrections — great writing!</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

                        {/* ── Sticky annotated submission pane ── */}
                        {userText && (
                          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-5">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Original Submission</p>
                            <p className="text-base leading-[2] text-slate-800 dark:text-slate-200 font-medium">
                              {(() => {
                                type Seg = { start: number; end: number; idx: number; original: string; corrected: string };
                                const segs: Seg[] = [];
                                const tweaks = (data.detailed_tweaks ?? []).filter(t => (t.original ?? "").trim() !== (t.corrected ?? "").trim());
                                for (let i = 0; i < tweaks.length; i++) {
                                  const t = tweaks[i];
                                  if (!t.original) continue;
                                  const pos = userText.indexOf(t.original);
                                  if (pos === -1) continue;
                                  const overlaps = segs.some(s => pos < s.end && pos + t.original.length > s.start);
                                  if (!overlaps) segs.push({ start: pos, end: pos + t.original.length, idx: i + 1, original: t.original, corrected: t.corrected });
                                }
                                segs.sort((a, b) => a.start - b.start);
                                const nodes: React.ReactNode[] = [];
                                let cursor = 0;
                                for (const seg of segs) {
                                  if (seg.start > cursor) nodes.push(<span key={`t${cursor}`}>{userText.slice(cursor, seg.start)}</span>);
                                  nodes.push(
                                    <span key={`s${seg.start}`} className="inline">
                                      <span className="line-through text-red-400 dark:text-red-500">{seg.original}</span>
                                      {" "}
                                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{seg.corrected}</span>
                                      <sup className="ml-0.5 text-[10px] font-black text-blue-500 dark:text-blue-400">{seg.idx}</sup>
                                    </span>
                                  );
                                  cursor = seg.end;
                                }
                                if (cursor < userText.length) nodes.push(<span key={`t${cursor}`}>{userText.slice(cursor)}</span>);
                                return nodes;
                              })()}
                            </p>
                          </div>
                        )}

                        {/* ── Scrollable corrections table ── */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-8">#</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-[22%]">Your sentence</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-[22%]">Correction</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-[20%]">Explanation</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">More natural way a native would say it</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(data.detailed_tweaks ?? []).filter(t => (t.original ?? "").trim() !== (t.corrected ?? "").trim()).map((tweak, i) => (
                                <tr
                                  key={i}
                                  className={`border-b border-slate-50 dark:border-slate-800 last:border-0 align-top hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors ${
                                    i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/30 dark:bg-slate-800/20"
                                  }`}
                                >
                                  <td className="px-4 py-4">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black">
                                      {i + 1}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                    <span className="line-through text-red-400 dark:text-red-500">{tweak.original}</span>
                                  </td>
                                  <td className="px-5 py-4 leading-relaxed">
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{tweak.corrected}</span>
                                  </td>
                                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400 leading-relaxed italic">{tweak.explanation}</td>
                                  <td className="px-5 py-4 leading-relaxed">
                                    {tweak.native_version ? (
                                      <span className="inline-flex items-start gap-2">
                                        <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="text-slate-800 dark:text-slate-200 font-medium">{tweak.native_version}</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-300 dark:text-slate-600">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'sample' && (
                  <motion.div 
                    key="sample-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={isStructuredReport ? "w-full pt-4" : "max-w-4xl mx-auto space-y-8 text-center pt-10"}
                  >
                    {isStructuredReport ? (
                      <ImageSampleAnswers samples={data.sample_descriptions || []} onListen={handlePlaySample} topic={data.report_kind === "write_topic" || data.report_kind === "speak_topic"} language={data.learning_language || "French"} />
                    ) : (
                    <div className={cn("bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-10", data.sample_descriptions?.length ? "rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 lg:p-12" : "rounded-[3rem] p-12")}>
                        <Star className="w-12 h-12 text-amber-400 mx-auto" />
                        {data.sample_descriptions?.length ? (
                          <div className="space-y-8 text-left">
                            <div className="text-center">
                              <h4 className="text-2xl font-black text-slate-900 dark:text-white">Sample Answers</h4>
                              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Two possible descriptions of the image</p>
                            </div>
                            {data.sample_descriptions.map((sample, index) => (
                              <div key={index} className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 mb-3">Sample {index + 1}</h4>
                                <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">{sample}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Version</h4>
                            <p className="text-3xl font-black text-slate-900 dark:text-white leading-relaxed italic">
                              "{data.improved_version}"
                            </p>
                          </>
                        )}
                        <div className="flex justify-center pt-4">
                          <Button 
                            onClick={() => handlePlaySample(data.sample_descriptions?.[0])}
                            className={cn(
                              "rounded-full h-24 w-24 flex-col gap-1 transition-all shadow-xl",
                              isSpeaking ? "bg-rose-500 hover:bg-rose-600" : "bg-indigo-600 hover:bg-indigo-700"
                            )}
                          >
                            <Volume2 className={cn("w-8 h-8", isSpeaking && "animate-pulse")} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{isSpeaking ? "Stop" : data.sample_descriptions?.length ? "Sample 1" : "Listen"}</span>
                          </Button>
                        </div>
                    </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ImageSampleAnswers({ samples, onListen, topic = false, language = "French" }: { samples: string[]; onListen: (text: string) => void; topic?: boolean; language?: string }) {
  return (
    <div>
      <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Sample answers</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{topic ? `Possible responses to this topic in ${language}. These are examples, not required answers.` : `Two possible ways to describe the image in ${language}.`}</p>
      {!samples.length && <p className="mt-6 text-slate-700 dark:text-slate-300">No saved sample answers are available for this exercise.</p>}
      <div className="mt-8 border-t border-slate-200 dark:border-slate-800">
        {samples.map((sample, index) => (
          <section key={index} className="border-b border-slate-200 py-8 dark:border-slate-800 sm:py-10">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <h4 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-slate-900 dark:text-white"><BookOpen aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-600" />Sample answer {index + 1}</h4>
            <button
              type="button"
              aria-label={`Listen to sample answer ${index + 1} in ${language}`}
              onClick={() => onListen(sample)}
              className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/50"
            >
              <Volume2 aria-hidden="true" className="h-4 w-4" />
              Listen in {language}
            </button>
            </div>
            <div className="mt-5 w-full space-y-4 break-words text-base leading-8 text-slate-800 dark:text-slate-200">
              {sample.split(/\r?\n/).filter((paragraph) => paragraph.trim()).map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="whitespace-pre-wrap">{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function CorrectedResponse({ segments }: { segments: WriteImageSegment[] }) {
  return (
    <p className="whitespace-pre-wrap break-words text-base leading-8 text-slate-800 dark:text-slate-200">
      {segments.map((part, index) => part.type === "unchanged" ? (
        <React.Fragment key={index}>{part.text}</React.Fragment>
      ) : (
        <React.Fragment key={index}>
          {part.original && <del className="text-red-600 dark:text-red-400">{part.original}</del>}
          {part.original && part.corrected && " "}
          {part.corrected && <ins className="box-decoration-clone rounded bg-emerald-50 px-1 py-0.5 font-semibold text-emerald-800 no-underline dark:bg-emerald-900/30 dark:text-emerald-300">{part.corrected}</ins>}
          <sup className="ml-1 rounded-full bg-blue-50 px-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">{part.number}</sup>
        </React.Fragment>
      ))}
    </p>
  );
}

function V2GrammarReport({ feedback, segments, corrections }: {
  feedback: string;
  segments: WriteImageSegment[];
  corrections: WriteImageCorrection[];
}) {
  return (
    <div className="space-y-10 py-4">
      <section className="min-w-0 border-b border-slate-200 pb-8 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Part 1</p>
        <h3 className="mt-3 flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"><BookOpen aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-600" />Overall language feedback</h3>
        <p className="mt-5 w-full whitespace-pre-wrap break-words text-base leading-8 text-slate-800 dark:text-slate-200">{feedback}</p>
      </section>
      <section className="min-w-0 border-b border-slate-200 pb-8 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Part 2</p>
        <h3 className="mt-3 flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"><PencilLine aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-600" />Corrected learner response</h3>
        <div className="mt-5 w-full">
          <CorrectedResponse segments={segments} />
        </div>
      </section>
      <section className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Part 3</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Correction table</h3>
        {corrections.length ? (
          <>
          <div className="mt-5 md:hidden">
            {corrections.map((row) => (
              <div key={row.number} className="border-b border-slate-200 py-5 dark:border-slate-800">
                <span className="text-xs font-bold tabular-nums text-sky-700 dark:text-sky-300">Correction {row.number}</span>
                <dl className="mt-4 space-y-4 text-base leading-7">
                  <div><dt className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Sentence</dt><dd className="mt-1 break-words text-red-600 dark:text-red-400">{row.original || "Insertion"}</dd></div>
                  <div><dt className="text-sm font-semibold text-slate-700 dark:text-slate-300">Correction</dt><dd className="mt-1 break-words font-medium text-emerald-700 dark:text-emerald-400">{row.corrected || "Remove"}<sup className="ml-1 font-bold text-blue-600 dark:text-blue-400">{row.number}</sup></dd></div>
                  <div><dt className="text-sm font-semibold text-slate-700 dark:text-slate-300">Explanation</dt><dd className="mt-1 text-slate-800 dark:text-slate-200">{row.explanation}</dd></div>
                </dl>
              </div>
            ))}
          </div>
          <div className="mt-5 hidden overflow-x-auto border-y border-slate-200 dark:border-slate-700 md:block">
            <table className="w-full table-fixed text-base leading-7">
              <thead className="bg-slate-50 dark:bg-slate-800 text-left text-sm text-slate-700 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-5 py-3 w-[30%]">Your Sentence</th>
                  <th scope="col" className="px-5 py-3 w-[30%]">Correction</th>
                  <th scope="col" className="px-5 py-3">Explanation</th>
                </tr>
              </thead>
              <tbody>
                {corrections.map((row) => (
                  <tr key={row.number} className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 align-top">
                    <td className="break-words px-5 py-5 text-red-600 dark:text-red-400"><sup className="mr-2 font-bold text-blue-600 dark:text-blue-400">{row.number}</sup>{row.original || <span className="text-slate-600 dark:text-slate-400">Insertion</span>}</td>
                    <td className="break-words px-5 py-5 font-semibold text-emerald-700 dark:text-emerald-400">{row.corrected || <span className="text-slate-600 dark:text-slate-400 font-normal">Remove</span>}<sup className="ml-1 font-bold text-blue-600 dark:text-blue-400">{row.number}</sup></td>
                    <td className="break-words px-5 py-5 text-slate-800 dark:text-slate-200">{row.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : <p className="mt-5 text-emerald-700 dark:text-emerald-300">No language corrections needed.</p>}
      </section>
    </div>
  );
}

function ImageSessionSummary({
  data,
  userText,
  onContinue,
}: {
  data: EnhancedAnalysisData;
  userText: string;
  onContinue: () => void;
}) {
  const isWriteTopic = data.report_kind === "write_topic";
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-start">
      <div className={isWriteTopic
        ? "grid min-w-0 grid-cols-1 gap-6 border-b border-slate-200 pb-8 pt-2 dark:border-slate-800 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-8"
        : "contents"}>
      <section className={cn("min-w-0", !isWriteTopic && "px-6 py-7 sm:px-8 sm:py-8")}>
            <h3 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              <PencilLine aria-hidden="true" className={cn("h-5 w-5 shrink-0 text-blue-600", isWriteTopic && "!text-slate-500 dark:!text-slate-400")} />
              {isWriteTopic ? "Original submission" : "Original Submission"}
            </h3>
            <p className="mt-5 whitespace-pre-wrap break-words text-base leading-8 text-slate-800 dark:text-slate-200 sm:text-lg">
              {userText || <span className="italic text-slate-500">No original text provided.</span>}
            </p>
      </section>
          <aside aria-label="Session results" className={isWriteTopic
            ? "border-t border-slate-200 pt-6 dark:border-slate-700 lg:border-t-0 lg:border-l lg:pl-7 lg:pt-0"
            : "py-2 lg:py-8"}>
            <dl className="grid grid-cols-2 gap-6 lg:grid-cols-1 lg:gap-7">
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {!isWriteTopic && <BarChart3 aria-hidden="true" className="h-4 w-4 text-blue-600" />}
                  Overall score
                </dt>
                <dd className="mt-3 flex items-baseline gap-2">
                  <span className={cn(
                    "text-5xl font-semibold tabular-nums tracking-tight",
                    isWriteTopic && "sm:text-6xl",
                    data.overall_score >= 70 ? "text-emerald-600 dark:text-emerald-400" : data.overall_score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                  )}>{data.overall_score}</span>
                  <span className="text-base text-slate-500 dark:text-slate-400">/ 100</span>
                </dd>
              </div>
              <div className={cn("lg:border-t lg:border-slate-200 lg:pt-6 dark:lg:border-slate-700", isWriteTopic && "lg:!border-t-0 lg:!pt-0")}>
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {!isWriteTopic && <BookOpen aria-hidden="true" className="h-4 w-4 text-blue-600" />}
                  CEFR level
                </dt>
                <dd className={cn("mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white", isWriteTopic && "!text-2xl")}>{data.cefr_level}</dd>
              </div>
            </dl>
          </aside>
      </div>

      <section className="min-w-0 lg:col-span-2">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{data.topic_session_summary ? "Session feedback" : "Content feedback"}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{data.topic_session_summary ? "How your response addresses the instruction and topics to cover." : "How your description relates to the image."}</p>
        </div>
        {data.topic_session_summary ? (
          <TopicReportSummary summary={data.topic_session_summary} speech={data.report_kind === "speak_topic"} />
        ) : data.overall_session_summary ? (
          <ReportSummary summary={data.overall_session_summary} className="text-slate-700 dark:text-slate-200" />
        ) : (
          <p className="leading-relaxed text-slate-700 dark:text-slate-200">{data.executive_summary}</p>
        )}
        {data.parameters && data.parameters.length > 0 && (
          <section className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-700">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-3 text-2xl font-semibold text-slate-900 dark:text-white">
                  <BarChart3 aria-hidden="true" className="h-5 w-5 text-blue-600" />
                  {data.topic_session_summary ? "Parameter ratings" : "Content ratings"}
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Each area is rated out of 10</p>
            </div>
            <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
              {data.parameters.map((parameter) => (
                <AnalysisRow
                  key={parameter.name}
                  label={parameter.name}
                  value={parameter.score}
                  tooltip={parameter.tooltip}
                  ratingOutOfTen
                />
              ))}
            </div>
          </section>
        )}
      </section>

      <div className="flex justify-end border-t border-slate-200 pt-6 dark:border-slate-700 lg:col-span-2">
        <Button
          onClick={onContinue}
          className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-sm transition-transform duration-150 hover:bg-blue-700 active:scale-[0.97] sm:w-56"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function TopicReportSummary({ summary, speech }: { summary: TopicSummary; speech: boolean }) {
  return <div className="space-y-10">
    <FeedbackSection title="Task & Objective Achievement" text={summary.task_objective_achievement} icon={Eye} color="text-blue-600" />
    <FeedbackSection title={speech ? "Overall Speaking Performance" : "Overall Writing Performance"} text={summary.overall_performance} icon={BookOpen} color="text-blue-600" />
    <div className="grid gap-8 border-y border-slate-200 py-9 dark:border-slate-700 md:grid-cols-2 md:gap-12">
      <FeedbackSection title="What the Learner Did Well" text={summary.what_the_learner_did_well} icon={CircleCheck} color="text-emerald-600" />
      <FeedbackSection title="What Could Have Been Better" text={summary.what_could_have_been_better} icon={CircleAlert} color="text-amber-600" />
    </div>
    <section>
      <h4 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
        <Lightbulb aria-hidden="true" className="h-5 w-5 text-blue-600" />How the Learner Can Improve
      </h4>
      <ol className="mt-6 w-full space-y-4 pl-10">
        {summary.how_the_learner_can_improve.map((item, index) => <li key={index} className="relative text-base leading-8 text-slate-800 dark:text-slate-200">
          <span aria-hidden="true" className="absolute -left-10 font-bold tabular-nums text-blue-600 dark:text-blue-400">{String(index + 1).padStart(2, "0")}</span>{item}
        </li>)}
      </ol>
    </section>
  </div>;
}

function ReportSummary({ summary, className }: { summary: ImageReportSummary; className: string }) {
  return (
    <div className={cn("space-y-10", className)}>
      <FeedbackSection title="Overall Description" text={summary.overall_description} icon={Eye} color="text-blue-600" />
      <div className="grid gap-8 border-y border-slate-200 py-9 dark:border-slate-700 md:grid-cols-2 md:gap-12">
        <FeedbackSection title="What the Learner Did Well" text={summary.what_the_learner_did_well} icon={CircleCheck} color="text-emerald-600" />
        <FeedbackSection title="What Was Missing or Could Have Been Better" text={summary.what_was_missing_or_could_have_been_better} icon={CircleAlert} color="text-amber-600" className="border-t border-slate-200 pt-8 dark:border-slate-700 md:border-l md:border-t-0 md:pl-10 md:pt-0" />
      </div>
      <section>
        <h4 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          <Lightbulb aria-hidden="true" className="h-5 w-5 text-blue-600" />
          How the Learner Can Improve
        </h4>
        <ol
          className="mt-6 w-full space-y-4 pl-10"
        >
          {summary.how_the_learner_can_improve.map((item, index) => (
            <li key={index} className="relative text-base leading-8 text-slate-800 dark:text-slate-200">
              <span aria-hidden="true" className="absolute -left-10 font-bold tabular-nums text-blue-600 dark:text-blue-400">{String(index + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function FeedbackSection({ title, text, icon: Icon, color, className }: { title: string; text: string; icon: LucideIcon; color: string; className?: string }) {
  return (
    <section className={cn("min-w-0", className)}>
      <h4 className="flex items-start gap-3 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
        <Icon aria-hidden="true" className={cn("mt-0.5 h-5 w-5 shrink-0", color)} />
        {title}
      </h4>
      <p className="mt-4 w-full text-base leading-8 text-slate-800 dark:text-slate-200">{stripReportHeading(text, [title])}</p>
    </section>
  );
}

function AnalysisRow({ label, value, tooltip, ratingOutOfTen = false }: { label: string; value: number; tooltip?: string; ratingOutOfTen?: boolean }) {
  const color =
    value >= 70
      ? { icon: ratingOutOfTen ? "text-emerald-600" : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500", bar: "bg-emerald-500" }
      : value >= 40
      ? { icon: ratingOutOfTen ? "text-amber-600" : "bg-amber-50 dark:bg-amber-950/20 text-amber-500", bar: "bg-amber-500" }
      : { icon: ratingOutOfTen ? "text-red-600" : "bg-red-50 dark:bg-red-950/20 text-red-500", bar: "bg-red-500" };

  return (
    <div className={cn("space-y-3", ratingOutOfTen && "min-w-0 space-y-2")}>
      <div className="flex justify-between items-center gap-2 px-1">
         <div className="flex min-w-0 items-center gap-3">
            <div className={cn("w-9 h-9 shrink-0 rounded-xl flex items-center justify-center", ratingOutOfTen && "h-8 w-8 rounded-lg", color.icon)}>
               <BookOpen className={cn("w-4 h-4", ratingOutOfTen && "h-3.5 w-3.5")} />
            </div>
            <span className={cn("text-base font-bold text-slate-900 dark:text-white leading-none", ratingOutOfTen && "text-sm font-semibold leading-snug")}>{label}</span>
         </div>
         {tooltip
           ? <div title={tooltip}><Info className="w-5 h-5 text-slate-300 cursor-help" /></div>
           : <Info className="w-5 h-5 text-slate-300" />
         }
      </div>
      <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: ratingOutOfTen ? 0.35 : 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", color.bar)}
        />
      </div>
      <div className={cn("text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-12", ratingOutOfTen && "pl-11")}>
        {ratingOutOfTen ? `${value / 10}/10` : `${value}th Percentile`}
      </div>
    </div>
  );
}
