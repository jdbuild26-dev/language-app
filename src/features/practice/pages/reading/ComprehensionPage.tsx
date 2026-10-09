"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { Loader2 } from "lucide-react";
import { TranslateButton } from "@/components/ui/TranslateButton";
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
  options_fr?: string[];
  options_en?: string[];
  options?: string[];
  correctIndex: number;
  localizedInstruction?: string;
  instructionFr?: string;
  instructionEn?: string;
  timeLimitSeconds?: number;
};

/** A passage with all its questions grouped together */
type PassageGroup = {
  passage_fr: string;
  passage_en: string;
  passage_title_fr: string;
  passage_title_en: string;
  level: string;
  instructionFr: string;
  instructionEn: string;
  timeLimitSeconds: number;
  questions: ComprehensionQuestion[];
};

function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v) {
    try { return JSON.parse(v); } catch { return v.split("|").map(s => s.trim()).filter(Boolean); }
  }
  return [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

/** Group a flat list of questions into passage groups by matching passage text */
function groupByPassage(questions: ComprehensionQuestion[]): PassageGroup[] {
  const groups: PassageGroup[] = [];
  const seen = new Map<string, number>(); // passage key → group index

  for (const q of questions) {
    // Use passage_fr as primary key, fall back to passage_en, then passage
    const key = (q.passage_fr || q.passage_en || q.passage || "").trim();
    if (!key) continue;

    if (seen.has(key)) {
      groups[seen.get(key)!].questions.push(q);
    } else {
      seen.set(key, groups.length);
      groups.push({
        passage_fr:       q.passage_fr || q.passage_en || q.passage || "",
        passage_en:       q.passage_en || q.passage_fr || q.passage || "",
        passage_title_fr: q.passage_title_fr || q.passage_title_en || "",
        passage_title_en: q.passage_title_en || q.passage_title_fr || "",
        level:            q.level || "",
        instructionFr:    q.instructionFr || "",
        instructionEn:    q.instructionEn || "",
        timeLimitSeconds: q.timeLimitSeconds || 60,
        questions:        [q],
      });
    }
  }

  return groups;
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

  const [passages, setPassages] = useState<PassageGroup[]>([]);
  const [allQuestions, setAllQuestions] = useState<ComprehensionQuestion[]>([]);
  const [passageIndex, setPassageIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Per-question state for the current passage
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Feedback banner (shown after submit, one per passage)
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [translatedQuestions, setTranslatedQuestions] = useState<Record<number, boolean>>({});
  const [showPassageTranslation, setShowPassageTranslation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await loadMockCSV("practice/reading/comprehension.csv", {
          learningLang, knownLang, tag,
        });
        const mapped = (Array.isArray(data) ? data : []).map((raw: unknown) => {
          const item = asRecord(raw);
          const c = item.content ? asRecord(item.content) : item;
          const e = item.evaluation ? asRecord(item.evaluation) : item;
          const cfg = item.config ? asRecord(item.config) : item;
          return {
            level:            item.Level || item.level || "",
            passage_fr:       c.passage_fr || item.passage_fr || item.passage || "",
            passage_en:       c.passage_en || item.passage_en || item.passage || "",
            passage_title_fr: c.passage_title_fr || item.passage_title_fr || "",
            passage_title_en: c.passage_title_en || item.passage_title_en || "",
            question_fr:      c.question_fr || item.question_fr || "",
            question_en:      c.question_en || item.question_en || item.question || "",
            question:         c.question_en || item.question_en || item.question || "",
            options_fr:       parseArr(c.options_fr || item.options_fr),
            options_en:       parseArr(c.options_en || item.options_en),
            options:          parseArr(c.options || item.options),
            correctIndex:     Number(e.correctIndex ?? item.correctIndex ?? item.eval_correctIndex ?? 0),
            timeLimitSeconds: Number(cfg.timeLimitSeconds || item.timeLimitSeconds || 60),
            instructionFr:    item.instructionFr || item.instruction_fr || "",
            instructionEn:    item.instructionEn || item.instruction_en || "",
          } as ComprehensionQuestion;
        });
        const grouped = groupByPassage(mapped);
        setAllQuestions(mapped);
        setPassages(grouped);
      } catch (error) {
        console.error("Error loading comprehension data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [learningLang, knownLang, tag]);

  const currentPassage = passages[passageIndex];

  // Reset per-question state when passage changes
  useEffect(() => {
    if (currentPassage) {
      setSelectedOptions(new Array(currentPassage.questions.length).fill(null));
      setSubmitted(false);
      setShowFeedback(false);
      setTranslatedQuestions({});
      setShowPassageTranslation(false);
    }
  }, [passageIndex, currentPassage]);

  const { pick, pickTranslation, showQuestionInKnown } = useQuestionLanguage(currentPassage?.level);

  // Progress: based on passages
  const progress = passages.length > 0 ? ((passageIndex + 1) / passages.length) * 100 : 0;

  // Score tracking uses total individual questions; counter/display uses passage count
  const totalPassages = passages.length;

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: allQuestions.length,
    exerciseType: "passage_mcq",
    level: currentPassage?.level,
  });

  const timerDuration = currentPassage?.timeLimitSeconds || 60;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !submitted) {
        handleSubmit(true);
      }
    },
    isPaused: isCompleted || submitted,
  });

  useEffect(() => {
    if (currentPassage && !isCompleted) {
      resetTimer();
    }
  }, [passageIndex, currentPassage, isCompleted, resetTimer]);

  const handleOptionSelect = (questionIdx: number, optionIdx: number) => {
    if (submitted) return;
    setSelectedOptions(prev => {
      const next = [...prev];
      next[questionIdx] = optionIdx;
      return next;
    });
  };

  const handleSubmit = useCallback((allowIncomplete = false) => {
    if (submitted || !currentPassage) return;
    if (!allowIncomplete && selectedOptions.some(o => o === null)) return;

    setSubmitted(true);
    setTranslatedQuestions({});

    // Score this passage
    let passageCorrect = 0;
    for (let i = 0; i < currentPassage.questions.length; i++) {
      if (selectedOptions[i] === currentPassage.questions[i].correctIndex) {
        passageCorrect++;
      }
    }
    setScore(prev => prev + passageCorrect);

    const allCorrect = passageCorrect === currentPassage.questions.length;
    setIsCorrect(allCorrect);
    setFeedbackMessage(
      allCorrect
        ? getFeedbackMessage(true)
        : `${passageCorrect} / ${currentPassage.questions.length} correct`
    );
    setShowFeedback(true);
  }, [submitted, currentPassage, selectedOptions]);

  const handleContinue = () => {
    setShowFeedback(false);
    if (passageIndex < passages.length - 1) {
      setPassageIndex(prev => prev + 1);
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

  if (passages.length === 0) {
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
    className?: string;
    itemClassName?: string;
    renderLabel?: (option: string, index: number) => React.ReactNode;
  }>;

  // Passage text always in learning language
  const passageText = learningLang === "fr"
    ? currentPassage?.passage_fr || currentPassage?.passage_en || ""
    : currentPassage?.passage_en || currentPassage?.passage_fr || "";
  const passageTitle = learningLang === "fr"
    ? currentPassage?.passage_title_fr || currentPassage?.passage_title_en || ""
    : currentPassage?.passage_title_en || currentPassage?.passage_title_fr || "";
  const translatedPassageText = learningLang === "fr"
    ? currentPassage?.passage_en || ""
    : currentPassage?.passage_fr || "";

  const allAnswered = selectedOptions.length > 0 && selectedOptions.every(o => o !== null);

  const isLastPassage = passageIndex === passages.length - 1;

  return (
    <>
      <PracticeGameLayout
        questionType="Reading Comprehension"
        questionTypeFr="Compréhension de lecture"
        questionTypeEn="Reading Comprehension"
        localizedInstruction={
          showQuestionInKnown
            ? "Read the passage and answer all questions"
            : "Lisez le passage et répondez à toutes les questions"
        }
        instructionFr={currentPassage?.instructionFr || "Lisez le passage et répondez à toutes les questions"}
        instructionEn={currentPassage?.instructionEn || "Read the passage and answer all questions"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={totalPassages}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        currentQuestionIndex={passageIndex}
        questionCounterValue={passageIndex + 1}
        isSubmitEnabled={allAnswered || showFeedback}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? isLastPassage ? "FINISH" : "CONTINUE"
            : "Submit Answers"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        preserveFooterHeightOnFeedback
        animateFeedbackEntrance={false}
        feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
      >
        <PracticeTwoPanel ratio="three-two" className="md:gap-4 md:p-4">
          {/* Left Column — Passage */}
          <section className="practice-comprehension-scroll min-h-[18rem] min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:min-h-0 md:overflow-y-auto md:p-6" aria-label="Passage">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
              <h2 className="practice-type-content-heading text-slate-900 dark:text-slate-100">
                {passageTitle || "Passage"}
              </h2>
              {submitted && translatedPassageText && translatedPassageText !== passageText && (
                <TranslateButton onClick={() => setShowPassageTranslation(value => !value)} aria-label={showPassageTranslation ? "Hide passage translation" : "Translate passage"} title={showPassageTranslation ? "Hide passage translation" : "Translate passage"} aria-expanded={showPassageTranslation} />
              )}
            </div>
            <p className="practice-type-content whitespace-pre-line font-sans text-slate-700 dark:text-slate-200">
                {passageText}
            </p>
            {submitted && showPassageTranslation && translatedPassageText && (
              <p className="practice-type-content mt-6 whitespace-pre-line border-t border-slate-200 pt-5 font-sans text-slate-700 dark:border-slate-700 dark:text-slate-200">
                {translatedPassageText}
              </p>
            )}
          </section>

          {/* Right Column — All questions for this passage */}
          <section className="practice-comprehension-scroll flex min-h-0 min-w-0 flex-col gap-6 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5" aria-label="Questions">
            {currentPassage?.questions.map((q, qIdx) => {
              const questionText = pick(q.question_fr, q.question_en) || q.question || "";
              const translatedQuestionText = pickTranslation(q.question_fr, q.question_en);
              const displayOptions = learningLang === "fr"
                ? q.options_fr?.length ? q.options_fr : q.options ?? []
                : q.options_en?.length ? q.options_en : q.options ?? [];
              const translationOptions = learningLang === "fr" ? q.options_en ?? [] : q.options_fr ?? [];
              const canTranslateQuestion = Boolean(translatedQuestionText && translatedQuestionText !== questionText);
              const canTranslateOptions = translationOptions.length === displayOptions.length
                && translationOptions.some((option, index) => Boolean(option && option !== displayOptions[index]));
              const canTranslate = submitted ? canTranslateQuestion || canTranslateOptions : canTranslateQuestion;
              const isTranslated = Boolean(translatedQuestions[qIdx] && canTranslate);
              const shownQuestion = isTranslated && canTranslateQuestion ? translatedQuestionText : questionText;
              const shownOptions = submitted && isTranslated && canTranslateOptions
                ? displayOptions.map((option, index) => translationOptions[index] || option)
                : displayOptions;
              const translateButton = canTranslate && (
                <TranslateButton
                  iconVariant="option"
                  onClick={() => setTranslatedQuestions(previous => ({ ...previous, [qIdx]: !previous[qIdx] }))}
                  aria-label={isTranslated ? submitted ? "Show original question and options" : "Show original question" : submitted ? "Translate question and options" : "Translate question"}
                  title={isTranslated ? "Show original" : submitted ? "Translate question and options" : "Translate question"}
                  aria-pressed={isTranslated}
                  iconSize="md"
                />
              );

              return (
                <div key={qIdx} className="flex flex-col gap-3">
                  {/* Question number + text */}
                  <h3 className="practice-type-question-heading flex min-w-0 items-start gap-3 border-b border-slate-200 pb-3 text-slate-900 dark:border-slate-700 dark:text-slate-100">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-sm font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {qIdx + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      {shownQuestion}
                    </span>
                    {translateButton}
                  </h3>

                  {/* Options */}
                  <OptionsComponent
                    className="!grid !auto-rows-fr"
                    options={shownOptions}
                    selectedOption={selectedOptions[qIdx] ?? null}
                    correctIndex={submitted ? q.correctIndex : undefined}
                    showFeedback={submitted}
                    onSelect={(optIdx) => handleOptionSelect(qIdx, optIdx)}
                    itemClassName="!min-h-16 !items-center !rounded-xl !border !px-3 !py-2.5 !font-normal"
                  />

                  {/* Divider between questions */}
                  {qIdx < currentPassage.questions.length - 1 && (
                    <hr className="border-slate-200 dark:border-slate-700 mt-1" />
                  )}
                </div>
              );
            })}
          </section>
        </PracticeTwoPanel>
      </PracticeGameLayout>
    </>
  );
}
