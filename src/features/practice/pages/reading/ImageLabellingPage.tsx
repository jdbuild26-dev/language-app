"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { Button } from "@/components/ui/button";
import { loadMockCSV } from "@/utils/csvLoader";
import { CheckCircle2, Languages, Loader2, Sparkles } from "lucide-react";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
// ── Types ─────────────────────────────────────────────────────────────────────

type LabelItem = {
  id?: number;
  name: string;      // display name (learning lang)
  name_fr?: string;
  name_en?: string;
  x: number;
  y: number;
};

type PlacedItem = LabelItem & { isCorrect: boolean | null };

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
  // new format
  items?: LabelItem[] | string;
  word_bank_fr?: string[] | string;
  word_bank_en?: string[] | string;
  timeLimitSeconds?: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseArr<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === "string" && v) {
    try { return JSON.parse(v) as T[]; } catch { return []; }
  }
  return [];
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

  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const [exercises, setExercises] = useState<ImageLabellingExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [bankItems, setBankItems] = useState<string[]>([]);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<LabelItem | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMockCSV("practice/reading/image_labelling.csv", { tag });
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
          const c = item.content || item;
          const cfg = item.config || item;
          return {
            external_id:  item.external_id || item.ExerciseID,
            level:        item.Level || item.level || '',
            title:        c.title_en || item.title_en || item.title || '',
            title_fr:     c.title_fr || item.title_fr || '',
            title_en:     c.title_en || item.title_en || item.title || '',
            question_fr:  c.question_fr || item.question_fr || '',
            question_en:  c.question_en || item.question_en || '',
            instructionFr: item.instructionFr || item.instruction_fr || '',
            instructionEn: item.instructionEn || item.instruction_en || '',
            image:        c.image || item.image || item.imageUrl || '',
            items:        parseArr<LabelItem>(c.items || item.items),
            word_bank_fr: parseArr<string>(c.word_bank_fr || item.word_bank_fr),
            word_bank_en: parseArr<string>(c.word_bank_en || item.word_bank_en),
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
  const { pick, showQuestionInKnown, learningLang } = useQuestionLanguage(ex?.level);
  usePracticeComplete({ isGameOver: isCompleted, score: totalScore, totalQuestions: exercises.length, exerciseType: "image_labelling", level: ex?.level });

  // ── Derive items in learning language ─────────────────────────────────────
  const items: LabelItem[] = useMemo(() => {
    const raw = parseArr<LabelItem>(ex?.items);
    return raw.map(item => ({
      ...item,
      // display name is always in learning language
      name: learningLang === "fr"
        ? (item.name_fr || item.name)
        : (item.name_en || item.name),
    }));
  }, [ex?.items, learningLang]);

  // Word bank in learning language
  const wordBank: string[] = useMemo(() => {
    const wb = learningLang === "fr"
      ? parseArr<string>(ex?.word_bank_fr)
      : parseArr<string>(ex?.word_bank_en);
    // fallback: derive from items if no word bank
    if (wb.length === 0) return items.map(i => i.name);
    return wb;
  }, [ex?.word_bank_fr, ex?.word_bank_en, items, learningLang]);

  // EN translations for showing after submit
  const wordBankEn: string[] = useMemo(() =>
    parseArr<string>(ex?.word_bank_en), [ex?.word_bank_en]);
  const wordBankFr: string[] = useMemo(() =>
    parseArr<string>(ex?.word_bank_fr), [ex?.word_bank_fr]);

  const titleText    = pick(ex?.title_fr, ex?.title_en) || ex?.title || "Image Labelling";
  const questionText = pick(ex?.question_fr, ex?.question_en) || "Label the image";

  // ── Reset per exercise ─────────────────────────────────────────────────────
  const resetGame = () => {
    setBankItems([...wordBank]);
    setPlacedItems([]);
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackMessage("");
    setSelectedLabel(null);
    setSelectedTarget(null);
  };

  useEffect(() => {
    if (ex && wordBank.length > 0) {
      resetGame();
      resetTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, ex, wordBank.length]);

  // ── Image resize tracking ──────────────────────────────────────────────────
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImgSize({ width: e.currentTarget.clientWidth, height: e.currentTarget.clientHeight });
  };
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current)
        setImgSize({ width: imageRef.current.clientWidth, height: imageRef.current.clientHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const handleLabelClick = (name: string) => {
    if (showFeedback) return;
    if (selectedTarget) {
      placeItem(name, selectedTarget);
      setSelectedTarget(null);
      setSelectedLabel(null);
      return;
    }
    setSelectedLabel(selectedLabel === name ? null : name);
  };

  const handleTargetClick = (target: LabelItem) => {
    if (showFeedback) return;
    const alreadyPlaced = placedItems.find(
      p => Math.abs(p.x - target.x) < 0.0001 && Math.abs(p.y - target.y) < 0.0001
    );
    if (alreadyPlaced) { handleReturnToBank(alreadyPlaced.name); return; }
    if (selectedLabel) {
      placeItem(selectedLabel, target);
      setSelectedLabel(null);
      setSelectedTarget(null);
    } else {
      setSelectedTarget(selectedTarget === target ? null : target);
    }
  };

  const placeItem = (name: string, target: LabelItem) => {
    setBankItems(prev => prev.filter(i => i !== name));
    setPlacedItems(prev => [...prev, { ...target, name, isCorrect: null }]);
  };

  const handleReturnToBank = (name: string) => {
    if (showFeedback) return;
    setPlacedItems(prev => prev.filter(p => p.name !== name));
    setBankItems(prev => prev.includes(name) ? prev : [...prev, name]);
  };

  const handleCheck = () => {
    if (!items.length) return;
    let correct = 0;
    const newPlaced = placedItems.map(placed => {
      const target = items.find(
        k => Math.abs(k.x - placed.x) < 0.0001 && Math.abs(k.y - placed.y) < 0.0001
      );
      if (!target) return placed;
      const isHit = target.name === placed.name;
      if (isHit) correct++;
      return { ...placed, isCorrect: isHit };
    });
    setPlacedItems(newPlaced);
    setScore(correct);
    setTotalScore(prev => prev + correct);
    const total = items.length;
    if (correct === total) {
      setIsCorrect(true);
      setFeedbackMessage(`Perfect! All ${total} labels correct!`);
    } else {
      setIsCorrect(false);
      setFeedbackMessage(`${correct} out of ${total} correct. Check your placements!`);
    }
    setShowFeedback(true);
  };

  const handleContinue = () => {
    if (!showFeedback) return;
    if (isCorrect && currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return;
    }
    if (isCorrect && currentIndex >= exercises.length - 1) {
      setIsCompleted(true);
      return;
    }
    setShowFeedback(false);
  };

  // ── Loading / empty ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!ex) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">No questions available.</p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
      </div>
    );
  }

  const totalItems = items.length;
  const progress = exercises.length > 0
    ? ((currentIndex + placedItems.length / (totalItems || 1)) / exercises.length) * 100
    : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PracticeGameLayout
      questionType={titleText}
      questionTypeFr="Étiquetage d'image"
      questionTypeEn="Image Labelling"
      localizedInstruction={showQuestionInKnown ? questionText : (ex.question_fr || questionText)}
      instructionFr={ex.question_fr || "Étiquetez l'image"}
      instructionEn={ex.question_en || "Label the image"}
      progress={progress}
      isGameOver={isCompleted}
      score={totalScore}
      totalQuestions={totalItems}
      currentQuestionIndex={currentIndex}
      questionCounterValue={currentIndex + 1}
      onExit={handleExit}
      onNext={showFeedback ? handleContinue : handleCheck}
      onRestart={() => { setCurrentIndex(0); setIsCompleted(false); setShowFeedback(false); setTotalScore(0); }}
      isSubmitEnabled={placedItems.length > 0 || showFeedback}
      showSubmitButton={true}
      submitLabel={
        showFeedback
          ? isCorrect
            ? currentIndex < exercises.length - 1 ? "Next Exercise" : "Finish"
            : "Try Again"
          : "Check Answers"
      }
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
      feedbackMessage={feedbackMessage}
      correctAnswer={undefined}
    >
      <div className="practice-reading-page-shell grid grid-cols-1 md:grid-cols-10 gap-4 p-3 md:p-4 mx-auto overflow-hidden flex-1 min-h-0">

        {/* ── Word Bank (right column) ── */}
        <div className="md:col-span-3 md:order-2 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-[0_8px_26px_-18px_rgba(15,23,42,0.55)]">
          <div className="px-4 py-4 bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-[11px] lg:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em]">
              Labels
            </h3>
            <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              {bankItems.length} left
            </p>
          </div>

          <div className="flex flex-row flex-wrap md:flex-nowrap md:flex-col gap-2 p-3 overflow-x-visible md:overflow-y-auto custom-scrollbar no-scrollbar md:flex-1">
            {bankItems.length === 0 && placedItems.length === totalItems ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-slate-400 dark:text-slate-500 min-w-full">
                <CheckCircle2 className="w-5 h-5 opacity-50 text-emerald-500" />
                <span className="text-xs font-semibold">Done!</span>
              </div>
            ) : (
              bankItems.map((name) => {
                // Find EN translation for this label
                const frIdx = wordBankFr.indexOf(name);
                const enTranslation = frIdx >= 0 && wordBankEn[frIdx] ? wordBankEn[frIdx] : null;
                return (
                  <button
                    key={name}
                    onClick={() => handleLabelClick(name)}
                    className={cn(
                      "practice-reading-option-text px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm shadow-sm border transition-all duration-200 active:scale-[0.98] select-none text-center min-w-[84px] sm:min-w-[110px] md:min-w-0 flex-shrink-0 md:flex-shrink",
                      selectedLabel === name
                        ? "bg-sky-600 text-white border-sky-500 shadow-md ring-4 ring-sky-100 dark:ring-sky-900/40"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700/60",
                    )}
                  >
                    <span>{name}</span>
                    {/* Show EN translation after submit */}
                    {showFeedback && enTranslation && learningLang === "fr" && (
                      <span className="text-[10px] opacity-60 flex items-center justify-center gap-0.5 mt-0.5">
                        <Languages className="w-2.5 h-2.5 inline" /> {enTranslation}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Image panel (left column) ── */}
        <div className="md:col-span-7 md:order-1 min-h-0 flex flex-col min-w-0 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-[0_12px_36px_-24px_rgba(15,23,42,0.6)] relative">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80">
            <p className="practice-reading-option-text text-slate-700 dark:text-slate-200 font-medium text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              {selectedLabel
                ? `Tap a marker for "${selectedLabel}"`
                : selectedTarget
                  ? "Select the matching label now"
                  : "Select a label, then place it on a marker"}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 min-h-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.14),transparent_58%)] dark:bg-none">
            {ex.image ? (
              <div
                className="relative transition-all duration-500 ease-out rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-700/70 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.7)]"
                style={{ width: imgSize.width || undefined, height: imgSize.height || undefined, maxWidth: "100%", maxHeight: "100%" }}
              >
                <img
                  ref={imageRef}
                  src={ex.image}
                  alt={titleText}
                  onLoad={handleImageLoad}
                  className="block w-full h-auto max-h-[62vh] md:max-h-[68vh] object-contain pointer-events-none select-none"
                />
                {/* Numbered markers */}
                {items.map((target, idx) => {
                  const isPlaced = placedItems.some(
                    p => Math.abs(p.x - target.x) < 0.0001 && Math.abs(p.y - target.y) < 0.0001
                  );
                  const isSelected = selectedTarget === target;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleTargetClick(target)}
                      className={cn(
                        "absolute w-6 h-6 lg:w-7 lg:h-7 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer flex items-center justify-center z-20 text-xs font-bold",
                        isSelected
                          ? "bg-sky-600 text-white ring-4 ring-sky-100 dark:ring-sky-900/50 scale-110 shadow-lg"
                          : isPlaced
                            ? "opacity-0 pointer-events-none"
                            : "bg-white text-sky-700 hover:bg-sky-100 hover:scale-110 border-2 border-sky-500/70 dark:border-sky-400/70 shadow-md",
                      )}
                      style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}
                    >
                      {target.id ?? idx + 1}
                    </button>
                  );
                })}
                {/* Placed labels */}
                {placedItems.map((item) => {
                  const frIdx = wordBankFr.indexOf(item.name);
                  const enLabel = frIdx >= 0 && wordBankEn[frIdx] ? wordBankEn[frIdx] : null;
                  return (
                    <button
                      key={`${item.name}-${item.x}-${item.y}`}
                      onClick={() => handleReturnToBank(item.name)}
                      className={cn(
                        "absolute practice-reading-option-text px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl font-semibold text-[10px] lg:text-xs shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all z-30 select-none border active:scale-[0.98] group",
                        item.isCorrect === true
                          ? "bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900/30"
                          : item.isCorrect === false
                            ? "bg-rose-600 text-white border-rose-500 ring-2 ring-rose-100 dark:ring-rose-900/30"
                            : "bg-sky-50/95 dark:bg-slate-800/95 backdrop-blur-sm text-slate-900 dark:text-white border-sky-300 dark:border-slate-600 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700/60",
                      )}
                      style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%` }}
                    >
                      <span>{item.name}</span>
                      {showFeedback && enLabel && learningLang === "fr" && (
                        <span className="block text-[9px] opacity-70 mt-0.5">{enLabel}</span>
                      )}
                      {!showFeedback && item.isCorrect === null && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-0 group-hover:scale-100">✕</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* No image yet — show numbered grid placeholder */
              <div className="w-full max-w-lg grid grid-cols-4 gap-3 p-4">
                {items.map((target, idx) => {
                  const placed = placedItems.find(
                    p => Math.abs(p.x - target.x) < 0.0001 && Math.abs(p.y - target.y) < 0.0001
                  );
                  const isSelected = selectedTarget === target;
                  const frIdx = placed ? wordBankFr.indexOf(placed.name) : -1;
                  const enLabel = frIdx >= 0 && wordBankEn[frIdx] ? wordBankEn[frIdx] : null;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleTargetClick(target)}
                      className={cn(
                        "rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-1 min-h-[72px] transition-all font-semibold text-sm",
                        isSelected
                          ? "bg-sky-100 border-sky-500 text-sky-700 ring-2 ring-sky-200"
                          : placed
                            ? placed.isCorrect === true
                              ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                              : placed.isCorrect === false
                                ? "bg-rose-50 border-rose-400 text-rose-700"
                                : "bg-sky-50 border-sky-300 text-sky-800"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-sky-300",
                      )}
                    >
                      <span className="text-xs font-bold text-slate-400">{target.id ?? idx + 1}</span>
                      {placed ? (
                        <>
                          <span className="text-center leading-tight">{placed.name}</span>
                          {showFeedback && enLabel && learningLang === "fr" && (
                            <span className="text-[10px] opacity-60">{enLabel}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-300 italic">drop here</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
