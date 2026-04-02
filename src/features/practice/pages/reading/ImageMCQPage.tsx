"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2, Volume2, Languages } from "lucide-react";
import imgMcqImage from "@/assets/kitchen.jpg";

type ImageMCQQuestion = {
  timeLimitSeconds?: number;
  options: string[];
  imageAlt?: string;
  question?: string;
  englishOptions?: string[];
  correctIndex: number;
};

export default function ImageMCQPage() {
  const handleExit = usePracticeExit();
  const OptionsComponent = PracticeOptions as unknown as React.ComponentType<{
    options: string[];
    selectedOption: number | null;
    correctIndex?: number;
    showFeedback: boolean;
    onSelect: (index: number) => void;
    showCheckIcon?: boolean;
    className?: string;
    itemClassName?: string;
    renderLabel?: (option: string, index: number) => React.ReactNode;
    renderSuffix?: (option: string) => React.ReactNode;
  }>;

  const [questions, setQuestions] = useState<ImageMCQQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/reading/image_mcq.csv");
        setQuestions((data as ImageMCQQuestion[]) || []);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 30;

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
    isPaused: isCompleted || showFeedback || loading,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedOption(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayAudio = (
    e: React.MouseEvent<HTMLElement>,
    text: string,
  ) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleOptionSelect = (index: number) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <PracticeGameLayout
      questionType="Match Image to Description"
      questionTypeFr="Choisissez la description correcte"
      questionTypeEn="Choose the correct description"
      instructionFr="Choisissez la description correcte"
      instructionEn="Choose the correct description"
      localizedInstruction="Choisissez la description correcte"
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      currentQuestionIndex={currentIndex}
      questionCounterValue={currentIndex + 1}
      onExit={handleExit}
      onNext={showFeedback ? handleContinue : handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={selectedOption !== null || showFeedback}
      showSubmitButton={true}
      submitLabel={
        showFeedback
          ? currentIndex + 1 === questions.length
            ? "FINISH"
            : "CONTINUE"
          : "Submit Answer"
      }
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackTone={isCorrect ? "correct" : "incorrect"}
      correctAnswer={
        !isCorrect
          ? currentQuestion?.options?.[currentQuestion?.correctIndex ?? -1]
          : undefined
      }
      feedbackMessage={feedbackMessage}
    >
      {/* Two-panel layout — stacked on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row gap-3 p-3 mx-auto w-full flex-1 pb-[108px] overflow-hidden">
        {/* ── Left Panel: Image ── */}
        <div className="flex-1 h-[570px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col p-6 shrink-0">
          {/* Image content */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full   flex items-center justify-center dark:bg-slate-800/40">
              <img
                src={imgMcqImage.src}
                alt={currentQuestion?.imageAlt || "Question visual"}
                className="max-w-full max-h-full object-contain rounded-2xl -translate-y-2"
              />
            </div>
          </div>
        </div>

        {/* ── Right Panel: Question + Options ── */}
        <div className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700">
          {/* Question */}
          <div className="px-2">
            <h1 className="text-lg md:text-xl font-semibold leading-relaxed flex items-center gap-2 text-slate-900 dark:text-slate-200">
              <Languages className="w-5 h-5 text-blue-500 shrink-0" />
              {currentQuestion?.question}
            </h1>
          </div>

          {/* Options list */}
          <OptionsComponent
            options={currentQuestion?.options ?? []}
            selectedOption={selectedOption}
            correctIndex={currentQuestion?.correctIndex}
            showFeedback={showFeedback}
            onSelect={handleOptionSelect}
            showCheckIcon
            className="mt-2 sm:mt-5"
            itemClassName="t font-semibold leading-relaxed"
            renderLabel={(option, index) => (
              <>
                <span>{option}</span>
                {showFeedback && currentQuestion.englishOptions?.[index] && (
                  <span className="text-xs opacity-70 flex items-center gap-1  mt-0.5">
                    <Languages className="w-3 h-3 shrink-0" />
                    {currentQuestion.englishOptions[index]}
                  </span>
                )}
              </>
            )}
            renderSuffix={(option) => (
              <div
                onClick={(e) => handlePlayAudio(e, option)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer z-10 shrink-0"
                title="Listen"
              >
                <Volume2 className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400" />
              </div>
            )}
          />
        </div>
      </div>
    </PracticeGameLayout>
  );
}
