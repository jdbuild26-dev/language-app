import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, XCircle, CheckCircle2, Circle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { cn } from "@/lib/utils";

export default function ChooseOptionGamePage() {
  const navigate = useNavigate();
  const { learningLang, knownLang } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to shuffle array
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        const response = await fetchPracticeQuestions("choose_options", {
          learningLang,
          knownLang
        });
        const practiceData = response.data || [];

        if (!practiceData || practiceData.length === 0) {
          throw new Error("No practice questions found.");
        }

        // Shuffle and pick a subset
        const gameQuestionsRaw = shuffleArray(practiceData).slice(0, 10);

        const generatedQuestions = gameQuestionsRaw.map((item) => {
          const options = [
            item.Option1,
            item.Option2,
            item.Option3,
            item.Option4,
          ].filter(Boolean);

          const shuffledOptions = shuffleArray(options);

          return {
            id: item.ExerciseID || Math.random().toString(),
            question: item.Question || item.question || item.Sentence || "",
            correctAnswer: item.CorrectAnswer || item.correctAnswer || item.Answer || "",
            options: shuffledOptions,
            questionType: item.TypeName || item.QuestionType || "Choose from Options",
            instructionFr:
              item.Instruction_FR || item.instructionFr || "Complétez la phrase avec le mot correct",
            instructionEn:
              item.Instruction_EN ||
              item.instructionEn ||
              "Complete the sentence with the correct word",
            localizedInstruction: item.localizedInstruction || item.Instruction_EN || "Complete the sentence with the correct word",
            image: item.ImageURL || item.imageUrl,
          };
        });

        setQuestions(generatedQuestions);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load game data:", err);
        setError("Failed to load questions. Please check data source.");
        setLoading(false);
      }
    };

    loadGameData();
  }, [learningLang, knownLang]);

  const currentQuestion = questions[currentIndex];
  // Timer string handled by layout or internal state?
  // NOTE: Layout handles timer prop, but we aren't passing it explicitly here,
  // defaulting to PracticeGameLayout's internal timer or we should add one if needed.
  // For consistency with HighlightGame, adding basic timer here would be good,
  // but existing code didn't have one visible. Layout has a `timerValue` prop now.
  // Let's stick to existing functionality + new UI unless requested.
  // The screenshot shows "0:14", so I should probably implement a timer similar to HighlightGame.

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 20,
    mode: "timer",
    onExpire: () => {
      // Auto-submit when time expires
      if (!isGameOver && !showFeedback) {
        if (!selectedOption) {
          setIsCorrect(false);
          setFeedbackMessage("Time's up!");
          setShowFeedback(true);
        } else {
          handleSubmit();
        }
      }
    },
    isPaused: loading || isGameOver || showFeedback,
  });

  // Reset timer on next question
  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleOptionClick = (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || showFeedback) return;

    const correct = selectedOption === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedOption(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!error && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">No questions found</h2>
        <Link to="/vocabulary/practice">
          <Button variant="outline">Back to Practice</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/vocabulary/practice">
          <Button variant="outline">Back to Practice</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType={currentQuestion?.questionType}
        instructionFr={currentQuestion?.instructionFr}
        instructionEn={currentQuestion?.instructionEn}
        localizedInstruction={currentQuestion?.localizedInstruction}
        progress={progress}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={(!!selectedOption && !showFeedback) || showFeedback} // Enabled if option selected OR if showing feedback (for continue)
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : "CHECK"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
        feedbackMessage={feedbackMessage}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center w-full max-w-6xl gap-8 md:gap-16">
          {/* Left Side: Question / Prompt */}
          <div className="w-full md:w-1/2 flex flex-col justify-center min-h-[200px]">
            {/* Secondary Title (Context) - OPTIONAL based on API data, using placeholder logic for now */}
            {/* Note: Screenshot shows "Word meaning 'they speak'" above options, but layout-wise text is left. */}
            {/* Let's put the main sentence here. */}

            <div className="bg-transparent p-4 rounded-xl">
              <h2 className="text-2xl md:text-3xl font-medium text-gray-800 dark:text-gray-100 leading-relaxed text-center md:text-left">
                {(() => {
                  const highlightText = (text) => {
                    if (!showFeedback || !currentQuestion.correctAnswer)
                      return text;

                    const parts = text.split(
                      new RegExp(`(${currentQuestion.correctAnswer})`, "gi"),
                    );
                    return parts.map((part, i) =>
                      part.toLowerCase() ===
                        currentQuestion.correctAnswer.toLowerCase() ? (
                        <span
                          key={i}
                          className="text-green-600 font-bold bg-green-100 px-1 rounded-md mx-0.5 shadow-sm border border-green-200"
                        >
                          {part}
                        </span>
                      ) : (
                        part
                      ),
                    );
                  };

                  if (currentQuestion.question.includes("____")) {
                    return currentQuestion.question
                      .split("____")
                      .map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {highlightText(part)}
                          {i < arr.length - 1 && (
                            <span className="inline-block border-b-2 border-slate-800 dark:border-slate-200 min-w-[3rem] mx-1 relative top-1"></span>
                          )}
                        </React.Fragment>
                      ));
                  }

                  return highlightText(currentQuestion.question);
                })()}
              </h2>
            </div>
          </div>

          {/* Right Side: Options */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {/* Context Header above options if available, essentially 'Word Meanings' logic from screenshot */}

            <div className="flex flex-col gap-3 w-full">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrectOption =
                  option === currentQuestion.correctAnswer;

                // Determine styles
                let containerClasses =
                  "relative w-full p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 group";
                let iconClasses = "w-6 h-6 shrink-0 transition-colors";

                if (showFeedback) {
                  if (isCorrectOption) {
                    containerClasses +=
                      " bg-green-50 border-green-500 ring-1 ring-green-500";
                    iconClasses += " text-green-500 fill-green-500/20";
                  } else if (isSelected && !isCorrectOption) {
                    containerClasses += " bg-red-50 border-red-500 opacity-80";
                    iconClasses += " text-red-500";
                  } else {
                    containerClasses +=
                      " bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-50";
                    iconClasses += " text-slate-300 dark:text-slate-600";
                  }
                } else {
                  if (isSelected) {
                    containerClasses +=
                      " bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500";
                    iconClasses += " text-blue-500 fill-blue-500/20";
                  } else {
                    containerClasses +=
                      " bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50";
                    iconClasses +=
                      " text-slate-300 dark:text-slate-600 group-hover:text-blue-300";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    disabled={showFeedback}
                    className={containerClasses}
                  >
                    {/* Icon */}
                    <div className={iconClasses}>
                      {isSelected || (showFeedback && isCorrectOption) ? (
                        <CheckCircle2 className="w-full h-full" />
                      ) : (
                        <Circle className="w-full h-full" />
                      )}
                    </div>

                    {/* Text */}
                    <span
                      className={cn(
                        "text-lg font-medium text-left",
                        showFeedback && isCorrectOption
                          ? "text-green-800 dark:text-green-300"
                          : showFeedback && isSelected
                            ? "text-red-800 dark:text-red-300"
                            : "text-slate-700 dark:text-slate-200",
                      )}
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
