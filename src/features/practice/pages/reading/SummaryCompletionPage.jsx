import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { fetchSummaryCompletionData } from "@/services/vocabularyApi";

export default function SummaryCompletionPage() {
  const handleExit = usePracticeExit();

  // State
  const [passageSegments, setPassageSegments] = useState([]);
  const [blanksData, setBlanksData] = useState({});
  const [wordBank, setWordBank] = useState([]);
  const [passageTitle, setPassageTitle] = useState("Summary Completion");

  const [answers, setAnswers] = useState({}); // { 1: "option", 2: "option" }
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSummaryCompletionData();
        if (data) {
          // Handle if data is array or single object
          console.log("[SummaryCompletion] Raw data received:", data);
          const row = Array.isArray(data) ? data[0] : data;
          console.log("[SummaryCompletion] Processing row:", row);

          setPassageSegments(row.passageSegments || []);
          const blanks = row.blanksData || {};
          setBlanksData(blanks);

          console.log(
            "[SummaryCompletion] State updates -> segments:",
            row.passageSegments,
            "blanks:",
            blanks,
          );

          // Generate word bank from correct answers
          const options = Object.values(blanks).map((b) =>
            typeof b === "object" ? b.correct : b,
          );
          // Shuffle options (simple shuffle)
          setWordBank(options.sort(() => Math.random() - 0.5));

          if (row.title) setPassageTitle(row.title);
        }
      } catch (err) {
        console.error("Failed to load summary completion data", err);
        setError("Failed to load practice data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Timer configuration
  const { timerString } = useExerciseTimer({
    duration: 300,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) {
        handleSubmit();
      }
    },
    isPaused: showFeedback || isCompleted || loading,
  });

  const handleOptionSelect = (blankId, value) => {
    if (showFeedback) return;
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const checkAnswers = () => {
    if (Object.keys(blanksData).length === 0) return;

    let correctCount = 0;
    const totalBlanks = Object.keys(blanksData).length;

    Object.keys(blanksData).forEach((key) => {
      const id = parseInt(key);
      const correctVal =
        typeof blanksData[id] === "object"
          ? blanksData[id].correct
          : blanksData[id];
      if (answers[id] === correctVal) {
        correctCount++;
      }
    });

    const verifyAllCorrect = correctCount === totalBlanks;
    setIsCorrect(verifyAllCorrect);
    setScore(correctCount);

    if (verifyAllCorrect) {
      setFeedbackMessage("Excellent! All answers are correct.");
    } else {
      setFeedbackMessage(
        `You got ${correctCount} out of ${totalBlanks} correct.`,
      );
    }

    setShowFeedback(true);
    if (verifyAllCorrect) {
      setIsCompleted(true);
    }
  };

  const handleSubmit = () => {
    if (showFeedback) return;
    checkAnswers();
  };

  const handleContinue = () => {
    // For now, simple exit. Could allow retry if wrong.
    setIsCompleted(true);
    handleExit();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !passageSegments.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Error Loading Practice
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {error || "No data available."}
          </p>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const allAnswered = Object.keys(blanksData).every((key) => answers[key]);
  const progress =
    (Object.keys(answers).length / Object.keys(blanksData).length) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Summary Completion"
        instructionFr="Complétez le résumé"
        instructionEn="Complete the summary using the words provided"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={Object.keys(blanksData).length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={allAnswered && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-6 p-4 h-full md:items-stretch overflow-hidden">
          {/* Main Passage Area */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {passageTitle}
              </h3>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <div className="text-lg md:text-xl leading-loose text-slate-800 dark:text-slate-100 font-serif">
                {passageSegments.map((segment, index) => {
                  if (typeof segment === "string") {
                    return <span key={index}>{segment}</span>;
                  } else if (segment.id) {
                    // It's a blank!
                    const id = segment.id;
                    const userAnswer = answers[id];
                    const correctVal =
                      typeof blanksData[id] === "object"
                        ? blanksData[id].correct
                        : blanksData[id];
                    const isCorrectAnswer = userAnswer === correctVal;

                    return (
                      <span
                        key={index}
                        className="mx-1 inline-flex items-center relative"
                      >
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-bold text-slate-500 mr-1 min-w-[20px]">
                          {id}
                        </span>

                        {/* Dropdown */}
                        <div className="relative inline-block mx-1">
                          <select
                            value={userAnswer || ""}
                            onChange={(e) =>
                              handleOptionSelect(id, e.target.value)
                            }
                            disabled={showFeedback}
                            className={cn(
                              "appearance-none bg-slate-50 dark:bg-slate-900 border-2 rounded-lg px-3 py-1 pr-8 text-base font-medium outline-none transition-all cursor-pointer shadow-sm",
                              userAnswer
                                ? "border-sky-500 text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-800"
                                : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 min-w-[100px]",
                              showFeedback &&
                                isCorrectAnswer &&
                                "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
                              showFeedback &&
                                !isCorrectAnswer &&
                                "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
                            )}
                          >
                            <option value="" disabled>
                              Select...
                            </option>
                            {wordBank.map((word, i) => (
                              <option key={i} value={word}>
                                {word}
                              </option>
                            ))}
                          </select>

                          {/* Arrow Icon */}
                          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                            <svg
                              className="w-4 h-4 text-slate-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        {showFeedback && !isCorrectAnswer && (
                          <span className="text-sm font-bold text-green-600 ml-1">
                            ({correctVal})
                          </span>
                        )}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Word Bank Display (Optional helper) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Word Bank:
              </p>
              <div className="flex flex-wrap gap-2">
                {wordBank.map((word, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-600 dark:text-slate-300"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel="FINISH"
        />
      )}
    </>
  );
}
