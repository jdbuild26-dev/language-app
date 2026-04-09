"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

import { matchSpeechToAnswer } from "@/utils/textComparison";

import { loadMockCSV } from "@/utils/csvLoader";

// Polyfill types for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface PracticeQuestion {
  external_id?: string;
  question: string;
  imageUrl?: string;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
  title?: string;
  progress?: number;
  correctAnswer: string;
  tagSlugs?: string[];
}

export default function WhatDoYouSeePage() {
  const router = useRouter();

  // Game State
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
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

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "fr-FR";
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setSpokenText(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
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
        const data = await loadMockCSV("practice/speaking/what_do_you_see.csv");
        if (Array.isArray(data)) {
          // Shuffle or just use as is
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setQuestions(shuffled as PracticeQuestion[]);
        }
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

  const currentQuestion = questions[currentIndex] || null;

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
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
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

  const formatTimer = (seconds: number) => {
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

  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No questions available.
        </p>
        <Button
          onClick={() => router.push("/vocabulary/practice")}
          variant="outline"
          className="mt-4"
        >
          Back
        </Button>
      </div>
    );
  }

  // Generate blank boxes based on answer characters
  const answerChars = currentQuestion.correctAnswer
    ? currentQuestion.correctAnswer.split("")
    : [];

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
        onExit={() => router.push("/practice")}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={handleRestart}
        isSubmitEnabled={Boolean(spokenText) && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit"
        exerciseId={currentQuestion.external_id}
        tagSlugs={currentQuestion.tagSlugs}
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
                type="button"
                onClick={handleToggleListening}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50",
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
            <div className="w-full p-4 rounded-xl text-center transition-colors bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-h-[64px] flex items-center justify-center">
              {spokenText ? (
                <p className="text-lg font-semibold italic text-blue-600 dark:text-blue-400">
                  "{spokenText}"
                </p>
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
          feedbackTone={isCorrect ? "success" : "error"}
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
