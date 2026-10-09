"use client";

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import CustomSelect from "@/components/ui/CustomSelect";
import { Check, Loader2, ImageOff, X } from "lucide-react";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
// ── Types ────────────────────────────────────────────────────────────────────

type DiagramQuestion = {
  id: number | string;
  correct_fr: string;
  correct_en: string;
  explanation_fr?: string;
  explanation_en?: string;
  // legacy single-lang
  correct?: string;
};

type DiagramExercise = {
  external_id?: string;
  level?: string;
  // bilingual
  title_fr?: string;
  title_en?: string;
  passage_fr?: string;
  passage_en?: string;
  question_fr?: string;
  question_en?: string;
  // legacy single-lang
  title?: string;
  paragraphs?: string[];
  // options pool
  answers_fr?: string[];
  answers_en?: string[];
  distractors_fr?: string[];
  distractors_en?: string[];
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

/** Build per-question option list: 1 correct + (optionsPerDropdown-1) random wrong ones */
function buildDropdownOptions(
  correctWord: string,
  allWrong: string[],
  optionsPerDropdown: number,
): string[] {
  const wrong = allWrong.filter(w => w && w !== correctWord);
  // shuffle wrong pool
  const shuffled = [...wrong].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, optionsPerDropdown - 1);
  const pool = [correctWord, ...picked].sort(() => Math.random() - 0.5);
  return pool;
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
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string | number, boolean>>({});
  const [showPassageTranslation, setShowPassageTranslation] = useState(false);

  // Translate question state
  const [translatedQuestion, setTranslatedQuestion] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMockCSV("practice/reading/diagram_labelling.csv", { tag });
        const mapped = (Array.isArray(data) ? data : []).map((value: unknown) => {
          const item = asRecord(value);
          const c = item.content ? asRecord(item.content) : item;
          const cfg = item.config ? asRecord(item.config) : item;
          return {
            external_id:    item.external_id || item.ExerciseID,
            level:          item.Level || item.level || '',
            title_fr:       c.title_fr || item.title_fr || '',
            title_en:       c.title_en || item.title_en || item.title || '',
            passage_fr:     c.passage_fr || item.passage_fr || '',
            passage_en:     c.passage_en || item.passage_en || '',
            paragraphs:     parseArr(c.paragraphs || item.paragraphs),
            question_fr:    c.question_fr || item.question_fr || '',
            question_en:    c.question_en || item.question_en || '',
            answers_fr:     parseArr(c.answers_fr || item.answers_fr),
            answers_en:     parseArr(c.answers_en || item.answers_en),
            distractors_fr: parseArr(c.distractors_fr || item.distractors_fr),
            distractors_en: parseArr(c.distractors_en || item.distractors_en),
            options:        parseArr(c.options || item.options),
            questions:      parseQuestions(c.questions || item.questions || item.questions_json),
            imageUrl:       c.imageUrl || item.imageUrl || item.imagePath || '',
            timeLimitSeconds: Number(cfg.timeLimitSeconds || item.timeLimitSeconds || 120),
          } as DiagramExercise;
        });
        // Only keep exercises that have the new bilingual structure (passage_en or answers_fr)
        const filtered = mapped.filter(e =>
          (e.passage_en && e.passage_en.length > 0) ||
          (e.answers_fr && e.answers_fr.length > 0)
        );
        setExercises(filtered.length > 0 ? filtered : mapped);
      } catch (e) {
        console.error("Error loading diagram labelling data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tag]);

  const ex = exercises[currentIndex];
  const totalLabels = exercises.reduce((count, exercise) => count + (exercise.questions?.length || 0), 0);

  const { pick, pickTranslation, showQuestionInKnown, learningLang, knownLang } = useQuestionLanguage(ex?.level);
  usePracticeComplete({ isGameOver: isCompleted, score: totalScore, totalQuestions: totalLabels, exerciseType: "diagram_mapping", level: ex?.level });

  // ── Derive display values ──────────────────────────────────────────────────
  const passageTitle = pick(ex?.title_fr, ex?.title_en) || ex?.title || "";
  const passageText  = learningLang === "fr"
    ? ex?.passage_fr || ex?.passage_en || (ex?.paragraphs || []).join("\n\n")
    : ex?.passage_en || ex?.passage_fr || (ex?.paragraphs || []).join("\n\n");
  const translatedPassageText = learningLang === "fr" ? ex?.passage_en || "" : ex?.passage_fr || "";
  const questionText = pick(ex?.question_fr, ex?.question_en) || "Match each number with the correct answer.";
  const translatedQuestionFromData = pickTranslation(ex?.question_fr, ex?.question_en);
  const imageUrl     = previewImage && currentIndex === 0 ? "/images/diagram-layout-preview.png" : ex?.imageUrl || "";

  // Questions array — normalise legacy {id, correct} format
  const questions: DiagramQuestion[] = useMemo(() => {
    if (!ex) return [];
    const qs = ex.questions || [];
    return qs.map(q => ({
      ...q,
      correct_fr: q.correct_fr || q.correct || "",
      correct_en: q.correct_en || q.correct || "",
    }));
  }, [ex]);

  // Build the "wrong" pool for dropdowns (all answers except the correct one + distractors)
  // Use the current learning language for options.
  const allAnswersFr = ex?.answers_fr || questions.map(q => q.correct_fr);
  const distractorsFr = ex?.distractors_fr || [];
  const wrongPoolFr = [...allAnswersFr, ...distractorsFr];

  const allAnswersEn = ex?.answers_en || questions.map(q => q.correct_en);
  const distractorsEn = ex?.distractors_en || [];
  const wrongPoolEn = [...allAnswersEn, ...distractorsEn];

  // Legacy flat options fallback
  const legacyOptions = ex?.options || [];

  const OPTIONS_PER_DROPDOWN = 5;

  // ── Build shuffled dropdown options once per exercise ─────────────────────
  useLayoutEffect(() => {
    if (!ex || questions.length === 0) return;
    const opts: Record<string | number, string[]> = {};
    questions.forEach(q => {
      if (legacyOptions.length > 0) {
        // Legacy: use flat options list sorted
        opts[q.id] = [...legacyOptions].sort();
      } else {
        // New: build per-question shuffled pool in learning language
        const correctWord = learningLang === "fr" ? q.correct_fr : q.correct_en;
        const wrongPool   = learningLang === "fr" ? wrongPoolFr : wrongPoolEn;
        opts[q.id] = buildDropdownOptions(correctWord, wrongPool, OPTIONS_PER_DROPDOWN);
      }
    });
    setDropdownOptions(opts);
    setAnswers({});
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackMessage("");
    setRevealedTranslations({});
    setShowPassageTranslation(false);
    setTranslatedQuestion("");
    setShowTranslation(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, ex]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const { timerString, resetTimer } = useExerciseTimer({
    duration: ex?.timeLimitSeconds || 120,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
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

  const handleCheck = () => {
    let correctCount = 0;
    questions.forEach(q => {
      const correctWord = learningLang === "fr" ? q.correct_fr : q.correct_en;
      if (answers[q.id] === correctWord) correctCount++;
    });

    const total = questions.length;
    const isPerfect = correctCount === total;
    setTotalScore(prev => prev + correctCount);
    setIsCorrect(isPerfect);
    setFeedbackMessage(`${correctCount} out of ${total} correct.`);
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
    setRevealedTranslations({});
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
    if (translatedQuestionFromData && translatedQuestionFromData !== sourceText) {
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
        body: JSON.stringify({ text: sourceText, target_lang: targetLang }),
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
      instructionFr={showQuestionInKnown ? "Label the diagram" : "Étiquetez le diagramme"}
      instructionEn="Label the diagram"
      localizedInstruction={showQuestionInKnown ? "Label the diagram" : "Étiquetez le diagramme"}
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
      feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
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
            <h2 className="practice-type-content-heading text-slate-900 dark:text-slate-100">
              {passageTitle}
            </h2>
            {showFeedback && translatedPassageText && translatedPassageText !== passageText && (
              <TranslateButton onClick={() => setShowPassageTranslation(value => !value)} aria-label={showPassageTranslation ? "Hide passage translation" : "Translate passage"} title={showPassageTranslation ? "Hide passage translation" : "Translate passage"} aria-expanded={showPassageTranslation} />
            )}
          </div>
          <p className="practice-type-content whitespace-pre-line font-sans text-slate-700 dark:text-slate-200">
            {passageText}
          </p>
          {showFeedback && showPassageTranslation && translatedPassageText && (
            <p className="practice-type-content mt-6 whitespace-pre-line border-t border-slate-200 pt-5 font-sans text-slate-700 dark:border-slate-700 dark:text-slate-200">
              {translatedPassageText}
            </p>
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
              <DialogContent className="w-fit max-h-[95dvh] max-w-[95vw] gap-0 border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:right-2 [&>button]:top-2 [&>button]:rounded-full [&>button]:bg-slate-900/75 [&>button]:p-2 [&>button]:text-white">
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
            <h3 className="practice-type-content-heading flex items-start gap-2 text-slate-900 dark:text-slate-100">
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
              const correctWord = learningLang === "fr" ? q.correct_fr : q.correct_en;
              const correctWordOther = learningLang === "fr" ? q.correct_en : q.correct_fr;
              const hasSelection = Boolean(answers[q.id]);
              const isWrong = showFeedback && hasSelection && answers[q.id] !== correctWord;
              const isRight = showFeedback && hasSelection && answers[q.id] === correctWord;
              const opts = dropdownOptions[q.id] || [];
              const hasTranslation = Boolean(correctWordOther && correctWordOther !== correctWord);
              const displayedCorrectWord = revealedTranslations[q.id] && hasTranslation ? correctWordOther : correctWord;

              return (
                <div key={q.id} className="flex min-w-0 items-start gap-2">
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
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex w-full min-w-0 flex-1 flex-wrap items-stretch gap-2" role="status" aria-label={`Answer ${q.id}: ${isRight ? "correct" : isWrong ? "incorrect" : "unanswered"}`}>
                          {isWrong && (
                            <div className="practice-answer-wrong diagram-feedback-answer flex min-h-11 min-w-max basis-0 grow items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2 py-2 font-normal text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
                              <X className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                              <span className="whitespace-nowrap">{answers[q.id]}</span>
                            </div>
                          )}
                          <div className="practice-answer-correct diagram-feedback-answer flex min-h-11 min-w-max basis-0 grow items-center gap-1 rounded-xl border border-green-200 bg-green-50 px-2 py-2 font-normal text-green-800 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300">
                            <Check className="h-4 w-4 shrink-0 text-green-700 dark:text-inherit" strokeWidth={2.5} aria-hidden="true" />
                            <span className="whitespace-nowrap">{displayedCorrectWord}</span>
                          </div>
                        </div>
                        <div className="h-8 w-8 shrink-0">
                          {hasTranslation && (
                            <TranslateButton onClick={() => setRevealedTranslations(prev => ({ ...prev, [q.id]: !prev[q.id] }))} aria-label={`${revealedTranslations[q.id] ? "Show original" : "Translate"} answer ${q.id}`} title={revealedTranslations[q.id] ? "Show original answer" : "Translate answer"} aria-pressed={Boolean(revealedTranslations[q.id])} />
                          )}
                        </div>
                      </div>
                    ) : (
                      <CustomSelect
                        options={opts}
                        value={answers[q.id] || ""}
                        onChange={(val: string) => handleSelect(q.id, val)}
                        placeholder="---------------------------"
                        ariaLabel={`Select answer for number ${q.id}`}
                        className="practice-select-text min-w-0 [&>button]:font-normal"
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
