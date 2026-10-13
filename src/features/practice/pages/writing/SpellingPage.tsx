"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccentKeyboard from "@/components/ui/AccentKeyboard";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type SpellingQuestion = {
  passage_title_fr?: string;
  passage_title_en?: string;
  heading_fr?: string;
  heading_en?: string;
  wrong_sentence_fr?: string;
  wrong_sentence_en?: string;
  instruction_box_fr?: string;
  instruction_box_en?: string;
  correct_sentence_fr?: string;
  correct_sentence_en?: string;
  characterLimit?: number;
  timeLimitSeconds?: number;
  level?: string;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
};

/** Normalise a raw API/CSV item into SpellingQuestion shape */
function normaliseItem(item: any): SpellingQuestion {
  const c = item.content || item;
  const ev = item.evaluation || item;
  return {
    passage_title_fr:
      c.title_fr || c.passage_title_fr || item.title_fr || item.passage_title_fr || item["Passage Title_FR"] || "",
    passage_title_en:
      c.title_en || c.passage_title_en || item.title_en || item.passage_title_en || item["Passage Title_EN"] || "",
    heading_fr: c.heading_fr || item.heading_fr || item["Heading_FR"] || "",
    heading_en: c.heading_en || item.heading_en || item["Heading_EN"] || "",
    wrong_sentence_fr:
      c.wrong_sentence_fr || item.wrong_sentence_fr || item.incorrectText || item["Wrong Sentence_FR"] || "",
    wrong_sentence_en:
      c.wrong_sentence_en || item.wrong_sentence_en || item["Wrong Sentence_EN"] || "",
    instruction_box_fr:
      c.instruction_box_fr || item.instruction_box_fr ||
      item.instructionFr || item.Instruction_FR || item["Instructions box_FR"] || "",
    instruction_box_en:
      c.instruction_box_en || item.instruction_box_en ||
      item.instructionEn || item.Instruction_EN || item["Instructions box_EN"] || "",
    correct_sentence_fr:
      ev.correct_sentence_fr || item.correct_sentence_fr ||
      c.correct_sentence_fr || item.correctText || item["Correct Sentence_FR"] || "",
    correct_sentence_en:
      ev.correct_sentence_en || item.correct_sentence_en ||
      c.correct_sentence_en || item["Correct Sentence_EN"] || "",
    characterLimit: Number(
      item.config?.maxHighlightChars || item.characterLimit ||
      item["Character Limit"] || 500,
    ),
    timeLimitSeconds:
      item.timeLimitSeconds || item.config?.timeLimitSeconds ||
      item.TimeLimitSeconds || item.Time || 360,
    level: item.level || item.Level || "",
    instructionFr:
      item.instruction_fr || item.instructionFr || item.Instruction_FR || "",
    instructionEn:
      item.instruction_en || item.instructionEn || item.Instruction_EN || "",
    localizedInstruction: item.localizedInstruction || "",
  };
}

