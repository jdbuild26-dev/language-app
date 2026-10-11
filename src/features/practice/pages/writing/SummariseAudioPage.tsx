"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import AudioWaveform from "@/components/ui/AudioWaveform";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { imageCharacterLimit, insertImageAccent } from "@/features/practice/lib/writeImageInput";
import { useWritingEvaluation } from "@/hooks/useWritingEvaluation";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2, Play, Pause, Volume2, RotateCcw, Turtle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

const ACCENT_KEYS = ["é", "è", "ê", "à", "ç", "â", "î", "ô", "û", "ë", "ï", "ü"];

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

function AudioPlayer({ text, lang, disabled = false }: { text: string; lang: string; disabled?: boolean }) {
  const { speak, cancel, pause, resume, isSpeaking, isPaused } = useTextToSpeech();
  const [progress, setProgress] = useState(0);
  const [starting, setStarting] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [playbackError, setPlaybackError] = useState("");
  const isPlaying = !disabled && (starting || (isSpeaking && !isPaused));

  useEffect(() => {
    if (disabled) {
      cancel();
    }
  }, [disabled, cancel]);

  const startAudio = (speed = rate, position = progress) => {
    if (disabled || !text) return;
    if (!window.speechSynthesis) {
      setPlaybackError("Audio playback is unavailable on this device.");
      return;
    }
    const requested = Math.floor((Math.max(0, Math.min(100, position)) / 100) * text.length);
    const insideWord = requested > 0 && /\S/.test(text[requested] || "") && /\S/.test(text[requested - 1]);
    const nextSpace = insideWord ? text.slice(requested).search(/\s/) : 0;
    const wordEnd = nextSpace < 0 ? text.length : requested + nextSpace;
    const nextWord = text.slice(wordEnd).search(/\S/);
    const offset = nextWord < 0 ? text.length : wordEnd + nextWord;
    if (offset >= text.length) { setProgress(100); return; }
    setProgress((offset / text.length) * 100);
    setRate(speed);
    setPlaybackError("");
    setStarting(true);
    speak(text.slice(offset), lang, speed, {
      onStart: () => setStarting(false),
      onProgress: (index, total) => setProgress(Math.min(99, ((offset + (index / Math.max(1, total)) * (text.length - offset)) / text.length) * 100)),
      onEnd: () => { setStarting(false); setProgress(100); },
      onError: () => { setStarting(false); setPlaybackError("Audio playback failed. Please try again."); },
    });
  };

  const togglePlayback = () => {
    if (starting) { cancel(); setStarting(false); }
    else if (isPlaying) pause();
    else if (isPaused) resume();
    else startAudio(rate, progress >= 100 ? 0 : progress);
  };
  const smallButton = "flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50";

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex items-center justify-center gap-5">
        <button type="button" disabled={disabled || !text} onClick={() => startAudio(0.9, 0)} aria-label="Replay passage" title="Replay" className={smallButton}>
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" disabled={disabled || !text} onClick={togglePlayback} aria-label={isPlaying ? "Pause passage" : isPaused ? "Resume passage" : "Play passage"} title={isPlaying ? "Pause" : isPaused ? "Resume" : "Play"} className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-500 text-white shadow-md transition-transform hover:scale-105 hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50">
          {isPlaying ? <Pause className="h-10 w-10" aria-hidden="true" /> : isPaused || progress > 0 ? <Play className="h-10 w-10" aria-hidden="true" /> : <Volume2 className="h-10 w-10" aria-hidden="true" />}
        </button>
        <button type="button" disabled={disabled || !text} onClick={() => startAudio(0.55, 0)} aria-label="Play passage slowly" title="Slow playback" className={smallButton}>
          <Turtle className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="flex w-full items-center rounded-xl border-2 border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
        <AudioWaveform tone="sky" progress={progress} isPlaying={isPlaying} className={cn("focus-within:!outline-sky-500", disabled && "pointer-events-none opacity-60")} onSeek={position => { if (disabled) return; cancel(); setStarting(false); setProgress(position); }} />
      </div>
      <p role="status" className="text-base text-slate-500 dark:text-slate-400">{playbackError || (isPlaying ? "Playing…" : isPaused ? "Paused" : progress >= 100 ? "Finished" : "Ready to listen")}</p>
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
    isPaused: isLoading || isCompleted || showFeedback || isSubmitting,
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
        const data = await fetchPracticeData("summarise_audio", {
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
            charLimit: imageCharacterLimit(item.maxHighlightChars || 1000),
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
    if (showFeedback || isSubmitting || !currentQ || !userAnswer.trim()) return;
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
  const passageTitle = currentQ.title_fr || currentQ.title_en || "Passage";
  const insertAccent = (char: string) => {
    const el = textareaRef.current;
    if (!el || isSubmitting || showFeedback || evaluation) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextValue = insertImageAccent(userAnswer, start, end, char, charLimit);
    if (nextValue === userAnswer) return;
    setUserAnswer(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    });
  };

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
        disableContentScroll
      >
        <PracticeTwoPanel className="flex-1 overflow-y-auto md:gap-4 md:overflow-hidden md:p-4">
          <section className="practice-comprehension-scroll flex min-h-[360px] min-w-0 flex-col items-center gap-10 overflow-y-auto rounded-2xl border border-slate-200 bg-white px-5 py-6 dark:border-slate-700 dark:bg-slate-900 md:min-h-0" aria-label="Listening passage">
            <h2 className="practice-type-passage-heading !font-medium text-center text-slate-900 dark:text-slate-100">{passageTitle}</h2>
            <AudioPlayer key={currentIndex} text={audioText} lang={audioLang} disabled={isSubmitting || showFeedback || !!evaluation} />
          </section>
          <section className="flex min-h-[460px] min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:min-h-0" aria-label="Audio summary">
            <label className="sr-only" htmlFor="summarise-audio-answer">{instructionLabel}</label>
            <textarea
              id="summarise-audio-answer"
              ref={textareaRef}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (userAnswer.trim().length > 10) void handleSubmit();
                }
              }}
              placeholder="|"
              readOnly={showFeedback || !!evaluation}
              disabled={isSubmitting}
              maxLength={charLimit}
              autoFocus
              className={cn(
                "practice-type-content practice-comprehension-scroll min-h-[320px] w-full flex-1 resize-none md:min-h-0 overflow-y-auto rounded-[20px] border-2 border-slate-200 bg-white px-6 py-5 font-normal text-slate-900 outline-none transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                !showFeedback && !evaluation && !isSubmitting && "focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30",
              )}
            />
            <div className="flex shrink-0 flex-col gap-3">
              {!showFeedback && !evaluation && (
                <div className="grid w-full grid-cols-6 gap-1 xl:grid-cols-12" aria-label="French accent keyboard">
                  {ACCENT_KEYS.map(char => (
                    <button
                      key={char}
                      type="button"
                      disabled={isSubmitting || charCount >= charLimit}
                      aria-label={`Insert ${char}`}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => insertAccent(char)}
                      className="flex h-11 w-full min-w-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 motion-safe:active:scale-[0.94] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}
              <span aria-label={`${charCount} of ${charLimit} characters`} className={cn("self-end text-base font-semibold tabular-nums", charCount >= charLimit * 0.9 ? "text-red-500" : "text-slate-500 dark:text-slate-400")}>{charCount}/{charLimit}</span>
            </div>
          </section>
        </PracticeTwoPanel>
        {evaluation && (
          <WritingFeedbackResult evaluation={evaluation} mode="writing" userText={userAnswer} onContinue={handleContinue} />
        )}
      </PracticeGameLayout>
    </>
  );
}
