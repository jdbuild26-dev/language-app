import { X, CheckCircle, AlertTriangle, BookOpen, Star } from "lucide-react";

export default function AnalyzeModal({ isOpen, onClose, analysisData }) {
    if (!isOpen) return null;

    // Fallback data if analysis is loading or failed
    const data = analysisData || {
        cefr_assessment: "Evaluating...",
        grammar_score: 0,
        vocabulary_score: 0,
        fluency_note: "Generating feedback...",
        feedback_points: [],
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-500";
        if (score >= 60) return "text-amber-500";
        return "text-red-500";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Session Analysis
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            Here is how you performed in this session.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Top Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                                CEFR Level
                            </div>
                            <div className="text-3xl font-bold text-sky-500">
                                {data.cefr_assessment}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                                Grammar
                            </div>
                            <div className={`text-3xl font-bold ${getScoreColor(data.grammar_score)}`}>
                                {data.grammar_score}%
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                                Vocabulary
                            </div>
                            <div className={`text-3xl font-bold ${getScoreColor(data.vocabulary_score)}`}>
                                {data.vocabulary_score}%
                            </div>
                        </div>
                    </div>

                    {/* Fluency Note */}
                    <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Star className="w-5 h-5 text-sky-500 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-sky-900 dark:text-sky-300 mb-1">
                                    Fluency Assessment
                                </h3>
                                <p className="text-sky-800 dark:text-sky-200 text-sm leading-relaxed">
                                    {data.fluency_note}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Corrections & Feedback */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                            Detailed Feedback
                        </h3>

                        {data.feedback_points.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                                <p>No major errors detected. Great job!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.feedback_points.map((point, index) => (
                                    <div
                                        key={index}
                                        className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                                    >
                                        <div className="p-4 bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                                                    Mistake
                                                </div>
                                                <p className="text-gray-800 dark:text-gray-200 line-through decoration-red-400/50">
                                                    {point.error}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-4 flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                                                    Correction
                                                </div>
                                                <p className="text-gray-900 dark:text-white mb-2">
                                                    {point.correction}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-slate-400 italic">
                                                    {point.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors"
                    >
                        Close & Return to Topics
                    </button>
                </div>
            </div>
        </div>
    );
}
