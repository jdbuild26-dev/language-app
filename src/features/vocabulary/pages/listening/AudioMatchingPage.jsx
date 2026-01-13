import React, { useState, useEffect, useCallback } from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import FullScreenLayout from "../../../../components/layout/FullScreenLayout";
import { fetchVocabulary } from "../../../../services/vocabularyApi"; // Reusing vocabulary fetch since it's the same data
import { Loader2, Volume2, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AudioMatchingPage() {
  const { speak, isSpeaking } = useTextToSpeech();

  // State
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // { id, isCorrect }
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Using existing generic fetch, assuming it can target the A1 sheet indirectly or we use specific endpoint
        // NOTE: Ideally we'd have a specific endpoint, but for now let's use the practice one or generic one.
        // User said: "b1 match the pairs will use the a1 match the pairs table"
        // Let's assume we can fetch "A1.Match the pairs" via the practice endpoint
        const response = await fetch(
          "http://localhost:8000/api/practice/A1.Match%20the%20pairs"
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const json = await response.json();

        if (json.data && json.data.length > 0) {
          generateQuestions(json.data);
        }
      } catch (err) {
        console.error("Error loading B1 data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Game Logic: generate questions with distractors
  const generateQuestions = (data) => {
    // Filter valid items (must have french text)
    const validItems = data.filter(
      (item) => item["Word - French"] && item["English word"]
    );

    // Shuffle
    const shuffled = [...validItems].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10); // Take 10 questions

    const gameQuestions = selected.map((target) => {
      // Pick 3 distractors
      const otherItems = validItems.filter((i) => i !== target);
      const distractors = otherItems
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [target, ...distractors].sort(() => 0.5 - Math.random());

      return {
        target,
        options,
        prompt: target["Word - French"],
        correctAnswer: target["English word"], // For text matching mode
      };
    });

    setQuestions(gameQuestions);
  };

  const handleOptionClick = (option) => {
    if (selectedOption) return; // Block input

    const isCorrect =
      option["English word"] === questions[currentIndex].target["English word"];
    setSelectedOption({ id: option["English word"], isCorrect });

    if (isCorrect) {
      setScore((s) => s + 1);
      speak("Très bien!", "fr-FR");
    } else {
      speak("Incorrect", "fr-FR");
    }

    // Next question delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setIsCompleted(true);
      }
    }, 1500);
  };

  const playPrompt = () => {
    if (questions[currentIndex]) {
      speak(questions[currentIndex].prompt, "fr-FR");
    }
  };

  // Auto-play prompt on new question
  useEffect(() => {
    if (!loading && !isCompleted && questions.length > 0) {
      // Small delay to ensure render
      const timer = setTimeout(() => {
        playPrompt();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, loading, isCompleted, questions]);

  if (loading) {
    return (
      <FullScreenLayout title="Match the Pairs (Audio)" showExitButton>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      </FullScreenLayout>
    );
  }

  if (isCompleted) {
    return (
      <FullScreenLayout title="Match the Pairs (Audio)" showExitButton>
        <div className="flex flex-col h-full items-center justify-center text-center p-8">
          <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            Practice Complete!
          </h2>
          <p className="text-2xl mb-8 text-gray-600">
            Score: {score} / {questions.length}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-bold hover:bg-blue-700 transition"
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
        {/* Audio Prompt Section */}
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
          <button
            onClick={playPrompt}
            className={`
              w-32 h-32 rounded-full flex items-center justify-center
              transform transition-all duration-200 shadow-xl
              ${
                isSpeaking
                  ? "bg-blue-100 text-blue-600 scale-110 ring-4 ring-blue-300"
                  : "bg-white text-gray-700 hover:scale-105 hover:bg-gray-50 dark:bg-gray-800 dark:text-white"
              }
            `}
          >
            <Volume2 size={48} />
          </button>
          <p className="mt-6 text-gray-500 text-sm uppercase tracking-wider font-medium">
            Click to Listen
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-1/2">
          {currentQuestion?.options.map((option, idx) => {
            const isSelected = selectedOption?.id === option["English word"];
            const isCorrect =
              option["English word"] === currentQuestion.correctAnswer;

            // Determine card style based on state
            let cardStyle =
              "border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10";
            if (selectedOption) {
              if (isSelected) {
                cardStyle = selectedOption.isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500"
                  : "border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500";
              } else if (isCorrect) {
                // Show correct answer even if wrong one picked
                cardStyle = "border-green-500 bg-green-50 dark:bg-green-900/20";
              } else {
                cardStyle = "opacity-50 border-gray-200";
              }
            }

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleOptionClick(option)}
                disabled={!!selectedOption}
                className={`
                  relative p-6 rounded-2xl border-2 text-left transition-all duration-200
                  flex items-center justify-between group bg-white dark:bg-gray-800
                  ${cardStyle}
                `}
              >
                <span className="text-xl font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {option["English word"]}
                </span>

                {selectedOption && isCorrect && (
                  <CheckCircle2 className="text-green-500" size={24} />
                )}
                {selectedOption && isSelected && !isCorrect && (
                  <XCircle className="text-red-500" size={24} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </FullScreenLayout>
  );
}
