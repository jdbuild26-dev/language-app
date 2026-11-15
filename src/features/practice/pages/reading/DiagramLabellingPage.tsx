"use client";

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import CustomSelect from "@/components/ui/CustomSelect";
import { Loader2, ImageOff } from "lucide-react";
import { ReadingAnswerFeedback } from "@/features/practice/components/ReadingAnswerFeedback";
import { buildPracticeDropdownOptions } from "@/features/practice/lib/practiceDropdownOptions";
import { diagramAnswer, diagramAnswerTranslation, readDiagramLocales, type DiagramLocale } from "@/features/practice/lib/diagramLocalization";
import { getReadingFeedbackTone } from "@/features/practice/lib/readingFeedback";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
// ── Types ────────────────────────────────────────────────────────────────────

type DiagramQuestion = {
  id: number | string;
  correct_fr?: string;
  correct_en?: string;
  correct_by_lang?: Record<string, string>;
  explanation_fr?: string;
  explanation_en?: string;
  // legacy single-lang
  correct?: string;
};

type DiagramExercise = {
  external_id?: string;
  level?: string;
  localized?: Record<string, DiagramLocale>;
  // legacy single-lang
  title?: string;
  paragraphs?: string[];
  // options pool
  // legacy flat options
  options?: string[];
  // questions
  questions?: DiagramQuestion[];
  // image
  imageUrl?: string;
  imagePath?: string;
  // config
  timeLimitSeconds?: number;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v) {
    try { return JSON.parse(v); } catch { return v.split("|").map(s => s.trim()).filter(Boolean); }
  }
  return [];
}

function parseQuestions(v: unknown): DiagramQuestion[] {
  if (Array.isArray(v)) return v as DiagramQuestion[];
  if (typeof v === "string" && v) {
    try { return JSON.parse(v) as DiagramQuestion[]; } catch { return []; }
  }
  return [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DiagramLabellingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    }>
      <DiagramLabellingContent />
    </Suspense>
  );
}

