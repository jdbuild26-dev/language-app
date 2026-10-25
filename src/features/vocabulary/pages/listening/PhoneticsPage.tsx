"use client";

import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import AudioPlayer from "@/features/vocabulary/components/shared/AudioPlayer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { translateText } from "@/services/aiPracticeApi";
import { cn } from "@/lib/utils";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

type Question = { id: string; prompt: string; instruction: string; explanation?: string; options: Array<{ text: string; en?: string }>; correctIndex: number };

export default function PhoneticsPage() {
  const { speak } = useTextToSpeech();

  // State
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [translatedOptions, setTranslatedOptions] = useState<number[]>([]);
  const [optionTranslations, setOptionTranslations] = useState<Record<number, string>>({});
  const [translatingOptions, setTranslatingOptions] = useState<number[]>([]);
  const [translationErrors, setTranslationErrors] = useState<number[]>([]);
  const translationGeneration = useRef(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Timer Hook
  const { timerString, resetTimer } = useExerciseTimer({
    duration: 30,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const response = await fetchPracticeQuestions("listen_phonetics");
      if (response && response.data) {
        const gameQuestions = response.data.map((item) => ({
          id: item["ExerciseID"] || Math.random().toString(),
          prompt: item["Audio"] || item["Word ID"],
          instruction: item["Instruction_EN"] || "What do you hear?",
          explanation: item["CorrectExplanation_EN"],
          options: [
            {
              text: item["Option1"],
              en: item["Option1_EN"] || item["Option1_Translation"],
            },
            {
              text: item["Option2"],
              en: item["Option2_EN"] || item["Option2_Translation"],
            },
            {
              text: item["Option3"],
              en: item["Option3_EN"] || item["Option3_Translation"],
            },
            {
              text: item["Option4"],
              en: item["Option4_EN"] || item["Option4_Translation"],
            },
          ].filter((opt) => opt.text),
          correctIndex: parseInt(item["CorrectOptionIndex"]) - 1,
        }));
        setQuestions(gameQuestions);
      }
    } catch (err) {
      console.error(`[Phonetics] ❌ Failed to load:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (index) => {
    if (showFeedback) return;
    speak(questions[currentIndex].options[index].text, "fr-FR");
    setSelectedOptionIndex(index);
  };

  const handleSubmit = () => {
    if (selectedOptionIndex === null || showFeedback) return;

    const correct =
      selectedOptionIndex === questions[currentIndex].correctIndex;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    translationGeneration.current += 1;
    setShowFeedback(false);
    setSelectedOptionIndex(null);
    setTranslatedOptions([]);
    setOptionTranslations({});
    setTranslatingOptions([]);
    setTranslationErrors([]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const toggleOptionTranslation = async (index: number, option: { text: string; en?: string }) => {
    if (translatedOptions.includes(index)) {
      setTranslatedOptions((previous) => previous.filter((item) => item !== index));
      return;
    }
    if (option.en || optionTranslations[index]) {
      setTranslatedOptions((previous) => [...previous, index]);
      return;
    }
    if (translatingOptions.includes(index)) return;
    setTranslatingOptions((previous) => [...previous, index]);
    setTranslationErrors((previous) => previous.filter((item) => item !== index));
    const generation = translationGeneration.current;
    try {
      const result = await translateText(option.text, "en");
      if (generation !== translationGeneration.current) return;
      setOptionTranslations((previous) => ({ ...previous, [index]: result.translation }));
      setTranslatedOptions((previous) => [...previous, index]);
    } catch {
      if (generation === translationGeneration.current) setTranslationErrors((previous) => [...previous, index]);
    } finally {
      if (generation === translationGeneration.current) setTranslatingOptions((previous) => previous.filter((item) => item !== index));
    }
  };

  const currentQ = questions[currentIndex];
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
        questionTypeFr="Exercice de phonétique"
        questionTypeEn="Phonetics Practice"
        instructionFr="Choisissez la bonne transcription"
        instructionEn={
          currentQ?.instruction || "Choose the correct transcription"
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => (window.location.href = "/vocabulary/practice")}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={
          (selectedOptionIndex !== null && !showFeedback) || showFeedback
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
        correctAnswer={
          !isCorrect ? currentQ.options[currentQ.correctIndex]?.text : null
        }
        feedbackMessage={feedbackMessage}
      >
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-8 md:gap-16 px-4">
          {/* Left Side: Large Audio Button */}
          <div className="flex-shrink-0">
            <AudioPlayer text={currentQ?.prompt || ""} />
          </div>

          {/* Right Side: Question & Options */}
          <div className="flex flex-col w-full max-w-lg gap-6">
            {/* Question Text */}
            <h2 className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-200">
              {currentQ?.instruction || "Which word do you hear?"}
            </h2>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-3 w-full">
              {currentQ?.options.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;

                return (
                  <div key={idx} className="relative">
                  <button
                    onClick={() => handleOptionClick(idx)}
                    disabled={showFeedback}
                    className={cn(
                      "group relative p-4 pr-14 rounded-2xl border-[3px] text-left font-medium text-lg md:text-xl transition-all flex items-center gap-4 bg-white dark:bg-slate-800 shadow-sm",
                      // Default
                      "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
                      // Selected
                      isSelected &&
                        "border-sky-400 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-300",
                    )}
                  >
                    {/* Fake Radio/Checkbox Circle */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-slate-300 dark:border-slate-500 text-transparent",
                      )}
                    >
                      <span className="text-[10px] font-bold">✓</span>
                    </div>

                    <div className="flex-1 flex flex-col text-left">
                      <span>{opt.text}</span>
                      {translatedOptions.includes(idx) && (opt.en || optionTranslations[idx]) && (
                        <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                          {opt.en || optionTranslations[idx]}
                        </span>
                      )}
                    </div>
                  </button>
                  {showFeedback && (
                    <TranslateButton
                      iconVariant="option"
                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2"
                      aria-label={translatedOptions.includes(idx) ? `Hide translation for ${opt.text}` : `Translate ${opt.text}`}
                      aria-pressed={translatedOptions.includes(idx)}
                      isLoading={translatingOptions.includes(idx)}
                      title={translationErrors.includes(idx) ? "Translation unavailable. Try again." : "Toggle translation"}
                      onClick={() => void toggleOptionTranslation(idx, opt)}
                    />
                  )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
