import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, Lightbulb, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useWritingEvaluation } from "../../hooks/useWritingEvaluation";
import WritingFeedbackResult from "../../components/WritingFeedbackResult";

// Mock data for Write on Topic exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    topic: "Ma famille",
    englishTopic: "My Family",
    prompt: "Write 2-3 sentences about your family in French.",
    hints: [
      "J'ai... (I have...)",
      "Ma mère s'appelle... (My mother's name is...)",
      "Mon père travaille comme... (My father works as...)",
    ],
    sampleAnswer:
      "J'ai une petite famille. Ma mère s'appelle Marie et mon père s'appelle Pierre. J'ai un frère qui a dix ans.",
    minWords: 10,
    timeLimitSeconds: 180,
  },
  {
    id: 2,
    topic: "Mon week-end",
    englishTopic: "My Weekend",
    prompt: "Describe what you did last weekend in French.",
    hints: [
      "Le samedi, je... (On Saturday, I...)",
      "J'ai visité... (I visited...)",
      "C'était... (It was...)",
    ],
    sampleAnswer:
      "Le samedi, j'ai visité le musée avec mes amis. Le dimanche, j'ai regardé un film à la maison. C'était un bon week-end.",
    minWords: 12,
    timeLimitSeconds: 180,
  },
  {
    id: 3,
    topic: "Ma ville",
    englishTopic: "My City",
    prompt: "Write about your city or town in French.",
    hints: [
      "J'habite à... (I live in...)",
      "Il y a... (There is/are...)",
      "C'est une ville... (It's a... city)",
    ],
    sampleAnswer:
      "J'habite à Paris. C'est une grande ville avec beaucoup de musées. Il y a des restaurants et des parcs magnifiques.",
    minWords: 10,
    timeLimitSeconds: 180,
  },
];

export default function WriteTopicPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const { evaluation, isSubmitting, evaluate, resetEvaluation } = useWritingEvaluation();

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 180;

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
      setUserAnswer("");
      setShowHints(false);
      setShowSample(false);
      resetTimer();
      resetEvaluation();
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

  const handleSubmit = async () => {
    if (showFeedback || isSubmitting) return;

    const result = await evaluate({
      task_type: "topic",
      user_text: userAnswer,
      topic: currentQuestion.topic,
      reference: currentQuestion.sampleAnswer,
      context: currentQuestion.prompt
    });

    if (result) {
      setIsCorrect(result.score >= 70);
      setFeedbackMessage(result.feedback);
      setShowFeedback(true);
      setShowSample(true);
      if (result.score >= 70) {
        setScore((prev) => prev + 1);
      }
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
        questionType="Write on Topic"
        instructionFr="Écrivez sur le sujet donné"
        instructionEn="Write about the given topic"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={wordCount >= 5 && !showFeedback && !isSubmitting}
        showSubmitButton={!showFeedback}
        submitLabel={isSubmitting ? "Evaluating..." : "Submit"}
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Topic card */}
          <div className="w-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 mb-4 shadow-lg">
            <h3 className="text-xl font-bold text-white text-center">
              {currentQuestion?.topic}
            </h3>
            <p className="text-white/80 text-center text-sm mt-1">
              {currentQuestion?.englishTopic}
            </p>
          </div>

          {/* Prompt */}
          <p className="text-slate-700 dark:text-slate-200 text-center mb-4">
            {currentQuestion?.prompt}
          </p>

          {/* Hints toggle */}
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 mb-4"
          >
            <Lightbulb className="w-4 h-4" />
            {showHints ? "Hide Hints" : "Show Hints"}
          </button>

          {/* Hints */}
          {showHints && (
            <div className="w-full bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4 border border-amber-200 dark:border-amber-800">
              <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                {currentQuestion?.hints.map((hint, index) => (
                  <li key={index}>• {hint}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Text area */}
          <div className="w-full relative">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your answer in French..."
              disabled={showFeedback}
              className={cn(
                "w-full h-40 p-4 rounded-xl border-2 resize-none text-base",
                "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                "placeholder-slate-400 focus:outline-none focus:ring-2",
                showFeedback
                  ? "border-slate-300 dark:border-slate-600"
                  : "border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-200",
              )}
            />
            <div className="absolute bottom-3 right-3 text-sm text-slate-400">
              {wordCount} / {currentQuestion?.minWords} words min
            </div>
          </div>

          {/* AI Evaluation Result */}
          {evaluation && (
            <div className="mt-8 w-full">
              <WritingFeedbackResult evaluation={evaluation} />
            </div>
          )}

          {/* Sample answer (shown after feedback) */}
          {showSample && !evaluation && (
            <div className="w-full bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mt-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                  <MessageCircle className="w-4 h-4" />
                  Sample Answer:
                </span>
                <button
                  onClick={handlePlaySample}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 italic">
                {currentQuestion?.sampleAnswer}
              </p>
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
