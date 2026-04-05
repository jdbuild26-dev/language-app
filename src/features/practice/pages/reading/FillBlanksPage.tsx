"use client";

import React, { useEffect, useState } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { XCircle, Loader2, Languages } from "lucide-react";
import { fetchCompletePassageData } from "@/services/vocabularyApi";
import { loadMockCSV } from "@/utils/csvLoader";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import CustomSelect from "@/components/ui/CustomSelect";
import { useLanguage } from "@/contexts/LanguageContext";

type PassageSegment = string | { type: "blank"; id: number };
type BlankValue = { correct: string; options: string[] } | string;
type CompletePassageRow = {
  timeLimitSeconds?: number;
  passageSegments?: PassageSegment[];
  blanksData?: Record<string, BlankValue>;
  localizedInstruction?: string;
  instructionFr?: string;
  instructionEn?: string;
};
const PASSAGE_TEXT_CLASS = "practice-reading-passage-text";
const OPTION_TEXT_CLASS = "practice-reading-option-text";

export default function FillBlanksPage() {
  const handleExit = usePracticeExit();
  const { learningLang = "", knownLang = "" } = useLanguage() as {
    learningLang?: string;
    knownLang?: string;
  };

  const [passageSegments, setPassageSegments] = useState<PassageSegment[]>([]);
  const [blanksData, setBlanksData] = useState<Record<string, BlankValue>>({});
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(480);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<
    "success" | "error" | "partial"
  >("error");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const parseJsonIfString = (value: unknown, fallback: unknown) => {
    if (value == null || value === "") return fallback;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    }
    return value;
  };

  const normalizeOptions = (options: unknown) => {
    if (Array.isArray(options)) return options.filter(Boolean).map(String);
    if (typeof options === "string") {
      return options
        .split("|")
        .map((opt) => opt.trim())
        .filter(Boolean);
    }
    return [];
  };

  const normalizeRow = (row: unknown): CompletePassageRow | null => {
    if (!row || typeof row !== "object") return null;
    const source = row as Record<string, unknown>;
    const passageSegments = parseJsonIfString(
      source.passageSegments ??
        (source.content as Record<string, unknown> | undefined)
          ?.passageSegments,
      [],
    );
    const blanks = parseJsonIfString(
      source.blanksData ??
        (source.evaluation as Record<string, unknown> | undefined)
          ?.blanksData ??
        source.eval_blanksData,
      {},
    );
    return {
      passageSegments: Array.isArray(passageSegments)
        ? (passageSegments as PassageSegment[])
        : [],
      blanksData:
        blanks && typeof blanks === "object"
          ? (blanks as Record<string, BlankValue>)
          : {},
      localizedInstruction:
        typeof source.localizedInstruction === "string"
          ? source.localizedInstruction
          : undefined,
      instructionFr:
        typeof source.instructionFr === "string"
          ? source.instructionFr
          : undefined,
      instructionEn:
        typeof source.instructionEn === "string"
          ? source.instructionEn
          : undefined,
      timeLimitSeconds:
        typeof source.timeLimitSeconds === "number"
          ? source.timeLimitSeconds
          : undefined,
    };
  };

  const getFirstUsableRow = (payload: unknown) => {
    const candidates = Array.isArray(payload) ? payload : [payload];
    for (const candidate of candidates) {
      const normalized = normalizeRow(candidate);
      if (
        normalized &&
        normalized.passageSegments?.length &&
        normalized.blanksData &&
        Object.keys(normalized.blanksData).length > 0
      ) {
        return normalized;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      let data: unknown = null;
      try {
        data = await fetchCompletePassageData({ learningLang, knownLang });
      } catch {
        try {
          data = await loadMockCSV(
            "practice/reading/complete_passage_dropdown.csv",
            { learningLang, knownLang },
          );
        } catch {
          data = null;
        }
      }

      const usableRow = getFirstUsableRow(data);
      if (!usableRow) {
        setError("No data found for this practice item.");
      } else {
        setPassageSegments(usableRow.passageSegments || []);
        setBlanksData(usableRow.blanksData || {});
        setTimeLimitSeconds(usableRow.timeLimitSeconds || 480);
      }

      setLoading(false);
    };

    fetchData();
  }, [learningLang, knownLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const { timerString } = useExerciseTimer({
    duration: timeLimitSeconds,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) checkAnswers(true);
    },
    isPaused: showFeedback || isCompleted || loading,
  });

  const handleOptionSelect = (blankId: string, value: string) => {
    if (showFeedback) return;
    setAnswers((prev) => ({ ...prev, [String(blankId)]: value }));
  };

  const checkAnswers = (timeExpired = false) => {
    const keys = Object.keys(blanksData);
    if (keys.length === 0) return;

    let correctCount = 0;
    keys.forEach((key) => {
      const blank = blanksData[key];
      const correctVal =
        typeof blank === "object" && blank !== null
          ? blank.correct
          : String(blank);
      if (answers[String(key)] === correctVal) correctCount++;
    });

    const allCorrect = correctCount === keys.length;
    const hasSomeCorrect = correctCount > 0 && correctCount < keys.length;
    setScore(correctCount);
    setIsCorrect(allCorrect);
    setFeedbackTone(
      allCorrect ? "success" : hasSomeCorrect ? "partial" : "error",
    );
    setFeedbackMessage(
      allCorrect
        ? "Excellent! All answers are correct."
        : hasSomeCorrect
          ? `Partially correct: ${correctCount} out of ${keys.length}.`
          : timeExpired
            ? "Time's up!"
            : `You got ${correctCount} out of ${keys.length} correct.`,
    );
    setShowFeedback(true);
    if (allCorrect) setIsCompleted(true);
  };

  const handleSubmit = () => {
    if (!showFeedback) checkAnswers();
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setIsCompleted(true);
  };

  const totalBlanks = Object.keys(blanksData).length;
  const allAnswered = Object.keys(blanksData).every(
    (key) => answers[String(key)],
  );
  const progress = totalBlanks
    ? (Object.keys(answers).length / totalBlanks) * 100
    : 0;
  const answeredCount = Object.keys(answers).length;
  const displayQuestionNumber = Math.min(
    totalBlanks || 1,
    Math.max(answeredCount, 1),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Error Loading Practice
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType="Fill in the blanks - Passage"
        questionTypeFr="Complétez le passage"
        questionTypeEn="Complete the passage"
        localizedInstruction="Complétez le passage"
        instructionFr="Complétez le passage"
        instructionEn="Select the best option for each missing word"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={totalBlanks}
        currentQuestionIndex={0}
        questionCounterValue={displayQuestionNumber}
        feedbackTone={feedbackTone}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={showFeedback || allAnswered}
        showSubmitButton={true}
        submitLabel={showFeedback ? "FINISH" : "Submit Answer"}
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        correctAnswer={undefined}
      >
        <div
          className={cn(
            "practice-reading-page-shell grid grid-cols-1 md:grid-cols-10 md:items-stretch gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0",
          )}
        >
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
              <div className={PASSAGE_TEXT_CLASS}>
                {passageSegments.map((segment, index) => {
                  if (typeof segment === "string") {
                    return <span key={index}>{segment}</span>;
                  }

                  if (segment.type !== "blank") return null;

                  const id = segment.id;
                  const blankEntry = blanksData[String(id)];
                  if (!blankEntry) return null;
                  const correctValue =
                    typeof blankEntry === "object" && blankEntry !== null
                      ? blankEntry.correct
                      : String(blankEntry);
                  const userAnswer = answers[String(id)];
                  const isCorrectAnswer = userAnswer === correctValue;

                  return (
                    <span
                      key={index}
                      className="mx-1 inline-flex items-end gap-1.5 align-baseline"
                    >
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-7 h-7 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-bold text-slate-500",
                          showFeedback &&
                            isCorrectAnswer &&
                            "bg-green-100 border-green-400 text-green-700",
                          showFeedback &&
                            !isCorrectAnswer &&
                            "bg-red-100 border-red-400 text-red-700",
                        )}
                      >
                        {id}
                      </span>

                      <span
                        className={cn(
                          "items-end px-1 border-b-2 pb-0.5 text-lg md:text-xl font-semibold leading-none whitespace-nowrap",
                          userAnswer
                            ? "inline-flex min-w-9 md:min-w-[80px]"
                            : "inline-block w-14 md:w-[110px]",
                          !userAnswer && "text-slate-300",
                          !showFeedback &&
                            userAnswer &&
                            "text-blue-600 border-blue-300",
                          !showFeedback && !userAnswer && "border-slate-300",
                          showFeedback &&
                            isCorrectAnswer &&
                            "text-green-600 border-green-500",
                          showFeedback &&
                            !isCorrectAnswer &&
                            "text-red-600 border-red-500",
                        )}
                      >
                        {userAnswer || "\u00A0"}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="md:col-span-3 min-h-0 h-full self-stretch flex flex-col justify-start overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="p-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                <Languages className="w-5 h-5 text-blue-500 shrink-0" />
                Select the best option for each missing word
              </h2>

              <div className="space-y-3">
                {Object.keys(blanksData).map((key) => {
                  const blank = blanksData[key];
                  if (!blank) return null;

                  const id = parseInt(key, 10);
                  const userAnswer = answers[String(key)];
                  const correctValue =
                    typeof blank === "object" && blank !== null
                      ? blank.correct
                      : String(blank);
                  const isCorrectAnswer = userAnswer === correctValue;
                  const options = normalizeOptions(
                    typeof blank === "object" && blank !== null
                      ? blank.options
                      : [],
                  );

                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold border text-sm transition-colors",
                          userAnswer
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600",
                          showFeedback &&
                            isCorrectAnswer &&
                            "bg-green-500 border-green-500 text-white",
                          showFeedback &&
                            userAnswer &&
                            !isCorrectAnswer &&
                            "bg-red-500 border-red-500 text-white",
                        )}
                      >
                        {id}
                      </div>

                      <div className="flex-grow">
                        <CustomSelect
                          options={options}
                          value={userAnswer || ""}
                          onChange={(val: string) =>
                            handleOptionSelect(key, val)
                          }
                          placeholder="Select a word"
                          disabled={showFeedback}
                          isCorrect={showFeedback && isCorrectAnswer}
                          isWrong={showFeedback && !isCorrectAnswer}
                          feedbackMode={showFeedback}
                          correctValue={String(correctValue || "")}
                          className={cn(
                            "practice-reading-select",
                            OPTION_TEXT_CLASS,
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
