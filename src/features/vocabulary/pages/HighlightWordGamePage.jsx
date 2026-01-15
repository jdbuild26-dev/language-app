import React, { useState, useEffect } from "react";
import { Loader2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";

// MOCK DATA Fallback
const MOCK_DATA = [
  {
    id: 1,
    prompt: "Select the French word for 'Dog'",
    sentence: "Le chien joue dans le parc.",
    correctWord: "chien",
    meaning: "Dog",
    QuestionType: "Highlight the word",
    Instruction_FR: "Mettez en surbrillance le mot",
    Instruction_EN: "Highlight the word",
  },
  {
    id: 2,
    prompt: "Select the French word for 'Red'",
    sentence: "Ma voiture est rouge et rapide.",
    correctWord: "rouge",
    meaning: "Red",
    QuestionType: "Highlight the word",
    Instruction_FR: "Mettez en surbrillance le mot",
    Instruction_EN: "Highlight the word",
  },
];

export default function HighlightWordGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  // Timer State
  const [timer, setTimer] = useState(20); // Default per question

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("A4_Highlight word");
      const practiceData = response.data || [];

      if (!practiceData || practiceData.length === 0) {
        console.warn("No data from API, using fallback");
        setQuestions(MOCK_DATA);
        setLoading(false);
        return;
      }

      // Map API data to game format
      const gameQuestions = practiceData.map((item) => ({
        id: item.ExerciseID || Math.random().toString(),
        prompt: item.Question_EN || item["Question_EN"] || "Select the correct word",
        sentence: item["Complete sentence"] || item.CompleteSentence || "",
        correctWord: item.CorrectAnswer || item["CorrectAnswer"] || "",
        meaning: item["Correct Explanation_EN"] || item.CorrectExplanation_EN || "",
        QuestionType: item.QuestionType || "Highlight the word",
        Instruction_FR: item.Instruction_FR || "Soulignez le mot correct",
        Instruction_EN: item.Instruction_EN || "Highlight the correct word",
        timerSeconds: parseInt(item.TimeLimitSeconds) || 60
      }));

      setQuestions(gameQuestions);
    } catch (err) {
      console.error("Failed to load highlight word questions:", err);
      // Use mock data as fallback
      setQuestions(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (!loading && !isGameOver && !isAnswered && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, loading, isGameOver, isAnswered]);

  const currentItem = questions[currentIndex];

  const words = currentItem ? currentItem.sentence.split(" ") : [];

  const handleWordClick = (index, word) => {
    if (isAnswered) return;

    // Simple sanitization for comparison
    const cleanWord = word.replace(/[.,!?;:]/g, "").toLowerCase();
    const cleanTarget = currentItem.correctWord.toLowerCase();

    setSelectedWordIndex(index);
  };

  const handleCheck = () => {
    if (selectedWordIndex === null) return;
    setIsAnswered(true);

    const selectedWord = words[selectedWordIndex];
    const cleanWord = selectedWord.replace(/[.,!?;:]/g, "").toLowerCase();
    const cleanTarget = currentItem.correctWord.toLowerCase();

    if (cleanWord === cleanTarget) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!isAnswered) {
      handleCheck();
      return;
    }

    // Move to next
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedWordIndex(null);
      setIsAnswered(false);
      setTimer(20); // Reset timer
    } else {
      setIsGameOver(true);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );

  // Progress
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Timer Format
  const timerString = `0:${timer.toString().padStart(2, "0")}`;

  return (
    <PracticeGameLayout
      questionType={currentItem?.QuestionType}
      instructionFr={currentItem?.Instruction_FR}
      instructionEn={currentItem?.Instruction_EN}
      progress={progress}
      isGameOver={isGameOver}
      score={score}
      totalQuestions={questions.length}
      onExit={() => navigate("/vocabulary/practice")}
      onNext={handleNext}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={selectedWordIndex !== null}
      showSubmitButton={true}
      submitLabel={
        isAnswered
          ? currentIndex < questions.length - 1
            ? "Next"
            : "Finish"
          : "Submit"
      }
      timerValue={timerString}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-3xl">
        {/* Specific Prompt Instruction */}
        <div className="mb-12 text-center">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {currentItem?.prompt}
          </h3>
          <p className="text-gray-400 italic">
            Highlight the word which means "{currentItem?.meaning}"
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-2xl md:text-4xl font-medium leading-relaxed">
          {words.map((word, index) => {
            let styles =
              "bg-transparent text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg px-2 cursor-pointer transition-all";

            if (selectedWordIndex === index) {
              styles =
                "bg-blue-100 text-blue-800 ring-2 ring-blue-300 rounded-lg px-2 shadow-sm";
              if (isAnswered) {
                const cleanWord = word.replace(/[.,!?;:]/g, "").toLowerCase();
                const cleanTarget = currentItem.correctWord.toLowerCase();
                if (cleanWord === cleanTarget) {
                  styles =
                    "bg-green-100 text-green-800 ring-2 ring-green-400 rounded-lg px-2";
                } else {
                  styles =
                    "bg-red-100 text-red-800 ring-2 ring-red-400 rounded-lg px-2 opacity-60";
                }
              }
            }

            return (
              <span
                key={index}
                onClick={() => handleWordClick(index, word)}
                className={styles}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
