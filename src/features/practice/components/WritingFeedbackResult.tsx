"use client";

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Info, MessageCircle, Star, Search, Volume2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EnhancedFeedbackView, { EnhancedAnalysisData } from "./EnhancedFeedbackView";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface WritingFeedbackResultProps {
    evaluation: EnhancedAnalysisData;
    mode?: "writing" | "speaking" | "interactive";
    userText?: string;
    originalImage?: string;
    onContinue?: () => void;
}

export default function WritingFeedbackResult({ 
    evaluation, 
    mode = "writing",
    userText = "",
    originalImage,
    onContinue
}: WritingFeedbackResultProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { speak, isSpeaking } = useTextToSpeech();

    // Auto-open modal when evaluation is provided
    React.useEffect(() => {
        if (evaluation) {
            setIsModalOpen(true);
        }
    }, [evaluation]);

    if (!evaluation) return null;

    // Handle both old and new data structures for backward compatibility
    const score = evaluation.overall_score !== undefined ? evaluation.overall_score : (evaluation as any).score;
    const cefr = evaluation.cefr_level || (evaluation as any).cefr_level_estimate;
    const summary = evaluation.executive_summary || (evaluation as any).feedback;
    const originalCorrections = evaluation.detailed_tweaks || (evaluation as any).corrections || [];

    const handlePlaySample = () => {
        const text = evaluation.improved_version || (evaluation as any).improved_version;
        if (text) speak(text, "fr-FR");
    };

    return (
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Normal Mode Teaser Card */}
            <div className={cn(
                "rounded-3xl p-6 border-2 shadow-xl transition-all relative overflow-hidden group",
                score >= 70
                    ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-800"
                    : "bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-800"
            )}>
                {/* Decorative background accent */}
                <div className={cn(
                    "absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20",
                    score >= 70 ? "bg-emerald-400" : "bg-amber-400"
                )} />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                    {/* Score Circle */}
                    <div className={cn(
                        "w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-4 shadow-lg shrink-0 transform group-hover:scale-105 transition-transform duration-500",
                        score >= 70 ? "bg-emerald-500 text-white border-emerald-400" : "bg-amber-500 text-white border-amber-400"
                    )}>
                        <span className="text-3xl font-black">{score}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest leading-none opacity-80">Score</span>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-3">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">
                                AI Assessment
                            </h4>
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-black border-none">
                                CEFR {cefr}
                            </Badge>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            {summary}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                            <Button 
                                onClick={() => setIsModalOpen(true)}
                                size="sm" 
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 px-6 shadow-lg shadow-indigo-100 dark:shadow-none"
                            >
                                <Search className="w-4 h-4" />
                                Explain my answer
                            </Button>
                            
                            {evaluation.improved_version && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePlaySample}
                                    disabled={isSpeaking}
                                    className="rounded-xl border-2 border-slate-200 dark:border-slate-800 font-bold gap-2 text-slate-600 dark:text-slate-400"
                                >
                                    <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse")} />
                                    Perfect Version
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Correction List (Optional mini-view) */}
            {originalCorrections.length > 0 && (originalCorrections.slice(0, 2).map((corr: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Quick Fix</span>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    <span className="line-through text-slate-400 font-normal mr-2">{corr.original || corr.error}</span>
                                    <span className="text-emerald-600">{corr.corrected || corr.correction}</span>
                                </p>
                            </div>
                        </div>
                    )))}
                    {originalCorrections.length > 2 && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-dashed border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 group hover:bg-indigo-100/50 transition-colors"
                        >
                            <Zap className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">View {originalCorrections.length - 2} more tweaks</span>
                        </button>
                    )}

            <EnhancedFeedbackView 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onContinue={onContinue}
                data={evaluation}
                mode={mode}
                userText={userText}
                originalImage={originalImage}
            />
        </div>
    );
}
