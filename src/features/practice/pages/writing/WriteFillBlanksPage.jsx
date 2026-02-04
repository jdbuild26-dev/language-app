import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

import { loadMockCSV } from "@/utils/csvLoader";

export default function WriteFillBlanksPage() {
  const handleExit = usePracticeExit();
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState({}); // { wordIndex_charIndex: char }
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const inputRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMockCSV("practice/writing/write_fill_blanks.csv");
      setQuestions(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const currentExercise = questions[currentIndex];

  // Helper to split passage into words while keeping punctuation
  const wordsWithPunctuation = currentExercise?.passage?.split(/(\s+)/) || [];

  // Identify which indices are words that should be blanked
  // We match targetWords sequentially to handle multiple occurrences
  let targetPointer = 0;
  const processedWords = wordsWithPunctuation.map((word, idx) => {
    const cleanWord = word.replace(/[.,!?;:]/g, "").trim();
    const shouldBlank =
      cleanWord.length > 1 &&
      targetPointer < currentExercise.targetWords.length &&
      cleanWord.toLowerCase() ===
        currentExercise.targetWords[targetPointer].toLowerCase();

    const result = {
      text: word,
      clean: cleanWord,
      isTarget: shouldBlank,
      targetIndex: shouldBlank ? targetPointer : -1,
    };

    if (shouldBlank) targetPointer++;
    return result;
  });

  const { timerString, resetTimer } = useExerciseTimer({
    duration: 120,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        handleSubmit();
      }
    },
    isPaused: isLoading || isCompleted || showFeedback,
  });

  useEffect(() => {
    setUserInputs({});
    setShowFeedback(false);
    resetTimer();
  }, [currentIndex]);

  const handleCharInput = (wordIdx, charIdx, value, maxLength) => {
    const rawChar = value.slice(-1); // Only take the last char if they pasted or something
    if (!rawChar && value !== "") return; // Protect against weirdness

    const key = `${wordIdx}_${charIdx}`;
    setUserInputs((prev) => ({ ...prev, [key]: rawChar }));

    // Auto-focus next box
    if (rawChar !== "") {
      if (charIdx < maxLength - 1) {
        inputRefs.current[`${wordIdx}_${charIdx + 1}`]?.focus();
      } else {
        // Find next word's first blank
        const nextTarget = processedWords.findIndex(
          (w, i) => i > wordIdx && w.isTarget,
        );
        if (nextTarget !== -1) {
          inputRefs.current[`${nextTarget}_0`]?.focus();
        }
      }
    }
  };

  const handleKeyDown = (e, wordIdx, charIdx) => {
    if (e.key === "Backspace" && !userInputs[`${wordIdx}_${charIdx}`]) {
      // Move to previous box
      if (charIdx > 0) {
        inputRefs.current[`${wordIdx}_${charIdx - 1}`]?.focus();
      } else {
        const prevTarget = [...processedWords]
          .slice(0, wordIdx)
          .reverse()
          .find((w) => w.isTarget);
        if (prevTarget) {
          const pIdx = processedWords.indexOf(prevTarget);
          const pWord = processedWords[pIdx];
          const lastCharIdx =
            pWord.clean.length - Math.floor(pWord.clean.length / 2) - 1;
          inputRefs.current[`${pIdx}_${lastCharIdx}`]?.focus();
        }
      }
    }
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    let allCorrect = true;
    processedWords.forEach((word, wIdx) => {
      if (!word.isTarget) return;
      const keepCount = Math.floor(word.clean.length / 2);
      const blankCount = word.clean.length - keepCount;
      const expectedTail = word.clean.slice(keepCount).toLowerCase();

      let userTail = "";
      for (let i = 0; i < blankCount; i++) {
        userTail += (userInputs[`${wIdx}_${i}`] || "").toLowerCase();
      }

      if (userTail !== expectedTail) allCorrect = false;
    });

    setIsCorrect(allCorrect);
    setShowFeedback(true);
    if (allCorrect) setScore((s) => s + 1);
  };

  const handleContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No exercise data available.
        </p>
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType="C-Test Passage"
        instructionEn="Complete the text with the correct words"
        progress={((currentIndex + 1) / (questions.length || 1)) * 100}
        totalQuestions={questions.length}
        isGameOver={isCompleted}
        score={score}
        onExit={handleExit}
        onNext={handleSubmit}
        timerValue={timerString}
        showSubmitButton={!showFeedback}
        submitLabel="Check Answers"
      >
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-16 shadow-2xl border-4 border-slate-100 dark:border-slate-800 relative overflow-hidden">
            {/* Header / Title */}
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-white uppercase">
                {currentExercise.title}
              </h2>
              <div className="h-1 w-16 bg-blue-500 mx-auto mt-4 rounded-full" />
            </div>

            {/* The Text Container */}
            <div className="text-xl lg:text-2xl leading-[3.5rem] text-slate-700 dark:text-slate-300">
              {processedWords.map((word, wIdx) => {
                if (!word.isTarget) {
                  return <span key={wIdx}>{word.text}</span>;
                }

                const keepCount = Math.floor(word.clean.length / 2);
                const blankCount = word.clean.length - keepCount;
                const head = word.clean.slice(0, keepCount);
                const tail = word.clean.slice(keepCount);
                const hasPunctuation = word.text !== word.clean;
                const punc = hasPunctuation
                  ? word.text.slice(word.clean.length)
                  : "";

                return (
                  <span
                    key={wIdx}
                    className="inline-flex items-center mx-0.5 align-middle group"
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {head}
                    </span>
                    <div className="flex gap-1 mx-1">
                      {Array.from({ length: blankCount }).map((_, cIdx) => {
                        const key = `${wIdx}_${cIdx}`;
                        const isIncorrect =
                          showFeedback &&
                          (userInputs[key] || "").toLowerCase() !==
                            tail[cIdx].toLowerCase();
                        return (
                          <input
                            key={cIdx}
                            ref={(el) => (inputRefs.current[key] = el)}
                            type="text"
                            value={
                              showFeedback ? tail[cIdx] : userInputs[key] || ""
                            }
                            onChange={(e) =>
                              handleCharInput(
                                wIdx,
                                cIdx,
                                e.target.value,
                                blankCount,
                              )
                            }
                            onKeyDown={(e) => handleKeyDown(e, wIdx, cIdx)}
                            disabled={showFeedback}
                            className={cn(
                              "w-7 h-9 lg:w-9 lg:h-11 rounded-lg border-2 text-center text-lg lg:text-xl transition-all focus:scale-110 focus:z-10",
                              "bg-slate-50 dark:bg-slate-800 font-medium",
                              showFeedback
                                ? isIncorrect
                                  ? "border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20"
                                  : "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                                : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10",
                            )}
                          />
                        );
                      })}
                    </div>
                    {punc && <span>{punc}</span>}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          onContinue={handleContinue}
          message={
            isCorrect
              ? "Perfect! Your grammar and spelling are spot on."
              : "Some words aren't quite right. Keep practicing!"
          }
          continueLabel={
            currentIndex < questions.length - 1 ? "NEXT PASSAGE" : "FINISH"
          }
        />
      )}
    </>
  );
}
