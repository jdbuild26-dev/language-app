"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { Languages, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
type ComprehensionQuestion = {
  passage?: string;
  passage_fr?: string;
  passage_en?: string;
  passage_title_fr?: string;
  passage_title_en?: string;
  question?: string;
  question_fr?: string;
  question_en?: string;
  level?: string;
  // new bilingual options
  options_fr?: string[];
  options_en?: string[];
  // legacy
  options?: string[];
  correctIndex: number;
  localizedInstruction?: string;
  instructionFr?: string;
  instructionEn?: string;
  timeLimitSeconds?: number;
};

function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v) {
    try { return JSON.parse(v); } catch { return v.split("|").map(s => s.trim()).filter(Boolean); }
  }
  return [];
}

export default function ComprehensionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <ComprehensionContent />
    </Suspense>
  );
}

function ComprehensionContent() {
  const handleExit = usePracticeExit();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const { learningLang = "fr", knownLang = "en" } = useLanguage() as {
    learningLang?: string;
    knownLang?: string;
  };

  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [translatedQuestion, setTranslatedQuestion] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await loadMockCSV("practice/reading/comprehension.csv", {
          learningLang, knownLang, tag,
        });
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
          const c = item.content || item;
          const e = item.evaluation || item;
          const cfg = item.config || item;
          return {
            level:            item.Level || item.level || '',
            passage_fr:       c.passage_fr || item.passage_fr || item.passage || '',
            passage_en:       c.passage_en || item.passage_en || item.passage || '',
            passage_title_fr: c.passage_title_fr || item.passage_title_fr || '',
            passage_title_en: c.passage_title_en || item.passage_title_en || '',
            question_fr:      c.question_fr || item.question_fr || '',
            question_en:      c.question_en || item.question_en || item.question || '',
            question:         c.question_en || item.question_en || item.question || '',
            options_fr:       parseArr(c.options_fr || item.options_fr),
            options_en:       parseArr(c.options_en || item.options_en),
            options:          parseArr(c.options || item.options),
            correctIndex:     Number(e.correctIndex ?? item.correctIndex ?? item.eval_correctIndex ?? 0),
            timeLimitSeconds: Number(cfg.timeLimitSeconds || item.timeLimitSeconds || 60),
            instructionFr:    item.instructionFr || item.instruction_fr || '',
            instructionEn:    item.instructionEn || item.instruction_en || '',
          } as ComprehensionQuestion;
        });
        setQuestions(mapped);
      } catch (error) {
        console.error("Error loading comprehension data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [learningLang, knownLang, tag]);

  const currentQuestion = questions[currentIndex];
  const { pick, pickTranslation, showQuestionInKnown } = useQuestionLanguage(currentQuestion?.level);
  usePracticeComplete({ isGameOver: isCompleted, score, totalQuestions: questions.length, exerciseType: "passage_mcq", level: currentQuestion?.level });

  // Passage always in learning language
  const passageText  = learningLang === "fr"
    ? currentQuestion?.passage_fr || currentQuestion?.passage_en || currentQuestion?.passage || ""
    : currentQuestion?.passage_en || currentQuestion?.passage_fr || currentQuestion?.passage || "";
  const passageTitle = learningLang === "fr"
    ? currentQuestion?.passage_title_fr || currentQuestion?.passage_title_en || ""
    : currentQuestion?.passage_title_en || currentQuestion?.passage_title_fr || "";

  // Question: level-based language
  const questionText = pick(currentQuestion?.question_fr, currentQuestion?.question_en)
    || currentQuestion?.question || "";
  const questionTranslationSource = pickTranslation(currentQuestion?.question_fr, currentQuestion?.question_en)
    || currentQuestion?.question || "";

  // Options: always in learning language (FR), EN shown after submit
  const displayOptions = currentQuestion?.options_fr?.length
    ? currentQuestion.options_fr
    : currentQuestion?.options ?? [];
  const translationOptions = currentQuestion?.options_en?.length
    ? currentQuestion.options_en
    : [];

  const handleTranslateQuestion = async () => {
    if (!questionTranslationSource) return;
    if (showTranslation) { setShowTranslation(false); return; }
    if (translatedQuestion) { setShowTranslation(true); return; }
    try {
      setIsTranslating(true);
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: questionTranslationSource, target_lang: learningLang }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { translation?: string };
      setTranslatedQuestion(data.translation || "");
      setShowTranslation(true);
    } catch { setTranslatedQuestion(""); setShowTranslation(false); }
    finally { setIsTranslating(false); }
  };

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
      setTranslatedQuestion("");
      setShowTranslation(false);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

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
    if (correct) setScore(prev => prev + 1);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
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
        <p className="text-xl text-slate-600 dark:text-slate-400">No questions available.</p>
        <button
          onClick={() => handleExit()}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back
        </button>
      </div>
    );
  }

  const OptionsComponent = PracticeOptions as unknown as React.ComponentType<{
    options: string[];
    selectedOption: number | null;
    correctIndex?: number;
    showFeedback: boolean;
    onSelect: (index: number) => void;
    renderLabel?: (option: string, index: number) => React.ReactNode;
  }>;

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Reading Comprehension"
        questionTypeFr="Compréhension de lecture"
        questionTypeEn="Reading Comprehension"
        localizedInstruction={showQuestionInKnown ? "Read the passage and answer" : "Lisez le passage et répondez"}
        instructionFr={currentQuestion?.instructionFr || "Lisez le passage et répondez"}
        instructionEn={currentQuestion?.instructionEn || "Read the passage and answer"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        currentQuestionIndex={currentIndex}
        questionCounterValue={currentIndex + 1}
        isSubmitEnabled={selectedOption !== null || showFeedback}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"
            : "Submit Answer"
        }
        timerValue={timerString}
        feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
      >
        <div className="practice-reading-page-shell flex flex-col md:flex-row gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0">
          {/* Left Column — Passage (always in learning language) */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            {passageTitle && (
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                {passageTitle}
              </p>
            )}
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              PASSAGE
            </p>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
              <p className="practice-reading-option-text font-medium text-slate-700 dark:text-slate-200">
                {passageText}
              </p>
            </div>
          </div>

          {/* Right Column — Question & Options */}
          <div className="flex-1 min-h-0 flex flex-col dark:bg-slate-900 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 p-5 md:p-8 gap-5 overflow-y-auto">
            {/* Question with translate button */}
            <h3 className="mb-2 flex items-start gap-2">
              <button
                type="button"
                onClick={handleTranslateQuestion}
                disabled={isTranslating}
                aria-label={showTranslation ? "Show original" : "Translate question"}
                className="inline-flex items-center justify-center shrink-0 mt-1 text-blue-500 hover:text-blue-600 disabled:opacity-60"
              >
                {isTranslating
                  ? <span className="w-5 h-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                  : <Languages className="w-5 h-5 text-blue-500 shrink-0 mt-1" />}
              </button>
              <span className="practice-reading-option-text font-medium">
                {showTranslation && translatedQuestion ? translatedQuestion : questionText}
              </span>
            </h3>

            {/* Options — always in learning language, EN shown after submit */}
            <OptionsComponent
              options={displayOptions}
              selectedOption={selectedOption}
              correctIndex={currentQuestion?.correctIndex ?? -1}
              showFeedback={showFeedback}
              onSelect={handleOptionSelect}
              renderLabel={(option: string, index: number) => (
                <>
                  <span>{option}</span>
                  {showFeedback && translationOptions[index] && (
                    <span className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                      <Languages className="w-3 h-3 shrink-0" />
                      {translationOptions[index]}
                    </span>
                  )}
                </>
              )}
            />
          </div>
        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={!isCorrect ? displayOptions[currentQuestion.correctIndex] : null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"}
        />
      )}
    </>
  );
}

type ComprehensionQuestion = {
  passage?: string;
  question?: string;
  question_fr?: string;
  question_en?: string;
  heading?: string;
  heading_fr?: string;
  heading_en?: string;
  level?: string;
  options: string[];
  correctIndex: number;
  localizedInstruction?: string;
  instructionFr?: string;
  instructionEn?: string;
  timeLimitSeconds?: number;
};
