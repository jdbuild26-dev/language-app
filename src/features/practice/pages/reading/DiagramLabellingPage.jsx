import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import eggDiagram from "@/assets/egg-diagram.png";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Content Data
const PASSAGE_TITLE =
  "Chicken egg consists of six main parts: albumin, yolk, shell, germinal disc, chalaza and air cell. In further paragraphs we will learn all the important information you need to know about these parts.";

const PASSAGE_PARAGRAPHS = [
  "One of the main parts of the egg is yolk - the yellow, inner part of the egg where the embryo will form. The yolk contains the food that will nourish the embryo as it grows. Yolk is a major source of vitamins, minerals, almost half of the protein, and all of the fat and cholesterol. The yolk contains less water and more protein than the white part of the egg, some fat, and most of the vitamins and minerals of the egg. The yolk is also a source of lecithin, an effective emulsifier. Yolk color ranges from just a hint of yellow to a magnificent deep orange, according to the feed and breed of the hen. Yolk is anchored by chalaza - a spiral, rope-like strand that anchors the yolk in the thick egg white. There are two chalazae anchoring each yolk; one on the top and one on the bottom.",
  "Another very important part of the egg is the albumin, which is the inner thick white part of the egg. This part of the egg is a excellent source of riboflavin and protein. In high-quality eggs, the inner thick albumen stands higher and spreads less than thin white. In low-quality eggs, it appears thin white.",
  "Now let's talk about the outer part of the egg - the shell It is a hard, protective coating of the egg. It is semi-permeable; it lets gas exchange occur, but keeps other substances from entering the egg. The shell is made of calcium carbonate and is covered with as many as 17,000 tiny pores.",
  "Air cell is an air space that forms when the contents of the egg cool and contract after the egg is laid. The air cell usually rests between the outer and inner membranes at the eggs larger end. As the egg ages, moisture and carbon dioxide leave through the pores of the shell, air enters to replace them and the air cell becomes larger.",
  "And last but not least, let's look at the germinal disc. It's a small, circular, white spot (2-3 mm across) on the surface of the yolk; it is where the sperm enters the egg. The nucleus of the egg is in the blastodisc. The embryo develops from this disk, and gradually sends blood vessels into the yolk to use it for nutrition as the embryo develops.",
];

// Question Data
const OPTIONS = [
  "Shell",
  "Germinal Disc",
  "Chalaza",
  "Albumin",
  "Yolk",
  "Air Cell",
];

const QUESTIONS = [
  { id: 1, correct: "Shell" },
  { id: 2, correct: "Germinal Disc" },
  { id: 3, correct: "Chalaza" },
  { id: 4, correct: "Albumin" },
  { id: 5, correct: "Yolk" },
  { id: 6, correct: "Air Cell" },
];

export default function DiagramLabellingPage() {
  const handleExit = usePracticeExit();

  // State
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

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
    QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correct) correctCount++;
    });

    setScore(correctCount);
    const total = QUESTIONS.length;
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

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  return (
    <>
      <PracticeGameLayout
        questionType="Diagram Labelling"
        instructionFr="Étiquetez le diagramme"
        instructionEn="Label the diagram"
        progress={
          isCompleted
            ? 100
            : (Object.keys(answers).length / QUESTIONS.length) * 100
        }
        isGameOver={isCompleted}
        score={score}
        totalQuestions={QUESTIONS.length}
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

              <div className="grid grid-cols-1 gap-3">
                {QUESTIONS.map((q) => {
                  const isWrong = showFeedback && answers[q.id] !== q.correct;
                  const isRight = showFeedback && answers[q.id] === q.correct;

                  return (
                    <div key={q.id} className="flex items-center gap-3">
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
                      <div className="flex-1 relative">
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
