"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { Button } from "@/components/ui/button";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { CheckCircle2, Languages, Loader2, Sparkles, Image as ImageIcon, XCircle, RotateCcw } from "lucide-react";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
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

  const [exercises, setExercises] = useState<ImageLabellingExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPracticeData("image_labelling", { tag });
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
          const c = item.content || item;
          const cfg = item.config || item;
          
          // Determine learning language once per exercise if possible
          // For now assume 'fr' or use item.learning_lang
          const learningLang = item.learning_lang || 'fr';

          const rawItems = parseArr<any>(c.items || item.items);
          const mappedItems = rawItems.map((it: any) => {
            const opts = learningLang === 'fr' 
              ? parseArr<string>(it.options_fr) 
              : parseArr<string>(it.options_en);
            
            return {
              id: it.id,
              name: learningLang === 'fr' ? (it.name_fr || it.name) : (it.name_en || it.name),
              name_fr: it.name_fr || it.name || '',
              name_en: it.name_en || it.name || '',
              options: opts.length > 0 ? opts : []
            } as LabelItem;
          });

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
  const { pick, showQuestionInKnown, learningLang } = useQuestionLanguage(ex?.level);
  usePracticeComplete({ isGameOver: isCompleted, score: totalScore, totalQuestions: exercises.length, exerciseType: "image_labelling", level: ex?.level });

  const titleText    = pick(ex?.title_fr, ex?.title_en) || ex?.title || "Image Labelling";
  const questionText = pick(ex?.question_fr, ex?.question_en) || "Label the image";

  // ── Reset per exercise ─────────────────────────────────────────────────────
  const resetGame = () => {
    setUserAnswers({});
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackMessage("");
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
    if (isCorrect && currentIndex < exercises.length - 1) {
      setShowFeedback(false);
      setIsCorrect(false);
      setFeedbackMessage("");
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
      instructionFr={ex.instructionFr || "Étiquetez l'image"}
      instructionEn={ex.instructionEn || "Label the image"}
      localizedInstruction={questionText}
      progress={progress}
      onExit={handleExit}
      timerValue={timerString}
      showSubmitButton={true}
      isSubmitEnabled={filledCount === totalCount}
      onNext={showFeedback ? handleContinue : handleCheck}
      submitLabel={
        showFeedback
          ? isCorrect
            ? currentIndex < exercises.length - 1 ? "Next Exercise" : "Finish"
            : "Try Again"
          : "Check Answers"
      }
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackTone={isCorrect ? "success" : "error"}
      feedbackMessage={feedbackMessage}
      score={totalScore}
      totalQuestions={exercises.length}
      currentQuestionIndex={currentIndex}
      isGameOver={isCompleted}
      onRestart={() => { setCurrentIndex(0); setIsCompleted(false); setTotalScore(0); }}
    >
      <div className="max-w-6xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* ── Left Column: Image ────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Passage
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  {filledCount}/{totalCount} filled
                </span>
              </div>
            </div>

            <Card className="overflow-hidden border-2 border-slate-100 shadow-sm rounded-3xl bg-white">
              <div className="relative aspect-video lg:aspect-square flex items-center justify-center bg-slate-50">
                {ex.image ? (
                  <img
                    src={ex.image}
                    alt="Labelling exercise"
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-300">
                    <ImageIcon className="w-16 h-16" />
                    <span className="text-sm">No image provided</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ── Right Column: Dropdowns ───────────────────────────────────── */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {questionText}
              </h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">
                Select the best option for each missing word
              </p>

              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                {ex.items.map((item, idx) => {
                  const isCorrectItem = showFeedback && userAnswers[item.id] === item.name;
                  const isIncorrectItem = showFeedback && userAnswers[item.id] && userAnswers[item.id] !== item.name;

                  return (
                    <div key={item.id} className="flex items-center gap-4 group">
                      <div className={cn(
                        "w-10 h-10 shrink-0 flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-300 border-2",
                        isCorrectItem ? "bg-green-100 text-green-700 border-green-200" :
                        isIncorrectItem ? "bg-red-100 text-red-700 border-red-200" :
                        userAnswers[item.id] ? "bg-orange-100 text-orange-700 border-orange-200" :
                        "bg-slate-50 text-slate-400 border-slate-100 group-hover:border-slate-200"
                      )}>
                        {idx + 1}
                      </div>

                      <div className="flex-1">
                        <Select
                          value={userAnswers[item.id] || ""}
                          onValueChange={(val) => handleAnswerChange(item.id, val)}
                          disabled={showFeedback}
                        >
                          <SelectTrigger className={cn(
                            "h-12 rounded-xl border-2 transition-all duration-200 font-medium",
                            isCorrectItem ? "border-green-200 bg-green-50/30 text-green-700" :
                            isIncorrectItem ? "border-red-200 bg-red-50/30 text-red-700" :
                            userAnswers[item.id] ? "border-orange-200 bg-white shadow-sm" :
                            "border-slate-100 bg-white hover:border-slate-200"
                          )}>
                            <SelectValue placeholder="Select a word" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2 border-slate-100 shadow-xl overflow-hidden">
                            {item.options?.map((opt) => (
                              <SelectItem key={opt} value={opt} className="rounded-lg my-1 font-medium mx-1">
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-6 shrink-0 flex items-center justify-center">
                        <AnimatePresence>
                          {showFeedback && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex items-center justify-center"
                            >
                              {isCorrectItem ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-500" />
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
