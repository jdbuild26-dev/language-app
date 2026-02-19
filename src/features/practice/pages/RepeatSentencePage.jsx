import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Mic, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { fuzzyIncludes, matchSpeechToAnswer } from "@/utils/textComparison";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { loadMockCSV } from "@/utils/csvLoader";

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
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
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
        const data = await loadMockCSV("practice/speaking/repeat_sentence.csv");
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
  // Supports various API response formats (camelCase, PascalCase, with spaces)
  const fullSentence = currentQuestion
    ? currentQuestion.Sentence ||
      currentQuestion.sentence ||
      currentQuestion.completeSentence ||
      currentQuestion["Complete Sentence"] ||
      ((currentQuestion.sentenceWithBlank ||
        currentQuestion["Sentence With Blank"]) &&
      currentQuestion.correctAnswer
        ? // Prioritize sentenceWithBlank if available, otherwise "Sentence With Blank"
          (
            currentQuestion.sentenceWithBlank ||
            currentQuestion["Sentence With Blank"]
          ).replace(/_+/g, currentQuestion.correctAnswer)
        : "")
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
      setShowFeedback(false);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (!spokenText || !currentQuestion) return;

    // 1. First check if they said the full correct sentence (standard similarity)
    let correct = matchSpeechToAnswer(spokenText, fullSentence);

    // 2. If full sentence didn't match perfectly, check if they at least said the specific 'correctAnswer' word
    // This makes the 'blank' part of the exercise more forgiving if they struggle with the whole sentence
    if (!correct && currentQuestion.correctAnswer) {
      correct = fuzzyIncludes(spokenText, currentQuestion.correctAnswer, 0.75); // Slightly higher threshold for single word
      if (correct) {
      }
    }

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSpokenText("");
    setShowFeedback(false);
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
      onExit={() => navigate("/practice")}
      onNext={showFeedback ? handleNext : handleSubmit}
      onRestart={handleRestart}
      isSubmitEnabled={Boolean(spokenText) && !isSubmitting}
      showSubmitButton={!showFeedback}
      submitLabel={isSubmitting ? "Evaluating..." : "Submit"}
    >
      <div className="flex flex-col items-center justify-center max-w-3xl w-full gap-8">
        {/* Full Sentence Display */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
          {showFeedback && isCorrect && (
            <div className="absolute inset-0 bg-green-500/10 z-0" />
          )}
          {showFeedback && !isCorrect && (
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

        {/* DEBUG: Show Answer for Testing */}
        <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4 text-center break-words">
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

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={currentQuestion.correctAnswer}
          message={feedbackMessage}
          onContinue={handleNext}
        />
      )}
    </PracticeGameLayout>
  );
}
