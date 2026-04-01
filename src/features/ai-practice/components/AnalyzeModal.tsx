"use client";

import { X, CheckCircle, AlertTriangle, BookOpen, Star, Target, Briefcase, MessageSquare, Trophy, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackPoint {
  error: string;
  correction: string;
  explanation: string;
}

interface AnalysisData {
  cefr_assessment: string;
  grammar_score: number;
  vocabulary_score: number;
  fluency_note: string;
  mission_success?: boolean | null;
  mission_feedback?: string | null;
  feedback_points: FeedbackPoint[];
}

interface AnalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: AnalysisData | null;
  mode?: "chat" | "mission" | "profession" | "general";
  scenarioTitle?: string;
}

const MODE_CONFIG = {
  mission: {
    icon: Target,
    label: "Mission Complete",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-100 dark:border-indigo-800",
  },
  profession: {
    icon: Briefcase,
    label: "Professional Session",
    color: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-slate-200 dark:border-slate-700",
  },
  general: {
    icon: MessageSquare,
    label: "Conversation Complete",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-100 dark:border-purple-800",
  },
  chat: {
    icon: MessageSquare,
    label: "Session Analysis",
    color: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-900/20",
    border: "border-sky-100 dark:border-sky-800",
  },
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";
  const textColor =
    score >= 80 ? "text-emerald-600 dark:text-emerald-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-500";

  return (
    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500 dark:text-slate-400">{label}</span>
        <span className={`text-2xl font-bold ${textColor}`}>{score}%</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyzeModal({
  isOpen,
  onClose,
  analysisData,
  mode = "chat",
  scenarioTitle,
}: AnalyzeModalProps) {
  if (!isOpen) return null;

  const isLoading = !analysisData;

  const data: AnalysisData = analysisData ?? {
    cefr_assessment: "Evaluating...",
    grammar_score: 0,
    vocabulary_score: 0,
    fluency_note: "Generating feedback...",
    feedback_points: [],
  };

  const modeConfig = MODE_CONFIG[mode] ?? MODE_CONFIG.chat;
  const ModeIcon = modeConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className={cn("flex items-center justify-between p-6 border-b", modeConfig.border)}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", modeConfig.bg)}>
              <ModeIcon className={cn("w-5 h-5", modeConfig.color)} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {modeConfig.label}
              </h2>
              {scenarioTitle && (
                <p className="text-sm text-gray-500 dark:text-slate-400">{scenarioTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 dark:text-slate-400">Analysing your session...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Mission result banner — only for mission mode */}
            {mode === "mission" && data.mission_success !== null && data.mission_success !== undefined && (
              <div
                className={cn(
                  "rounded-xl p-5 flex items-start gap-4 border",
                  data.mission_success
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                )}
              >
                {data.mission_success ? (
                  <Trophy className="w-8 h-8 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3
                    className={cn(
                      "text-lg font-bold mb-1",
                      data.mission_success
                        ? "text-emerald-800 dark:text-emerald-200"
                        : "text-red-800 dark:text-red-200",
                    )}
                  >
                    {data.mission_success ? "Mission Accomplished! 🎉" : "Mission Failed"}
                  </h3>
                  {data.mission_feedback && (
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        data.mission_success
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-red-700 dark:text-red-300",
                      )}
                    >
                      {data.mission_feedback}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CEFR + scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">CEFR Level</div>
                <div className="text-3xl font-bold text-sky-500">{data.cefr_assessment}</div>
              </div>
              <ScoreBar label="Grammar" score={data.grammar_score} />
              <ScoreBar label="Vocabulary" score={data.vocabulary_score} />
            </div>

            {/* Fluency note */}
            <div className={cn("rounded-xl p-4 border flex items-start gap-3", modeConfig.bg, modeConfig.border)}>
              <Star className={cn("w-5 h-5 mt-0.5 shrink-0", modeConfig.color)} />
              <div>
                <h3 className={cn("font-semibold mb-1", modeConfig.color)}>
                  {mode === "profession" ? "Professional Assessment" : "Fluency Assessment"}
                </h3>
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                  {data.fluency_note}
                </p>
              </div>
            </div>

            {/* Detailed feedback */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-400" />
                Detailed Feedback
              </h3>

              {data.feedback_points.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p>No major errors detected. Great job!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.feedback_points.map((point, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden"
                    >
                      <div className="p-4 bg-red-50/60 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-red-500 mb-1 uppercase tracking-wide">Mistake</div>
                          <p className="text-gray-800 dark:text-gray-200 line-through decoration-red-400/60 text-sm">
                            {point.error}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wide">Correction</div>
                          <p className="text-gray-900 dark:text-white text-sm mb-1">{point.correction}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 italic">{point.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {isLoading ? "Please wait..." : "Close & Return to Topics"}
          </button>
        </div>
      </div>
    </div>
  );
}
