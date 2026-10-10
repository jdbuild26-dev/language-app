"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, RotateCcw, Pause, Play, Turtle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import PracticeOptions from "@/components/ui/PracticeOptions";
import AudioWaveform from "@/components/ui/AudioWaveform";
import { TranslateButton } from "@/components/ui/TranslateButton";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";

// ─── Types ────────────────────────────────────────────────────────────────────

type ListenQuestion = {
  question: string;
  question_fr?: string;
  question_en?: string;
  options: string[];
  options_fr?: string[];
  options_en?: string[];
  correctIndex: number;
};

type ListenPassageGroup = {
  passageText: string;
  passageTranslation: string;
  title: string;
  level: string;
  timeLimitSeconds: number;
  questions: ListenQuestion[];
};

// ─── Helper: Grouping logic ───
function groupByPassage(exercises: any[]): ListenPassageGroup[] {
  const groups: ListenPassageGroup[] = [];
  const seen = new Map<string, number>();

  for (const item of exercises) {
    const c = item.content || item;
    const key = (c.passageText || c.passage_fr || "").trim();
    if (!key) continue;

    // A single exercise might contain multiple questions (legacy) 
    // or one question (standard replica format)
    const itemQuestions: ListenQuestion[] = [];
    if (Array.isArray(c.questions) && c.questions.length > 0) {
      c.questions.forEach((q: any) => {
        itemQuestions.push({
          question: q.question_fr || q.question_en || q.question || "",
          question_fr: q.question_fr || "",
          question_en: q.question_en || "",
          options: q.options_fr || q.options_en || q.options || [],
          options_fr: q.options_fr || [],
          options_en: q.options_en || [],
          correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
        });
      });
    } else if (c.question_fr || c.question_en) {
      itemQuestions.push({
        question: c.question_fr || c.question_en || "",
        question_fr: c.question_fr || "",
        question_en: c.question_en || "",
        options: c.options_fr || c.options_en || [],
        options_fr: c.options_fr || [],
        options_en: c.options_en || [],
        correctIndex: typeof item.evaluation?.correctIndex === "number" ? item.evaluation.correctIndex : 0,
      });
    }

    if (seen.has(key)) {
      groups[seen.get(key)!].questions.push(...itemQuestions);
    } else {
      seen.set(key, groups.length);
      groups.push({
        passageText: key,
        passageTranslation: c.passage_en || c.passageText_en || "",
        title: c.title_fr || c.title_en || c.passage_title_fr || "",
        level: item.Level || item.level || "A1",
        timeLimitSeconds: Number(c.timeLimitSeconds || item.timeLimitSeconds || 120),
        questions: itemQuestions,
      });
    }
  }
  return groups;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListenPassagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>}>
      <ListenPassageContent />
    </Suspense>
  );
}

