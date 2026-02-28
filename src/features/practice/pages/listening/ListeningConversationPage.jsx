import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { MessageSquare, Volume2, User, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ListeningConversationPage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();

  // Current turn/exchange index (0-based)
  const [conversation, setConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // User's selected option for current turn
  const [selectedOption, setSelectedOption] = useState(null);

  // Whether user has submitted their answer for current turn
  const [hasAnswered, setHasAnswered] = useState(false);

  // Conversation history: array of {speakerText, userText, isRevealed}
  const [conversationHistory, setConversationHistory] = useState([]);

  // Mistakes history
  const [mistakes, setMistakes] = useState([]);

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

  const currentExchange = conversation?.exchanges[currentTurnIndex];
  const totalExchanges = conversation?.exchanges.length || 0;

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
        const data = await loadMockCSV(
          "practice/listening/listening_conversation.csv",
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
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (hasAnswered || selectedOption === null || showFeedback) return;

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
          expected: correctOptionObj.text,
          actual: selectedOptionObj.text,
        },
      ]);
    }

    // Add to conversation history: speaker's question (now revealed as text) + user's response
    // Always render the correct text so the ongoing chat is only the correct dialogue.
    setConversationHistory((prev) => [
      ...prev,
      {
        speakerText: currentExchange.speakerText,
        userText: correctOptionObj.text,
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
          selectedOption !== null && !showFeedback && !hasAnswered
        }
        showSubmitButton={!showFeedback && !hasAnswered}
        submitLabel="Submit"
        timerValue={timerString}
        customEndGameContent={customEndGameContent}
      >
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 py-4">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* LEFT COLUMN: Conversation History */}
            <div className="flex flex-col space-y-4">
              {/* Context / Title */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Context
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {conversation?.title}
                </p>
                {conversation?.scenario && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 border-t pt-2 border-slate-100 dark:border-slate-700">
                    {conversation.scenario}
                  </p>
                )}
              </div>

              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Conversation
              </h3>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4">
                {/* Show conversation history */}
                {conversationHistory.map((turn, index) => (
                  <div key={index} className="space-y-3">
                    {/* Speaker's message (revealed as text after answer) */}
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-2xl rounded-tl-md shadow-sm">
                          <p className="text-sm">{turn.speakerText}</p>
                        </div>
                      </div>
                    </div>

                    {/* User's response */}
                    <div className="flex justify-end">
                      <div className="bg-indigo-500 text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm max-w-[85%]">
                        <p className="text-sm">{turn.userText}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Current turn: Show audio waveform if NOT answered yet */}
                {!hasAnswered && currentExchange && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-indigo-500 animate-pulse" />
                        <svg
                          width="120"
                          height="24"
                          viewBox="0 0 120 24"
                          className="text-indigo-400"
                        >
                          <rect
                            x="5"
                            y="8"
                            width="2"
                            height="8"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="9"
                            y="5"
                            width="2"
                            height="14"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="13"
                            y="3"
                            width="2"
                            height="18"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="17"
                            y="7"
                            width="2"
                            height="10"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="21"
                            y="10"
                            width="2"
                            height="4"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="25"
                            y="4"
                            width="2"
                            height="16"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="29"
                            y="8"
                            width="2"
                            height="8"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="33"
                            y="6"
                            width="2"
                            height="12"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="37"
                            y="9"
                            width="2"
                            height="6"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="41"
                            y="7"
                            width="2"
                            height="10"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="45"
                            y="8"
                            width="2"
                            height="8"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="49"
                            y="5"
                            width="2"
                            height="14"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="53"
                            y="3"
                            width="2"
                            height="18"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="57"
                            y="7"
                            width="2"
                            height="10"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="61"
                            y="10"
                            width="2"
                            height="4"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="65"
                            y="4"
                            width="2"
                            height="16"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="69"
                            y="8"
                            width="2"
                            height="8"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="73"
                            y="6"
                            width="2"
                            height="12"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="77"
                            y="9"
                            width="2"
                            height="6"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="81"
                            y="7"
                            width="2"
                            height="10"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="85"
                            y="8"
                            width="2"
                            height="8"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="89"
                            y="5"
                            width="2"
                            height="14"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="93"
                            y="3"
                            width="2"
                            height="18"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="97"
                            y="7"
                            width="2"
                            height="10"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="101"
                            y="10"
                            width="2"
                            height="4"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="105"
                            y="6"
                            width="2"
                            height="12"
                            fill="currentColor"
                            rx="1"
                          />
                          <rect
                            x="109"
                            y="8"
                            width="2"
                            height="8"
                            fill="currentColor"
                            rx="1"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {conversationHistory.length === 0 && hasAnswered === false && (
                  <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
                    <p className="text-sm">Conversation will appear here...</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Response Options */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Select the best response
              </h3>

              {!hasAnswered && currentExchange && (
                <div className="space-y-3">
                  {currentExchange.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      disabled={hasAnswered || showFeedback}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left font-medium transition-all",
                        "bg-white dark:bg-slate-800 shadow-sm hover:shadow-md",
                        selectedOption === option.id
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-indigo-300",
                        hasAnswered && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio circle */}
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            selectedOption === option.id
                              ? "border-indigo-500 bg-indigo-500"
                              : "border-slate-300 dark:border-slate-500",
                          )}
                        >
                          {selectedOption === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>

                        {/* Option text */}
                        <span className="text-sm text-slate-700 dark:text-slate-200">
                          {option.text}
                        </span>
                      </div>
                    </button>
                  ))}
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
