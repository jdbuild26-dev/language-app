"use client";

import React, { useState } from "react";
import { 
  X, 
  Search, 
  Star, 
  MessageCircle, 
  Info, 
  BookOpen, 
  FileDown,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { jsPDF } from "jspdf";

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

export interface EnhancedAnalysisData {
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
  title = "Evaluation Result",
  userText = "",
  originalImage
}: EnhancedFeedbackViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tweaks" | "sample">("overview");
  const { speak, isSpeaking } = useTextToSpeech();

  if (!data) return null;

  const handlePlaySample = () => {
    speak(data.improved_version, "fr-FR");
  };

  const handleDownloadPDF = () => {
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
    doc.text("Generated by Antigravity AI - Personalized Language Learning Platform", 105, 285, { align: "center" });
    
    doc.save(`LinguaReport-${mode}-${new Date().getTime()}.pdf`);
  };

  const tabs = [
    { id: "overview", label: "Overview & Insights" },
    { id: "tweaks", label: "Grammar and vocabulary tweaks" },
    { id: "sample", label: "Sample answer" },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: 10 }}
           className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 overflow-y-auto"
        >
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            
            {/* Top Navigation Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800">
               <div className="flex gap-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "pb-4 px-1 text-sm font-black uppercase tracking-tighter transition-all relative",
                        activeTab === tab.id 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                        />
                      )}
                    </button>
                  ))}
               </div>
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
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                  >
                    {/* Left Column (60%) */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Original Submission Card */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Original Submission</h3>
                          <button className="text-blue-600 text-sm font-bold hover:underline">Edit Content</button>
                        </div>
                        
                        <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-lg">
                          {userText
                            ? renderAnnotatedText(userText, data.detailed_tweaks ?? [])
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
                          <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">AI Executive Summary</h3>
                        </div>
                        <p className="text-lg font-medium text-blue-800 dark:text-blue-200 italic leading-relaxed">
                          "{data.executive_summary}"
                        </p>
                      </div>
                    </div>

                    {/* Right Column (40%) */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Score & CEFR micro-cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative flex flex-col items-center justify-center min-h-[140px]">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest absolute top-6 left-6">Overall SCORE</p>
                          <div className="bg-emerald-500 text-white font-black text-3xl px-6 py-2 rounded-lg shadow-lg mt-4">
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
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Writing Analysis</h4>
                        
                        <div className="space-y-10">
                          {data.parameters && data.parameters.length > 0
                            ? data.parameters.map((p) => (
                                <AnalysisRow key={p.name} label={p.name} value={p.score} tooltip={p.tooltip} />
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
                        <Button 
                          onClick={handleDownloadPDF}
                          variant="outline"
                          className="w-full h-12 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-white flex items-center justify-center gap-2"
                        >
                          <FileDown className="w-5 h-5" />
                          Download Transcript (PDF)
                        </Button>
                      </div>
                    </div>
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
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Grammar & Vocabulary Tweaks</h3>

                    {!data.detailed_tweaks || data.detailed_tweaks.filter(t => (t.original ?? "").trim() !== (t.corrected ?? "").trim()).length === 0 ? (
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
                    className="max-w-4xl mx-auto space-y-8 text-center pt-10"
                  >
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl space-y-10">
                        <Star className="w-12 h-12 text-amber-400 mx-auto" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Version</h4>
                        <p className="text-3xl font-black text-slate-900 dark:text-white leading-relaxed italic">
                          "{data.improved_version}"
                        </p>
                        <div className="flex justify-center pt-4">
                          <Button 
                            onClick={handlePlaySample}
                            className={cn(
                              "rounded-full h-24 w-24 flex-col gap-1 transition-all shadow-xl",
                              isSpeaking ? "bg-rose-500 hover:bg-rose-600" : "bg-indigo-600 hover:bg-indigo-700"
                            )}
                          >
                            <Volume2 className={cn("w-8 h-8", isSpeaking && "animate-pulse")} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{isSpeaking ? "Stop" : "Listen"}</span>
                          </Button>
                        </div>
                    </div>
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

function AnalysisRow({ label, value, tooltip }: { label: string; value: number; tooltip?: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
               <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-white leading-none">{label}</span>
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
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-emerald-500 rounded-full"
        />
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-12">
        {value}th Percentile
      </div>
    </div>
  );
}
