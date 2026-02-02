import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, Check, X, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

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
  { value: "true", label: "Vrai", icon: Check, color: "emerald" },
  { value: "false", label: "Faux", icon: X, color: "red" },
  {
    value: "not-given",
    label: "Non mentionné",
    icon: HelpCircle,
    color: "amber",
  },
];

export default function TrueFalsePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

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

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.passage, "fr-FR");
    }
  };

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
        questionType="True/False/Not Given"
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
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6">
          {/* Passage */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 mb-4 shadow-lg border border-slate-200 dark:border-slate-700">
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
              {currentQuestion?.passage}
            </p>
          </div>

          {/* Audio button */}
          <button
            onClick={handlePlayAudio}
            disabled={isSpeaking}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all mb-4",
              isSpeaking
                ? "bg-pink-100 text-pink-600"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-pink-100 hover:text-pink-600",
            )}
          >
            <Volume2 className="w-4 h-4" />
            Listen to passage
          </button>

          {/* Statement */}
          <div className="w-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-5 mb-6 shadow-lg">
            <p className="text-lg text-white font-semibold text-center">
              "{currentQuestion?.statement}"
            </p>
          </div>

          {/* Options */}
          <div className="w-full grid grid-cols-3 gap-4">
            {OPTIONS.map((option) => {
              const Icon = option.icon;
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
                    "flex flex-col items-center gap-2 py-4 px-4 rounded-xl border-2 transition-all duration-200",
                    isCorrectAnswer
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : isWrongSelection
                        ? "bg-red-500 text-white border-red-500"
                        : isSelected
                          ? `bg-${option.color}-500 text-white border-${option.color}-500`
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400",
                  )}
                >
                  <Icon className="w-8 h-8" />
                  <span className="font-semibold">{option.label}</span>
                </button>
              );
            })}
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
