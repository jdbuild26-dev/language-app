"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { Loader2 } from "lucide-react";
import AudioPlayer from "@/features/vocabulary/components/shared/AudioPlayer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { cn } from "@/lib/utils";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useRouter } from "next/navigation";
import { useTranslateText } from "@/hooks/useTranslateText";
import SpecialCharacterKeyboard from "@/features/practice/components/SpecialCharacterKeyboard";
import { translateText } from "@/services/aiPracticeApi";
import { choiceSentence } from "../../lib/choiceSentence";

type Question = { id: string; fullSentence: string; fullSentenceEnglish: string; displaySentence: string; answer: string; answers: string[]; hints?: string[]; instruction: string };

export default function AudioFillBlankPage() {
  const router = useRouter();
  const { speak, isSpeaking } = useTextToSpeech();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [blankResults, setBlankResults] = useState<boolean[]>([]);

  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [clues, setClues] = useState<{ question: Question; values: string[]; error: boolean } | null>(null);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const activeInputIndex = useRef(0);

  // Timer Hook
  const { timerString, resetTimer } = useExerciseTimer({
    duration: 60,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) {
        handleSubmit();
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  // Initialize inputs when question changes
  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      const currentQ = questions[currentIndex];
      // Reset the blanks when the exercise advances to another question.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserInputs(new Array(currentQ.answers.length).fill(""));
      setBlankResults([]);
      inputsRef.current = inputsRef.current.slice(0, currentQ.answers.length);
    }
  }, [currentIndex, questions, isCompleted]);

  // Audio Auto-play
  useEffect(() => {
    if (!loading && !isCompleted && questions.length > 0) {
      const currentQ = questions[currentIndex];
      if (currentQ?.fullSentence) {
        const t = setTimeout(() => {
          speak(currentQ.fullSentence, "fr-FR", 0.85);
        }, 800);
        return () => clearTimeout(t);
      }
    }
    // Replay only when the question changes, not when the speech engine loads voices.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, loading, isCompleted, questions]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetchPracticeQuestions("B5_Fill blanks_Audio");
      if (response && response.data) {
        const transformed = response.data.map((item) => {
          // Handle both nested structure (from vocabularyApi transformer) and flat structure
          const content = item.content || item;
          const answer = item.evaluation?.correctAnswer || content["CorrectAnswer"] || "";
          const answers = Array.isArray(answer) ? answer.map(String) : String(answer).split("|").map(word => word.trim());

          return {
            id: item.external_id || item["ExerciseID"],
            fullSentence: content["CompleteSentence"] || content["Audio"],
            fullSentenceEnglish: content["CompleteSentence_EN"] || content["Sentence_EN"] || "",
            displaySentence: content["SentenceWithBlank"],
            answer: answers.join(", "),
            answers,
            hints: Array.isArray(content.hints) ? content.hints.map(String) : typeof content.hints === "string" ? content.hints.split("|") : answers.map(answer => {
              const optionIndex = [1, 2, 3, 4].find(index => content[`Option${index}`] === answer);
              return optionIndex ? String(content[`Option${optionIndex}_EN`] || "") : "";
            }),
            instruction:
              item.instruction_en ||
              item["Instruction_EN"] ||
              "Listen and complete the sentence",
          };
        });
        setQuestions(transformed);
      }
    } catch (err) {
      console.error(`[AudioFillBlank] ❌ Failed to load:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch the questions when this exercise mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const handleInputChange = (index, value) => {
    if (showFeedback) return;

    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const insertCharacter = (character: string) => {
    if (showFeedback) return;
    const index = activeInputIndex.current;
    const input = inputsRef.current[index];
    if (!input) return;

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    const nextInputs = [...userInputs];
    nextInputs[index] = input.value.slice(0, start) + character + input.value.slice(end);
    setUserInputs(nextInputs);
    requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
      input.setSelectionRange(start + character.length, start + character.length);
    });
  };

  const handleKeyDown = (index, e) => {
    if (showFeedback) return;

    if (e.key === "Enter") {
      e.preventDefault();
      if (index < userInputs.length - 1) inputsRef.current[index + 1]?.focus();
      else if (userInputs.every(value => value.trim())) handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const currentQ = questions[currentIndex];
    const normalize = value => value.trim().toUpperCase().replace(/[^A-Z0-9\u00C0-\u00FF]/g, "");
    const results = currentQ.answers.map((answer, index) => normalize(userInputs[index] || "") === normalize(answer));
    const correct = results.every(Boolean);
    setBlankResults(results);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((s) => s + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    answerTranslation.reset();
    setUserInputs([]);
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const currentQ = questions[currentIndex];
  const sentence = choiceSentence(currentQ?.displaySentence || "", currentQ?.answers || [],
    (currentQ?.answers || []).map((text, index) => ({ text, en: currentQ?.hints?.[index] })));
  useEffect(() => {
    if (!currentQ) return;
    const stored = choiceSentence(currentQ.displaySentence, currentQ.answers,
      currentQ.answers.map((text, index) => ({ text, en: currentQ.hints?.[index] }))).hints;
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 10000);
    void Promise.all(stored.map(async (hint, index) => {
      if (hint) return hint;
      const result = await translateText(currentQ.answers[index], "en", controller.signal);
      if (!result.translation?.trim()) throw new Error("Clue unavailable");
      return result.translation.trim();
    })).then(values => {
      if (active) setClues({ question: currentQ, values, error: false });
    }).catch(() => {
      if (active) setClues({ question: currentQ, values: stored, error: true });
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [currentQ]);
  const currentClues = clues?.question === currentQ ? clues : null;
  const answerTranslation = useTranslateText(currentQ?.fullSentence || "", "fr", currentQ?.fullSentenceEnglish);
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  return (
    <>
      <PracticeGameLayout
        questionTypeFr="Remplissez les blancs"
        questionTypeEn="Fill in the blank (Audio)"
        instructionFr="Écoutez et complétez la phrase"
        instructionEn={
          currentQ?.instruction || "Listen and complete the sentence"
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => router.push("/vocabulary/practice")}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={
          (userInputs.length > 0 &&
            userInputs.every((i) => i.trim() !== "") &&
            !showFeedback) ||
          showFeedback
        }
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : "CHECK"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={!isCorrect && currentQ ? currentQ.answer : null}
        feedbackMessage={feedbackMessage}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-10">
          <div className="flex justify-center">
            <AudioPlayer key={currentIndex} text={currentQ?.fullSentence || ""} showTurtle externalPlaying={isSpeaking} />
          </div>

          <div className="practice-type-content w-full text-center font-normal !leading-[2.6] text-gray-800 dark:text-gray-100">
            {sentence.parts.map((part, i, arr) => (
              <React.Fragment key={i}>
                <span className="leading-loose">{part}</span>
                {i < arr.length - 1 && (
                    <input
                      ref={element => { inputsRef.current[i] = element; }}
                      type="text"
                      aria-label={`Missing word ${i + 1}`}
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={userInputs[i] || ""}
                      placeholder={showFeedback ? "" : sentence.hints[i] || currentClues?.values[i] || (!currentClues ? "…" : "")}
                      onChange={event => handleInputChange(i, event.target.value)}
                      onFocus={() => { activeInputIndex.current = i; }}
                      onKeyDown={event => handleKeyDown(i, event)}
                      disabled={showFeedback}
                      style={{ width: `${Math.max(10, (currentQ.answers[i]?.length || 0) + 2, (currentClues?.values[i]?.length || sentence.hints[i]?.length || 0) + 2)}ch` }}
                      className={cn(
                        "practice-type-content mx-1.5 inline-block min-h-12 max-w-[min(70vw,22rem)] rounded-xl border-2 bg-white px-3 py-2 text-center align-middle font-normal placeholder:text-slate-400 shadow-sm outline-none transition-[border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 sm:mx-2 dark:bg-slate-800 dark:focus-visible:ring-offset-slate-950",
                        showFeedback
                          ? blankResults[i] ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300" : "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                          : "border-slate-300 text-slate-800 focus:border-sky-500 dark:border-slate-600 dark:text-slate-100",
                      )}
                    />
                )}
              </React.Fragment>
            ))}
          </div>
          {!showFeedback && (
            <SpecialCharacterKeyboard
              learningLanguage="fr"
              onInsert={insertCharacter}
              className="!max-w-none justify-center [&_button]:h-11 [&_button]:w-11 [&_button]:shrink-0"
            />
          )}
          {!showFeedback && currentClues?.error && <p role="status" className="text-sm text-slate-500">English clues are unavailable. You can still answer using the audio.</p>}
          {showFeedback && currentQ?.fullSentence && (
            <div className="max-w-full text-center">
              <div className="practice-type-content flex flex-wrap items-center justify-center gap-3 font-normal text-green-700 dark:text-green-400">
                <span lang={answerTranslation.showTranslation ? "en" : "fr"}>{answerTranslation.displayText}</span>
                <TranslateButton
                  className="h-12 w-12 [&_svg]:h-7 [&_svg]:w-7"
                  aria-label={answerTranslation.showTranslation ? "Show French answer" : "Show English answer"}
                  aria-pressed={answerTranslation.showTranslation}
                  isLoading={answerTranslation.isTranslating}
                  onClick={answerTranslation.toggle}
                />
              </div>
              {answerTranslation.error && <p role="status" className="mt-2 text-base text-red-700 dark:text-red-400">{answerTranslation.error}</p>}
            </div>
          )}
        </div>
      </PracticeGameLayout>
    </>
  );
}
