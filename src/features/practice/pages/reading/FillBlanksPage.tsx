"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { XCircle, Loader2, Languages } from "lucide-react";
import { loadMockCSV } from "@/utils/csvLoader";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import CustomSelect from "@/components/ui/CustomSelect";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
// ── Types ─────────────────────────────────────────────────────────────────────

type PassageSegment = { type: "text"; text: string } | { type: "blank"; id: number };

type BlankEntry = {
  correct: string;
  correct_en?: string;
  options: string[];
  options_en?: string[];
};

type FillBlanksExercise = {
  external_id?: string;
  level?: string;
  passage_fr?: string;
  passage_en?: string;
  passageSegments: PassageSegment[];
  blanksData: Record<string, BlankEntry>;
  timeLimitSeconds?: number;
  instructionFr?: string;
  instructionEn?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseJson<T>(v: unknown, fallback: T): T {
  if (v == null || v === "") return fallback;
  if (typeof v === "string") {
    try { return JSON.parse(v) as T; } catch { return fallback; }
  }
  return v as T;
}

function normalizeOptions(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") return v.split("|").map(s => s.trim()).filter(Boolean);
  return [];
}

/**
 * Parses a passage string like "La bibliothèque est [1] __________ la poste."
 * into PassageSegment[] — splitting on [N] ___... markers.
 */
function parseSegmentsFromPassage(passage: string): PassageSegment[] {
  if (!passage) return [];
  const segments: PassageSegment[] = [];
  // Match [N] followed by optional underscores/spaces
  const regex = /\[(\d+)\]\s*_{2,}\s*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(passage)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", text: passage.slice(lastIndex, match.index) });
    }
    segments.push({ type: "blank", id: parseInt(match[1], 10) });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < passage.length) {
    segments.push({ type: "text", text: passage.slice(lastIndex) });
  }
  return segments;
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function FillBlanksPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <FillBlanksContent />
    </Suspense>
  );
}

