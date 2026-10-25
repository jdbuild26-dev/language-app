"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import PracticeOptionCard from "@/components/ui/PracticeOptionCard";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { translateText } from "@/services/aiPracticeApi";
import { loadGroupTranslationRows, parseGroupWords, withGroupTranslations } from "../lib/groupWordsTranslations";

type GroupWord = { text: string; translation?: string; isAnswer: boolean };
type GroupQuestion = {
  id: string;
  instructionFr: string;
  instructionEn: string;
  words: GroupWord[];
  reason: string;
};

const GROUP_SIZE = 4;

function shuffleWords(words: GroupWord[]): GroupWord[] {
  const shuffled = [...words];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export default function GroupWordsGamePage() {
  const router = useRouter();
  const { learningLang, knownLang } = useLanguage();
  const { speak, cancel } = useTextToSpeech();
  const [questions, setQuestions] = useState<GroupQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [translatedIndices, setTranslatedIndices] = useState<Set<number>>(new Set());
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});
  const [translationErrors, setTranslationErrors] = useState<Record<string, string>>({});
  const pendingTranslations = useRef(new Map<string, AbortController>());
  const translationGeneration = useRef(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const { timerString, resetTimer } = useExerciseTimer({
    duration: 60,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isGameOver) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: showFeedback || isGameOver,
  });

  useEffect(() => {
    let active = true;
    fetchPracticeQuestions("group_words", { learningLang, knownLang })
      .then(async (response) => {
        const localRows = learningLang.toLowerCase() === "fr" && knownLang.toLowerCase() === "en"
          ? await loadGroupTranslationRows().catch(() => [])
          : [];
        if (!active) return;
        const normalized: GroupQuestion[] = withGroupTranslations(response?.data || [], localRows, learningLang, knownLang)
          .map((item: Record<string, unknown>) => {
            const answers = parseGroupWords(item.correctGroup ?? item.CorrectGroup ?? item.CorrectAnswer);
            const distractors = parseGroupWords(item.otherWords ?? item.OtherWords ?? item.Options);
            const answerTranslations = parseGroupWords(item.correctGroup_EN ?? item.CorrectGroup_EN, true);
            const distractorTranslations = parseGroupWords(item.otherWords_EN ?? item.OtherWords_EN, true);
            const answerWords: GroupWord[] = answers.map((word, index) => ({
              text: word,
              translation: answerTranslations[index],
              isAnswer: true,
            }));
            const otherWords: GroupWord[] = distractors
              .map((word, index) => ({
                text: word,
                translation: distractorTranslations[index],
                isAnswer: false,
              }))
              .filter((word) => !answers.includes(word.text))
              .slice(0, GROUP_SIZE);
            if (
              answerWords.length !== GROUP_SIZE ||
              otherWords.length !== GROUP_SIZE ||
              new Set([...answerWords, ...otherWords].map((word) => word.text)).size !== GROUP_SIZE * 2
            ) return null;
            return {
              id: String(item.id ?? item.ExerciseID ?? ""),
              instructionFr: String(item.Instruction_FR ?? item.instructionFr ?? "Sélectionnez les 4 mots liés"),
              instructionEn: String(item.Instruction_EN ?? item.instructionEn ?? "Select the 4 related words"),
              words: shuffleWords([...answerWords, ...otherWords]),
              reason: String(item.explanation ?? item.Reason ?? item.Explanation ?? ""),
            };
          })
          .filter((question: GroupQuestion | null): question is GroupQuestion => question !== null);
        setQuestions(normalized);
        setError(null);
        setCurrentIndex(0);
        setSelectedIndices([]);
        setTranslatedIndices(new Set());
        setShowFeedback(false);
        setScore(0);
        setIsGameOver(false);
      })
      .catch((cause) => {
        if (!active) return;
        console.error("Failed to load group words:", cause);
        setError("Failed to load questions.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [learningLang, knownLang]);

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  useEffect(() => {
    cancel();
  }, [currentIndex, learningLang, knownLang, showFeedback, isGameOver, cancel]);

  useEffect(() => {
    const pending = pendingTranslations.current;
    return () => {
      translationGeneration.current += 1;
      pending.forEach((controller) => controller.abort());
      pending.clear();
    };
  }, [learningLang, knownLang]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  function translationKey(word: GroupWord) {
    return JSON.stringify([learningLang, knownLang, word.text]);
  }

  async function toggleWordTranslation(word: GroupWord, index: number) {
    if (!showFeedback) return;
    const key = translationKey(word);
    if (translatedIndices.has(index)) {
      setTranslatedIndices((previous) => {
        const next = new Set(previous);
        next.delete(index);
        return next;
      });
      return;
    }
    if (word.translation || translationCache[key]) {
      setTranslatedIndices((previous) => new Set(previous).add(index));
      return;
    }
    if (pendingTranslations.current.has(key)) return;
    const generation = translationGeneration.current;
    const controller = new AbortController();
    pendingTranslations.current.set(key, controller);
    const timeout = setTimeout(() => controller.abort(), 12000);
    setTranslationErrors((previous) => ({ ...previous, [key]: "" }));
    try {
      const result = await translateText(word.text, knownLang.toLowerCase() || "en", controller.signal);
      if (generation !== translationGeneration.current) return;
      const translation = result.translation?.trim();
      if (!translation) throw new Error("Translation unavailable");
      setTranslationCache((previous) => ({ ...previous, [key]: translation }));
      setTranslatedIndices((previous) => new Set(previous).add(index));
    } catch {
      if (generation === translationGeneration.current) {
        setTranslationErrors((previous) => ({ ...previous, [key]: "Translation unavailable. Try again." }));
      }
    } finally {
      clearTimeout(timeout);
      if (pendingTranslations.current.get(key) === controller) pendingTranslations.current.delete(key);
    }
  }

  function selectWord(index: number) {
    if (showFeedback) return;
    speak(currentQuestion.words[index].text, learningLang.toLowerCase() === "fr" ? "fr-FR" : learningLang, 1);
    setSelectedIndices((previous) =>
      previous.includes(index)
        ? previous.filter((selected) => selected !== index)
        : previous.length < GROUP_SIZE ? [...previous, index] : previous,
    );
  }

  function submitOrContinue() {
    if (showFeedback) {
      translationGeneration.current += 1;
      pendingTranslations.current.forEach((controller) => controller.abort());
      pendingTranslations.current.clear();
      setTranslationErrors({});
      if (currentIndex + 1 === totalQuestions) {
        setIsGameOver(true);
      } else {
        setCurrentIndex((previous) => previous + 1);
        setSelectedIndices([]);
        setTranslatedIndices(new Set());
        setShowFeedback(false);
      }
      return;
    }
    if (selectedIndices.length !== GROUP_SIZE) return;
    const correct = selectedIndices.every((index) => currentQuestion.words[index].isAnswer);
    setIsCorrect(correct);
    setFeedbackMessage(correct ? "Great job!" : "Some selected words do not belong in this group.");
    setShowFeedback(true);
    if (correct) setScore((previous) => previous + 1);
  }

  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }
  if (error || totalQuestions === 0) {
    return <div className="flex min-h-dvh items-center justify-center px-4 text-center text-red-600">{error || "No questions found for this activity."}</div>;
  }

  return (
    <PracticeGameLayout
      questionType="Group Words"
      instructionFr={currentQuestion.instructionFr}
      instructionEn={currentQuestion.instructionEn}
      progress={((currentIndex + 1) / totalQuestions) * 100}
      isGameOver={isGameOver}
      score={score}
      totalQuestions={totalQuestions}
      onExit={() => router.push("/vocabulary/practice")}
      onNext={submitOrContinue}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={selectedIndices.length === GROUP_SIZE || showFeedback}
      submitLabel={showFeedback ? currentIndex + 1 === totalQuestions ? "FINISH" : "CONTINUE" : "CHECK"}
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackMessage={feedbackMessage}
      correctAnswer={!isCorrect ? currentQuestion.words.filter((word) => word.isAnswer).map((word) => word.text).join(", ") : null}
      feedbackChildren={currentQuestion.reason ? <p>{currentQuestion.reason}</p> : null}
      compactFeedback
      preserveFooterHeightOnFeedback
    >
      <div className="flex w-full flex-1 items-center justify-center px-4 py-6 sm:px-6">
        <div className="grid w-full max-w-5xl grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-8">
          {currentQuestion.words.map((word, index) => {
            const selected = selectedIndices.includes(index);
            const translated = translatedIndices.has(index);
            const key = translationKey(word);
            const translation = word.translation || translationCache[key];
            return (
              <div key={`${currentQuestion.id}-${index}`} className="relative min-w-0">
                <PracticeOptionCard
                  selected={selected}
                  correct={word.isAnswer}
                  submitted={showFeedback}
                  onSelect={() => selectWord(index)}
                  className="aspect-square"
                  action={showFeedback && (
                    <TranslateButton
                      iconVariant="option"
                      aria-label={translated ? `Show ${word.text}` : `Translate ${word.text}`}
                      aria-pressed={translated}
                      onClick={() => void toggleWordTranslation(word, index)}
                    />
                  )}
                >
                  <span className="break-words">{translated && translation ? translation : word.text}</span>
                </PracticeOptionCard>
                {showFeedback && translationErrors[key] && (
                  <p role="status" className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">{translationErrors[key]}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
