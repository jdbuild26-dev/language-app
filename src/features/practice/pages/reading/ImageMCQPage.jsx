import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2, Volume2 } from "lucide-react";

// MOCK_QUESTIONS removed - migrated to CSV

export default function ImageMCQPage() {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/reading/image_mcq.csv");
        setQuestions(data);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);
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
    isPaused: isCompleted || showFeedback || loading,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedOption(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const utteranceRef = React.useRef(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayAudio = (e, text) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";

    // Store reference to prevent garbage collection
    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
  };

  const handleOptionSelect = (index) => {
    if (showFeedback) return;
    setSelectedOption(index);
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

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Match Image to Description"
        instructionFr="Choisissez la description correcte"
        instructionEn="Choose the correct description"
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
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mx-auto gap-8 md:gap-16 px-4 py-6 md:py-12 h-full">
          {/* Left Column: Image Area */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-700 overflow-hidden transform transition-transform hover:scale-[1.02] duration-500">
              <span className="text-9xl md:text-[10rem] filter drop-shadow-xl animate-bounce-subtle">
                {currentQuestion?.imageEmoji}
              </span>
            </div>
          </div>

          {/* Right Column: Question & Options */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start space-y-8 max-w-lg">
            {/* Question */}
            <h3 className="text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-200 text-center w-full">
              {currentQuestion?.question}
            </h3>

            {/* Options */}
            <div className="w-full space-y-4">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showFeedback}
                  className={cn(
                    "group w-full p-4 rounded-2xl text-left text-lg font-medium transition-all duration-300 border-2 shadow-sm hover:shadow-md",
                    selectedOption === index
                      ? "bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-900/40 dark:border-amber-500 dark:text-amber-100 ring-2 ring-amber-200 dark:ring-amber-900"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent hover:border-amber-200 dark:hover:border-slate-600",
                    showFeedback && index === currentQuestion.correctIndex
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-900/40 dark:border-emerald-500 dark:text-emerald-100 ring-2 ring-emerald-200"
                      : "",
                    showFeedback &&
                      selectedOption === index &&
                      index !== currentQuestion.correctIndex
                      ? "bg-red-50 border-red-500 text-red-900 dark:bg-red-900/40 dark:border-red-500 dark:text-red-100 ring-2 ring-red-200"
                      : "",
                  )}
                >
                  <div className="flex items-center gap-5">
                    <span
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold transition-colors duration-300 shadow-sm",
                        selectedOption === index
                          ? "bg-amber-500 text-white shadow-amber-200"
                          : "bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600 dark:bg-slate-700 dark:text-slate-400 dark:group-hover:bg-slate-600",
                        showFeedback && index === currentQuestion.correctIndex
                          ? "bg-emerald-500 text-white"
                          : "",
                        showFeedback &&
                          selectedOption === index &&
                          index !== currentQuestion.correctIndex
                          ? "bg-red-500 text-white"
                          : "",
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    <div
                      onClick={(e) => handlePlayAudio(e, option)}
                      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-auto cursor-pointer z-10"
                      title="Listen"
                    >
                      <Volume2 className="w-5 h-5 text-slate-500 hover:text-blue-500" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* English Answer Display */}
            {showFeedback && currentQuestion.englishOptions && (
              <div className="w-full mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
                    Translation
                  </span>
                  Correct Answer
                </p>
                <p className="text-lg font-medium text-slate-800 dark:text-slate-200 ml-1">
                  {currentQuestion.englishOptions[currentQuestion.correctIndex]}
                </p>
              </div>
            )}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect
              ? currentQuestion.options[currentQuestion.correctIndex]
              : null
          }
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
