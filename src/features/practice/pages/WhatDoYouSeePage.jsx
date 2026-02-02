import React, { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

import { fuzzyIncludes, matchSpeechToAnswer } from "@/utils/textComparison";

export default function WhatDoYouSeePage() {
  const navigate = useNavigate();

  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(0);

  // Interaction State
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

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
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/practice/what-do-you-see`,
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        // Shuffle or just use as is
        const shuffled = data.sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
      } catch (error) {
        console.error("Error fetching what-do-you-see data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Timer
  useEffect(() => {
    if (!isLoading && !isGameOver) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoading, isGameOver]);

  const currentQuestion = questions[currentIndex];

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpokenText("");
      setShowFeedback(false);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion || showFeedback) return;

    const correct = matchSpeechToAnswer(
      spokenText,
      currentQuestion.correctAnswer,
    );
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    handleNext();
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
    setTimer(0);
    setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  // Generate blank boxes based on answer characters
  // Split by characters to show exact length
  const answerChars = currentQuestion.correctAnswer.split("");

  return (
    <>
      <PracticeGameLayout
        title="What do you see?"
        questionType={currentQuestion.question}
        instructionFr={currentQuestion.instructionFr}
        instructionEn={currentQuestion.instructionEn}
        progress={((currentIndex + 1) / questions.length) * 100}
        score={score}
        totalQuestions={questions.length}
        isGameOver={isGameOver}
        timerValue={formatTimer(timer)}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={handleSubmit}
        onRestart={handleRestart}
        isSubmitEnabled={Boolean(spokenText) && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit"
      >
        <div className="flex flex-col lg:flex-row items-center justify-center max-w-5xl w-full gap-8 lg:gap-16">
          {/* Image Section */}
          <div className="w-full max-w-md aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
            {currentQuestion.imageUrl &&
            !currentQuestion.imageUrl.includes("placeholder") ? (
              <img
                src={currentQuestion.imageUrl}
                alt="What do you see?"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <ImageIcon className="w-16 h-16 mb-2" />
                <span>Image Placeholder</span>
              </div>
            )}
          </div>

          {/* Interaction Section */}
          <div className="flex flex-col items-center justify-center w-full max-w-md gap-8">
            {/* Question Display */}
            <div className="text-center">
              <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 mb-2">
                {currentQuestion.question}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {currentQuestion.instructionEn}
              </p>
            </div>

            {/* Answer Boxes (Visual Hint) */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {answerChars.map((char, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-10 md:w-10 md:h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold transition-colors",
                    char === " "
                      ? "border-transparent bg-transparent"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600",
                  )}
                >
                  {char === " " ? "" : ""}
                </div>
              ))}
            </div>

            {/* Mic Button */}
            <div className="relative">
              <button
                onClick={handleToggleListening}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                  isListening
                    ? "bg-red-500 text-white animate-pulse scale-110 shadow-red-500/30"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-600/30",
                )}
              >
                <Mic
                  className={cn("w-8 h-8", isListening && "animate-bounce")}
                />
              </button>

              {isListening && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-sm font-medium text-red-500 animate-pulse">
                    Listening...
                  </span>
                </div>
              )}
            </div>

            {/* Spoken Text Feedback */}
            <div className="w-full p-4 rounded-xl text-center transition-colors bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
              {spokenText ? (
                <p className="text-lg font-medium">"{spokenText}"</p>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Tap the microphone and speak
                </p>
              )}
            </div>
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
