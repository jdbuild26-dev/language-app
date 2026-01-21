import React, { useState, useEffect } from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2, Volume2, CheckCircle2, XCircle } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { cn } from "@/lib/utils";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

export default function PhoneticsPage() {
  const { speak } = useTextToSpeech();

  // State
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("B2_Phonetics");
      if (response && response.data) {
        const gameQuestions = response.data.map((item) => ({
          id: item["ExerciseID"] || Math.random().toString(),
          prompt: item["Audio"] || item["Word ID"],
          instruction: item["Instruction_EN"] || "What do you hear?",
          explanation: item["CorrectExplanation_EN"],
          options: [
            item["Option1"],
            item["Option2"],
            item["Option3"],
            item["Option4"],
          ].filter(Boolean),
          correctIndex: parseInt(item["CorrectOptionIndex"]) - 1,
        }));
        setQuestions(gameQuestions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (index) => {
    if (showFeedback) return;
    setSelectedOptionIndex(index);
  };

  const handleSubmit = () => {
    if (selectedOptionIndex === null || showFeedback) return;

    const correct =
      selectedOptionIndex === questions[currentIndex].correctIndex;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedOptionIndex(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const currentQ = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  return (
    <>
      <PracticeGameLayout
        questionType="Phonetics Practice"
        instructionFr="Choisissez la bonne transcription"
        instructionEn={
          currentQ?.instruction || "Choose the correct transcription"
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => (window.location.href = "/vocabulary/practice")}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOptionIndex !== null && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit"
      >
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-8 md:gap-16 px-4">
          {/* Left Side: Large Audio Button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => speak(currentQ.prompt)}
              className="w-48 h-48 md:w-64 md:h-64 bg-sky-500 rounded-3xl shadow-[0_6px_0_0_#0ea5e9] hover:bg-sky-400 active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center text-white"
            >
              <Volume2
                className="w-24 h-24 md:w-32 md:h-32"
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* Right Side: Question & Options */}
          <div className="flex flex-col w-full max-w-lg gap-6">
            {/* Question Text */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-200">
              {currentQ?.instruction || "Which word do you hear?"}
            </h2>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-3 w-full">
              {currentQ?.options.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={showFeedback}
                    className={cn(
                      "group relative p-4 rounded-2xl border-[3px] text-left font-medium text-lg md:text-xl transition-all flex items-center gap-4 bg-white dark:bg-slate-800 shadow-sm",
                      // Default
                      "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
                      // Selected
                      isSelected &&
                        "border-sky-400 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-300",
                    )}
                  >
                    {/* Fake Radio/Checkbox Circle */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-slate-300 dark:border-slate-500 text-transparent",
                      )}
                    >
                      <span className="text-[10px] font-bold">✓</span>
                    </div>

                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect ? currentQ.options[currentQ.correctIndex] : null
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
