"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import NumberInputControls, { type NumberSettings } from "@/features/vocabulary/components/number-practice/NumberInputControls";
import NumberDisplayArea from "@/features/vocabulary/components/number-practice/NumberDisplayArea";
import ConstructedAnswerArea from "@/features/vocabulary/components/number-practice/ConstructedAnswerArea";
import WordBankArea from "@/features/vocabulary/components/number-practice/WordBankArea";
import { numberToFrench, numberToFrenchTokens } from "@/features/vocabulary/utils/numberToFrench";

const roundLength = 10;
const defaultMax = 9999;
const initialSettings: NumberSettings = { mode: "range", from: "0", to: String(defaultMax), exact: "" };

function randomInRange(settings: NumberSettings, previous: number | null = null): number {
  const from = settings.from === "" ? 0 : Number(settings.from);
  const to = settings.to === "" ? defaultMax : Number(settings.to);
  const min = Math.min(from, to);
  const max = Math.max(from, to);

  if (previous !== null && previous >= min && previous <= max && min < max) {
    const draw = min + Math.floor(Math.random() * (max - min));
    return draw >= previous ? draw + 1 : draw;
  }

  return min + Math.floor(Math.random() * (max - min + 1));
}

export default function NumberPracticePage() {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [rangeNumber, setRangeNumber] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentNumber = settings.mode === "range"
    ? rangeNumber
    : settings.exact === "" ? null : Number(settings.exact);
  const expected = currentNumber === null ? [] : numberToFrenchTokens(currentNumber);
  const isGameOver = currentIndex === roundLength;
  const { timerString, resetTimer } = useExerciseTimer({
    mode: "stopwatch",
    isPaused: currentNumber === null || result !== null || isGameOver,
  });

  useEffect(() => {
    const id = setTimeout(() => {
      const firstNumber = randomInRange(initialSettings);
      setRangeNumber((previous) => previous ?? firstNumber);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  function changeSettings(update: Partial<NumberSettings>) {
    setSettings((previous) => ({ ...previous, ...update }));
    if (update.exact !== undefined || (update.mode !== undefined && update.mode !== settings.mode)) {
      setSelectedWords([]);
    }
  }

  function drawRangeNumber() {
    setRangeNumber(randomInRange(settings, rangeNumber));
  }

  function handleNext() {
    if (result !== null) {
      if (settings.mode === "range" && currentIndex + 1 < roundLength) drawRangeNumber();
      setSelectedWords([]);
      setResult(null);
      setCurrentIndex(currentIndex + 1);
      return;
    }

    if (!expected.length || !selectedWords.length) return;
    const correct = expected.length === selectedWords.length &&
      expected.every((word, index) => word === selectedWords[index]);

    setResult(correct);
    if (correct) setScore((previous) => previous + 1);
  }

  function restart() {
    if (settings.mode === "range") drawRangeNumber();
    setSelectedWords([]);
    setResult(null);
    setCurrentIndex(0);
    setScore(0);
    resetTimer();
  }

  let submitLabel = "Check Answer";
  if (result !== null) submitLabel = currentIndex + 1 === roundLength ? "Finish" : "Continue";

  return (
    <PracticeGameLayout
      questionType="Number Practice"
      instructionFr="Construisez le nombre en sélectionnant les mots corrects"
      instructionEn="Build the number by selecting the correct words"
      currentQuestionIndex={currentIndex}
      totalQuestions={roundLength}
      timerValue={timerString}
      isGameOver={isGameOver}
      score={score}
      onExit={() => router.push("/vocabulary/lessons/activities")}
      onRestart={restart}
      onNext={handleNext}
      isSubmitEnabled={expected.length > 0 && selectedWords.length > 0}
      submitLabel={submitLabel}
      showFeedback={result !== null}
      isCorrect={result === true}
      feedbackMessage={result === true ? "Correct!" : "Not quite."}
      feedbackAppearance="soft"
      feedbackInFlow
      compactFeedback
      correctAnswer={result === false && currentNumber !== null ? numberToFrench(currentNumber) : undefined}
    >
      <div className="mx-auto grid w-full max-w-[100rem] items-start gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-10 xl:py-7">
        <div className="flex min-w-0 flex-col gap-7">
          <NumberInputControls
            settings={settings}
            onChange={changeSettings}
            onRandomize={() => {
              drawRangeNumber();
              setSelectedWords([]);
            }}
            disabled={result !== null}
          />
          <NumberDisplayArea number={currentNumber} />
          <div className="lg:mt-6 lg:px-3">
            <ConstructedAnswerArea
              selectedWords={selectedWords}
              expectedLength={expected.length}
              onRemoveWord={(index) => setSelectedWords((previous) => previous.filter((_, position) => position !== index))}
              onClear={() => setSelectedWords([])}
              result={result}
            />
          </div>
        </div>

        <WordBankArea disabled={!expected.length || result !== null} onWordSelect={(word) => setSelectedWords((previous) => [...previous, word])} />
      </div>
    </PracticeGameLayout>
  );
}
