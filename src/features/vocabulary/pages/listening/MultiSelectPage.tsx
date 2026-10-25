"use client";

import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { Loader2, Check } from "lucide-react";
import AudioPlayer from "@/features/vocabulary/components/shared/AudioPlayer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { TranslateButton } from "@/components/ui/TranslateButton";
import PracticeOptionCard from "@/components/ui/PracticeOptionCard";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useTranslateText } from "@/hooks/useTranslateText";
import { multiSelectIndices } from "../../lib/practiceAnswers";

type Question = { id: string; instruction: string; sentenceFr: string; sentenceEn: string; options: Array<{ text: string; en?: string }>; correctIndices: number[]; audioText: string };

function SubmittedSentence({ sentenceFr, sentenceEn, submitted }: {
  sentenceFr: string; sentenceEn: string; submitted: boolean;
}) {
  const { displayText, isTranslating, showTranslation, error, toggle } =
    useTranslateText(sentenceFr, "fr", sentenceEn);

  return (
    <div className="flex max-w-full flex-col items-center">
      <div
      aria-hidden={!submitted}
      className={`mt-5 flex max-w-full items-center gap-2 text-center text-lg font-medium text-slate-800 dark:text-slate-100 ${!submitted ? "invisible" : ""}`}
    >
      <span className="grid min-w-0 break-words">
        <span aria-hidden="true" className="invisible col-start-1 row-start-1">
          {sentenceFr}
        </span>
        {sentenceEn && (
          <span aria-hidden="true" className="invisible col-start-1 row-start-1">
            {sentenceEn}
          </span>
        )}
        <span className="col-start-1 row-start-1">{displayText}</span>
      </span>
      <TranslateButton
        disabled={!submitted}
        isLoading={isTranslating}
        aria-label={showTranslation ? "Show French sentence" : "Show English sentence"}
        aria-pressed={showTranslation}
        onClick={toggle}
      />
    </div>
      {submitted && error && <p role="status" className="mt-1 text-sm text-slate-500">{error}</p>}
    </div>
  );
}

