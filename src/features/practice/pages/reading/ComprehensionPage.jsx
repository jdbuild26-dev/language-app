import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Reading Comprehension exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    passage:
      "Marie habite à Paris depuis cinq ans. Elle travaille dans une librairie au centre-ville. Chaque matin, elle prend le métro pour aller au travail. Elle aime son travail parce qu'elle adore les livres.",
    question: "Où travaille Marie?",
    options: [
      "Dans un café",
      "Dans une librairie",
      "Dans un hôpital",
      "Dans une école",
    ],
    correctIndex: 1,
    timeLimitSeconds: 60,
  },
  {
    id: 2,
    passage:
      "Pierre est un jeune chef cuisinier. Il prépare des plats traditionnels français. Son restaurant est ouvert du mardi au samedi. Le dimanche et le lundi, le restaurant est fermé.",
    question: "Quand le restaurant est-il fermé?",
    options: [
      "Le samedi et le dimanche",
      "Le lundi et le mardi",
      "Le dimanche et le lundi",
      "Le vendredi et le samedi",
    ],
    correctIndex: 2,
    timeLimitSeconds: 60,
  },
  {
    id: 3,
    passage:
      "La famille Dupont a trois enfants: Sophie, Thomas et Emma. Sophie a douze ans, Thomas a neuf ans et Emma a six ans. Ils habitent dans une grande maison avec un jardin.",
    question: "Quel âge a Thomas?",
    options: ["Six ans", "Neuf ans", "Douze ans", "Quinze ans"],
    correctIndex: 1,
    timeLimitSeconds: 60,
  },
  {
    id: 4,
    passage:
      "En été, nous allons souvent à la plage. Nous nageons dans la mer et nous jouons au volleyball. Le soir, nous mangeons des glaces et nous regardons le coucher du soleil.",
    question: "Que font-ils le soir?",
    options: [
      "Ils nagent dans la mer",
      "Ils jouent au football",
      "Ils mangent des glaces",
      "Ils font de la randonnée",
    ],
    correctIndex: 2,
    timeLimitSeconds: 60,
  },
  {
    id: 5,
    passage:
      "Le train pour Lyon part à huit heures du matin. Il arrive à Lyon à onze heures. Le voyage dure trois heures. Les billets coûtent cinquante euros.",
    question: "Combien de temps dure le voyage?",
    options: ["Deux heures", "Trois heures", "Quatre heures", "Cinq heures"],
    correctIndex: 1,
    timeLimitSeconds: 60,
  },
];

export default function ComprehensionPage() {
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
      setSelectedOption(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.passage, "fr-FR");
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
        questionType="Reading Comprehension"
        instructionFr="Lisez le passage et répondez"
        instructionEn="Read the passage and answer"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOption !== null && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6">
          {/* Passage */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 mb-4 shadow-lg border border-slate-200 dark:border-slate-700">
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
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
                ? "bg-rose-100 text-rose-600"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600",
            )}
          >
            <Volume2 className="w-4 h-4" />
            Listen to passage
          </button>

          {/* Question */}
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 text-center">
            {currentQuestion?.question}
          </h3>

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
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20",
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
