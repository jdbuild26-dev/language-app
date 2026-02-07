import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Check,
  AlertCircle,
  Bot,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { checkGrammar } from "@/services/grammarApi";

const GrammarAICheckPage = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    setError(null);
    setFeedback(null);

    try {
      const result = await checkGrammar(
        text,
        "Check 3 sentences about daily routine using present simple.",
      );
      setFeedback(result);
    } catch (err) {
      console.error("Grammar check failed:", err);
      setError("Failed to check grammar. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bot className="w-8 h-8 text-indigo-500" />
            AI Grammar Check
          </h1>
        </div>

        {/* Instruction Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Open Ended Practice
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Write 3 sentences about your daily routine using the present
                simple depending on your level. The AI will check your grammar.
              </p>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your sentences here..."
            className="w-full h-64 p-6 resize-none focus:outline-none bg-transparent text-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-end items-center gap-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleCheck}
              disabled={!text.trim() || isChecking}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all transform active:scale-95",
                !text.trim() || isChecking
                  ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25",
              )}
            >
              {isChecking ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Check Grammar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Area */}
        {feedback && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* General Feedback Status */}
            <div
              className={cn(
                "rounded-2xl p-6 shadow-sm border",
                feedback.is_correct
                  ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    feedback.is_correct
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-indigo-100 dark:bg-indigo-900/30",
                  )}
                >
                  {feedback.is_correct ? (
                    <Check
                      className={cn(
                        "w-5 h-5",
                        feedback.is_correct
                          ? "text-green-600 dark:text-green-400"
                          : "text-indigo-600 dark:text-indigo-400",
                      )}
                    />
                  ) : (
                    <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {feedback.is_correct ? "Perfect!" : "AI Feedback"}
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feedback.feedback}
              </p>
            </div>

            {/* Corrected Text (if not fully correct) */}
            {!feedback.is_correct && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Corrected Version
                </h4>
                <p className="text-lg text-slate-800 dark:text-slate-200 font-medium">
                  {feedback.corrected_text}
                </p>
              </div>
            )}

            {/* Errors Breakdown */}
            {feedback.errors && feedback.errors.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
                  Corrections ({feedback.errors.length})
                </h4>
                {feedback.errors.map((err, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-red-100 dark:border-red-900/30 flex gap-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="line-through text-red-500/70 font-medium">
                          {err.match}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          {err.correction}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {err.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarAICheckPage;