export default function MultiSelectPage() {
  const { speak, isSpeaking } = useTextToSpeech();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [translatedOptions, setTranslatedOptions] = useState<number[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer Hook
  const { timerString, resetTimer } = useExerciseTimer({
    duration: 30,
    mode: "timer",
    onExpire: () => {
      if (!isChecked && !isCompleted) {
        handleSubmit();
      }
    },
    isPaused: loading || isCompleted || isChecked,
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

      const response = await fetchPracticeQuestions(
        "phonetics__what_do_you_hear",
      );
      if (response && response.data && response.data.length > 0) {
        const transformed = response.data.map((q) => ({
          id: q.ExerciseID || Math.random(),
          instruction: q.Instruction_EN || "Select what you hear",
          sentenceFr: q.CompleteSentence || q.Sentence_FR || q.Question || q.Audio || q.Prompt || "",
          sentenceEn: q.CompleteSentence_EN || q.Sentence_EN || q.Question_EN || "",
          options: [
            { text: q.Option1, en: q.Option1_EN },
            { text: q.Option2, en: q.Option2_EN },
            { text: q.Option3, en: q.Option3_EN },
            { text: q.Option4, en: q.Option4_EN },
            { text: q.Option5, en: q.Option5_EN },
            { text: q.Option6, en: q.Option6_EN },
          ].filter((o) => o.text),
          correctIndices: multiSelectIndices(q.CorrectOptionIndexes || q.CorrectOptions, 6),
          audioText: q.Question || q.Audio || q.Prompt || "",
        }));
        setQuestions(transformed);
      } else {
        console.error("[MultiSelect] ❌ API returned empty data");
        setQuestions([]);
      }
    } catch (err) {
      console.error("[MultiSelect] ❌ Failed to load:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionToggle = (idx) => {
    if (isChecked) return;
    speak(questions[currentIndex].options[idx].text, "fr-FR");
    setSelectedIndices((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      return [...prev, idx];
    });
  };

  const playAudio = () => {
    const currentQ = questions[currentIndex];
    if (currentQ?.audioText) {
      speak(currentQ.audioText, "fr-FR");
    }
  };

  const handleSubmit = () => {
    if (isChecked) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedIndices([]);
        setTranslatedOptions([]);
        setIsChecked(false);
      } else {
        setIsCompleted(true);
      }
      return;
    }

    setIsChecked(true);
    const currentQ = questions[currentIndex];
    const correctSet = new Set(currentQ.correctIndices);
    const selectedSet = new Set(selectedIndices);

    const isPerfectRequest =
      correctSet.size === selectedSet.size &&
      [...selectedSet].every((i) => correctSet.has(i));

    if (isPerfectRequest) {
      setScore((prev) => prev + 1);
    }
  };

  const currentQ = questions[currentIndex];
  // Auto-play audio when question changes (optional, but good for "What do you hear")
  useEffect(() => {
    if (!loading && !isCompleted && currentQ) {
      // speak(currentQ.audioText, "fr-FR"); // Maybe too intrusive to auto-play? Let's leave manual.
    }
  }, [currentIndex, loading, isCompleted]);

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  let submitLabel = "Check Answer";
  if (isChecked) {
    submitLabel =
      currentIndex === questions.length - 1 ? "Finish" : "Next Question";
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  return (
    <PracticeGameLayout
      questionTypeFr="Qu'entendez-vous ?"
      questionTypeEn="What do you hear?"
      instructionFr="Écoutez et sélectionnez les bonnes réponses"
      instructionEn={
        currentQ?.instruction || "Listen and choose 1-4 correct answers"
      }
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      onExit={() => (window.location.href = "/vocabulary/practice")}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={selectedIndices.length > 0}
      showSubmitButton={true}
      submitLabel={submitLabel}
      timerValue={timerString}
    >
      <div className="practice-reading-page-shell mx-auto flex min-h-full w-full max-w-7xl flex-1 flex-col items-center justify-start px-4 pb-6 pt-[clamp(2rem,8vh,5rem)] sm:px-6 md:pb-8">
        <div className="flex w-full max-w-6xl flex-col items-center">
          {/* Audio Player Section */}
          <div className="mb-14 flex w-full flex-col items-center justify-center">
            <AudioPlayer text={questions[currentIndex]?.audioText || ""} />
            {isChecked && currentQ?.sentenceFr && (
              <SubmittedSentence
                key={`${currentIndex}-${currentQ.id}`}
                sentenceFr={currentQ.sentenceFr}
                sentenceEn={currentQ.sentenceEn}
                submitted={isChecked}
              />
            )}
          </div>

          {/* Options Grid */}
          <div className="grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {currentQ?.options.map((opt, idx) => {
              const isSelected = selectedIndices.includes(idx);
              const isActuallyCorrect = currentQ.correctIndices.includes(idx);
              return (
                <PracticeOptionCard
                  key={idx}
                  selected={isSelected}
                  correct={isActuallyCorrect}
                  submitted={isChecked}
                  onSelect={() => handleOptionToggle(idx)}
                  className="min-h-[96px] rounded-[18px] text-xl sm:text-2xl"
                  action={isChecked && opt.en && (
                    <TranslateButton
                      iconVariant="option"
                      aria-label={translatedOptions.includes(idx) ? `Hide translation for ${opt.text}` : `Translate ${opt.text}`}
                      aria-pressed={translatedOptions.includes(idx)}
                      onClick={() => setTranslatedOptions((previous) => previous.includes(idx)
                        ? previous.filter((index) => index !== idx)
                        : [...previous, idx])}
                    />
                  )}
                >
                  <span>{opt.text}</span>
                  {opt.en && translatedOptions.includes(idx) && (
                    <span className="text-sm mt-1 opacity-80 font-normal">
                      {opt.en}
                    </span>
                  )}
                </PracticeOptionCard>
              );
            })}
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
