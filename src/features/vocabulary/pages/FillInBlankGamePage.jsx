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
        ? currentQ.CorrectAnswer.trim().toUpperCase()
        : "";

      // Pre-fill first and last characters as hints
      const initialInputs = new Array(answer.length).fill("");
      if (answer.length > 0) {
        initialInputs[0] = answer[0]; // First character hint
        if (answer.length > 1) {
          initialInputs[answer.length - 1] = answer[answer.length - 1]; // Last character hint
        }
      }
      setUserInputs(initialInputs);

      // Auto-focus second input (first is a hint)
      setTimeout(() => {
        if (inputsRef.current[1]) {
          inputsRef.current[1].focus();
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
      const isHint = (idx) => idx === 0 || idx === userInputs.length - 1;

      if (userInputs[index]) {
        // Clear current input if not a hint
        if (!isHint(index)) {
          const newInputs = [...userInputs];
          newInputs[index] = "";
          setUserInputs(newInputs);
        }
      } else if (index > 0) {
        // Move to previous input
        const prevIndex = index - 1;
        // Only clear and focus if previous is NOT a hint
        if (!isHint(prevIndex)) {
          const newInputs = [...userInputs];
          newInputs[prevIndex] = "";
          setUserInputs(newInputs);
          inputsRef.current[prevIndex]?.focus();
        } else {
          // If previous is hint, just strictly focus it (optional) or do nothing?
          // Focusing it lets user see they are at start, but they can't edit it.
          // Let's just focus it so navigation feels natural, but DO NOT CLEAR content.
          inputsRef.current[prevIndex]?.focus();
        }
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < userInputs.length - 1) {
      inputsRef.current[index + 1]?.focus();
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
        <div className="flex flex-col items-center w-full px-2">
          {/* Sentence with Inline Input Boxes */}
          <div className="w-full text-left">
            {/* Standard block layout for natural text wrapping */}
            <div className="text-lg md:text-xl text-slate-800 dark:text-slate-100 leading-relaxed font-medium py-8">
              {(() => {
                const fullSentence = currentQuestion?.SentenceWithBlank || "";
                // We split by space to handle word wrapping, but we need to identify the blank segment
                const words = fullSentence.split(" ");

                return words.map((word, idx) => {
                  const shouldUnderline = [
                    "soir,",
                    "ils",
                    "que",
                    "dorment.",
                  ].some((w) => word.toLowerCase().includes(w.toLowerCase()));

                  const isLast = idx === words.length - 1;
                  const spacer = !isLast ? " " : "";

                  if (word.includes("______")) {
                    return (
                      <React.Fragment key={idx}>
                        <span className="inline-flex gap-1 mx-1 align-baseline">
                          {userInputs.map((val, inputIdx) => {
                            const isHint =
                              inputIdx === 0 ||
                              inputIdx === userInputs.length - 1;
                            let borderColorClass =
                              "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200";

                            // Hint boxes get distinct styling
                            if (isHint) {
                              borderColorClass =
                                "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600";
                            }

                            if (showFeedback) {
                              borderColorClass = isCorrect
                                ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
                            }

                            return (
                              <input
                                key={inputIdx}
                                ref={(el) => (inputsRef.current[inputIdx] = el)}
                                type="text"
                                maxLength={1}
                                value={val}
                                onChange={(e) =>
                                  handleInputChange(inputIdx, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(inputIdx, e)}
                                disabled={showFeedback || isHint}
                                readOnly={isHint}
                                className={`
                                w-7 h-9 md:w-8 md:h-10 
                                border-2 rounded-md 
                                text-center text-base md:text-lg font-semibold uppercase 
                                shadow-sm transition-all duration-200
                                focus:outline-none focus:ring-2 
                                ${borderColorClass}
                                ${isHint ? "cursor-default" : ""}
                                dark:bg-gray-800 dark:text-white
                              `}
                              />
                            );
                          })}
                        </span>
                        {spacer}
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={idx}>
                      <span
                        className={
                          shouldUnderline
                            ? "underline decoration-red-500 decoration-2 underline-offset-8"
                            : ""
                        }
                      >
                        {word}
                      </span>
                      {spacer}
                    </React.Fragment>
                  );
                });
              })()}
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