function FillBlanksContent() {
  const handleExit = usePracticeExit();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const { learningLang = "fr", knownLang = "en" } = useLanguage() as {
    learningLang?: string;
    knownLang?: string;
  };

  const [exercises, setExercises] = useState<FillBlanksExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error" | "partial">("error");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Translate heading state
  const [translatedHeading, setTranslatedHeading] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadMockCSV("practice/reading/fill_blanks.csv", {
          learningLang, knownLang, tag,
        });
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
          const c = item.content || item;
          const e = item.evaluation || item;
          const cfg = item.config || item;

          const segments = parseJson<PassageSegment[]>(
            c.passageSegments || item.passageSegments, []
          );

          // Fallback: derive segments from passage_fr / passage_en if DB has none stored
          const passageFr = c.passage_fr || item.passage_fr || '';
          const passageEn = c.passage_en || item.passage_en || '';
          const derivedSegments = segments.length > 0
            ? segments
            : parseSegmentsFromPassage(passageFr || passageEn);
          const blanksRaw = parseJson<Record<string, any>>(
            e.blanksData || item.blanksData || item.eval_blanksData, {}
          );

          // Normalise blanksData entries
          const blanksData: Record<string, BlankEntry> = {};
          for (const [k, v] of Object.entries(blanksRaw)) {
            if (typeof v === "object" && v !== null) {
              blanksData[k] = {
                correct:    String(v.correct || ''),
                correct_en: String(v.correct_en || v.correct || ''),
                options:    normalizeOptions(v.options),
                options_en: normalizeOptions(v.options_en),
              };
            } else {
              blanksData[k] = { correct: String(v), correct_en: String(v), options: [], options_en: [] };
            }
          }

          return {
            external_id:      item.external_id || item.ExerciseID,
            level:            item.Level || item.level || '',
            passage_fr:       passageFr,
            passage_en:       passageEn,
            passageSegments:  derivedSegments,
            blanksData,
            timeLimitSeconds: Number(cfg.timeLimitSeconds || item.timeLimitSeconds || 480),
            instructionFr:    item.instructionFr || item.instruction_fr || '',
            instructionEn:    item.instructionEn || item.instruction_en || '',
          } as FillBlanksExercise;
        }).filter(ex => ex.passageSegments.length > 0 && Object.keys(ex.blanksData).length > 0);

        if (mapped.length === 0) setError("No fill-in-the-blanks exercises found.");
        else setExercises(mapped);
      } catch {
        setError("Failed to load exercises.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [learningLang, knownLang, tag]);

  const ex = exercises[currentIndex];
  const { showQuestionInKnown } = useQuestionLanguage(ex?.level);
  usePracticeComplete({ isGameOver: isCompleted, score: totalScore, totalQuestions: exercises.length, exerciseType: "fill_blanks", level: ex?.level });

  // Reset answers when exercise changes
  useEffect(() => {
    setAnswers({});
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackTone("error");
    setFeedbackMessage("");
    setScore(0);
    setTranslatedHeading("");
    setShowTranslation(false);
    resetTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, ex]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const { timerString, resetTimer } = useExerciseTimer({
    duration: ex?.timeLimitSeconds || 480,
    mode: "timer",
    onExpire: () => { if (!showFeedback && !isCompleted) checkAnswers(true); },
    isPaused: showFeedback || isCompleted || loading,
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOptionSelect = (blankId: string, value: string) => {
    if (showFeedback) return;
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const checkAnswers = (timeExpired = false) => {
    if (!ex) return;
    const keys = Object.keys(ex.blanksData);
    if (keys.length === 0) return;

    let correctCount = 0;
    keys.forEach(key => {
      if (answers[key] === ex.blanksData[key].correct) correctCount++;
    });

    const allCorrect = correctCount === keys.length;
    const partial = correctCount > 0 && !allCorrect;
    setScore(correctCount);
    setTotalScore(prev => prev + correctCount);
    setIsCorrect(allCorrect);
    setFeedbackTone(allCorrect ? "success" : partial ? "partial" : "error");
    setFeedbackMessage(
      allCorrect
        ? "Excellent! All answers correct."
        : partial
          ? `${correctCount} out of ${keys.length} correct.`
          : timeExpired ? "Time's up!" : `${correctCount} out of ${keys.length} correct.`
    );
    setShowFeedback(true);
    if (allCorrect && currentIndex >= exercises.length - 1) setIsCompleted(true);
  };

  const handleSubmit = () => { if (!showFeedback) checkAnswers(); };

  const handleTranslateHeading = async () => {
    const targetLang = learningLang === "fr" ? "en" : "fr";
    if (showTranslation) { setShowTranslation(false); return; }
    if (translatedHeading) { setShowTranslation(true); return; }
    try {
      setIsTranslating(true);
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectHeading, target_lang: targetLang }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { translation?: string };
      setTranslatedHeading(data.translation || "");
      setShowTranslation(true);
    } catch {
      setTranslatedHeading("");
      setShowTranslation(false);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleContinue = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // ── Loading / error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !ex) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Practice</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button onClick={handleExit} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalBlanks = Object.keys(ex.blanksData).length;
  const allAnswered = Object.keys(ex.blanksData).every(k => answers[k]);
  const progress = exercises.length > 0
    ? ((currentIndex + Object.keys(answers).length / (totalBlanks || 1)) / exercises.length) * 100
    : 0;

  // Heading: level-based language
  const selectHeading = showQuestionInKnown
    ? "Select the best option for each missing word"
    : "Choisissez le meilleur mot pour chaque espace";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PracticeGameLayout
      questionType="Fill in the blanks"
      questionTypeFr="Complétez le passage"
      questionTypeEn="Fill in the blanks"
      localizedInstruction={showQuestionInKnown ? "Select the best option for each missing word" : "Choisissez le meilleur mot pour chaque espace"}
      instructionFr={ex.instructionFr || "Choisissez le meilleur mot pour chaque espace"}
      instructionEn={ex.instructionEn || "Select the best option for each missing word"}
      progress={progress}
      isGameOver={isCompleted}
      score={totalScore}
      totalQuestions={exercises.length * totalBlanks}
      currentQuestionIndex={currentIndex}
      questionCounterValue={currentIndex + 1}
      feedbackTone={feedbackTone}
      onExit={handleExit}
      onNext={showFeedback ? handleContinue : handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={showFeedback || allAnswered}
      showSubmitButton={true}
      submitLabel={showFeedback ? (currentIndex + 1 === exercises.length ? "FINISH" : "CONTINUE") : "Submit Answer"}
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackMessage={feedbackMessage}
      correctAnswer={undefined}
    >
      <div className="practice-reading-page-shell grid grid-cols-1 md:grid-cols-10 md:items-stretch gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0">

        {/* ── Passage (7 cols) ── */}
        <div className="md:col-span-7 min-h-0 h-full self-stretch flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 md:px-7 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-blue-500 shrink-0" />
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-[0.18em]">
                Passage
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-1">
              {Object.keys(answers).length}/{totalBlanks} filled
            </span>
          </div>

          <div className="px-5 md:px-7 py-6 md:py-7 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div className="practice-reading-passage-text">
              {ex.passageSegments.map((segment, index) => {
                if (segment.type === "text") {
                  return <span key={index}>{segment.text}</span>;
                }

                const id = String(segment.id);
                const blankEntry = ex.blanksData[id];
                if (!blankEntry) return null;

                const userAnswer = answers[id];
                const isCorrectAnswer = showFeedback && userAnswer === blankEntry.correct;
                const isWrongAnswer   = showFeedback && userAnswer && userAnswer !== blankEntry.correct;
                // Show EN translation below wrong answer after submit
                const enTranslation = showFeedback && blankEntry.correct_en ? blankEntry.correct_en : null;

                return (
                  <span key={index} className="mx-1 inline-flex flex-col items-start align-baseline">
                    <span className="inline-flex items-end gap-1.5">
                      <span className={cn(
                        "inline-flex items-center justify-center w-7 h-7 rounded-md border text-xs font-bold",
                        "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500",
                        showFeedback && isCorrectAnswer && "bg-green-100 border-green-400 text-green-700",
                        showFeedback && isWrongAnswer  && "bg-red-100 border-red-400 text-red-700",
                      )}>
                        {segment.id}
                      </span>
                      <span className={cn(
                        "px-1 border-b-2 pb-0.5 text-lg md:text-xl font-semibold leading-none whitespace-nowrap",
                        userAnswer ? "inline-flex min-w-9 md:min-w-[80px]" : "inline-block w-14 md:w-[110px]",
                        !userAnswer && "text-slate-300 border-slate-300",
                        !showFeedback && userAnswer && "text-blue-600 border-blue-300",
                        showFeedback && isCorrectAnswer && "text-green-600 border-green-500",
                        showFeedback && isWrongAnswer  && "text-red-600 border-red-500",
                      )}>
                        {userAnswer || "\u00A0"}
                      </span>
                    </span>
                    {/* EN translation shown after submit */}
                    {showFeedback && enTranslation && learningLang === "fr" && (
                      <span className="text-[10px] text-slate-400 mt-0.5 pl-8">{enTranslation}</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Dropdowns (3 cols) ── */}
        <div className="md:col-span-3 min-h-0 h-full self-stretch flex flex-col justify-start overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="p-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
              <button
                type="button"
                onClick={handleTranslateHeading}
                disabled={isTranslating}
                aria-label={showTranslation ? "Show original" : "Translate heading"}
                title={showTranslation ? "Show original" : "Translate heading"}
                className="inline-flex items-center justify-center shrink-0 text-blue-500 hover:text-blue-600 disabled:opacity-60 transition-colors"
              >
                {isTranslating
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <Languages className="w-5 h-5" />
                }
              </button>
              {showTranslation && translatedHeading ? translatedHeading : selectHeading}
            </h2>

            <div className="space-y-3">
              {Object.keys(ex.blanksData).map(key => {
                const blank = ex.blanksData[key];
                if (!blank) return null;
                const id = parseInt(key, 10);
                const userAnswer = answers[key];
                const isCorrectAnswer = showFeedback && userAnswer === blank.correct;
                const isWrongAnswer   = showFeedback && !!userAnswer && userAnswer !== blank.correct;

                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold border text-sm transition-colors",
                      userAnswer && !showFeedback ? "bg-blue-500 border-blue-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600",
                      showFeedback && isCorrectAnswer && "bg-green-500 border-green-500 text-white",
                      showFeedback && isWrongAnswer  && "bg-red-500 border-red-500 text-white",
                    )}>
                      {id}
                    </div>
                    <div className="flex-grow">
                      <CustomSelect
                        options={blank.options}
                        value={userAnswer || ""}
                        onChange={(val: string) => handleOptionSelect(key, val)}
                        placeholder="Select a word"
                        disabled={showFeedback}
                        isCorrect={showFeedback && isCorrectAnswer}
                        isWrong={showFeedback && isWrongAnswer}
                        feedbackMode={showFeedback}
                        correctValue={blank.correct}
                        className="practice-reading-select practice-reading-option-text"
                      />
                      {/* EN translation after submit */}
                      {showFeedback && blank.correct_en && learningLang === "fr" && (
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-1 pl-1">
                          <Languages className="w-3 h-3 shrink-0" />
                          {blank.correct_en}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
