"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import AccentKeyboard from "@/components/ui/AccentKeyboard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type BlankEntry = {
  correct_fr: string;
  correct_en: string;
  masked_fr: string;
  masked_en: string;
};

type FillBlanksQuestion = {
  title_fr: string;
  title_en: string;
  heading_fr: string;
  heading_en: string;
  complete_passage_en: string;
  fill_paragraph_fr: string;
  blanksData: Record<string, BlankEntry>;
  timeLimitSeconds: number;
  level: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse "[1] __________" passage into text + blank segments */
type Segment = { type: "text"; text: string } | { type: "blank"; blankId: number };

function parsePassage(paragraph: string): Segment[] {
  const segments: Segment[] = [];
  const re = /\[(\d+)\]\s*_{2,}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(paragraph)) !== null) {
    if (m.index > last) segments.push({ type: "text", text: paragraph.slice(last, m.index) });
    segments.push({ type: "blank", blankId: parseInt(m[1]) });
    last = m.index + m[0].length;
  }
  if (last < paragraph.length) segments.push({ type: "text", text: paragraph.slice(last) });
  return segments;
}

/** Get the correct character for a given blank slot index from the mask + correct word */
function getCorrectCharForSlot(mask: string, correctWord: string, slotIdx: number): string {
  let wIdx = 0;
  let bIdx = 0;
  for (const ch of mask) {
    if (ch === "_") {
      if (bIdx === slotIdx) return correctWord[wIdx] ?? "";
      bIdx++;
    }
    wIdx++;
  }
  return "";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WriteFillBlanksPage() {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;

  const [questions, setQuestions] = useState<FillBlanksQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentQ = questions[currentIndex];

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentQ?.timeLimitSeconds || 360,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !showFeedback) handleSubmit(); },
    isPaused: isLoading || isCompleted || showFeedback,
  });

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "write_fill_blanks",
    level: currentQ?.level,
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await loadMockCSV("practice/writing/write_fill_blanks.csv", {
          level: levelParam, learningLang: learningLang || "fr",
          knownLang: knownLang || "en", tag,
        });
        const raw = Array.isArray(data) ? data : [];
        const normalized: FillBlanksQuestion[] = raw
          .filter((item: any) =>
            (item.fill_paragraph_fr || item.fill_paragraph_en) &&
            (item.Category === "main" || !item.Category)
          )
          .map((item: any) => ({
            title_fr: item.title_fr || item.passage_title_fr || "",
            title_en: item.title_en || item.passage_title_en || "",
            heading_fr: item.heading_fr || "",
            heading_en: item.heading_en || "",
            complete_passage_en: item.complete_passage_en || "",
            fill_paragraph_fr: item.fill_paragraph_fr || item.fill_paragraph_en || "",
            blanksData: item.blanksData || {},
            timeLimitSeconds: item.timeLimitSeconds || item.TimeLimitSeconds || 360,
            level: item.level || item.Level || "",
          }));
        setQuestions(normalized);
      } catch (e) {
        console.error("WriteFillBlanks load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [levelParam, learningLang, knownLang, tag]);

  useEffect(() => {
    if (currentQ && !isCompleted) {
      setUserInputs({});
      setShowFeedback(false);
      inputRefs.current = {};
      resetTimer();
    }
  }, [currentIndex, currentQ, isCompleted, resetTimer]);

  // ── Input ──────────────────────────────────────────────────────────────────
  const totalSlotsFor = useCallback((blankId: number) => {
    const entry = currentQ?.blanksData[String(blankId)];
    if (!entry) return 0;
    return (entry.masked_fr.match(/_/g) || []).length;
  }, [currentQ]);

  const handleCharInput = useCallback((blankId: number, slotIdx: number, char: string) => {
    const key = `${blankId}_${slotIdx}`;
    setUserInputs(prev => ({ ...prev, [key]: char }));
    if (!char) return;
    const total = totalSlotsFor(blankId);
    if (slotIdx < total - 1) {
      inputRefs.current[`${blankId}_${slotIdx + 1}`]?.focus();
    } else {
      const ids = Object.keys(currentQ?.blanksData || {}).map(Number).sort((a, b) => a - b);
      const nextId = ids.find(id => id > blankId);
      if (nextId !== undefined) inputRefs.current[`${nextId}_0`]?.focus();
    }
  }, [currentQ, totalSlotsFor]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, blankId: number, slotIdx: number) => {
    if (e.key === "Backspace" && !userInputs[`${blankId}_${slotIdx}`]) {
      if (slotIdx > 0) {
        inputRefs.current[`${blankId}_${slotIdx - 1}`]?.focus();
      } else {
        const ids = Object.keys(currentQ?.blanksData || {}).map(Number).sort((a, b) => a - b);
        const prevId = [...ids].reverse().find(id => id < blankId);
        if (prevId !== undefined) {
          const prevTotal = totalSlotsFor(prevId);
          inputRefs.current[`${prevId}_${prevTotal - 1}`]?.focus();
        }
      }
    }
  }, [userInputs, currentQ, totalSlotsFor]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (showFeedback || !currentQ) return;
    let allCorrect = true;
    for (const [bid, entry] of Object.entries(currentQ.blanksData)) {
      const mask = entry.masked_fr;
      let slotIdx = 0;
      let userWord = "";
      for (const ch of mask) {
        if (ch === "_") {
          userWord += (userInputs[`${bid}_${slotIdx}`] || "").toLowerCase();
          slotIdx++;
        } else {
          userWord += ch.toLowerCase();
        }
      }
      if (userWord !== entry.correct_fr.toLowerCase()) { allCorrect = false; break; }
    }
    setIsCorrect(allCorrect);
    setShowFeedback(true);
    if (allCorrect) setScore(s => s + 1);
  }, [showFeedback, currentQ, userInputs]);

  const handleContinue = () => {
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
    else setIsCompleted(true);
  };

  // ── Render a blank word inline ─────────────────────────────────────────────
  const renderBlankWord = (blankId: number, entry: BlankEntry) => {
    const mask = entry.masked_fr;
    let slotIdx = 0;
    const chars = mask.split("");

    return (
      <span
        className="inline-flex items-center align-middle mx-1 rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-800 shadow-sm"
        style={{ verticalAlign: "middle" }}
      >
        {chars.map((ch, i) => {
          const isLast = i === chars.length - 1;
          const isFirst = i === 0;

          if (ch === "_") {
            const si = slotIdx++;
            const key = `${blankId}_${si}`;
            const userChar = userInputs[key] || "";
            const correctChar = getCorrectCharForSlot(mask, entry.correct_fr, si);
            const isFocused = focusedKey === key;
            const isWrong = showFeedback && userChar.toLowerCase() !== correctChar.toLowerCase();
            const isRight = showFeedback && userChar.toLowerCase() === correctChar.toLowerCase();

            return (
              <span
                key={i}
                className={cn(
                  "relative flex items-center justify-center",
                  "w-8 h-9",
                  !isFirst && "border-l border-slate-200 dark:border-slate-600",
                  isFocused && !showFeedback && "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-inset ring-blue-500 z-10",
                  isWrong && "bg-red-50 dark:bg-red-900/20",
                  isRight && "bg-emerald-50 dark:bg-emerald-900/20",
                )}
              >
                <input
                  ref={el => { inputRefs.current[key] = el; }}
                  type="text"
                  maxLength={1}
                  value={userChar}
                  onChange={e => handleCharInput(blankId, si, e.target.value.slice(-1))}
                  onKeyDown={e => handleKeyDown(e, blankId, si)}
                  onFocus={() => setFocusedKey(key)}
                  onBlur={() => setFocusedKey(prev => prev === key ? null : prev)}
                  disabled={showFeedback}
                  className={cn(
                    "absolute inset-0 w-full h-full bg-transparent text-center text-sm font-mono outline-none",
                    isWrong ? "text-red-600 dark:text-red-400" :
                    isRight ? "text-emerald-700 dark:text-emerald-400" :
                    "text-slate-800 dark:text-white",
                  )}
                />
              </span>
            );
          }

          // Revealed character cell
          return (
            <span
              key={i}
              className={cn(
                "flex items-center justify-center w-8 h-9 text-sm font-mono text-slate-700 dark:text-slate-300 select-none",
                !isFirst && "border-l border-slate-200 dark:border-slate-600",
              )}
            >
              {ch}
            </span>
          );
        })}
      </span>
    );
  };

  // ── Render FR passage with inline blanks ───────────────────────────────────
  const renderPassage = () => {
    if (!currentQ?.fill_paragraph_fr) return null;
    const segments = parsePassage(currentQ.fill_paragraph_fr);
    return (
      <div className="text-sm leading-[3rem] text-slate-700 dark:text-slate-300">
        {segments.map((seg, i) => {
          if (seg.type === "text") return <span key={i}>{seg.text}</span>;
          const entry = currentQ.blanksData[String(seg.blankId)];
          if (!entry) return <span key={i} className="text-slate-400">___</span>;
          return <React.Fragment key={i}>{renderBlankWord(seg.blankId, entry)}</React.Fragment>;
        })}
      </div>
    );
  };

  // ── States ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="animate-spin text-sky-500 w-8 h-8" />
    </div>
  );

  if (questions.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
      <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
    </div>
  );

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Fill in the Blanks"
        instructionFr="Lisez le passage et répondez"
        instructionEn="Read the passage and respond"
        localizedInstruction="Lisez le passage et répondez"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit Answer"
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
      >
        <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-10 flex flex-col gap-5">

            {/* Title */}
            <div className="text-center">
              {currentQ.heading_en && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {currentQ.heading_en}
                </p>
              )}
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {currentQ.title_en || currentQ.title_fr}
              </h2>
              <div className="h-0.5 w-12 bg-blue-500 mx-auto mt-2 rounded-full" />
            </div>

            {/* EN reference passage */}
            {currentQ.complete_passage_en && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentQ.complete_passage_en}
              </p>
            )}

            {/* Divider */}
            <hr className="border-slate-200 dark:border-slate-700" />

            {/* FR passage with inline letter-box blanks */}
            {renderPassage()}

          </div>

          {/* Accent keyboard */}
          {!showFeedback && (
            <AccentKeyboard
              disabled={showFeedback}
              onAccentClick={(char) => {
                if (!focusedKey) return;
                const [bidStr, siStr] = focusedKey.split("_");
                handleCharInput(parseInt(bidStr), parseInt(siStr), char);
                requestAnimationFrame(() => inputRefs.current[focusedKey]?.focus());
              }}
            />
          )}
        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect
              ? Object.entries(currentQ?.blanksData || {})
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([id, e]) => `${id}. ${e.correct_fr}`)
                  .join("  •  ")
              : null
          }
          onContinue={handleContinue}
          message={getFeedbackMessage(isCorrect)}
          continueLabel={currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"}
        />
      )}
    </>
  );
}