function ListenPassageContent() {
  const handleExit = usePracticeExit();
  const { learningLang = "fr" } = useLanguage();
  const { speak, isSpeaking, cancel } = useTextToSpeech();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;

  const [passages, setPassages] = useState<ListenPassageGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [passageIndex, setPassageIndex] = useState(0);

  // Per-passage question states
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isStartingAudio, setIsStartingAudio] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.9);
  const [translatedQuestions, setTranslatedQuestions] = useState<Record<number, boolean>>({});
  const [showPassageTranslation, setShowPassageTranslation] = useState(false);
  const isAudioPlaying = isStartingAudio || (isSpeaking && !isPaused);
  const progressPositionRef = useRef(0);
  const progressTargetRef = useRef(0);
  const progressFrameRef = useRef<number | null>(null);
  const stopProgress = useCallback(() => {
    if (progressFrameRef.current !== null) cancelAnimationFrame(progressFrameRef.current);
    progressFrameRef.current = null;
  }, []);
  const setAudioPosition = useCallback((position: number) => {
    const bounded = Math.max(0, Math.min(100, position));
    progressPositionRef.current = bounded;
    progressTargetRef.current = bounded;
    setPlaybackProgress(bounded);
  }, []);

  // Feedback Banner states
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentPassage = passages[passageIndex];
  const { pick, pickTranslation } = useQuestionLanguage(currentPassage?.level);

  useEffect(() => {
    if (!isAudioPlaying || !currentPassage?.passageText) return;
    const charactersPerSecond = 14 * playbackRate;
    const percentPerSecond = charactersPerSecond / currentPassage.passageText.length * 100;
    let lastFrame = performance.now();
    const advance = (now: number) => {
      const elapsed = Math.min(0.1, (now - lastFrame) / 1000);
      lastFrame = now;
      const position = progressPositionRef.current;
      const gap = Math.max(0, progressTargetRef.current - position);
      // Keep moving without speech events and ease toward word/chunk updates.
      const nextPosition = Math.min(99.9, position + Math.max(percentPerSecond, gap * 3) * elapsed);
      progressPositionRef.current = nextPosition;
      setPlaybackProgress(nextPosition);
      progressFrameRef.current = requestAnimationFrame(advance);
    };
    progressFrameRef.current = requestAnimationFrame(advance);
    return stopProgress;
  }, [isAudioPlaying, currentPassage?.passageText, playbackRate, stopProgress]);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPracticeData("listen_passage", { tag });
        const exercises = Array.isArray(data) ? data : [];
        const grouped = groupByPassage(exercises);
        setPassages(grouped);
      } catch (e) {
        console.error("ListenPassage load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [tag]);

  // Reset turn state when passage changes
  useEffect(() => {
    if (currentPassage) {
      setSelectedOptions(new Array(currentPassage.questions.length).fill(null));
      setIsSubmitted(false);
      setShowFeedback(false);
      setHasPlayed(false);
      setAudioPosition(0);
      stopProgress();
      setIsStartingAudio(false);
      setIsPaused(false);
      setPlaybackRate(0.9);
      setTranslatedQuestions({});
      setShowPassageTranslation(false);
      cancel();
    }
  }, [passageIndex, currentPassage, cancel, setAudioPosition, stopProgress]);

  const totalIndividualQuestions = passages.reduce((acc, p) => acc + p.questions.length, 0);

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: totalIndividualQuestions,
    exerciseType: "listen_passage",
    level: currentPassage?.level,
  });

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentPassage?.timeLimitSeconds || 120,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !isSubmitted) handleSubmit(); },
    isPaused: isCompleted || isSubmitted || !hasPlayed || isLoading,
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const startAudio = (rate = 0.9, requestedProgress = 0) => {
    if (!currentPassage) return;
    const passageText = currentPassage.passageText;
    const requestedIndex = Math.floor((Math.max(0, Math.min(100, requestedProgress)) / 100) * passageText.length);
    const isInsideWord = requestedIndex > 0
      && /\S/.test(passageText[requestedIndex] || "")
      && /\S/.test(passageText[requestedIndex - 1]);
    const afterCurrentWord = isInsideWord ? passageText.slice(requestedIndex).search(/\s/) : 0;
    const wordStart = afterCurrentWord < 0 ? passageText.length : requestedIndex + afterCurrentWord;
    const nextWordOffset = passageText.slice(wordStart).search(/\S/);
    const startIndex = nextWordOffset < 0 ? passageText.length : wordStart + nextWordOffset;
    const remainingText = passageText.slice(startIndex);
    setAudioPosition((startIndex / Math.max(1, passageText.length)) * 100);
    if (!remainingText) { setIsPaused(false); return; }
    setIsPaused(false);
    setPlaybackRate(rate);
    setIsStartingAudio(true);
    speak(remainingText, "fr-FR", rate, {
      onStart: () => setIsStartingAudio(false),
      onProgress: (characterIndex, totalCharacters) => {
        const passagePosition = startIndex + characterIndex;
        progressTargetRef.current = totalCharacters ? Math.min(100, (passagePosition / Math.max(1, passageText.length)) * 100) : requestedProgress;
      },
      onEnd: () => { stopProgress(); setIsStartingAudio(false); setAudioPosition(100); },
      onError: () => { stopProgress(); setIsStartingAudio(false); },
    });
    setHasPlayed(true);
    if (!hasPlayed) resetTimer();
  };

  const handlePlayAudio = () => {
    if (isAudioPlaying) {
      cancel();
      stopProgress();
      setIsStartingAudio(false);
      setIsPaused(true);
    }
    else if (isPaused) startAudio(playbackRate, playbackProgress);
    else startAudio(0.9, playbackProgress >= 100 ? 0 : playbackProgress);
  };

  const handleAudioSeek = (position: number) => {
    cancel();
    stopProgress();
    setIsStartingAudio(false);
    setIsPaused(false);
    setAudioPosition(position);
  };

  const handlePlayerExit = () => {
    cancel();
    stopProgress();
    setIsStartingAudio(false);
    setIsPaused(false);
    handleExit();
  };

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedOptions(prev => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    if (isSubmitted || !currentPassage) return;
    if (selectedOptions.some(o => o === null)) return; // Ensure all answered

    setIsSubmitted(true);
    setTranslatedQuestions({});
    let correctCount = 0;
    currentPassage.questions.forEach((q, i) => {
      if (selectedOptions[i] === q.correctIndex) correctCount++;
    });

    setScore(s => s + correctCount);
    const allCorrect = correctCount === currentPassage.questions.length;
    setIsCorrect(allCorrect);
    setFeedbackMessage(allCorrect ? getFeedbackMessage(true) : `${correctCount}/${currentPassage.questions.length} correct`);
    setShowFeedback(true);
    setIsStartingAudio(false);
    setIsPaused(false);
    cancel();
    stopProgress();
  }, [isSubmitted, currentPassage, selectedOptions, cancel, stopProgress]);

  const handleContinue = () => {
    setShowFeedback(false);
    if (passageIndex < passages.length - 1) setPassageIndex(i => i + 1);
    else setIsCompleted(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="animate-spin text-rose-500 w-8 h-8" />
    </div>
  );

  if (passages.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
      <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
    </div>
  );

  const progress = ((passageIndex + 1) / passages.length) * 100;
  const allAnswered = selectedOptions.every(o => o !== null);

  return (
    <>
      <PracticeGameLayout
        questionType="Passage Questions"
        instructionFr="Écoutez le passage et répondez aux questions"
        instructionEn="Listen to the passage and answer all questions"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={passages.length}
        onExit={handlePlayerExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={(allAnswered || showFeedback) && hasPlayed}
        showSubmitButton={true}
        submitLabel={showFeedback ? (passageIndex === passages.length - 1 ? "FINISH" : "CONTINUE") : "Check Answers"}
        timerValue={hasPlayed ? timerString : "--:--"}
      >
        <PracticeTwoPanel ratio="three-two" className="md:gap-4 md:p-4">
          {/* LEFT — Passage heading and audio player */}
          <section className={cn("flex min-h-[18rem] min-w-0 flex-col md:min-h-0", isSubmitted ? "gap-4" : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6")} aria-label="Passage audio">
            {!isSubmitted && (
            <h2 className="practice-type-content-heading mb-5 border-b border-slate-200 pb-3 text-slate-900 dark:border-slate-700 dark:text-slate-100">
              {currentPassage.title || "Passage"}
            </h2>
            )}
            <div className={cn("flex w-full items-center", isSubmitted ? "shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row" : "my-auto flex-col gap-6 py-6")}>
              <div className={cn("flex shrink-0 items-center justify-center", isSubmitted ? "gap-2" : "gap-3 sm:gap-5")}>
                <button type="button" onClick={() => { cancel(); startAudio(); }} aria-label="Replay passage" title="Replay" className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50">
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                </button>
                <button type="button" onClick={handlePlayAudio} aria-label={isAudioPlaying ? "Pause passage" : isPaused ? "Resume passage" : playbackProgress > 0 && playbackProgress < 100 ? "Play passage from selected position" : "Play passage from beginning"} title={isAudioPlaying ? "Pause" : isPaused ? "Resume" : "Play"} className={cn("flex items-center justify-center rounded-full shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2", isSubmitted ? "h-12 w-12" : "h-20 w-20", isAudioPlaying ? "bg-rose-600 text-white" : "bg-rose-500 text-white hover:bg-rose-600")}>
                  {isAudioPlaying ? <Pause className={isSubmitted ? "h-6 w-6" : "h-9 w-9"} aria-hidden="true" /> : isPaused || (hasPlayed && playbackProgress < 100) ? <Play className={isSubmitted ? "h-6 w-6" : "h-9 w-9"} aria-hidden="true" /> : <Volume2 className={isSubmitted ? "h-6 w-6" : "h-9 w-9"} aria-hidden="true" />}
                </button>
                <button type="button" onClick={() => startAudio(0.55)} aria-label="Play passage slowly" title="Slow playback" className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50">
                  <Turtle className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className={cn("flex w-full min-w-0 items-center", isSubmitted ? "flex-1 py-3" : "max-w-2xl gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-700 dark:bg-slate-900")}>
                <AudioWaveform
                  tone="rose"
                  isPlaying={isAudioPlaying}
                  progress={playbackProgress}
                  onSeek={handleAudioSeek}
                />
              </div>
              {!isSubmitted && <p className="practice-type-meta font-medium text-slate-500 dark:text-slate-400" aria-live="polite">
                {isAudioPlaying ? "En cours de lecture…" : isPaused ? "En pause" : "Prêt pour l’écoute"}
              </p>}
            </div>
            {isSubmitted && (
              <section className="practice-comprehension-scroll min-h-[18rem] min-w-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:min-h-0 md:p-6" aria-label="Passage transcript">
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
                  <h2 className="practice-type-content-heading text-slate-900 dark:text-slate-100">{currentPassage.title || "Passage"}</h2>
                  {currentPassage.passageTranslation && currentPassage.passageTranslation !== currentPassage.passageText && (
                    <TranslateButton onClick={() => setShowPassageTranslation(value => !value)} aria-label={showPassageTranslation ? "Hide passage translation" : "Translate passage"} title={showPassageTranslation ? "Hide passage translation" : "Translate passage"} aria-expanded={showPassageTranslation} />
                  )}
                </div>
                <p className="practice-type-content whitespace-pre-line text-slate-700 dark:text-slate-200">
                  {currentPassage.passageText}
                </p>
                {showPassageTranslation && currentPassage.passageTranslation && (
                  <p className="practice-type-content mt-6 whitespace-pre-line border-t border-slate-200 pt-5 text-slate-700 dark:border-slate-700 dark:text-slate-200">
                    {currentPassage.passageTranslation}
                  </p>
                )}
              </section>
            )}
          </section>

          {/* RIGHT — Questions, sized like Reading Comprehension */}
          <section className="practice-comprehension-scroll flex min-h-[18rem] min-w-0 flex-col gap-6 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:min-h-0 md:p-5" aria-label="Questions">
              {currentPassage.questions.map((q, qIdx) => {
                const questionText = pick(q.question_fr, q.question_en) || q.question;
                const translatedQuestionText = pickTranslation(q.question_fr, q.question_en);
                const options = learningLang === "fr"
                  ? q.options_fr?.length ? q.options_fr : q.options
                  : q.options_en?.length ? q.options_en : q.options;
                const translationOptions = learningLang === "fr" ? q.options_en || [] : q.options_fr || [];
                const canTranslateQuestion = Boolean(translatedQuestionText && translatedQuestionText !== questionText);
                const canTranslateOptions = translationOptions.length === options.length
                  && translationOptions.some((option, index) => Boolean(option && option !== options[index]));
                const canTranslate = canTranslateQuestion || (isSubmitted && canTranslateOptions);
                const isTranslated = Boolean(translatedQuestions[qIdx] && canTranslate);
                const shownQuestion = isTranslated && canTranslateQuestion ? translatedQuestionText : questionText;
                const shownOptions = isSubmitted && isTranslated && canTranslateOptions
                  ? options.map((option, index) => translationOptions[index] || option)
                  : options;

                return (
                  <div key={qIdx} className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${qIdx * 100}ms` }}>
                    <div className="flex items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                        {qIdx + 1}
                      </span>
                      <h3 className="practice-type-question-heading min-w-0 flex-1 border-b border-slate-200 pb-3 text-slate-900 dark:border-slate-700 dark:text-slate-100">
                        {shownQuestion}
                      </h3>
                      {canTranslate && (
                        <TranslateButton
                          iconVariant="option"
                          iconSize="md"
                          onClick={() => setTranslatedQuestions(previous => ({ ...previous, [qIdx]: !previous[qIdx] }))}
                          aria-label={isTranslated ? "Show original" : isSubmitted ? "Translate question and answers" : "Translate question"}
                          title={isTranslated ? "Show original" : isSubmitted ? "Translate question and answers" : "Translate question"}
                          aria-pressed={isTranslated}
                        />
                      )}
                    </div>

                    <PracticeOptions
                      options={shownOptions}
                      selectedOption={selectedOptions[qIdx]}
                      correctIndex={isSubmitted ? q.correctIndex : undefined}
                      showFeedback={isSubmitted}
                      onSelect={(optIdx) => handleOptionSelect(qIdx, optIdx)}
                      itemClassName="!min-h-16 !items-center !rounded-xl !border !px-3 !py-2.5 !font-normal"
                    />
                    
                    {qIdx < currentPassage.questions.length - 1 && <div className="pt-4 border-b border-slate-50 dark:border-slate-800/50" />}
                  </div>
                );
              })}
          </section>
        </PracticeTwoPanel>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={passageIndex === passages.length - 1 ? "FINISH" : "CONTINUE"}
        />
      )}
    </>
  );
}
