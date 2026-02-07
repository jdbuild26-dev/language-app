import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, RotateCcw, Turtle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ListenTypePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  // playbackSpeed state removed - using direct handlers

  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

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
        const data = await loadMockCSV("practice/listening/listen_type.csv");
        setQuestions(data);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Auto-play audio when question changes (Normal Speed)
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput("");
      setHasPlayed(false);
      const timer = setTimeout(() => {
        handlePlayNormal();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQuestion, isCompleted]);

  const handlePlayNormal = () => {
    if (currentQuestion) {
      speak(currentQuestion.audioText, "fr-FR", 0.9);
      setHasPlayed(true);
      resetTimer();
    }
  };

  const handlePlaySlow = () => {
    if (currentQuestion) {
      speak(currentQuestion.audioText, "fr-FR", 0.75);
      setHasPlayed(true);
      resetTimer();
    }
  };

  // Normalize for comparison
  const normalize = (str) =>
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

  return (
    <>
      <PracticeGameLayout
        questionType="Listen and Type the Sentence"
        instructionFr="Écoutez attentivement et tapez la phrase complète"
        instructionEn="Listen carefully and type the full sentence"
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
        timerValue={hasPlayed ? timerString : "--:--"}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Audio Player Section */}
          <div className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex flex-col items-center gap-4">
              {/* Play Button */}
              <div className="flex items-center gap-8">
                {/* Slow Speed Button */}
                <button
                  onClick={handlePlaySlow}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
                    "bg-white/20 text-white hover:bg-white/30 active:scale-95",
                  )}
                  title="Play Slower (0.75x)"
                >
                  <Turtle className="w-6 h-6" />
                </button>

                {/* Main Play Button */}
                <button
                  onClick={handlePlayNormal}
                  disabled={isSpeaking}
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                    isSpeaking
                      ? "bg-white/30 animate-pulse"
                      : "bg-white text-emerald-600 hover:scale-105 active:scale-95",
                  )}
                >
                  <Volume2
                    className={cn(
                      "w-12 h-12",
                      isSpeaking ? "text-white" : "text-emerald-600",
                    )}
                  />
                </button>

                {/* Phantom element to balance layout if needed, or just leave as is since we are centering flex-col */}
                <div className="w-12" />
              </div>

              {/* Replay hint */}
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Click to {hasPlayed ? "replay" : "play"} audio</span>
              </div>
            </div>
          </div>

          {/* Hint */}
          <div className="w-full mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center italic">
              Hint: {currentQuestion?.hint}
            </p>
          </div>

          {/* Text Input - Textarea for longer sentences */}
          <div className="w-full">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
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
              disabled={showFeedback}
              placeholder="Type the full sentence you hear..."
              rows={3}
              className={cn(
                "w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 border-2 outline-none resize-none",
                "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100",
                "border-slate-200 dark:border-slate-700",
                "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                showFeedback && isCorrect && "border-emerald-500 bg-emerald-50",
                showFeedback && !isCorrect && "border-red-500 bg-red-50",
              )}
              autoFocus
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
              Press Ctrl+Enter to submit
            </p>
          </div>

          {/* Character count */}
          <div className="w-full mt-2 text-right">
            <span className="text-sm text-slate-400">
              {userInput.length} characters
            </span>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQuestion.audioText : null}
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
