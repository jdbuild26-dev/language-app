import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { CheckCircle, XCircle, BookOpen, Loader2 } from "lucide-react";
import { loadMockCSV } from "@/utils/csvLoader";

// MOCK_DATA removed - migrated to CSV


export default function MatchSentenceEndingPage() {
  const handleExit = usePracticeExit();

  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({}); // { 1: "option", 2: "option" }
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPassageOpen, setIsPassageOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loadedData = await loadMockCSV("practice/reading/match_sentence_ending.csv");
        if (loadedData && loadedData.length > 0) {
          setData(loadedData[0]); // We expect one row with JSON columns
        }
      } catch (error) {
        console.error("Failed to load match sentence data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Timer configuration
  const { timerString, resetTimer } = useExerciseTimer({
    duration: 120,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) {
        handleSubmit();
      }
    },
    isPaused: showFeedback || isCompleted,
  });

  const handleOptionSelect = (questionId, value) => {
    if (showFeedback) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const checkAnswers = () => {
    if (!data) return;
    let correctCount = 0;
    const totalQuestions = data.questions.length;

    data.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const verifyAllCorrect = correctCount === totalQuestions;
    setIsCorrect(verifyAllCorrect);
    setScore(correctCount);

    if (verifyAllCorrect) {
      setFeedbackMessage("Excellent! All matches are correct.");
    } else {
      setFeedbackMessage(
        `You got ${correctCount} out of ${totalQuestions} correct.`,
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
    if (isCorrect) {
      setIsCompleted(true);
      handleExit();
    } else {
      // For now, exit on continue even if wrong, or we could allow retry
      setIsCompleted(true);
      handleExit();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">Failed to load data.</p>
      </div>
    );
  }

  const allAnswered = data.questions.every((q) => answers[q.id]);
  const progress =
    (Object.keys(answers).length / data.questions.length) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Match Sentence Ending"
        instructionFr="Faites correspondre les fins de phrase"
        instructionEn="Match the sentence ending"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={data.questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={allAnswered && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-6 p-4 h-full md:items-stretch overflow-hidden">
          {/* Left Column: Passage (Hidden on mobile, shown on lg) */}
          <div className="hidden lg:flex flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[400px]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {data.passageTitle}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {data.passageSubtitle}
              </p>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 space-y-4">
                {data.passageContent.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Divider (visible on lg screens) */}
          <div className="hidden lg:block w-px bg-slate-200 dark:bg-slate-700 self-stretch my-4" />

          {/* Right Column: Questions & Dropdowns */}
          <div className="flex-1 flex flex-col justify-start lg:max-w-md overflow-hidden">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 h-full overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                Match the sentence endings
              </h2>

              <div className="space-y-8">
                {data.questions.map((q) => {
                  const userAnswer = answers[q.id];
                  const isCorrectAnswer = userAnswer === q.correctAnswer;

                  return (
                    <div key={q.id} className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-500 border border-slate-200 dark:border-slate-600 mt-0.5">
                          {q.id}.
                        </div>
                        <p className="text-base text-slate-800 dark:text-slate-200 font-medium">
                          {q.text}
                        </p>
                      </div>

                      {/* Dropdown immediately below the question text */}
                      <div className="pl-9">
                        <select
                          value={userAnswer || ""}
                          onChange={(e) =>
                            handleOptionSelect(q.id, e.target.value)
                          }
                          disabled={showFeedback}
                          className={cn(
                            "w-full p-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none transition-all appearance-none cursor-pointer text-sm shadow-sm",
                            "focus:ring-2 focus:ring-sky-500 border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500",
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
                          {data.options.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>

                        {showFeedback && (
                          <div className="mt-2 text-sm">
                            {isCorrectAnswer ? (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                                <CheckCircle className="w-4 h-4" /> Correct
                              </div>
                            ) : (
                              <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-col">
                                  <span className="font-medium">Incorrect</span>
                                  <span className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                                    Correct answer: {q.correctAnswer}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Only: Floating See Passage Button */}
              {!showFeedback && (
                <div className="fixed bottom-24 right-6 z-40 lg:hidden">
                  <button
                    onClick={() => setIsPassageOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full shadow-lg shadow-sky-500/30 transition-all active:scale-95 animate-in slide-in-from-bottom duration-500"
                  >
                    <BookOpen className="w-5 h-5" />
                    See Passage
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Passage Modal for Mobile */}
      {isPassageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {data.passageTitle}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Read carefully to find the answers
                </p>
              </div>
              <button
                onClick={() => setIsPassageOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                aria-label="Close passage"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
              {data.passageContent.map((paragraph, idx) => (
                <p key={idx} className="text-[15px] md:text-base">{paragraph}</p>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => setIsPassageOpen(false)}
                className="w-full p-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-200 dark:shadow-none transition-all active:scale-[0.98]"
              >
                Back to Questions
              </button>
            </div>
          </div>
        </div>
      )}

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
