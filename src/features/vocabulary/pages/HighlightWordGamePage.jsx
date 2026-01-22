import React, { useState, useEffect } from "react";
import { Loader2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { getFeedbackMessage } from "@/utils/feedbackMessages";


export default function HighlightWordGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Timer State
  const [timer, setTimer] = useState(20); // Default per question

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("A4_Highlight word");
      if (response && response.data && response.data.length > 0) {
        setQuestions(response.data);
      } else {
        console.error("No questions received from backend");
        setQuestions([]);
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
      setQuestions([]);
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

    const correct = cleanWord === cleanTarget;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!isAnswered) {
      handleCheck();
      return;
    }

    setShowFeedback(false);

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
    <>
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
        <div className="flex flex-col items-center justify-center w-full max-w-5xl">
          {/* Specific Prompt Instruction */}
          <div className="mb-12 text-center w-full">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              {currentItem?.prompt}
            </h3>
            <div className="inline-block px-6 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Word meaning "{currentItem?.meaning}"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-lg md:text-xl font-medium leading-relaxed max-w-4xl mx-auto">
            {words.map((word, index) => {
              let styles =
                "bg-transparent text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1 cursor-pointer transition-all border border-transparent";

              const cleanWord = word.replace(/[.,!?;:]/g, "").toLowerCase();
              const cleanTarget = currentItem.correctWord.toLowerCase();

              // If answered, logic for coloring
              if (isAnswered) {
                if (cleanWord === cleanTarget) {
                  // This is the correct word -> GREEN
                  styles =
                    "bg-green-100 text-green-800 ring-2 ring-green-400 rounded-lg px-2 py-1 shadow-sm";
                } else if (selectedWordIndex === index) {
                  // This was selected but is wrong -> RED
                  styles =
                    "bg-red-100 text-red-800 ring-2 ring-red-400 rounded-lg px-2 py-1 opacity-80";
                } else {
                  // Other unrelated words -> Faded
                  styles =
                    "text-gray-400 dark:text-gray-600 rounded-lg px-2 py-1 opacity-50";
                }
              } else if (selectedWordIndex === index) {
                // Currently selected (not checked yet) -> BLUE
                styles =
                  "bg-blue-100 text-blue-800 ring-2 ring-blue-300 rounded-lg px-2 py-1 shadow-sm";
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

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentItem.correctWord : null}
          onContinue={handleNext}
          message={feedbackMessage}
          continueLabel={
            currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
