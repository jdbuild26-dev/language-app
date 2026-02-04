import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ListenInteractivePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
  const chatEndRef = useRef(null);

  // State
  const [conversation, setConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [displayedExchanges, setDisplayedExchanges] = useState([]);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = await loadMockCSV(
          "practice/listening/listen_interactive.csv",
        );
        if (data && data.length > 0) {
          setConversation(data[0]);
        }
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversation();
  }, []);

  // Derived state
  const currentExchange = conversation?.exchanges[currentExchangeIndex];
  const timerDuration = conversation?.timeLimitSeconds || 300;

  // Count total questions
  const totalQuestions =
    conversation?.exchanges.filter((e) => e.isQuestion).length || 0;

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
    isPaused: isCompleted || showFeedback || isLoading,
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedExchanges, currentExchange]);

  // Initial setup and auto-advance logic
  useEffect(() => {
    if (isCompleted) return;

    const handleAutoAdvance = async () => {
      // If it's the start, or we moved to a new exchange that is NOT a question
      if (currentExchange && !currentExchange.isQuestion) {
        // 1. Add to display
        if (!displayedExchanges.some((e) => e === currentExchange)) {
          // Only add if not already displayed to prevent dupes in strict mode
          // (React 18 strict mode double-invokes effects)
          // But simpler here: we control when index changes.
        }

        // Logic: When index changes, if it's not a question, we:
        // a) Speak it
        // b) Add to displayed list
        // c) Wait, then move to next
      }
    };
    handleAutoAdvance();
  }, [currentExchangeIndex, isCompleted]);

  // Effect to handle non-question exchanges automatically
  useEffect(() => {
    if (!currentExchange || isCompleted) return;

    if (!currentExchange.isQuestion && !showFeedback) {
      // It's a statement by the other speaker

      // Prevent duplicate adding - check if this exchange is already displayed
      setDisplayedExchanges((prev) => {
        // Check if already exists by comparing text and speaker
        const alreadyExists = prev.some(
          (ex) =>
            ex.text === currentExchange.text &&
            ex.speaker === currentExchange.speaker,
        );

        if (!alreadyExists) {
          // Play audio when adding
          speak(currentExchange.text, "fr-FR");
          return [...prev, currentExchange];
        }
        return prev;
      });

      // Advance after delay (simulating listening time + small pause)
      // Base delay 2s + approx duration based on length
      const delay = 1500 + currentExchange.text.length * 50;

      const timer = setTimeout(() => {
        if (currentExchangeIndex < conversation?.exchanges?.length - 1) {
          setCurrentExchangeIndex((prev) => prev + 1);
        } else {
          setIsCompleted(true);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [
    currentExchangeIndex,
    currentExchange,
    showFeedback,
    conversation?.exchanges.length,
    isCompleted,
    speak,
  ]);

  const handlePlayExchange = (text) => {
    speak(text, "fr-FR");
  };

  const handleOptionSelect = (index) => {
    if (showFeedback) return;
    // Play TTS for the option
    speak(currentExchange.options[index], "fr-FR");
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (showFeedback || selectedOption === null) return;

    const correct = selectedOption === currentExchange.correctIndex;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    // Add user's response to display
    setDisplayedExchanges((prev) => [
      ...prev,
      {
        speaker: "You",
        text: currentExchange.options[selectedOption],
        isQuestion: false,
      },
    ]);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedOption(null);

    // Move to next exchange
    if (currentExchangeIndex < conversation?.exchanges?.length - 1) {
      setCurrentExchangeIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Calculate progress
  // Count how many questions we have passed so far
  const completedQuestions =
    conversation?.exchanges
      ?.slice(0, currentExchangeIndex) // look at history
      ?.filter((e) => e.isQuestion)?.length || 0;

  // If we just finished one (status feedback), count it?
  // Actually simpler: just use generic progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
      </div>
    );
  }

  if (!conversation) {
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
    (Math.min(score + (showFeedback && isCorrect ? 0 : 0), totalQuestions) /
      totalQuestions) *
    100;
  // A better progress bar for 'linear' conversation:
  const progressLinear =
    (currentExchangeIndex / (conversation?.exchanges?.length || 1)) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Interactive Listening"
        instructionFr="Suivez la conversation et répondez"
        instructionEn="Follow the conversation and respond"
        progress={progressLinear}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={totalQuestions}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={
          selectedOption !== null &&
          !showFeedback &&
          currentExchange?.isQuestion
        }
        showSubmitButton={currentExchange?.isQuestion && !showFeedback}
        submitLabel="Reply"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 py-4">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* LEFT COLUMN: Conversation History */}
            <div className="flex flex-col space-y-4">
              {/* Context / Title */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-pink-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Context
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {conversation?.context}
                </p>
              </div>

              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Conversation
              </h3>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4">
                {/* Show conversation history */}
                {displayedExchanges.map((exchange, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                      exchange.speaker === "You"
                        ? "justify-end"
                        : "justify-start",
                    )}
                  >
                    {exchange.speaker !== "You" && (
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-2xl rounded-tl-md shadow-sm">
                          <p className="text-sm">{exchange.text}</p>
                          {/* Play audio button */}
                          <button
                            onClick={() => handlePlayExchange(exchange.text)}
                            className="text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 mt-1 inline-flex items-center gap-1"
                            title="Play audio"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {exchange.speaker === "You" && (
                      <div className="bg-pink-500 text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm max-w-[85%]">
                        <p className="text-sm">{exchange.text}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty state */}
                {displayedExchanges.length === 0 && (
                  <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
                    <p className="text-sm">Conversation will appear here...</p>
                  </div>
                )}

                {/* Invisible element to scroll to */}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* RIGHT COLUMN: Response Options */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Select your response
              </h3>

              {currentExchange?.isQuestion && !showFeedback && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Question prompt */}
                  <div className="w-full bg-pink-50 dark:bg-pink-900/20 rounded-xl p-3 mb-3 border border-pink-200 dark:border-pink-800">
                    <p className="text-sm text-pink-700 dark:text-pink-300 text-center">
                      <span className="font-semibold">Your turn: </span>
                      {currentExchange.question}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="w-full grid grid-cols-1 gap-2">
                    {currentExchange.options.map((option, index) => {
                      const isSelected = selectedOption === index;

                      return (
                        <button
                          key={index}
                          onClick={() => handleOptionSelect(index)}
                          className={cn(
                            "group relative p-4 rounded-xl border-2 text-left font-medium text-base transition-all flex items-center gap-4 bg-white dark:bg-slate-800 shadow-sm",
                            // Default state
                            "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300",
                            // Selected state
                            isSelected &&
                              "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 shadow-md ring-1 ring-pink-500",
                          )}
                        >
                          {/* Circle Indicator */}
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                              isSelected
                                ? "border-pink-500 bg-pink-500 text-white"
                                : "border-slate-300 dark:border-slate-500 text-transparent group-hover:border-slate-400",
                            )}
                          >
                            <span className="text-[10px] font-bold">✓</span>
                          </div>

                          <div className="flex-1 flex items-center">
                            {/* Waveform SVG */}
                            <svg
                              width="120"
                              height="24"
                              viewBox="0 0 120 40"
                              className={cn(
                                "transition-colors",
                                isSelected
                                  ? "text-pink-500"
                                  : "text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400",
                              )}
                            >
                              <rect
                                x="10"
                                y="15"
                                width="3"
                                height="10"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="16"
                                y="10"
                                width="3"
                                height="20"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="22"
                                y="5"
                                width="3"
                                height="30"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="28"
                                y="12"
                                width="3"
                                height="16"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="34"
                                y="18"
                                width="3"
                                height="4"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="40"
                                y="8"
                                width="3"
                                height="24"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="46"
                                y="14"
                                width="3"
                                height="12"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="52"
                                y="11"
                                width="3"
                                height="18"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="58"
                                y="16"
                                width="3"
                                height="8"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="64"
                                y="13"
                                width="3"
                                height="14"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="70"
                                y="10"
                                width="3"
                                height="20"
                                fill="currentColor"
                                rx="1.5"
                              />
                              <rect
                                x="76"
                                y="15"
                                width="3"
                                height="10"
                                fill="currentColor"
                                rx="1.5"
                              />
                            </svg>
                          </div>

                          {/* Audio indicator */}
                          <Volume2
                            className={cn(
                              "w-4 h-4 transition-colors",
                              isSelected
                                ? "text-pink-500"
                                : "text-slate-300 group-hover:text-slate-400",
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* If waiting for other speaker, maybe show a "Thinking..." indicator or just wait for timeout */}
              {currentExchange &&
                !currentExchange.isQuestion &&
                !showFeedback && (
                  <div className="h-12 flex items-center justify-center text-slate-400 text-sm animate-pulse">
                    Listening...
                  </div>
                )}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect
              ? currentExchange.options[currentExchange.correctIndex]
              : null
          }
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentExchangeIndex === (conversation?.exchanges?.length || 0) - 1
              ? "FINISH"
              : "CONTINUE"
          }
        />
      )}
    </>
  );
}
