"use client";

import { useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { ImageOff, Mars, Sparkles, Venus } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";

const genderChoices = [
  { gender: "masculine", label: "Masculine", icon: Mars, colors: "from-sky-400 to-blue-500 border-blue-600" },
  { gender: "feminine", label: "Feminine", icon: Venus, colors: "from-pink-400 to-rose-500 border-rose-600" },
] as const;

type Gender = (typeof genderChoices)[number]["gender"];

export type GenderCard = {
  word: string;
  translation: string;
  gender: Gender;
  image?: string;
};

export default function GenderIdentifierGame({
  cards,
  onExit,
  onRestart,
}: {
  cards: GenderCard[];
  onExit: () => void;
  onRestart: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [wrongGender, setWrongGender] = useState<Gender | null>(null);
  const [translated, setTranslated] = useState(false);
  const [failedImageIndex, setFailedImageIndex] = useState<number | null>(null);
  const shake = useAnimationControls();
  const reduceMotion = useReducedMotion();
  const card = cards[currentIndex];
  const { timerString } = useExerciseTimer({ mode: "stopwatch", isPaused: !card });

  if (!card) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-sky-500" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Magnifique !</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">You've completed the Gender Identifier activity.</p>
          <dl className="my-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              <dt>Correct</dt>
              <dd className="text-2xl font-bold">{currentIndex}</dd>
            </div>
            <div className="rounded-xl bg-rose-50 p-4 text-rose-800 dark:bg-rose-950 dark:text-rose-200">
              <dt>Incorrect attempts</dt>
              <dd className="text-2xl font-bold">{incorrectAttempts}</dd>
            </div>
          </dl>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onExit} className="rounded-xl border border-slate-300 px-4 py-3 font-semibold dark:border-slate-600">Exit</button>
            <button type="button" onClick={onRestart} className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">Play Again</button>
          </div>
        </section>
      </div>
    );
  }

  function handleGuess(gender: Gender) {
    if (gender === cards[currentIndex]?.gender) {
      shake.stop();
      shake.set({ x: 0 });
      setWrongGender(null);
      setTranslated(false);
      setCurrentIndex(currentIndex + 1);
      return;
    }

    setIncorrectAttempts((attempts) => attempts + 1);
    setWrongGender(gender);
    if (!reduceMotion) {
      void shake.start({
        x: [0, -10, 10, -7, 7, -4, 4, 0],
        transition: { duration: 0.4, ease: "easeInOut" },
      });
    }
  }

  return (
    <PracticeGameLayout
      questionType="Gender Identifier"
      instructionFr="Identifiez le genre du mot"
      instructionEn="Identify the gender of the word"
      currentQuestionIndex={currentIndex}
      totalQuestions={cards.length}
      timerValue={timerString}
      onExit={onExit}
      showSubmitButton={false}
    >
      <div className="mx-auto grid w-full max-w-[100rem] items-center gap-7 px-5 py-8 sm:px-10 md:grid-cols-2 md:gap-10 md:px-12 xl:gap-20 xl:px-[7.25rem] xl:py-14">
        <div className="relative mx-auto grid aspect-[6/5] w-full max-w-[38rem] place-items-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 xl:mx-0">
          {card.image && failedImageIndex !== currentIndex ? (
            <img
              src={card.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setFailedImageIndex(currentIndex)}
            />
          ) : (
            <ImageOff aria-hidden="true" className="h-12 w-12 text-slate-400" />
          )}
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center gap-7 md:gap-16 xl:translate-y-11 xl:gap-36">
          <div className="flex max-w-full items-center justify-center gap-2">
            <TranslateButton
              aria-label={translated ? "Show French word" : "Show English translation"}
              aria-pressed={translated}
              className="h-10 w-10 [&_svg]:h-7 [&_svg]:w-7"
              onClick={() => setTranslated((shown) => !shown)}
            />
            <h2 lang={translated ? "en" : "fr"} className="min-w-0 break-words font-serif text-4xl font-bold text-slate-800 dark:text-white sm:text-5xl">
              {translated ? card.translation : card.word}
            </h2>
          </div>

          <div className="w-full max-w-[33rem] xl:translate-x-10">
            <motion.div animate={shake} className="grid grid-cols-2 gap-4 lg:gap-10 2xl:gap-[5.75rem]">
              {genderChoices.map(({ gender, label, icon: Icon, colors }) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => handleGuess(gender)}
                  className={cn(
                    "flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-3xl border-b-4 bg-gradient-to-br px-2 py-4 text-base font-bold text-white shadow-md hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/50 motion-safe:transition motion-safe:active:scale-95 lg:text-lg xl:min-h-[6.75rem]",
                    colors,
                    wrongGender === gender && "ring-2 ring-red-700 ring-offset-2 dark:ring-red-400 dark:ring-offset-slate-950",
                  )}
                >
                  {label}
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </button>
              ))}
            </motion.div>
            <p role="status" className="mt-3 min-h-6 text-center text-sm font-semibold text-red-700 dark:text-red-300">
              {wrongGender && "Incorrect. Try again."}
            </p>
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
