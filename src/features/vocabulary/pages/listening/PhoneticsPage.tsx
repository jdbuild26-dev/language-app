"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { Loader2 } from "lucide-react";
import AudioPlayer from "@/features/vocabulary/components/shared/AudioPlayer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { translateText } from "@/services/aiPracticeApi";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

type Question = { id: string; prompt: string; instruction: string; explanation?: string; options: Array<{ text: string; en?: string }>; correctIndex: number };

export default function PhoneticsPage() {
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

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // Fetch the phonetics questions when this exercise mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const handleOptionClick = (index) => {
    if (showFeedback) return;
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
        instructionFr="Choisissez parmi les options"
        instructionEn="Choose from Options"
        localizedInstruction="Choose from Options"
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
        feedbackMessage={feedbackMessage}
        feedbackInFlow
        feedbackChildren={showFeedback && currentQ && (
          <span>{currentQ.explanation?.trim() || `The answer is ${currentQ.options[currentQ.correctIndex]?.text || "the green option"}.`}</span>
        )}
      >
        <div className="flex w-full flex-1 flex-col items-center justify-start gap-8 px-4 pb-8 pt-8 sm:gap-10 sm:pt-12">
          <AudioPlayer key={currentIndex} text={currentQ?.prompt || ""} pausable />
          <PracticeOptions
            options={currentQ?.options.map(option => option.text) || []}
            selectedOption={selectedOptionIndex}
            correctIndex={currentQ?.correctIndex}
            showFeedback={showFeedback}
            onSelect={handleOptionClick}
            className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2"
            itemClassName="min-h-16"
            renderLabel={(text, index) => (
              <>
                <span>{text}</span>
                {showFeedback && translatedOptions.includes(index) && (currentQ.options[index].en || optionTranslations[index]) && (
                  <span lang="en" className="text-sm font-normal">
                    {currentQ.options[index].en || optionTranslations[index]}
                  </span>
                )}
              </>
            )}
            renderAction={(_, index) => showFeedback && (
              <TranslateButton
                iconVariant="option"
                aria-label={translatedOptions.includes(index) ? `Hide translation for ${currentQ.options[index].text}` : `Translate ${currentQ.options[index].text}`}
                aria-pressed={translatedOptions.includes(index)}
                isLoading={translatingOptions.includes(index)}
                title={translationErrors.includes(index) ? "Translation unavailable. Try again." : "Toggle translation"}
                onClick={() => void toggleOptionTranslation(index, currentQ.options[index])}
              />
            )}
          />
        </div>
      </PracticeGameLayout>
    </>
  );
}
