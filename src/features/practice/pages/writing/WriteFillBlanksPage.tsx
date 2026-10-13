"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import AccentKeyboard from "@/components/ui/AccentKeyboard";
import { TranslateButton } from "@/components/ui/TranslateButton";
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

type PassageSegment = { type: "text"; text: string } | { type: "blank"; blankId: number };

function parsePassage(paragraph: string): PassageSegment[] {
  const segments: PassageSegment[] = [];
  const marker = /\[(\d+)\]\s*_{2,}\s*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = marker.exec(paragraph)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", text: paragraph.slice(lastIndex, match.index) });
    }
    segments.push({ type: "blank", blankId: Number(match[1]) });
    lastIndex = marker.lastIndex;
  }
  if (lastIndex < paragraph.length) {
    segments.push({ type: "text", text: paragraph.slice(lastIndex) });
  }
  return segments;
}

/**
 * Build a masked pattern from a word: keep first half of chars, blank the rest.
 * e.g. "passé" → "p_s_é", "journée" → "j__r_é_"
 */
function buildMask(word: string): string {
  const keep = Math.ceil(word.length / 2);
  return word.split('').map((ch, i) => i < keep ? ch : '_').join('');
}

/**
 * Convert old-format passage + targetWords into new-format fill_paragraph_fr + blanksData.
 * Replaces each target word occurrence (in order) with [N] __________.
 */
