"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Languages, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizQuestion } from "../types";

export function StoryQuizView({ questions, darkMode }: { questions: QuizQuestion[]; darkMode: boolean }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState<Record<number, boolean>>({});
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.num] !== undefined);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setTranslatedQuestions({});
  }, [questions]);

  return (
    <main className={`min-h-full flex-1 px-5 py-8 md:px-8 lg:px-10 ${darkMode ? "bg-[#101418] text-[#e1e2e9]" : "bg-[#fbfaf7] text-[#1b1c1b]"}`}>
      <div className="w-full">
        <section className="mb-8 flex flex-col gap-5 border-b border-[#e8e4dc] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b927b]">Story check</p>
            <h1 className="font-serif text-3xl font-bold text-[#26301f]">Questions <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#54643b]" /></h1>
            {questions.length > 0 && <p className="mt-2 text-sm font-medium text-[#76786d]">Test your understanding of the story.</p>}
          </div>
          <button onClick={() => setTranslatedQuestions(Object.fromEntries(questions.map((q) => [q.num, !translatedQuestions[q.num]])))} className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c6c8ba] bg-white px-4 py-2.5 text-sm font-bold text-[#54643b] shadow-sm transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[#f4f6ee]"><Languages className="h-4 w-4" /> Translate all</button>
        </section>
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9d5cc] bg-white py-20 text-[#76786d] shadow-[0_12px_32px_rgba(70,65,54,0.04)]">
            <BookOpen className="mb-4 h-10 w-10 opacity-50" />
            <p className="font-bold">No quiz questions available for this story.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <section key={q.num} className="pb-5">
                <div className="mb-5 flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf2e5] text-sm font-extrabold text-[#54643b]">{q.num}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold leading-snug text-[#26301f] md:text-2xl">{q.question}</h2>
                    {translatedQuestions[q.num] && <p className="mt-2 text-base italic text-[#76786d]">{q.explanation || "Translation is not available for this question."}</p>}
                  </div>
                  <button onClick={() => setTranslatedQuestions((prev) => ({ ...prev, [q.num]: !prev[q.num] }))} className="rounded-lg border border-[#d9decf] p-2 text-[#54643b] transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[#f4f6ee]" aria-label="Translate question"><Languages className="h-4 w-4" /></button>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {q.options.map((option, idx) => {
                    const selected = answers[q.num] === idx;
                    const isCorrect = option.isCorrect;
                    const showCorrect = submitted && isCorrect;
                    const showWrong = submitted && selected && !isCorrect;
                    return (
                      <button key={idx} disabled={submitted} onClick={() => setAnswers((prev) => ({ ...prev, [q.num]: idx }))} className={cn("group flex h-[76px] items-center gap-3 rounded-2xl border px-3 py-3 text-left text-base font-semibold transition-[transform,border-color,background-color,color] duration-150 ease-out active:scale-[0.99]", showCorrect ? "border-[#6e8a4d] bg-[#edf3e4] text-[#344628]" : showWrong ? "border-[#d98276] bg-[#fff1ef] text-[#a13d31]" : selected ? "border-[#9aaa7b] bg-[#f1f5eb] text-[#344628]" : darkMode ? "border-[#45474a] bg-[#1d2025] hover:border-[#68745f] hover:bg-[#272a2f]" : "border-[#e4e2e0] bg-white text-[#45483e] hover:border-[#9aa886] hover:bg-[#fbfcf8]")}>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${showCorrect ? "bg-[#6e8a4d] text-white" : showWrong ? "bg-[#d98276] text-white" : selected ? "bg-[#6e8a4d] text-white" : "bg-[#ecebe5] text-[#76786d] group-hover:bg-[#dfe7d4]"}`}>
                          {showCorrect ? <CheckCircle2 className="h-4 w-4" /> : showWrong ? <XCircle className="h-4 w-4" /> : String.fromCharCode(65 + idx)}
                        </span>
                        <span className="line-clamp-2 leading-6">{option.text}</span>
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className={`mt-5 rounded-xl border p-4 text-sm leading-6 ${q.options[answers[q.num]]?.isCorrect ? "border-[#c9d9b8] bg-[#f2f7ec] text-[#456034]" : "border-[#efc8c2] bg-[#fff4f2] text-[#9b4036]"}`}>
                    <p className="mb-1 flex items-center gap-2 font-bold">{q.options[answers[q.num]]?.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {q.options[answers[q.num]]?.isCorrect ? "Correct" : "Not quite"}</p>
                    {!q.options[answers[q.num]]?.isCorrect && <p className="font-semibold">Correct answer: {q.options.find((option) => option.isCorrect)?.text || "Not available"}</p>}
                    {q.explanation && <p className="mt-2 italic">{q.explanation}</p>}
                  </div>
                )}
              </section>
            ))}
            <div className="flex flex-col gap-5 pt-2 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#76786d]"><span>{Object.keys(answers).length} of {questions.length} answered</span><span>{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[#ecebe5]"><div className="h-full rounded-full bg-[#849967] transition-[width] duration-200 ease-out" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }} /></div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="rounded-xl border border-[#d9d5cc] bg-white px-5 py-3 font-bold text-[#45483e] transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[#f7f6f2]">Reset</button>
                <button disabled={!allAnswered || submitted} onClick={() => setSubmitted(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#54643b] px-5 py-3 font-bold text-white shadow-sm transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[#465534] disabled:cursor-not-allowed disabled:opacity-50">Submit <ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
