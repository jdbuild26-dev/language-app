import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export default function FillBlanksPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMockCSV("practice/reading/fill_blanks.csv");
      setQuestions(data);
      setLoading(false);
    };
    fetchData();
  }, []);

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
    isPaused: loading || isCompleted || showFeedback,
  });

  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      resetTimer();
      setSelectedWord(null);
    }
  }, [currentIndex, questions, isCompleted, resetTimer]);

  const handleWordSelect = (word) => {
    if (showFeedback) return;
    setSelectedWord(word);
  };

  const handleSpeak = () => {
    if (currentQuestion) {
      // Prefer implicit Sentence or construct from parts
      const fullSentence =
        currentQuestion.Sentence ||
        currentQuestion.completeSentence ||
        (currentQuestion.sentenceWithBlank
          ? currentQuestion.sentenceWithBlank.replace(
              "______",
              currentQuestion.correctAnswer,
            )
          : "");

      if (fullSentence) {
        speak(fullSentence, "fr-FR");
      }
    }
  };

  // ... (lines 74-100 omitted) ...

  // Split sentence around blank
  // If sentenceWithBlank is missing but we have Sentence and correctAnswer,
  // we might try to infer a blank, or just fail gracefully.
  // For now, robust fallback to empty arrays to prevent crash.
  const sentenceParts = (currentQuestion?.sentenceWithBlank || "").split(
    "______",
  );
  if (sentenceParts.length < 2) {
    // If split failed (no blank found), ensure we have at least 2 parts for the UI to render [0] (blank) [1]
    // This handles cases where sentenceWithBlank is "" or doesn't contain the delimiter
    sentenceParts.push("");
    if (sentenceParts.length < 2) sentenceParts.push("");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No questions available.
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
        questionType="Fill in the Blanks"
        instructionFr="Choisissez le mot correct"
        instructionEn="Choose the correct word"
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
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-8">
          {/* Sentence Display */}
          <div className="relative w-full bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
            {/* Audio Button */}
            <button
              onClick={handleSpeak}
              disabled={isSpeaking}
              className={cn(
                "absolute top-4 right-4 p-2 rounded-full transition-all duration-200",
                isSpeaking
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-500"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-500",
              )}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Sentence with Blank */}
            <div className="text-xl md:text-2xl text-slate-800 dark:text-slate-100 leading-relaxed font-medium text-center">
              <span>{sentenceParts[0]}</span>
              <span
                className={cn(
                  "inline-block min-w-[120px] px-4 py-1 mx-1 rounded-lg border-2 border-dashed transition-all duration-200",
                  selectedWord
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "border-slate-300 dark:border-slate-600 text-slate-400",
                )}
              >
                {selectedWord || "______"}
              </span>
              <span>{sentenceParts[1]}</span>
            </div>

            {/* English Translation */}
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center italic">
              {currentQuestion?.englishTranslation}
            </p>
          </div>

          {/* Word Bank */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {currentQuestion?.wordBank.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordSelect(word)}
                disabled={showFeedback}
                className={cn(
                  "py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 border-2",
                  selectedWord === word
                    ? "bg-blue-500 text-white border-blue-500 shadow-lg scale-105"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                  showFeedback && word === currentQuestion.correctAnswer
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "",
                  showFeedback &&
                    selectedWord === word &&
                    word !== currentQuestion.correctAnswer
                    ? "bg-red-500 text-white border-red-500"
                    : "",
                )}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
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