export default function SpellingPage() {
  const handleExit = usePracticeExit();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;

  const [questions, setQuestions] = useState<SpellingQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [showReferenceEnglish, setShowReferenceEnglish] = useState(false);

  // Translate instruction state
  const [translatedInstruction, setTranslatedInstruction] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const currentQuestion = questions[currentIndex];

  // ── Resolve bilingual fields ──────────────────────────────────────────────
  const wrongSentenceFr = currentQuestion?.wrong_sentence_fr || "";
  const correctSentenceFr = currentQuestion?.correct_sentence_fr || "";
  const correctSentenceEn = currentQuestion?.correct_sentence_en || "";
  const configuredCharacterLimit = currentQuestion?.characterLimit;
  const characterLimit = Math.max(
    1,
    typeof configuredCharacterLimit === "number" && Number.isFinite(configuredCharacterLimit)
      ? configuredCharacterLimit
      : 500,
    correctSentenceFr.length,
  );

  // The instruction shown next to the translate button
  const instructionBox =
    currentQuestion?.instruction_box_fr ||
    currentQuestion?.instructionFr ||
    "Tapez la phrase corrigée ci-dessous.";

  const instructionBoxEn =
    currentQuestion?.instruction_box_en ||
    currentQuestion?.instructionEn ||
    "Type the corrected sentence below.";

  const timerDuration = currentQuestion?.timeLimitSeconds || 360;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
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

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "correct_spelling",
    level: currentQuestion?.level,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await fetchPracticeData("correct_spelling", {
          level: levelParam,
          learningLang: learningLang || "fr",
          knownLang: knownLang || "en",
          tag,
        });
        const raw = Array.isArray(data) ? data : [];

        // Filter to passage-style exercises (has wrong_sentence_fr or wrong_sentence_en)
        const filtered = raw.filter((item: any) =>
          item.wrong_sentence_fr || item.wrong_sentence_en ||
          item.incorrectText || item.content?.wrong_sentence_fr ||
          item["Wrong Sentence_FR"]
        );
        const source = filtered.length > 0 ? filtered : raw;
        setQuestions(source.map(normaliseItem));
      } catch (error) {
        console.error("Error loading spelling data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [levelParam, learningLang, knownLang, tag]);

  // Reset input + timer on question change
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput("");
      setShowReferenceEnglish(false);
      setShowTranslation(false);
      setTranslatedInstruction("");
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const normalize = (str: string) =>
    (str || "").toLowerCase().replace(/\s+/g, " ").trim();

  const handleSubmit = () => {
    if (showFeedback || !userInput.trim()) return;
    const correct = normalize(userInput) === normalize(correctSentenceFr);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    if (correct) setScore((prev) => prev + 1);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setShowReferenceEnglish(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // ── Translate instruction button handler ──────────────────────────────────
  const handleTranslateInstruction = async () => {
    // If already showing translation, toggle it off
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }
    // If we already have a cached translation, just show it
    if (translatedInstruction) {
      setShowTranslation(true);
      return;
    }
    // Use the pre-stored English instruction if available
    if (instructionBoxEn) {
      setTranslatedInstruction(instructionBoxEn);
      setShowTranslation(true);
      return;
    }
    // Otherwise call the translation API
    try {
      setIsTranslating(true);
      const res = await fetch(`${API_URL}/api/practice/explain-translation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_sentence: instructionBox,
          correct_answer: instructionBoxEn || instructionBox,
          user_answer: "",
        }),
      });
      if (res.ok) {
        const data = await res.json() as { translation?: string };
        setTranslatedInstruction(data.translation || instructionBoxEn || "Type the corrected sentence below.");
      } else {
        setTranslatedInstruction(instructionBoxEn || "Type the corrected sentence below.");
      }
      setShowTranslation(true);
    } catch {
      setTranslatedInstruction(instructionBoxEn || "Type the corrected sentence below.");
      setShowTranslation(true);
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-sky-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
      <PracticeGameLayout
        questionType="Fix the Spelling"
        instructionFr="Corrigez l'orthographe"
        instructionEn="Fix the Spelling"
        localizedInstruction="Corrigez l'orthographe"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={showFeedback || userInput.trim().length > 0}
        showSubmitButton
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        feedbackInFlow
        compactFeedback
        onFeedbackTranslate={() => setShowReferenceEnglish((visible) => !visible)}
        feedbackTranslationVisible={showReferenceEnglish}
        submitLabel={showFeedback ? (currentIndex + 1 === questions.length ? "Finish" : "Continue") : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
        disableContentScroll
      >
        {/* Match the two-column layout used by the reading exercises. */}
        <PracticeTwoPanel className="overflow-y-auto md:gap-4 md:overflow-hidden md:p-4">

          {/* ══════════════════════════════════════════════
              LEFT PANEL — passage display
          ══════════════════════════════════════════════ */}
          <div className="flex min-h-[460px] min-w-0 flex-col gap-3 md:min-h-0">
            <section className="flex min-h-[210px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" aria-label="Incorrect French sentence">
              <h2 className="practice-type-passage-heading !font-medium shrink-0 px-5 py-3 text-slate-900 dark:text-slate-100">
                INCORRECT SENTENCE <span className="text-base font-normal text-slate-500 dark:text-slate-400">(French)</span>
              </h2>
              <hr className="mx-5 shrink-0 border-neutral-300 dark:border-slate-700" />
              <p className="practice-type-content min-h-0 flex-1 overflow-y-auto px-5 py-3 text-slate-700 dark:text-slate-300">
                {wrongSentenceFr}
              </p>
            </section>

            <section className="flex min-h-[210px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" aria-label="Correct sentence reference">
              <div className="flex shrink-0 items-center justify-between px-5 py-2 text-slate-900 dark:text-slate-100">
                <h2 className="practice-type-passage-heading !font-medium">
                  CORRECT SENTENCE <span className="text-base font-normal text-slate-500 dark:text-slate-400">({showFeedback && !showReferenceEnglish ? "French" : "English"})</span>
                </h2>
                {showFeedback && correctSentenceEn && (
                  <TranslateButton
                    onClick={() => setShowReferenceEnglish((visible) => !visible)}
                    aria-label={showReferenceEnglish ? "Show correct French sentence" : "Translate correct sentence to English"}
                    aria-pressed={showReferenceEnglish}
                    title={showReferenceEnglish ? "Show French" : "Translate to English"}
                  />
                )}
              </div>
              <hr className="mx-5 shrink-0 border-neutral-300 dark:border-slate-700" />
              <p className="practice-type-content min-h-0 flex-1 overflow-y-auto px-5 py-3 text-slate-700 dark:text-slate-300">
                {showFeedback && !showReferenceEnglish ? correctSentenceFr : correctSentenceEn}
              </p>
            </section>
          </div>

          {/* ══════════════════════════════════════════════
              RIGHT PANEL — question + answer input
          ══════════════════════════════════════════════ */}
          <div className="flex min-h-[460px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 md:min-h-0 dark:border-slate-700 dark:bg-slate-900">
            <section className="flex min-h-0 flex-1 flex-col gap-4 rounded-xl bg-white dark:bg-slate-900" aria-label="Corrected French sentence entry">

              {/* Instruction row with translate button */}
              <div className="flex shrink-0 items-start gap-2 px-4 py-2 text-slate-800 dark:text-slate-200">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <p className="practice-type-question-heading !font-medium">
                      {showTranslation && translatedInstruction
                        ? translatedInstruction
                        : instructionBox}
                    </p>
                    <TranslateButton
                      onClick={handleTranslateInstruction}
                      isLoading={isTranslating}
                      aria-label={showTranslation ? "Show original" : "Translate instruction"}
                      aria-pressed={showTranslation}
                      title={showTranslation ? "Show original" : "Translate instruction"}
                    />
                  </div>
                  {/* Show both when translation is active */}
                  {showTranslation && translatedInstruction && (
                    <p className="text-base italic text-slate-500 dark:text-slate-400">
                      {instructionBox}
                    </p>
                  )}
                </div>
              </div>
              <hr className="mx-5 shrink-0 border-neutral-300 dark:border-slate-700" />

              {/* Answer textarea */}
              <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                <textarea
                  ref={textareaRef}
                  aria-label="Corrected French sentence"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  maxLength={characterLimit}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && userInput.trim()) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="|"
                  readOnly={showFeedback}
                  className={cn(
                    "practice-type-content w-full min-h-[220px] flex-1 overflow-y-auto resize-none rounded-[20px] border-2 border-slate-200 bg-neutral-100 px-6 py-5 font-normal text-slate-800 outline-none transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
                    "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    !showFeedback && "focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30",
                    showFeedback && isCorrect
                      ? "border-green-500 bg-green-50 text-green-950 dark:border-green-500 dark:bg-green-950/30 dark:text-green-100"
                      : showFeedback && !isCorrect
                        ? "border-red-500 bg-red-50 text-red-950 dark:border-red-500 dark:bg-red-950/30 dark:text-red-100"
                        : "",
                  )}
                />

                <div className="text-right text-base font-semibold tabular-nums text-slate-500 dark:text-slate-400" aria-label={`${userInput.length} of ${characterLimit} characters`}>
                  {userInput.length}/{characterLimit}
                </div>

                {/* Accent keyboard */}
                <AccentKeyboard
                  disabled={showFeedback || userInput.length >= characterLimit}
                  onAccentClick={(char) => {
                    const el = textareaRef.current;
                    if (!el) return;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const newVal =
                      userInput.slice(0, start) + char + userInput.slice(end);
                    if (newVal.length > characterLimit) return;
                    setUserInput(newVal);
                    requestAnimationFrame(() => {
                      el.focus();
                      el.setSelectionRange(start + 1, start + 1);
                    });
                  }}
                />
              </div>

            </section>
          </div>

        </PracticeTwoPanel>
      </PracticeGameLayout>
  );
}
