import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Mic, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { fuzzyIncludes, matchSpeechToAnswer } from "@/utils/textComparison";

// MOCK_DATA removed - now fetching from backend

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
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/practice/repeat-sentence`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        // Shuffle or use as is
        const shuffled = [...data].sort(() => 0.5 - Math.random());
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

  // Construct full sentence for display
  const fullSentence = currentQuestion
    ? (currentQuestion.completeSentence ||
      currentQuestion.sentenceWithBlank.replace(/_+/g, currentQuestion.correctAnswer))
    : "";

  const handlePlayAudio = () => {
    if ("speechSynthesis" in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(fullSentence);
      utterance.lang = "fr-FR";
      utterance.rate = 0.8; // Slightly slower for learning
      window.speechSynthesis.speak(utterance);
    } else {
      alert("TTS is not supported in this browser.");
    }
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpokenText(""); // Clear previous
      setEvaluation(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!spokenText || !currentQuestion || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const fullSentence =
        currentQuestion.completeSentence ||
        currentQuestion.sentenceWithBlank?.replace(
          /_+/g,
          currentQuestion.correctAnswer,
        );

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/practice/evaluate-speaking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "translate", // Repeat sentence is similar to translation evaluation
          transcript: spokenText,
          reference: fullSentence,
          context: "Repeat the sentence exactly as shown."
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate");
      const result = await response.json();
      setEvaluation(result);
      if (result.score >= 70) {
        setScore((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setSpokenText("");
    setEvaluation(null);
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
      onNext={evaluation ? handleNext : handleSubmit}
      onRestart={handleRestart}
      isSubmitEnabled={Boolean(spokenText) && !isSubmitting}
      showSubmitButton={true}
      submitLabel={
        isSubmitting
          ? "Evaluating..."
          : evaluation
            ? "Continue"
            : "Submit"
      }
      showFeedback={!!evaluation}
      isCorrect={evaluation?.score >= 70}
      feedbackMessage={evaluation?.feedback || ""}
      correctAnswer={
        currentQuestion?.completeSentence || currentQuestion?.sentenceWithBlank
      }
    >
      <div className="flex flex-col items-center justify-center max-w-3xl w-full gap-8">
        {/* Full Sentence Display */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
          {evaluation && evaluation.score >= 70 && (
            <div className="absolute inset-0 bg-green-500/10 z-0" />
          )}
          {evaluation && evaluation.score < 70 && (
            <div className="absolute inset-0 bg-red-500/10 z-0" />
          )}

          <div className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 leading-relaxed font-semibold relative z-10">
            {fullSentence}
          </div>

          <div className="mt-4 flex justify-center relative z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayAudio}
              className="rounded-full w-12 h-12 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-sm transition-all hover:scale-110 active:scale-95"
            >
              <Volume2 className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </Button>
          </div>
        </div>

        {/* AI Evaluation Result */}
        {evaluation && (
          <div className={cn(
            "w-full rounded-2xl p-4 md:p-6 border animate-in slide-in-from-bottom-4 duration-500",
            evaluation.score >= 70
              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
              : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
          )}>
            <div className="flex items-center gap-3 md:gap-4">
              <div className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-base md:text-xl font-bold border-2 shrink-0",
                evaluation.score >= 70 ? "bg-emerald-500 text-white border-emerald-400" : "bg-amber-500 text-white border-amber-400"
              )}>
                {evaluation.score}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">AI Analysis</h4>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">{evaluation.feedback}</p>
              </div>
            </div>

            {evaluation.correction && evaluation.score < 90 && (
              <div className="mt-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-white dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended</p>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{evaluation.correction}</p>
              </div>
            )}
          </div>
        )}

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
