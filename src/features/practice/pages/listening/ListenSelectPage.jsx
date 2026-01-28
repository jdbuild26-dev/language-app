import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Listen and Select exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    audioText: "Bonjour, comment allez-vous?",
    question: "What is being said?",
    options: [
      "Hello, how are you?",
      "Goodbye, see you later",
      "Good night, sleep well",
      "Thank you very much",
    ],
    correctIndex: 0,
    timeLimitSeconds: 30,
  },
  {
    id: 2,
    audioText: "Je voudrais un café, s'il vous plaît.",
    question: "What is the person ordering?",
    options: ["A tea", "A coffee", "A juice", "A water"],
    correctIndex: 1,
    timeLimitSeconds: 30,
  },
  {
    id: 3,
    audioText: "Il fait beau aujourd'hui.",
    question: "What is the weather like?",
    options: [
      "It's raining",
      "It's cold",
      "It's nice/beautiful",
      "It's snowing",
    ],
    correctIndex: 2,
    timeLimitSeconds: 30,
  },
  {
    id: 4,
    audioText: "Je m'appelle Marie et j'ai vingt ans.",
    question: "How old is Marie?",
    options: ["18 years old", "19 years old", "20 years old", "21 years old"],
    correctIndex: 2,
    timeLimitSeconds: 30,
  },
  {
    id: 5,
    audioText: "Le train part à huit heures.",
    question: "What time does the train leave?",
    options: ["7 o'clock", "8 o'clock", "9 o'clock", "10 o'clock"],
    correctIndex: 1,
    timeLimitSeconds: 30,
  },
];

export default function ListenSelectPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions] = useState(MOCK_QUESTIONS);
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
    isPaused: isCompleted || showFeedback || !hasPlayed,
  });

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
        showSubmitButton={true}
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
          <div className="w-full space-y-3">
            {currentQuestion?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showFeedback}
                className={cn(
                  "w-full py-4 px-6 rounded-xl text-left text-lg font-medium transition-all duration-200 border-2",
                  selectedOption === index
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-lg"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
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
                <span className="inline-flex items-center gap-3">
                  <span
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      selectedOption === index
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </span>
              </button>
            ))}
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
