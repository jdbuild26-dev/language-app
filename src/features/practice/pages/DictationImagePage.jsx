import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Normalizer
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
};

export default function DictationImagePage() {
  const navigate = useNavigate();

  // State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(0);

  // User Answer State (array of chars)
  const [userInputs, setUserInputs] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const inputRefs = useRef([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/practice/dictation-image`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        // Shuffle
        const shuffled = data.sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
      } catch (error) {
        console.error("Error fetching dictation-image data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Timer
  useEffect(() => {
    if (!isLoading && !isGameOver) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoading, isGameOver]);

  // Reset inputs when question changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      const answerLen = questions[currentIndex].correctAnswer.length;
      setUserInputs(Array(answerLen).fill(""));
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  }, [currentIndex, questions]);

  const currentQuestion = questions[currentIndex];

  const handleInputChange = (index, value) => {
    if (feedback) return; // locked

    const newVal = value.slice(-1); // Take only last char if multiple
    const newInputs = [...userInputs];
    newInputs[index] = newVal;
    setUserInputs(newInputs);

    // Auto-advance
    if (newVal && index < userInputs.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !userInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;

    const userAnswer = userInputs.join("");
    const isCorrect =
      normalizeText(userAnswer) ===
      normalizeText(currentQuestion.correctAnswer);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }

    // Auto-advance after delay
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentIndex(0);
    setIsGameOver(false);
    setTimer(0);
    setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No questions available.
        </p>
        <Button
          onClick={() => navigate("/vocabulary/practice")}
          variant="outline"
          className="mt-4"
        >
          Back
        </Button>
      </div>
    );
  }

  const isComplete = userInputs.every((char) => char !== "");

  return (
    <PracticeGameLayout
      title="Dictation (Image)"
      questionType={currentQuestion.question}
      instructionFr={currentQuestion.instructionFr}
      instructionEn={currentQuestion.instructionEn}
      progress={((currentIndex + 1) / questions.length) * 100}
      score={score}
      totalQuestions={questions.length}
      isGameOver={isGameOver}
      timerValue={formatTimer(timer)}
      onExit={() => navigate("/vocabulary/practice")}
      onNext={handleSubmit}
      onRestart={handleRestart}
      isSubmitEnabled={isComplete && !feedback}
      submitLabel={
        feedback === "correct"
          ? "Correct!"
          : feedback === "incorrect"
          ? "Incorrect"
          : "Submit"
      }
    >
      <div className="flex flex-col items-center justify-center w-full max-w-4xl gap-8">
        {/* Image */}
        <div className="w-64 h-64 md:w-80 md:h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center relative">
          {currentQuestion.imageUrl &&
          !currentQuestion.imageUrl.includes("placeholder") ? (
            <img
              src={currentQuestion.imageUrl}
              alt="Dictation"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <ImageIcon className="w-16 h-16 mb-2" />
              <span>No Image</span>
            </div>
          )}

          {/* Feedback Overlay on Image */}
          {feedback === "correct" && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-in fade-in duration-300">
              <span className="text-4xl">✅</span>
            </div>
          )}
          {feedback === "incorrect" && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center animate-in fade-in duration-300">
              <span className="text-4xl">❌</span>
            </div>
          )}
        </div>

        {/* Question */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Inputs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {userInputs.map((char, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={char}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={feedback !== null}
              className={cn(
                "w-12 h-14 md:w-14 md:h-16 border-2 rounded-xl text-center text-2xl font-bold transition-all outline-none focus:ring-4 focus:ring-indigo-500/20",
                feedback === null
                  ? "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400"
                  : "",
                feedback === "correct"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "",
                feedback === "incorrect"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : ""
              )}
            />
          ))}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
