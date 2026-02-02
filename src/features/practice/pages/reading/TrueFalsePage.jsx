import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

// Mock data for True/False/Not Given exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    passage:
      "Paris est la capitale de la France. La ville compte plus de deux millions d'habitants. La Tour Eiffel est le monument le plus visité de la ville.",
    statement: "Paris a plus de deux millions d'habitants.",
    answer: "true",
    timeLimitSeconds: 45,
  },
  {
    id: 2,
    passage:
      "Marie travaille dans une boulangerie. Elle commence son travail à six heures du matin. Elle aime préparer des croissants et des baguettes.",
    statement: "Marie finit son travail à midi.",
    answer: "not-given",
    timeLimitSeconds: 45,
  },
  {
    id: 3,
    passage:
      "Le TGV est un train très rapide en France. Il peut atteindre une vitesse de 320 km/h. Les billets sont généralement plus chers que les trains normaux.",
    statement: "Le TGV est plus lent que les trains normaux.",
    answer: "false",
    timeLimitSeconds: 45,
  },
  {
    id: 4,
    passage:
      "Les Français aiment le fromage. Il existe plus de 300 variétés de fromage en France. Le camembert et le brie sont parmi les plus populaires.",
    statement: "Le camembert est un fromage français populaire.",
    answer: "true",
    timeLimitSeconds: 45,
  },
  {
    id: 5,
    passage:
      "Lyon est connue pour sa gastronomie. La ville a beaucoup de restaurants étoilés. Les bouchons lyonnais servent des plats traditionnels.",
    statement: "Lyon est la plus grande ville de France.",
    answer: "not-given",
    timeLimitSeconds: 45,
  },
];

const OPTIONS = [
  { value: "true", label: "Vrai" },
  { value: "false", label: "Faux" },
  { value: "not-given", label: "Non mentionné" },
];

export default function TrueFalsePage() {
  const handleExit = usePracticeExit();

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
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
      setSelectedAnswer(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleOptionSelect = (value) => {
    if (showFeedback) return;
    setSelectedAnswer(value);
  };

  const handleSubmit = () => {
    if (showFeedback || !selectedAnswer) return;

    const correct = selectedAnswer === currentQuestion.answer;
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

  const getAnswerLabel = (value) =>
    OPTIONS.find((o) => o.value === value)?.label || value;

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Identify Information"
        instructionFr="L'affirmation est-elle vraie, fausse, ou non mentionnée?"
        instructionEn="Is the statement true, false, or not mentioned?"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!!selectedAnswer && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="w-full max-w-6xl mx-auto px-6 py-8">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Passage */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[300px]">
              <div className="bg-slate-100 dark:bg-slate-700 px-5 py-3 border-b border-slate-200 dark:border-slate-600">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Passage
                </span>
              </div>
              <div className="p-6">
                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
                  {currentQuestion?.passage}
                </p>
              </div>
            </div>

            {/* Right Column - Question & Options */}
            <div className="flex flex-col">
              {/* Statement/Question */}
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-5">
                {currentQuestion?.statement}
              </h3>

              {/* Options as Radio Buttons */}
              <div className="flex flex-col gap-4">
                {OPTIONS.map((option) => {
                  const isSelected = selectedAnswer === option.value;
                  const isCorrectAnswer =
                    showFeedback && option.value === currentQuestion.answer;
                  const isWrongSelection =
                    showFeedback && isSelected && !isCorrectAnswer;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(option.value)}
                      disabled={showFeedback}
                      className={cn(
                        "flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 text-left",
                        isCorrectAnswer
                          ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                          : isWrongSelection
                            ? "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300"
                            : isSelected
                              ? "bg-sky-50 dark:bg-sky-900/30 border-sky-500 text-sky-700 dark:text-sky-300"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500",
                      )}
                    >
                      {/* Radio Circle */}
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          isCorrectAnswer
                            ? "border-emerald-500 bg-emerald-500"
                            : isWrongSelection
                              ? "border-red-500 bg-red-500"
                              : isSelected
                                ? "border-sky-500 bg-sky-500"
                                : "border-slate-300 dark:border-slate-500",
                        )}
                      >
                        {(isSelected || isCorrectAnswer) && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium text-base">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
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
            !isCorrect ? getAnswerLabel(currentQuestion.answer) : null
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
