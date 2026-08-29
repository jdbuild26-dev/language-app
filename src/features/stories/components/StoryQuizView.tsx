"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Languages, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizQuestion } from "../types";

export function StoryQuizView({ questions, darkMode, onProgressChange }: { questions: QuizQuestion[]; darkMode: boolean; onProgressChange: (progress: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState<Record<number, boolean>>({});
  const [translatedOptions, setTranslatedOptions] = useState<Record<string, boolean>>({});
  const [translatedExplanations, setTranslatedExplanations] = useState<Record<number, boolean>>({});
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.num] !== undefined);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setTranslatedQuestions({});
    setTranslatedOptions({});
    setTranslatedExplanations({});
  }, [questions]);

  useEffect(() => {
    const answeredCount = questions.filter((question) => answers[question.num] !== undefined).length;
    onProgressChange(questions.length > 0 ? (answeredCount / questions.length) * 100 : 0);
  }, [answers, onProgressChange, questions]);

  const toggleQuestionTranslation = (question: QuizQuestion) => {
    const next = !translatedQuestions[question.num];
    setTranslatedQuestions((prev) => ({ ...prev, [question.num]: next }));
  };

  const toggleFeedbackTranslation = (question: QuizQuestion) => {
    const next = !translatedExplanations[question.num];
    setTranslatedQuestions((prev) => ({ ...prev, [question.num]: next }));
    setTranslatedExplanations((prev) => ({ ...prev, [question.num]: next }));
    setTranslatedOptions((prev) => ({
      ...prev,
      ...Object.fromEntries(question.options.map((_, idx) => [`${question.num}-${idx}`, next])),
    }));
  };

  return (
    <main className={`min-h-full flex-1 px-4 py-6 sm:px-5 sm:py-8 md:px-8 lg:px-10 ${darkMode ? "bg-[#101418] text-[#e1e2e9]" : "bg-white text-[#191c1d]"}`}>
      <div className="w-full">
        {questions.length === 0 ? (
          <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 shadow-[0_12px_32px_rgba(70,65,54,0.04)] ${darkMode ? "border-[#48565c] bg-[#1d282d] text-[#abb7bb]" : "border-[#d9d5cc] bg-white text-[#76786d]"}`}>
            <BookOpen className="mb-4 h-10 w-10 opacity-50" />
            <p className="font-bold">No quiz questions available for this story.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <section key={q.num} className="pb-5">
                <div className="mb-5 flex items-start gap-2.5 sm:gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${darkMode ? "bg-[#2b3a40] text-[#f1f8f9]" : "bg-[#edeeee] text-[#191c1d]"}`}>{q.num}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className={`pt-1 text-lg font-bold leading-snug sm:text-xl ${darkMode ? "text-[#f1f8f9]" : "text-[#191c1d]"}`}>{q.question}</h2>
                    <div className={cn("story-quiz-translation-slot", translatedQuestions[q.num] && q.translation && "story-quiz-translation-slot--visible")}>
                      <p>{q.translation}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleQuestionTranslation(q)} className="story-icon-action flex h-8 w-8 shrink-0 items-center justify-center rounded transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97]" aria-label="Translate question"><Languages className="h-4 w-4" /></button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {q.options.map((option, idx) => {
                    const selected = answers[q.num] === idx;
                    const isCorrect = option.isCorrect;
                    const showCorrect = submitted && isCorrect;
                    const showWrong = submitted && selected && !isCorrect;
                    return (
                      <button key={idx} disabled={submitted} onClick={() => setAnswers((prev) => ({ ...prev, [q.num]: idx }))} className={cn("story-quiz-option group flex items-center gap-4 rounded-2xl border p-4 text-left text-[0.9375rem] font-medium md:text-base", showCorrect ? "story-quiz-option--correct" : showWrong ? "story-quiz-option--incorrect" : selected ? "story-quiz-option--selected" : darkMode ? "border-[#45474a] bg-[#1d2025]" : "")}>
                        <span className="story-quiz-option-label flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm font-bold">
                          {showCorrect ? <CheckCircle2 className="h-4 w-4" /> : showWrong ? <XCircle className="h-4 w-4" /> : String.fromCharCode(65 + idx)}
                        </span>
                        <span className="min-w-0 leading-6">
                          <span className="block">{option.text}</span>
                          <span className={cn("story-quiz-option-translation", translatedOptions[`${q.num}-${idx}`] && option.translation && "story-quiz-option-translation--visible")}>
                            <span>{option.translation}</span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className={cn("story-quiz-feedback mt-5 rounded-xl p-4 text-sm leading-6", q.options[answers[q.num]]?.isCorrect ? "story-quiz-feedback--correct" : "story-quiz-feedback--incorrect")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-2 font-bold">{q.options[answers[q.num]]?.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {q.options[answers[q.num]]?.isCorrect ? "Correct" : "Not quite"}</p>
                      <button onClick={() => toggleFeedbackTranslation(q)} className="shrink-0 rounded-md border border-current p-1.5 transition-transform duration-150 ease-out active:scale-[0.97]" aria-label="Translate answer options and explanation">
                        <Languages className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {q.explanation && <p className="mt-3 italic">{translatedExplanations[q.num] && q.explanationTranslation ? q.explanationTranslation : q.explanation}</p>}
                  </div>
                )}
              </section>
            ))}
            <div className="flex justify-end pt-8 sm:pt-10">
              <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row sm:gap-4">
                <button onClick={() => { setAnswers({}); setSubmitted(false); setTranslatedQuestions({}); setTranslatedOptions({}); setTranslatedExplanations({}); }} className="story-secondary-action rounded-full px-6 py-2.5 text-sm font-bold transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]">Reset</button>
                <button disabled={!allAnswered || submitted} onClick={() => setSubmitted(true)} className="story-primary-action inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed">Submit <ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
