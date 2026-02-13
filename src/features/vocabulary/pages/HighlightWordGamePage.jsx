import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
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

  // Timer State Replaced

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("highlight_word");
      if (response && response.data && response.data.length > 0) {
        // Map API response keys to component state keys
        const formattedQuestions = response.data
          .filter(q => (q.passage || q.sentence || q.Sentence) && (q.passage || q.sentence || q.Sentence) !== "None")
          .map((q) => ({
            ...q,
            sentence: q.passage || q.sentence || q.Sentence || q["Complete sentence"] || "",
            correctWord: q.correctWord || q.correctAnswer || q.CorrectAnswer || q.Answer || "",
            prompt: (q.question || q.instructionEn || q.Instruction_EN || q.Question_EN || "")?.trim(),
          }));
        setQuestions(formattedQuestions);
      } else {
        console.error("No valid questions received from backend");
        setQuestions([]);
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 20,
    mode: "timer",
    onExpire: () => {
      // Auto-submit if not answered
      if (!isAnswered && !isGameOver && !showFeedback) {
        // If auto-submitting without selection, it's incorrect or we just trigger check
        // But check requires selectedWordIndex.
        // If nothing selected, just mark incorrect or force answer?
        // Existing handleCheck checks if selectedWordIndex is null.
        // If null, we might want to fail the question?
        // Let's modify handleCheck or just force a failure here.
        if (selectedWordIndex === null) {
          // Time's up, no selection
          setIsAnswered(true);
          setIsCorrect(false);
          setFeedbackMessage("Time's up!");
          setShowFeedback(true);
        } else {
          handleCheck();
        }
      }
    },
    isPaused: loading || isGameOver || isAnswered || showFeedback,
  });

  // Reset timer on new question
  useEffect(() => {
    resetTimer(); // We should probably pass dependency?
    // In hook, resetTimer depends on duration.
  }, [currentIndex, resetTimer]);
  // Removed old timer effect

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
      resetTimer(); // Reset timer
    } else {
      setIsGameOver(true);
    }
  };

  // Progress
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-bold">No questions found</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate("/vocabulary/practice")}
        >
          Back to Practice
        </Button>
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType={currentItem?.QuestionType}
        instructionFr={currentItem?.Instruction_FR}
        instructionEn={currentItem?.Instruction_EN}
        progress={progress}
        currentQuestionIndex={currentIndex}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={showFeedback ? handleNext : handleNext}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedWordIndex !== null}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : isAnswered
              ? "Next"
              : "Submit"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? currentItem.correctWord : null}
        feedbackMessage={feedbackMessage}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-5xl">
          {/* Specific Prompt Instruction */}
          <div className="mb-6 text-center w-full">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {currentItem?.prompt}
            </h3>
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
    </>
  );
}
