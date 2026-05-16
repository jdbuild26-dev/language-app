"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, RotateCcw, Pause, Play, Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";

// ─── Types ────────────────────────────────────────────────────────────────────

type ListenQuestion = {
  question: string;
  question_fr?: string;
  question_en?: string;
  options: string[];
  options_fr?: string[];
  options_en?: string[];
  correctIndex: number;
};

type ListenPassageGroup = {
  passageText: string;
  title: string;
  level: string;
  timeLimitSeconds: number;
  questions: ListenQuestion[];
};

// ─── Helper: Grouping logic ───
function groupByPassage(exercises: any[]): ListenPassageGroup[] {
  const groups: ListenPassageGroup[] = [];
  const seen = new Map<string, number>();

  for (const item of exercises) {
    const c = item.content || item;
    const key = (c.passageText || c.passage_fr || "").trim();
    if (!key) continue;

    // A single exercise might contain multiple questions (legacy) 
    // or one question (standard replica format)
    const itemQuestions: ListenQuestion[] = [];
    if (Array.isArray(c.questions) && c.questions.length > 0) {
      c.questions.forEach((q: any) => {
        itemQuestions.push({
          question: q.question_fr || q.question_en || q.question || "",
          question_fr: q.question_fr || "",
          question_en: q.question_en || "",
          options: q.options_fr || q.options_en || q.options || [],
          options_fr: q.options_fr || [],
          options_en: q.options_en || [],
          correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
        });
      });
    } else if (c.question_fr || c.question_en) {
      itemQuestions.push({
        question: c.question_fr || c.question_en || "",
        question_fr: c.question_fr || "",
        question_en: c.question_en || "",
        options: c.options_fr || c.options_en || [],
        options_fr: c.options_fr || [],
        options_en: c.options_en || [],
        correctIndex: typeof item.evaluation?.correctIndex === "number" ? item.evaluation.correctIndex : 0,
      });
    }

    if (seen.has(key)) {
      groups[seen.get(key)!].questions.push(...itemQuestions);
    } else {
      seen.set(key, groups.length);
      groups.push({
        passageText: key,
        title: c.title_fr || c.title_en || c.passage_title_fr || "",
        level: item.Level || item.level || "A1",
        timeLimitSeconds: Number(c.timeLimitSeconds || item.timeLimitSeconds || 120),
        questions: itemQuestions,
      });
    }
  }
  return groups;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListenPassagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>}>
      <ListenPassageContent />
    </Suspense>
  );
}

