import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";

export default function TypingFillInBlankPage() {
  const navigate = useNavigate();
  const handleExit = () => navigate("/vocabulary/practice");
  const { speak, isSpeaking } = useTextToSpeech();
  const inputRefs = useRef([]);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [blankResults, setBlankResults] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log(
          "[TypingFillInBlank] 📡 Fetching data from backend (slug: vocab_typing_blanks)...",
        );
        const response = await fetchPracticeQuestions("vocab_typing_blanks");
        const practiceData = response.data || [];
        console.log(
          `[TypingFillInBlank] ✅ Loaded ${practiceData.length} questions`,
          { sample: practiceData[0] },
        );

        if (!practiceData || practiceData.length === 0) {
          throw new Error("No questions found");
        }

        // Normalize backend data to expected format
        const normalized = practiceData
          .map((item) => {
            // Try to extract blanks and displayParts from the data
            const blanks = item.blanks || item.Blanks || [];
            const displayParts = item.displayParts || item.DisplayParts || [];
            const fullText =
              item.fullText ||
              item.FullText ||
              item.Sentence ||
              item.sentence ||
              item.CompleteSentence ||
              item.completeSentence ||
              "";
            const hints = item.hints || item.Hints || [];
            const timeLimitSeconds = parseInt(
              item.TimeLimitSeconds || item.timeLimitSeconds || "60",
              10,
            );

            return {
              id: item.id || item.ExerciseID || Math.random().toString(),
              fullText,
              displayParts:
                displayParts.length > 0
                  ? displayParts
                  : fullText.split(/____/).map((p) => p),
              blanks: Array.isArray(blanks)
                ? blanks
                : typeof blanks === "string"
                  ? blanks.split("|").map((b) => b.trim())
                  : [],
              hints: Array.isArray(hints)
                ? hints
                : typeof hints === "string"
                  ? hints.split("|").map((h) => h.trim())
                  : [],
              timeLimitSeconds,
            };
          })
          .filter((q) => q.blanks.length > 0);

        setQuestions(normalized);
      } catch (err) {
        console.error("[TypingFillInBlank] ❌ Failed to fetch:", err);
        setError("Failed to load questions. Please check data source.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 60;

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
      setUserInputs(new Array(currentQuestion.blanks.length).fill(""));
      setBlankResults([]);
      resetTimer();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.fullText, "fr-FR");
    }
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      if (index < currentQuestion.blanks.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (userInputs.every((input) => input.trim())) {
        handleSubmit();
      }
    }
  };

  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const handleSubmit = () => {
    if (showFeedback) return;
    const results = currentQuestion.blanks.map((blank, index) => {
      const userAnswer = normalize(userInputs[index] || "");
      const correctAnswer = normalize(blank);
      return userAnswer === correctAnswer;
    });
    setBlankResults(results);
    const allCorrect = results.every((r) => r);
    setIsCorrect(allCorrect);
    setFeedbackMessage(getFeedbackMessage(allCorrect));
    setShowFeedback(true);
    if (allCorrect) setScore((prev) => prev + 1);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "No questions found for this activity."}
      </div>
    );
  }

  const allFilled = userInputs.every((input) => input.trim().length > 0);
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const renderSentence = () => {
    if (!currentQuestion) return null;
    const parts = currentQuestion.displayParts;
    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      elements.push(<span key={`part-${i}`}>{parts[i]}</span>);
      if (i < currentQuestion.blanks.length) {
        elements.push(
          <span key={`blank-${i}`} className="inline-block mx-1">
            <input
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              value={userInputs[i] || ""}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              disabled={showFeedback}
              className={cn(
                "w-32 px-3 py-1 rounded-lg text-center font-semibold border-2 outline-none transition-all",
                "bg-white dark:bg-slate-700",
                showFeedback && blankResults[i]
                  ? "border-emerald-500"
                  : showFeedback && !blankResults[i]
                    ? "border-red-500"
                    : "border-slate-300 focus:border-blue-500",
              )}
              placeholder={
                currentQuestion.hints && currentQuestion.hints[i]
                  ? currentQuestion.hints[i]
                  : "..."
              }
              onFocus={(e) => {
                e.target.placeholder = "";
              }}
              onBlur={(e) => {
                e.target.placeholder =
                  currentQuestion.hints && currentQuestion.hints[i]
                    ? currentQuestion.hints[i]
                    : "...";
              }}
            />
          </span>,
        );
      }
    }
    return elements;
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Fill in the blanks - Vocabulary"
        instructionEn="Type the missing words"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        isSubmitEnabled={allFilled && !showFeedback}
        showSubmitButton={!showFeedback}
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-12">
          <div className="w-full bg-white dark:bg-slate-800 rounded-3xl p-10 mb-8 shadow-2xl border-2 border-slate-100 dark:border-slate-700">
            <p className="text-2xl leading-relaxed text-center font-medium text-slate-700 dark:text-slate-200">
              {renderSentence()}
            </p>
          </div>
          <button
            onClick={handlePlayAudio}
            disabled={isSpeaking}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border-2 border-transparent hover:border-blue-200"
          >
            <Volume2 className={cn("w-5 h-5", isSpeaking && "animate-pulse")} />
            Listen to full sentence
          </button>
        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          onContinue={handleContinue}
          message={feedbackMessage}
          correctAnswer={!isCorrect ? currentQuestion.blanks.join(", ") : null}
          continueLabel={
            currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
