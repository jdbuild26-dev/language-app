"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import CustomSelect from "@/components/ui/CustomSelect";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { useSearchParams } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────

type DiagramQuestion = {
  id: number | string;
  correct_fr: string;
  correct_en: string;
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

  const [exercises, setExercises] = useState<DiagramExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Per-question shuffled option lists, fixed on load
  const [dropdownOptions, setDropdownOptions] = useState<Record<string | number, string[]>>({});
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState("");

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMockCSV("practice/reading/diagram_labelling.csv", { tag });
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
          const c = item.content || item;
          const cfg = item.config || item;
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
            questions:      parseQuestions(c.questions || item.questions),
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

  const { pick, showQuestionInKnown, learningLang } = useQuestionLanguage(ex?.level);

  // ── Derive display values ──────────────────────────────────────────────────
  const passageTitle = pick(ex?.title_fr, ex?.title_en) || ex?.title || "";
  const passageText  = learningLang === "fr"
    ? ex?.passage_fr || ex?.passage_en || (ex?.paragraphs || []).join("\n\n")
    : ex?.passage_en || ex?.passage_fr || (ex?.paragraphs || []).join("\n\n");
  const questionText = pick(ex?.question_fr, ex?.question_en) || "Match each number with the correct answer.";
  const imageUrl     = ex?.imageUrl || "";

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
  // Always use learning language (FR) for options
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
  useEffect(() => {
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
    setCorrectAnswerText("");
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

  useEffect(() => { resetTimer(); }, [currentIndex, resetTimer]);

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
    setScore(correctCount);
    setTotalScore(prev => prev + correctCount);
    setIsCorrect(isPerfect);

    if (isPerfect) {
      setFeedbackMessage("Perfect! All answers correct!");
      setCorrectAnswerText("");
    } else {
      setFeedbackMessage(`${correctCount} out of ${total} correct.`);
      const wrongOnes = questions.filter(q => {
        const correctWord = learningLang === "fr" ? q.correct_fr : q.correct_en;
        return answers[q.id] !== correctWord;
      });
      // Show correct answer in both languages after submit
      const answerList = wrongOnes
        .map(q => `${q.id}: ${q.correct_fr} / ${q.correct_en}`)
        .join("  •  ");
      setCorrectAnswerText(answerList);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!showFeedback) { handleCheck(); return; }

    if (currentIndex < exercises.length - 1) {
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
    setScore(0);
    setTotalScore(0);
    setIsCorrect(false);
    setFeedbackMessage("");
    setCorrectAnswerText("");
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
      totalQuestions={exercises.length * (questions.length || 1)}
      onExit={handleExit}
      onNext={handleNext}
      onRestart={handleRestart}
      currentQuestionIndex={currentIndex}
      questionCounterValue={currentIndex + 1}
      feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
      isSubmitEnabled={showFeedback || allAnswered}
      showSubmitButton={true}
      submitLabel={
        showFeedback
          ? currentIndex + 1 === exercises.length ? "Finish" : "Continue"
          : "Check Answers"
      }
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackMessage={feedbackMessage}
      correctAnswer={correctAnswerText}
    >
      <div className="practice-reading-page-shell flex min-h-0 w-full flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-4 mx-auto overflow-y-auto md:overflow-hidden flex-1">

        {/* ── Left: Image + Passage ── */}
        <div className="md:basis-[52%] md:max-w-[52%] min-h-0 flex flex-col gap-3">

          {/* Image — shown when URL available, placeholder slot when not */}
          {imageUrl ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-center items-center p-3 shadow-sm min-h-[180px] md:min-h-[220px]">
              <img
                src={imageUrl}
                alt={passageTitle || "Diagram"}
                className="max-h-[30vh] md:max-h-[240px] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 flex justify-center items-center p-4 min-h-[80px] text-slate-400 dark:text-slate-500 text-sm italic">
              Image coming soon
            </div>
          )}

          {/* Passage */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                {passageTitle}
              </h2>
            </div>
            <p className="practice-reading-passage-text text-slate-700 dark:text-slate-300 leading-relaxed">
              {passageText}
            </p>
          </div>
        </div>

        {/* ── Right: Dropdowns ── */}
        <div className="md:basis-[48%] md:max-w-[48%] min-h-0 flex flex-col dark:bg-slate-900 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 p-4 md:p-5 overflow-y-auto custom-scrollbar">

          <h3 className="practice-reading-heading flex items-center gap-2 mb-4">
            <Languages className="w-5 h-5 text-blue-500 shrink-0" />
            {questionText}
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {questions.map(q => {
              const correctWord = learningLang === "fr" ? q.correct_fr : q.correct_en;
              const correctWordOther = learningLang === "fr" ? q.correct_en : q.correct_fr;
              const isWrong = showFeedback && answers[q.id] !== correctWord;
              const isRight = showFeedback && answers[q.id] === correctWord;
              const hasSelection = Boolean(answers[q.id]);
              const opts = dropdownOptions[q.id] || [];

              return (
                <div key={q.id} className="flex items-center gap-2 md:gap-3">
                  {/* Number badge */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shadow-sm border shrink-0 transition-colors",
                    isRight  ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-300 dark:border-green-700"
                    : isWrong ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-700"
                    : hasSelection ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700",
                  )}>
                    {q.id}
                  </div>

                  {/* Dropdown */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <CustomSelect
                      options={opts}
                      value={answers[q.id] || ""}
                      onChange={(val: string) => handleSelect(q.id, val)}
                      placeholder="Select a word"
                      disabled={showFeedback}
                      isCorrect={isRight}
                      isWrong={isWrong}
                      feedbackMode={showFeedback}
                      correctValue={correctWord}
                      className="flex-1 min-w-0 practice-reading-select"
                    />
                    {/* Show translation after submit */}
                    {showFeedback && correctWordOther && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 pl-1">
                        <Languages className="w-3 h-3 shrink-0" />
                        {correctWordOther}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
