"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Check, X } from "lucide-react";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { cn } from "@/lib/utils";
import { createAnswerPairTranslation, type AnswerPairInput } from "../lib/answerPairTranslation";

type ReadingAnswerFeedbackProps = AnswerPairInput & {
  answerNumber: string | number;
  answerClassName: "diagram-feedback-answer" | "image-feedback-answer" | "fill-feedback-answer";
  isCorrect: boolean;
  showUnanswered?: boolean;
};

/** The two coloured answers share a single translation state and translate action. */
export function ReadingAnswerFeedback({
  wrong, correct, wrongTranslation, correctTranslation, targetLang,
  answerNumber, answerClassName, isCorrect, showUnanswered = false,
}: ReadingAnswerFeedbackProps) {
  const pair = useMemo(() => createAnswerPairTranslation({ wrong, correct, wrongTranslation, correctTranslation, targetLang }),
    [wrong, correct, wrongTranslation, correctTranslation, targetLang]);
  const state = useSyncExternalStore(pair.subscribe, pair.getSnapshot, pair.getSnapshot);
  useEffect(() => () => pair.cancel(), [pair]);

  const answerClasses = cn(answerClassName,
    "flex min-h-11 min-w-0 basis-32 grow shrink items-center gap-1 rounded-xl border px-2 py-2 font-normal");
  const action = state.translated ? "Show original" : state.error ? "Retry translation of" : "Translate";
  const unansweredText = (state.translated ? targetLang === "fr" : targetLang !== "fr") ? "Aucune réponse" : "No answer";

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-stretch gap-2" role="status"
          aria-label={`Answer ${answerNumber}: ${isCorrect ? "correct" : wrong ? "incorrect" : "unanswered"}`}>
          {(wrong || showUnanswered) && (
            <div className={cn("practice-answer-wrong border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300", answerClasses)}>
              <X className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              <span className="min-w-0 break-words">{state.wrong || unansweredText}</span>
            </div>
          )}
          <div className={cn("practice-answer-correct border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300", answerClasses)}>
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            <span className="min-w-0 break-words">{state.correct}</span>
          </div>
        </div>
        <TranslateButton iconVariant="option" onClick={() => void pair.toggle()} isLoading={state.loading}
          aria-label={`${action} answer ${answerNumber}`} title={`${action} answer ${answerNumber}`}
          aria-pressed={state.translated} />
      </div>
      {state.error && <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{state.error}</p>}
    </div>
  );
}
