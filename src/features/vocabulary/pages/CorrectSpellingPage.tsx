"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { fetchVocabulary } from "@/services/vocabularyApi";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import AccentKeyboard from "@/components/ui/AccentKeyboard";
import { Button } from "@/components/ui/button";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { prepareSpellingWords, type PreparedSpellingWord } from "@/features/vocabulary/lib/spellingWords";

type AnswerStatus = "idle" | "correct" | "incorrect";

export default function CorrectSpellingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [words, setWords] = useState<PreparedSpellingWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState<AnswerStatus>("idle");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFrenchPrompt, setShowFrenchPrompt] = useState(false);

  const { timerString, resetTimer } = useExerciseTimer({
    mode: "stopwatch",
    onExpire: undefined,
    isPaused: loading || isCompleted || status !== "idle",
  });

  const loadWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVocabulary();
      const spellingWords = prepareSpellingWords(Array.isArray(data.words) ? data.words : []);
      if (spellingWords.length === 0) {
        setError("No spelling words are available. Please check the vocabulary data.");
        return;
      }
      setWords([...spellingWords].sort(() => Math.random() - 0.5).slice(0, 10));
      setCurrentIndex(0);
      setUserInput("");
      setStatus("idle");
      setScore(0);
      setIsCompleted(false);
      setShowFrenchPrompt(false);
      resetTimer();
    } catch (err) {
      setError("Failed to load vocabulary");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [resetTimer]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadWords(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadWords]);

  useEffect(() => {
    if (!loading && !isCompleted) inputRef.current?.focus();
  }, [loading, currentIndex, isCompleted]);

  const currentWord = words[currentIndex];

  const handleSubmit = () => {
    if (!currentWord || !userInput.trim() || status !== "idle") return;
    const normalize = (value: string) => value.trim().normalize("NFC").toLocaleLowerCase();
    const isCorrect = currentWord.forms.some((form) => normalize(form.word || "") === normalize(userInput));
    setStatus(isCorrect ? "correct" : "incorrect");
    if (isCorrect) setScore((previous) => previous + 1);
  };

  const handleContinue = () => {
    if (currentIndex === words.length - 1) {
      setIsCompleted(true);
      return;
    }
    setUserInput("");
    setStatus("idle");
    setShowFrenchPrompt(false);
    setCurrentIndex((previous) => previous + 1);
    resetTimer();
  };

  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center">Loading spelling words…</div>;
  }

  if (error || !currentWord) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-700 dark:text-red-400">{error || "No spelling words are available."}</p>
        <Button onClick={loadWords} variant="outline">Retry</Button>
      </div>
    );
  }

  const displayWrong = currentWord.wrongSpelling.split(",").map((value) => value.trim()).find(Boolean) || "";
  const meaning = currentWord.exampleNative?.trim() || currentWord.english;
  const correctSpelling = currentWord.forms[0].word;
  const hasSubmitted = status !== "idle";
  const hasPromptTranslation = Boolean(currentWord.exampleNative?.trim() && currentWord.exampleTarget?.trim());

  return (
    <PracticeGameLayout
      questionType="Spell the word"
      instructionFr="Épelez le mot"
      instructionEn="Type the missing words"
      localizedInstruction="Type the missing words"
      progress={((currentIndex + 1) / words.length) * 100}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={words.length}
      onExit={() => router.push("/vocabulary/practice")}
      onNext={hasSubmitted ? handleContinue : handleSubmit}
      onRestart={loadWords}
      isSubmitEnabled={hasSubmitted || Boolean(userInput.trim())}
      submitLabel={hasSubmitted ? currentIndex === words.length - 1 ? "FINISH" : "CONTINUE" : "SUBMIT ANSWER"}
      timerValue={timerString}
      showFeedback={hasSubmitted}
      isCorrect={status === "correct"}
      feedbackMessage={status === "correct" ? "Correct" : "Incorrect"}
      feedbackInFlow
    >
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-4 py-10 text-center sm:gap-10">
        <div className="flex flex-col items-center gap-3">
          <div className="flex max-w-full items-start justify-center gap-1">
            <p lang={showFrenchPrompt ? "fr" : "en"} className="practice-type-content font-medium text-slate-800 dark:text-slate-100">
              {showFrenchPrompt ? currentWord.exampleTarget : meaning}
            </p>
            {hasPromptTranslation && (
              <TranslateButton
                aria-label={showFrenchPrompt ? "Show English example" : "Translate example into French"}
                aria-pressed={showFrenchPrompt}
                onClick={() => setShowFrenchPrompt((previous) => !previous)}
              />
            )}
          </div>
          {currentWord.forms[0].gender && (
            <span className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              currentWord.forms[0].gender.includes("Masculine")
                ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                : currentWord.forms[0].gender.includes("Feminine")
                  ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
            )}>{currentWord.forms[0].gender}</span>
          )}
        </div>

        <p className="practice-type-content font-normal text-slate-900 line-through dark:text-white">{displayWrong}</p>

        {hasSubmitted ? (
          <div
            role="status"
            aria-label={status === "correct" ? `Correct spelling: ${userInput.trim()}` : `Your spelling: ${userInput.trim()}. Correct spelling: ${correctSpelling}`}
            className="flex min-h-16 w-full max-w-md flex-wrap items-stretch justify-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 p-2 practice-type-content font-normal dark:border-slate-700 dark:bg-slate-800"
          >
            <span className={cn(
              "flex min-h-12 min-w-28 flex-1 items-center justify-center rounded-lg border px-3 py-1",
              status === "correct"
                ? "border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/40 dark:text-green-200"
                : "border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200",
            )}>{userInput.trim()}</span>
            {status === "incorrect" && (
              <span className="flex min-h-12 min-w-28 flex-1 items-center justify-center rounded-lg border border-green-300 bg-green-100 px-3 py-1 text-green-800 dark:border-green-700 dark:bg-green-900/40 dark:text-green-200">
                {correctSpelling}
              </span>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") handleSubmit(); }}
            aria-label="Correct spelling"
            placeholder="|"
            className="h-16 w-full max-w-80 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-center practice-type-content font-normal text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        )}

        {!hasSubmitted && <AccentKeyboard onAccentClick={(character) => {
          setUserInput((previous) => previous + character);
          inputRef.current?.focus();
        }} />}
      </div>
    </PracticeGameLayout>
  );
}
