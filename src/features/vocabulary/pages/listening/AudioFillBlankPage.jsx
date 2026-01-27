import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2 } from "lucide-react";
import AudioPlayer from "../../components/shared/AudioPlayer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import SegmentedInput from "../../components/ui/SegmentedInput";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useNavigate } from "react-router-dom";

export default function AudioFillBlankPage() {
  const navigate = useNavigate();
  const { speak } = useTextToSpeech();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInputs, setUserInputs] = useState([]);

  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const inputsRef = useRef([]);

  // Timer Hook
  const { timerString, resetTimer } = useExerciseTimer({
    duration: 60,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) {
        handleSubmit();
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  useEffect(() => {
    loadData();
  }, []);

  // Initialize inputs when question changes
  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      const currentQ = questions[currentIndex];
      const answer = currentQ.answer
        ? currentQ.answer.trim().toUpperCase()
        : "";

      const initialInputs = new Array(answer.length).fill("");

      // Hint logic: Pre-fill first and last characters if answer is long enough
      if (answer.length > 0) {
        initialInputs[0] = answer[0];
        if (answer.length > 1) {
          initialInputs[answer.length - 1] = answer[answer.length - 1];
        }
      }

      setUserInputs(initialInputs);
      inputsRef.current = inputsRef.current.slice(0, answer.length);

      setTimeout(() => {
        const firstEmptyIndex = initialInputs.findIndex((val) => val === "");
        if (firstEmptyIndex !== -1 && inputsRef.current[firstEmptyIndex]) {
          inputsRef.current[firstEmptyIndex].focus();
        } else if (inputsRef.current[1] && initialInputs[1] === "") {
          inputsRef.current[1].focus();
        }
      }, 500);
    }
  }, [currentIndex, questions, isCompleted]);

  // Audio Auto-play
  useEffect(() => {
    if (!loading && !isCompleted && questions.length > 0) {
      const currentQ = questions[currentIndex];
      if (currentQ?.fullSentence) {
        const t = setTimeout(() => {
          speak(currentQ.fullSentence, "fr-FR", 0.85);
        }, 800);
        return () => clearTimeout(t);
      }
    }
  }, [currentIndex, loading, isCompleted, questions]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("B5_Fill blanks_Audio");
      if (response && response.data) {
        const transformed = response.data.map((item) => ({
          id: item["ExerciseID"],
          fullSentence: item["CompleteSentence"] || item["Audio"],
          displaySentence: item["SentenceWithBlank"],
          answer: item["CorrectAnswer"],
          instruction:
            item["Instruction_EN"] || "Listen and complete the sentence",
        }));
        setQuestions(transformed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, value) => {
    if (showFeedback) return;

    const newInputs = [...userInputs];

    if (!value) {
      newInputs[index] = "";
      setUserInputs(newInputs);
      return;
    }

    const char = value.slice(-1).toUpperCase();
    // Allow letters, numbers, and common punctuation (apostrophe, hyphen, space, etc.)
    if (!/^[A-Z0-9\u00C0-\u00FF\s\-'.,!?]$/.test(char)) {
      return;
    }

    newInputs[index] = char;
    setUserInputs(newInputs);

    if (index < userInputs.length - 1) {
      const currentQ = questions[currentIndex];
      const answer = currentQ.answer.trim();
      const isNextHint = index + 1 === answer.length - 1 && answer.length > 1;
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (showFeedback) return;

    if (e.key === "Backspace") {
      const currentQ = questions[currentIndex];
      const answer = currentQ.answer ? currentQ.answer.trim() : "";
      const isHint = (idx) => {
        if (answer.length <= 0) return false;
        if (idx === 0) return true;
        if (answer.length > 1 && idx === answer.length - 1) return true;
        return false;
      };

      if (userInputs[index] && !isHint(index)) {
        const newInputs = [...userInputs];
        newInputs[index] = "";
        setUserInputs(newInputs);
      } else if (index > 0) {
        const prevIndex = index - 1;
        inputsRef.current[prevIndex]?.focus();
        if (!isHint(prevIndex)) {
          const newInputs = [...userInputs];
          newInputs[prevIndex] = "";
          setUserInputs(newInputs);
        }
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < userInputs.length - 1) {
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const currentQ = questions[currentIndex];
    const userAnswer = userInputs.join("");
    const normalizedAnswer = currentQ.answer
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\u00C0-\u00FF]/g, ""); // Keep only letters and numbers
    const normalizedInput = userAnswer
      .toUpperCase()
      .replace(/[^A-Z0-9\u00C0-\u00FF]/g, ""); // Keep only letters and numbers

    const correct = normalizedInput === normalizedAnswer;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((s) => s + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setUserInputs([]);
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const currentQ = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  return (
    <>
      <PracticeGameLayout
        questionTypeFr="Remplissez les blancs"
        questionTypeEn="Fill in the blank (Audio)"
        instructionFr="Écoutez et complétez la phrase"
        instructionEn={
          currentQ?.instruction || "Listen and complete the sentence"
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={
          userInputs.length > 0 &&
          userInputs.every((i) => i !== "") &&
          !showFeedback
        }
        showSubmitButton={true}
        submitLabel="Submit"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl px-4">
          <div className="mb-8">
            <AudioPlayer text={currentQ?.fullSentence || ""} />
          </div>

          <div className="text-lg md:text-xl font-medium text-center text-gray-800 dark:text-gray-100 mb-8 leading-relaxed w-full">
            {currentQ?.displaySentence.split("___").map((part, i, arr) => (
              <React.Fragment key={i}>
                <span className="leading-loose">{part}</span>
                {i < arr.length - 1 && (
                  <span className="inline-flex mx-2 align-middle shadow-sm rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                    <SegmentedInput
                      values={userInputs}
                      onChange={(idx, val) => handleInputChange(idx, val)}
                      onKeyDown={(idx, e) => handleKeyDown(idx, e)}
                      disabled={showFeedback}
                      hints={userInputs
                        .map((_, i) => {
                          const answerLength = currentQ.answer.length;
                          return i === 0 ||
                            (answerLength > 1 && i === answerLength - 1)
                            ? i
                            : -1;
                        })
                        .filter((i) => i !== -1)}
                      showFeedback={showFeedback}
                      isCorrect={isCorrect}
                      inputRefs={inputsRef}
                    />
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQ.answer : null}
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
