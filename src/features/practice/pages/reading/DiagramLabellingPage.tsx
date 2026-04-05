"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import CustomSelect from "@/components/ui/CustomSelect";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

type DiagramQuestion = {
  id: number | string;
  correct: string;
};

type DiagramLabellingItem = {
  title?: string;
  paragraphs?: string[];
  options?: string[];
  questions?: DiagramQuestion[];
  imagePath?: string;
};

export default function DiagramLabellingPage() {
  const handleExit = usePracticeExit();

  // State
  const [questions, setQuestions] = useState<DiagramLabellingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMockCSV("practice/reading/diagram_labelling.csv");
      setQuestions(Array.isArray(data) ? (data as DiagramLabellingItem[]) : []);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const currentQuestion = questions[0];
  const PASSAGE_TITLE = currentQuestion?.title || "";
  const PASSAGE_PARAGRAPHS = currentQuestion?.paragraphs || [];
  const OPTIONS = currentQuestion?.options || [];
  const DIAGRAM_QUESTIONS = currentQuestion?.questions || [];
  const eggDiagram = currentQuestion?.imagePath || "";

  // Timer
  const { timerString } = useExerciseTimer({
    mode: "stopwatch",
    onExpire: () => {},
    isPaused: isCompleted || showFeedback,
  });

  // Handlers
  const handleSelect = (id: string | number, value: string) => {
    if (showFeedback) return;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheck = () => {
    let correctCount = 0;
    DIAGRAM_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correct) correctCount++;
    });

    setScore(correctCount);
    const total = DIAGRAM_QUESTIONS.length;
    const isPerfect = correctCount === total;

    setIsCorrect(isPerfect);

    if (isPerfect) {
      setFeedbackMessage("Perfect! You identified all parts correctly!");
      setCorrectAnswerText("");
      setIsCompleted(true);
    } else {
      setFeedbackMessage(
        `You got ${correctCount} out of ${total} correct. Check the highlighted boxes.`,
      );
      // Build "Correct Answer:" text listing only the wrong ones
      const wrongOnes = DIAGRAM_QUESTIONS.filter(
        (q) => answers[q.id] !== q.correct,
      );
      const answerList = wrongOnes
        .map((q) => `${q.id}: ${q.correct}`)
        .join("   •   ");
      setCorrectAnswerText(answerList);
    }

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (showFeedback) {
      if (isCorrect) {
        handleExit();
      } else {
        setShowFeedback(false);
      }
    } else {
      handleCheck();
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setShowFeedback(false);
    setIsCompleted(false);
    setScore(0);
    setIsCorrect(false);
    setFeedbackMessage("");
    setCorrectAnswerText("");
  };

  const allAnswered = DIAGRAM_QUESTIONS.every((q) => answers[q.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
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

  return (
    <PracticeGameLayout
      questionType="Diagram Labelling"
      questionTypeFr="Étiquetage du diagramme"
      questionTypeEn="Diagram Labelling"
      instructionFr="Étiquetez le diagramme"
      instructionEn="Label the diagram"
      localizedInstruction={undefined}
      progress={
        isCompleted
          ? 100
          : (Object.keys(answers).length / DIAGRAM_QUESTIONS.length) * 100
      }
      isGameOver={isCompleted}
      score={score}
      totalQuestions={DIAGRAM_QUESTIONS.length}
      onExit={handleExit}
      onNext={handleNext}
      onRestart={handleRestart}
      currentQuestionIndex={0}
      questionCounterValue={1}
      feedbackTone={
        showFeedback ? (isCorrect ? "success" : "error") : "neutral"
      }
      isSubmitEnabled={showFeedback || allAnswered}
      showSubmitButton={true}
      submitLabel={
        showFeedback ? (isCorrect ? "Finish" : "Try Again") : "Check Answers"
      }
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackMessage={feedbackMessage}
      correctAnswer={correctAnswerText}
    >
      <div
        className={cn(
          "practice-reading-page-shell flex min-h-0 w-full flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-4 mx-auto overflow-y-auto md:overflow-hidden flex-1",
        )}
      >
        {/* Left Column: Reading Passage */}
        <div className="md:basis-[48%] md:max-w-[48%] min-h-0 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <h2 className="text-base font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              {PASSAGE_TITLE}
            </h2>
          </div>
          <div className="mt-4 space-y-4 text-justify text-slate-700 dark:text-slate-300 text-base md:text-lg font-medium leading-8 md:leading-9">
            {PASSAGE_PARAGRAPHS.map((para: string, idx: number) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        {/* Right Column: Diagram + Dropdowns */}
        <div className="md:basis-[52%] md:max-w-[52%] min-h-0 flex flex-col justify-start dark:bg-slate-900 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 p-4 md:p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {/* Card 1: Diagram Image */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700 flex justify-center items-center shadow-sm min-h-[200px] md:min-h-[260px] lg:min-h-[300px]">
              <img
                src={eggDiagram}
                alt="Egg Diagram"
                className="max-h-[36vh] md:max-h-[300px] lg:max-h-[340px] w-auto max-w-full object-contain"
              />
            </div>

            {/* Card 2: Dropdown Questions */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col gap-4">
              <h3 className="practice-reading-heading flex items-center gap-2">
                <Languages className="w-5 h-5 text-blue-500" />
                Select the best option for each missing word
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {DIAGRAM_QUESTIONS.map((q) => {
                  const isWrong = showFeedback && answers[q.id] !== q.correct;
                  const isRight = showFeedback && answers[q.id] === q.correct;
                  const hasSelection = Boolean(answers[q.id]);

                  return (
                    <div
                      key={q.id}
                      className="flex items-center gap-2 md:gap-3"
                    >
                      {/* Number Label */}
                      <div
                        className={cn(
                          "w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center font-bold text-base shadow-sm border shrink-0 transition-colors",
                          isRight
                            ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-300 dark:border-green-700"
                            : isWrong
                              ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-700"
                              : hasSelection
                                ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700",
                        )}
                      >
                        {q.id}
                      </div>

                      {/* Dropdown */}
                      <CustomSelect
                        options={[...OPTIONS].sort()}
                        value={answers[q.id] || ""}
                        onChange={(val: string) => handleSelect(q.id, val)}
                        placeholder="Select a word"
                        disabled={showFeedback}
                        isCorrect={isRight}
                        isWrong={isWrong}
                        className="flex-1 min-w-0 md:min-w-[220px] practice-reading-select"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
