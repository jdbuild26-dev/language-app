import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Document Writing exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    documentType: "Email",
    scenario:
      "Write an email to your friend inviting them to your birthday party.",
    recipient: "Ami(e)",
    subject: "Mon anniversaire",
    template: `Cher/Chère [nom],

Je t'écris pour...

[corps du message]

À bientôt,
[ton nom]`,
    sampleAnswer: `Cher Pierre,

Je t'écris pour t'inviter à ma fête d'anniversaire. Elle aura lieu samedi prochain à 18 heures chez moi. Il y aura de la musique et un gâteau au chocolat.

J'espère te voir là-bas !

À bientôt,
Marie`,
    minWords: 20,
    timeLimitSeconds: 240,
  },
  {
    id: 2,
    documentType: "Letter",
    scenario: "Write a letter to thank someone for a gift.",
    recipient: "Grand-mère",
    subject: "Remerciement",
    template: `Chère Grand-mère,

Je voulais te remercier pour...

[corps du message]

Je t'embrasse,
[ton nom]`,
    sampleAnswer: `Chère Grand-mère,

Je voulais te remercier pour le magnifique pull que tu m'as offert pour mon anniversaire. La couleur bleue est ma préférée et il me tient très chaud.

Je pense à toi souvent et j'espère te voir bientôt.

Je t'embrasse fort,
Sophie`,
    minWords: 20,
    timeLimitSeconds: 240,
  },
  {
    id: 3,
    documentType: "Postcard",
    scenario: "Write a postcard from your vacation.",
    recipient: "Famille",
    subject: "Vacances",
    template: `Chers tous,

Je suis en vacances à...

[description]

Bisous,
[ton nom]`,
    sampleAnswer: `Chers tous,

Je suis en vacances à Nice depuis trois jours. La plage est magnifique et l'eau est chaude. Hier, j'ai visité le vieux Nice et j'ai mangé une délicieuse salade niçoise.

Je rentre dimanche !

Bisous,
Lucas`,
    minWords: 15,
    timeLimitSeconds: 180,
  },
];

export default function WriteDocumentsPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 240;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        handleSubmit();
      }
    },
    isPaused: isCompleted || showFeedback,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserAnswer(currentQuestion.template);
      setShowSample(false);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlaySample = () => {
    if (currentQuestion) {
      speak(currentQuestion.sampleAnswer, "fr-FR");
    }
  };

  const getWordCount = (text) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const wordCount = getWordCount(userAnswer);
    const meetsMinWords = wordCount >= currentQuestion.minWords;

    setIsCorrect(meetsMinWords);
    setFeedbackMessage(
      meetsMinWords
        ? getFeedbackMessage(true)
        : `Try to write at least ${currentQuestion.minWords} words.`,
    );
    setShowFeedback(true);
    setShowSample(true);

    if (meetsMinWords) {
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

  const wordCount = getWordCount(userAnswer);
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Write Documents"
        instructionFr="Rédigez le document demandé"
        instructionEn="Write the requested document"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={wordCount >= 10 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-4">
          {/* Document type badge */}
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              {currentQuestion?.documentType}
            </span>
          </div>

          {/* Scenario */}
          <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              {currentQuestion?.scenario}
            </p>
            <div className="flex justify-center gap-4 mt-2 text-xs text-blue-600 dark:text-blue-400">
              <span>To: {currentQuestion?.recipient}</span>
              <span>•</span>
              <span>Re: {currentQuestion?.subject}</span>
            </div>
          </div>

          {/* Text area */}
          <div className="w-full relative">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your document..."
              disabled={showFeedback}
              className={cn(
                "w-full h-52 p-4 rounded-xl border-2 resize-none text-sm font-mono",
                "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                "placeholder-slate-400 focus:outline-none focus:ring-2",
                showFeedback
                  ? "border-slate-300 dark:border-slate-600"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-200",
              )}
            />
            <div className="absolute bottom-3 right-3 text-sm text-slate-400">
              {wordCount} / {currentQuestion?.minWords} words min
            </div>
          </div>

          {/* Sample answer */}
          {showSample && (
            <div className="w-full bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mt-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                  Sample Answer:
                </span>
                <button
                  onClick={handlePlaySample}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-xs text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap font-sans">
                {currentQuestion?.sampleAnswer}
              </pre>
            </div>
          )}
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
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
