import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccentKeyboard from "@/components/ui/AccentKeyboard";

export default function SpellingPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
  const textareaRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 60;

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
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/writing/spelling.csv");
        // Normalize backend field names to what this component expects
        const normalized = data.map((item) => ({
          ...item,
          correctText:
            item.correctText ||
            item.CorrectAnswer_FR ||
            item["Correct Answer"] ||
            item.Correct ||
            item.correctAnswer ||
            "",
          incorrectText:
            item.incorrectText ||
            item.IncorrectWord_FR ||
            item.MisspelledWord ||
            item["Misspelled Word"] ||
            item.Incorrect ||
            item.misspelledWord ||
            "",
          englishTranslation:
            item.englishTranslation ||
            item["Word Meaning_EN"] ||
            item["Word Meaning"] ||
            item.Translation ||
            item.wordMeaningEn ||
            "",
          timeLimitSeconds:
            item.timeLimitSeconds ||
            item.TimeLimitSeconds ||
            item["Time Limit"] ||
            60,
        }));
        setQuestions(normalized);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput(""); // Start with empty input for typing exercise
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.correctText, "fr-FR");
    }
  };

  // Normalize for comparison
  const normalize = (str) =>
    (str || "").toLowerCase().replace(/\s+/g, " ").trim();

  const handleSubmit = () => {
    if (showFeedback || !userInput.trim()) return;

    const userAnswer = normalize(userInput);
    const correctAnswer = normalize(currentQuestion.correctText);
    const correct = userAnswer === correctAnswer;

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-sky-500 w-8 h-8" />
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
        questionType="Fix the Spelling"
        instructionFr="Corrigez les erreurs d'orthographe"
        instructionEn="Fix the spelling mistakes"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInput.trim().length > 0 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-4 lg:py-8 gap-6 lg:gap-8">
          {/* Header Info */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <button
              onClick={handlePlayAudio}
              disabled={isSpeaking}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm active:scale-95",
                isSpeaking
                  ? "bg-amber-100 text-amber-600 ring-2 ring-amber-200"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:text-amber-600",
              )}
            >
              <Volume2
                className={cn("w-4 h-4", isSpeaking && "animate-pulse")}
              />
              Listen to correct version
            </button>
          </div>

          {/* Dual Interface Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Wrong Passage Side */}
            <div className="flex flex-col h-full">
              <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 flex items-center justify-center min-h-[120px]">
                <p className="text-xl lg:text-2xl font-serif italic text-slate-700 dark:text-slate-300 text-center leading-relaxed">
                  "{currentQuestion?.incorrectText}"
                </p>
              </div>
            </div>

            {/* Answer Box Side */}
            <div className="flex flex-col h-full gap-2">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the correct version here..."
                disabled={showFeedback}
                rows={4}
                autoFocus
                className={cn(
                  "w-full h-full min-h-[160px] lg:min-h-0 py-6 px-6 rounded-2xl text-lg lg:text-xl font-medium transition-all duration-300 border-2 outline-none resize-none shadow-sm",
                  "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100",
                  "border-sky-200 dark:border-slate-700",
                  "focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10",
                  showFeedback &&
                    isCorrect &&
                    "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10",
                  showFeedback &&
                    !isCorrect &&
                    "border-red-500 bg-red-50 dark:bg-red-900/10",
                )}
              />
              <AccentKeyboard
                disabled={showFeedback}
                onAccentClick={(char) => {
                  const el = textareaRef.current;
                  if (!el) return;
                  const start = el.selectionStart;
                  const end = el.selectionEnd;
                  const newVal =
                    userInput.slice(0, start) + char + userInput.slice(end);
                  setUserInput(newVal);
                  requestAnimationFrame(() => {
                    el.focus();
                    el.setSelectionRange(start + 1, start + 1);
                  });
                }}
              />
            </div>
          </div>

          {/* English Translation Display - Shows after submission */}
          {showFeedback && currentQuestion?.englishTranslation && (
            <div className="w-full mt-4 p-6 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border-2 border-sky-200 dark:border-sky-700 shadow-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    English Translation
                  </span>
                </div>
              </div>
              <p className="text-center text-lg lg:text-xl font-medium text-slate-700 dark:text-slate-200 mt-3">
                "{currentQuestion.englishTranslation}"
              </p>
            </div>
          )}
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQuestion.correctText : null}
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
