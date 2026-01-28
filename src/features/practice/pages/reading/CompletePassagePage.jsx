import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Complete the Passage exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    context:
      "Il fait beau aujourd'hui. _____ Les enfants sont contents de pouvoir sortir.",
    options: [
      "Il pleut beaucoup.",
      "Le soleil brille.",
      "Il neige fort.",
      "Il fait très froid.",
    ],
    correctIndex: 1,
    fullText:
      "Il fait beau aujourd'hui. Le soleil brille. Les enfants sont contents de pouvoir sortir.",
    timeLimitSeconds: 45,
  },
  {
    id: 2,
    context:
      "Marie va au supermarché. _____ Elle achète aussi des légumes frais.",
    options: [
      "Elle va au cinéma.",
      "Elle achète du pain et du lait.",
      "Elle rentre chez elle.",
      "Elle lit un livre.",
    ],
    correctIndex: 1,
    fullText:
      "Marie va au supermarché. Elle achète du pain et du lait. Elle achète aussi des légumes frais.",
    timeLimitSeconds: 45,
  },
  {
    id: 3,
    context:
      "Le restaurant est plein ce soir. _____ Les serveurs travaillent très vite.",
    options: [
      "Il n'y a personne.",
      "Tous les clients sont partis.",
      "Beaucoup de gens dînent ici.",
      "Le restaurant est fermé.",
    ],
    correctIndex: 2,
    fullText:
      "Le restaurant est plein ce soir. Beaucoup de gens dînent ici. Les serveurs travaillent très vite.",
    timeLimitSeconds: 45,
  },
  {
    id: 4,
    context:
      "Pierre est fatigué après le travail. _____ Il se couche à neuf heures.",
    options: [
      "Il va au cinéma.",
      "Il fait du sport.",
      "Il mange léger et se repose.",
      "Il sort avec ses amis.",
    ],
    correctIndex: 2,
    fullText:
      "Pierre est fatigué après le travail. Il mange léger et se repose. Il se couche à neuf heures.",
    timeLimitSeconds: 45,
  },
  {
    id: 5,
    context: "Nous partons en vacances demain. _____ Nous sommes très excités!",
    options: [
      "Nous allons à la mer.",
      "Nous travaillons au bureau.",
      "Nous restons à la maison.",
      "Nous étudions pour l'examen.",
    ],
    correctIndex: 0,
    fullText:
      "Nous partons en vacances demain. Nous allons à la mer. Nous sommes très excités!",
    timeLimitSeconds: 45,
  },
];

export default function CompletePassagePage() {
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

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedOption(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.fullText, "fr-FR");
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

  // Render context with highlighted blank
  const renderContext = () => {
    const parts = currentQuestion?.context.split("_____");
    return (
      <>
        <span>{parts?.[0]}</span>
        <span className="inline-block mx-2 px-4 py-1 bg-sky-100 dark:bg-sky-900/30 border-2 border-dashed border-sky-400 rounded-lg text-sky-600 dark:text-sky-400 font-semibold min-w-[120px] text-center">
          {selectedOption !== null
            ? currentQuestion.options[selectedOption]
            : "?"}
        </span>
        <span>{parts?.[1]}</span>
      </>
    );
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Complete the Passage"
        instructionFr="Complétez le passage avec la phrase correcte"
        instructionEn="Complete the passage with the correct sentence"
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
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6">
          {/* Passage with blank */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
              {renderContext()}
            </p>
          </div>

          {/* Audio button */}
          <button
            onClick={handlePlayAudio}
            disabled={isSpeaking}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all mb-4",
              isSpeaking
                ? "bg-sky-100 text-sky-600"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sky-100 hover:text-sky-600",
            )}
          >
            <Volume2 className="w-4 h-4" />
            Listen to complete passage
          </button>

          {/* Options */}
          <div className="w-full space-y-3">
            {currentQuestion?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showFeedback}
                className={cn(
                  "w-full py-3 px-5 rounded-xl text-left text-base font-medium transition-all duration-200 border-2",
                  selectedOption === index
                    ? "bg-sky-500 text-white border-sky-500 shadow-lg"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20",
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