function ListenPassageContent() {
  const handleExit = usePracticeExit();
  const { learningLang = "fr", knownLang = "en" } = useLanguage();
  const { speak, isSpeaking, pause, resume, isPaused, cancel } = useTextToSpeech();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;

  const [passages, setPassages] = useState<ListenPassageGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [passageIndex, setPassageIndex] = useState(0);

  // Per-passage question states
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Feedback Banner states
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentPassage = passages[passageIndex];
  const { pick } = useQuestionLanguage(currentPassage?.level);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPracticeData("listen_passage", { tag });
        const exercises = Array.isArray(data) ? data : [];
        const grouped = groupByPassage(exercises);
        setPassages(grouped);
      } catch (e) {
        console.error("ListenPassage load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [tag]);

  // Reset turn state when passage changes
  useEffect(() => {
    if (currentPassage) {
      setSelectedOptions(new Array(currentPassage.questions.length).fill(null));
      setIsSubmitted(false);
      setShowFeedback(false);
      setHasPlayed(false);
      cancel();
    }
  }, [passageIndex, currentPassage, cancel]);

  const totalIndividualQuestions = passages.reduce((acc, p) => acc + p.questions.length, 0);

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: totalIndividualQuestions,
    exerciseType: "listen_passage",
    level: currentPassage?.level,
  });

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentPassage?.timeLimitSeconds || 120,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !isSubmitted) handleSubmit(); },
    isPaused: isCompleted || isSubmitted || !hasPlayed || isLoading,
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePlayAudio = () => {
    if (isSpeaking) pause();
    else if (isPaused) resume();
    else if (currentPassage) {
      speak(currentPassage.passageText, "fr-FR");
      setHasPlayed(true);
      resetTimer();
    }
  };

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedOptions(prev => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    if (isSubmitted || !currentPassage) return;
    if (selectedOptions.some(o => o === null)) return; // Ensure all answered

    setIsSubmitted(true);
    let correctCount = 0;
    currentPassage.questions.forEach((q, i) => {
      if (selectedOptions[i] === q.correctIndex) correctCount++;
    });

    setScore(s => s + correctCount);
    const allCorrect = correctCount === currentPassage.questions.length;
    setIsCorrect(allCorrect);
    setFeedbackMessage(allCorrect ? getFeedbackMessage(true) : `${correctCount}/${currentPassage.questions.length} correct`);
    setShowFeedback(true);
    cancel();
  }, [isSubmitted, currentPassage, selectedOptions, cancel]);

  const handleContinue = () => {
    setShowFeedback(false);
    if (passageIndex < passages.length - 1) setPassageIndex(i => i + 1);
    else setIsCompleted(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="animate-spin text-rose-500 w-8 h-8" />
    </div>
  );

  if (passages.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
      <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
    </div>
  );

  const progress = ((passageIndex + 1) / passages.length) * 100;
  const allAnswered = selectedOptions.every(o => o !== null);

  return (
    <>
      <PracticeGameLayout
        questionType="Passage Questions"
        instructionFr="Écoutez le passage et répondez aux questions"
        instructionEn="Listen to the passage and answer all questions"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={passages.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={(allAnswered || showFeedback) && hasPlayed}
        showSubmitButton={true}
        submitLabel={showFeedback ? (passageIndex === passages.length - 1 ? "FINISH" : "CONTINUE") : "Check Answers"}
        timerValue={hasPlayed ? timerString : "--:--"}
      >
        <div className="flex flex-col lg:flex-row w-full h-full min-h-0 bg-slate-50 dark:bg-slate-950">
          
          {/* LEFT — Audio Player Panel */}
          <div className="flex-1 flex items-center justify-center p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="w-full max-w-sm">
              <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-3xl p-10 shadow-xl relative overflow-hidden group">
                {/* Decorative blobs */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl" />

                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-8">
                    <button
                      onClick={(e) => { e.stopPropagation(); cancel(); handlePlayAudio(); }}
                      className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:rotate-[-30deg]"
                    >
                      <RotateCcw className="w-6 h-6 text-white" />
                    </button>

                    <button
                      onClick={handlePlayAudio}
                      className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
                        isSpeaking ? "bg-white text-rose-500 scale-110" : "bg-white/20 hover:bg-white/30"
                      )}
                    >
                      {isSpeaking ? (
                        <Pause className="w-12 h-12" />
                      ) : isPaused ? (
                        <Play className="w-12 h-12 text-white translate-x-1" />
                      ) : (
                        <Volume2 className="w-12 h-12 text-white" />
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-white font-bold tracking-wide uppercase text-xs opacity-80 mb-1">
                      {isSpeaking ? "En cours de lecture..." : "Prêt pour l'écoute"}
                    </p>
                    <p className="text-white/60 text-[10px] font-medium uppercase tracking-widest">
                      {currentPassage.title || "Passage Audio"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Questions Panel */}
          <div className="flex-1 flex flex-col p-6 lg:p-10 bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-xl mx-auto space-y-10">
              {currentPassage.questions.map((q, qIdx) => {
                const questionText = pick(q.question_fr, q.question_en) || q.question;
                const options = q.options_fr?.length ? q.options_fr : q.options;
                const transOptions = q.options_en || [];

                return (
                  <div key={qIdx} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${qIdx * 100}ms` }}>
                    <div className="flex items-start gap-4">
                      <span className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center border border-rose-100 dark:border-rose-800">
                        {qIdx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {questionText}
                      </h3>
                    </div>

                    <PracticeOptions
                      options={options}
                      selectedOption={selectedOptions[qIdx]}
                      correctIndex={isSubmitted ? q.correctIndex : undefined}
                      showFeedback={isSubmitted}
                      onSelect={(optIdx) => handleOptionSelect(qIdx, optIdx)}
                      itemClassName="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-100 dark:border-slate-700 p-4 rounded-xl text-left transition-all group"
                      renderLabel={(opt, optIdx) => (
                        <div className="flex flex-col">
                          <span className="text-[15px] font-medium text-slate-700 dark:text-slate-200">{opt}</span>
                          {isSubmitted && transOptions[optIdx] && (
                            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <Languages className="w-3 h-3" /> {transOptions[optIdx]}
                            </span>
                          )}
                        </div>
                      )}
                    />
                    
                    {qIdx < currentPassage.questions.length - 1 && <div className="pt-4 border-b border-slate-50 dark:border-slate-800/50" />}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={passageIndex === passages.length - 1 ? "FINISH" : "CONTINUE"}
        />
      )}
    </>
  );
}
