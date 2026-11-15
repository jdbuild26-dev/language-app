"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { Button } from "@/components/ui/button";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { ImageOff, Loader2 } from "lucide-react";
import { ReadingAnswerFeedback } from "@/features/practice/components/ReadingAnswerFeedback";
import { findImageLabelTranslation, getImageLabellingQuestionView, readImageLabellingExercise, type ImageLabellingExercise } from "@/features/practice/lib/imageLabellingData";
import { getReadingFeedbackTone } from "@/features/practice/lib/readingFeedback";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CustomSelect from "@/components/ui/CustomSelect";
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
  const { learningLang: requestedLearningLang, knownLang: requestedKnownLang } = useLanguage();
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
  const [feedbackTone, setFeedbackTone] = useState<"success" | "partial" | "error">("error");
  const [showQuestionTranslation, setShowQuestionTranslation] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPracticeData("image_labelling", {
          tag, learningLang: requestedLearningLang, knownLang: requestedKnownLang,
        });
        const mapped = (Array.isArray(data) ? data : [])
          .map((value: unknown) => readImageLabellingExercise(value, requestedLearningLang, requestedKnownLang))
          .filter(exercise => exercise.items.length > 0);
        setExercises(mapped);
        setCurrentIndex(0);
        setUserAnswers({});
        setShowFeedback(false);
        setIsCompleted(false);
        setTotalScore(0);
      } catch (e) {
        console.error("Error loading image labelling data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tag, requestedLearningLang, requestedKnownLang]);

  const ex = exercises[currentIndex];
  const { pick, learningLang, knownLang, showQuestionInKnown } = useQuestionLanguage(ex?.level);
  usePracticeComplete({ isGameOver: isCompleted, score: totalScore, totalQuestions: exercises.length, exerciseType: "image_labelling", level: ex?.level });

  const learningLocale = ex?.localized[learningLang];
  const knownLocale = ex?.localized[knownLang];
  const titleText = learningLocale?.title || knownLocale?.title || "Image Labelling";
  const learningHeading = learningLocale?.heading || "Label the image";
  const knownHeading = knownLocale?.heading || learningHeading;
  const instructionText = pick(learningHeading, knownHeading);
  const questionView = getImageLabellingQuestionView(
    Object.fromEntries(Object.entries(ex?.localized || {}).map(([code, locale]) => [code, locale.question])),
    learningLang, knownLang, showQuestionInKnown, showQuestionTranslation,
  );

  // ── Reset per exercise ─────────────────────────────────────────────────────
  const resetGame = () => {
    setUserAnswers({});
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackMessage("");
    setShowQuestionTranslation(false);
  };

  useEffect(() => {
    if (ex) {
      resetGame();
      resetTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, ex?.external_id, tag]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const { timerString, resetTimer } = useExerciseTimer({
    mode: "timer",
    duration: ex?.timeLimitSeconds || 120,
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        handleCheck(true);
      }
    },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  // ── Interaction handlers ───────────────────────────────────────────────────
  const handleAnswerChange = (itemId: number, value: string) => {
    if (showFeedback) return;
    setUserAnswers(prev => ({ ...prev, [itemId]: value }));
  };

  const handleCheck = (timeExpired = false) => {
    if (!ex?.items.length || showFeedback) return;
    
    let correct = 0;
    ex.items.forEach(item => {
      if (userAnswers[item.id] === item.name) {
        correct++;
      }
    });

    if (!timeExpired) setTotalScore(prev => prev + (correct === ex.items.length ? 1 : 0));
    
    const total = ex.items.length;
    setFeedbackTone(getReadingFeedbackTone(correct, total));
    if (correct === total) {
      setIsCorrect(true);
      setFeedbackMessage(`${timeExpired ? "Time's up! " : ""}Perfect! All ${total} correct!`);
    } else {
      setIsCorrect(false);
      setFeedbackMessage(`${timeExpired ? "Time's up! " : ""}${correct} out of ${total} correct. Try again!`);
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
      instructionFr={learningHeading}
      instructionEn={knownHeading}
      localizedInstruction={instructionText}
      progress={progress}
      onExit={handleExit}
      timerValue={timerString}
      showSubmitButton={true}
      isSubmitEnabled={showFeedback || filledCount === totalCount}
      onNext={showFeedback ? handleContinue : () => handleCheck()}
      submitLabel={
        showFeedback
          ? currentIndex < exercises.length - 1 ? "Continue" : "Finish"
          : "Check Answers"
      }
      preserveFooterHeightOnFeedback
      animateFeedbackEntrance={false}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackTone={showFeedback ? feedbackTone : "neutral"}
      feedbackAppearance="soft"
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
                <button type="button" className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500" aria-label="Enlarge image">
                  <Image src={ex.image} alt="Image to label" fill unoptimized sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
                </button>
              </DialogTrigger>
              <DialogContent data-main-practice-scroll className="h-[85dvh] w-[95vw] max-w-[95vw] gap-0 border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:right-2 [&>button]:top-2 [&>button]:rounded-full [&>button]:bg-slate-900/75 [&>button]:p-2 [&>button]:text-white">
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
            {questionView.canTranslate && (
              <TranslateButton onClick={() => setShowQuestionTranslation(value => !value)} aria-label={questionView.translated ? "Show original question" : "Translate question"} title={questionView.translated ? "Show original question" : "Translate question"} aria-pressed={questionView.translated} iconSize="md" className="h-10 w-10 shrink-0" />
            )}
            <h2 className="practice-type-question-heading min-w-0 text-slate-900 dark:text-slate-100">
              {questionView.question}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {ex.items.map((item, idx) => {
              const answer = userAnswers[item.id];
              const hasSelection = Boolean(answer);
              const isWrong = showFeedback && hasSelection && answer !== item.name;
              const isRight = showFeedback && hasSelection && answer === item.name;
              const translatedCorrect = item.names[knownLang];

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
                      <ReadingAnswerFeedback
                        key={`${tag}:${currentIndex}:${item.id}:${learningLang}`}
                        answerNumber={idx + 1}
                        answerClassName="image-feedback-answer"
                        isCorrect={isRight}
                        wrong={isWrong ? answer : undefined}
                        correct={item.name}
                        wrongTranslation={findImageLabelTranslation(answer, ex.items, learningLang, knownLang, item)}
                        correctTranslation={translatedCorrect}
                        sourceLang={learningLang}
                        targetLang={knownLang}
                        storedOnly
                      />
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
