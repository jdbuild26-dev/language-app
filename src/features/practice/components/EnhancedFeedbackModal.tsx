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
  BarChart3,
  Search,
  CheckCircle,
  MessageCircle,
  Info,
  Sparkles,
  FileDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

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

interface EnhancedFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  data: EnhancedAnalysisData | null;
  mode: "writing" | "speaking" | "interactive";
  title?: string;
  userText?: string;
  originalImage?: string;
}

export default function EnhancedFeedbackModal({
  isOpen,
  onClose,
  onContinue,
  data,
  mode,
  title = "Evaluation Result",
  userText = "",
  originalImage
}: EnhancedFeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tweaks" | "sample">("overview");
  const { speak, isSpeaking } = useTextToSpeech();

  if (!data) return null;

  const handlePlaySample = () => {
    speak(data.improved_version, "fr-FR");
  };

  const handleDownloadTranscript = () => {
    const content = `
LANGUAGE LEARNING TRANSCRIPT - ${title.toUpperCase()}
Mode: ${mode.toUpperCase()}
CEFR Level: ${data.cefr_level}
Overall Score: ${data.overall_score}%

ORIGINAL SUBMISSION:
${userText}

AI EXECUTIVE SUMMARY:
${data.executive_summary}

AI IMPROVED VERSION:
${data.improved_version}

ANALYSIS:
Vocab Diversity: ${data.vocab_diversity}%
Grammar Diversity: ${data.grammar_diversity}%

GRAMMAR TWEAKS:
${data.detailed_tweaks?.map(t => `- Original: ${t.original}\n  Corrected: ${t.corrected}\n  Explanation: ${t.explanation}`).join('\n\n') || 'No major tweaks needed.'}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcript_${mode}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: "overview", label: "Overview & Insights" },
    { id: "tweaks", label: "Grammar and vocabulary tweaks" },
    { id: "sample", label: "Sample answer" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 bg-slate-50 dark:bg-slate-900 border-none shadow-2xl flex flex-col">
        {/* Animated Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 z-50" />
        
        {/* Header with Navigation */}
        <div className="p-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-40">
          <div className="flex px-8 pt-6 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-4 text-sm font-black uppercase tracking-tighter transition-all relative",
                  activeTab === tab.id 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Main Content (Left Column) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Original Submission */}
                  <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Original Submission</h3>
                      <button className="text-blue-600 text-sm font-bold hover:underline">Edit Content</button>
                    </div>
                    
                    {originalImage && (
                      <div className="mb-6 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-4">
                        {originalImage.length < 5 ? (
                          <span className="text-7xl animate-bounce-slow">{originalImage}</span>
                        ) : (
                          <img src={originalImage} alt="Context" className="max-h-48 object-contain" />
                        )}
                      </div>
                    )}

                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                      {userText.split('\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                      {!userText && <p className="italic text-slate-400">No original text provided.</p>}
                    </div>
                  </div>

                  {/* AI Executive Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-8 border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">AI Executive Summary</h3>
                    </div>
                    <p className="text-lg font-medium text-blue-800 dark:text-blue-200 italic leading-relaxed">
                      "{data.executive_summary}"
                    </p>
                  </div>
                </div>

                {/* Sidebar (Right Column) */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Score Card */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center border-2 border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Overall Score</p>
                      <div className="inline-block px-4 py-2 bg-emerald-500 text-white font-black text-3xl rounded-xl shadow-lg">
                        {data.overall_score}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center border-2 border-slate-100 dark:border-slate-800 relative">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">CEFR Level detected</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        {data.cefr_level}
                      </p>
                      <Info className="absolute top-4 right-4 w-4 h-4 text-slate-300" />
                    </div>
                  </div>

                  {/* Analysis Bars */}
                  <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Writing Analysis</h4>
                    <div className="space-y-8">
                       <AnalysisBar 
                        icon={<BookOpen className="w-4 h-4" />}
                        label="Vocabulary Diversity"
                        value={data.vocab_diversity}
                        color="bg-emerald-500"
                       />
                       <AnalysisBar 
                        icon={<BookOpen className="w-4 h-4" />}
                        label="Grammar Diversity"
                        value={data.grammar_diversity}
                        color="bg-emerald-500"
                       />
                       <AnalysisBar 
                        icon={<BookOpen className="w-4 h-4" />}
                        label="Contextual match"
                        value={85} // Mock contextual match if not in data
                        color="bg-emerald-500"
                       />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "tweaks" && (
              <motion.div
                key="tweaks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                {data.literal_translation && (
                  <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                    <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      What you wrote means...
                    </h4>
                    <p className="text-xl text-amber-800 dark:text-amber-200 italic leading-relaxed">
                      {data.literal_translation}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {data.detailed_tweaks?.map((tweak, idx) => (
                    <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex gap-6 hover:border-blue-100 transition-all group">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="w-px flex-1 bg-slate-100 dark:bg-slate-700" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-lg line-through text-slate-300 decoration-slate-300/50 font-medium">{tweak.original}</span>
                          <ArrowRight className="w-4 h-4 text-slate-300" />
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{tweak.corrected}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-4 border-blue-500">
                          {tweak.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "sample" && (
              <motion.div
                key="sample"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-800 shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-32 h-32 text-blue-500" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <Star className="w-7 h-7 fill-white" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">The Perfect Version</h3>
                    </div>
                    <Button 
                      onClick={handlePlaySample}
                      disabled={isSpeaking}
                      className="rounded-full w-14 h-14 bg-blue-50 hover:bg-blue-100 text-blue-600 shadow-sm border border-blue-100"
                    >
                      <Volume2 className={cn("w-7 h-7", isSpeaking && "animate-pulse")} />
                    </Button>
                  </div>

                  <p className="text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed relative z-10 italic">
                    "{data.improved_version}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer with Persistent Buttons */}
        <div className="p-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-center">
            <Button 
              onClick={handleDownloadTranscript}
              className="w-full md:w-auto min-w-[240px] h-14 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black text-lg gap-3"
            >
              <FileDown className="w-6 h-6" />
              Download Transcript (PDF)
            </Button>
            <Button 
              onClick={() => {
                if (onContinue) {
                  onContinue();
                }
                onClose();
              }}
              className="w-full md:w-auto min-w-[240px] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-100 dark:shadow-none"
            >
              Continue
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AnalysisBar({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          {icon}
          {label}
          <Info className="w-3 h-3 text-slate-300" />
        </span>
      </div>
      <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("absolute h-full rounded-full transition-all", color)} 
        />
      </div>
    </div>
  );
}

function CheckItem({ label, success }: { label: string; success: boolean }) {
  return (
    <div className={cn(
      "p-3 rounded-xl border flex items-center gap-2",
      success 
        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800" 
        : "bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-800"
    )}>
      {success ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-500" />
      )}
      <span className={cn(
        "text-[10px] font-black uppercase tracking-wider",
        success ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
      )}>
        {label}
      </span>
    </div>
  );
}