function convertOldFormat(passage: string, targetWordsRaw: any): {
  fill_paragraph_fr: string;
  blanksData: Record<string, BlankEntry>;
} {
  // targetWords may arrive as an array or a space-separated string
  const targets: string[] = Array.isArray(targetWordsRaw)
    ? targetWordsRaw.filter(Boolean)
    : String(targetWordsRaw).split(/\s+/).filter(Boolean);
  const blanksData: Record<string, BlankEntry> = {};
  let result = passage;
  let blankId = 1;

  for (const word of targets) {
    // Case-insensitive replace of first occurrence
    const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const match = result.match(re);
    if (match) {
      const actualWord = match[0]; // preserve original casing
      blanksData[String(blankId)] = {
        correct_fr: actualWord,
        correct_en: actualWord,
        masked_fr: buildMask(actualWord),
        masked_en: buildMask(actualWord),
      };
      result = result.replace(re, `[${blankId}] __________`);
      blankId++;
    }
  }

  return { fill_paragraph_fr: result, blanksData };
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
  const [showPassageTranslation, setShowPassageTranslation] = useState(false);
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
        const data = await fetchPracticeData("write_fill_blanks", {
          level: levelParam, learningLang: learningLang || "fr",
          knownLang: knownLang || "en", tag,
        });
        const raw = Array.isArray(data) ? data : [];
        const normalized: FillBlanksQuestion[] = raw
          .filter((item: any) =>
            // Accept new format (has fill_paragraph_fr) OR old format (has passage)
            (item.fill_paragraph_fr || item.fill_paragraph_en || item.passage || item["Fill Paragraph_FR"]) &&
            (item.Category === "main" || !item.Category)
          )
          .map((item: any) => {
            // Detect old format: has `passage` + `targetWords`, no blanksData
            const isOldFormat = !item.fill_paragraph_fr && !item.fill_paragraph_en &&
              item.passage && item.targetWords;

            let fill_paragraph_fr = item.fill_paragraph_fr || item.fill_paragraph_en || item.passage || item["Fill Paragraph_FR"] || "";
            let blanksData: Record<string, BlankEntry> = item.blanksData || {};

            if (isOldFormat) {
              const converted = convertOldFormat(item.passage, item.targetWords);
              fill_paragraph_fr = converted.fill_paragraph_fr;
              blanksData = converted.blanksData;
            }

            if (Object.keys(blanksData).length === 0 && item["Correct Answer_FR"]) {
              const splitWords = (value: unknown) => String(value || "").split("+").map(word => word.trim());
              const correctFr = splitWords(item["Correct Answer_FR"]);
              const correctEn = splitWords(item["Correct Answer_EN"]);
              const maskedFr = splitWords(item["Masked Answer_FR"]);
              const maskedEn = splitWords(item["Masked Answer_EN"]);
              correctFr.forEach((word, index) => {
                blanksData[String(index + 1)] = {
                  correct_fr: word,
                  correct_en: correctEn[index] || word,
                  masked_fr: maskedFr[index] || buildMask(word),
                  masked_en: maskedEn[index] || buildMask(correctEn[index] || word),
                };
              });
            }

            return {
              title_fr: item.title_fr || item.passage_title_fr || item.title || item["Passage Title_FR"] || "",
              title_en: item.title_en || item.passage_title_en || item.title || item["Passage Title_EN"] || "",
              heading_fr: item.heading_fr || "",
              heading_en: item.heading_en || "",
              complete_passage_en: item.complete_passage_en || item.englishTranslation || item["Complete Passage_EN"] || "",
              fill_paragraph_fr,
              blanksData,
              timeLimitSeconds: item.timeLimitSeconds || item.TimeLimitSeconds || 360,
              level: item.level || item.Level || "",
            };
          });
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
      setShowPassageTranslation(false);
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
    // If no blanksData (old format), just mark as correct and continue
    if (!currentQ.blanksData || Object.keys(currentQ.blanksData).length === 0) {
      setIsCorrect(true);
      setShowFeedback(true);
      setScore(s => s + 1);
      return;
    }
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
    setShowPassageTranslation(false);
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
        className="inline-flex max-w-full items-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_2px_0_rgba(203,213,225,0.5)] dark:border-slate-600 dark:bg-slate-800"
      >
        {chars.map((ch, i) => {
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
                  "h-[30px] w-7 shrink-0",
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
                  aria-label={`Word ${blankId}, missing letter ${si + 1}`}
                  className={cn(
                    "practice-type-content absolute inset-0 h-full w-full bg-transparent text-center !leading-none font-medium outline-none",
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
                "practice-type-content flex h-[30px] w-7 shrink-0 select-none items-center justify-center !leading-none font-medium text-slate-700 dark:text-slate-300",
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

  const renderPassage = () => parsePassage(currentQ.fill_paragraph_fr).map((segment, index) => {
    if (segment.type === "text") return <span key={index}>{segment.text}</span>;
    const entry = currentQ.blanksData[String(segment.blankId)];
    if (!entry) return null;
    return (
      <span key={index} className="mx-1 inline-flex align-middle whitespace-nowrap">
        {renderBlankWord(segment.blankId, entry)}
      </span>
    );
  });

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
    <PracticeGameLayout
        questionType="Fill in the Blanks"
        instructionFr="Complétez le texte"
        instructionEn="Fill in the Blanks"
        localizedInstruction="Complétez le texte"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled
        showSubmitButton
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackTone={isCorrect ? "success" : "error"}
        feedbackMessage={getFeedbackMessage(isCorrect)}
        correctAnswer={!isCorrect
          ? Object.entries(currentQ.blanksData)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([id, entry]) => `${id}. ${entry.correct_fr}`)
              .join("  •  ")
          : undefined}
        feedbackInFlow
        compactFeedback
        submitLabel={showFeedback ? (currentIndex + 1 === questions.length ? "Finish" : "Continue") : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
      >
        <div className="mx-auto flex w-full max-w-[1280px] shrink-0 flex-col px-4 pb-6 pt-6 sm:px-6 sm:pt-8">
          <div className="flex flex-col justify-center border-b border-slate-200 pb-6 dark:border-slate-700">

            {/* Title */}
            <div className="text-center">
              <div className="flex min-h-11 items-center justify-center gap-2">
                <h2 className="practice-type-question-heading text-center !font-medium text-slate-900 dark:text-slate-100">
                  {currentQ.title_en || currentQ.complete_passage_en || currentQ.title_fr}
                </h2>
                {showFeedback && currentQ.complete_passage_en && (
                  <TranslateButton
                    onClick={() => setShowPassageTranslation(visible => !visible)}
                    aria-label={showPassageTranslation ? "Hide English translation" : "Show English translation"}
                    aria-pressed={showPassageTranslation}
                    aria-expanded={showPassageTranslation}
                    aria-controls="fitb-english-translation"
                    title={showPassageTranslation ? "Hide English translation" : "Show English translation"}
                    className="h-11 w-11"
                  />
                )}
              </div>
            </div>

          </div>

          <section
            aria-label="Complete the French passage"
            className="px-3 py-6 sm:px-4 dark:bg-slate-900"
            style={{ backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.13) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          >
            <div className="practice-type-content font-normal !leading-[44px] text-slate-700 dark:text-slate-200">
              {renderPassage()}
            </div>
          </section>

          {showFeedback && showPassageTranslation && currentQ.complete_passage_en && (
            <section id="fitb-english-translation" aria-label="English translation" className="practice-type-content border-t border-slate-200 px-3 py-6 font-normal text-slate-700 sm:px-4 dark:border-slate-700 dark:text-slate-200">
              <h3 className="mb-3 text-base font-semibold text-slate-500 dark:text-slate-400">English translation</h3>
              <p>{currentQ.complete_passage_en}</p>
            </section>
          )}

          {/* Accent keyboard */}
          {!showFeedback && (
            <AccentKeyboard
              disabled={showFeedback}
              className="shrink-0 gap-1.5 border-t border-slate-200 py-6 dark:border-slate-700"
              onAccentClick={(char) => {
                if (!focusedKey) return;
                const [bidStr, siStr] = focusedKey.split("_");
                handleCharInput(parseInt(bidStr), parseInt(siStr), char);
              }}
            />
          )}
        </div>
      </PracticeGameLayout>
  );
}
