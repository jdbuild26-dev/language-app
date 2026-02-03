import React, { useState } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { Volume2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Content Data
const FULL_TEXT =
  "Firefighters are the people who fight fires on a daily basis. They work for fire departments, which are organizations of trained professionals that keep the community safe from fires. When a fire breaks out, firefighters enter buildings to look for people and pets, rescue them, and put out the fire to prevent it from spreading. They also conduct safety drills and inspections to keep businesses and agencies safe. Firefighters must have a variety of skills and knowledge. They must be physically fit and must be able to work in harsh conditions and difficult situations. In addition to responding to fires, firefighters often help in situations that require medical attention, such as automobile accidents and gas emergencies. In addition to physical skills and knowledge, firefighters have to have strong social skills, because they must often interact with people during stressful situations.";

const PASSAGE_SEGMENTS = [
  "Firefighters are the people who fight fires on a ",
  { id: 1 },
  " daily basis. They work for fire departments, which ",
  { id: 2 },
  " organizations of trained professionals that keep the community ",
  { id: 3 },
  " from fires. When a fire ",
  { id: 4 },
  " out, firefighters enter buildings to look ",
  { id: 5 },
  " people and pets, rescue them, and ",
  { id: 6 },
  " out the fire to prevent ",
  { id: 7 },
  " from spreading. They also conduct ",
  { id: 8 },
  " drills and inspections to ",
  { id: 9 },
  " businesses and agencies safe.",
];

// Correct answers
const BLANKS_DATA = {
  1: "nearly",
  2: "are",
  3: "safe",
  4: "breaks",
  5: "for",
  6: "put",
  7: "it",
  8: "safety",
  9: "keep",
};

export default function SummaryCompletionPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  // State
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer
  const { timerString, resetTimer, pauseTimer } = useExerciseTimer({
    duration: 600, // 10 minutes
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) {
        handleSubmit();
      }
    },
    isPaused: showFeedback || isCompleted,
  });

  const handleInputChange = (id, value) => {
    if (showFeedback) return;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handlePlayAudio = () => {
    speak(FULL_TEXT, "en-US");
  };

  const checkAnswers = () => {
    let correctCount = 0;
    const totalBlanks = Object.keys(BLANKS_DATA).length;

    Object.keys(BLANKS_DATA).forEach((key) => {
      const id = parseInt(key);
      const userAnswer = (answers[id] || "").trim().toLowerCase();
      const correctAnswer = BLANKS_DATA[id].toLowerCase();

      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    const allCorrect = correctCount === totalBlanks;
    setIsCorrect(allCorrect);
    setScore(correctCount);

    if (allCorrect) {
      setFeedbackMessage("Excellent! All answers are correct.");
      setIsCompleted(true);
    } else {
      setFeedbackMessage(
        `You got ${correctCount} out of ${totalBlanks} correct.`,
      );
    }

    setShowFeedback(true);
  };

  const handleSubmit = () => {
    if (showFeedback) return;
    checkAnswers();
  };

  const handleContinue = () => {
    if (isCorrect) {
      setIsCompleted(true);
    }
    handleExit();
  };

  // Progress based on filled inputs
  const filledCount = Object.keys(answers).filter((k) =>
    answers[k]?.trim(),
  ).length;
  const progress = (filledCount / Object.keys(BLANKS_DATA).length) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Summary Completion"
        instructionFr="Complétez le résumé"
        instructionEn="Complete the summary using the words from the passage"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={Object.keys(BLANKS_DATA).length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={filledCount > 0 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-8 p-4 h-full">
          {/* Left Column: Passage */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                PASSAGE
              </h3>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow">
              <div className="text-lg leading-loose text-slate-800 dark:text-slate-200 font-serif">
                {FULL_TEXT}
              </div>
            </div>

            {/* Audio Control */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
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
                {isSpeaking ? "Playing..." : "Listen to passage"}
              </button>
            </div>
          </div>

          {/* Right Column: Summary with Blanks */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                SUMMARY COMPLETION
              </h3>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow">
              <div className="text-lg leading-[3rem] text-slate-800 dark:text-slate-200 font-medium">
                {PASSAGE_SEGMENTS.map((segment, index) => {
                  if (typeof segment === "string") {
                    return <span key={index}>{segment}</span>;
                  } else {
                    const id = segment.id;
                    const userAnswer = answers[id] || "";
                    const isCorrectAnswer =
                      userAnswer.trim().toLowerCase() ===
                      BLANKS_DATA[id].toLowerCase();

                    return (
                      <span
                        key={index}
                        className="mx-1 inline-flex items-center align-middle relative top-2"
                      >
                        {/* Badge */}
                        <span className="flex items-center justify-center w-6 h-6 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-500 mr-2 shadow-sm relative -top-3">
                          {id}
                        </span>

                        {/* Input */}
                        <div className="relative inline-block">
                          <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) =>
                              handleInputChange(id, e.target.value)
                            }
                            disabled={showFeedback}
                            autoComplete="off"
                            className={cn(
                              "w-32 bg-transparent border-b-2 outline-none text-center font-bold px-1 transition-colors relative -top-3",
                              !showFeedback &&
                                "border-slate-300 dark:border-slate-600 focus:border-sky-500 text-sky-600 dark:text-sky-400",
                              showFeedback &&
                                isCorrectAnswer &&
                                "border-green-500 text-green-600",
                              showFeedback &&
                                !isCorrectAnswer &&
                                "border-red-500 text-red-600",
                            )}
                          />
                          {showFeedback && !isCorrectAnswer && (
                            <div className="absolute top-0 left-0 w-full text-center mt-2 pointer-events-none z-10">
                              <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded border border-green-200 font-bold whitespace-nowrap">
                                {BLANKS_DATA[id]}
                              </span>
                            </div>
                          )}
                        </div>
                      </span>
                    );
                  }
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
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel="FINISH"
        />
      )}
    </>
  );
}
