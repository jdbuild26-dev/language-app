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

import FeedbackBanner from "@/components/ui/FeedbackBanner";

import { loadMockCSV } from "@/utils/csvLoader";

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
        const data = await loadMockCSV("practice/writing/dictation_image.csv");

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
      const answer = questions[currentIndex].correctAnswer || ""; // Safe fallback
      const answerLen = answer.length;

      console.log("Setting up inputs for:", answer); // Debug log

      const newInputs = Array(answerLen).fill("");

      // Pre-fill first and last characters
      if (answerLen > 0) {
        newInputs[0] = answer[0];
        newInputs[answerLen - 1] = answer[answerLen - 1];
      }

      setUserInputs(newInputs);

      // Focus second input (since first is filled) if length > 1, else generic focus
      setTimeout(() => {
        if (answerLen > 1) {
          inputRefs.current[1]?.focus();
        }
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
    // Updated: No auto-advance, wait for user to click Continue on banner
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
    setFeedback(null);
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
    <>
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
        onExit={() => navigate("/practice")}
        onNext={feedback ? handleNext : handleSubmit}
        onRestart={handleRestart}
        // Hide standard submit button when feedback banner is active
        showSubmitButton={!feedback}
        isSubmitEnabled={isComplete && !feedback}
        submitLabel="Submit"
      >
        <div className="flex flex-col md:flex-row items-center justify-center w-full h-full gap-8 md:gap-16 px-4">
          {/* Left Side: Image */}
          <div className="w-64 h-64 md:w-96 md:h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center relative shrink-0">
            {currentQuestion.imageUrl &&
              !currentQuestion.imageUrl.includes("placeholder") ? (
              <img
                src={currentQuestion.imageUrl}
                alt="Dictation"
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <ImageIcon className="w-16 h-16 mb-2" />
                <span>No Image</span>
              </div>
            )}

            {/* Removed Overlay since we use Banner now */}
          </div>

          {/* Right Side: Inputs and Hint */}
          <div className="flex flex-col items-center md:items-start gap-8 max-w-2xl">
            {/* Question / Hint */}
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Inputs */}
            <div className="flex flex-nowrap justify-center gap-1 sm:gap-2 w-full max-w-full px-2">
              {userInputs.map((char, index) => {
                // Determine if this input was pre-filled (first or last char)
                const isPreFilled =
                  index === 0 || index === userInputs.length - 1;

                return (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={feedback !== null || isPreFilled}
                    className={cn(
                      "w-8 h-10 sm:w-12 sm:h-14 md:w-16 md:h-20 shrink min-w-0 border-2 rounded-md sm:rounded-xl text-center text-lg sm:text-2xl md:text-3xl font-bold transition-all outline-none",
                      // Default Style
                      "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
                      // Focus Style (only if not disabled)
                      !isPreFilled &&
                      feedback === null &&
                      "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20",
                      // Pre-filled Style
                      isPreFilled &&
                      "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 select-none",
                      // Correct/Incorrect Feedback
                      feedback === "correct" &&
                      "border-green-500 bg-green-50 text-green-700",
                      feedback === "incorrect" &&
                      "border-red-500 bg-red-50 text-red-700",
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {feedback && (
        <FeedbackBanner
          isCorrect={feedback === "correct"}
          correctAnswer={currentQuestion.correctAnswer}
          message={feedback === "correct" ? "Excellent!" : "Correct solution:"}
          onContinue={handleNext}
        />
      )}
    </>
  );
}
