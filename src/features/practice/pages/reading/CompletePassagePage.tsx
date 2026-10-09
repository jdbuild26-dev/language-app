"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { TranslateButton } from "@/components/ui/TranslateButton";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
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

const BODY_TEXT_CLASS = "practice-type-content font-normal text-slate-700 dark:text-slate-200";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

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

  const [showPassageTranslation, setShowPassageTranslation] = useState(false);
  const [showHeadingTranslation, setShowHeadingTranslation] = useState(false);
  const [revealedOptionTranslations, setRevealedOptionTranslations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadMockCSV("practice/reading/complete_passage.csv", {
          learningLang, knownLang, tag,
        });
        const mapped = (Array.isArray(data) ? data : []).map((value: unknown) => {
          const item = asRecord(value);
          const c = item.content ? asRecord(item.content) : item;
          const e = item.evaluation ? asRecord(item.evaluation) : item;
          const cfg = item.config ? asRecord(item.config) : item;
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
  const { showQuestionInKnown } = useQuestionLanguage(currentQuestion?.level);
  usePracticeComplete({ isGameOver: isCompleted, score, totalQuestions: questions.length, exerciseType: "sentence_completion", level: currentQuestion?.level });

  // Passage always in learning language
  const passageBefore = learningLang === "fr"
    ? currentQuestion?.passage_before_fr || currentQuestion?.passage_before_en || currentQuestion?.passageBefore || ""
    : currentQuestion?.passage_before_en || currentQuestion?.passage_before_fr || currentQuestion?.passageBefore || "";
  const passageAfter = learningLang === "fr"
    ? currentQuestion?.passage_after_fr || currentQuestion?.passage_after_en || currentQuestion?.passageAfter || ""
    : currentQuestion?.passage_after_en || currentQuestion?.passage_after_fr || currentQuestion?.passageAfter || "";
  const translatedPassageBefore = learningLang === "fr" ? currentQuestion?.passage_before_en : currentQuestion?.passage_before_fr;
  const translatedPassageAfter = learningLang === "fr" ? currentQuestion?.passage_after_en : currentQuestion?.passage_after_fr;
  const canTranslatePassage = Boolean(
    translatedPassageBefore && translatedPassageAfter
    && (translatedPassageBefore !== passageBefore || translatedPassageAfter !== passageAfter)
  );

  const displayOptions = learningLang === "fr"
    ? currentQuestion?.options_fr?.length ? currentQuestion.options_fr : currentQuestion?.options ?? []
    : currentQuestion?.options_en?.length ? currentQuestion.options_en : currentQuestion?.options ?? [];
  const translationOptions = learningLang === "fr"
    ? currentQuestion?.options_en ?? []
    : currentQuestion?.options_fr ?? [];

  // Heading: level-based language
  const selectHeading = showQuestionInKnown
    ? "Select the best sentence to complete the passage"
    : "Choisissez la meilleure phrase pour compléter le passage";
  const translatedHeading = showQuestionInKnown
    ? "Choisissez la meilleure phrase pour compléter le passage"
    : "Select the best sentence to complete the passage";

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
    setShowPassageTranslation(false);
    setShowHeadingTranslation(false);
    setRevealedOptionTranslations({});
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
  const translatedSelectedSentence = selectedOption !== null ? translationOptions[selectedOption] || selectedSentence : "";
  const passagePlaceholder = learningLang === "fr"
    ? "[Sélectionnez la meilleure phrase pour compléter le passage]"
    : "[Select the best sentence to complete the passage]";

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
      preserveFooterHeightOnFeedback
      submitLabel={showFeedback ? (currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE") : "CHECK"}
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackTone={feedbackTone}
      feedbackMessage={feedbackMessage}
      correctAnswer={!isCorrect && showFeedback ? displayOptions[currentQuestion.correctIndex] : undefined}
      compactFeedback={!isCorrect}
    >
      <PracticeTwoPanel>
        {/* Left — Passage (always in learning language) */}
        <section className="practice-comprehension-scroll flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 overflow-y-auto" aria-label="Passage">
          {showFeedback && canTranslatePassage && (
            <div className="mb-2 flex justify-end">
              <TranslateButton onClick={() => setShowPassageTranslation(value => !value)} aria-label={showPassageTranslation ? "Hide passage translation" : "Translate passage"} title={showPassageTranslation ? "Hide passage translation" : "Translate passage"} aria-expanded={showPassageTranslation} />
            </div>
          )}
          <div className={BODY_TEXT_CLASS}>
            <p>{passageBefore}</p>
            <div className={cn(
              "my-4 rounded-lg bg-slate-100 dark:bg-slate-800/70 px-4 py-3 border-l-4",
              !showFeedback && "border-cyan-500",
              showFeedback && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
              showFeedback && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
            )}>
              <span className={cn("italic", selectedSentence ? "not-italic text-slate-900 dark:text-slate-50" : "text-slate-400 dark:text-slate-500")}>
                {selectedSentence || passagePlaceholder}
              </span>
            </div>
            <p>{passageAfter}</p>
          </div>
          {showFeedback && showPassageTranslation && canTranslatePassage && (
            <div className={cn(BODY_TEXT_CLASS, "mt-6 border-t border-slate-200 pt-5 dark:border-slate-700")}>
              <p>{translatedPassageBefore}</p>
              {translatedSelectedSentence && <p className="my-4">{translatedSelectedSentence}</p>}
              <p>{translatedPassageAfter}</p>
            </div>
          )}
        </section>

        {/* Right — Options */}
        <section className="practice-comprehension-scroll flex flex-1 min-h-0 flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-5 overflow-y-auto" aria-label="Answer options">
          <div className="flex shrink-0 items-start gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
            <TranslateButton onClick={() => setShowHeadingTranslation(value => !value)} aria-label={showHeadingTranslation ? "Show original heading" : "Translate heading"} title={showHeadingTranslation ? "Show original heading" : "Translate heading"} aria-pressed={showHeadingTranslation} className="h-10 w-10" />
            <h3 className="practice-reading-heading min-w-0 flex-1 !font-bold">{showHeadingTranslation ? translatedHeading : selectHeading}</h3>
          </div>

          <div className="my-auto grid shrink-0 auto-rows-fr gap-3 py-4">
            {displayOptions.map((option, index) => {
              const isSelected = selectedOption === index;
              const isOptionCorrect = showFeedback && index === currentQuestion.correctIndex;
              const isOptionWrong = showFeedback && isSelected && !isOptionCorrect;
              const isOptionMuted = showFeedback && !isSelected && !isOptionCorrect;
              const translatedOption = translationOptions[index];
              const canTranslateOption = Boolean(translatedOption && translatedOption !== option);
              const optionClasses = cn(
                "flex min-h-24 w-full min-w-0 items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors",
                "border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900",
                !showFeedback && "cursor-pointer hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isSelected && !showFeedback && "border-blue-500 bg-sky-50 shadow-[0_0_0_3px_rgba(59,130,246,0.12)] dark:border-blue-400 dark:bg-blue-950/30",
                isOptionCorrect && "border-emerald-500 bg-emerald-50 shadow-[0_0_0_3px_rgba(52,211,153,0.15)] dark:border-emerald-400 dark:bg-emerald-950/30",
                isOptionWrong && "border-red-400 bg-red-50 shadow-[0_0_0_3px_rgba(248,113,113,0.15)] dark:bg-red-950/30",
                isOptionMuted && "opacity-40",
              );
              const optionContent = (
                <>
                  <span className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                    "border-slate-300 dark:border-slate-600",
                    isSelected && !showFeedback && "border-blue-500 bg-blue-500",
                    isOptionCorrect && "border-emerald-500 bg-emerald-500",
                    isOptionWrong && "border-red-400 bg-red-400",
                  )} aria-hidden="true">
                    {(isSelected || isOptionCorrect || isOptionWrong) && (
                      <span className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        "bg-white",
                      )} />
                    )}
                  </span>
                  <span className={cn(
                    BODY_TEXT_CLASS,
                    "min-w-0 flex-1 break-words",
                    isOptionCorrect ? "text-emerald-700 dark:text-emerald-300" :
                      isOptionWrong ? "text-red-600 dark:text-red-300" :
                        "text-slate-700 dark:text-slate-200",
                  )}>
                    {showFeedback && revealedOptionTranslations[index] && canTranslateOption ? translatedOption : option}
                  </span>
                  {showFeedback && canTranslateOption && (
                    <TranslateButton iconVariant="option" onClick={() => setRevealedOptionTranslations(previous => ({ ...previous, [index]: !previous[index] }))} aria-label={`${revealedOptionTranslations[index] ? "Show original" : "Translate"} option ${index + 1}`} title={revealedOptionTranslations[index] ? "Show original option" : "Translate option"} aria-pressed={Boolean(revealedOptionTranslations[index])} />
                  )}
                </>
              );

              return showFeedback ? (
                <div key={`${index}-${option}`} className={optionClasses} role="status">
                  {optionContent}
                </div>
              ) : (
                <button key={`${index}-${option}`} type="button" onClick={() => handleOptionSelect(index)} aria-pressed={isSelected} className={optionClasses}>
                  {optionContent}
                </button>
              );
            })}
          </div>
        </section>
      </PracticeTwoPanel>
    </PracticeGameLayout>
  );
}
