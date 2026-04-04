"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { BookOpen, HelpCircle, Sparkles, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useWritingEvaluation } from "@/hooks/useWritingEvaluation";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadMockCSV } from "@/utils/csvLoader";

interface Question {
  topic: string;
  englishTopic: string;
  prompt: string;
  hints: string[];
  sampleAnswer: string;
  timeLimitSeconds?: number;
  minWords?: number;
}

export default function WriteTopicPage() {
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
  const timerDuration = currentQuestion?.timeLimitSeconds || 180;

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
        const data = await loadMockCSV("practice/writing/write_topic.csv") as Question[];
        setQuestions(data);
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
      task_type: "topic",
      user_text: userAnswer,
      topic: currentQuestion.englishTopic,
      reference: currentQuestion.sampleAnswer,
      context: `The user is writing about the topic: ${currentQuestion.topic} (${currentQuestion.englishTopic}). Prompt: ${currentQuestion.prompt}`,
    });

    if (result) {
      // For rich feedback, we use overall_score
      const finalScore = (result as any).overall_score !== undefined ? (result as any).overall_score : (result as any).score;
      setIsCorrect(finalScore >= 70);
      setFeedbackMessage((result as any).executive_summary || (result as any).feedback);
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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
        questionType="Write About Topic"
        instructionFr="Écrivez sur le sujet en français"
        instructionEn="Write about the topic in French"
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
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-8">
          {/* Topic Display */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-3xl p-8 mb-6 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-16 h-16 text-indigo-500" />
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {currentQuestion?.topic}
                  </h2>
                  <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                    {currentQuestion?.englishTopic}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {currentQuestion?.prompt}
                </p>
              </div>
            </div>
          </div>

          {/* Hint fragments */}
          <div className="w-full mb-6">
            <div className="flex items-center gap-2 mb-3 px-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Helpful Phrases</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(currentQuestion?.hints) ? (
                currentQuestion.hints.map((hint, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold border border-indigo-100/50 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors cursor-default"
                  >
                    {hint}
                  </span>
                ))
              ) : (
                <span className="text-xs italic text-slate-400">No hints available</span>
              )}
            </div>
          </div>

          {/* Text input area */}
          <div className="w-full relative">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Start writing in French here..."
              disabled={showFeedback}
              className={cn(
                "w-full h-48 p-6 rounded-3xl border-2 resize-none text-lg transition-all duration-300",
                "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-inner",
                "placeholder-slate-400 focus:outline-none focus:ring-4",
                showFeedback
                  ? "border-slate-300 dark:border-slate-600 bg-slate-50/50"
                  : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900/40",
              )}
            />
            <div className="absolute bottom-4 right-6 flex items-center gap-4">
               <div className={cn(
                 "text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full",
                 wordCount >= (currentQuestion?.minWords || 10) 
                   ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                   : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
               )}>
                {wordCount} / {currentQuestion?.minWords || 10} words
              </div>
            </div>
          </div>

          {evaluation && (
            <div className="mt-8 w-full animate-in slide-in-from-bottom-8 duration-700">
              <WritingFeedbackResult 
                evaluation={evaluation as any} 
                mode="writing" 
                userText={userAnswer}
                onContinue={handleContinue}
              />
            </div>
          )}
        </div>
      </PracticeGameLayout>
    </>
  );
}
