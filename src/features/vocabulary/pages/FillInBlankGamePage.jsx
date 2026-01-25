import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import SegmentedInput from "../components/ui/SegmentedInput";
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

  // Timer Hook
  const currentQuestion = questions[currentIndex];
  // Calculate duration securely
  const timerDuration = parseInt(currentQuestion?.TimeLimitSeconds) || 60;

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
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  // Reset logic when question changes
  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      // Pre-fill logic moved here or kept?
      // Logic below depends on currentQuestion.
      // We need to coordinate resetTimer with this.
      resetTimer();

      const answer = currentQuestion?.CorrectAnswer
        ? currentQuestion.CorrectAnswer.trim().toUpperCase()
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
  }, [currentIndex, questions, isCompleted, resetTimer]);
  // removed 'currentQuestion' dependency to avoid cyclic dependency if defined inside component body before this effect.
  // Actually currentQuestion is defined above hook now.

  // Old Timer Tick Effect Removed

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

    // Validate: Allow only letters (basic Latin + French accents)
    if (!/^[A-Z\u00C0-\u00FF]$/.test(char)) {
      return; // Ignore invalid characters
    }

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

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);

    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Constants re-added
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Sentence Parsing
  const sentenceParts = currentQuestion?.SentenceWithBlank?.split("______") || [
    "",
    "",
  ];
  const prefix = sentenceParts[0];
  const suffix = sentenceParts[1] || "";

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
          <div className="w-fit max-w-full text-left">
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
                          <SegmentedInput
                            values={userInputs}
                            onChange={(idx, val) => handleInputChange(idx, val)}
                            onKeyDown={(idx, e) => handleKeyDown(idx, e)}
                            disabled={showFeedback}
                            hints={[0, userInputs.length - 1]}
                            showFeedback={showFeedback}
                            isCorrect={isCorrect}
                            inputRefs={inputsRef}
                          />
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
