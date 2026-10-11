"use client";

import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, XCircle, CheckCircle2, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { cn } from "@/lib/utils";

export default function ChooseOptionGamePage() {
  const router = useRouter();
  const { learningLang, knownLang } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Array<{ text: string; en?: string }>>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showEnglish, setShowEnglish] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to shuffle array
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        console.log(
          `[ChooseOption] 📡 Fetching data from backend (slug: choose_options)...`,
        );
        const response = await fetchPracticeQuestions("choose_options", {
          learningLang,
          knownLang,
        });
        const practiceData = response.data || [];
        console.log(
          `[ChooseOption] ✅ Loaded ${practiceData.length} questions`,
          { sample: practiceData[0] },
        );

        if (!practiceData || practiceData.length === 0) {
          throw new Error("No practice questions found.");
        }

        // Shuffle and pick a subset
        const gameQuestionsRaw = shuffleArray(practiceData).slice(0, 10);

        const generatedQuestions = gameQuestionsRaw.map((item) => {
          const options = [
            { text: item.Option1, en: item.Option1_EN },
            { text: item.Option2, en: item.Option2_EN },
            { text: item.Option3, en: item.Option3_EN },
            { text: item.Option4, en: item.Option4_EN },
          ].filter((o) => o.text);

          const shuffledOptions = shuffleArray(options);

          const answerValue = item.CorrectAnswers || item.CorrectAnswer || item.correctAnswer || item.Answer || "";
          const correctAnswers = Array.isArray(answerValue) ? answerValue.map(String) : String(answerValue).split("|").map((answer) => answer.trim()).filter(Boolean);
          return {
            id: item.ExerciseID || Math.random().toString(),
            question: item.Question || item.question || item.Sentence || "",
            questionEnglish: item.Question_EN || item.Sentence_EN || item.CompleteSentence_EN || "",
            correctAnswer: correctAnswers.join(" • "),
            correctAnswers,
            options: shuffledOptions,
            questionType:
              item.TypeName || item.QuestionType || "Choose from Options",
            instructionFr:
              item.Instruction_FR ||
              item.instructionFr ||
              "Complétez la phrase avec le mot correct",
            instructionEn:
              item.Instruction_EN ||
              item.instructionEn ||
              "Complete the sentence with the correct word",
            localizedInstruction:
              item.localizedInstruction ||
              item.Instruction_EN ||
              "Complete the sentence with the correct word",
            image: item.ImageURL || item.imageUrl,
          };
        });

        setQuestions(generatedQuestions);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load game data:", err);
        setError("Failed to load questions. Please check data source.");
        setLoading(false);
      }
    };

    loadGameData();
  }, [learningLang, knownLang]);

  const currentQuestion = questions[currentIndex];
  // Timer string handled by layout or internal state?
  // NOTE: Layout handles timer prop, but we aren't passing it explicitly here,
  // defaulting to PracticeGameLayout's internal timer or we should add one if needed.
  // For consistency with HighlightGame, adding basic timer here would be good,
  // but existing code didn't have one visible. Layout has a `timerValue` prop now.
  // Let's stick to existing functionality + new UI unless requested.
  // The screenshot shows "0:14", so I should probably implement a timer similar to HighlightGame.

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 20,
    mode: "timer",
    onExpire: () => {
      // Auto-submit when time expires
      if (!isGameOver && !showFeedback) {
        if (selectedOptions.length !== currentQuestion?.correctAnswers.length) {
          setIsCorrect(false);
          setFeedbackMessage("Time's up!");
          setShowFeedback(true);
        } else {
          handleSubmit();
        }
      }
    },
    isPaused: loading || isGameOver || showFeedback,
  });

  // Reset timer on next question
  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleOptionClick = (option) => {
    if (showFeedback) return;
    setSelectedOptions((current) => current.some((item) => item.text === option.text)
      ? current.filter((item) => item.text !== option.text)
      : current.length < currentQuestion.correctAnswers.length ? [...current, option] : current);
  };

  const handleSubmit = () => {
    if (selectedOptions.length !== currentQuestion.correctAnswers.length || showFeedback) return;

    const correct = selectedOptions.every((option, index) => option.text === currentQuestion.correctAnswers[index]);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowEnglish(false);
    setShowFeedback(false);
    setSelectedOptions([]);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!error && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">
          No questions found
        </h2>
        <Link href="/vocabulary/practice">
          <Button variant="outline">Back to Practice</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/vocabulary/practice">
          <Button variant="outline">Back to Practice</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType={currentQuestion?.questionType}
        instructionFr={currentQuestion?.instructionFr}
        instructionEn={currentQuestion?.instructionEn}
        localizedInstruction={currentQuestion?.localizedInstruction}
        progress={progress}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={questions.length}
        onExit={() => router.push("/vocabulary/practice")}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOptions.length === currentQuestion.correctAnswers.length || showFeedback}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : "CHECK"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
        feedbackMessage={feedbackMessage}
        compactFeedback
      >
        <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 px-4">
          <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-slate-100 px-5 py-8 dark:bg-slate-800">
            <div className="bg-transparent p-4 rounded-xl">
              <h2 className="text-center text-2xl font-medium leading-relaxed text-gray-800 dark:text-gray-100 md:text-3xl">
                {showEnglish && currentQuestion.questionEnglish ? currentQuestion.questionEnglish : (() => {
                  if (currentQuestion.question.includes("____")) {
                    return currentQuestion.question
                      .split("____")
                      .map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className={cn("mx-1 inline-block min-w-24 rounded-lg border px-3 py-0.5 align-middle", showFeedback ? selectedOptions[i]?.text === currentQuestion.correctAnswers[i] ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700" : "border-slate-300 bg-white text-slate-700")}>{showFeedback ? currentQuestion.correctAnswers[i] : selectedOptions[i]?.text || "\u00a0"}</span>
                          )}
                        </React.Fragment>
                      ));
                  }

                  return currentQuestion.question;
                })()}
              </h2>
            </div>
            {showFeedback && currentQuestion.questionEnglish && <TranslateButton className="mt-3" aria-label={showEnglish ? "Show French sentence" : "Show English sentence"} aria-pressed={showEnglish} onClick={() => setShowEnglish((value) => !value)} />}
          </div>

          {/* Right Side: Options */}
          <div className="w-full">
            {/* Context Header above options if available, essentially 'Word Meanings' logic from screenshot */}

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOptions.some((item) => item.text === option.text);
                const isCorrectOption =
                  currentQuestion.correctAnswers.includes(option.text);

                // Determine styles
                let containerClasses =
                  "relative w-full p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 group";
                let iconClasses = "w-6 h-6 shrink-0 transition-colors";

                if (showFeedback) {
                  if (isCorrectOption) {
                    containerClasses +=
                      " bg-green-50 border-green-500 ring-1 ring-green-500";
                    iconClasses += " text-green-500 fill-green-500/20";
                  } else if (isSelected && !isCorrectOption) {
                    containerClasses += " bg-red-50 border-red-500 opacity-80";
                    iconClasses += " text-red-500";
                  } else {
                    containerClasses +=
                      " bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-50";
                    iconClasses += " text-slate-300 dark:text-slate-600";
                  }
                } else {
                  if (isSelected) {
                    containerClasses +=
                      " bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500";
                    iconClasses += " text-blue-500 fill-blue-500/20";
                  } else {
                    containerClasses +=
                      " bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50";
                    iconClasses +=
                      " text-slate-300 dark:text-slate-600 group-hover:text-blue-300";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    disabled={showFeedback}
                    className={containerClasses}
                  >
                    {/* Icon */}
                    <div className={iconClasses}>
                      {isSelected || (showFeedback && isCorrectOption) ? (
                        <CheckCircle2 className="w-full h-full" />
                      ) : (
                        <Circle className="w-full h-full" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex flex-col items-start justify-center text-left">
                      <span
                        className={cn(
                          "text-lg font-medium",
                          showFeedback && isCorrectOption
                            ? "text-green-800 dark:text-green-300"
                            : showFeedback && isSelected
                              ? "text-red-800 dark:text-red-300"
                              : "text-slate-700 dark:text-slate-200",
                        )}
                      >
                        {option.text}
                      </span>
                      {showFeedback && option.en && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {option.en}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
