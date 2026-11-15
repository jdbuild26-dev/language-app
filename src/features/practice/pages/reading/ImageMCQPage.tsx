"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { loadMockCSV } from "@/utils/csvLoader";
import { CheckCircle2, ImageOff, Loader2, XCircle } from "lucide-react";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { useLanguage } from "@/contexts/LanguageContext";
import { readImageMcqLocales, type ImageMcqLocale } from "@/features/practice/lib/imageMcqLocalization";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";

type ImageMCQQuestion = {
  timeLimitSeconds?: number;
  sourceLang?: string;
  localized?: Record<string, ImageMcqLocale>;
  // Legacy format
  options?: string[];
  englishOptions?: string[];
  imageUrl?: string;
  imageAlt?: string;
  question?: string;
  level?: string;
  correctIndex: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Older CSV rows use pipe-separated option lists.
  }
  return value.split("|").map(option => option.trim()).filter(Boolean);
}

export default function ImageMCQPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <ImageMCQContent />
    </Suspense>
  );
}

function ImageMCQContent() {
  const handleExit = usePracticeExit();
  const { learningLang: requestedLearningLang, knownLang: requestedKnownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;

  const [questions, setQuestions] = useState<ImageMCQQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const data = await loadMockCSV("practice/reading/image_mcq.csv", {
          tag, learningLang: requestedLearningLang, knownLang: requestedKnownLang,
        });
        const mapped = (Array.isArray(data) ? data : []).map((value: unknown) => {
          const item = asRecord(value);
          const c = item.content ? asRecord(item.content) : item;
          const e = item.evaluation ? asRecord(item.evaluation) : item;
          const cfg = item.config ? asRecord(item.config) : item;

          return {
            level:            item.Level || item.level || '',
            sourceLang:       String(item.learning_lang || item.LearningLang || requestedLearningLang).toLowerCase(),
            localized:        readImageMcqLocales(item, c),
            question:         c.question_en || item.question_en || item.question || '',
            // legacy fallback
            options:          parseArray(c.options || item.options),
            englishOptions:   parseArray(c.englishOptions || item.englishOptions),
            imageUrl:         c.imageUrl || item.imageUrl || c.imageEmoji || item.imageEmoji || '',
            imageAlt:         c.imageAlt || item.imageAlt || '',
            correctIndex:     Number(e.correctIndex ?? item.correctIndex ?? item.eval_correctIndex ?? 0),
            timeLimitSeconds: Number(cfg.timeLimitSeconds || item.timeLimitSeconds || 120),
          } as ImageMCQQuestion;
        });
        const selectedLanguage = requestedLearningLang.toLowerCase();
        setQuestions(mapped.filter(question => {
          const selectedOptions = question.localized?.[selectedLanguage]?.options;
          return selectedOptions?.length || (question.sourceLang === selectedLanguage && question.options?.length);
        }));
        setCurrentIndex(0);
        setSelectedOption(null);
        setShowFeedback(false);
        setIsCompleted(false);
        setScore(0);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [tag, requestedLearningLang, requestedKnownLang]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [revealedOptionTranslations, setRevealedOptionTranslations] = useState<Record<number, boolean>>({});
  const currentQuestion = questions[currentIndex];
  const { pick, pickTranslation, learningLang, knownLang } = useQuestionLanguage(currentQuestion?.level);
  usePracticeComplete({ isGameOver: isCompleted, score, totalQuestions: questions.length, exerciseType: "image_mcq", level: currentQuestion?.level });

  const learningLocale = currentQuestion?.localized?.[learningLang];
  const knownLocale = currentQuestion?.localized?.[knownLang];
  // Question text: level-based language
  const questionText = pick(learningLocale?.question, knownLocale?.question) || currentQuestion?.question || "";
  const questionTranslation = pickTranslation(learningLocale?.question, knownLocale?.question);
  const learningHeading = learningLocale?.heading || "Choose the correct description";
  const knownHeading = knownLocale?.heading || learningHeading;

  // Options stay in the learning language until a translation is requested.
  const displayOptions = learningLocale?.options.length
    ? learningLocale.options
    : currentQuestion?.options ?? [];
  const translationOptions = knownLocale?.options.length
    ? knownLocale.options
    : currentQuestion?.englishOptions ?? [];

  const timerDuration = currentQuestion?.timeLimitSeconds || 120;

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
      setShowTranslation(false);
      setRevealedOptionTranslations({});
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
    setFeedbackMessage(correct ? "Correct" : "Incorrect");
    setShowFeedback(true);
    if (correct) setScore((prev) => prev + 1);
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

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
        <button type="button" onClick={handleExit} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 dark:border-slate-600 dark:text-slate-200">Back</button>
      </div>
    );
  }

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <PracticeGameLayout
      questionType="Match Image to Description"
      questionTypeFr="Faire correspondre l'image à la description"
      questionTypeEn="Match Image to Description"
      instructionFr={learningHeading}
      instructionEn={knownHeading}
      localizedInstruction={pick(learningHeading, knownHeading)}
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
      animateFeedbackEntrance={false}
      submitLabel={
        showFeedback
          ? currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"
          : "Submit Answer"
      }
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackTone={isCorrect ? "success" : "error"}
      feedbackMessage={feedbackMessage}
    >
      <div className="practice-two-panel-shell flex min-h-0 flex-1 flex-col p-3 sm:p-4 md:overflow-hidden">
        <PracticeTwoPanel ratio="three-two" className="!p-0 md:flex-1 md:gap-4">
          <section className="flex min-h-[16rem] min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:min-h-0 md:p-6 [@media(max-height:950px)]:gap-2 [@media(max-height:950px)]:p-4" aria-label="Question image">
            {currentQuestion?.imageUrl ? (
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="flex min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 md:flex-1" aria-label="Enlarge question image">
                    <img src={currentQuestion.imageUrl} alt={currentQuestion.imageAlt || "Image for this question"} className="block h-auto max-h-[60vh] w-full object-cover md:h-full md:max-h-full" />
                  </button>
                </DialogTrigger>
                <DialogContent data-main-practice-scroll className="max-h-[95dvh] max-w-[min(95vw,80rem)] overflow-auto p-3 sm:p-5">
                  <DialogTitle className="sr-only">Question image</DialogTitle>
                  <img src={currentQuestion.imageUrl} alt={currentQuestion.imageAlt || "Image for this question"} className="mx-auto max-h-[85dvh] max-w-full rounded-xl object-contain" />
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-slate-500 dark:text-slate-400">
                <ImageOff className="h-8 w-8" aria-hidden="true" />
                <p>Image unavailable</p>
              </div>
            )}
          </section>

          <section className="practice-comprehension-scroll flex min-h-0 min-w-0 flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5" aria-label="Answer options">
            <div className="w-full shrink-0 pb-4">
              <div className="flex w-full items-start gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                {questionTranslation && questionTranslation !== questionText && (
                  <TranslateButton onClick={() => setShowTranslation(value => !value)} aria-label={showTranslation ? "Show original question" : "Translate question"} title={showTranslation ? "Show original question" : "Translate question"} aria-pressed={showTranslation} iconSize="md" className="h-10 w-10 shrink-0" />
                )}
                <h2 className="practice-type-question-heading min-w-0 text-slate-900 dark:text-slate-100">
                  {showTranslation && questionTranslation ? questionTranslation : questionText}
                </h2>
              </div>
            </div>
            <div className="flex flex-col gap-3" role="group" aria-label="Answer options">
              {displayOptions.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectOption = showFeedback && index === currentQuestion?.correctIndex;
                const isWrongOption = showFeedback && isSelected && !isCorrectOption;
                const translation = translationOptions[index];
                const hasTranslation = Boolean(translation && translation !== option);
                const showOptionTranslation = Boolean(revealedOptionTranslations[index] && hasTranslation);
                const optionText = (
                  <span className="block break-words">{showOptionTranslation ? translation : option}</span>
                );
                const optionClasses = cn(
                  "practice-type-content flex min-h-20 w-full min-w-0 items-center gap-3 rounded-xl border-2 px-4 py-2 text-left font-normal !leading-normal transition-colors",
                  isCorrectOption
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-200"
                    : isWrongOption
                      ? "border-red-400 bg-red-50 text-red-800 dark:border-red-400 dark:bg-red-950/30 dark:text-red-200"
                      : isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-200"
                        : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
                );

                if (!showFeedback) {
                  return (
                    <button key={index} data-practice-option type="button" aria-pressed={isSelected} onClick={() => handleOptionSelect(index)} className={cn(optionClasses, "cursor-pointer hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500")}>
                      <span className={cn("h-5 w-5 shrink-0 rounded-full border-2", isSelected ? "border-blue-600 bg-blue-600 shadow-[inset_0_0_0_4px_white]" : "border-slate-300 dark:border-slate-500")} aria-hidden="true" />
                      <span className="min-w-0 flex-1">{optionText}</span>
                      <span className="h-10 w-10 shrink-0" aria-hidden="true" />
                    </button>
                  );
                }

                return (
                  <div key={index} data-practice-option data-option-selected={isSelected} className={optionClasses}>
                    {isCorrectOption ? <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" /> : isWrongOption ? <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> : <span className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-500" aria-hidden="true" />}
                    <div className="min-w-0 flex-1">
                      {isCorrectOption && <span className="sr-only">Correct answer: </span>}
                      {isWrongOption && <span className="sr-only">Your incorrect answer: </span>}
                      {optionText}
                    </div>
                    <div className="h-10 w-10 shrink-0">
                      {hasTranslation && (
                        <TranslateButton iconVariant="option" onClick={() => setRevealedOptionTranslations(previous => ({ ...previous, [index]: !previous[index] }))} aria-label={`${revealedOptionTranslations[index] ? "Hide" : "Show"} translation for option ${index + 1}`} title={revealedOptionTranslations[index] ? "Hide translation" : "Translate option"} aria-expanded={Boolean(revealedOptionTranslations[index])} iconSize="md" className="h-10 w-10" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </PracticeTwoPanel>
      </div>
    </PracticeGameLayout>
  );
}
