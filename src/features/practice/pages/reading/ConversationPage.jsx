import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { MessageSquare, User, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConversationPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  // Current conversation data
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Current turn/exchange index (0-based)
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // User's selected option for current turn
  const [selectedOption, setSelectedOption] = useState(null);

  // Whether user has submitted their answer for current turn
  const [hasAnswered, setHasAnswered] = useState(false);

  // Conversation history: array of {speakerText, userText, isRevealed}
  const [conversationHistory, setConversationHistory] = useState([]);

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
      if (!isCompleted && !showFeedback && !hasAnswered) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback || loading || hasAnswered,
  });

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = await loadMockCSV(
          "practice/reading/reading_conversation.csv",
        );
        if (data && data.length > 0) {
          setConversation(data[0]);
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

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    setHasAnswered(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }

    // Add to conversation history
    setConversationHistory((prev) => [
      ...prev,
      {
        speakerText: currentExchange.speakerText,
        userText: selectedOptionObj.text,
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

  return (
    <PracticeGameLayout
      questionType="Running Conversation"
      instructionFr="Participez à la conversation"
      instructionEn="Choose the best response to continue the conversation"
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={totalExchanges}
      onExit={handleExit}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={selectedOption !== null && !showFeedback && !hasAnswered}
      showSubmitButton={!showFeedback && !hasAnswered}
      submitLabel="Send"
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
                  {/* Speaker's message */}
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-2xl rounded-tl-md shadow-sm">
                        <div className="flex items-start gap-2">
                          <p className="text-sm">{turn.speakerText}</p>
                          <button
                            onClick={() => speak(turn.speakerText, "fr-FR")}
                            className="ml-2 inline-flex align-middle opacity-50 hover:opacity-100 transition-opacity"
                            disabled={isSpeaking}
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
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

              {/* Current turn: Show Speaker Text if NOT answered yet (or always?) */}
              {/* In Reading, we show the question (Speaker text) immediately to let user choose answer */}
              {!hasAnswered && currentExchange && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
                      <div className="flex items-start gap-2">
                        <p className="text-sm text-slate-700 dark:text-slate-200">
                          {currentExchange.speakerText}
                        </p>
                        <button
                          onClick={() =>
                            speak(currentExchange.speakerText, "fr-FR")
                          }
                          className="ml-2 inline-flex align-middle opacity-50 hover:opacity-100 transition-opacity"
                          disabled={isSpeaking}
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {conversationHistory.length === 0 &&
                hasAnswered === false &&
                !currentExchange && (
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
    </PracticeGameLayout>
  );
}
