import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";




export default function ListenSelectPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

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
    isPaused: isCompleted || showFeedback || !hasPlayed || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/listening/listen_select.csv");
        setQuestions(data);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);


  // Auto-play audio when question changes
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedOption(null);
      setHasPlayed(false);
      // Small delay before auto-playing
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQuestion, isCompleted]);

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.audioText, "fr-FR");
      setHasPlayed(true);
      resetTimer();
    }
  };

  const handleOptionSelect = (index) => {
    if (showFeedback) return;
    // Play TTS for the option
    speak(currentQuestion.options[index], "en-US");
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
        <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;


  return (
    <>
      <PracticeGameLayout
        questionType="Listen and Select"
        instructionFr="Écoutez et choisissez la bonne réponse"
        instructionEn="Listen and choose the correct answer"
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
        timerValue={hasPlayed ? timerString : "--:--"}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Audio Player Section */}
          <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex flex-col items-center gap-4">
              {/* Play Button */}
              <button
                onClick={handlePlayAudio}
                disabled={isSpeaking}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                  isSpeaking
                    ? "bg-white/30 animate-pulse"
                    : "bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-95",
                )}
              >
                <Volume2
                  className={cn(
                    "w-10 h-10 text-white",
                    isSpeaking && "animate-pulse",
                  )}
                />
              </button>

              {/* Replay hint */}
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Click to {hasPlayed ? "replay" : "play"} audio</span>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="w-full mb-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 text-center">
              {currentQuestion?.question}
            </h3>
          </div>

          {/* Options */}
          <div className="w-full grid grid-cols-1 gap-3">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrectOption = index === currentQuestion.correctIndex;
              const isWrongSelection =
                showFeedback && isSelected && !isCorrectOption;
              const isCorrectHighlight = showFeedback && isCorrectOption;

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showFeedback}
                  className={cn(
                    "group relative p-4 rounded-2xl border-[3px] text-left font-medium text-lg transition-all flex items-center gap-4 bg-white dark:bg-slate-800 shadow-sm",
                    // Default state
                    "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
                    // Selected (pre-submission)
                    isSelected &&
                    !showFeedback &&
                    "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300",
                    // Feedback: Correct
                    isCorrectHighlight &&
                    "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
                    // Feedback: Wrong
                    isWrongSelection &&
                    "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
                  )}
                >
                  {/* Circle Indicator */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                      isSelected || isCorrectHighlight
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-slate-300 dark:border-slate-500 text-transparent",
                      isCorrectHighlight && "border-green-500 bg-green-500",
                      isWrongSelection && "border-red-500 bg-red-500",
                    )}
                  >
                    <span className="text-[10px] font-bold">
                      {isWrongSelection ? "✕" : "✓"}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    {!showFeedback ? (
                      /* Waveform SVG (Visible before submit) */
                      <svg
                        width="120"
                        height="30"
                        viewBox="0 0 120 40"
                        className={cn(
                          "transition-colors",
                          isSelected
                            ? "text-indigo-500"
                            : "text-slate-400 dark:text-slate-500",
                        )}
                      >
                        <rect
                          x="10"
                          y="15"
                          width="3"
                          height="10"
                          fill="currentColor"
                          rx="1.5"
                        />
                        <rect
                          x="16"
                          y="10"
                          width="3"
                          height="20"
                          fill="currentColor"
                          rx="1.5"
                        />
                        <rect
                          x="22"
                          y="5"
                          width="3"
                          height="30"
                          fill="currentColor"
                          rx="1.5"
                        />
                        <rect
                          x="28"
                          y="12"
                          width="3"
                          height="16"
                          fill="currentColor"
                          rx="1.5"
                        />
                        <rect
                          x="34"
                          y="18"
                          width="3"
                          height="4"
                          fill="currentColor"
                          rx="1.5"
                        />
                        <rect
                          x="40"
                          y="8"
                          width="3"
                          height="24"
                          fill="currentColor"
                          rx="1.5"
                        />
                        <rect
                          x="46"
                          y="14"
                          width="3"
                          height="12"
                          fill="currentColor"
                          rx="1.5"
                        />
                        <rect
                          x="52"
                          y="11"
                          width="3"
                          height="18"
                          fill="currentColor"
                          rx="1.5"
                        />
                        <rect
                          x="58"
                          y="16"
                          width="3"
                          height="8"
                          fill="currentColor"
                          rx="1.5"
                        />
                        <rect
                          x="64"
                          y="13"
                          width="3"
                          height="14"
                          fill="currentColor"
                          rx="1.5"
                        />
                      </svg>
                    ) : (
                      /* Text Reveal (Visible after submit) */
                      <span className="text-lg font-medium">{option}</span>
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
