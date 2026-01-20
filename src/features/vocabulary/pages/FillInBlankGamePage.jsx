import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

export default function FillInBlankGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]); // Array of characters
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  // Timer for display (optional usage ideally from Sheet)
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(true);

  const inputsRef = useRef([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      const currentQ = questions[currentIndex];
      setTimer(parseInt(currentQ?.TimeLimitSeconds) || 60);

      const answer = currentQ.CorrectAnswer
        ? currentQ.CorrectAnswer.trim()
        : "";
      setUserInputs(new Array(answer.length).fill(""));

      // Auto-focus first input
      setTimeout(() => {
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
        }
      }, 100);
    }
  }, [currentIndex, questions, isCompleted]);

  // Timer Tick
  useEffect(() => {
    if (!loading && !isCompleted && timer > 0 && timerActive) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, loading, isCompleted, timerActive]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("C1_Writing_FITB");
      if (response && response.data) {
        setQuestions(response.data);
      }
    } catch (err) {
      console.error("Failed to load practice questions:", err);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...userInputs];

    if (!value) {
      // Allow clearing the input
      newInputs[index] = "";
      setUserInputs(newInputs);
      return;
    }

    const char = value.slice(-1).toUpperCase();
    newInputs[index] = char;
    setUserInputs(newInputs);

    if (index < userInputs.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (userInputs[index]) {
        // Clear current input
        const newInputs = [...userInputs];
        newInputs[index] = "";
        setUserInputs(newInputs);
      } else if (index > 0) {
        // Move to previous input and clear it
        const newInputs = [...userInputs];
        newInputs[index - 1] = "";
        setUserInputs(newInputs);
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const userAnswer = userInputs.join("");
    const correctAnswer =
      questions[currentIndex].CorrectAnswer.trim().toUpperCase();

    const correct = userAnswer === correctAnswer;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    setTimerActive(false); // Stop timer

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setTimerActive(true); // Resume timer
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Sentence Parsing
  const sentenceParts = currentQuestion?.SentenceWithBlank?.split("______") || [
    "",
    "",
  ];
  const prefix = sentenceParts[0];
  const suffix = sentenceParts[1] || "";

  const timerString = `0:${timer.toString().padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <>
      <PracticeGameLayout
        questionType="Fill in the Blank"
        instructionFr={currentQuestion?.Instruction_FR || "Complétez la phrase"}
        instructionEn={
          currentQuestion?.Instruction_EN || "Complete the sentence"
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInputs.every((i) => i !== "") && !showFeedback}
        showSubmitButton={true}
        submitLabel="Submit"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center">
          {/* Content Box */}
          <div className="p-8 w-full text-center leading-loose max-w-2xl bg-white dark:bg-transparent">
            <div className="text-xl md:text-3xl text-slate-800 dark:text-slate-100 leading-relaxed text-center flex flex-wrap justify-center items-center gap-3">
              {prefix && <span>{prefix}</span>}

              <div className="inline-flex gap-1 mx-1">
                {userInputs.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputsRef.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-14 md:w-12 md:h-16 border-b-4 border-gray-300 focus:border-blue-500 rounded-none text-center text-3xl font-bold uppercase focus:outline-none bg-transparent transition-all text-slate-900 dark:text-white"
                  />
                ))}
              </div>

              {suffix && <span>{suffix}</span>}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQuestion.CorrectAnswer : null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
