import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function FillBlanksGroupPage({ type = "simple" }) {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [inputs, setInputs] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  // We need to store focus state to hide hints when input is focused
  const [focusedInput, setFocusedInput] = useState(null);

  const currentQuestion = questions[currentIndex];
  // Default to 60 seconds if not specified
  const timerDuration = currentQuestion?.timeLimitSeconds || 60;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const file =
          type === "question"
            ? "grammar/grammar_fill_blanks_question.csv"
            : "grammar/grammar_fill_blanks.csv";
        const data = await loadMockCSV(file);

        // Transform blank/hint strings to array if needed (though CSV loader usually handles basic strings,
        // we might get JSON string fields if consistent with previous patterns.
        // Based on my CSV creation, they are simple strings for single blank or maybe JSON for mulitple.
        // Let's safe parse or wrap in array if it's a single string)

        const transformed = data.map((item) => {
          // Basic normalization
          return {
            ...item,
            // If blanks/hints are JSON strings, parse them. If simple strings, wrap in array if needed or use as is.
            // My CSVs used simple strings for blanks/hints. But code below assumes possibly multiple blanks.
            // Let's ensure they are arrays for consistent processing.
            blanks: Array.isArray(item.blanks) ? item.blanks : [item.blanks],
            hints: Array.isArray(item.hints) ? item.hints : [item.hints],
          };
        });

        setQuestions(transformed || []);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [type]);

  // Reset state on question change
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setInputs({});
      setShowFeedback(false);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleInputChange = (index, value) => {
    setInputs((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    // Validate inputs
    // We assume blank order corresponds to input order
    // But wait, the sentence structure is "J'ai ___ un chat."
    // We need to render the sentence and inject inputs at ___

    // Check correctness
    let allCorrect = true;
    const blankValues = currentQuestion.blanks;

    // We need to map inputs to blanks.
    // This logic depends on how we render.
    // If we have 1 blank, input index 0 corresponds to blank 0.

    for (let i = 0; i < blankValues.length; i++) {
      const userVal = (inputs[i] || "").trim().toLowerCase();
      const correctVal = blankValues[i].trim().toLowerCase();
      if (userVal !== correctVal) {
        allCorrect = false;
      }
    }

    setIsCorrect(allCorrect);
    setFeedbackMessage(getFeedbackMessage(allCorrect));
    setShowFeedback(true);

    if (allCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Helper to render sentence with inputs
  const renderSentence = () => {
    const parts = currentQuestion.sentence.split("___");
    // parts length will be blanks.length + 1

    const elements = [];
    parts.forEach((part, index) => {
      elements.push(
        <span key={`text-${index}`} className="leading-loose">
          {part}
        </span>,
      );

      if (index < parts.length - 1) {
        // Render input
        const hint = currentQuestion.hints[index] || "";
        const val = inputs[index] || "";
        const isFocused = focusedInput === index;

        const isWrong =
          showFeedback &&
          val.toLowerCase() !== currentQuestion.blanks[index].toLowerCase();
        const isRight =
          showFeedback &&
          val.toLowerCase() === currentQuestion.blanks[index].toLowerCase();

        elements.push(
          <span
            key={`input-${index}`}
            className="inline-block relative mx-1 align-bottom"
          >
            <input
              type="text"
              value={val}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onFocus={() => setFocusedInput(index)}
              onBlur={() => setFocusedInput(null)}
              disabled={showFeedback}
              className={cn(
                "border-b-2 bg-transparent text-center outline-none transition-all w-32 font-medium text-lg px-1",
                "border-slate-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400",
                // Placeholder styling simulation mechanism if we want hint to disappear on CLICK/FOCUS
                // Native placeholder disappears on type usually, but user asked: "Word will be given in English... when they click on it... the English word goes"
                // Standard placeholder behavior is: shows if empty. Disappears if typed.
                // BUT user said "when they click on it". So on FOCUS.
                // We can use actual placeholder prop but manage visibility via focus state/value?
                // Actually, standard placeholder stays until type.
                // To make it vanish on focus, we iterate:
                val === "" && !isFocused
                  ? "text-transparent"
                  : "text-slate-900 dark:text-white", // Hide value if empty+not focused? No, value is empty.

                isWrong && "border-red-500 text-red-600",
                isRight && "border-green-500 text-green-600",
              )}
              autoComplete="off"
            />
            {/* Custom Placeholder Overlay that disappears on Focus */}
            {val === "" && !isFocused && (
              <span className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none italic">
                {hint}
              </span>
            )}
          </span>,
        );
      }
    });
    return elements;
  };

  return (
    <>
      <PracticeGameLayout
        questionType={
          type === "question" ? "Question & Answer" : "Fill in the Blanks"
        }
        instructionFr="Complétez la phrase"
        instructionEn="Fill in the blanks with the correct French words"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={true} // Allow check anytime? Or check if inputs filled? User didn't specify, standard is usually enabled.
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-6 min-h-[50vh] gap-8">
          {/* Question Prompt (only for 'question' type) */}
          {type === "question" && currentQuestion.question && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/50 shadow-sm w-full max-w-2xl text-center">
              <h3 className="text-xl md:text-2xl font-bold text-indigo-900 dark:text-indigo-200">
                {currentQuestion.question}
              </h3>
            </div>
          )}

          {/* Sentence Area */}
          <div className="text-2xl md:text-3xl lg:text-4xl leading-relaxed text-center text-slate-800 dark:text-slate-100 font-medium max-w-3xl">
            {renderSentence()}
          </div>

          {/* Translation (Shown after submission) */}
          {showFeedback && currentQuestion?.translation && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium italic">
                {currentQuestion.translation}
              </p>
            </div>
          )}
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect ? `Correct: ${currentQuestion.blanks.join(", ")}` : null
          }
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
