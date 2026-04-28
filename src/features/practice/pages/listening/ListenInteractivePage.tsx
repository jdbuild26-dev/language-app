"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, User, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslateText } from "@/hooks/useTranslateText";

export default function ListenInteractivePage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // State
  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [displayedExchanges, setDisplayedExchanges] = useState<any[]>([]);
  const leftSideMode = "text";

  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = (await loadMockCSV(
          "practice/listening/listen_interactive.csv",
        )) as any[];
        if (data && data.length > 0) {
          const raw = data[0] as any;

          // Build exchanges from flat fields: Speaker_N_FR + Prompt_N_FR + Sample_N_FR
          const exchanges: any[] = [];
          let n = 1;
          while (raw[`Speaker_${n}_FR`] || raw[`Prompt_${n}_FR`]) {
            const speakerText = raw[`Speaker_${n}_FR`] || "";
            const question = raw[`Prompt_${n}_FR`] || raw[`Prompt_${n}_EN`] || "";
            const correctText = raw[`Sample_${n}_FR`] || raw[`Sample_${n}_EN`] || "";

            // Build options: correct + samples from other turns as distractors
            const distractors: string[] = [];
            let d = 1;
            while (raw[`Sample_${d}_FR`]) {
              if (d !== n) distractors.push(raw[`Sample_${d}_FR`]);
              d++;
            }
            const options = [correctText, ...distractors.slice(0, 3)]
              .filter(Boolean)
              .sort(() => Math.random() - 0.5);
            const correctIndex = options.indexOf(correctText);

            // Non-question exchange: just the speaker line
            if (speakerText) {
              exchanges.push({
                speaker: raw[`Scenario Title_FR`] ? "Speaker" : `Speaker ${n}`,
                text: speakerText,
                isQuestion: false,
              });
            }

            // Question exchange
            if (question && options.length > 0) {
              exchanges.push({
                speaker: "Question",
                text: question,
                question,
                isQuestion: true,
                options,
                correctIndex: correctIndex >= 0 ? correctIndex : 0,
              });
            }
            n++;
          }

          setConversation({
            title: raw["Scenario Title_FR"] || raw["Scenario Title_EN"] || "",
            context: raw["Scenario_FR"] || raw["Scenario_EN"] || "",
            timeLimitSeconds: raw["Time"] || 300,
            exchanges,
          });
        } else {
          setConversation(null);
        }
      } catch (error) {
        console.error("Error loading mock data:", error);
        setConversation(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversation();
  }, []);

  // Derived state
  const currentExchange = conversation?.exchanges?.[currentExchangeIndex];
  const timerDuration = conversation?.timeLimitSeconds || 300;

  // Translate question per exchange
  const { displayText: questionDisplayText, isTranslating: isTranslatingQ, toggle: toggleTranslate, reset: resetTranslate } = useTranslateText(currentExchange?.question || "", "fr");
  useEffect(() => { resetTranslate(); }, [currentExchangeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Count total questions
  const totalQuestions =
    conversation?.exchanges.filter((e) => e.isQuestion).length || 0;

  const { timerString } = useExerciseTimer({
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
    // This effect intentionally keys off the exchange index only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExchangeIndex, isCompleted]);

  // Effect to handle non-question exchanges automatically
  useEffect(() => {
    if (!currentExchange || isCompleted) return;

    if (!currentExchange.isQuestion && !showFeedback) {
      // It's a statement by the other speaker

      // 1. Speak the text (side effect outside of state updater)
      // Check if we've already spoken/added this to avoid double speaking
      const isAlreadyDisplayed = displayedExchanges.some(
        (ex) =>
          ex.text === currentExchange.text &&
          ex.speaker === currentExchange.speaker,
      );

      if (!isAlreadyDisplayed) {
        speak(currentExchange.text, "fr-FR");
        setDisplayedExchanges((prev) => [...prev, currentExchange]);
      }

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
    // `speak` and `displayedExchanges` are intentionally excluded to avoid
    // replaying audio and resetting timers when voice state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentExchangeIndex,
    currentExchange,
    showFeedback,
    conversation?.exchanges.length,
    isCompleted,
    // speak, // INTENTIONAL: Removed to prevent timer resets on voice load
    // displayedExchanges, // Added to check for duplication locally
  ]);

  const handlePlayExchange = (text) => {
    speak(text, "fr-FR");
  };

  const handleOptionSelect = (index) => {
    if (showFeedback) return;
    // Play TTS for the option only if the right panel is in audio mode
    if (leftSideMode === "text") {
      speak(currentExchange.options[index], "fr-FR");
    }
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

  const progressLinear =
    (currentExchangeIndex / (conversation?.exchanges?.length || 1)) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Listening Conversation"
        instructionFr="Écoutez et choisissez la bonne réponse"
        instructionEn="Listen to the audio and select the best response"
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
        submitLabel="Submit"
        timerValue={timerString}
      >
        {/* Two-column layout */}
        <div className="practice-reading-page-shell flex flex-col md:flex-row gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0">
          {/* LEFT: Conversation bubbles */}
          <div className="flex-1 min-h-0 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b-[2px] border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                Conversation
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide-until-hover p-4 space-y-4">
              {/* Show conversation history */}
              {displayedExchanges.map((exchange, index) => {
                const isHistorical = index < displayedExchanges.length - 1 || showFeedback;
                const showSpeakerAsText = leftSideMode === "text" || isHistorical;

                return (
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
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                      </div>
                      {showSpeakerAsText ? (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-4 pr-11 py-3 rounded-2xl rounded-tl-sm shadow-sm text-slate-700 dark:text-slate-200 relative inline-block text-left w-fit">
                          <span className="text-[15px] leading-relaxed break-words">{exchange.text}</span>
                          <button
                            onClick={() => handlePlayExchange(exchange.text)}
                            className="absolute top-2 right-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-indigo-500"
                            title="Replay audio"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePlayExchange(exchange.text)}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group"
                        >
                          <Volume2 className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                          <div className="flex gap-1 items-center">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1 rounded-full bg-slate-200 dark:bg-slate-700",
                                  i % 2 === 0 ? "h-3" : "h-5",
                                )}
                              />
                            ))}
                          </div>
                        </button>
                      )}
                    </div>
                  )}

                  {exchange.speaker === "You" && (
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white pl-5 pr-12 py-3 rounded-2xl rounded-br-sm shadow-sm relative inline-block text-left w-fit ">
                        <span className="text-[15px] leading-relaxed break-words">
                          {exchange.text}
                        </span>
                        <button
                          onClick={() => handlePlayExchange(exchange.text)}
                          className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/90"
                          title="Replay audio"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )})}

              {/* Pending User Bubble (before checking) */}
              {selectedOption !== null && !showFeedback && (
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-br-sm shadow-sm relative inline-block text-left w-fit max-w-[85%] opacity-90">
                    {leftSideMode === "text" ? (
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-white/80 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          Selected
                        </span>
                      </div>
                    ) : (
                      <span className="text-[15px] leading-relaxed">
                        {currentExchange?.options[selectedOption]}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {displayedExchanges.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 py-10 opacity-70">
                  <p className="text-sm">Conversation will appear here...</p>
                </div>
              )}

              {/* Invisible element to scroll to */}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* RIGHT: Objective + question + options */}
          <div className="flex-1 min-h-0 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-y-auto">
            {/* Context card */}
            <div className="m-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-5 min-h-[6rem]">
              <p className="text-xs font-bold border-b-2 border-gray-200 dark:border-slate-600 pb-1 uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-2">
                Context
              </p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                {conversation?.context || conversation?.title}
              </p>
            </div>

            {/* Question */}
            {currentExchange?.isQuestion && !showFeedback && (
              <div className="px-4 py-5 animate-in fade-in slide-in-from-bottom-4 duration-500 border-b border-slate-100 dark:border-slate-700/50 mb-2">
                <h3 className="practice-reading-heading flex items-start gap-3 text-[15px] font-bold text-slate-800 dark:text-slate-200">
                  <button type="button" onClick={toggleTranslate} disabled={isTranslatingQ} className="inline-flex items-center justify-center shrink-0 text-orange-500 hover:text-orange-600 disabled:opacity-60 transition-colors mt-0.5">
                    {isTranslatingQ ? <Loader2 className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5 shrink-0" />}
                  </button>
                  <span className="leading-relaxed">
                    {questionDisplayText || "Select the best response"}
                  </span>
                </h3>
              </div>
            )}

            {/* Options */}
            {currentExchange?.isQuestion && !showFeedback && (
              <div className="px-4 pb-6">
                <PracticeOptions
                  options={currentExchange.options}
                selectedOption={selectedOption}
                correctIndex={currentExchange.correctIndex}
                showFeedback={showFeedback}
                onSelect={handleOptionSelect}
                {...(leftSideMode === "text"
                  ? {
                      renderLabel: () => (
                        <div className="flex items-center gap-3 w-full py-0.5">
                          <Volume2 className="w-5 h-5 text-indigo-500 shrink-0" />
                          <span className="text-[15px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                            Listen
                          </span>
                        </div>
                      ),
                    }
                  : {})}
                renderSuffix={() => null}
                itemClassName="w-full bg-white dark:bg-slate-800 py-4 px-5 rounded-2xl text-left flex items-center gap-4 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors group"
                />
              </div>
            )}

            {/* If waiting for other speaker */}
            {currentExchange &&
              !currentExchange.isQuestion &&
              !showFeedback && (
                <div className="h-24 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-80">
                  <Volume2 className="w-6 h-6 animate-pulse mb-3" />
                  <div className="text-sm font-medium tracking-wide">
                    Listening...
                  </div>
                </div>
              )}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
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
