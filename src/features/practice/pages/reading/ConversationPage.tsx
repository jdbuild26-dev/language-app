"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { User, Volume2, XCircle, Languages, Loader2 } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

type ConversationOption = { id: string | number; text: string };
type ConversationExchange = {
  speakerText: string;
  questionText?: string;
  correctOptionId: string | number;
  options: ConversationOption[];
};
type ConversationData = {
  title?: string;
  scenario?: string;
  exchanges: ConversationExchange[];
};
type ConversationHistoryItem = {
  speakerText: string;
  userText: string;
  userOptionId: string | number | null;
  wasCorrect: boolean;
};
type MistakeItem = { question: string; expected: string; actual: string };

export default function ConversationPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  // Current conversation data
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Current turn/exchange index (0-based)
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // User's selected option for current turn
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);

  // Whether user has submitted their answer for current turn
  const [hasAnswered, setHasAnswered] = useState(false);

  // Conversation history: array of {speakerText, userText, isRevealed}
  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);

  // Mistakes history
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);

  // Feedback states
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentExchange = conversation?.exchanges?.[currentTurnIndex];
  const totalExchanges = conversation?.exchanges?.length || 0;

  // Timer logic
  const timerDuration = 45;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!currentExchange || isCompleted || showFeedback || hasAnswered) {
        return;
      }

      const correctOptionObj = currentExchange.options.find(
        (opt) => opt.id === currentExchange.correctOptionId,
      );

      setMistakes((prev) => [
        ...prev,
        {
          question: currentExchange.speakerText,
          expected: correctOptionObj?.text || "",
          actual: "",
        },
      ]);
      setConversationHistory((prev) => [
        ...prev,
        {
          speakerText: currentExchange.speakerText,
          userText: "",
          userOptionId: null,
          wasCorrect: false,
        },
      ]);
      setHasAnswered(true);
      setIsCorrect(false);
      setFeedbackMessage("Time's up!");
      setShowFeedback(true);
    },
    isPaused: isCompleted || showFeedback || loading || hasAnswered,
  });

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = await loadMockCSV(
          "practice/reading/reading_conversation.csv",
        );
        if (Array.isArray(data) && data.length > 0) {
          setConversation(data[0] as ConversationData);
        }
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
  }, []);

  // Reset states when turn changes
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowFeedback(false);
    resetTimer();
  }, [currentTurnIndex, resetTimer]);

  const handleOptionSelect = (optionId: string | number) => {
    if (hasAnswered || showFeedback) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!currentExchange) return;
    if (hasAnswered || selectedOption === null || showFeedback) return;

    const selectedOptionObj = currentExchange.options.find(
      (opt) => opt.id === selectedOption,
    );
    const correctOptionObj = currentExchange.options.find(
      (opt) => opt.id === currentExchange.correctOptionId,
    );
    const correct = selectedOption === currentExchange.correctOptionId;

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

    // Add to conversation history
    setConversationHistory((prev) => [
      ...prev,
      {
        speakerText: currentExchange.speakerText,
        userText: selectedOptionObj?.text || "",
        userOptionId: selectedOption,
        wasCorrect: correct,
      },
    ]);
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentTurnIndex < totalExchanges - 1) {
      setCurrentTurnIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (loading) {
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
      <div className="w-full max-w-2xl text-left bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mt-4 max-h-[60vh] md:max-h-[400px] overflow-y-auto mx-auto mb-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    <PracticeGameLayout
      questionType="Running Conversation"
      questionTypeFr="Conversation continue"
      questionTypeEn="Running Conversation"
      instructionFr="Participez à la conversation"
      instructionEn="Choose the best response to continue the conversation"
      localizedInstruction={conversation?.title || conversation?.scenario || "Running Conversation"}
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={totalExchanges}
      currentQuestionIndex={currentTurnIndex}
      questionCounterValue={currentTurnIndex + 1}
      feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
      onExit={handleExit}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={selectedOption !== null && !showFeedback && !hasAnswered}
      showSubmitButton={!showFeedback && !hasAnswered}
      submitLabel="Submit Answer"
      timerValue={timerString}
      customEndGameContent={customEndGameContent}
    >
      {/* Two-column layout */}
      <div className="practice-reading-page-shell flex flex-col md:flex-row gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0">
        {/* LEFT: Conversation bubbles */}
        <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b-[2px] border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
              Conversation
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {/* Past turns */}
            {conversationHistory.map((turn, index) => (
              <div key={index} className="space-y-3">
                {/* Speaker bubble */}
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[92%] md:max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {turn.speakerText}
                      </p>
                      <button
                        onClick={() => speak(turn.speakerText, "fr-FR")}
                        disabled={isSpeaking}
                        className="opacity-40 hover:opacity-80 transition-opacity shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="bg-teal-700 text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm max-w-[92%] md:max-w-[85%]">
                    <p className="text-sm">{turn.userText}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Current speaker message */}
            {!hasAnswered && currentExchange && (
              <div className="flex items-start gap-2">
                {/* <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-500" />
                </div> */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[92%] md:max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {currentExchange.speakerText}
                    </p>
                    <button
                      onClick={() => speak(currentExchange.speakerText, "fr-FR")}
                      disabled={isSpeaking}
                      className="opacity-40 hover:opacity-80 transition-opacity shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for user's pending reply */}
            {!hasAnswered && (
              <div className="flex justify-end">
                <div className="bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[92%] md:max-w-[85%] text-xs text-slate-400 dark:text-slate-500 italic">
                  Your response…
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Objective + question + options */}
        <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-y-auto">
          {/* Objective / context card */}
          <div className="m-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <p className="text-xs font-bold border-b-2 border-gray-200 dark:border-slate-600 pb-1 uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-2">
              Objective
            </p>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {conversation?.scenario || conversation?.title}

              <span className="lorem"></span>
            </p>
          </div>

          {/* Question */}
          {currentExchange && (
            <div className="px-4 py-5">
              <h3 className="practice-reading-heading flex items-center gap-2">
                <Languages className="w-4 h-4 text-orange-500 shrink-0" />

                {currentExchange.questionText || "Select the best response"}
              </h3>
            </div>
          )}

          {/* Options */}
          {!hasAnswered && currentExchange && (
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
                renderLabel={(option) => option}
                renderSuffix={() => null}
                itemClassName="w-full bg-white dark:bg-slate-800 py-3 px-4 rounded-xl text-left flex items-start gap-3 border-slate-200 dark:border-slate-700 text-base font-medium leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={
            !isCorrect
              ? currentExchange?.options?.find(
                  (opt) => opt.id === currentExchange?.correctOptionId,
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
    </PracticeGameLayout>
  );
}
