"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Check, X, XCircle, Loader2 } from "lucide-react";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { loadMockCSV } from "@/utils/csvLoader";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
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
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string, boolean>>({});
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("error");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Both heading languages are already available locally.
  const [showTranslation, setShowTranslation] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadMockCSV("practice/reading/fill_blanks.csv", {
          learningLang, knownLang, tag,
        });
        const mapped = (Array.isArray(data) ? data : []).map((item: any, idx: number) => {
          const c = item.content || item;
          const e = item.evaluation || item;
          const cfg = item.config || item;

          const segments = parseJson<PassageSegment[]>(
            c.passageSegments || item.passageSegments || [], []
          );

          // Fallback: derive segments from passage_fr / passage_en if DB has none stored
          const passageFr = c.passage_fr || item.passage_fr || '';
          const passageEn = c.passage_en || item.passage_en || '';
          const derivedSegments = segments.length > 0
            ? segments
            : parseSegmentsFromPassage(passageFr || passageEn);

          const blanksRaw = parseJson<Record<string, any>>(
            e.blanksData || item.blanksData || item.eval_blanksData || {}, {}
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

          const ex = {
            external_id:      item.external_id || item.ExerciseID || `EX-${idx}`,
            level:            item.Level || item.level || '',
            passage_fr:       passageFr,
            passage_en:       passageEn,
            passageSegments:  derivedSegments,
            blanksData,
            timeLimitSeconds: Number(cfg.timeLimitSeconds || item.timeLimitSeconds || 480),
            instructionFr:    item.instructionFr || item.instruction_fr || '',
            instructionEn:    item.instructionEn || item.instruction_en || '',
          } as FillBlanksExercise;

          // Diagnostics
          if (ex.passageSegments.length === 0 || Object.keys(ex.blanksData).length === 0) {
            console.warn(`[FILL_BLANKS] Exercise ${ex.external_id} filtered out. Segments: ${ex.passageSegments.length}, Blanks: ${Object.keys(ex.blanksData).length}`, {
              passageFrLength: passageFr.length,
              passageEnLength: passageEn.length,
              blanksRawKeys: Object.keys(blanksRaw)
            });
          }

          return ex;
        }).filter(ex => ex.passageSegments.length > 0 && Object.keys(ex.blanksData).length > 0);

        console.log(`[FILL_BLANKS] Final mapped exercises count: ${mapped.length}`);
        if (mapped.length === 0) setError("No fill-in-the-blanks exercises found.");
        else setExercises(mapped);
      } catch (err) {
        console.error("[FILL_BLANKS] Fetch error:", err);
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
    setRevealedTranslations({});
    setIsCorrect(false);
    setFeedbackTone("error");
    setFeedbackMessage("");
    setScore(0);
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
    setScore(correctCount);
    setTotalScore(prev => prev + correctCount);
    setIsCorrect(allCorrect);
    setFeedbackTone(allCorrect ? "success" : "error");
    setFeedbackMessage(
      allCorrect
        ? "Excellent! All answers correct."
        : timeExpired ? "Time's up!" : `${correctCount} out of ${keys.length} correct.`
    );
    setShowFeedback(true);
    if (allCorrect && currentIndex >= exercises.length - 1) setIsCompleted(true);
  };

  const handleSubmit = () => { if (!showFeedback) checkAnswers(); };

  const handleTranslateHeading = () => setShowTranslation(value => !value);

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
      preserveFooterHeightOnFeedback
      submitLabel={showFeedback ? (currentIndex + 1 === exercises.length ? "FINISH" : "CONTINUE") : "Submit Answer"}
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackMessage={feedbackMessage}
      correctAnswer={undefined}
    >
      <PracticeTwoPanel ratio="seven-three">

        {/* ── Passage (7 cols) ── */}
        <div className="practice-dark-panel min-h-0 self-stretch flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden md:h-full">
          <div className="px-4 py-4 md:px-7 md:py-7 md:flex-1 md:min-h-0 md:overflow-y-auto custom-scrollbar">
            <div className="practice-reading-passage-text !leading-[2]">
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
                const widthSamples = Array.from(new Set([blankEntry.correct, ...blankEntry.options].filter(Boolean)));
                return (
                  <span key={index} className="mx-0.5 inline-flex items-center gap-1.5 align-middle whitespace-nowrap">
                    <span className={cn(
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold",
                      !showFeedback && "border-slate-300 bg-slate-50 text-slate-500 dark:border-[#424a54] dark:bg-[#30363e] dark:text-slate-300",
                      showFeedback && isCorrectAnswer && "practice-answer-badge-correct border-green-400 bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300",
                      showFeedback && isWrongAnswer && "practice-answer-badge-wrong border-red-400 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300",
                    )}>
                      {segment.id}
                    </span>
                    <span className={cn(
                      "practice-type-content inline-grid min-w-24 max-w-[min(16rem,calc(100vw-6rem))] grid-cols-[minmax(0,1fr)] border-b-2 px-1 font-semibold",
                      !userAnswer && "border-slate-300 text-slate-300",
                      !showFeedback && userAnswer && "border-blue-300 text-blue-600",
                      showFeedback && isCorrectAnswer && "border-green-500 text-green-600",
                      showFeedback && isWrongAnswer && "border-red-500 text-red-600",
                    )}>
                      {(widthSamples.length ? widthSamples : ["\u00A0"]).map(option => (
                        <span key={option} aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">{option}</span>
                      ))}
                      <span className="col-start-1 row-start-1 min-w-0 break-words text-center whitespace-normal">{userAnswer || "\u00A0"}</span>
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Dropdowns (3 cols) ── */}
        <div className="practice-dark-panel min-h-0 self-stretch flex flex-col justify-start overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 md:h-full">
          <div className="p-4 md:p-6 md:flex-1 md:min-h-0 md:overflow-y-auto custom-scrollbar">
            <div className="mb-6 flex items-start gap-2">
              <TranslateButton
                onClick={handleTranslateHeading}
                aria-label={showTranslation ? "Show original" : "Translate heading"}
                title={showTranslation ? "Show original" : "Translate heading"}
                iconSize="md"
                className="h-10 w-10"
              />
              <h2 className="practice-reading-heading min-w-0 flex-1 !font-bold">
                {showTranslation
                  ? showQuestionInKnown
                    ? "Choisissez le meilleur mot pour chaque espace"
                    : "Select the best option for each missing word"
                  : selectHeading}
              </h2>
            </div>

            <div className="space-y-3">
              {Object.keys(ex.blanksData).map(key => {
                const blank = ex.blanksData[key];
                if (!blank) return null;
                const id = parseInt(key, 10);
                const userAnswer = answers[key];
                const isCorrectAnswer = showFeedback && userAnswer === blank.correct;
                const isWrongAnswer = showFeedback && userAnswer !== blank.correct;
                const hasTranslation = learningLang === "fr" && Boolean(blank.correct_en && blank.correct_en !== blank.correct);
                const displayedCorrectWord = revealedTranslations[key] && hasTranslation ? blank.correct_en : blank.correct;

                return (
                  <div key={key} className="flex min-w-0 items-start gap-2">
                    <div className={cn(
                      "flex w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors",
                      showFeedback ? "min-h-11 self-stretch" : "h-11",
                      userAnswer && !showFeedback ? "bg-blue-500 border-blue-500 text-white dark:border-[#56616c] dark:bg-[#39424b] dark:text-slate-100" : !showFeedback && "bg-slate-100 text-slate-500 border-slate-200 dark:border-[#424a54] dark:bg-[#30363e] dark:text-slate-300",
                      isCorrectAnswer && "practice-answer-badge-correct bg-green-100 border-green-300 text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300",
                      isWrongAnswer && "practice-answer-badge-wrong bg-red-100 border-red-300 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300",
                    )}>
                      {id}
                    </div>
                    <div className="min-w-0 flex-1">
                      {showFeedback ? (
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex min-w-0 flex-1 flex-wrap items-stretch gap-2" role="status" aria-label={`Answer ${id}: ${isCorrectAnswer ? "correct" : userAnswer ? "incorrect" : "unanswered"}`}>
                            {isWrongAnswer && (
                              <div className="practice-answer-wrong fill-feedback-answer flex min-h-11 min-w-0 basis-32 grow shrink items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2 py-2 font-normal text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
                                <X className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                                <span className="min-w-0 break-words">{userAnswer || "No answer"}</span>
                              </div>
                            )}
                            <div className="practice-answer-correct fill-feedback-answer flex min-h-11 min-w-0 basis-32 grow shrink items-center gap-1 rounded-xl border border-green-200 bg-green-50 px-2 py-2 font-normal text-green-800 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300">
                              <Check className="h-4 w-4 shrink-0 text-green-700 dark:text-inherit" strokeWidth={2.5} aria-hidden="true" />
                              <span className="min-w-0 break-words">{displayedCorrectWord}</span>
                            </div>
                          </div>
                          <div className="h-8 w-8 shrink-0">
                            {hasTranslation && (
                              <TranslateButton iconVariant="option" onClick={() => setRevealedTranslations(previous => ({ ...previous, [key]: !previous[key] }))} aria-label={`${revealedTranslations[key] ? "Show original" : "Translate"} answer ${id}`} title={revealedTranslations[key] ? "Show original answer" : "Translate answer"} aria-pressed={Boolean(revealedTranslations[key])} />
                            )}
                          </div>
                        </div>
                      ) : (
                        <CustomSelect
                          options={blank.options}
                          value={userAnswer || ""}
                          onChange={(val: string) => handleOptionSelect(key, val)}
                          placeholder="---------------------------"
                          ariaLabel={`Select answer for number ${id}`}
                          className="practice-select-text min-w-0"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PracticeTwoPanel>
    </PracticeGameLayout>
  );
}
