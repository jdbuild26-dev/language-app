import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, X, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import SegmentedInput from "../components/ui/SegmentedInput";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

export default function CorrectSpellingGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  // feedbackState is less useful now with standard banner, but keeping for input coloring consistency if needed
  // actually standard banner pattern uses isCorrect/showFeedback
  const [feedbackState, setFeedbackState] = useState("neutral");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  // Timer Hook
  const currentQuestion = questions[currentIndex];
  const timerDuration = parseInt(currentQuestion?.timeLimit) || 60;

  // Ref for input fields
  const inputsRef = useRef([]);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        // Time's up logic
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
        setFeedbackState("incorrect");
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  // Clean string helper
  const cleanString = (str) => {
    if (!str) return "";
    return str
      .trim()
      .replace(/\u200B/g, "") // Remove zero-width space
      .normalize("NFC"); // Normalize unicode
  };

  // Reset logic
  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      resetTimer();
      // Setup inputs
      const rawAnswer = currentQuestion?.correctAnswer || "";
      const answer = cleanString(rawAnswer);

      setUserInputs(new Array(answer.length).fill(""));

      setTimeout(() => {
        if (inputsRef.current[0]) inputsRef.current[0].focus();
      }, 100);
    }
  }, [currentIndex, questions, isCompleted, resetTimer]);
  // Removed old timer effect

  const loadQuestions = async () => {
    try {
      setLoading(true);

      const response = await fetchPracticeQuestions("correct_spelling");
      if (response && response.data && response.data.length > 0) {
        const normalized = response.data.map((item) => ({
          id: item.ExerciseID || Math.random(),
          misspelledWord:
            item.incorrectText ||
            item.incorrect ||
            item.MisspelledWord ||
            item["Misspelled Word"] ||
            item.Misspelled ||
            item.Incorrect ||
            item.IncorrectWord_FR ||
            item["Incorrect Word"] ||
            "Error",
          correctAnswer:
            item.correctText ||
            item.correct ||
            item.CorrectAnswer_FR ||
            item["Correct Answer"] ||
            item.Answer ||
            item.Correct ||
            item["Correct Word"] ||
            "",
          instructionFr: item.Instruction_FR || "Corrigez l'orthographe",
          instructionEn: item.Instruction_EN || "Fix the spelling error",
          timeLimit: item.TimeLimitSeconds || item["Time Limit"] || 60,
          wordMeaningEn:
            item.englishTranslation ||
            item.wordMeaning ||
            item["Word Meaning_EN"] ||
            item["Word Meaning"] ||
            item.Meaning ||
            item.Translation ||
            "",
        }));
        setQuestions(normalized);
      } else {
        console.error("[CorrectSpelling] ❌ API returned empty data");
        setQuestions([]);
      }
    } catch (err) {
      console.error("[CorrectSpelling] ❌ Failed to load:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, value) => {
    if (showFeedback) return;

    // Check for deletion
    if (value === "") {
      const newInputs = [...userInputs];
      newInputs[index] = "";
      setUserInputs(newInputs);
      return;
    }

    const char = value.slice(-1); // Keep last char
    const newInputs = [...userInputs];
    newInputs[index] = char;
    setUserInputs(newInputs);

    if (index < userInputs.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (showFeedback) return;

    if (e.key === "Backspace") {
      if (userInputs[index] === "" && index > 0) {
        // Current is empty, move back + focus
        inputsRef.current[index - 1]?.focus();
      }
      // If current is not empty, onChange will handle clearance
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < userInputs.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, e) => {
    if (showFeedback) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!pastedData) return;

    // Split paste content
    const chars = pastedData.split("");
    const newInputs = [...userInputs];

    // Fill starting from the focused index
    let filledCount = 0;
    for (let i = 0; i < chars.length; i++) {
      const targetIndex = index + i;
      if (targetIndex < newInputs.length) {
        newInputs[targetIndex] = chars[i];
        filledCount++;
      }
    }

    setUserInputs(newInputs);

    // Focus the next empty input or the last filled one
    const nextIndex = Math.min(index + filledCount, newInputs.length - 1);
    if (inputsRef.current[nextIndex]) {
      inputsRef.current[nextIndex].focus();
    }
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    // Helper must be accessible here or duplicated if scoped inside effect.
    // Moving helper to top level or memoizing is better, but simple duplication or hoist is fine for now.
    // Let's rely on cleaning the correctAnswer from state or re-cleaning.

    // Better: Helper function defined inside component body is accessible here.
    // Wait, the previous edit put `cleanString` inside component body before useEffect.
    // So good to go.

    const userAnswer = userInputs.join("");
    // We must clean the right answer same way to ensure match
    const rightAnswer = currentQuestion?.correctAnswer
      ? currentQuestion.correctAnswer
          .trim()
          .replace(/\u200B/g, "")
          .normalize("NFC")
      : "";

    const correct = userAnswer.toLowerCase() === rightAnswer.toLowerCase();

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setFeedbackState("correct");
      setScore((prev) => prev + 1);
    } else {
      setFeedbackState("incorrect");
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setFeedbackState("neutral");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Progress
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType="Correct the spelling"
        instructionFr={
          currentQuestion?.instructionFr || "Corrigez l'orthographe"
        }
        instructionEn={currentQuestion?.instructionEn || "Correct the spelling"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={
          (userInputs.every((i) => i !== "") && !showFeedback) || showFeedback
        }
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : "CHECK"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
        feedbackMessage={feedbackMessage}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-4xl">
          {/* Hint / Context */}
          {(currentQuestion?.meaning ||
            currentQuestion?.wordMeaningEn ||
            currentQuestion?.instructionFr) && (
            <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-lg text-sm font-medium mb-8">
              {currentQuestion.meaning || currentQuestion.wordMeaningEn || ""}
            </div>
          )}

          {/* Misspelled Word */}
          <div className="mb-12 text-center">
            <span className="text-3xl md:text-4xl font-medium text-slate-600 dark:text-slate-300 tracking-wide">
              {currentQuestion?.misspelledWord}
            </span>
          </div>

          {/* Input Boxes */}
          <div className="flex flex-nowrap justify-center gap-2 mb-8 max-w-full overflow-x-auto pb-2 px-2 scrollbar-hide">
            <SegmentedInput
              values={userInputs}
              onChange={(idx, val) => handleInputChange(idx, val)}
              onKeyDown={(idx, e) => handleKeyDown(idx, e)}
              onPaste={(idx, e) => handlePaste(idx, e)}
              disabled={showFeedback}
              showFeedback={showFeedback}
              isCorrect={isCorrect}
              inputRefs={inputsRef}
            />
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
