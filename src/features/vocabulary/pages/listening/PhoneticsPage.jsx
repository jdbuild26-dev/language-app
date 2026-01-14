import React, { useState, useEffect } from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2, Volume2, CheckCircle2, XCircle } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { cn } from "@/lib/utils";

export default function PhoneticsPage() {
  const { speak } = useTextToSpeech();

  // State
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("B2_Phonetics");
      if (response && response.data) {
        const gameQuestions = response.data.map((item) => ({
          id: item["ExerciseID"] || Math.random().toString(),
          prompt: item["Audio"] || item["Word ID"],
          instruction: item["Instruction_EN"] || "What do you hear?",
          explanation: item["CorrectExplanation_EN"],
          options: [
            item["Option1"],
            item["Option2"],
            item["Option3"],
            item["Option4"],
          ].filter(Boolean),
          correctIndex: parseInt(item["CorrectOptionIndex"]) - 1,
        }));
        setQuestions(gameQuestions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (index) => {
    if (isChecked) return;
    setSelectedOptionIndex(index);
  };

  const handleSubmit = () => {
    if (isChecked) {
      // Next
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOptionIndex(null);
        setIsChecked(false);
      } else {
        setIsCompleted(true);
      }
      return;
    }

    // Check
    if (selectedOptionIndex === null) return;

    setIsChecked(true);
    const isCorrect =
      selectedOptionIndex === questions[currentIndex].correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const currentQ = questions[currentIndex];
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
      questionType="Phonetics Practice"
      instructionFr="Choisissez la bonne transcription"
      instructionEn={
        currentQ?.instruction || "Choose the correct transcription"
      }
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      onExit={() => (window.location.href = "/vocabulary/practice")}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={selectedOptionIndex !== null}
      showSubmitButton={true}
      submitLabel={submitLabel}
    >
      <div className="flex flex-col items-center w-full max-w-2xl">
        {/* Audio Prompt */}
        <button
          onClick={() => speak(currentQ.prompt)}
          className="mb-8 w-24 h-24 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-blue-500 hover:text-blue-600 hover:scale-105 transition-all"
        >
          <Volume2 className="w-10 h-10" />
        </button>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 w-full">
          {currentQ?.options.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const isCorrect = currentQ.correctIndex === idx;
            let styles =
              "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700";

            if (isChecked) {
              if (isCorrect)
                styles = "bg-green-50 border-green-500 text-green-700";
              else if (isSelected)
                styles = "bg-red-50 border-red-500 text-red-700 opacity-60";
              else styles = "opacity-50";
            } else if (isSelected) {
              styles =
                "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isChecked}
                className={`p-4 rounded-xl border-2 text-left font-mono text-lg transition-all flex justify-between items-center ${styles}`}
              >
                <span>{opt}</span>
                {isChecked && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
                {isChecked && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isChecked && currentQ.explanation && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-800 dark:text-blue-200 text-sm w-full text-center">
            {currentQ.explanation}
          </div>
        )}
      </div>
    </PracticeGameLayout>
  );
}