function DiagramLabellingContent() {
  const handleExit = usePracticeExit();
  const { learningLang: requestedLearningLang, knownLang: requestedKnownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const previewImage = searchParams?.get("previewImage") === "1";
  const passageRef = useRef<HTMLElement>(null);
  const diagramRef = useRef<HTMLElement>(null);

  const [exercises, setExercises] = useState<DiagramExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Per-question shuffled option lists, fixed on load
  const [dropdownOptions, setDropdownOptions] = useState<Record<string | number, string[]>>({});
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "partial" | "error">("error");
  const [showPassageTranslation, setShowPassageTranslation] = useState(false);

  // Translate question state
  const [translatedQuestion, setTranslatedQuestion] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMockCSV("practice/reading/diagram_labelling.csv", {
          tag, learningLang: requestedLearningLang, knownLang: requestedKnownLang,
        });
        const mapped = (Array.isArray(data) ? data : []).map((value: unknown) => {
          const item = asRecord(value);
          const c = item.content ? asRecord(item.content) : item;
          const cfg = item.config ? asRecord(item.config) : item;
          return {
            external_id:    item.external_id || item.ExerciseID,
            level:          item.Level || item.level || '',
            localized:      readDiagramLocales(item, c),
            title:          c.title || item.title || '',
            paragraphs:     parseArr(c.paragraphs || item.paragraphs),
            options:        parseArr(c.options || item.options),
            questions:      parseQuestions(c.questions || item.questions || item.questions_json),
            imageUrl:       c.imageUrl || item.imageUrl || item.imagePath || '',
            timeLimitSeconds: Number(cfg.timeLimitSeconds || item.timeLimitSeconds || 120),
          } as DiagramExercise;
        });
        // Do not show a different language when the selected learning language is absent.
        const selectedLanguage = requestedLearningLang.toLowerCase();
        const filtered = mapped.filter(e => {
          const locale = e.localized?.[selectedLanguage];
          return locale && (locale.passage || locale.answers.length > 0);
        });
        setExercises(filtered);
      } catch (e) {
        console.error("Error loading diagram labelling data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tag, requestedLearningLang, requestedKnownLang]);

  const ex = exercises[currentIndex];
  const totalLabels = exercises.reduce((count, exercise) => count + (exercise.questions?.length || 0), 0);

  const { pick, pickTranslation, showQuestionInKnown, learningLang, knownLang } = useQuestionLanguage(ex?.level);
  usePracticeComplete({ isGameOver: isCompleted, score: totalScore, totalQuestions: totalLabels, exerciseType: "diagram_mapping", level: ex?.level });

  // ── Derive display values ──────────────────────────────────────────────────
  const learningLocale = ex?.localized?.[learningLang];
  const knownLocale = ex?.localized?.[knownLang];
  const passageTitle = learningLocale?.title || knownLocale?.title || ex?.title || "";
  const headingText = pick(learningLocale?.heading, knownLocale?.heading) || "Label the diagram";
  const passageText = learningLocale?.passage || knownLocale?.passage || (ex?.paragraphs || []).join("\n\n");
  const translatedPassageText = knownLocale?.passage || "";
  const translatedPassageTitle = knownLocale?.title || "Passage";
  const questionText = pick(learningLocale?.question, knownLocale?.question) || "Match each number with the correct answer.";
  const translatedQuestionFromData = pickTranslation(learningLocale?.question, knownLocale?.question);
  const imageUrl     = previewImage && currentIndex === 0 ? "/images/diagram-layout-preview.png" : ex?.imageUrl || "";

  // Questions array — normalise legacy {id, correct} format
  const questions: DiagramQuestion[] = useMemo(() => {
    if (!ex) return [];
    const qs = ex.questions || [];
    return qs;
  }, [ex]);

  // Some imported records have questions but an empty answers array.
  const optionPool = [
    ...questions.map(q => diagramAnswer(q, learningLang)),
    ...(learningLocale?.answers || []),
    ...(learningLocale?.distractors || []),
  ];
  const legacyOptions = ex?.options || [];

  const OPTIONS_PER_DROPDOWN = 5;

  // ── Build shuffled dropdown options once per exercise ─────────────────────
  useLayoutEffect(() => {
    if (!ex || questions.length === 0) return;
    const opts: Record<string | number, string[]> = {};
    questions.forEach(q => {
      const correctWord = diagramAnswer(q, learningLang);
      opts[q.id] = buildPracticeDropdownOptions(correctWord, [...optionPool, ...legacyOptions], OPTIONS_PER_DROPDOWN);
    });
    setDropdownOptions(opts);
    setAnswers({});
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackMessage("");
    setShowPassageTranslation(false);
    setTranslatedQuestion("");
    setShowTranslation(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, ex, tag, learningLang]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const { timerString, resetTimer } = useExerciseTimer({
    duration: ex?.timeLimitSeconds || 120,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        handleCheck(true);
      }
    },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useLayoutEffect(() => { resetTimer(); }, [currentIndex, resetTimer]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelect = (id: string | number, value: string) => {
    if (showFeedback) return;
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleCheck = (timeExpired = false) => {
    if (showFeedback) return;
    let correctCount = 0;
    questions.forEach(q => {
      const correctWord = diagramAnswer(q, learningLang);
      if (answers[q.id] === correctWord) correctCount++;
    });

    const total = questions.length;
    const isPerfect = total > 0 && correctCount === total;
    if (!timeExpired) setTotalScore(prev => prev + correctCount);
    setIsCorrect(isPerfect);
    setFeedbackTone(getReadingFeedbackTone(correctCount, total));
    setFeedbackMessage(`${timeExpired ? "Time's up! " : ""}${correctCount} out of ${total} correct.`);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!showFeedback) { handleCheck(); return; }

    if (currentIndex < exercises.length - 1) {
      passageRef.current?.closest("main")?.scrollTo({ top: 0, behavior: "instant" });
      passageRef.current?.scrollTo({ top: 0, behavior: "instant" });
      diagramRef.current?.scrollTo({ top: 0, behavior: "instant" });
      setAnswers({});
      setShowFeedback(false);
      setIsCorrect(false);
      setFeedbackMessage("");
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowFeedback(false);
    setIsCompleted(false);
    setTotalScore(0);
    setIsCorrect(false);
    setFeedbackMessage("");
    setShowPassageTranslation(false);
  };

  const handleTranslateQuestion = async () => {
    const sourceText = questionText;
    const targetLang = showQuestionInKnown ? learningLang : knownLang;

    if (showTranslation) {
      setShowTranslation(false);
      return;
    }
    if (translatedQuestion) {
      setShowTranslation(true);
      return;
    }
    if (translatedQuestionFromData?.trim()) {
      setTranslatedQuestion(translatedQuestionFromData);
      setShowTranslation(true);
      return;
    }
    if (!sourceText) return;

    try {
      setIsTranslating(true);
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, source_lang: showQuestionInKnown ? knownLang : learningLang, target_lang: targetLang }),
      });
      if (!res.ok) throw new Error("Translation failed");
      const data = (await res.json()) as { translation?: string };
      setTranslatedQuestion(data.translation || "");
      setShowTranslation(true);
    } catch {
      setTranslatedQuestion("");
      setShowTranslation(false);
    } finally {
      setIsTranslating(false);
    }
  };

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id]);
  const progress = exercises.length > 0
    ? ((currentIndex + (showFeedback ? 1 : 0)) / exercises.length) * 100
    : 0;

  // ── Loading / empty states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (exercises.length === 0 || !ex) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PracticeGameLayout
      questionType="Diagram Labelling"
      questionTypeFr="Étiquetage du diagramme"
      questionTypeEn="Diagram Labelling"
      instructionFr={learningLocale?.heading || headingText}
      instructionEn={knownLocale?.heading || headingText}
      localizedInstruction={headingText}
      progress={progress}
      isGameOver={isCompleted}
      score={totalScore}
      totalQuestions={totalLabels}
      headerTotalQuestions={exercises.length}
      onExit={handleExit}
      onNext={handleNext}
      onRestart={handleRestart}
      currentQuestionIndex={currentIndex}
      questionCounterValue={currentIndex + 1}
      feedbackTone={showFeedback ? feedbackTone : "neutral"}
      feedbackAppearance="soft"
      isSubmitEnabled={showFeedback || allAnswered}
      showSubmitButton={true}
      disableContentScrollOnDesktop
      preserveFooterHeightOnFeedback
      animateFeedbackEntrance={false}
      submitLabel={
        showFeedback
          ? currentIndex + 1 === exercises.length ? "Finish" : "Continue"
          : "Check Answers"
      }
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackMessage={feedbackMessage}
    >
      <PracticeTwoPanel ratio="seven-three" className="md:gap-4 md:p-4">
        {/* Passage and answers scroll independently on desktop. */}
        <section ref={passageRef} className="practice-dark-panel min-h-[18rem] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:min-h-0 md:overflow-y-auto md:p-6 custom-scrollbar" aria-label="Passage">
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
            <h2 className="practice-type-content-heading !font-medium text-slate-900 dark:text-slate-100">
              {passageTitle}
            </h2>
            {showFeedback && translatedPassageText && translatedPassageText !== passageText && (
              <TranslateButton onClick={() => setShowPassageTranslation(value => !value)} aria-label={showPassageTranslation ? "Hide passage translation" : "Translate passage"} title={showPassageTranslation ? "Hide passage translation" : "Translate passage"} aria-expanded={showPassageTranslation} />
            )}
          </div>
          <p className="practice-passage-content practice-type-content whitespace-pre-line font-sans text-slate-700 dark:text-slate-200">
            {passageText}
          </p>
          {showFeedback && showPassageTranslation && translatedPassageText && (
            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700">
              {translatedPassageTitle && (
                <h2 className="practice-type-content-heading mb-3 !font-medium text-slate-900 dark:text-slate-100">
                  {translatedPassageTitle}
                </h2>
              )}
              <p className="practice-passage-content practice-type-content whitespace-pre-line font-sans text-slate-700 dark:text-slate-200">
                {translatedPassageText}
              </p>
            </div>
          )}
        </section>

        <section ref={diagramRef} className="practice-dark-panel min-h-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:overflow-y-auto md:p-5 custom-scrollbar" aria-label="Diagram and questions">
          {imageUrl ? (
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="relative mx-auto mb-5 block aspect-square w-full max-w-[27rem] overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" aria-label="Enlarge diagram">
                  <Image src={imageUrl} alt={passageTitle || "Diagram"} fill sizes="(min-width: 768px) 432px, 100vw" unoptimized={/^https?:\/\//.test(imageUrl)} className="object-cover" />
                </button>
              </DialogTrigger>
              <DialogContent data-main-practice-scroll className="w-fit max-h-[95dvh] max-w-[95vw] gap-0 border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:right-2 [&>button]:top-2 [&>button]:rounded-full [&>button]:bg-slate-900/75 [&>button]:p-2 [&>button]:text-white">
                <DialogTitle className="sr-only">{passageTitle || "Diagram"}</DialogTitle>
                <img src={imageUrl} alt={passageTitle || "Diagram"} className="block max-h-[85dvh] max-w-[95vw] object-contain" />
              </DialogContent>
            </Dialog>
          ) : (
            <div className="mx-auto mb-5 flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800">
              <ImageOff className="h-8 w-8 text-slate-500 dark:text-slate-400" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No diagram image</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Use the passage text to answer</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="practice-type-content-heading !font-medium flex items-start gap-2 text-slate-900 dark:text-slate-100">
              <TranslateButton
                onClick={handleTranslateQuestion}
                isLoading={isTranslating}
                aria-label={showTranslation ? "Show original question" : "Translate question"}
                title={showTranslation ? "Show original question" : "Translate question"}
                aria-pressed={showTranslation}
                iconSize="md"
              />
              {showTranslation && translatedQuestion ? translatedQuestion : questionText}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {questions.map(q => {
              const correctWord = diagramAnswer(q, learningLang);
              const hasSelection = Boolean(answers[q.id]);
              const isWrong = showFeedback && hasSelection && answers[q.id] !== correctWord;
              const isRight = showFeedback && hasSelection && answers[q.id] === correctWord;
              const opts = dropdownOptions[q.id] || [];

              return (
                <div key={q.id} className="diagram-answer-row flex min-w-0 items-start gap-2">
                  {/* Number badge */}
                  <div className={cn(
                    "flex w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors",
                    showFeedback ? "min-h-11 self-stretch" : "h-11",
                    isRight  ? "practice-answer-badge-correct bg-green-100 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-300 dark:border-green-700"
                    : isWrong ? "practice-answer-badge-wrong bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-700"
                    : hasSelection ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700",
                  )}>
                    {q.id}
                  </div>

                  <div className="min-w-0 flex-1">
                    {showFeedback ? (
                      <ReadingAnswerFeedback
                        key={`${tag}:${currentIndex}:${q.id}:${learningLang}`}
                        answerNumber={q.id}
                        answerClassName="diagram-feedback-answer"
                        isCorrect={isRight}
                        wrong={isWrong ? answers[q.id] : undefined}
                        correct={correctWord}
                        wrongTranslation={diagramAnswerTranslation(answers[q.id], questions, learningLang, knownLang, ex.localized)}
                        correctTranslation={diagramAnswerTranslation(correctWord, questions, learningLang, knownLang)}
                        sourceLang={learningLang}
                        targetLang={knownLang}
                      />
                    ) : (
                      <CustomSelect
                        options={opts}
                        value={answers[q.id] || ""}
                        onChange={(val: string) => handleSelect(q.id, val)}
                        placeholder="---------------------------"
                        ariaLabel={`Select answer for number ${q.id}`}
                        className="practice-select-text diagram-answer-select min-w-0 [&>button]:font-normal"
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
