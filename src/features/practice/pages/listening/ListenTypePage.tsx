"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, Turtle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TranslateButton } from "@/components/ui/TranslateButton";
import AudioWaveform from "@/components/ui/AudioWaveform";
import speakerStyles from "@/components/ui/AudioSpeaker.module.css";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import styles from "./ListenTypePage.module.css";

const ACCENT_KEYS = ["e", "è", "ê", "à", "ç", "â", "î", "ô", "û", "ë", "ï", "ü"];

type ListenTypeQuestion = {
  audioText: string;
  englishText: string;
  hint: string;
  timeLimitSeconds: number;
  level: string;
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
  const { speak, isSpeaking } = useTextToSpeech();
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

  // Auto-play audio when question changes (Normal Speed)
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput("");
      setHasPlayed(false);
      setShowTranslation(false);
      setPlaybackMode(null);
      const timer = setTimeout(() => {
        handlePlayNormal();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQuestion, isCompleted]);

  const handlePlayNormal = () => {
    if (currentQuestion) {
      speak(currentQuestion.audioText, "fr-FR", 0.9);
      setPlaybackMode("normal");
      setHasPlayed(true);
      resetTimer();
    }
  };

  const handlePlaySlow = () => {
    if (currentQuestion) {
      speak(currentQuestion.audioText, "fr-FR", 0.75);
      setPlaybackMode("slow");
      setHasPlayed(true);
      resetTimer();
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
  const characterLimit = Math.max(100, currentQuestion.audioText.length);
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
        instructionFr="Écoutez attentivement et tapez la phrase complète"
        instructionEn="Listen carefully and type the full sentence"
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
            <button
              type="button"
              onClick={handlePlaySlow}
              aria-label="Play audio slowly"
              aria-pressed={isSpeaking && playbackMode === "slow"}
              title="Play audio slowly"
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white transition-[background-color,box-shadow,transform] duration-200 hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.96] motion-reduce:transition-none sm:h-[52px] sm:w-[52px] dark:focus-visible:ring-offset-slate-900",
                isSpeaking && playbackMode === "slow" && "shadow-[0_0_0_4px_rgba(14,165,233,0.2)]",
              )}
            >
              <Turtle className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handlePlayNormal}
              aria-label={hasPlayed ? "Replay audio" : "Play audio"}
              aria-pressed={isSpeaking && playbackMode === "normal"}
              title={hasPlayed ? "Replay audio" : "Play audio"}
              className={cn(
                speakerStyles.speakerButton,
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 transition-[background-color,box-shadow,transform] duration-200 hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 motion-safe:active:scale-[0.96] motion-reduce:transition-none sm:h-[52px] sm:w-[52px] dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-900/60 dark:focus-visible:ring-offset-slate-900",
                isSpeaking && playbackMode === "normal" && speakerStyles.playing,
                isSpeaking && playbackMode === "normal" && "bg-sky-500 text-white shadow-[0_0_0_4px_rgba(14,165,233,0.16)] dark:bg-sky-600 dark:text-white",
              )}
            >
              <Volume2 className={cn("h-7 w-7", speakerStyles.speakerIcon)} aria-hidden="true" />
            </button>
            <AudioWaveform isPlaying={isSpeaking} className="flex-1 pl-1" />
          </div>

          <div className={cn(styles.enterKeys, "mt-10 flex flex-wrap justify-center gap-2.5 sm:mt-12")} aria-label="French accent keyboard">
            {ACCENT_KEYS.map((char) => (
              <button
                key={char}
                type="button"
                disabled={showFeedback || userInput.length >= characterLimit}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertCharacter(char)}
                aria-label={"Insert " + char}
                className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-base font-semibold text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 motion-safe:active:scale-[0.94] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {char}
              </button>
            ))}
          </div>

          <div className={cn(styles.enterAnswer, "relative mt-8 w-full sm:mt-9")}>
            {showFeedback && (
              <TranslateButton
                iconVariant="option"
                iconSize="md"
                onClick={handleTranslate}
                disabled={!canTranslate}
                aria-label={showTranslation ? "Show French sentence" : "Translate sentence to English"}
                aria-pressed={showTranslation}
                title={showTranslation ? "Show French" : "Translate to English"}
                className="absolute left-4 top-4 z-10 h-10 w-10 rounded-none border-0 bg-transparent shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:[&_svg]:scale-125"
              />
            )}
            <label className="sr-only" htmlFor="listen-type-answer">
              {showFeedback ? (showTranslation ? "English translation" : "Correct French sentence") : "Type the full sentence you hear"}
            </label>
            <textarea
              id="listen-type-answer"
              ref={textareaRef}
              value={showFeedback ? (showTranslation ? currentQuestion.englishText : currentQuestion.audioText) : userInput}
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
                showFeedback && "pl-20 font-medium",
                showFeedback && isCorrect && "border-green-500 bg-green-50 text-green-950 focus:border-green-500 dark:border-green-500 dark:bg-green-950/30 dark:text-green-100",
                showFeedback && !isCorrect && "border-red-500 bg-red-50 text-red-950 focus:border-red-500 dark:border-red-500 dark:bg-red-950/30 dark:text-red-100",
              )}
              autoFocus
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
