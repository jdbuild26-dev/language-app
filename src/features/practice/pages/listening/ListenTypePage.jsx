import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Listen and Type exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    audioText: "Bonjour",
    hint: "A greeting",
    timeLimitSeconds: 45,
  },
  {
    id: 2,
    audioText: "Merci beaucoup",
    hint: "Expressing gratitude",
    timeLimitSeconds: 45,
  },
  {
    id: 3,
    audioText: "Je m'appelle Pierre",
    hint: "Introducing yourself",
    timeLimitSeconds: 45,
  },
  {
    id: 4,
    audioText: "Comment ça va?",
    hint: "Asking about wellbeing",
    timeLimitSeconds: 45,
  },
  {
    id: 5,
    audioText: "Au revoir",
    hint: "A farewell",
    timeLimitSeconds: 45,
  },
];

export default function ListenTypePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
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
    isPaused: isCompleted || showFeedback || !hasPlayed,
  });

  // Auto-play audio when question changes
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput("");
      setHasPlayed(false);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !showFeedback && userInput.trim()) {
      handleSubmit();
    }
  };

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Listen and Type"
        instructionFr="Écoutez et tapez ce que vous entendez"
        instructionEn="Listen and type what you hear"
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

          {/* Hint */}
          <div className="w-full mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center italic">
              Hint: {currentQuestion?.hint}
            </p>
          </div>

          {/* Text Input */}
          <div className="w-full">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={showFeedback}
              placeholder="Type what you hear..."
              className={cn(
                "w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 border-2 outline-none",
                "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100",
                "border-slate-200 dark:border-slate-700",
                "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                showFeedback && isCorrect && "border-emerald-500 bg-emerald-50",
                showFeedback && !isCorrect && "border-red-500 bg-red-50",
              )}
              autoFocus
            />
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
