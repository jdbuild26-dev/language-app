"use client";

import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Star, 
  Trophy, 
  Volume2, 
  ArrowRight, 
  Zap, 
  Target, 
  Languages, 
  Search, 
  CheckCircle, 
  MessageCircle, 
  Info, 
  Sparkles, 
  FileDown
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
    
    // Header
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("LINGUA PRACTICE REPORT", 20, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${mode.toUpperCase()} SESSION | ${timestamp}`, 20, 30);
    
    // Performance Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Overview", 20, 55);
    
    // Score Bar
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
    
    // Checks
    if (data.professional_checks) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Professional Checks", 20, currentY);
      
      currentY += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Register: ${data.professional_checks.register}`, 25, currentY);
      doc.text(`Politeness: ${data.professional_checks.politeness ? 'Verified' : 'Review'}`, 80, currentY);
      doc.text(`Tone: ${data.professional_checks.tone_appropriatness ? 'Verified' : 'Review'}`, 140, currentY);
      
      currentY += 15;
    }
    
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
      data.detailed_tweaks.forEach((tweak, i) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 overflow-y-auto"
        >
          {/* Top Bar Navigation */}
          <div className="sticky top-0 z-[110] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </Button>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    Goal Completion <Trophy className="w-6 h-6 text-indigo-500" />
                  </h1>
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{title} • LEVEL {data.cefr_level}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 bg-white dark:bg-slate-900 border-2 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Download PDF
                </Button>
                <Button
                  onClick={onContinue || onClose}
                  className="rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-black px-8 py-6 text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl dark:shadow-none"
                >
                  CONTINUE
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12 pb-24">
            {/* Header Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Score Mastery Card */}
              <div className="lg:col-span-5 relative overflow-hidden rounded-[3rem] bg-indigo-600 p-10 text-white shadow-2xl shadow-indigo-200 dark:shadow-none min-h-[440px] flex flex-col justify-between">
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-[80px]" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="112"
                        cy="112"
                        r="100"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        className="opacity-20"
                      />
                      <motion.circle
                        cx="112"
                        cy="112"
                        r="100"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={628}
                        initial={{ strokeDashoffset: 628 }}
                        animate={{ strokeDashoffset: 628 - (628 * data.overall_score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="transition-all"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-7xl font-black tracking-tighter leading-none">{data.overall_score}</span>
                      <span className="text-sm font-black uppercase tracking-widest opacity-80 mt-1">PERCENT%</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-2 text-center">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Mastery Reached</h2>
                    <p className="text-indigo-100 font-medium text-sm">Your {mode} accuracy is within the {data.cefr_level} percentile.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                  <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 flex flex-col items-center">
                    <span className="text-2xl font-black mb-1">{data.vocab_diversity}%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Vocabulary</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 flex flex-col items-center">
                    <span className="text-2xl font-black mb-1">{data.grammar_diversity}%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Grammar</span>
                  </div>
                </div>
              </div>

              {/* Insights & Content Center */}
              <div className="lg:col-span-7 space-y-8">
                {/* Executive Summary Focus */}
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-8">
                    <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 animate-pulse">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-black px-4 py-1.5 rounded-full border-none">
                      AI PERFORMANCE SUMMARY
                    </Badge>
                    <p className="text-2xl md:text-3xl font-medium text-slate-800 dark:text-slate-100 leading-tight italic">
                      "{data.executive_summary}"
                    </p>
                  </div>

                  {data.literal_translation && (
                    <div className="flex items-start gap-4 p-6 rounded-[2rem] bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/40">
                      <div className="mt-1">
                        <AlertCircle className="w-6 h-6 text-rose-500" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-rose-600 uppercase tracking-widest block mb-1">Semantic Accuracy</span>
                        <p className="text-rose-800 dark:text-rose-300 text-sm leading-relaxed font-medium">{data.literal_translation}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-Tabs View */}
                <div className="space-y-6">
                  <div className="flex p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl w-full md:w-fit gap-2">
                    {([
                      { id: 'overview', icon: Search, label: "Your text" },
                      { id: 'tweaks', icon: Target, label: "Tutor Fixes" },
                      { id: 'sample', icon: Star, label: "Native Version" }
                    ] as const).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex-1 md:flex-none flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-300",
                          activeTab === tab.id
                            ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-xl shadow-indigo-100/50 dark:shadow-none scale-[1.05]"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[300px]">
                    <AnimatePresence mode="wait">
                      {activeTab === 'overview' && (
                        <motion.div
                          key="ov"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="space-y-6"
                        >
                           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row gap-10">
                              <div className="flex-1 space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Original Input</h4>
                                <div className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                  {userText ? `"${userText}"` : "No input provided."}
                                </div>
                                {data.intent_prediction && (
                                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Intent Detection</h5>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-bold italic">
                                      {data.intent_prediction}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {originalImage && (
                                <div className="w-full md:w-56 h-56 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-100 dark:border-slate-700">
                                  {originalImage.length < 5 ? (
                                    <span className="text-8xl">{originalImage}</span>
                                  ) : (
                                    <img src={originalImage} alt="Reference" className="w-full h-full object-cover" />
                                  )}
                                </div>
                              )}
                           </div>
                        </motion.div>
                      )}

                      {activeTab === 'tweaks' && (
                        <motion.div
                          key="tw"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="space-y-4"
                        >
                          {data.detailed_tweaks && data.detailed_tweaks.length > 0 ? (
                            data.detailed_tweaks.map((tweak, i) => (
                              <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group hover:border-indigo-200 transition-colors">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                  <div className="space-y-3">
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">Correction needed</span>
                                    <div className="p-5 bg-rose-50 dark:bg-rose-950/10 text-rose-600 rounded-3xl font-bold line-through border border-rose-100 dark:border-rose-900/30">
                                      {tweak.original}
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Recommended</span>
                                    <div className="p-5 bg-emerald-50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 rounded-3xl font-black border border-emerald-100 dark:border-emerald-800">
                                      {tweak.corrected}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-6 flex items-start gap-4 p-5 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50">
                                  <Info className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                  <p className="text-slate-600 dark:text-indigo-300 text-sm italic font-medium leading-relaxed">
                                    {tweak.explanation}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                              <CheckCircle className="w-20 h-20 opacity-10 mb-4" />
                              <p className="font-black uppercase tracking-widest text-xs">No improvements suggested. Perfect!</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === 'sample' && (
                        <motion.div
                          key="sa"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="space-y-8"
                        >
                          <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-100/50 dark:shadow-none text-center group">
                            <div className="absolute top-10 right-10 opacity-20 transition-opacity group-hover:opacity-100">
                               <Sparkles className="w-12 h-12 text-indigo-600" />
                            </div>
                            <div className="max-w-2xl mx-auto space-y-10">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Redesigned with Native Nuance</h4>
                              <p className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                                "{data.improved_version}"
                              </p>
                              <div className="flex justify-center">
                                <Button 
                                  onClick={handlePlaySample}
                                  className={cn(
                                    "rounded-3xl h-24 w-24 flex-col gap-1 transition-all shadow-2xl hover:scale-110 active:scale-95",
                                    isSpeaking ? "bg-rose-500 hover:bg-rose-600" : "bg-indigo-600 hover:bg-indigo-700"
                                  )}
                                >
                                  <Volume2 className={cn("w-8 h-8", isSpeaking && "animate-pulse")} />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">{isSpeaking ? "Stop" : "Listen"}</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Diversity and Checks Footer Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
               {data.professional_checks ? (
                 <>
                   <MetricBox label="Tone Accuracy" level={data.professional_checks.tone_appropriatness ? "Verified" : "Low"} color="indigo" />
                   <MetricBox label="Task Fulfillment" level={data.professional_checks.task_fulfillment ? "Optimal" : "Partial"} color="emerald" />
                   <MetricBox label="Politeness" level={data.professional_checks.politeness ? "Polite" : "Direct"} color="amber" />
                   <MetricBox label="Register" level={data.professional_checks.register} color="slate" />
                 </>
               ) : (
                 <>
                   <MetricBox label="Vocab Variety" level="Fluent" color="indigo" />
                   <MetricBox label="Sentence Flow" level="Natural" color="emerald" />
                   <MetricBox label="Cultural Context" level="High" color="amber" />
                   <MetricBox label="Structure" level="Solid" color="slate" />
                 </>
               )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetricBox({ label, level, color }: { label: string; level: string; color: string }) {
  const colorMap: any = {
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
    slate: "bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
  };
  
  return (
    <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
       <Badge variant="secondary" className={cn("px-6 py-1.5 rounded-full border-none font-black text-xs", colorMap[color])}>
         {level.toUpperCase()}
       </Badge>
    </div>
  );
}
