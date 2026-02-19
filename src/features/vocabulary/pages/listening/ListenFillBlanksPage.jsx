import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, RotateCcw, Turtle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ListenFillBlanksPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
  const inputRefs = useRef([]);

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInputs, setUserInputs] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [blankResults, setBlankResults] = useState([]);

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
    isPaused: isCompleted || showFeedback || !hasPlayed,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log(
          "[ListenFillBlanks] 📡 Fetching data from backend (slug: listen_fill_blanks)...",
        );
        const response = await fetchPracticeQuestions("listen_fill_blanks");
        const practiceData = response.data || [];
        console.log(
          `[ListenFillBlanks] ✅ Loaded ${practiceData.length} questions`,
          { sample: practiceData[0] },
        );

        if (!practiceData || practiceData.length === 0) {
          throw new Error("No questions found");
        }

        // Normalize backend data to expected format
        const normalized = practiceData
          .map((item) => {
            const audioText =
              item.audioText ||
              item.AudioText ||
              item.Sentence ||
              item.sentence ||
              item.CompleteSentence ||
              "";
            const blanks = item.blanks || item.Blanks || [];
            const displayParts = item.displayParts || item.DisplayParts || [];
            const timeLimitSeconds = parseInt(
              item.TimeLimitSeconds || item.timeLimitSeconds || "60",
              10,
            );

            // If displayParts not provided, derive from audioText by splitting on blanks
            let parts = displayParts;
            if (
              (!parts || parts.length === 0) &&
              audioText &&
              blanks.length > 0
            ) {
              // Try to create displayParts by splitting text at blank positions
              let text = audioText;
              parts = [];
              const blankArr = Array.isArray(blanks)
                ? blanks
                : typeof blanks === "string"
                  ? blanks.split("|").map((b) => b.trim())
                  : [];
              for (const blank of blankArr) {
                const idx = text.toLowerCase().indexOf(blank.toLowerCase());
                if (idx >= 0) {
                  parts.push(text.substring(0, idx));
                  text = text.substring(idx + blank.length);
                }
              }
              parts.push(text);
            }

            return {
              id: item.id || item.ExerciseID || Math.random().toString(),
              audioText,
              displayParts: parts.length > 0 ? parts : [audioText],
              blanks: Array.isArray(blanks)
                ? blanks
                : typeof blanks === "string"
                  ? blanks.split("|").map((b) => b.trim())
                  : [],
              timeLimitSeconds,
            };
          })
          .filter((q) => q.blanks.length > 0);

        setQuestions(normalized);
      } catch (error) {
        console.error("[ListenFillBlanks] ❌ Failed to fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Initialize inputs when question changes
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInputs(new Array(currentQuestion.blanks.length).fill(""));
      setBlankResults([]);
      setHasPlayed(false);
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQuestion, isCompleted]);

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.audioText, "fr-FR", 0.9);
      setHasPlayed(true);
      resetTimer();
    }
  };

  const handlePlaySlowAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.audioText, "fr-FR", 0.75);
      setHasPlayed(true);
      resetTimer();
    }
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      // Move to next input or submit
      if (index < currentQuestion.blanks.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (userInputs.every((input) => input.trim())) {
        handleSubmit();
      }
    }
  };

  // Normalize for comparison
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

    if (allCorrect) {
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

  const allFilled = userInputs.every((input) => input.trim().length > 0);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-teal-500 w-8 h-8" />
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

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Build the sentence with blanks
  const renderSentence = () => {
    if (!currentQuestion) return null;

    const parts = currentQuestion.displayParts;
    const elements = [];

    for (let i = 0; i < parts.length; i++) {
      elements.push(
        <span key={`part-${i}`} className="text-slate-800 dark:text-slate-100">
          {parts[i]}
        </span>,
      );

      if (i < currentQuestion.blanks.length) {
        elements.push(
          <input
            key={`blank-${i}`}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            value={userInputs[i] || ""}
            onChange={(e) => handleInputChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            disabled={showFeedback}
            className={cn(
              "inline-block w-32 mx-1 px-3 py-1 rounded-lg text-center font-semibold border-2 outline-none transition-all",
              "bg-white dark:bg-slate-700",
              showFeedback && blankResults[i]
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700"
                : showFeedback && !blankResults[i]
                  ? "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700"
                  : "border-slate-300 dark:border-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
            )}
            placeholder="..."
          />,
        );
      }
    }

    return elements;
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Listen and Fill"
        instructionFr="Écoutez et remplissez les blancs"
        instructionEn="Listen and fill in the blanks"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={allFilled && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={hasPlayed ? timerString : "--:--"}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6">
          {/* Audio Player Section */}
          <div className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 mb-8 shadow-lg relative">
            <div className="flex flex-col items-center gap-4">
              {/* Play Button */}
              <button
                onClick={handlePlayAudio}
                disabled={isSpeaking}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                  isSpeaking
                    ? "bg-white/30 animate-pulse"
                    : "bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-95",
                )}
              >
                <Volume2
                  className={cn(
                    "w-10 h-10 text-white",
                    isSpeaking && "animate-pulse",
                  )}
                />
              </button>

              {/* Slow Play Button */}
              <button
                onClick={handlePlaySlowAudio}
                className={cn(
                  "absolute right-4 bottom-4 p-2 rounded-full transition-all flex items-center gap-2",
                  "bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30",
                )}
                title="Play Slow (0.75x)"
              >
                <Turtle className="w-5 h-5" />
                <span className="text-xs font-medium">Slow</span>
              </button>

              {/* Replay hint */}
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Click to {hasPlayed ? "replay" : "play"} audio</span>
              </div>
            </div>
          </div>

          {/* Sentence with Blanks */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xl leading-relaxed text-center">
              {renderSentence()}
            </p>
          </div>

          {/* Show correct answers after feedback */}
          {showFeedback && !isCorrect && (
            <div className="w-full mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                <span className="font-semibold">Correct answers: </span>
                {currentQuestion.blanks.join(", ")}
              </p>
            </div>
          )}
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
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
