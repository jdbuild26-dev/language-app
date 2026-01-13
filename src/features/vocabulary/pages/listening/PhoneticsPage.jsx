import React, { useState, useEffect } from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import FullScreenLayout from "../../../../components/layout/FullScreenLayout";
import { Loader2, Volume2, CheckCircle2, XCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function PhoneticsPage() {
  const { speak, isSpeaking } = useTextToSpeech();

  // State
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch B2_Phonetics data
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/api/practice/B2_Phonetics`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const json = await response.json();

        if (json.data && json.data.length > 0) {
          // Transform data
          const gameQuestions = json.data.map((item) => ({
            id: item["ExerciseID"] || Math.random().toString(),
            prompt: item["Audio"] || item["Word ID"], // Fallback to word ID if Audio not set
            instruction: item["Instruction_EN"] || "What do you hear?",
            explanation: item["CorrectExplanation_EN"],
            options: [
              item["Option1"],
              item["Option2"],
              item["Option3"],
              item["Option4"],
            ].filter(Boolean), // Remove empty options
            correctIndex: parseInt(item["CorrectOptionIndex"]) - 1, // 1-based to 0-based
          }));
          setQuestions(gameQuestions);
        }
      } catch (err) {
        console.error("Error loading B2 data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOptionClick = (index) => {
    if (selectedOption !== null) return;

    const isCorrect = index === questions[currentIndex].correctIndex;
    setSelectedOption({ index, isCorrect });

    if (isCorrect) {
      setScore((s) => s + 1);
      speak("Correct", "fr-FR");
    } else {
      speak("Incorrect", "fr-FR");
    }

    // Delay for next question or completion
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setIsCompleted(true);
      }
    }, 2000); // 2s delay to read explanation if needed
  };

  const playPrompt = () => {
    if (questions[currentIndex]) {
      speak(questions[currentIndex].prompt, "fr-FR");
    }
  };

  useEffect(() => {
    if (!loading && !isCompleted && questions.length > 0) {
      const timer = setTimeout(() => {
        playPrompt();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, loading, isCompleted, questions]);

  if (loading) {
    return (
      <FullScreenLayout title="Phonetics" showExitButton>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="animate-spin text-purple-500" size={48} />
        </div>
      </FullScreenLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <FullScreenLayout title="Phonetics" showExitButton>
        <div className="flex h-full items-center justify-center">
          <p>No questions found.</p>
        </div>
      </FullScreenLayout>
    );
  }

  if (isCompleted) {
    return (
      <FullScreenLayout title="Phonetics" showExitButton>
        <div className="flex flex-col h-full items-center justify-center p-8 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            Practice Complete!
          </h2>
          <p className="text-2xl mb-8 text-gray-600">
            Score: {score} / {questions.length}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white rounded-full text-lg font-bold hover:bg-purple-700 transition"
          >
            Play Again
          </button>
        </div>
      </FullScreenLayout>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <FullScreenLayout
      title={`Question ${currentIndex + 1}/${questions.length}`}
      showExitButton
    >
      <div className="flex flex-col h-full max-w-4xl mx-auto p-6">
        {/* Instruction */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {currentQuestion.instruction}
          </h2>
        </div>

        {/* Audio Button */}
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
          <button
            onClick={playPrompt}
            className={`
              w-32 h-32 rounded-full flex items-center justify-center
              transform transition-all duration-200 shadow-xl
              ${
                isSpeaking
                  ? "bg-purple-100 text-purple-600 scale-110 ring-4 ring-purple-300"
                  : "bg-white text-gray-700 hover:scale-105 hover:bg-gray-50 dark:bg-gray-800 dark:text-white"
              }
            `}
          >
            <Volume2 size={48} />
          </button>
        </div>

        {/* Explanation (Shown after answer) */}
        {selectedOption !== null && currentQuestion.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg flex items-start gap-3"
          >
            <Info className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm">{currentQuestion.explanation}</p>
          </motion.div>
        )}

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-1/2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption?.index === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let cardStyle =
              "border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50";

            if (selectedOption) {
              if (isSelected) {
                cardStyle = selectedOption.isCorrect
                  ? "border-green-500 bg-green-50 ring-2 ring-green-500"
                  : "border-red-500 bg-red-50 ring-2 ring-red-500";
              } else if (isCorrect) {
                cardStyle = "border-green-500 bg-green-50";
              } else {
                cardStyle = "opacity-50 border-gray-200";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={selectedOption !== null}
                className={`
                  relative p-6 rounded-2xl border-2 text-left transition-all duration-200
                  flex items-center justify-between group bg-white dark:bg-gray-800
                  ${cardStyle}
                `}
              >
                <span className="text-xl font-medium text-gray-800 dark:text-white">
                  {option}
                </span>

                {selectedOption && isCorrect && (
                  <CheckCircle2 className="text-green-500" size={24} />
                )}
                {selectedOption && isSelected && !isCorrect && (
                  <XCircle className="text-red-500" size={24} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </FullScreenLayout>
  );
}
