import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";
import { cn } from "@/lib/utils";

export default function FillInBlankGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]); // Array of characters
  const [timer, setTimer] = useState(60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackState, setFeedbackState] = useState("neutral"); // neutral, correct, incorrect

  const inputsRef = useRef([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      // Reset timer for new question
      const currentQ = questions[currentIndex];
      setTimer(parseInt(currentQ.TimeLimitSeconds) || 60);

      // Initialize inputs
      const answer = currentQ.CorrectAnswer.trim();
      setUserInputs(new Array(answer.length).fill(""));

      // Auto-focus first input
      setTimeout(() => {
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
        }
      }, 100);
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    let interval;
    if (!loading && !isCompleted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, isCompleted, timer]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("C1_Writing_FITB");
      if (response && response.data) {
        setQuestions(response.data);
      }
    } catch (err) {
      console.error("Failed to load practice questions:", err);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleInputChange = (index, value) => {
    if (!value) return;

    // Allow only single character
    const char = value.slice(-1).toUpperCase();

    // Update state
    const newInputs = [...userInputs];
    newInputs[index] = char;
    setUserInputs(newInputs);

    // Auto-focus next input
    if (index < userInputs.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !userInputs[index] && index > 0) {
      // If current input empty and backspace pressed, move back
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = () => {
    const userAnswer = userInputs.join("");
    const correctAnswer = currentQuestion.CorrectAnswer.trim().toUpperCase();

    if (userAnswer === correctAnswer) {
      setFeedbackState("correct");
      setTimeout(() => {
        handleNext();
      }, 1000);
    } else {
      setFeedbackState("incorrect");
      setTimeout(() => setFeedbackState("neutral"), 1000); // Reset shake
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <h1 className="text-3xl font-bold text-sky-600 mb-4">
          Practice Completed!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Great job on finishing the C1 Writing exercises.
        </p>
        <button
          onClick={() => navigate("/vocabulary/practice")}
          className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
        >
          Back to Practice
        </button>
      </div>
    );
  }

  // Parse sentence to split by blank
  // Assuming "______" (6 underscores) or similar in the question text "SentenceWithBlank"
  // But based on Excel, it looks like "______ (Statistacally), notre équipe..."
  // The provided image shows the blank integrated.
  // We'll replace the blank placeholder with our input box logic if we were rendering inline,
  // but looking at the design, it seems the sentence is displayed with a blank line,
  // and the inputs are separate below?
  //
  // Wait, the image shows:
  // "S t a t i _ _ _ _ _ _ , our team has a better chance..."
  // So the inputs ARE the blank in the sentence.
  // This is tricky if the blank is in the middle.
  //
  // Let's implement the layout where the sentence is displayed, and we overlay or insert the inputs.
  // For simplicity in V1, let's render the "SentenceWithBlank" but visually replace the "______" part with our inputs.

  const sentenceParts = currentQuestion.SentenceWithBlank.split("______");
  const prefix = sentenceParts[0];
  const suffix = sentenceParts[1] || "";

  // Extract the English hint if present in parens, e.g. "(Statistically)"
  // The Excel has: "______ (Statistacally), notre équipe..."
  // We might want to keep that hint visible as per the design in the image?
  // Image shows: "S t a t i ... , our team has..."
  // The image actually shows the user typing INTO the sentence structure.

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/vocabulary/practice")}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">
          Fill in the blank – {currentQuestion.Level}
        </h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        {/* Game Box */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Top Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              00:{timer.toString().padStart(2, "0")}
            </span>
            <h2 className="text-center font-semibold text-slate-800 dark:text-white absolute left-1/2 -translate-x-1/2">
              {currentQuestion.Instruction_FR ||
                "Complétez la phrase avec le mot correct"}
              <div className="text-xs font-normal text-slate-500 dark:text-slate-400">
                {currentQuestion.Instruction_EN ||
                  "Complete the sentence with the correct word"}
              </div>
            </h2>
            <button
              onClick={() => navigate("/vocabulary/practice")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Question Area */}
          <div className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px]">
            {/* Sentence Construction */}
            <div className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed text-center mb-12 flex flex-wrap justify-center items-center gap-2">
              {/* We render the sentence parts. If the blank is at start, prefix is empty. */}
              {prefix && <span>{prefix}</span>}

              {/* INPUT GROUP */}
              <div
                className={cn(
                  "inline-flex gap-1 mx-1 transition-transform",
                  feedbackState === "incorrect" && "animate-shake text-red-500",
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
                      "w-8 h-10 md:w-10 md:h-12 border-2 rounded-lg text-center text-xl md:text-2xl font-bold uppercase focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all",
                      feedbackState === "incorrect"
                        ? "border-red-300 bg-red-50 text-red-600"
                        : feedbackState === "correct"
                        ? "border-green-300 bg-green-50 text-green-600"
                        : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    )}
                  />
                ))}
              </div>

              {suffix && <span>{suffix}</span>}
            </div>

            {/* Separator */}
            <div className="w-full h-px bg-slate-200 dark:bg-slate-700 mb-8"></div>

            {/* Footer / Submit */}
            <div className="w-full flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-sky-500/30 transition-all hover:scale-105 active:scale-95"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>

        {/* Debug/Design Compare Box (As per request to match design) */}
        {/* <div className="mt-8 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded md:hidden">
            Design Checking Mode
        </div> */}
      </div>
    </div>
  );
}
