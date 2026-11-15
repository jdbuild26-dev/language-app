"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { Loader2 } from "lucide-react";
import AudioPlayer from "@/features/vocabulary/components/shared/AudioPlayer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

type Question = { id: string; prompt: string; instruction: string; explanation?: string; options: Array<{ text: string; en?: string }>; correctIndex: number };

const bundledTranslations = new Map(Object.entries({
  le: "The", la: "The", les: "The", bon: "Good", bonne: "Good",
  banc: "Bench", bancs: "Benches", lait: "Milk", chat: "Cat",
  chien: "Dog", cheval: "Horse", hibou: "Owl", oiseau: "Bird",
  vache: "Cow", lion: "Lion",
}));

export default function PhoneticsPage() {
  // State
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [translatedOptions, setTranslatedOptions] = useState<number[]>([]);
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

      const response = await fetchPracticeQuestions("listen_phonetics", { apiOnly: true });
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
          ].filter((opt) => opt.text).map(option => ({
            ...option,
            en: option.en?.trim() || bundledTranslations.get(option.text.trim().toLowerCase()),
          })),
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
    setShowFeedback(false);
    setSelectedOptionIndex(null);
    setTranslatedOptions([]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const toggleOptionTranslation = (index: number) => {
    setTranslatedOptions(previous => previous.includes(index)
      ? previous.filter(item => item !== index) : [...previous, index]);
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
            renderLabel={(text, index) => {
              const translated = showFeedback && translatedOptions.includes(index);
              return <span lang={translated ? "en" : "fr"}>{translated ? currentQ.options[index].en || text : text}</span>;
            }}
            renderAction={(_, index) => {
              if (!showFeedback) return null;
              const option = currentQ.options[index];
              const translated = translatedOptions.includes(index);
              return <TranslateButton
                iconVariant="option"
                aria-label={translated ? `Show original ${option.text}` : `Translate ${option.text}`}
                aria-pressed={translated}
                disabled={!option.en}
                title={option.en ? "Toggle translation" : "Saved translation unavailable"}
                onClick={() => toggleOptionTranslation(index)}
              />;
            }}
          />
        </div>
      </PracticeGameLayout>
    </>
  );
}
