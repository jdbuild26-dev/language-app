import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

/* 
  Data for the exercise: 
  A longer passage with multiple blanks.
*/
const PASSAGE_SEGMENTS = [
  "Firefighters are the people who fight fires on a ",
  { id: 1, type: "blank" },
  " basis. They work for fire departments, which ",
  { id: 2, type: "blank" },
  " organizations of trained professionals that keep the community ",
  { id: 3, type: "blank" },
  " from fires. When a fire ",
  { id: 4, type: "blank" },
  " out, firefighters enter buildings to look ",
  { id: 5, type: "blank" },
  " people and pets, rescue them, and ",
  { id: 6, type: "blank" },
  " out the fire to prevent ",
  { id: 7, type: "blank" },
  " from spreading. They also conduct ",
  { id: 8, type: "blank" },
  " drills and inspections to ",
  { id: 9, type: "blank" },
  " businesses and agencies safe.",
];

const BLANKS_DATA = {
  1: { options: ["regular", "routine", "daily", "common"], correct: "daily" },
  2: { options: ["is", "are", "was", "were"], correct: "are" },
  3: { options: ["safe", "danger", "risk", "harm"], correct: "safe" },
  4: { options: ["breaks", "goes", "runs", "comes"], correct: "breaks" },
  5: { options: ["at", "for", "to", "in"], correct: "for" },
  6: { options: ["put", "take", "get", "let"], correct: "put" },
  7: { options: ["it", "them", "fire", "water"], correct: "it" },
  8: { options: ["safety", "fire", "emergency", "routine"], correct: "safety" },
  9: { options: ["make", "keep", "stay", "hold"], correct: "keep" },
};

const FULL_TEXT =
  "Firefighters are the people who fight fires on a daily basis. They work for fire departments, which are organizations of trained professionals that keep the community safe from fires. When a fire breaks out, firefighters enter buildings to look for people and pets, rescue them, and put out the fire to prevent it from spreading. They also conduct safety drills and inspections to keep businesses and agencies safe.";

export default function CompletePassagePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  // State
  const [answers, setAnswers] = useState({}); // { 1: "option", 2: "option" }
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer: 8 minutes (480s) to match screenshot mostly
  const { timerString, resetTimer, pauseTimer } = useExerciseTimer({
    duration: 480,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) {
        checkAnswers(true);
      }
    },
    isPaused: showFeedback || isCompleted,
  });

  const handlePlayAudio = () => {
    speak(FULL_TEXT, "en-US"); // English text
  };

  const handleOptionSelect = (blankId, value) => {
    if (showFeedback) return;
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const checkAnswers = (timeExpired = false) => {
    // Count correct answers
    let correctCount = 0;
    const totalBlanks = Object.keys(BLANKS_DATA).length;

    Object.keys(BLANKS_DATA).forEach((key) => {
      const id = parseInt(key);
      if (answers[id] === BLANKS_DATA[id].correct) {
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

  const allAnswered = Object.keys(BLANKS_DATA).every((key) => answers[key]);
  const progress =
    (Object.keys(answers).length / Object.keys(BLANKS_DATA).length) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Fill in the blanks - Passage"
        instructionFr="Complétez le passage"
        instructionEn="Select the best option for each missing word"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={Object.keys(BLANKS_DATA).length}
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
                {PASSAGE_SEGMENTS.map((segment, index) => {
                  if (typeof segment === "string") {
                    return <span key={index}>{segment}</span>;
                  } else if (segment.type === "blank") {
                    const id = segment.id;
                    const userAnswer = answers[id];
                    const isCorrectAnswer =
                      userAnswer === BLANKS_DATA[id].correct;

                    return (
                      <span
                        key={index}
                        className="mx-1 inline-flex items-center"
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
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Audio Control */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 mt-auto">
              <button
                onClick={handlePlayAudio}
                disabled={isSpeaking}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isSpeaking
                    ? "text-sky-500"
                    : "text-slate-500 hover:text-sky-600",
                )}
              >
                <Volume2 className="w-4 h-4" />
                {isSpeaking ? "Playing..." : "Listen to full text"}
              </button>
            </div>
          </div>

          {/* Right Column: Questions */}
          <div className="flex-1 flex flex-col justify-start lg:max-w-md overflow-hidden">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 h-full overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                Select the best option for each missing word
              </h2>

              <div className="space-y-4">
                {Object.keys(BLANKS_DATA).map((key) => {
                  const id = parseInt(key);
                  const blank = BLANKS_DATA[id];
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
