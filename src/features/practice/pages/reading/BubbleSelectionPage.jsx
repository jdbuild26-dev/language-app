import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function BubbleSelectionPage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

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
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/reading/bubble_selection.csv");
        setQuestions(data);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Initialize available words when question changes (shuffled)
  useEffect(() => {
    if (currentQuestion) {
      // Shuffle the word bubbles for randomized display
      const bubbles = Array.isArray(currentQuestion.wordBubbles)
        ? currentQuestion.wordBubbles
        : [];
      setAvailableWords(shuffleArray(bubbles));
      setSelectedWords([]);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, resetTimer]);

  const handleWordSelect = (word, index) => {
    if (showFeedback) return;

    // Play audio for the selected word
    speak(word, "fr-FR");

    // Add word to selected and remove from available
    setSelectedWords([...selectedWords, word]);
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);
  };

  const handleWordRemove = (word, index) => {
    if (showFeedback) return;

    // Play audio for the removed word
    speak(word, "fr-FR");

    // Remove word from selected and add back to available
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  };

  const handleSubmit = () => {
    if (showFeedback || selectedWords.length === 0) return;

    // Normalize answers - remove punctuation and extra whitespace, lowercase
    const normalize = (str) =>
      str
        .toLowerCase()
        .replace(/[.,!?;:'"]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const userAnswer = normalize(selectedWords.join(" "));
    const correctAnswer = normalize(currentQuestion.correctAnswer);
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
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
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
        questionType="Translate the Sentence"
        instructionFr="Construisez la phrase en français"
        instructionEn="Build the sentence in French"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedWords.length > 0 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Source Sentence */}
          <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 shadow-lg">
            <p className="text-xl md:text-2xl text-white font-semibold text-center">
              {currentQuestion?.sourceText}
            </p>
          </div>

          {/* Correct Answer Pop-down */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 border-2 border-emerald-500 shadow-lg overflow-hidden"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  Correct Answer:
                </p>
                <p className="text-xl md:text-2xl text-slate-800 dark:text-white font-semibold">
                  {currentQuestion?.correctAnswer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer Area - Selected Words */}
          <div className="w-full min-h-[80px] bg-white dark:bg-slate-800 rounded-2xl p-4 mb-6 border-2 border-dashed border-slate-300 dark:border-slate-600 shadow-inner">
            <div className="flex flex-wrap gap-2 justify-center min-h-[48px] items-center">
              {selectedWords.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-500 italic">
                  Tap words below to build the sentence
                </p>
              ) : (
                selectedWords.map((word, index) => (
                  <button
                    key={`selected-${index}`}
                    onClick={() => handleWordRemove(word, index)}
                    disabled={showFeedback}
                    className={cn(
                      "px-4 py-2 rounded-xl text-base font-semibold transition-all duration-200 flex items-center gap-2",
                      showFeedback && isCorrect
                        ? "bg-emerald-500 text-white"
                        : showFeedback && !isCorrect
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95",
                    )}
                  >
                    {word}
                    {!showFeedback && <X className="w-4 h-4" />}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Word Bank */}
          <div className="w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {availableWords.map((word, index) => (
                <button
                  key={`available-${index}`}
                  onClick={() => handleWordSelect(word, index)}
                  disabled={showFeedback}
                  className={cn(
                    "px-4 py-2 rounded-xl text-base font-semibold transition-all duration-200 border-2",
                    "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                    "border-slate-200 dark:border-slate-700",
                    "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    "active:scale-95",
                    showFeedback && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
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
