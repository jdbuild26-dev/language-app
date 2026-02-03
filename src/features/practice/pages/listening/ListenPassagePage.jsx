import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";




export default function ListenPassagePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [passages, setPassages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  const currentPassage = passages[currentPassageIndex];
  const currentQuestion = currentPassage?.questions[currentQuestionIndex];
  const timerDuration = currentPassage?.timeLimitSeconds || 120;
  const totalQuestions = passages.reduce(
    (acc, p) => acc + p.questions.length,
    0,
  );

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
    const fetchPassages = async () => {
      try {
        const data = await loadMockCSV("practice/listening/listen_passage.csv");
        setPassages(data);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPassages();
  }, []);


  useEffect(() => {
    if (currentPassage && !isCompleted) {
      setSelectedOption(null);
      if (currentQuestionIndex === 0) {
        setHasPlayed(false);
        // Auto-play on new passage
        setTimeout(() => handlePlayAudio(), 500);
      }
    }
  }, [currentPassageIndex, currentQuestionIndex, currentPassage, isCompleted]);

  const handlePlayAudio = () => {
    if (currentPassage) {
      speak(currentPassage.passageText, "fr-FR");
      setHasPlayed(true);
      resetTimer();
    }
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
    setSelectedOption(null);

    // Move to next question or next passage
    if (currentQuestionIndex < currentPassage.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentPassageIndex < passages.length - 1) {
      setCurrentPassageIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-rose-500 w-8 h-8" />
      </div>
    );
  }

  if (passages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
      </div>
    );
  }

  // Calculate overall progress

  let completedQuestions = 0;
  for (let i = 0; i < currentPassageIndex; i++) {
    completedQuestions += passages[i].questions.length;
  }
  completedQuestions += currentQuestionIndex + 1;
  const progress = (completedQuestions / totalQuestions) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Passage Questions"
        instructionFr="Écoutez le passage et répondez"
        instructionEn="Listen to the passage and answer"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={totalQuestions}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOption !== null && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={hasPlayed ? timerString : "--:--"}
      >
        <div className="flex flex-col lg:flex-row w-full h-full">
          {/* Left Section - Audio Player */}
          <div className="flex-1 flex items-center justify-center p-6 lg:p-8 min-h-[400px] lg:min-h-[500px]">
            <div className="w-full max-w-md">
              <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-8 shadow-lg">
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={handlePlayAudio}
                    disabled={isSpeaking}
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                      isSpeaking
                        ? "bg-white/30 animate-pulse"
                        : "bg-white/20 hover:bg-white/30 hover:scale-105",
                    )}
                  >
                    <Volume2
                      className={cn(
                        "w-10 h-10 text-white",
                        isSpeaking && "animate-pulse",
                      )}
                    />
                  </button>
                  <div className="flex items-center gap-2 text-white/90 text-base font-medium">
                    <RotateCcw className="w-5 h-5" />
                    <span>
                      Click to {hasPlayed ? "replay" : "play"} passage
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Questions */}
          <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
            <div className="w-full max-w-md">
              {/* Question indicator */}
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Question {currentQuestionIndex + 1} of{" "}
                {currentPassage?.questions.length}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Select the best title for the passage
              </h3>

              {/* Question */}
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
                {currentQuestion?.question}
              </p>

              {/* Options */}
              <div className="w-full space-y-3">
                {currentQuestion?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={showFeedback}
                    className={cn(
                      "w-full py-4 px-6 rounded-xl text-left text-base font-medium transition-all duration-200 border-2",
                      selectedOption === index
                        ? "bg-rose-500 text-white border-rose-500 shadow-lg"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-rose-400",
                      showFeedback && index === currentQuestion.correctIndex
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "",
                      showFeedback &&
                        selectedOption === index &&
                        index !== currentQuestion.correctIndex
                        ? "bg-red-500 text-white border-red-500"
                        : "",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
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
            currentPassageIndex === passages.length - 1 &&
              currentQuestionIndex === currentPassage.questions.length - 1
              ? "FINISH"
              : "CONTINUE"
          }
        />
      )}
    </>
  );
}
