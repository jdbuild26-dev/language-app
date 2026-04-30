"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, User, XCircle, Languages } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslateText } from "@/hooks/useTranslateText";

const parseMaybeJson = (value: any) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
};

const normalizeConversation = (rawConversation: any) => {
  const source = rawConversation?.content || rawConversation || {};

  // Try structured exchanges array first
  let rawExchanges = parseMaybeJson(
    source.exchanges || rawConversation?.exchanges || [],
  );

  // Fallback: build exchanges from flat fields Exchange_1_FR, Exchange_2_FR …
  if (!Array.isArray(rawExchanges) || rawExchanges.length === 0) {
    const built: any[] = [];
    let i = 1;
    while (source[`Exchange_${i}_FR`] || source[`Exchange_${i}_EN`]) {
      built.push({
        turnId: i,
        speakerText: source[`Exchange_${i}_FR`] || source[`Exchange_${i}_EN`] || "",
        speakerAudio: source[`Exchange_${i}_FR`] || source[`Exchange_${i}_EN`] || "",
        speaker: source[`Exchange_${i}_Speaker`] || `Speaker ${i}`,
        questionText: null,
        correctOptionId: null,
        options: [],
      });
      i++;
    }
    rawExchanges = built;
  }

  const exchanges = (Array.isArray(rawExchanges) ? rawExchanges : [])
    .map((exchange: any, index: number) => {
      const rawOptions = parseMaybeJson(exchange.options || []);
      const options = (Array.isArray(rawOptions) ? rawOptions : [])
        .map((option: any, optionIndex: number) => ({
          id: option?.id ?? option?.value ?? optionIndex,
          text:
            option?.text ||
            option?.label ||
            option?.text_fr ||
            option?.text_en ||
            "",
          order:
            typeof option?.order === "number"
              ? option.order
              : typeof option?.index === "number"
                ? option.index
                : optionIndex,
        }))
        .sort((a, b) => a.order - b.order)
        .map((option) => ({
          id: option.id,
          text: option.text,
        }));

      return {
        ...exchange,
        order:
          typeof exchange?.turnId === "number"
            ? exchange.turnId
            : typeof exchange?.order === "number"
              ? exchange.order
              : index,
        speakerText: exchange?.speakerText || exchange?.speakerAudio || "",
        speakerAudio: exchange?.speakerAudio || exchange?.speakerText || "",
        speaker: exchange?.speaker || "",
        questionText: exchange?.questionText || null,
        correctOptionId:
          exchange?.correctOptionId ?? exchange?.correctIndex ?? options[0]?.id ?? null,
        options,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((exchange) => ({
      speakerText: exchange.speakerText,
      speakerAudio: exchange.speakerAudio,
      speaker: exchange.speaker,
      questionText: exchange.questionText,
      correctOptionId: exchange.correctOptionId,
      options: exchange.options,
    }));

  return {
    ...rawConversation,
    ...source,
    title: source["Scenario Title_FR"] || source["Scenario Title_EN"] || source.title || rawConversation?.title || "",
    scenario: source["Context_FR"] || source["Context_EN"] || source.scenario || rawConversation?.scenario || "",
    objectives: source["Objectives_FR"] || source["Objectives_EN"] || "",
    exchanges,
  };
};

export default function ListeningConversationPage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();

  // Current turn/exchange index (0-based)
  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // User's selected option for current turn
  const [selectedOption, setSelectedOption] = useState<any>(null);

  // Whether user has submitted their answer for current turn
  const [hasAnswered, setHasAnswered] = useState(false);

  // Conversation history: array of {speakerText, userText, isRevealed}
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  // Mistakes history
  const [mistakes, setMistakes] = useState<any[]>([]);

  // Feedback states
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Score tracking
  const [score, setScore] = useState(0);

  // Overall completion
  const [isCompleted, setIsCompleted] = useState(false);

  // Audio playback state
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  const currentExchange = conversation?.exchanges?.[currentTurnIndex];
  const totalExchanges = conversation?.exchanges?.length || 0;

  // Translate question text per exchange
  const { displayText: questionDisplayText, isTranslating: isTranslatingQ, toggle: toggleTranslate, reset: resetTranslate } = useTranslateText(currentExchange?.questionText || "", "fr");
  useEffect(() => { resetTranslate(); }, [currentTurnIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const timerDuration = 45; // Increased for conversation context

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback && !hasAnswered) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = (await loadMockCSV(
          "practice/listening/listening_conversation.csv",
        )) as any[];
        if (data && data.length > 0) {
          setConversation(normalizeConversation(data[0]));
        }
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversation();
  }, []);

  // Play audio when new turn starts
  useEffect(() => {
    if (currentExchange && !hasAnswered && !isCompleted && !hasPlayedAudio) {
      // Play speaker's question audio
      speak(currentExchange.speakerAudio, "fr-FR");
      setHasPlayedAudio(true);
    }
  }, [
    currentTurnIndex,
    currentExchange,
    hasAnswered,
    isCompleted,
    hasPlayedAudio,
    speak,
  ]);

  // Reset states when turn changes
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowFeedback(false);
    setHasPlayedAudio(false);
    resetTimer();
  }, [currentTurnIndex, resetTimer]);

  const handleOptionSelect = (optionId) => {
    if (hasAnswered || showFeedback) return;
    const optionObj = currentExchange.options.find(
      (opt) => opt.id === optionId,
    );
    if (optionObj) {
      speak(optionObj.text, "fr-FR");
    }
    setSelectedOption(optionId);
  };

  const playSpeakerAudio = (exchange) => {
    const textToPlay = exchange?.speakerAudio || exchange?.speakerText;
    if (textToPlay) {
      speak(textToPlay, "fr-FR");
    }
  };

  const handleSubmit = () => {
    if (hasAnswered) return;

    // Dialogue-only exchange (no options) — just advance
    if (!currentExchange?.options || currentExchange.options.length === 0) {
      setConversationHistory((prev) => [
        ...prev,
        { speakerText: currentExchange.speakerText, userText: "", userOptionId: null, wasCorrect: true },
      ]);
      setHasAnswered(true);
      handleContinue();
      return;
    }

    if (selectedOption === null || showFeedback) return;

    const selectedOptionObj = currentExchange.options.find(
      (opt) => opt.id === selectedOption,
    );
    const correct = selectedOption === currentExchange.correctOptionId;

    const correctOptionObj = currentExchange.options.find(
      (opt) => opt.id === currentExchange.correctOptionId,
    );

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    setHasAnswered(true);

    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      setMistakes((prev) => [
        ...prev,
        {
          question: currentExchange.speakerText,
          expected: correctOptionObj?.text || "",
          actual: selectedOptionObj?.text || "",
        },
      ]);
    }

    // Add to conversation history: speaker's question (now revealed as text) + user's response
    // Always render the correct text so the ongoing chat is only the correct dialogue.
    setConversationHistory((prev) => [
      ...prev,
      {
        speakerText: currentExchange.speakerText,
        speakerAudio: currentExchange.speakerAudio,
        userText: correct ? selectedOptionObj.text : correctOptionObj.text,
        userOptionId: selectedOption,
        wasCorrect: correct,
      },
    ]);
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentTurnIndex < totalExchanges - 1) {
      // Move to next turn
      setCurrentTurnIndex((prev) => prev + 1);
    } else {
      // Conversation complete
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
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
    totalExchanges > 0 ? ((currentTurnIndex + 1) / totalExchanges) * 100 : 0;

  const customEndGameContent =
    mistakes.length > 0 ? (
      <div className="w-full max-w-2xl text-left bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mt-4 max-h-[400px] overflow-y-auto mx-auto mb-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <XCircle className="w-6 h-6" /> Let's review your mistakes
        </h3>
        <div className="space-y-6">
          {mistakes.map((m, i) => (
            <div
              key={i}
              className="pb-6 border-b last:border-0 border-slate-100 dark:border-slate-700 last:pb-0"
            >
              <p className="font-medium text-slate-800 dark:text-slate-200 mb-3 flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </span>
                <span className="pt-1">{m.question}</span>
              </p>
              <div className="ml-11 space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400 w-16 shrink-0 mt-0.5">
                    You Said:
                  </span>
                  <span className="text-sm text-red-600 dark:text-red-400 line-through opacity-80">
                    {m.actual}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-green-600 dark:text-green-400 w-16 shrink-0 mt-0.5">
                    Correct:
                  </span>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {m.expected}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <>
      <PracticeGameLayout
        questionType="Listening Conversation"
        instructionFr="Écoutez et choisissez la bonne réponse"
        instructionEn="Listen to the audio and select the best response"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={totalExchanges}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={
          currentExchange?.options?.length > 0
            ? selectedOption !== null && !showFeedback && !hasAnswered
            : !hasAnswered
        }
        showSubmitButton={!showFeedback && !hasAnswered}
        submitLabel={currentExchange?.options?.length > 0 ? "Submit" : "Next →"}
        timerValue={currentExchange?.options?.length > 0 ? timerString : ""}
        customEndGameContent={customEndGameContent}
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
              {conversationHistory.map((turn, index) => (
                <div key={index} className="space-y-3">
                  {/* Speaker bubble */}
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                    </div>
                    {/* Historical speaker bubbles are always converted to text */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-4 pr-11 py-3 rounded-2xl rounded-tl-sm shadow-sm text-slate-700 dark:text-slate-200 relative inline-block text-left w-fit max-w-[85%]">
                      <span className="text-[15px] leading-relaxed break-words">{turn.speakerText}</span>
                      <button
                        onClick={() => playSpeakerAudio(turn)}
                        className="absolute top-2 right-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-indigo-500"
                        title="Replay audio"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* User bubble */}
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 text-white pl-5 pr-12 py-3 rounded-2xl rounded-br-sm shadow-sm relative inline-block text-left w-fit max-w-[85%]">
                      <span className="text-[15px] leading-relaxed break-words">
                        {turn.userText}
                      </span>
                      <button
                        onClick={() => speak(turn.userText, "fr-FR")}
                        className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/90"
                        title="Replay audio"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Current turn: Show audio waveform or text if NOT answered yet */}
              {!hasAnswered && currentExchange && (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  </div>
                  <button
                    onClick={() => playSpeakerAudio(currentExchange)}
                    type="button"
                    title="Replay current audio"
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3 w-fit hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group"
                  >
                    <Volume2 className="w-5 h-5 text-indigo-500 animate-pulse shrink-0" />
                    <svg
                      width="120"
                      height="24"
                      viewBox="0 0 120 24"
                      className="text-indigo-400"
                    >
                      <rect x="5" y="8" width="2" height="8" fill="currentColor" rx="1" />
                      <rect x="9" y="5" width="2" height="14" fill="currentColor" rx="1" />
                      <rect x="13" y="3" width="2" height="18" fill="currentColor" rx="1" />
                      <rect x="17" y="7" width="2" height="10" fill="currentColor" rx="1" />
                      <rect x="21" y="10" width="2" height="4" fill="currentColor" rx="1" />
                      <rect x="25" y="4" width="2" height="16" fill="currentColor" rx="1" />
                      <rect x="29" y="8" width="2" height="8" fill="currentColor" rx="1" />
                      <rect x="33" y="6" width="2" height="12" fill="currentColor" rx="1" />
                      <rect x="37" y="9" width="2" height="6" fill="currentColor" rx="1" />
                      <rect x="41" y="7" width="2" height="10" fill="currentColor" rx="1" />
                      <rect x="45" y="8" width="2" height="8" fill="currentColor" rx="1" />
                      <rect x="49" y="5" width="2" height="14" fill="currentColor" rx="1" />
                      <rect x="53" y="3" width="2" height="18" fill="currentColor" rx="1" />
                      <rect x="57" y="7" width="2" height="10" fill="currentColor" rx="1" />
                      <rect x="61" y="10" width="2" height="4" fill="currentColor" rx="1" />
                      <rect x="65" y="4" width="2" height="16" fill="currentColor" rx="1" />
                      <rect x="69" y="8" width="2" height="8" fill="currentColor" rx="1" />
                      <rect x="73" y="6" width="2" height="12" fill="currentColor" rx="1" />
                      <rect x="77" y="9" width="2" height="6" fill="currentColor" rx="1" />
                      <rect x="81" y="7" width="2" height="10" fill="currentColor" rx="1" />
                      <rect x="85" y="8" width="2" height="8" fill="currentColor" rx="1" />
                      <rect x="89" y="5" width="2" height="14" fill="currentColor" rx="1" />
                      <rect x="93" y="3" width="2" height="18" fill="currentColor" rx="1" />
                      <rect x="97" y="7" width="2" height="10" fill="currentColor" rx="1" />
                      <rect x="101" y="10" width="2" height="4" fill="currentColor" rx="1" />
                      <rect x="105" y="6" width="2" height="12" fill="currentColor" rx="1" />
                      <rect x="109" y="8" width="2" height="8" fill="currentColor" rx="1" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Pending User Bubble (before checking) */}
              {selectedOption !== null && !hasAnswered && (
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-br-sm shadow-sm relative inline-block text-left w-fit max-w-[85%] opacity-90">
                    <span className="text-[15px] leading-relaxed">
                      {currentExchange.options.find((o) => o.id === selectedOption)?.text}
                    </span>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {conversationHistory.length === 0 && hasAnswered === false && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 py-10 opacity-70">
                  <p className="text-sm">Conversation will appear here...</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Context + question + options */}
          <div className="flex-1 min-h-0 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-y-auto">
            {/* Context card */}
            <div className="m-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-5 min-h-[6rem]">
              <p className="text-xs font-bold border-b-2 border-gray-200 dark:border-slate-600 pb-1 uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-2">
                Context
              </p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {conversation?.scenario || conversation?.title}
              </p>
              {conversation?.objectives && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">{conversation.objectives}</p>
              )}
            </div>

            {/* Question — only when exchange has options */}
            {currentExchange?.options?.length > 0 && (
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

            {/* Dialogue-only: show speaker name + listening indicator */}
            {currentExchange && (!currentExchange.options || currentExchange.options.length === 0) && (
              <div className="px-4 py-6 flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                {currentExchange.speaker && (
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{currentExchange.speaker}</p>
                )}
                <p className="text-base font-medium text-slate-700 dark:text-slate-200 text-center px-4">
                  {currentExchange.speakerText}
                </p>
                <div className="flex gap-1.5 items-center mt-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p className="text-xs text-slate-400">Listening…</p>
              </div>
            )}

            {/* Options — only when exchange has options */}
            {!hasAnswered && currentExchange?.options?.length > 0 && (
              <div className="px-4 pb-6">
                <PracticeOptions
                  options={currentExchange.options.map((o) => o.text)}
                  selectedOption={
                    selectedOption !== null
                      ? currentExchange.options.findIndex(
                          (o) => o.id === selectedOption,
                        )
                      : null
                  }
                  correctIndex={currentExchange.options.findIndex(
                    (o) => o.id === currentExchange.correctOptionId,
                  )}
                  showFeedback={showFeedback}
                  onSelect={(idx) =>
                    handleOptionSelect(currentExchange.options[idx].id)
                  }
                  renderLabel={() => (
                    <div className="flex items-center gap-3 w-full py-0.5">
                      <Volume2 className="w-5 h-5 text-indigo-500 shrink-0" />
                      <span className="text-[15px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Listen
                      </span>
                    </div>
                  )}
                  renderSuffix={() => null}
                  itemClassName="w-full bg-white dark:bg-slate-800 py-4 px-5 rounded-2xl text-left flex items-center gap-4 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors group"
                />
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
              ? currentExchange.options.find(
                  (opt) => opt.id === currentExchange.correctOptionId,
                )?.text
              : null
          }
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentTurnIndex + 1 === totalExchanges ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
