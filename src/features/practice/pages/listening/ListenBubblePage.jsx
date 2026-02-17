import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Loader2, X, Volume2, RotateCcw } from "lucide-react";
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

export default function ListenBubblePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

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
  const [playedAudio, setPlayedAudio] = useState(false);

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
        const data = await loadMockCSV("practice/listening/listen_bubble.csv");
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
      // Generate bubbles from sentence if not provided
      let words = [];
      if (Array.isArray(currentQuestion.wordBubbles)) {
        words = currentQuestion.wordBubbles;
      } else {
        // Simple split by space, can be improved to handle punctuation
        // For now assuming sentence words are space separated
        // We remove punctuation for available words to make it cleaner, or keep it?
        // The reference image shows "Le", "chat", "mange", "Fido" etc.
        // Let's standardise: splitting by space.
        if (currentQuestion.sentence) {
          words = currentQuestion.sentence.split(" ");
        } else {
          console.warn("Missing sentence in question:", currentQuestion);
          words = [];
        }
      }

      setAvailableWords(shuffleArray(words));
      setSelectedWords([]);
      setPlayedAudio(false);
      resetTimer();

      // Auto play audio after a short delay
      // setTimeout(() => {
      //   speak(currentQuestion.audioText, "fr-FR");
      //   setPlayedAudio(true);
      // }, 500);
    }
  }, [currentIndex, currentQuestion, resetTimer]);

  const handlePlayAudio = () => {
    if (!currentQuestion) return;
    speak(currentQuestion.audioText, "fr-FR");
    setPlayedAudio(true);
  };

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
    const correctAnswer = normalize(currentQuestion.sentence);
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
        questionType="What do you hear?"
        instructionFr="Écoutez et construisez la phrase"
        instructionEn="Listen and build the sentence"
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
          {/* Audio Player Card */}
          <div className="w-full flex justify-center mb-10">
            <button
              onClick={handlePlayAudio}
              className={cn(
                "relative group flex flex-col items-center justify-center w-full max-w-md h-32 rounded-2xl transition-all duration-300",
                "bg-gradient-to-r from-teal-400 to-teal-500 shadow-lg hover:shadow-xl hover:scale-[1.02]",
                isSpeaking && "animate-pulse",
              )}
            >
              <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm mb-2 group-hover:bg-white/30 transition-colors">
                {isSpeaking ? (
                  <RotateCcw className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Volume2 className="w-8 h-8 text-white" />
                )}
              </div>
              <span className="text-white/90 text-sm font-medium">
                {isSpeaking ? "Playing audio..." : "Click to replay audio"}
              </span>
            </button>
          </div>

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
          correctAnswer={!isCorrect ? currentQuestion.sentence : null}
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
