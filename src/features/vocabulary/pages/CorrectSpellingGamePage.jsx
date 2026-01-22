import React, { useState, useEffect, useRef } from "react";
import { Loader2, X, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";

export default function CorrectSpellingGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackState, setFeedbackState] = useState("neutral");
  const [timer, setTimer] = useState(60);

  const inputsRef = useRef([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      const currentQ = questions[currentIndex];
      setTimer(parseInt(currentQ?.timeLimit) || 60);

      const answer = currentQ.correctAnswer
        ? currentQ.correctAnswer.trim()
        : "";
      setUserInputs(new Array(answer.length).fill(""));

      setTimeout(() => {
        if (inputsRef.current[0]) inputsRef.current[0].focus();
      }, 100);
    }
  }, [currentIndex, questions, isCompleted]);

  useEffect(() => {
    if (!loading && !isCompleted && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, loading, isCompleted]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions(
        "C2_Writing_Correct spelling",
      );
      if (!response || !response.data || response.data.length === 0) {
        console.warn("Primary sheet empty, checking alternates...");
        // Could fetch alternate here if needed
      }
      if (response && response.data && response.data.length > 0) {
        const normalized = response.data.map((item) => ({
          id: item.ExerciseID || Math.random(),
          misspelledWord:
            item.MisspelledWord ||
            item["Misspelled Word"] ||
            item.Misspelled ||
            item.Incorrect ||
            item.IncorrectWord_FR ||
            item["Incorrect Word"] ||
            "Error",
          correctAnswer:
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
            item["Word Meaning_EN"] ||
            item["Word Meaning"] ||
            item.Meaning ||
            item.Translation ||
            "",
        }));
        setQuestions(normalized);
      } else {
        console.error("API returned empty data");
        setQuestions([]);
      }
    } catch (err) {
      console.error("Failed to load practice questions:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (index, value) => {
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
    if (e.key === "Backspace") {
      if (userInputs[index] === "" && index > 0) {
        // Current is empty, move back + focus
        inputsRef.current[index - 1]?.focus();
      }
      // If current is not empty, onChange will handle clearance
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!pastedData) return;

    const chars = pastedData.split("").slice(0, userInputs.length);
    const newInputs = [...userInputs];

    // Fill inputs starting from the first one (or active one? - usually filling all is clearer for this simple game)
    // Actually let's just fill from left to right as much as we can, regardless of check?
    // Let's assume we overwrite from start.
    chars.forEach((char, i) => {
      if (i < newInputs.length) {
        newInputs[i] = char;
      }
    });

    setUserInputs(newInputs);

    // Focus the next empty input or the last filled one
    const nextIndex = Math.min(chars.length, newInputs.length - 1);
    if (inputsRef.current[nextIndex]) {
      inputsRef.current[nextIndex].focus();
    }
  };

  const handleSubmit = () => {
    const userAnswer = userInputs.join("");
    const rightAnswer = questions[currentIndex].correctAnswer.trim();

    if (userAnswer.toLowerCase() === rightAnswer.toLowerCase()) {
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
  // Calculate progress properly
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  let submitLabel = "Submit";
  if (currentIndex === questions.length - 1) submitLabel = "Finish";

  const timerString = `0:${timer.toString().padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <PracticeGameLayout
      questionType="Correct the spelling"
      instructionFr={currentQuestion?.instructionFr || "Corrigez l'orthographe"}
      instructionEn={currentQuestion?.instructionEn || "Correct the spelling"}
      progress={progress}
      isGameOver={isCompleted}
      score={0} // Tracking "answered correctly" isn't explicitly shown in game over screen of this layout usually, but passed anyway
      totalQuestions={questions.length}
      onExit={() => navigate("/vocabulary/practice")}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={userInputs.every((i) => i !== "")}
      showSubmitButton={true}
      submitLabel={currentIndex === questions.length - 1 ? "Finish" : "Submit"}
      timerValue={timerString}
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
          {userInputs.map((val, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              maxLength={1}
              value={val}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 border-2 rounded-xl text-center text-xl sm:text-2xl md:text-3xl font-bold uppercase transition-all bg-transparent focus:outline-none focus:border-sky-400 focus:shadow-md shrink-0",
                feedbackState === "incorrect"
                  ? "border-red-400 text-red-600 bg-red-50"
                  : feedbackState === "correct"
                    ? "border-green-400 text-green-600 bg-green-50"
                    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200",
              )}
            />
          ))}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
