import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Mic, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { fuzzyIncludes } from "@/utils/textComparison";

// Helper to normalize text for comparison
// REMOVED local normalizeText in favor of utils

export default function RepeatSentencePage() {
  const navigate = useNavigate();

  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Interaction State
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "fr-FR";
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setSpokenText(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Fetch Data
  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/practice/repeat-sentence`,
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        // Shuffle or just use as is
        const shuffled = data.sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
      } catch (error) {
        console.error("Error fetching repeat sentence data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Timer (Stopwatch mode)
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    mode: "stopwatch",
    isPaused: isLoading || isGameOver,
  });

  const currentQuestion = questions[currentIndex];

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpokenText(""); // Clear previous
      setFeedback(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;

    // Check logic: User must speak the COMPLETE sentence
    // Uses fuzzy matching to allow for small mistakes or slight variations
    const fullSentence =
      currentQuestion.completeSentence ||
      currentQuestion.sentenceWithBlank.replace(
        /_+/g,
        currentQuestion.correctAnswer,
      );

    const isCorrect = fuzzyIncludes(spokenText, fullSentence, 0.70);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  const handleNext = () => {
    setSpokenText("");
    setFeedback(null);
    setIsListening(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentIndex(0);
    setIsGameOver(false);
    resetTimer();
    setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No questions available.
        </p>
        <Button
          onClick={() => navigate("/vocabulary/practice")}
          variant="outline"
          className="mt-4"
        >
          Back
        </Button>
      </div>
    );
  }

  // Construct full sentence for display
  const fullSentence =
    currentQuestion.completeSentence ||
    currentQuestion.sentenceWithBlank.replace(
      /_+/g,
      currentQuestion.correctAnswer,
    );

  return (
    <PracticeGameLayout
      title="Repeat Sentence"
      questionType="Listen and repeat the full sentence"
      instructionFr="Répétez la phrase complète"
      instructionEn="Repeat the full sentence"
      progress={((currentIndex + 1) / questions.length) * 100}
      score={score}
      totalQuestions={questions.length}
      isGameOver={isGameOver}
      timerValue={timerString}
      onExit={() => navigate("/vocabulary/practice")}
      onNext={feedback ? handleNext : handleSubmit}
      onRestart={handleRestart}
      isSubmitEnabled={Boolean(spokenText)}
      showSubmitButton={true}
      submitLabel={
        feedback === "correct"
          ? "Continue"
          : feedback === "incorrect"
            ? "Continue"
            : "Submit"
      }
      showFeedback={!!feedback}
      isCorrect={feedback === "correct"}
      feedbackMessage={feedback === "correct" ? "Excellent!" : "Try again"}
      correctAnswer={
        currentQuestion?.completeSentence || currentQuestion?.sentenceWithBlank
      }
    >
      <div className="flex flex-col items-center justify-center max-w-3xl w-full gap-12">
        {/* Full Sentence Display */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
          {feedback === "correct" && (
            <div className="absolute inset-0 bg-green-500/10 z-0" />
          )}
          {feedback === "incorrect" && (
            <div className="absolute inset-0 bg-red-500/10 z-0" />
          )}

          <div className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 leading-relaxed font-semibold relative z-10">
            {fullSentence}
          </div>

          {/* Audio Player Icon (Simulated for now, can add actual TTS here) */}
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Volume2 className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </Button>
          </div>
        </div>

        {/* DEBUG: Show Answer for Testing */}
        <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4 text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-mono">
            Hint (Testing): {fullSentence}
          </p>
        </div>

        {/* Mic Button & Interaction */}
        <div className="relative">
          <button
            onClick={handleToggleListening}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
              isListening
                ? "bg-red-500 text-white animate-pulse scale-110 shadow-red-500/30"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-600/30",
            )}
          >
            <Mic className={cn("w-10 h-10", isListening && "animate-bounce")} />
          </button>

          {isListening && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-sm font-medium text-red-500 animate-pulse">
                Listening...
              </span>
            </div>
          )}
        </div>

        {/* Spoken Text Feedback */}
        <div className="h-16 w-full text-center">
          {spokenText && (
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
              "{spokenText}"
            </p>
          )}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
