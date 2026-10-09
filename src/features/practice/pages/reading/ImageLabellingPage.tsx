"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { Button } from "@/components/ui/button";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Check, ImageOff, Loader2, X } from "lucide-react";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CustomSelect from "@/components/ui/CustomSelect";
// ── Types ─────────────────────────────────────────────────────────────────────

type LabelItem = {
  id: number;
  name: string;      // correct name (learning lang)
  name_fr: string;
  name_en: string;
  options?: string[]; // list of strings (learning lang)
};

type ImageLabellingExercise = {
  external_id?: string;
  level?: string;
  title?: string;
  title_fr?: string;
  title_en?: string;
  question_fr?: string;
  question_en?: string;
  instructionFr?: string;
  instructionEn?: string;
  image?: string;
  items: LabelItem[];
  timeLimitSeconds?: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseArr<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === "string" && v) {
    try {
      const parsed: unknown = JSON.parse(v);
      return Array.isArray(parsed) ? parsed as T[] : [];
    } catch { return []; }
  }
  return [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function firstText(...values: unknown[]): string {
  return values.find((value): value is string => typeof value === "string" && Boolean(value.trim())) || "";
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function ImageLabellingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    }>
      <ImageLabellingContent />
    </Suspense>
  );
}

function ImageLabellingContent() {
  const handleExit = usePracticeExit();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;

  const [exercises, setExercises] = useState<ImageLabellingExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [revealedTranslations, setRevealedTranslations] = useState<Record<number, boolean>>({});
  const [showQuestionTranslation, setShowQuestionTranslation] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPracticeData("image_labelling", { tag });
        const mapped = (Array.isArray(data) ? data : []).map((value: unknown) => {
          const item = asRecord(value);
          const c = item.content ? asRecord(item.content) : item;
          const cfg = item.config ? asRecord(item.config) : item;
          const exerciseLearningLang = firstText(item.learning_lang) || "fr";

          const rawItems = parseArr<unknown>(c.items || item.items);
          const mappedItems = rawItems.map((rawItem) => {
            const it = asRecord(rawItem);
            const opts = exerciseLearningLang === 'fr'
              ? parseArr<string>(it.options_fr) 
              : parseArr<string>(it.options_en);

            return {
              id: Number(it.id),
              name: exerciseLearningLang === 'fr' ? firstText(it.name_fr, it.name) : firstText(it.name_en, it.name),
              name_fr: firstText(it.name_fr, it.name),
              name_en: firstText(it.name_en, it.name),
              options: opts.length > 0 ? opts : []
            } as LabelItem;
          });

          return {
            external_id:  firstText(item.external_id, item.ExerciseID),
            level:        firstText(item.Level, item.level),
            title:        firstText(c.title_en, item.title_en, item.title),
            title_fr:     firstText(c.title_fr, item.title_fr),
            title_en:     firstText(c.title_en, item.title_en, item.title),
            question_fr:  firstText(c.question_fr, item.question_fr),
            question_en:  firstText(c.question_en, item.question_en),
            instructionFr: firstText(item.instructionFr, item.instruction_fr),
            instructionEn: firstText(item.instructionEn, item.instruction_en),
            image:        firstText(c.image, item.image, item.imageUrl),
            items:        mappedItems,
            timeLimitSeconds: Number(cfg.timeLimitSeconds || item.timeLimitSeconds || 120),
          } as ImageLabellingExercise;
        });
        setExercises(mapped);
      } catch (e) {
        console.error("Error loading image labelling data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tag]);

  const ex = exercises[currentIndex];
  const { pick, pickTranslation } = useQuestionLanguage(ex?.level);
  usePracticeComplete({ isGameOver: isCompleted, score: totalScore, totalQuestions: exercises.length, exerciseType: "image_labelling", level: ex?.level });

  const titleText    = pick(ex?.title_fr, ex?.title_en) || ex?.title || "Image Labelling";
  const instructionText = pick("Étiquetez l'image", "Label the image");
  const questionFr = firstText(ex?.question_fr, "Associez chaque numéro à la bonne étiquette.");
  const questionEn = firstText(ex?.question_en, "Match each number with the correct label.");
  const questionText = pick(questionFr, questionEn);
  const questionTranslation = pickTranslation(questionFr, questionEn);

  // ── Reset per exercise ─────────────────────────────────────────────────────
  const resetGame = () => {
    setUserAnswers({});
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackMessage("");
    setRevealedTranslations({});
    setShowQuestionTranslation(false);
  };

  useEffect(() => {
    if (ex) {
      resetGame();
      resetTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, ex?.external_id]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const { timerString, resetTimer } = useExerciseTimer({
    mode: "timer",
    duration: ex?.timeLimitSeconds || 120,
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  // ── Interaction handlers ───────────────────────────────────────────────────
  const handleAnswerChange = (itemId: number, value: string) => {
    if (showFeedback) return;
    setUserAnswers(prev => ({ ...prev, [itemId]: value }));
  };

  const handleCheck = () => {
    if (!ex?.items.length) return;
    
    let correct = 0;
    ex.items.forEach(item => {
      if (userAnswers[item.id] === item.name) {
        correct++;
      }
    });

    setTotalScore(prev => prev + (correct === ex.items.length ? 1 : 0)); // Score per exercise or per item?
    // Let's stick to per-item score for totalScore if that's the app pattern, 
    // but usually totalScore is total correct items.
    
    const total = ex.items.length;
    if (correct === total) {
      setIsCorrect(true);
      setFeedbackMessage(`Perfect! All ${total} correct!`);
    } else {
      setIsCorrect(false);
      setFeedbackMessage(`${correct} out of ${total} correct. Try again!`);
    }
    setShowFeedback(true);
  };

  const handleContinue = () => {
    if (!showFeedback) return;
    if (currentIndex < exercises.length - 1) {
      resetGame();
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // ── Loading / empty ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!ex) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No exercises found</h2>
        <p className="text-slate-500 mb-6">There was an issue loading the practice data.</p>
        <Button onClick={handleExit}>Go Back</Button>
      </div>
    );
  }

  const filledCount = Object.values(userAnswers).filter(v => v !== "").length;
  const totalCount = ex.items.length;
  const progress = exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PracticeGameLayout
      questionType={titleText}
      instructionFr="Étiquetez l'image"
      instructionEn="Label the image"
      localizedInstruction={instructionText}
      progress={progress}
      onExit={handleExit}
      timerValue={timerString}
      showSubmitButton={true}
      isSubmitEnabled={showFeedback || filledCount === totalCount}
      onNext={showFeedback ? handleContinue : handleCheck}
      submitLabel={
        showFeedback
          ? currentIndex < exercises.length - 1 ? "Continue" : "Finish"
          : "Check Answers"
      }
      preserveFooterHeightOnFeedback
      animateFeedbackEntrance={false}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackTone={isCorrect ? "success" : "error"}
      feedbackMessage={feedbackMessage}
      score={totalScore}
      totalQuestions={exercises.length}
      currentQuestionIndex={currentIndex}
      isGameOver={isCompleted}
      onRestart={() => { setCurrentIndex(0); setIsCompleted(false); setTotalScore(0); resetGame(); resetTimer(); }}
    >
      <PracticeTwoPanel ratio="three-two" className="sm:p-4 md:gap-4">
        <section className="practice-dark-panel flex h-[min(60vh,36rem)] min-h-[16rem] min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:h-full md:min-h-0 md:p-4" aria-label="Image to label">
          {ex.image ? (
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="relative h-full min-h-0 w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500" aria-label="Enlarge image">
                  <Image src={ex.image} alt="Image to label" fill unoptimized sizes="(min-width: 768px) 70vw, 100vw" className="object-contain" />
                </button>
              </DialogTrigger>
              <DialogContent className="h-[85dvh] w-[95vw] max-w-[95vw] gap-0 border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:right-2 [&>button]:top-2 [&>button]:rounded-full [&>button]:bg-slate-900/75 [&>button]:p-2 [&>button]:text-white">
                <DialogTitle className="sr-only">Image to label</DialogTitle>
                <Image src={ex.image} alt="Image to label" fill unoptimized sizes="95vw" className="object-contain" />
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center text-slate-500 dark:text-slate-400">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
              <p>Image unavailable</p>
            </div>
          )}
        </section>

        <section className="practice-dark-panel min-h-0 min-w-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5 custom-scrollbar" aria-label="Image labels">
          <div className="mb-4 flex items-start gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
            <TranslateButton onClick={() => setShowQuestionTranslation(value => !value)} aria-label={showQuestionTranslation ? "Show original question" : "Translate question"} title={showQuestionTranslation ? "Show original question" : "Translate question"} aria-pressed={showQuestionTranslation} iconSize="md" className="h-10 w-10 shrink-0" />
            <h2 className="practice-type-question-heading min-w-0 text-slate-900 dark:text-slate-100">
              {showQuestionTranslation && questionTranslation ? questionTranslation : questionText}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {ex.items.map((item, idx) => {
              const answer = userAnswers[item.id];
              const hasSelection = Boolean(answer);
              const isWrong = showFeedback && hasSelection && answer !== item.name;
              const isRight = showFeedback && hasSelection && answer === item.name;
              const translatedCorrect = item.name === item.name_fr ? item.name_en : item.name_fr;
              const hasTranslation = Boolean(translatedCorrect && translatedCorrect !== item.name);
              const displayedCorrect = revealedTranslations[item.id] && hasTranslation ? translatedCorrect : item.name;

              return (
                <div key={item.id} className="flex min-w-0 items-start gap-2">
                  <div className={cn(
                    "flex w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold",
                    showFeedback ? "min-h-11 self-stretch" : "h-11",
                    isRight ? "practice-answer-badge-correct border-green-300 bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300"
                      : isWrong ? "practice-answer-badge-wrong border-red-300 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300"
                        : hasSelection ? "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
                  )}>
                    {idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    {showFeedback ? (
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex min-w-0 flex-1 flex-wrap items-stretch gap-2" role="status" aria-label={`Answer ${idx + 1}: ${isRight ? "correct" : isWrong ? "incorrect" : "unanswered"}`}>
                          {isWrong && (
                            <div className="practice-answer-wrong image-feedback-answer flex min-h-11 min-w-0 basis-32 grow shrink items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2 py-2 font-normal text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
                              <X className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                              <span className="min-w-0 break-words">{answer}</span>
                            </div>
                          )}
                          <div className="practice-answer-correct image-feedback-answer flex min-h-11 min-w-0 basis-32 grow shrink items-center gap-1 rounded-xl border border-green-200 bg-green-50 px-2 py-2 font-normal text-green-800 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300">
                            <Check className="h-4 w-4 shrink-0 text-green-700 dark:text-inherit" strokeWidth={2.5} aria-hidden="true" />
                            <span className="min-w-0 break-words">{displayedCorrect}</span>
                          </div>
                        </div>
                        <div className="h-8 w-8 shrink-0">
                          {hasTranslation && (
                            <TranslateButton iconVariant="option" onClick={() => setRevealedTranslations(previous => ({ ...previous, [item.id]: !previous[item.id] }))} aria-label={`${revealedTranslations[item.id] ? "Show original" : "Translate"} answer ${idx + 1}`} title={revealedTranslations[item.id] ? "Show original answer" : "Translate answer"} aria-pressed={Boolean(revealedTranslations[item.id])} />
                          )}
                        </div>
                      </div>
                    ) : (
                      <CustomSelect
                        options={item.options || []}
                        value={answer || ""}
                        onChange={(value: string) => handleAnswerChange(item.id, value)}
                        placeholder="---------------------------"
                        ariaLabel={`Select answer for number ${idx + 1}`}
                        className="practice-select-text min-w-0"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </PracticeTwoPanel>
    </PracticeGameLayout>
  );
}
