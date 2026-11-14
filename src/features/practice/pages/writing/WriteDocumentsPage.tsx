"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { AnswerInstruction, TopicPromptPanel } from "@/features/practice/components/PracticePromptPanels";
import { insertImageAccent, imageCharacterLimit } from "@/features/practice/lib/writeImageInput";
import { useWriteDocumentsEvaluation } from "@/features/practice/hooks/useWriteDocumentsEvaluation";
import WriteDocumentsFeedbackResult from "@/features/practice/components/WriteDocumentsFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import SpecialCharacterKeyboard from "@/features/practice/components/SpecialCharacterKeyboard";

// ─── Types ────────────────────────────────────────────────────────────────────

type WriteDocumentQuestion = {
  id: string;
  heading_fr: string;
  heading_en: string;
  main_instruction_fr: string;
  main_instruction_en: string;
  topic_bullets_fr: string[];
  topic_bullets_en: string[];
  instruction_box_fr: string;
  instruction_box_en: string;
  sample_answers_fr: string[];
  sample_answers_en: string[];
  timeLimitSeconds: number;
  charLimit: number;
  level: string;
};

type RawWriteDocumentQuestion = Partial<WriteDocumentQuestion> & {
  ExerciseID?: string | null;
  Category?: string;
  Level?: string;
  TimeLimitSeconds?: number;
  maxHighlightChars?: number;
  prompt?: string;
  topic?: string;
  hints?: string | string[];
  sampleAnswer?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function WriteDocumentsPage() {
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;

  return (
    <WriteDocumentsSession
      key={JSON.stringify([learningLang, knownLang, levelParam, tag])}
      tag={tag}
      levelParam={levelParam}
    />
  );
}

function WriteDocumentsSession({ tag, levelParam }: { tag?: string; levelParam?: string }) {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [questions, setQuestions] = useState<WriteDocumentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const { evaluation, error, isSubmitting, evaluate, resetEvaluation } = useWriteDocumentsEvaluation();

  const currentQ = questions[currentIndex];

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentQ?.timeLimitSeconds || 360,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !evaluation) void handleSubmit(); },
    isPaused: isLoading || isCompleted || Boolean(evaluation) || isSubmitting,
  });

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "write_documents",
    level: currentQ?.level,
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPracticeData("write_documents", {
          level: levelParam,
          learningLang: learningLang || "fr",
          knownLang: knownLang || "en",
          tag,
        });
        const raw: RawWriteDocumentQuestion[] = Array.isArray(data) ? data : [];

        // Separate new-format (from uploaded CSV) and old-format items
        const newFormat = raw.filter(item =>
          (item.main_instruction_fr || item.main_instruction_en ||
           (Array.isArray(item.topic_bullets_fr) && item.topic_bullets_fr.length > 0)) &&
          item.ExerciseID && item.ExerciseID !== '' && item.ExerciseID !== null &&
          (item.Category === "main" || !item.Category)
        );
        const oldFormat = raw.filter(item =>
          (item.prompt || item.topic) &&
          (!item.ExerciseID || item.ExerciseID === '' || item.ExerciseID === null) &&
          (item.Category === "main" || !item.Category)
        );

        // Prefer new-format if available, fall back to old
        const source = newFormat.length > 0 ? newFormat : oldFormat;

        const normalized: WriteDocumentQuestion[] = source
          .filter(item =>
            // Accept new format OR old format (has topic/prompt fields)
            (item.main_instruction_fr || item.main_instruction_en ||
             (Array.isArray(item.topic_bullets_fr) && item.topic_bullets_fr.length > 0) ||
             item.prompt || item.topic) &&
            (item.Category === "main" || !item.Category)
          )
          .map(item => {
            // Handle old format: { topic, englishTopic, prompt, hints, sampleAnswer }
            const isOldFormat = !item.main_instruction_fr && !item.topic_bullets_fr && item.topic;
            const hintsArray = isOldFormat
              ? (typeof item.hints === 'string'
                  ? item.hints.split(/[,+]/).map((h: string) => h.trim()).filter(Boolean)
                  : Array.isArray(item.hints) ? item.hints : [])
              : [];
            return {
              id: typeof item.id === "string" ? item.id : "",
              heading_fr: item.heading_fr || "",
              heading_en: item.heading_en || "",
              main_instruction_fr: item.main_instruction_fr || item.prompt || "",
              main_instruction_en: item.main_instruction_en || item.prompt || "",
              topic_bullets_fr: Array.isArray(item.topic_bullets_fr) && item.topic_bullets_fr.length > 0
                ? item.topic_bullets_fr
                : hintsArray,
              topic_bullets_en: Array.isArray(item.topic_bullets_en) && item.topic_bullets_en.length > 0
                ? item.topic_bullets_en
                : hintsArray,
              instruction_box_fr: item.instruction_box_fr || "Rédigez le document demandé",
              instruction_box_en: item.instruction_box_en || "Write the requested document",
              sample_answers_fr: Array.isArray(item.sample_answers_fr) ? item.sample_answers_fr
                : item.sampleAnswer ? [item.sampleAnswer] : [],
              sample_answers_en: Array.isArray(item.sample_answers_en) ? item.sample_answers_en : [],
              timeLimitSeconds: item.timeLimitSeconds || item.TimeLimitSeconds || 360,
              charLimit: imageCharacterLimit(item.maxHighlightChars ?? item.charLimit),
              level: item.level || item.Level || "",
            };
          });
        if (!cancelled) setQuestions(normalized);
      } catch (e) {
        if (!cancelled) console.error("WriteDocumentsPage load error:", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [levelParam, learningLang, knownLang, tag]);

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (evaluation || isSubmitting || !currentQ || !userAnswer.trim()) return;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentQ.id)) {
      setSubmissionError("This exercise must be saved before feedback is available.");
      return;
    }
    setSubmissionError(null);
    const result = await evaluate(currentQ.id, userAnswer);
    if (result && result.overall_score >= 70) setScore(s => s + 1);
  };

  const handleContinue = () => {
    resetEvaluation();
    if (currentIndex < questions.length - 1) {
      setUserAnswer("");
      setSubmissionError(null);
      setCurrentIndex(i => i + 1);
    } else {
      setIsCompleted(true);
    }
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
  const charCount = userAnswer.length;
  const charLimit = currentQ?.charLimit || 1000;

  const insertAccent = (char: string) => {
    const el = textareaRef.current;
    if (!el || isSubmitting || evaluation) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextValue = insertImageAccent(userAnswer, start, end, char, charLimit);
    if (nextValue === userAnswer) return;
    setUserAnswer(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + 1, start + 1);
    });
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Write Documents"
        instructionFr={currentQ.heading_fr || "Rédigez le document demandé"}
        instructionEn={currentQ.heading_en || "Write Documents"}
        localizedInstruction={currentQ.heading_fr || "Rédigez le document demandé"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userAnswer.trim().length > 10 && !evaluation && !isSubmitting}
        showSubmitButton={!evaluation}
        submitLabel={isSubmitting ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
        disableContentScroll
      >
        <PracticeTwoPanel className="flex-1 overflow-y-auto md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-4 md:overflow-hidden md:p-4">
          <TopicPromptPanel key={currentQ.id || currentIndex} task={currentQ} />
          <section className="flex min-h-[460px] min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:min-h-0" aria-label="Document answer">
            <AnswerInstruction key={currentQ.id || currentIndex} htmlFor="write-documents-answer"
              original={currentQ.instruction_box_fr} translation={currentQ.instruction_box_en} />
            <textarea
              key={currentIndex}
              id="write-documents-answer"
              ref={textareaRef}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (userAnswer.trim().length > 10) void handleSubmit();
                }
              }}
              placeholder="|"
              readOnly={Boolean(evaluation)}
              disabled={isSubmitting}
              maxLength={charLimit}
              autoFocus
              className={cn(
                "practice-type-content practice-comprehension-scroll min-h-[320px] w-full flex-1 resize-none md:min-h-0 overflow-y-auto rounded-[20px] border-2 border-slate-200 bg-white px-6 py-5 font-normal text-slate-900 outline-none transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                !evaluation && !isSubmitting && "focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30",
              )}
            />
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
              {!evaluation && (
                <SpecialCharacterKeyboard key={learningLang} learningLanguage={learningLang} onInsert={insertAccent} disabled={isSubmitting || charCount >= charLimit} className="min-w-0 flex-1" />
              )}
              <span aria-label={`${charCount} of ${charLimit} characters`} className={cn("text-base font-semibold tabular-nums", charCount >= charLimit * 0.9 ? "text-red-500" : "text-slate-500 dark:text-slate-400")}>{charCount}/{charLimit}</span>
            </div>
            {(submissionError || error) && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300">{submissionError || error}</p>
            )}
          </section>
        </PracticeTwoPanel>

        {evaluation && (
          <WriteDocumentsFeedbackResult
            evaluation={evaluation}
            userText={userAnswer}
            samples={currentQ.sample_answers_fr.length ? currentQ.sample_answers_fr : currentQ.sample_answers_en}
            sampleLanguage={currentQ.sample_answers_fr.length ? "French" : "English"}
            onContinue={handleContinue}
          />
        )}
      </PracticeGameLayout>
    </>
  );
}
