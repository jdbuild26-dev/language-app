"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { FileText, Send, User, Tag, Info, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useWritingEvaluation } from "@/hooks/useWritingEvaluation";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadMockCSV } from "@/utils/csvLoader";
import { Badge } from "@/components/ui/badge";

interface Question {
  documentType: string;
  recipient: string;
  subject: string;
  scenario: string;
  template: string;
  sampleAnswer: string;
  timeLimitSeconds?: number;
}

export default function WriteDocumentPage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { evaluation, isSubmitting, evaluate, resetEvaluation } =
    useWritingEvaluation();

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 300;

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
        const data = await loadMockCSV("practice/writing/write_documents.csv") as Question[];
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
      resetTimer();
      resetEvaluation();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer, resetEvaluation]);

  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleSubmit = async () => {
    if (showFeedback || isSubmitting || !currentQuestion) return;

    const result = await evaluate({
      task_type: "document",
      user_text: userAnswer,
      topic: currentQuestion.scenario,
      reference: currentQuestion.sampleAnswer,
      context: `Document Type: ${currentQuestion.documentType}. Recipient: ${currentQuestion.recipient}. Subject: ${currentQuestion.subject}. Scenario: ${currentQuestion.scenario}`,
    });

    if (result) {
      const finalScore = (result as any).overall_score !== undefined ? (result as any).overall_score : (result as any).score;
      setIsCorrect(finalScore >= 70);
      setFeedbackMessage((result as any).executive_summary || (result as any).feedback);
      setShowFeedback(true);
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
        questionType="Professional Writing"
        instructionFr="Rédigez le document professionnel"
        instructionEn="Write the professional document"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={wordCount >= 5 && !showFeedback && !isSubmitting}
        showSubmitButton={!showFeedback}
        submitLabel={isSubmitting ? "Analyzing..." : "Send Document"}
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-6">
          {/* Document Header Info */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-3xl p-6 mb-6 shadow-xl border border-slate-100 dark:border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-50 dark:border-slate-700 pb-4">
              <Badge variant="default" className="bg-blue-600 text-white font-black hover:bg-blue-700 px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-200 dark:shadow-none border-none">
                {currentQuestion?.documentType}
              </Badge>
              <div className="flex items-center gap-2 text-slate-500">
                <User className="w-4 h-4" />
                <span className="text-sm font-bold tracking-tight">To: {currentQuestion?.recipient}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-bold tracking-tight">Subject: {currentQuestion?.subject}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {currentQuestion?.scenario}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Writing Area */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="w-full relative group">
                <div className="absolute inset-0 bg-blue-500/5 rounded-[2.5rem] blur-xl group-focus-within:bg-blue-500/10 transition-colors" />
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your document content here..."
                  disabled={showFeedback}
                  className={cn(
                    "w-full h-96 p-8 rounded-[2.5rem] border-2 resize-none text-lg relative z-10 transition-all duration-500 shadow-2xl shadow-blue-100/30 dark:shadow-none",
                    "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                    "placeholder-slate-400 focus:outline-none focus:ring-8",
                    showFeedback
                      ? "border-slate-200 dark:border-slate-700 bg-slate-50/50"
                      : "border-slate-50 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/20",
                  )}
                />
                <div className="absolute bottom-6 right-10 z-20 flex items-center gap-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                    {wordCount} words
                  </div>
                </div>
              </div>
            </div>

            {/* Template Side Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Structure Hint
                </h3>
                <pre className="text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {currentQuestion?.template}
                </pre>
              </div>
              
              <div className="p-6 rounded-[2rem] bg-blue-600 text-white shadow-xl shadow-blue-100 dark:shadow-none border border-blue-500 group overflow-hidden relative">
                <Send className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 transition-transform group-hover:scale-110" />
                <p className="text-[11px] leading-relaxed font-black uppercase tracking-tighter relative z-10">
                  Complete the template above using appropriate professional greetings and sign-offs for your Level goals.
                </p>
              </div>
            </div>
          </div>

          {/* AI Evaluation Result Overlay */}
          {evaluation && (
            <div className="mt-8 w-full animate-in slide-in-from-bottom-8 duration-700">
              <WritingFeedbackResult evaluation={evaluation as any} mode="writing" userText={userAnswer} />
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
          feedbackTone={isCorrect ? "positive" : "neutral"}
          correctAnswer={currentQuestion?.sampleAnswer}
          continueLabel={
            currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
