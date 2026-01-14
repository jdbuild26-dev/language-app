import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";

export default function FillInBlankGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]); // Array of characters
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackState, setFeedbackState] = useState("neutral"); // neutral, correct, incorrect

  // Timer for display (optional usage ideally from Sheet)
  const [timer, setTimer] = useState(60);

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
    if (!loading && !isCompleted && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, loading, isCompleted]);

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
    if (!value) return;
    const char = value.slice(-1).toUpperCase();
    const newInputs = [...userInputs];
    newInputs[index] = char;
    setUserInputs(newInputs);

    if (index < userInputs.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !userInputs[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const userAnswer = userInputs.join("");
    const correctAnswer =
      questions[currentIndex].CorrectAnswer.trim().toUpperCase();

    if (userAnswer === correctAnswer) {
      setFeedbackState("correct");
      setTimeout(() => {
        handleNext();
      }, 1000);
    } else {
      setFeedbackState("incorrect");
      setTimeout(() => setFeedbackState("neutral"), 1000);
    }
  };

  const handleNext = () => {
    setFeedbackState("neutral");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  let submitLabel = "Submit";
  if (currentIndex === questions.length - 1) submitLabel = "Finish";

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
    <PracticeGameLayout
      questionType="Fill in the Blank"
      instructionFr={currentQuestion?.Instruction_FR || "Complétez la phrase"}
      instructionEn={currentQuestion?.Instruction_EN || "Complete the sentence"}
      progress={progress}
      isGameOver={isCompleted}
      score={currentIndex} // Just showing progress as score roughly for now
      totalQuestions={questions.length}
      onExit={() => navigate("/vocabulary/practice")}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={userInputs.every((i) => i !== "")}
      showSubmitButton={true}
      submitLabel={submitLabel}
      timerValue={timerString}
    >
      <div className="flex flex-col items-center">
        {/* Content Box */}
        <div className="p-8 w-full text-center leading-loose max-w-2xl bg-white dark:bg-transparent">
          <div className="text-xl md:text-3xl text-slate-800 dark:text-slate-100 leading-relaxed text-center flex flex-wrap justify-center items-center gap-3">
            {prefix && <span>{prefix}</span>}

            <div
              className={cn(
                "inline-flex gap-1 mx-1",
                feedbackState === "incorrect" && "animate-shake",
                feedbackState === "correct" && "text-green-500"
              )}
            >
              {userInputs.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={cn(
                    "w-10 h-14 md:w-12 md:h-16 border-b-4 border-gray-300 focus:border-blue-500 rounded-none text-center text-3xl font-bold uppercase focus:outline-none bg-transparent transition-all",
                    feedbackState === "incorrect"
                      ? "border-red-300 text-red-600"
                      : feedbackState === "correct"
                      ? "border-green-300 text-green-600"
                      : "text-slate-900 dark:text-white"
                  )}
                />
              ))}
            </div>

            {suffix && <span>{suffix}</span>}
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
