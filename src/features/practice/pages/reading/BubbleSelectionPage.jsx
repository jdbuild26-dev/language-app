import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Bubble Selection exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    sourceText: "The cat is sleeping.",
    correctAnswer: "Le chat dort.",
    wordBubbles: ["Le", "chat", "dort", "mange", "chien", "un"],
    timeLimitSeconds: 45,
  },
  {
    id: 2,
    sourceText: "I eat an apple.",
    correctAnswer: "Je mange une pomme.",
    wordBubbles: ["Je", "mange", "une", "pomme", "Tu", "poire", "le"],
    timeLimitSeconds: 45,
  },
  {
    id: 3,
    sourceText: "She reads a book.",
    correctAnswer: "Elle lit un livre.",
    wordBubbles: ["Elle", "lit", "un", "livre", "Il", "écrit", "une"],
    timeLimitSeconds: 45,
  },
  {
    id: 4,
    sourceText: "We go to school.",
    correctAnswer: "Nous allons à l'école.",
    wordBubbles: ["Nous", "allons", "à", "l'école", "Vous", "la", "maison"],
    timeLimitSeconds: 45,
  },
  {
    id: 5,
    sourceText: "They play in the garden.",
    correctAnswer: "Ils jouent dans le jardin.",
    wordBubbles: [
      "Ils",
      "jouent",
      "dans",
      "le",
      "jardin",
      "Elle",
      "parc",
      "sur",
    ],
    timeLimitSeconds: 45,
  },
];

export default function BubbleSelectionPage() {
  const navigate = useNavigate();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions] = useState(MOCK_QUESTIONS);
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
    isPaused: isCompleted || showFeedback,
  });

  // Initialize available words when question changes
  useEffect(() => {
    if (currentQuestion) {
      setAvailableWords([...currentQuestion.wordBubbles]);
      setSelectedWords([]);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, resetTimer]);

  const handleWordSelect = (word, index) => {
    if (showFeedback) return;

    // Add word to selected and remove from available
    setSelectedWords([...selectedWords, word]);
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);
  };

  const handleWordRemove = (word, index) => {
    if (showFeedback) return;

    // Remove word from selected and add back to available
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  };

  const handleSpeak = () => {
    if (currentQuestion) {
      speak(currentQuestion.correctAnswer, "fr-FR");
    }
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
        onExit={() => navigate("/practice")}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedWords.length > 0 && !showFeedback}
        showSubmitButton={true}
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

          {/* Audio Preview Button */}
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={cn(
              "mt-6 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
              isSpeaking
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-500"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-500",
            )}
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-sm font-medium">Listen to answer</span>
          </button>
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
