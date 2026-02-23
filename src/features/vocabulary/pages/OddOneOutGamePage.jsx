import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { useLanguage } from "@/contexts/LanguageContext";

// MOCK DATA for "Odd One Out"
export default function OddOneOutGamePage() {
  const navigate = useNavigate();
  const { learningLang, knownLang } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 30,
    mode: "timer",
    onExpire: () => {
      if (!isSubmitted && !showFeedback && !isGameOver) {
        setIsSubmitted(true);
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isSubmitted || showFeedback || isGameOver,
  });

  useEffect(() => {
    loadQuestions();
  }, [learningLang, knownLang]);

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      console.log(
        `[OddOneOut] 📡 Fetching data from backend (slug: odd_one_out)...`,
      );
      const response = await fetchPracticeQuestions("odd_one_out", {
        learningLang,
        knownLang,
      });
      if (response && response.data) {
        console.log(`[OddOneOut] ✅ Loaded ${response.data.length} questions`, {
          sample: response.data[0],
        });
        const normalized = response.data
          .filter(
            (item) =>
              (item.words || item.Option1) &&
              (item.words || item.Option1) !== "None",
          )
          .map((item) => {
            const wordsArray =
              item.words ||
              [item.Option1, item.Option2, item.Option3, item.Option4].filter(
                Boolean,
              );
            const wordsEnArray = [
              item.Option1_EN,
              item.Option2_EN,
              item.Option3_EN,
              item.Option4_EN,
            ];

            return {
              id: item.id || item.ExerciseID,
              words: wordsArray.map((text, i) => ({
                text,
                en: wordsEnArray[i],
              })),
              correctAnswer:
                item.correctword ||
                item.CorrectAnswer ||
                item.Answer ||
                item.correctAnswer,
              reason:
                item.CorrectExplanation_EN ||
                item.Reason ||
                item.Explanation ||
                "",
              instructionFr: item.Instruction_FR || "Trouvez l'intrus",
              instructionEn: item.Instruction_EN || "Select the odd one out",
              localizedInstruction:
                item.localizedInstruction ||
                item.Instruction_EN ||
                "Select the odd one out",
              type: "Odd One Out",
            };
          });
        setQuestions(normalized);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error("[OddOneOut] ❌ Failed to load:", err);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleWordClick = (wordObj) => {
    if (isSubmitted) return;
    setSelectedWord(wordObj);
  };

  const handleSubmit = () => {
    if (isSubmitted) {
      // Next Logic
      setShowFeedback(false);
      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedWord(null);
        setIsSubmitted(false);
      } else {
        setIsGameOver(true);
      }
      return;
    }

    // Submit Logic
    if (!selectedWord) return;
    setIsSubmitted(true);

    const correct = selectedWord.text === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const getWordStyle = (wordObj) => {
    const baseStyle =
      "h-32 md:h-40 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden min-w-[180px] md:min-w-[240px]";

    if (!isSubmitted) {
      // Normal Selection
      if (selectedWord && wordObj.text === selectedWord.text) {
        return `${baseStyle} bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500`;
      }
      return `${baseStyle} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:shadow-md cursor-pointer text-gray-700 dark:text-gray-200`;
    }

    // Result Logic
    if (wordObj.text === currentQuestion.correctAnswer) {
      // Always show correct
      return `${baseStyle} bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300`;
    }

    if (
      selectedWord &&
      wordObj.text === selectedWord.text &&
      wordObj.text !== currentQuestion.correctAnswer
    ) {
      // Wrong selection
      return `${baseStyle} bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300 opacity-80`;
    }

    return `${baseStyle} bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-400 opacity-50`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  if (error || questions.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "No questions found for this activity."}
      </div>
    );

  let submitLabel = "Submit";
  if (isSubmitted) {
    submitLabel =
      currentIndex + 1 === totalQuestions ? "Finish" : "Next Question";
  }

  return (
    <>
      <PracticeGameLayout
        questionType={currentQuestion.type || "Odd One Out"}
        instructionFr={currentQuestion.instructionFr || "Trouvez l'intrus"}
        instructionEn={
          currentQuestion.instructionEn || "Select the odd one out"
        }
        localizedInstruction={currentQuestion.localizedInstruction}
        progress={progress}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={totalQuestions}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={showFeedback ? handleSubmit : handleSubmit} // handleSubmit handles both submit and continue logic
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!!selectedWord || showFeedback}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === totalQuestions
              ? "FINISH"
              : "CONTINUE"
            : "CHECK"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={
          !isCorrect
            ? `${currentQuestion.correctAnswer} - ${currentQuestion.reason}`
            : null
        }
        feedbackMessage={feedbackMessage}
      >
        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          {/* Grid */}
          <div className="grid grid-cols-2 gap-6 md:gap-10 w-full max-w-5xl">
            {currentQuestion.words.map((wordObj, idx) => (
              <button
                key={idx}
                onClick={() => handleWordClick(wordObj)}
                disabled={isSubmitted}
                className={getWordStyle(wordObj)}
              >
                <span className="text-lg md:text-xl font-medium">
                  {wordObj.text}
                </span>
                {isSubmitted && wordObj.en && (
                  <span className="text-sm mt-1 opacity-80">{wordObj.en}</span>
                )}
                {isSubmitted &&
                  wordObj.text === currentQuestion.correctAnswer && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                {isSubmitted &&
                  selectedWord &&
                  wordObj.text === selectedWord.text &&
                  wordObj.text !== currentQuestion.correctAnswer && (
                    <div className="absolute top-2 right-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  )}
              </button>
            ))}
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
