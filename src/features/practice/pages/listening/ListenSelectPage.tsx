"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSearchParams } from "next/navigation";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Button } from "@/components/ui/button";

export default function ListenSelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <ListenSelectContent />
    </Suspense>
  );
}

function ListenSelectContent() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking, cancel } = useTextToSpeech();
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag");

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
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
              const cEn = opts[cIdx] || opts[0] || "";
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
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted]);

  const handleOptionClick = (index, audioText) => {
    // Always allow playing audio
    cancel();
    speak(audioText, "fr-FR");

    // Only allow changing selection if feedback is not shown
    if (!showFeedback) {
      setSelectedOption(index);
    }
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
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOption !== null && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6">
          {/* Main Question (English Text) */}
          <div className="w-full bg-slate-800 text-white rounded-xl p-6 mb-6 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50"></div>
            <h3 className="text-xl md:text-2xl font-semibold leading-relaxed">
              {currentQuestion?.questionText}
            </h3>
          </div>

          {/* Audio Options Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion?.audioOptions.map((optionObj, index) => {
              const isSelected = selectedOption === index;
              const isCorrectOption = index === currentQuestion.correctIndex;
              const isWrongSelection =
                showFeedback && isSelected && !isCorrectOption;
              const isCorrectHighlight = showFeedback && isCorrectOption;

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index, optionObj.french)}
                  // Removed disabled={showFeedback} to allow audio playback
                  className={cn(
                    "group relative p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 bg-white dark:bg-slate-800 shadow-sm",
                    // Default state
                    "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md",
                    // Selected (pre-submission)
                    isSelected &&
                      !showFeedback &&
                      "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 ring-1 ring-indigo-500",
                    // Feedback: Correct
                    isCorrectHighlight &&
                      "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500",
                    // Feedback: Wrong
                    isWrongSelection &&
                      "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500",
                  )}
                >
                  {/* Selection Indicator */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
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
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Audio Visualizer & Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors",
                          (isSelected || isCorrectHighlight) &&
                            "bg-indigo-100 dark:bg-indigo-900/50",
                        )}
                      >
                        <Volume2
                          className={cn(
                            "w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors",
                            (isSelected || isCorrectHighlight) &&
                              "text-indigo-600 dark:text-indigo-400",
                          )}
                        />
                      </div>

                      {/* Fake Waveform */}
                      <div className="flex items-center gap-1 opacity-40 group-hover:opacity-60 transition-opacity">
                        {[1, 2, 3, 2, 4, 2, 1, 2, 3, 1, 2, 1].map((h, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-1 bg-slate-800 dark:bg-white rounded-full transition-all duration-300",
                              isSelected && !showFeedback
                                ? "animate-pulse"
                                : "",
                            )}
                            style={{ height: `${h * 3 + 3}px` }}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Show Text on Feedback */}
                    {showFeedback && (
                      <div className="mt-2 ml-1">
                        <p className="text-base font-medium text-slate-800 dark:text-slate-200">
                          {optionObj.french}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          {optionObj.english}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={currentQuestion?.audioOptions?.[currentQuestion.correctIndex]?.french || ""}
          userAnswer={selectedOption !== null ? currentQuestion?.audioOptions?.[selectedOption]?.french || "" : ""}
          questionContext={currentQuestion?.questionText || ""}
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
