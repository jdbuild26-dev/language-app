"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TranslateButton } from "@/components/ui/TranslateButton";
import AudioWaveform from "@/components/ui/AudioWaveform";
import ListeningPlaybackButton from "@/components/ui/ListeningPlaybackButton";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import styles from "./ListenTypePage.module.css";
import { useLanguage } from "@/contexts/LanguageContext";
import SpecialCharacterKeyboard from "../../components/SpecialCharacterKeyboard";

type ListenTypeQuestion = {
  audioText: string;
  englishText: string;
  hint: string;
  timeLimitSeconds: number;
  level: string;
  characterLimit?: number;
  heading_fr?: string;
  heading_en?: string;
};

export default function ListenTypePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}>
      <ListenTypeContent />
    </Suspense>
  );
}

function ListenTypeContent() {
  const handleExit = usePracticeExit();
  const { learningLang = "fr" } = useLanguage();
  const { speak, isSpeaking, cancel } = useTextToSpeech();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;

  const [questions, setQuestions] = useState<ListenTypeQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<"normal" | "slow" | null>(null);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 45;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback || !hasPlayed || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await fetchPracticeData("type_what_you_hear", { tag });
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
          const c = item.content || item;
          return {
            audioText:       c.audioText       || item.audioText       || item["Audio_FR"]           || item["Complete Sentence_FR"] || item["Complete Sentence _FR"] || "",
            englishText:     c.englishText      || item.englishText     || item["Audio_EN"]           || item["Complete Sentence_EN"] || item["Complete Sentence _EN"] || "",
            hint:            c.hint             || item.hint            || "",
            timeLimitSeconds: Number(c.timeLimitSeconds || item.timeLimitSeconds || item.TimeLimitSeconds || 45),
            level:           item.Level         || item.level           || "A1",
            characterLimit:  Number(c.characterLimit || item.characterLimit || item["Character Limit"] || 0),
            heading_fr:      c.heading_fr || item.heading_fr || item.Heading_FR || item.instructionFr || "",
            heading_en:      c.heading_en || item.heading_en || item.Heading_EN || item.instructionEn || "",
          };
        }).filter((q: any) => q.audioText);
        setQuestions(mapped);
      } catch (error) {
        console.error("Error loading listen type data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [tag]);

  // Reset each question; playback starts only from the audio controls.
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput("");
      setHasPlayed(false);
      setShowTranslation(false);
      setPlaybackMode(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  useEffect(() => {
    if (isLoading || !currentQuestion || showFeedback || isCompleted) return;
    textareaRef.current?.focus({ preventScroll: true });
  }, [isLoading, currentQuestion, showFeedback, isCompleted]);

  useEffect(() => {
    if (isLoading || !currentQuestion || showFeedback || isCompleted) return;
    const handleTyping = (event: KeyboardEvent) => {
      const input = textareaRef.current;
      const target = event.target instanceof Element ? event.target : null;
      if (!input || event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey
        || event.key.length !== 1 || document.activeElement === input
        || (event.key === " " && target?.closest('button, [role="button"]'))
        || target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="dialog"], [role="alertdialog"]')
        || document.querySelector('[aria-modal="true"], dialog[open]')) return;

      event.preventDefault();
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const next = userInput.slice(0, start) + event.key + userInput.slice(end);
      input.focus({ preventScroll: true });
      const limit = Math.max(currentQuestion.audioText.length, currentQuestion.characterLimit || 100);
      if (next.length > limit) return;
      setUserInput(next);
      requestAnimationFrame(() => input.setSelectionRange(start + event.key.length, start + event.key.length));
    };
    document.addEventListener("keydown", handleTyping);
    return () => document.removeEventListener("keydown", handleTyping);
  }, [isLoading, currentQuestion, showFeedback, isCompleted, userInput]);

  const handlePlayNormal = () => {
    if (currentQuestion) {
      speak(currentQuestion.audioText, "fr-FR", 0.9);
      setPlaybackMode("normal");
      setHasPlayed(true);
      if (!hasPlayed) resetTimer();
    }
  };

  const handlePlaySlow = () => {
    if (currentQuestion) {
      speak(currentQuestion.audioText, "fr-FR", 0.75);
      setPlaybackMode("slow");
      setHasPlayed(true);
      if (!hasPlayed) resetTimer();
    }
  };

  // Normalize for comparison
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const handleSubmit = () => {
    if (showFeedback || !userInput.trim()) return;

    const userAnswer = normalize(userInput);
    const correctAnswer = normalize(currentQuestion.audioText);
    const correct = userAnswer === correctAnswer;

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowTranslation(false);
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    cancel();
    setShowFeedback(false);
    setShowTranslation(false);
    setUserInput("");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const characterLimit = Math.max(currentQuestion.audioText.length, currentQuestion.characterLimit || 100);
  const canTranslate = Boolean(currentQuestion.englishText.trim());
  const handleTranslate = () => {
    if (showFeedback && canTranslate) setShowTranslation(visible => !visible);
  };

  const insertCharacter = (char: string) => {
    const el = textareaRef.current;
    if (!el || showFeedback) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextValue = userInput.slice(0, start) + char + userInput.slice(end);
    if (nextValue.length > characterLimit) return;
    setUserInput(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    });
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Listen and Type the Sentence"
        instructionFr={currentQuestion?.heading_fr || "Écoutez attentivement et tapez la phrase complète"}
        instructionEn={currentQuestion?.heading_en || "Listen carefully and type the full sentence"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        currentQuestionIndex={currentIndex}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInput.trim().length > 0 && !showFeedback}
        showSubmitButton
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        feedbackInFlow
        compactFeedback
        onFeedbackTranslate={canTranslate ? handleTranslate : undefined}
        feedbackTranslationVisible={showTranslation}
        submitLabel={showFeedback ? (currentIndex + 1 === questions.length ? "Finish" : "Continue") : "Check"}
        timerValue={hasPlayed ? timerString : "--:--"}
      >
        <div className="mx-auto flex w-full max-w-[888px] flex-col px-4 pb-8 pt-8 sm:px-6 sm:pt-12">
          <div className={cn(styles.enter, "flex min-h-[76px] w-full max-w-[600px] items-center gap-3 self-center rounded-[22px] border border-slate-200 bg-white px-3 py-2.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:min-h-[84px] sm:gap-4 sm:px-4 dark:border-slate-700 dark:bg-slate-900")}>
            <ListeningPlaybackButton
              mode="slow"
              onClick={handlePlaySlow}
              label="Play audio slowly"
              active={isSpeaking && playbackMode === "slow"}
            />
            <ListeningPlaybackButton
              mode="normal"
              onClick={handlePlayNormal}
              label={hasPlayed ? "Replay audio at normal speed" : "Play audio at normal speed"}
              active={isSpeaking && playbackMode === "normal"}
            />
            <AudioWaveform isPlaying={isSpeaking} className="flex-1 pl-1" />
          </div>

          {!showFeedback && (
            <SpecialCharacterKeyboard
              key={learningLang}
              learningLanguage={learningLang}
              onInsert={insertCharacter}
              disabled={userInput.length >= characterLimit}
              className={cn(styles.enterKeys, "mt-10 sm:mt-12")}
            />
          )}

          <div className={cn(styles.enterAnswer, "relative mt-8 w-full sm:mt-9")}>
            {showFeedback && (
              <div className="relative mb-6 border-b border-slate-200 px-12 pb-6 dark:border-slate-700">
                <p className="practice-type-content min-w-0 text-center font-medium text-green-800 dark:text-green-200" aria-label={showTranslation ? "English translation of the correct answer" : "Correct French answer"}>
                  {showTranslation ? currentQuestion.englishText : currentQuestion.audioText}
                </p>
              <TranslateButton
                iconVariant="option"
                iconSize="md"
                onClick={handleTranslate}
                disabled={!canTranslate}
                aria-label={showTranslation ? "Show French sentence" : "Translate sentence to English"}
                aria-pressed={showTranslation}
                title={showTranslation ? "Show French" : "Translate to English"}
                className="absolute right-0 top-0 h-10 w-10 shrink-0"
              />
              </div>
            )}
            <label className="sr-only" htmlFor="listen-type-answer">
              {showFeedback ? "Your submitted answer" : "Type the full sentence you hear"}
            </label>
            <textarea
              id="listen-type-answer"
              ref={textareaRef}
              value={userInput}
              onChange={(e) => {
                if (!showFeedback) setUserInput(e.target.value);
              }}
              onKeyDown={(e) => {
                // Submit on Ctrl+Enter or Cmd+Enter for textarea
                if (
                  (e.ctrlKey || e.metaKey) &&
                  e.key === "Enter" &&
                  !showFeedback &&
                  userInput.trim()
                ) {
                  handleSubmit();
                }
              }}
              readOnly={showFeedback}
              maxLength={characterLimit}
              rows={5}
              className={cn(
                "block min-h-[200px] w-full resize-none rounded-[20px] border-2 border-slate-200 bg-white px-6 py-5 text-lg leading-relaxed text-slate-900 outline-none transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                !showFeedback && "focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30",
                showFeedback && "font-medium",
                showFeedback && isCorrect && "border-green-500 bg-green-50 text-green-950 focus:border-green-500 dark:border-green-500 dark:bg-green-950/30 dark:text-green-100",
                showFeedback && !isCorrect && "border-red-500 bg-red-50 text-red-950 focus:border-red-500 dark:border-red-500 dark:bg-red-950/30 dark:text-red-100",
              )}
              autoFocus
              placeholder="|"
            />
          </div>

          {!showFeedback && (
            <div className="mt-3 w-full text-right text-sm tabular-nums text-slate-500 dark:text-slate-400">
              {userInput.length}/{characterLimit}
            </div>
          )}
        </div>
      </PracticeGameLayout>

    </>
  );
}
