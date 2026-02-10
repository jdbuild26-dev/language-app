import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { loadMockCSV } from "@/utils/csvLoader";

export default function ListeningComprehensionPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking, pause, resume, isPaused, cancel } =
    useTextToSpeech();

  // State
  const [scenarioData, setScenarioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Load Data
  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const data = await loadMockCSV(
          "practice/listening/listening_comprehension.csv",
        );
        if (data && data.length > 0) {
          setScenarioData(data[0]);
        }
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScenario();
  }, []);

  // Monitor isSpeaking to detect end of playback
  useEffect(() => {
    if (hasStarted && !isSpeaking && !isPaused) {
      setIsPlaying(false);
    }
  }, [isSpeaking, hasStarted, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, []); // eslint-disable-line

  const handlePlay = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
        setIsPlaying(true);
      } else {
        pause();
        setIsPlaying(false);
      }
    } else {
      setHasStarted(true);
      setIsPlaying(true);
      if (scenarioData?.audioText) {
        speak(scenarioData.audioText, "fr-FR", 0.9);
      }
    }
  };

  const handleRewind = () => {
    cancel();
    setHasStarted(true);
    setIsPlaying(true);
    if (scenarioData?.audioText) {
      speak(scenarioData.audioText, "fr-FR", 0.9);
    }
  };

  const handleInputChange = (id, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const checkAnswer = (input, question) => {
    if (!input) return false;
    const normalizedInput = input.toLowerCase().trim();
    const normalizedAnswer = question.answer.toLowerCase();

    if (normalizedInput === normalizedAnswer) return true;
    if (question.accept) {
      return question.accept.some((target) =>
        normalizedInput.includes(target.toLowerCase()),
      );
    }
    return false;
  };

  const handleSubmit = () => {
    let correctCount = 0;
    scenarioData?.questions.forEach((q) => {
      if (checkAnswer(userAnswers[q.id], q)) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
    cancel(); // Stop audio if playing
    setIsPlaying(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (!scenarioData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <button
          onClick={() => handleExit()}
          className="mt-4 px-4 py-2 border rounded hover:bg-slate-100"
        >
          Back
        </button>
      </div>
    );
  }

  const questionsCount = scenarioData?.questions?.length || 0;
  // Progress is simply based on how many questions are answered (filled)
  // or could be current question index if step-by-step. Let's do filled / total.
  const filledCount = Object.keys(userAnswers).filter(
    (k) => userAnswers[k] && userAnswers[k].trim() !== "",
  ).length;
  const progress =
    questionsCount > 0 ? (filledCount / questionsCount) * 100 : 0;

  const isAllFilled = filledCount === questionsCount;

  return (
    <PracticeGameLayout
      questionTypeFr="Compréhension Orale"
      questionTypeEn="Listening Comprehension"
      instructionFr="Écoutez le scénario et répondez aux questions"
      instructionEn="Listen to the scenario and answer the questions"
      progress={progress}
      isGameOver={isSubmitted}
      score={score}
      totalQuestions={questionsCount}
      onExit={handleExit}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={isAllFilled && !isSubmitted}
      showSubmitButton={hasStarted}
      submitLabel="CHECK"
      showFeedback={isSubmitted}
      isCorrect={score === questionsCount}
      feedbackMessage={`You got ${score} out of ${questionsCount} correct.`}
    >
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 space-y-6 pb-24">
        {/* Sticky Audio Player */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md w-full -mx-4 px-4 py-4 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-300">
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-6 shadow-inner relative overflow-hidden transition-all duration-300">
              {/* Audio Wave Animation Background */}
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
                  <div className="flex gap-1 h-full items-center justify-center w-full">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-blue-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 60 + 20}%`,
                          animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 z-10">
                <button
                  onClick={handlePlay}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
                    isPlaying
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-blue-600 hover:bg-blue-500 text-white",
                  )}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 ml-1 fill-current" />
                  )}
                </button>

                {hasStarted && (
                  <button
                    onClick={handleRewind}
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-md hover:shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 active:scale-95"
                    title="Restart Audio"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2 z-10">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                  {isPlaying
                    ? "Playing scenario..."
                    : isPaused
                      ? "Audio paused"
                      : hasStarted
                        ? "Audio complete"
                        : "Tap play to start"}
                </p>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  {isPlaying && (
                    <div className="h-full bg-blue-500 w-full animate-progress" />
                  )}
                  {!isPlaying && isPaused && (
                    <div className="h-full bg-amber-500 w-1/2" />
                  )}
                  {!isPlaying && !isPaused && hasStarted && (
                    <div className="h-full bg-blue-500 w-full" />
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center animate-in fade-in slide-in-from-top-2">
              {!hasStarted
                ? "Listen to the scenario carefully. Questions are hidden until you start listening."
                : "Focus on listening. You can pause or replay if needed."}
            </p>
          </div>
        </div>

        {/* Questions Area */}
        <div className="w-full max-w-2xl space-y-6">
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-8">
            {scenarioData.title}
          </h2>

          <div className="space-y-6">
            {scenarioData.questions.map((q, index) => {
              const isCorrectItem =
                isSubmitted && checkAnswer(userAnswers[q.id], q);
              const isWrongItem = isSubmitted && !isCorrectItem;

              return (
                <div
                  key={q.id}
                  className={cn(
                    "bg-white dark:bg-slate-950 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-500",
                    hasStarted
                      ? "opacity-100 transform translate-y-0"
                      : "opacity-40 blur-sm pointer-events-none transform translate-y-4",
                    isSubmitted &&
                      (isCorrectItem
                        ? "border-green-500 bg-green-50/10"
                        : "border-red-300 bg-red-50/10"),
                  )}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <h3 className="font-medium text-lg text-slate-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold shadow-sm">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{q.question}</span>
                  </h3>

                  <div className="pl-11">
                    <input
                      type="text"
                      value={userAnswers[q.id] || ""}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      disabled={!hasStarted || isSubmitted}
                      placeholder={q.placeholder || "Your answer..."}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 disabled:opacity-70 disabled:cursor-not-allowed",
                        isSubmitted
                          ? isCorrectItem
                            ? "border-green-200 text-green-700"
                            : "border-red-200 text-red-700"
                          : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100",
                      )}
                    />
                    {isSubmitted && !isCorrectItem && (
                      <div className="mt-3 text-sm flex items-center gap-2 text-slate-600 dark:text-slate-400 animate-in fade-in slide-in-from-top-1">
                        <span className="font-semibold text-red-500 dark:text-red-400">
                          Correct:
                        </span>
                        <span className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-green-700 dark:text-green-300 font-medium">
                          {q.answer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!hasStarted && (
            <div className="text-center p-8 bg-blue-50 dark:bg-blue-950/20 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800 animate-pulse">
              <p className="text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Click Play to start and unlock questions
              </p>
            </div>
          )}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
