import React, { useState, useEffect } from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import FullScreenLayout from "../../../../components/layout/FullScreenLayout";
import { Loader2, Volume2, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function MultiSelectPage() {
  const { speak, isSpeaking, cancel } = useTextToSpeech();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedIndices, setSelectedIndices] = useState([]); // Array of integers
  const [showResult, setShowResult] = useState(false);

  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Clean sheet name for URL component
        const sheetName = "B3_what you hear-Multiple";
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/api/practice/${encodeURIComponent(sheetName)}`
        );

        if (!response.ok) throw new Error("Failed to fetch data");
        const json = await response.json();

        if (json.data && json.data.length > 0) {
          const gameQuestions = json.data.map((item) => ({
            id: item["ExerciseID"],
            narrative: item["AudioID"], // Assuming this is the text to read
            instruction: item["Instruction_EN"],
            options: [
              item["Option1"],
              item["Option2"],
              item["Option3"],
              item["Option4"],
              item["Option5"],
              item["Option6"],
            ].filter(Boolean),
            // Parse generic indices "1,3,5" -> [0, 2, 4]
            correctIndices: (item["CorrectOptionIndexes"] || "")
              .split(",")
              .map((s) => parseInt(s.trim()) - 1)
              .filter((n) => !isNaN(n)),
          }));
          setQuestions(gameQuestions);
        }
      } catch (err) {
        console.error("Error loading B3 data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOptionToggle = (index) => {
    if (showResult) return;

    setSelectedIndices((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      return [...prev, index];
    });
  };

  const checkAnswer = () => {
    setShowResult(true);
    const currentQ = questions[currentIndex];

    // Check if selections match exactly (order doesn't matter)
    const validSet = new Set(currentQ.correctIndices);
    const selectedSet = new Set(selectedIndices);

    // Simple exact match logic: size must match, and every selected must be in valid
    const isCorrect =
      validSet.size === selectedSet.size &&
      [...selectedSet].every((i) => validSet.has(i));

    if (isCorrect) {
      setScore((s) => s + 1);
      speak("Excellent!", "fr-FR");
    } else {
      speak("Not quite", "en-US");
    }
  };

  const nextQuestion = () => {
    cancel(); // Stop audio
    setShowResult(false);
    setSelectedIndices([]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const playNarrative = () => {
    if (questions[currentIndex]) {
      speak(questions[currentIndex].narrative, "fr-FR", 0.9);
    }
  };

  // Auto-play initially
  useEffect(() => {
    if (!loading && !isCompleted && questions[currentIndex]) {
      const timer = setTimeout(() => {
        playNarrative();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, loading, isCompleted, questions]);

  if (loading)
    return (
      <FullScreenLayout title="Loading...">
        <Loader2 className="animate-spin" />
      </FullScreenLayout>
    );

  if (isCompleted) {
    return (
      <FullScreenLayout title="Summary" showExitButton>
        <div className="flex flex-col h-full items-center justify-center p-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Practice Complete!</h2>
          <p className="text-2xl mb-8">
            Score: {score} / {questions.length}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-full"
          >
            Play Again
          </button>
        </div>
      </FullScreenLayout>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <FullScreenLayout
      title={`Selection ${currentIndex + 1}/${questions.length}`}
      showExitButton
    >
      <div className="flex flex-col h-full max-w-5xl mx-auto p-4 md:p-8">
        {/* Header / Audio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left: Audio & Instruction */}
          <div className="lg:col-span-1 flex flex-col items-center text-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-6">
              {currentQ.instruction}
            </h2>
            <button
              onClick={playNarrative}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isSpeaking
                  ? "bg-blue-100 text-blue-600 scale-105"
                  : "bg-white text-gray-700 hover:scale-105"
              }`}
            >
              <Volume2 size={40} />
            </button>
            <p className="mt-4 text-xs text-gray-400">
              Click to listen to the passage
            </p>
          </div>

          {/* Right: Options */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedIndices.includes(idx);
              const isActuallyCorrect = currentQ.correctIndices.includes(idx);

              let style = "border-gray-200 hover:border-blue-400 opacity-90";

              if (showResult) {
                if (isActuallyCorrect)
                  style = "bg-green-100 border-green-500 text-green-800";
                else if (isSelected)
                  style = "bg-red-50 border-red-500 text-red-800 opacity-60";
                else style = "opacity-40 border-gray-100";
              } else if (isSelected) {
                style = "bg-blue-50 border-blue-500 ring-1 ring-blue-500";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionToggle(idx)}
                  disabled={showResult}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${style}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{opt}</span>
                    {showResult && isActuallyCorrect && (
                      <Check size={18} className="text-green-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
          {!showResult ? (
            <button
              onClick={checkAnswer}
              disabled={selectedIndices.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-colors flex items-center gap-2"
            >
              Next Question <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </FullScreenLayout>
  );
}
