"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { XCircle, Loader2, Languages } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { cn } from "@/lib/utils";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { loadMockCSV } from "@/utils/csvLoader";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
type CompletePassageQuestion = {
  // bilingual
  passage_before_fr?: string;
  passage_before_en?: string;
  passage_after_fr?: string;
  passage_after_en?: string;
  passage_title_fr?: string;
  passage_title_en?: string;
  options_fr?: string[];
  options_en?: string[];
  // legacy single-lang
  passageBefore?: string;
  passageAfter?: string;
  options?: string[];
  correctIndex: number;
  level?: string;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
  timeLimitSeconds?: number;
};

const DEFAULT_PLACEHOLDER = "[Select the best sentence to complete the passage]";
const PASSAGE_TEXT_CLASS = "practice-reading-passage-text";
const OPTION_TEXT_CLASS = "practice-reading-option-text";

function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string" && v) {
    try { return JSON.parse(v); } catch {
      return v.split("|").map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export default function CompletePassagePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <CompletePassageContent />
    </Suspense>
  );
}

function CompletePassageContent() {
  const handleExit = usePracticeExit();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const { learningLang = "fr", knownLang = "en" } = useLanguage() as {
    learningLang?: string;
    knownLang?: string;
  };

  const [questions, setQuestions] = useState<CompletePassageQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("error");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadMockCSV("practice/reading/sentence_completion.csv", {
          learningLang, knownLang, tag,
        });
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
          const c = item.content || item;
          const e = item.evaluation || item;
          const cfg = item.config || item;
          return {
            level:             item.Level || item.level || '',
            passage_title_fr:  c.passage_title_fr || item.passage_title_fr || '',
            passage_title_en:  c.passage_title_en || item.passage_title_en || '',
            passage_before_fr: c.passage_before_fr || item.passage_before_fr || '',
            passage_before_en: c.passage_before_en || item.passage_before_en || item.passageBefore || '',
            passage_after_fr:  c.passage_after_fr  || item.passage_after_fr  || '',
            passage_after_en:  c.passage_after_en  || item.passage_after_en  || item.passageAfter  || '',
            options_fr:        parseArr(c.options_fr || item.options_fr),
            options_en:        parseArr(c.options_en || item.options_en),
            options:           parseArr(c.options || item.options),
            correctIndex:      Number(e.correctIndex ?? item.correctIndex ?? item.eval_correctIndex ?? 0),
            timeLimitSeconds:  Number(cfg.timeLimitSeconds || item.timeLimitSeconds || 360),
            instructionFr:     item.instructionFr || item.instruction_fr || '',
            instructionEn:     item.instructionEn || item.instruction_en || '',
          } as CompletePassageQuestion;
        }).filter(q =>
          (q.passage_before_en || q.passage_before_fr || q.passageBefore) &&
          (q.passage_after_en  || q.passage_after_fr  || q.passageAfter)
        );
        if (mapped.length === 0) setError("No sentence completion questions found.");
        else setQuestions(mapped);
      } catch {
        setError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [learningLang, knownLang, tag]);

  const currentQuestion = questions[currentIndex];
  const { pick, showQuestionInKnown } = useQuestionLanguage(currentQuestion?.level);
  usePracticeComplete({ isGameOver: isCompleted, score, totalQuestions: questions.length, exerciseType: "sentence_completion", level: currentQuestion?.level });

  // Passage always in learning language
  const passageBefore = learningLang === "fr"
    ? currentQuestion?.passage_before_fr || currentQuestion?.passage_before_en || currentQuestion?.passageBefore || ""
    : currentQuestion?.passage_before_en || currentQuestion?.passage_before_fr || currentQuestion?.passageBefore || "";
  const passageAfter = learningLang === "fr"
    ? currentQuestion?.passage_after_fr || currentQuestion?.passage_after_en || currentQuestion?.passageAfter || ""
    : currentQuestion?.passage_after_en || currentQuestion?.passage_after_fr || currentQuestion?.passageAfter || "";

  // Options always in learning language (FR), EN shown after submit
  const displayOptions = currentQuestion?.options_fr?.length
    ? currentQuestion.options_fr
    : currentQuestion?.options ?? [];
  const translationOptions = currentQuestion?.options_en?.length
    ? currentQuestion.options_en
    : [];

  // Heading: level-based language
  const selectHeading = showQuestionInKnown
    ? "Select the best sentence to complete the passage"
    : "Choisissez la meilleure phrase pour compléter le passage";

  const timerDuration = useMemo(() => currentQuestion?.timeLimitSeconds || 360, [currentQuestion]);

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setFeedbackTone("error");
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback || loading,
  });

  useEffect(() => {
    if (!currentQuestion || isCompleted) return;
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackTone("error");
    setFeedbackMessage("");
    resetTimer();
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleOptionSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (!currentQuestion || showFeedback || selectedOption === null) return;
    const correct = selectedOption === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setFeedbackTone(correct ? "success" : "error");
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    if (correct) setScore(prev => prev + 1);
  };

  const handleContinue = () => {
    if (!showFeedback) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return;
    }
    setIsCompleted(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Practice</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error || "No question available."}</p>
          <button onClick={handleExit} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const selectedSentence = selectedOption !== null ? displayOptions[selectedOption] : "";

  return (
    <PracticeGameLayout
      questionType="Complete the passage"
      questionTypeFr="Complétez le passage"
      questionTypeEn="Complete the passage"
      localizedInstruction={showQuestionInKnown ? "Select the best sentence to complete the passage" : "Choisissez la meilleure phrase"}
      instructionFr={currentQuestion.instructionFr || "Choisissez la meilleure phrase"}
      instructionEn={currentQuestion.instructionEn || "Select the best sentence to complete the passage"}
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
      submitLabel={showFeedback ? (currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE") : "CHECK"}
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackTone={feedbackTone}
      feedbackMessage={feedbackMessage}
      correctAnswer={!isCorrect && showFeedback ? displayOptions[currentQuestion.correctIndex] : undefined}
    >
      <div className="practice-reading-page-shell flex flex-col md:flex-row gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0">
        {/* Left — Passage (always in learning language) */}
        <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em] mb-5">
            PASSAGE
          </p>
          <div className={PASSAGE_TEXT_CLASS}>
            <p>{passageBefore}</p>
            <div className={cn(
              "my-4 rounded-lg bg-slate-100 dark:bg-slate-800/70 px-4 py-3 border-l-4",
              !showFeedback && "border-cyan-500",
              showFeedback && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
              showFeedback && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
            )}>
              <span className={cn("italic", selectedSentence ? "not-italic text-slate-900 dark:text-slate-50" : "text-slate-400 dark:text-slate-500")}>
                {selectedSentence || DEFAULT_PLACEHOLDER}
              </span>
            </div>
            <p>{passageAfter}</p>
          </div>
        </div>

        {/* Right — Options */}
        <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 overflow-y-auto">
          <h3 className="practice-reading-heading mb-6 flex items-center gap-2">
            <Languages className="w-5 h-5 text-blue-500" />
            {selectHeading}
          </h3>

          <div className="space-y-3">
            {displayOptions.map((option, index) => {
              const isSelected = selectedOption === index;
              const isOptionCorrect = showFeedback && index === currentQuestion.correctIndex;
              const isOptionWrong = showFeedback && isSelected && !isOptionCorrect;
              const enTranslation = translationOptions[index];

              return (
                <button
                  key={`${index}-${option}`}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full rounded-2xl border px-5 py-4 text-left flex items-start gap-4 transition-colors",
                    "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
                    !showFeedback && "hover:border-slate-300",
                    isSelected && !showFeedback && "border-blue-400 bg-blue-50 dark:bg-blue-900/20",
                    isOptionCorrect && "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
                    isOptionWrong && "border-red-400 bg-red-50 dark:bg-red-900/20",
                  )}
                >
                  <span className={cn(
                    "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                    "border-slate-300 dark:border-slate-600",
                    isSelected && !showFeedback && "border-blue-500",
                    isOptionCorrect && "border-emerald-500",
                    isOptionWrong && "border-red-500",
                  )}>
                    {(isSelected || isOptionCorrect || isOptionWrong) && (
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        isOptionCorrect && "bg-emerald-500",
                        isOptionWrong && "bg-red-500",
                        isSelected && !showFeedback && "bg-blue-500",
                      )} />
                    )}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className={OPTION_TEXT_CLASS}>{option}</span>
                    {/* EN translation shown after submit */}
                    {showFeedback && enTranslation && learningLang === "fr" && (
                      <span className="text-xs opacity-60 flex items-center gap-1">
                        <Languages className="w-3 h-3 shrink-0" />
                        {enTranslation}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}

type CompletePassageQuestion = {
  passageBefore: string;
  passageAfter: string;
  options: string[];
  correctIndex: number;
  level?: string;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
  timeLimitSeconds?: number;
};
