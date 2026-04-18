"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useWritingEvaluation } from "@/hooks/useWritingEvaluation";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccentKeyboard from "@/components/ui/AccentKeyboard";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type SummariseQuestion = {
  title_fr: string;
  title_en: string;
  heading_fr: string;
  heading_en: string;
  audio_fr: string;   // TTS text — learning language
  audio_en: string;   // TTS text — known language
  timeLimitSeconds: number;
  charLimit: number;
  level: string;
};

// ─── Audio Player ─────────────────────────────────────────────────────────────

function AudioPlayer({ text, lang }: { text: string; lang: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const play = () => {
    if (!text || !window.speechSynthesis) return;
    stop();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.9;
    utteranceRef.current = utter;

    // Fake progress bar — estimate ~150 words/min
    const words = text.split(/\s+/).length;
    const durationMs = (words / 150) * 60 * 1000;
    const startTime = Date.now();

    utter.onstart = () => {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setProgress(Math.min((elapsed / durationMs) * 100, 99));
      }, 200);
    };

    utter.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utter.onerror = () => {
      setIsPlaying(false);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    window.speechSynthesis.speak(utter);
  };

  useEffect(() => () => stop(), []); // cleanup on unmount

  return (
    <div className="flex items-center gap-4 w-full max-w-2xl mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 shadow-sm">
      {/* Play / Pause button */}
      <button
        onClick={isPlaying ? stop : play}
        disabled={!text}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all",
          "bg-blue-600 hover:bg-blue-700 text-white shadow-md",
          !text && "opacity-40 cursor-not-allowed",
        )}
      >
        {isPlaying
          ? <Pause className="w-5 h-5" />
          : <Play className="w-5 h-5 ml-0.5" />
        }
      </button>

      {/* Progress bar + label */}
      <div className="flex-1 flex flex-col gap-1.5">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {isPlaying ? "Playing…" : progress === 100 ? "Finished" : "Tap play to start"}
        </span>
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SummariseAudioPage() {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [questions, setQuestions] = useState<SummariseQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const { evaluation, isSubmitting, evaluate, resetEvaluation } = useWritingEvaluation();

  const currentQ = questions[currentIndex];

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentQ?.timeLimitSeconds || 360,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !showFeedback) handleSubmit(); },
    isPaused: isLoading || isCompleted || showFeedback,
  });

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "summarise_audio",
    level: currentQ?.level,
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await loadMockCSV("practice/writing/summarise_audio.csv", {
          level: levelParam,
          learningLang: learningLang || "fr",
          knownLang: knownLang || "en",
          tag,
        });
        const raw = Array.isArray(data) ? data : [];
        const normalized: SummariseQuestion[] = raw
          .filter((item: any) =>
            (item.audio_fr || item.audio_en) &&
            (item.Category === "main" || !item.Category)
          )
          .map((item: any) => ({
            title_fr: item.title_fr || item.passage_title_fr || "",
            title_en: item.title_en || item.passage_title_en || "",
            heading_fr: item.heading_fr || "",
            heading_en: item.heading_en || "",
            audio_fr: item.audio_fr || "",
            audio_en: item.audio_en || "",
            timeLimitSeconds: item.timeLimitSeconds || item.TimeLimitSeconds || 360,
            charLimit: item.maxHighlightChars || 1000,
            level: item.level || item.Level || "",
          }));
        setQuestions(normalized);
      } catch (e) {
        console.error("SummariseAudioPage load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [levelParam, learningLang, knownLang, tag]);

  useEffect(() => {
    if (currentQ && !isCompleted) {
      setUserAnswer("");
      setShowFeedback(false);
      resetTimer();
      resetEvaluation();
      window.speechSynthesis?.cancel();
    }
  }, [currentIndex, currentQ, isCompleted, resetTimer, resetEvaluation]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (showFeedback || isSubmitting || !currentQ) return;
    const result = await evaluate({
      task_type: "summarise",
      user_text: userAnswer,
      topic: currentQ.title_en || currentQ.title_fr,
      reference: currentQ.audio_en || currentQ.audio_fr,
      context: `The user listened to a passage and must summarise it. Passage: ${currentQ.audio_en || currentQ.audio_fr}`,
      level: currentQ.level || levelParam || "A1",
    });
    if (result) {
      const finalScore = (result as any).overall_score ?? (result as any).score ?? 0;
      setShowFeedback(true);
      if (finalScore >= 70) setScore(s => s + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    resetEvaluation();
    window.speechSynthesis?.cancel();
    if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
    else setIsCompleted(true);
  };

  // ── States ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="animate-spin text-sky-500 w-8 h-8" />
    </div>
  );

  if (questions.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
      <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
    </div>
  );

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const charCount = userAnswer.length;
  const charLimit = currentQ?.charLimit || 1000;

  // Play the FR audio (learning language) — EN is the reference for AI evaluation
  const audioText = currentQ.audio_fr || currentQ.audio_en;
  const audioLang = currentQ.audio_fr ? (learningLang === "fr" ? "fr-FR" : "en-US") : "en-US";

  const instructionLabel = currentQ.heading_fr || currentQ.heading_en || "Summarise what you hear";

  return (
    <>
      <PracticeGameLayout
        questionType="Summarise What You Hear"
        instructionFr="Résumez ce que vous entendez"
        instructionEn="Summarise What You Hear"
        localizedInstruction="Résumez ce que vous entendez"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userAnswer.trim().length > 10 && !showFeedback && !isSubmitting && !evaluation}
        showSubmitButton={!showFeedback && !evaluation}
        submitLabel={isSubmitting ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
      >
        <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

          {/* Audio player */}
          <AudioPlayer text={audioText} lang={audioLang} />

          {/* Textarea card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col gap-3">

            {/* Label */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {instructionLabel}
            </p>
            <hr className="border-slate-100 dark:border-slate-800" />

            {!evaluation ? (
              <>
                <textarea
                  ref={textareaRef}
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  placeholder="Écrivez votre résumé ici…"
                  disabled={showFeedback}
                  maxLength={charLimit}
                  rows={9}
                  autoFocus
                  className={cn(
                    "w-full resize-none rounded-xl border text-sm font-medium p-4 outline-none transition-all",
                    "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100",
                    "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    "border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20",
                  )}
                />

                {/* Char counter */}
                <div className="flex justify-end">
                  <span className={cn(
                    "text-xs font-medium tabular-nums",
                    charCount >= charLimit * 0.9 ? "text-red-500" : "text-slate-400",
                  )}>
                    {charCount} / {charLimit}
                  </span>
                </div>

                {/* Accent keyboard */}
                <AccentKeyboard
                  disabled={showFeedback}
                  className=""
                  onAccentClick={(char) => {
                    const el = textareaRef.current;
                    if (!el) return;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const newVal = userAnswer.slice(0, start) + char + userAnswer.slice(end);
                    setUserAnswer(newVal);
                    requestAnimationFrame(() => {
                      el.focus();
                      el.setSelectionRange(start + 1, start + 1);
                    });
                  }}
                />
              </>
            ) : (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <WritingFeedbackResult
                  evaluation={evaluation as any}
                  mode="writing"
                  userText={userAnswer}
                  onContinue={handleContinue}
                />
              </div>
            )}
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
