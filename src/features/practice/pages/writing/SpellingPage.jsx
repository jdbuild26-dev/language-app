import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Fix the Spelling exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    incorrectText: "Banjour, comant alé-vous?",
    correctText: "Bonjour, comment allez-vous?",
    errorCount: 3,
    hint: "Check the greeting and question words",
    timeLimitSeconds: 60,
  },
  {
    id: 2,
    incorrectText: "Je voodrai un cafay, sil vous plai.",
    correctText: "Je voudrais un café, s'il vous plaît.",
    errorCount: 4,
    hint: "Check the verb conjugation and accents",
    timeLimitSeconds: 60,
  },
  {
    id: 3,
    incorrectText: "Ou es la gar?",
    correctText: "Où est la gare?",
    errorCount: 3,
    hint: "Check accents and full words",
    timeLimitSeconds: 60,
  },
  {
    id: 4,
    incorrectText: "Jaime aprandre le francais.",
    correctText: "J'aime apprendre le français.",
    errorCount: 3,
    hint: "Check the apostrophe, verb, and accent",
    timeLimitSeconds: 60,
  },
  {
    id: 5,
    incorrectText: "Il fai bo ojourdhui.",
    correctText: "Il fait beau aujourd'hui.",
    errorCount: 3,
    hint: "Check adjective and compound word",
    timeLimitSeconds: 60,
  },
];

export default function SpellingPage() {
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
    isPaused: isCompleted || showFeedback,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput(currentQuestion.incorrectText);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.correctText, "fr-FR");
    }
  };

  // Normalize for comparison
  const normalize = (str) => str.toLowerCase().replace(/\s+/g, " ").trim();

  const handleSubmit = () => {
    if (showFeedback || !userInput.trim()) return;

    const userAnswer = normalize(userInput);
    const correctAnswer = normalize(currentQuestion.correctText);
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
        questionType="Fix the Spelling"
        instructionFr="Corrigez les erreurs d'orthographe"
        instructionEn="Fix the spelling mistakes"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInput.trim().length > 0 && !showFeedback}
        showSubmitButton={true}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Error indicator */}
          <div className="w-full flex items-center justify-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              This text contains{" "}
              <strong className="text-amber-600">
                {currentQuestion?.errorCount} errors
              </strong>
            </span>
          </div>

          {/* Hint */}
          <div className="w-full mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center italic">
              Hint: {currentQuestion?.hint}
            </p>
          </div>

          {/* Text Editor */}
          <div className="w-full mb-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={showFeedback}
              rows={3}
              className={cn(
                "w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 border-2 outline-none resize-none",
                "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100",
                "border-amber-300 dark:border-amber-700",
                "focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20",
                showFeedback && isCorrect && "border-emerald-500 bg-emerald-50",
                showFeedback && !isCorrect && "border-red-500 bg-red-50",
              )}
            />
          </div>

          {/* Audio button */}
          <div className="w-full flex justify-between items-center">
            <button
              onClick={handlePlayAudio}
              disabled={isSpeaking}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                isSpeaking
                  ? "bg-amber-100 text-amber-600"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-600",
              )}
            >
              <Volume2 className="w-4 h-4" />
              Listen to correct version
            </button>
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
          correctAnswer={!isCorrect ? currentQuestion.correctText : null}
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
