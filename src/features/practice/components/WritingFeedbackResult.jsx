import React from 'react';
import { CheckCircle2, AlertCircle, Info, MessageCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WritingFeedbackResult({ evaluation }) {
    if (!evaluation) return null;

    const { score, feedback, corrections, improved_version, cefr_level_estimate } = evaluation;

    return (
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score and General Feedback */}
            <div className={cn(
                "rounded-2xl p-4 md:p-6 border-2 shadow-sm transition-all",
                score >= 70
                    ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-800"
            )}>
                <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
                    <div className={cn(
                        "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center border-4 shadow-lg shrink-0",
                        score >= 70 ? "bg-emerald-500 text-white border-emerald-400" : "bg-amber-500 text-white border-amber-400"
                    )}>
                        <span className="text-2xl md:text-3xl font-black">{score}</span>
                        <span className="text-[8px] md:text-[10px] uppercase font-bold tracking-widest opacity-80">Score</span>
                    </div>
                    <div className="text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                AI Tutor Feedback
                                {cefr_level_estimate && (
                                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-black tracking-widest uppercase">
                                        Level: {cefr_level_estimate}
                                    </span>
                                )}
                            </h4>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                            {feedback}
                        </p>
                    </div>
                </div>
            </div>

            {/* Corrections */}
            {corrections && corrections.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <h5 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Grammar & Vocabulary Tweak
                        </h5>
                    </div>
                    <div className="p-4 space-y-3">
                        {corrections.map((corr, idx) => (
                            <div key={idx} className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="line-through text-slate-400 dark:text-slate-600">{corr.original}</span>
                                    <span className="text-emerald-600 font-bold">→ {corr.corrected}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-500 italic">"{corr.reason}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Improved Version */}
            {improved_version && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl border-2 border-blue-100 dark:border-blue-900/50 p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <Star className="w-4 h-4 md:w-5 md:h-5 text-blue-500 fill-blue-500" />
                        <span className="text-[10px] md:text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            Natural Way to Say It
                        </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium italic leading-relaxed text-base md:text-lg">
                        "{improved_version}"
                    </p>
                </div>
            )}
        </div>
    );
}
