import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { fetchCompletePassageData } from "@/services/vocabularyApi";
import { loadMockCSV } from "@/utils/csvLoader";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";

import { useLanguage } from "@/contexts/LanguageContext";

/* 
  Data for the exercise: 
  A longer passage with multiple blanks.
*/
// Consants removed - migrated to CSV

export default function CompletePassagePage() {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();

  // State
  const [passageSegments, setPassageSegments] = useState([]);
  const [blanksData, setBlanksData] = useState({});
  const [fullText, setFullText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [answers, setAnswers] = useState({}); // { 1: "option", 2: "option" }
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let data = null;
      try {
        setLoading(true);
        console.log(
          "[CompletePassagePage] Attempting to fetch data from BACKEND API...",
        );
        data = await fetchCompletePassageData({ learningLang, knownLang });
        if (data) {
          console.log(
            "[CompletePassagePage] Data Source: BACKEND API (Success)",
          );
        }
      } catch (err) {
        console.warn(
          "[CompletePassagePage] Backend fetch failed, falling back to local CSV",
          err,
        );
        // Fallback to CSV
        try {
          console.log(
            "[CompletePassagePage] Attempting to fetch data from LOCAL CSV...",
          );
          data = await loadMockCSV(
            "practice/reading/complete_passage_dropdown.csv",
            { learningLang, knownLang }
          );
          if (data && data.length > 0) {
            console.log(
              "[CompletePassagePage] Data Source: LOCAL CSV (Success)",
            );
          }
        } catch (csvErr) {
          console.error("CSV Fallback failed", csvErr);
          setError("Failed to load practice data from both API and CSV.");
        }
      }

      if (data) {
        // If API returns array (like CSV loader did)
        const row = Array.isArray(data) ? data[0] : data;
        setCurrentQuestion(row);

        setPassageSegments(row.passageSegments || []);
        setBlanksData(row.blanksData || {});
        setFullText(row.fullText || "");
      } else if (!error) {
        // If we didn't set error above but have no data
        // setError("No data found."); // Optional: verify if we want to show error here
      }
      setLoading(false);
    };
    fetchData();
  }, [learningLang, knownLang]);

  // Timer: 8 minutes (480s) to match screenshot mostly
  const { timerString, resetTimer, pauseTimer } = useExerciseTimer({
    duration: currentQuestion?.timeLimitSeconds || 480,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) {
        checkAnswers(true);
      }
    },
    isPaused: showFeedback || isCompleted || loading,
  });

  const handleOptionSelect = (blankId, value) => {
    if (showFeedback) return;
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const checkAnswers = (timeExpired = false) => {
    // Count correct answers
    let correctCount = 0;
    const totalBlanks = Object.keys(blanksData).length;

    Object.keys(blanksData).forEach((key) => {
      const id = parseInt(key);
      if (answers[id] === blanksData[id].correct) {
        correctCount++;
      }
    });

    const verifyAllCorrect = correctCount === totalBlanks;
    setIsCorrect(verifyAllCorrect);

    if (verifyAllCorrect) {
      setScore(correctCount);
      setFeedbackMessage("Excellent! All answers are correct.");
    } else {
      setScore(correctCount);
      setFeedbackMessage(
        timeExpired
          ? "Time's up!"
          : `You got ${correctCount} out of ${totalBlanks} correct.`,
      );
    }

    setShowFeedback(true);
    if (verifyAllCorrect) {
      setIsCompleted(true);
    }
  };

  const handleSubmit = () => {
    if (showFeedback) return;
    // Verify that all are selected? Or allow partial?
    // Let's require all to be selected for "Check", or at least warn logic.
    // Usually "Check" is available.
    checkAnswers();
  };

  const handleContinue = () => {
    // Logic after feedback
    if (isCorrect) {
      // Exit or show completion
      setIsCompleted(true);
      handleExit(); // Or manual exit
    } else {
      // Allow retry? Or finish?
      // Usually practice games allow retry or just show results.
      // Based on other games, "Continue" might go to next question.
      // Since this is a single page game, "Continue" could finish.
      setIsCompleted(true);
      handleExit();
    }
  };

  const allAnswered = Object.keys(blanksData).every((key) => answers[key]);
  const progress =
    (Object.keys(answers).length / Object.keys(blanksData).length) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Error Loading Practice
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
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

  return (
    <>
      <PracticeGameLayout
        questionType="Fill in the blanks - Passage"
        localizedInstruction={currentQuestion?.localizedInstruction}
        instructionFr={currentQuestion?.instructionFr || "Complétez le passage"}
        instructionEn={currentQuestion?.instructionEn || "Select the best option for each missing word"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={Object.keys(blanksData).length}
        onExit={handleExit}
        onNext={handleSubmit} // Using onNext as Submit trigger from layout if needed
        onRestart={() => window.location.reload()}
        isSubmitEnabled={allAnswered && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-6 p-4 h-full md:items-stretch overflow-hidden">
          {/* Left Column: Passage */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[400px]">
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                PASSAGE
              </h3>
              <div className="text-lg md:text-xl leading-loose text-slate-800 dark:text-slate-100 font-serif">
                {passageSegments.map((segment, index) => {
                  if (typeof segment === "string") {
                    return <span key={index}>{segment}</span>;
                  } else if (segment.type === "blank") {
                    const id = segment.id;
                    const userAnswer = answers[id];
                    const isCorrectAnswer =
                      userAnswer === blanksData[id].correct;

                    return (
                      <span
                        key={index}
                        className="mx-1 inline-flex items-center relative"
                      >
                        <span
                          className={cn(
                            "inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-bold text-slate-500 mr-1 min-w-[24px]",
                            showFeedback &&
                            isCorrectAnswer &&
                            "bg-green-100 border-green-400 text-green-700",
                            showFeedback &&
                            !isCorrectAnswer &&
                            "bg-red-100 border-red-400 text-red-700",
                          )}
                        >
                          {id}
                        </span>

                        {/* Mobile: Inline Dropdowns */}
                        {!showFeedback && (
                          <div className="relative inline-block lg:hidden mx-1">
                            <select
                              value={userAnswer || ""}
                              onChange={(e) =>
                                handleOptionSelect(id, e.target.value)
                              }
                              className={cn(
                                "appearance-none bg-slate-50 dark:bg-slate-900 border-2 rounded-lg px-2 py-0.5 pr-7 text-sm font-bold outline-none transition-all cursor-pointer shadow-sm translate-y-[2px]",
                                userAnswer
                                  ? "border-sky-500 text-sky-600 dark:text-sky-400 bg-white"
                                  : "border-slate-200 dark:border-slate-700 text-slate-400",
                              )}
                            >
                              <option value="" disabled>
                                Select
                              </option>
                              {blanksData[id].options.map((opt, i) => (
                                <option key={i} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 mt-[2px]">
                              <svg
                                className="w-3.5 h-3.5 text-slate-400"
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
                        )}

                        {/* Desktop: Show selection as text even before feedback */}
                        {!showFeedback && userAnswer && (
                          <span className="hidden lg:inline-flex font-bold text-sky-600 dark:text-sky-400 underline decoration-2 decoration-sky-300 underline-offset-4 ml-1">
                            {userAnswer}
                          </span>
                        )}

                        {showFeedback && (
                          <span
                            className={cn(
                              "font-bold underline decoration-2 underline-offset-4",
                              isCorrectAnswer
                                ? "text-green-600 decoration-green-500"
                                : "text-red-600 decoration-red-500",
                            )}
                          >
                            {userAnswer || "(empty)"}
                          </span>
                        )}

                        {showFeedback && !isCorrectAnswer && (
                          <span className="text-sm font-bold text-green-600 ml-1">
                            (Correct: {blanksData[id].correct})
                          </span>
                        )}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Questions (Hidden on mobile) */}
          <div className="hidden lg:flex flex-1 flex flex-col justify-start lg:max-w-md overflow-hidden">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 h-full overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                Select the best option for each missing word
              </h2>

              <div className="space-y-4">
                {Object.keys(blanksData).map((key) => {
                  const id = parseInt(key);
                  const blank = blanksData[id];
                  const userAnswer = answers[id];
                  const isCorrectAnswer = userAnswer === blank.correct;

                  return (
                    <div key={id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 border border-slate-200 dark:border-slate-600">
                        {id}
                      </div>
                      <div className="flex-grow">
                        <select
                          value={userAnswer || ""}
                          onChange={(e) =>
                            handleOptionSelect(id, e.target.value)
                          }
                          disabled={showFeedback}
                          className={cn(
                            "w-full p-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none transition-all appearance-none cursor-pointer",
                            "focus:ring-2 focus:ring-sky-500 border-slate-200 dark:border-slate-700",
                            showFeedback &&
                            isCorrectAnswer &&
                            "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100",
                            showFeedback &&
                            !isCorrectAnswer &&
                            "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100",
                          )}
                        >
                          <option value="" disabled>
                            Select a word
                          </option>
                          {blank.options.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      {showFeedback && (
                        <div className="flex-shrink-0">
                          {isCorrectAnswer ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-500" />
                          )}
                        </div>
                      )}
                      {showFeedback && !isCorrectAnswer && (
                        <div className="text-sm font-medium text-green-600">
                          Correct: {blank.correct}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={null} // Not used for multi-answer
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel="FINISH"
        />
      )}
    </>
  );
}
