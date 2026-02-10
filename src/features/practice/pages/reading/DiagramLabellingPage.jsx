import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function DiagramLabellingPage() {
  const handleExit = usePracticeExit();

  // State
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMockCSV("practice/reading/diagram_labelling.csv");
      setQuestions(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const currentQuestion = questions[0]; // Assuming one diagram for now
  const PASSAGE_TITLE = currentQuestion?.title || "";
  const PASSAGE_PARAGRAPHS = currentQuestion?.paragraphs || [];
  const OPTIONS = currentQuestion?.options || [];
  const DIAGRAM_QUESTIONS = currentQuestion?.questions || [];
  const eggDiagram = currentQuestion?.imagePath || "";

  // Timer
  const { timerString, stopTimer } = useExerciseTimer({
    mode: "stopwatch",
    isPaused: isCompleted || showFeedback,
  });

  // Handlers
  const handleSelect = (id, value) => {
    if (showFeedback) return;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheck = () => {
    let correctCount = 0;
    DIAGRAM_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correct) correctCount++;
    });

    setScore(correctCount);
    const total = DIAGRAM_QUESTIONS.length;

    const isPerfect = correctCount === total;

    setIsCorrect(isPerfect);
    if (isPerfect) {
      setFeedbackMessage("Perfect! You identified all parts correctly!");
      setIsCompleted(true);
      stopTimer();
    } else {
      setFeedbackMessage(
        `You got ${correctCount} out of ${total} correct. Check the red boxes.`,
      );
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (showFeedback) {
      if (isCorrect) {
        handleExit();
      } else {
        setShowFeedback(false);
      }
    } else {
      handleCheck();
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setShowFeedback(false);
    setIsCompleted(false);
    setScore(0);
    setIsCorrect(false);
  };

  const allAnswered = DIAGRAM_QUESTIONS.every((q) => answers[q.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
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

  return (
    <>
      <PracticeGameLayout
        questionType="Diagram Labelling"
        instructionFr="Étiquetez le diagramme"
        instructionEn="Label the diagram"
        progress={
          isCompleted
            ? 100
            : (Object.keys(answers).length / DIAGRAM_QUESTIONS.length) * 100
        }
        isGameOver={isCompleted}
        score={score}
        totalQuestions={DIAGRAM_QUESTIONS.length}
        onExit={handleExit}
        onNext={handleNext}
        onRestart={handleRestart}
        isSubmitEnabled={showFeedback || allAnswered}
        showSubmitButton={true}
        submitLabel={
          showFeedback ? (isCorrect ? "Finish" : "Try Again") : "Check Answers"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        videoFeedbackMessage={feedbackMessage}
        feedbackMessage={feedbackMessage}
        correctAnswer={null}
      >
        <div className="flex flex-col lg:flex-row h-full w-full gap-6 overflow-hidden">
          {/* Left Column: Reading Passage */}
          <div className="w-full lg:w-1/2 h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 leading-relaxed">
                {PASSAGE_TITLE}
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-base text-justify">
                {PASSAGE_PARAGRAPHS.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Diagram + Options */}
          <div className="w-full lg:w-1/2 h-full flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            {/* Diagram Image */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-center items-center shadow-sm shrink-0">
              <img
                src={eggDiagram}
                alt="Egg Diagram"
                className="max-h-[300px] w-auto object-contain"
              />
            </div>

            {/* Dropdowns Section */}
            <div className="flex flex-col gap-4 pb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                Select the best option for each missing word
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {DIAGRAM_QUESTIONS.map((q) => {
                  const isWrong = showFeedback && answers[q.id] !== q.correct;
                  const isRight = showFeedback && answers[q.id] === q.correct;

                  return (
                    <div
                      key={q.id}
                      className="flex items-center gap-2 flex-wrap"
                    >
                      {/* Number Label */}
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm border shrink-0 transition-colors",
                          isRight
                            ? "bg-green-100 text-green-700 border-green-300"
                            : isWrong
                              ? "bg-red-100 text-red-700 border-red-300"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700",
                        )}
                      >
                        {q.id}
                      </div>

                      {/* Dropdown */}
                      <div className="w-64 relative shrink-0">
                        <select
                          value={answers[q.id] || ""}
                          onChange={(e) => handleSelect(q.id, e.target.value)}
                          disabled={showFeedback}
                          className={cn(
                            "w-full h-10 pl-3 pr-8 rounded-lg border bg-white dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer",
                            isRight
                              ? "border-green-500 text-green-700 dark:text-green-400 focus:ring-green-500/20"
                              : isWrong
                                ? "border-red-500 text-red-700 dark:text-red-400 focus:ring-red-500/20"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:border-blue-500",
                          )}
                        >
                          <option value="" disabled className="text-slate-400">
                            Select a word
                          </option>
                          {OPTIONS.sort().map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>

                        {/* Custom Arrow because default select arrow is ugly often */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg
                            width="10"
                            height="6"
                            viewBox="0 0 10 6"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 1L5 5L9 1"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Incorrect Indicator */}
                      {isWrong && (
                        <div className="shrink-0 text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded">
                          Correct: {q.correct}
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

      {/* Manual Feedback Banner Override if allowed, or just let Layout handle it. 
          Layout handles it well if we pass showFeedback=true. 
          The only issue is if we want the 'Try Again' button to reset the state or just allow changing answers? 
          Layout's 'Try Again' (if isCorrect=false) usually just hides banner?
          Let's see PracticeGameLayout logic.
          It doesn't seem to have a 'Try Again' handling for banner buttons specifically other than 'onNext'.
          Wait, 'onNext' is used for the action button. 
          If showFeedback is true, button label depends on 'submitLabel'.
          If isCorrect is true, we probably want 'Finish'.
          If false, 'Try Again' (which usually just means close feedback and let user fix).
          
          In Layout:
          Button onClick={onNext}
          
          So we need onNext to handle both "Submit Check" and "Continue/Exit".
      */}
    </>
  );
}
