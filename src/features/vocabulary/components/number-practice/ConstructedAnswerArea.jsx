import React from "react";
import { X, Trash2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConstructedAnswerArea({
  selectedWords,
  onRemoveWord,
  onClear,
  onSubmit,
  feedback, // { show: bool, isCorrect: bool, correctAnswer: string }
  onNext,
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Your Answer
        </h3>
        {selectedWords.length > 0 && !feedback?.show && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-2 rounded-full font-semibold"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Clear
          </Button>
        )}
      </div>

      <div
        className={`flex-1 rounded-2xl border-2 border-dashed p-4 sm:p-6 flex flex-wrap content-start gap-2 sm:gap-3 min-h-[160px] transition-colors duration-300 ${
          feedback?.show
            ? feedback.isCorrect
              ? "bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
              : "bg-red-50/60 dark:bg-red-900/20 border-red-300 dark:border-red-700"
            : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
        }`}
      >
        {selectedWords.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium">
            Tap words below to build the sentence...
          </div>
        ) : (
          selectedWords.map((word, index) => (
            <div
              key={`${word}-${index}`}
              className={`group relative border-2 shadow-sm rounded-2xl px-4 py-2 text-lg sm:text-xl font-bold transition-all duration-200 ${
                feedback?.show
                  ? "cursor-default bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                  : "cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-red-300 hover:bg-red-50 dark:hover:border-red-700 dark:hover:bg-red-900/30 active:scale-95"
              }`}
              onClick={() => !feedback?.show && onRemoveWord(index)}
            >
              {word}
              {!feedback?.show && (
                <div className="absolute -top-2 -right-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white dark:border-slate-800 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500">
                  <X className="w-3 h-3" strokeWidth={3} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Inline feedback result */}
      {feedback?.show && (
        <div
          className={`mt-4 flex items-center gap-3 p-4 rounded-xl border ${
            feedback.isCorrect
              ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-7 h-7 text-red-500 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={`font-bold text-lg ${
                feedback.isCorrect
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {feedback.isCorrect ? "Correct!" : "Not quite..."}
            </p>
            {!feedback.isCorrect && feedback.correctAnswer && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-0.5 truncate">
                Correct answer:{" "}
                <span className="font-semibold">{feedback.correctAnswer}</span>
              </p>
            )}
          </div>
          <Button
            onClick={onNext}
            size="sm"
            className={`rounded-xl font-bold px-5 shadow-sm transition-all active:scale-95 ${
              feedback.isCorrect
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            Next <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* Check Answer button — hidden once feedback is showing */}
      {!feedback?.show && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={onSubmit}
            disabled={selectedWords.length === 0}
            size="lg"
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl px-8 shadow-sm hover:shadow active:scale-95 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answer
          </Button>
        </div>
      )}
    </div>
  );
}
