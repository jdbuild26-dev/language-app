"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

const parseWords = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];
  if (value.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // Pipe-separated values are used by the French practice CSV.
    }
  }
  return value.split("|").map((word) => word.trim()).filter(Boolean);
};

type OddOneOutWord = { text: string; en: string };
type OddOneOutQuestion = {
  id: string;
  words: OddOneOutWord[];
  correctAnswer: string;
  reason: string;
  instructionFr: string;
  instructionEn: string;
  localizedInstruction: string;
  type: string;
};

const loadFrenchTranslations = async (): Promise<Map<string, string[]>> => {
  const response = await fetch("/mock-data/csv/odd_one_out_fr.csv");
  if (!response.ok) return new Map();

  const Papa = await import("papaparse");
  const { data } = Papa.parse(
    await response.text(),
    { header: true, skipEmptyLines: true },
  );
  return new Map<string, string[]>(
    (data as Array<{ words: string; words_EN: string }>).map((row): [string, string[]] => [
      parseWords(row.words).join("|"),
      parseWords(row.words_EN),
    ]),
  );
};

export default function OddOneOutGamePage() {
  const router = useRouter();
  const { speak } = useTextToSpeech();
  const { learningLang, knownLang } = useLanguage();
  const [questions, setQuestions] = useState<OddOneOutQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<OddOneOutWord | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [translatedWords, setTranslatedWords] = useState<Set<number>>(new Set());

  // Timer Hook
  const { timerString, resetTimer } = useExerciseTimer({
    duration: 30,
    mode: "timer",
    onExpire: () => {
      if (!isSubmitted && !showFeedback && !isGameOver) {
        setIsSubmitted(true);
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isSubmitted || showFeedback || isGameOver,
  });

  const loadQuestions = useCallback(async () => {
    try {
      console.log(
        `[OddOneOut] 📡 Fetching data from backend (slug: odd_one_out)...`,
      );
      const response = await fetchPracticeQuestions("odd_one_out", {
        learningLang,
        knownLang,
      });
      if (response && response.data) {
        console.log(`[OddOneOut] ✅ Loaded ${response.data.length} questions`, {
          sample: response.data[0],
        });
        let localTranslations = new Map<string, string[]>();
        try {
          localTranslations = await loadFrenchTranslations();
        } catch (translationError) {
          console.warn("[OddOneOut] Local translations unavailable:", translationError);
        }
        const normalized = response.data
          .filter(
            (item) =>
              (item.words || item.content?.words || item.Option1) &&
              (item.words || item.content?.words || item.Option1) !== "None",
          )
          .map((item) => {
            const wordsArray = parseWords(item.words || item.content?.words);
            const optionWords = [item.Option1, item.Option2, item.Option3, item.Option4].filter(Boolean);
            const displayedWords = wordsArray.length ? wordsArray : optionWords;
            const translatedWordsArray = parseWords(item.words_EN || item.content?.words_EN);
            const localWords = localTranslations.get(displayedWords.join("|")) || [];
            const optionTranslations = [
              item.Option1_EN || item.content?.Option1_EN,
              item.Option2_EN || item.content?.Option2_EN,
              item.Option3_EN || item.content?.Option3_EN,
              item.Option4_EN || item.content?.Option4_EN,
            ];

            return {
              id: item.id || item.ExerciseID,
              words: displayedWords.map((text, i) => ({
                text,
                en: translatedWordsArray[i] ||
                  (optionTranslations[i] && optionTranslations[i] !== text ? optionTranslations[i] : "") ||
                  localWords[i] ||
                  "",
              })),
              correctAnswer:
                item.correctword ||
                item.CorrectAnswer ||
                item.Answer ||
                item.correctAnswer ||
                item.evaluation?.correctAnswer ||
                item.content?.correctAnswer,
              reason:
                item.CorrectExplanation_EN ||
                item.Reason ||
                item.Explanation ||
                item.reason ||
                item.evaluation?.reason ||
                item.content?.reason ||
                "",
              instructionFr: item.Instruction_FR || "Trouvez l'intrus",
              instructionEn: item.Instruction_EN || "Select the odd one out",
              localizedInstruction:
                item.localizedInstruction ||
                item.Instruction_EN ||
                "Select the odd one out",
              type: "Odd One Out",
            };
          });
        setQuestions(normalized);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error("[OddOneOut] ❌ Failed to load:", err);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }, [learningLang, knownLang]);

  useEffect(() => {
    // Loading questions updates state only after the remote request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleWordClick = (wordObj: OddOneOutWord) => {
    if (isSubmitted) return;
    speak(wordObj.text, "fr-FR");
    setSelectedWord(wordObj);
  };

  const handleSubmit = () => {
    if (isSubmitted) {
      // Next Logic
      setShowFeedback(false);
      setTranslatedWords(new Set());
      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedWord(null);
        setIsSubmitted(false);
      } else {
        setIsGameOver(true);
      }
      return;
    }

    // Submit Logic
    if (!selectedWord) return;
    setIsSubmitted(true);

    const correct = selectedWord.text === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const getWordStyle = (wordObj: OddOneOutWord) => {
    const baseStyle =
      "relative flex h-32 w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-solid px-11 transition-all duration-200 md:h-40";

    if (!isSubmitted) {
      // Normal Selection
      if (selectedWord && wordObj.text === selectedWord.text) {
        return `${baseStyle} bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500`;
      }
      return `${baseStyle} bg-white dark:bg-gray-800 border-slate-300 dark:border-slate-600 hover:border-purple-400 hover:shadow-md cursor-pointer text-gray-700 dark:text-gray-200`;
    }

    // Result Logic
    if (wordObj.text === currentQuestion.correctAnswer) {
      // Always show correct
      return `${baseStyle} bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300`;
    }

    if (
      selectedWord &&
      wordObj.text === selectedWord.text &&
      wordObj.text !== currentQuestion.correctAnswer
    ) {
      // Wrong selection
      return `${baseStyle} bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300`;
    }

    return `${baseStyle} bg-gray-50 dark:bg-gray-800/50 border-slate-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 opacity-80`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  if (error || questions.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "No questions found for this activity."}
      </div>
    );

  return (
    <div className="[--practice-font-exercise-heading:24px] [--practice-font-content:21px]">
      <PracticeGameLayout
        questionType={currentQuestion.type || "Odd One Out"}
        instructionFr={currentQuestion.instructionFr || "Trouvez l'intrus"}
        instructionEn={
          currentQuestion.instructionEn || "Select the odd one out"
        }
        localizedInstruction={currentQuestion.localizedInstruction}
        progress={progress}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={totalQuestions}
        onExit={() => router.push("/vocabulary/practice")}
        onNext={showFeedback ? handleSubmit : handleSubmit} // handleSubmit handles both submit and continue logic
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!!selectedWord || showFeedback}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === totalQuestions
              ? "FINISH"
              : "CONTINUE"
            : "CHECK"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
        feedbackMessage={feedbackMessage}
        feedbackInFlow
        feedbackChildren={
          <div className="w-full rounded-xl bg-white/15 px-4 py-3 text-white sm:px-5">
            <p className="font-semibold">Explanation</p>
            <p className="mt-1">{currentQuestion.reason || `${currentQuestion.correctAnswer} is the odd one out.`}</p>
          </div>
        }
      >
        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          {/* Grid */}
          <div className="grid w-full max-w-5xl grid-cols-2 gap-4 px-4 sm:gap-6 md:gap-10">
            {currentQuestion.words.map((wordObj, idx) => (
              <div key={idx} className="relative">
                <button
                  type="button"
                  onClick={() => handleWordClick(wordObj)}
                  disabled={isSubmitted}
                  aria-pressed={selectedWord === wordObj}
                  className={getWordStyle(wordObj)}
                >
                  <span className="practice-type-content break-words text-center font-medium">
                    {translatedWords.has(idx) && wordObj.en ? wordObj.en : wordObj.text}
                  </span>
                  {isSubmitted && wordObj.text === currentQuestion.correctAnswer && (
                    <CheckCircle aria-label="Correct answer" className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                  )}
                  {isSubmitted && selectedWord === wordObj && wordObj.text !== currentQuestion.correctAnswer && (
                    <XCircle aria-label="Incorrect answer" className="absolute left-3 top-3 h-5 w-5 text-red-600" />
                  )}
                </button>
                {isSubmitted && (
                  <TranslateButton
                    iconVariant="option"
                    className="absolute right-2 top-2 z-10"
                    disabled={!wordObj.en}
                    title={wordObj.en ? "Toggle translation" : "Translation unavailable"}
                    aria-label={wordObj.en ? `Translate ${wordObj.text}` : `Translation unavailable for ${wordObj.text}`}
                    aria-pressed={wordObj.en ? translatedWords.has(idx) : undefined}
                    onClick={() => setTranslatedWords((previous) => {
                      const next = new Set(previous);
                      if (next.has(idx)) next.delete(idx);
                      else next.add(idx);
                      return next;
                    })}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </PracticeGameLayout>
    </div>
  );
}
