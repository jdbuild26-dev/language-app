import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2, Check } from "lucide-react";
import AudioPlayer from "../../components/shared/AudioPlayer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export default function MultiSelectPage() {
  const { speak, isSpeaking, cancel } = useTextToSpeech();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
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
          options: [
            q.Option1,
            q.Option2,
            q.Option3,
            q.Option4,
            q.Option5,
            q.Option6,
          ].filter(Boolean),
          correctIndices:
            q.CorrectOptionIndexes || q.CorrectOptions
              ? (q.CorrectOptionIndexes || q.CorrectOptions)
                  .toString()
                  .split(/[|,]+/)
                  .map((s) => parseInt(s.trim()) - 1)
                  .filter((i) => !isNaN(i))
              : [],
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
    cancel(); // Stop audio when user interacts
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
      <div className="flex flex-col items-center w-full max-w-5xl">
        {/* Audio Player Section */}
        <div className="mb-10 w-full flex flex-col items-center justify-center">
          <AudioPlayer text={questions[currentIndex]?.audioText || ""} />
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {currentQ?.options.map((opt, idx) => {
            const isSelected = selectedIndices.includes(idx);
            const isActuallyCorrect = currentQ.correctIndices.includes(idx);
            let style =
              "bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-blue-400 text-gray-700 dark:text-gray-200";

            if (isChecked) {
              if (isActuallyCorrect)
                style = "bg-green-50 border-green-500 text-green-700 font-bold";
              else if (isSelected)
                style = "bg-red-50 border-red-500 text-red-700 opacity-60";
              else style = "opacity-40";
            } else if (isSelected) {
              style =
                "bg-blue-50 border-blue-500 text-blue-700 shadow-md ring-1 ring-blue-500 font-semibold"; // Active state matches provided image style roughly
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionToggle(idx)}
                disabled={isChecked}
                className={`py-12 px-4 rounded-2xl text-center text-xl md:text-2xl font-medium transition-all transform active:scale-95 shadow-sm ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
