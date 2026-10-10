"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { CheckCircle2, Loader2, Volume2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSearchParams } from "next/navigation";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Button } from "@/components/ui/button";
import { TranslateButton } from "@/components/ui/TranslateButton";
import AudioWaveform from "@/components/ui/AudioWaveform";
import speakerStyles from "@/components/ui/AudioSpeaker.module.css";

const LISTEN_SELECT_PROMPT_CLASS =
  "practice-type-content-large font-sans font-medium";

type ListenSelectQuestion = {
  questionText: string;
  audioOptions: Array<{ french: string; english: string }>;
  correctIndex: number;
  timeLimitSeconds: number;
};

export default function ListenSelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <ListenSelectContent />
    </Suspense>
  );
}

function ListenSelectContent() {
  const handleExit = usePracticeExit();
  const { speak, cancel } = useTextToSpeech();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;

  const [questions, setQuestions] = useState<ListenSelectQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [playingOption, setPlayingOption] = useState<number | null>(null);
  const playbackIdRef = useRef(0);
  const [translatedOptions, setTranslatedOptions] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 30;

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
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchAndTransformQuestions = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPracticeData("listen_select", { tag });

        if (!data || data.length === 0) {
          setQuestions([]);
          return;
        }

        const transformed = data.map((item, index, allItems) => {
          // ── Detect which format this item is ──────────────────────────────
          //
          // Format A (mock CSV / legacy DB):
          //   audioText = FR sentence to speak
          //   options   = EN answer choices array
          //   correctIndex = index into options
          //   question  = EN question prompt
          //
          // Format B (new DB — LS001-LS005 style):
          //   Audio_FR        = FR passage to speak
          //   Question_EN     = EN question prompt
          //   Correct answer_FR / Wrong answer_1_FR … = FR answer options
          //   Correct answer_EN / Wrong answer_1_EN … = EN translations
          //
          // Format C (new DB — options_fr/options_en arrays):
          //   audioText       = FR sentence to speak
          //   options_fr      = shuffled FR answer options
          //   options_en      = shuffled EN answer options
          //   correctIndex    = index of correct option

          // ── Audio text (what gets spoken) ─────────────────────────────────
          const audioFr: string =
            item.audioText ||
            item["Audio_FR"] ||
            item["audio_fr"] ||
            "";

          // ── Question prompt (shown to user in EN) ─────────────────────────
          const questionText: string =
            item.question ||
            item["Question_EN"] ||
            item["question"] ||
            item.audioText_en ||
            "";

          // ── Build options array ───────────────────────────────────────────
          let audioOptions: Array<{ french: string; english: string }> = [];
          let correctIdx = 0;

          // Format C: options_fr / options_en arrays already in DB
          if (Array.isArray(item.options_fr) && item.options_fr.length >= 2) {
            const optsFr = item.options_fr as string[];
            const optsEn = Array.isArray(item.options_en) ? item.options_en as string[] : optsFr;
            audioOptions = optsFr.map((fr, i) => ({ french: fr, english: optsEn[i] || fr }));
            correctIdx = typeof item.correctIndex === "number" ? item.correctIndex : 0;
          }
          // Format B: Correct answer_FR + Wrong answer_N_FR columns
          else if (item["Correct answer_FR"] || item["correct_answer_fr"]) {
            const cFr = item["Correct answer_FR"] || item["correct_answer_fr"] || "";
            const cEn = item["Correct answer_EN"] || item["correct_answer_en"] || cFr;
            const pairs: Array<{ french: string; english: string }> = [{ french: cFr, english: cEn }];
            for (let i = 1; i <= 4; i++) {
              const wFr = item[`Wrong answer_${i}_FR`] || item[`wrong_answer_${i}_fr`] || "";
              const wEn = item[`Wrong answer_${i}_EN`] || item[`wrong_answer_${i}_en`] || wFr;
              if (wFr) pairs.push({ french: wFr, english: wEn });
            }
            // Shuffle and track correct
            const shuffled = pairs.map(v => ({ v, s: Math.random() })).sort((a, b) => a.s - b.s).map(x => x.v);
            correctIdx = shuffled.findIndex(o => o.french === cFr);
            if (correctIdx < 0) correctIdx = 0;
            audioOptions = shuffled;
          }
          // Format A: options array (EN) + audioText (FR) — use cross-item distractors
          else {
            let opts: string[] = [];
            if (Array.isArray(item.options)) opts = item.options;
            else if (typeof item.options === "string") {
              try { opts = JSON.parse(item.options); } catch { opts = []; }
            }

            if (opts.length >= 2) {
              // options are EN answer choices; audioText is the correct FR audio
              const cIdx = typeof item.correctIndex === "number" ? item.correctIndex : 0;
              const cFr = audioFr; // the correct FR sentence IS the audio
              // Build pairs: correct + wrong options (EN only, no FR for distractors)
              const pairs: Array<{ french: string; english: string }> = opts.map((en, i) => ({
                french: i === cIdx ? cFr : en, // only correct has real FR audio
                english: en,
              }));
              const shuffled = pairs.map(v => ({ v, s: Math.random() })).sort((a, b) => a.s - b.s).map(x => x.v);
              correctIdx = shuffled.findIndex(o => o.french === cFr);
              if (correctIdx < 0) correctIdx = 0;
              audioOptions = shuffled;
            } else {
              // Last resort: use other items as distractors
              const others = allItems
                .filter((_, j) => j !== index)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
              const distractors = others.map(o => ({
                french: o.audioText || o["Audio_FR"] || "",
                english: o.question || o["Question_EN"] || "",
              }));
              const allOpts = [{ french: audioFr, english: questionText }, ...distractors];
              const shuffled = allOpts.map(v => ({ v, s: Math.random() })).sort((a, b) => a.s - b.s).map(x => x.v);
              correctIdx = shuffled.findIndex(o => o.french === audioFr);
              if (correctIdx < 0) correctIdx = 0;
              audioOptions = shuffled;
            }
          }

          return {
            ...item,
            questionText,
            audioOptions,
            correctIndex: correctIdx,
            timeLimitSeconds: item.timeLimitSeconds || item.TimeLimitSeconds || 30,
          };
        }).filter(item => item.audioOptions.length >= 2);

        setQuestions(transformed);
      } catch (error) {
        console.error("Error loading listen select data:", error);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndTransformQuestions();
  }, [tag]);

  // Reset state on question change
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedOption(null);
      setPlayingOption(null);
      playbackIdRef.current += 1;
      setTranslatedOptions({});
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayOption = (index: number, audioText: string) => {
    const playbackId = ++playbackIdRef.current;
    setPlayingOption(index);
    speak(audioText, "fr-FR", 0.9, {
      onEnd: () => {
        if (playbackIdRef.current === playbackId) setPlayingOption(null);
      },
      onError: () => {
        if (playbackIdRef.current === playbackId) setPlayingOption(null);
      },
    });

  };

  const handleSubmit = () => {
    if (showFeedback || selectedOption === null) return;

    const correct = selectedOption === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    cancel();
    playbackIdRef.current += 1;
    setPlayingOption(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
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

  return (
    <>
      <PracticeGameLayout
        questionType="Listen and Select"
        instructionFr="Lisez et sélectionnez l'audio correspondant"
        instructionEn="Read the sentence and select the matching audio"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        currentQuestionIndex={currentIndex}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOption !== null && !showFeedback}
        showSubmitButton
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-1 min-h-full w-full items-center justify-center px-4 py-8 sm:px-6 md:py-10">
          <div className="flex w-full max-w-6xl flex-col items-center">
            {/* Main Question (English Text) */}
            <div className="mb-8 flex w-full max-w-5xl items-center justify-center border-b border-slate-200 px-4 pb-8 dark:border-slate-700 md:mb-10 md:pb-10">
              <h3
                className={`${LISTEN_SELECT_PROMPT_CLASS} text-center text-slate-800 dark:text-slate-100`}
              >
                {currentQuestion?.questionText}
              </h3>
            </div>

            {/* Audio Options Grid */}
            <div className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {currentQuestion?.audioOptions.map((optionObj, index) => {
                const isSelected = selectedOption === index;
                const isCorrectOption = index === currentQuestion.correctIndex;
                const isWrongSelection =
                  showFeedback && isSelected && !isCorrectOption;
                const isCorrectHighlight = showFeedback && isCorrectOption;
                const hasTranslation = Boolean(
                  optionObj.english && optionObj.english !== optionObj.french,
                );

                if (showFeedback) {
                  const showTranslation = Boolean(translatedOptions[index]);

                  return (
                    <div
                      key={index}
                      role="status"
                      className={cn(
                        "flex min-h-[68px] items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 shadow-sm md:min-h-[76px] dark:bg-slate-800",
                        isCorrectOption &&
                          "border-green-500 bg-green-50 dark:bg-green-900/20",
                        isWrongSelection &&
                          "border-red-500 bg-red-50 dark:bg-red-900/20",
                        !isCorrectOption && !isWrongSelection &&
                          "border-slate-200 dark:border-slate-700",
                        isWrongSelection &&
                          "ring-1 ring-red-500",
                      )}
                    >
                      <span
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center"
                        aria-hidden="true"
                      >
                        {isCorrectOption ? (
                          <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                        ) : isWrongSelection ? (
                          <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
                        ) : (
                          <span className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                        )}
                      </span>

                      <p
                        className={cn(
                          "min-w-0 flex-1 text-base font-medium leading-snug",
                          isCorrectOption
                            ? "text-green-800 dark:text-green-200"
                            : isWrongSelection
                              ? "text-red-800 dark:text-red-200"
                              : "text-slate-700 dark:text-slate-200",
                        )}
                      >
                        {showTranslation ? optionObj.english : optionObj.french}
                      </p>

                      {hasTranslation && (
                        <TranslateButton
                          iconVariant="option"
                          onClick={() =>
                            setTranslatedOptions((previous) => ({
                              ...previous,
                              [index]: !previous[index],
                            }))
                          }
                          aria-label={`${showTranslation ? "Show original" : "Translate"} option ${index + 1}`}
                          title={showTranslation ? "Show original" : "Translate option"}
                          aria-pressed={showTranslation}
                        />
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={cn(
                      "group relative flex min-h-[68px] cursor-pointer items-center gap-3 rounded-xl border-2 bg-white p-3 text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 motion-reduce:transition-none md:min-h-[76px] dark:bg-slate-800 dark:focus-visible:ring-offset-slate-950",
                      "border-slate-200 hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:hover:border-indigo-700",
                      isSelected &&
                        "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 dark:bg-indigo-900/10",
                    )}
                  >
                  <button
                    type="button"
                    onClick={() => setSelectedOption(index)}
                    aria-label={`Select audio option ${index + 1}`}
                    aria-pressed={isSelected}
                    className="absolute inset-0 z-0 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                  />
                  {/* Selection Indicator */}
                  <div
                    className={cn(
                      "pointer-events-none relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected || isCorrectHighlight
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-300",
                      isCorrectHighlight && "border-green-500 bg-green-500",
                      isWrongSelection && "border-red-500 bg-red-500",
                    )}
                  >
                    {isCorrectHighlight && (
                      <span className="font-bold text-xs">✓</span>
                    )}
                    {isWrongSelection && (
                      <span className="font-bold text-xs">✕</span>
                    )}
                    {!isCorrectHighlight && !isWrongSelection && isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Audio Visualizer & Content */}
                  <div className="pointer-events-none relative z-10 flex w-0 min-w-0 flex-1 flex-col justify-center">
                    <div className="flex w-full min-w-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePlayOption(index, optionObj.french)}
                        aria-label={`Play audio option ${index + 1}`}
                        className={cn(
                          speakerStyles.speakerButton,
                          "pointer-events-auto relative z-20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-indigo-500 transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-slate-700 dark:hover:bg-indigo-900/30 dark:focus-visible:ring-offset-slate-800",
                          playingOption === index && speakerStyles.playing,
                          (isSelected || isCorrectHighlight) &&
                            "bg-indigo-100 dark:bg-indigo-900/50",
                        )}
                      >
                        <Volume2
                          aria-hidden="true"
                          className={cn(
                            speakerStyles.speakerIcon,
                            "h-5 w-5 text-slate-500 transition-colors group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400",
                            (isSelected || isCorrectHighlight) &&
                              "text-indigo-600 dark:text-indigo-400",
                          )}
                        />
                      </button>

                      <AudioWaveform
                        isPlaying={playingOption === index}
                        tone="indigo"
                        decorative
                        className="w-0 min-w-0 flex-1"
                      />
                    </div>

                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={currentQuestion?.audioOptions?.[currentQuestion.correctIndex]?.french || ""}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
