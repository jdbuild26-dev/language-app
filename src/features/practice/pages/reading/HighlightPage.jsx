import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2 } from "lucide-react";
import { loadMockCSV } from "@/utils/csvLoader";

// MOCK_QUESTIONS removed - migrated to CSV

export default function HighlightPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/reading/highlight_word.csv");
        setQuestions(data);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 30;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback || loading,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedWord(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.passage, "fr-FR");
    }
  };

  // Normalize for comparison
  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .trim();

  const handleWordClick = (word) => {
    if (showFeedback) return;
    setSelectedWord(word);
  };

  const handleSubmit = () => {
    if (showFeedback || !selectedWord) return;

    const correct =
      normalize(selectedWord) === normalize(currentQuestion.correctWord);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Split passage into clickable words
  const words = currentQuestion?.passage.split(/\s+/) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType="Highlight the Word"
        instructionFr="Trouvez et sélectionnez le mot"
        instructionEn="Find and select the word"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!!selectedWord && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Question */}
          <div className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6 shadow-lg">
            <p className="text-lg md:text-xl text-white font-semibold text-center">
              {currentQuestion?.question}
            </p>
          </div>

          {/* Passage with clickable words */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2 justify-center leading-relaxed">
              {words.map((word, index) => {
                const cleanWord = word.replace(/[.,!?;:'"]/g, "");
                const isSelected = selectedWord === cleanWord;
                const isCorrectWord =
                  showFeedback &&
                  normalize(cleanWord) ===
                  normalize(currentQuestion.correctWord);

                return (
                  <button
                    key={index}
                    onClick={() => handleWordClick(cleanWord)}
                    disabled={showFeedback}
                    className={cn(
                      "px-3 py-1 rounded-lg text-lg font-medium transition-all duration-200 border-2",
                      isCorrectWord
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : isSelected && showFeedback && !isCorrect
                          ? "bg-red-500 text-white border-red-500"
                          : isSelected
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-500"
                            : "bg-transparent border-transparent text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300",
                    )}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio button */}
          <button
            onClick={handlePlayAudio}
            disabled={isSpeaking}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              isSpeaking
                ? "bg-emerald-100 text-emerald-600"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600",
            )}
          >
            <Volume2 className="w-4 h-4" />
            Listen to passage
          </button>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQuestion.correctWord : null}
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
