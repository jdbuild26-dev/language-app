"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useWritingEvaluation } from "@/hooks/useWritingEvaluation";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadMockCSV } from "@/utils/csvLoader";

// Mock data for Describe Image exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    image: "🏖️",
    englishDescription: "A beach with sun and waves",
    hint: "beach, sun, water, sand",
    sampleAnswer:
      "C'est une plage avec du soleil et des vagues. Le sable est doré et l'eau est bleue.",
    minWords: 8,
    timeLimitSeconds: 120,
  },
  {
    id: 2,
    image: "🍽️",
    englishDescription: "A dinner table with food",
    hint: "table, food, plate, dinner",
    sampleAnswer:
      "Je vois une table avec de la nourriture. Il y a des assiettes et des verres pour le dîner.",
    minWords: 8,
    timeLimitSeconds: 120,
  },
  {
    id: 3,
    image: "🏔️",
    englishDescription: "A mountain with snow",
    hint: "mountain, snow, nature, sky",
    sampleAnswer:
      "C'est une grande montagne avec de la neige. Le ciel est bleu et le paysage est magnifique.",
    minWords: 8,
    timeLimitSeconds: 120,
  },
  {
    id: 4,
    image: "🎉",
    englishDescription: "A party celebration",
    hint: "party, celebration, happy, decoration",
    sampleAnswer:
      "C'est une fête. Les gens sont contents et il y a des décorations colorées partout.",
    minWords: 8,
    timeLimitSeconds: 120,
  },
];

interface Question {
  id: number;
  image: string;
  englishDescription: string;
  hint: string;
  sampleAnswer: string;
  minWords: number;
  timeLimitSeconds: number;
  imageUrl?: string;
  question?: string;
}

export default function WriteImagePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { evaluation, isSubmitting, evaluate, resetEvaluation } =
    useWritingEvaluation();

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 120;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        handleSubmit();
      }
    },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/writing/write_image.csv") as Question[];
        // Map backend keys to component keys if necessary, or update component to use backend keys
        // Backend returns: imageUrl, question, hint, sampleAnswer
        // Component expects: image, englishDescription, hint, sampleAnswer

        const mappedData = data.map((item) => ({
          ...item,
          image: item.imageUrl || item.image,
          englishDescription: item.question || item.englishDescription,
        }));

        setQuestions(mappedData);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserAnswer("");
      setShowSample(false);
      resetTimer();
      resetEvaluation();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer, resetEvaluation]);

  const handlePlaySample = () => {
    if (currentQuestion) {
      speak(currentQuestion.sampleAnswer, "fr-FR");
    }
  };

  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleSubmit = async () => {
    if (showFeedback || isSubmitting || !currentQuestion) return;

    const result = await evaluate({
      task_type: "image",
      user_text: userAnswer,
      topic: currentQuestion.englishDescription,
      reference: currentQuestion.sampleAnswer,
      context: `The user is describing this image/emoji: ${currentQuestion.image}. Hint words: ${currentQuestion.hint}`,
    });

    if (result) {
      const finalScore = result.overall_score ?? (result as any).overall_score ?? (result as any).score ?? 0;
      setIsCorrect(finalScore >= 70);
      setFeedbackMessage(finalScore >= 70 ? "Great work!" : "Keep practising!");
      setShowFeedback(true);
      setShowSample(true);
      if (finalScore >= 70) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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

  const wordCount = getWordCount(userAnswer);
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Describe the Image"
        instructionFr="Décrivez l'image en français"
        instructionEn="Describe the image in French"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={wordCount >= 3 && !showFeedback && !isSubmitting}
        showSubmitButton={!showFeedback}
        submitLabel={isSubmitting ? "Evaluating..." : "Submit"}
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Image display */}
          <div className="w-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-8 mb-4 text-center">
            <span className="text-8xl">{currentQuestion?.image}</span>
          </div>

          {/* English hint */}
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {currentQuestion?.englishDescription}
            </span>
          </div>

          {/* Hint keywords */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {currentQuestion?.hint.split(", ").map((word, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium"
              >
                {word}
              </span>
            ))}
          </div>

          {/* Text area */}
          <div className="w-full relative">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Describe what you see in French..."
              disabled={showFeedback}
              className={cn(
                "w-full h-32 p-4 rounded-xl border-2 resize-none text-base",
                "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                "placeholder-slate-400 focus:outline-none focus:ring-2",
                showFeedback
                  ? "border-slate-300 dark:border-slate-600"
                  : "border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-200",
              )}
            />
            <div className="absolute bottom-3 right-3 text-sm text-slate-400">
              {wordCount} / {currentQuestion?.minWords} words min
            </div>
          </div>

          {/* AI Evaluation Result */}
          {evaluation && (
            <div className="mt-8 w-full animate-in slide-in-from-bottom-8 duration-700">
              <WritingFeedbackResult 
                evaluation={evaluation as any} 
                mode="writing"
                userText={userAnswer}
                originalImage={currentQuestion?.image}
                onContinue={handleContinue}
              />
            </div>
          )}

          {/* Sample answer side (only shown if needed, but the Result Modal handles it now) */}
        </div>
      </PracticeGameLayout>
    </>
  );
}
