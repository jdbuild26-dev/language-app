import React, { useState, useEffect } from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2, Volume2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";

export default function AudioMatchingPage() {
  const { speak, isSpeaking } = useTextToSpeech();

  // State
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // { id, isCorrect }
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // "A1.Match the pairs" is what was used previously via raw fetch
      const response = await fetchPracticeQuestions("A1.Match the pairs");
      if (response && response.data) {
        generateQuestions(response.data);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = (data) => {
    const questionsList = [];
    const totalQuestions = 5;

    // Shuffle data
    const shuffled = [...data].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(shuffled.length, totalQuestions); i++) {
      const correctItem = shuffled[i];

      // Get 3 distractors
      const others = shuffled.filter((item) => item.id !== correctItem.id);
      const distractors = others.sort(() => Math.random() - 0.5).slice(0, 3);

      const options = [correctItem, ...distractors]
        .sort(() => Math.random() - 0.5)
        .map((item) => ({
          id: item.id,
          text: item.English, // Display English
          audioText: item.French, // Play French
          isCorrect: item.id === correctItem.id,
        }));

      questionsList.push({
        id: i,
        promptAudio: correctItem.French,
        correctAnswer: correctItem,
        options: options,
      });
    }
    setQuestions(questionsList);
  };

  const handleOptionClick = (option) => {
    if (selectedOption) return;

    const isCorrect = option.isCorrect;
    setSelectedOption({ id: option.id, isCorrect });

    if (isCorrect) {
      setScore((prev) => prev + 1);
      speak("Correct", "en-US"); // Optional feedback audio
    } else {
      speak("Incorrect", "en-US");
    }

    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
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
    <PracticeGameLayout
      questionType="What do you hear?"
      instructionFr="Écoutez et choisissez la bonne traduction"
      instructionEn="Listen and choose the correct translation"
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      onExit={() => (window.location.href = "/vocabulary/practice")} // using href to ensure clean exit or use navigate
      onRestart={() => window.location.reload()}
      isSubmitEnabled={false}
      showSubmitButton={false}
    >
      <div className="flex flex-col items-center w-full max-w-2xl">
        {/* Audio Button */}
        <button
          onClick={() => speak(currentQ.promptAudio)}
          className={`
              mb-12 w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105
              ${
                isSpeaking
                  ? "bg-blue-100 text-blue-600 ring-4 ring-blue-200"
                  : "bg-white dark:bg-slate-800 text-blue-500"
              }
            `}
        >
          <Volume2
            className={`w-12 h-12 ${isSpeaking ? "animate-pulse" : ""}`}
          />
        </button>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <AnimatePresence mode="popLayout">
            {currentQ?.options.map((option) => {
              let stateStyles =
                "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-400";
              if (selectedOption) {
                if (option.isCorrect) {
                  stateStyles =
                    "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500";
                } else if (selectedOption.id === option.id) {
                  stateStyles =
                    "bg-red-50 border-red-500 text-red-700 opacity-60";
                } else {
                  stateStyles = "opacity-50 grayscale";
                }
              }

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleOptionClick(option)}
                  disabled={!!selectedOption}
                  className={`
                                relative p-6 rounded-2xl border-2 text-lg font-medium text-left transition-all
                                ${stateStyles}
                            `}
                >
                  <span className="flex items-center justify-between">
                    {option.text}
                    {selectedOption?.id === option.id && option.isCorrect && (
                      <CheckCircle2 className="text-green-600" />
                    )}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
