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

export default function ConversationPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Current scenario index
  const [currentIndex, setCurrentIndex] = useState(0);

  // User's selected option index for current scenario
  const [selectedOption, setSelectedOption] = useState(null);

  // Whether user has submitted their answer
  const [hasAnswered, setHasAnswered] = useState(false);

  // Displayed messages for the current scenario
  const [displayedMessages, setDisplayedMessages] = useState([]);

  // Feedback states
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentConversation = conversations[currentIndex];
  const totalScenarios = conversations.length;
  // Use a default duration if not specified
  const timerDuration = currentConversation?.timeLimitSeconds || 30;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      // Logic when timer expires
      if (!isCompleted && !showFeedback && !hasAnswered) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
        setHasAnswered(true);
      }
    },
    isPaused: isCompleted || showFeedback || loading || hasAnswered,
  });

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await loadMockCSV("practice/reading/conversation.csv");
        setConversations(data || []);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Initialize displayed messages when scenario changes
  useEffect(() => {
    if (currentConversation) {
      setDisplayedMessages(currentConversation.messages || []);
      setSelectedOption(null);
      setHasAnswered(false);
      setShowFeedback(false);
      resetTimer();
    }
  }, [currentConversation, resetTimer]);

  const handleOptionSelect = (index) => {
    if (hasAnswered || showFeedback) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (hasAnswered || selectedOption === null || showFeedback) return;

    const correct = selectedOption === currentConversation.correctIndex;

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    setHasAnswered(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }

    // Update conversation history with user's choice
    const userMessage = {
      speaker: "You",
      text: currentConversation.options[selectedOption],
      isBot: false,
    };

    const newMessages = [...displayedMessages, userMessage];

    // If correct, add the next bot message if it exists
    if (correct && currentConversation.nextMessage) {
      newMessages.push(currentConversation.nextMessage);
      // Optional: Speak the response
      // speak(currentConversation.nextMessage.text, "fr-FR");
    }

    setDisplayedMessages(newMessages);
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentIndex < totalScenarios - 1) {
      setCurrentIndex((prev) => prev + 1);
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

  if (!currentConversation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <button
          onClick={() => handleExit()}
          className="mt-4 text-indigo-500 hover:underline"
        >
          Back
        </button>
      </div>
    );
  }

  const progress =
    totalScenarios > 0 ? ((currentIndex + 1) / totalScenarios) * 100 : 0;

  return (
    <PracticeGameLayout
      questionType="Conversation Practice"
      instructionFr={currentConversation.currentPrompt}
      instructionEn="Choose the best response to continue the conversation"
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={totalScenarios}
      onExit={handleExit}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={selectedOption !== null && !showFeedback && !hasAnswered}
      showSubmitButton={!showFeedback && !hasAnswered}
      submitLabel="Check Answer"
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
                {currentConversation.context}
              </p>
              {currentConversation.currentPrompt && (
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 border-t pt-2 border-slate-100 dark:border-slate-700">
                  {currentConversation.currentPrompt}
                </p>
              )}
            </div>

            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Conversation
            </h3>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4">
              {displayedMessages.map((msg, idx) => (
                <div key={idx} className="space-y-3">
                  <div
                    className={cn(
                      "flex justify-start",
                      msg.isBot ? "" : "justify-end",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-start gap-2 max-w-[85%]",
                        msg.isBot ? "" : "flex-row-reverse",
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                          msg.isBot
                            ? "bg-indigo-100 dark:bg-indigo-900"
                            : "bg-emerald-100 dark:bg-emerald-900",
                        )}
                      >
                        {msg.isBot ? (
                          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl shadow-sm",
                          msg.isBot
                            ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-md"
                            : "bg-indigo-500 text-white rounded-tr-md",
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <p className="text-sm">{msg.text}</p>
                          {msg.isBot && (
                            <button
                              onClick={() => speak(msg.text, "fr-FR")}
                              className="ml-2 inline-flex align-middle opacity-50 hover:opacity-100 transition-opacity"
                              disabled={isSpeaking}
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Placeholdera / empty state if needed */}
              {displayedMessages.length === 0 && (
                <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
                  <p className="text-sm">Conversation will appear here...</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Response Options */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Select your response
              </h3>
              {/* Show prompt here too if useful, or keep it in instruction header */}
            </div>

            {!hasAnswered && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 mb-2">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-semibold">Goal:</span>{" "}
                  {currentConversation.currentPrompt}
                </p>
              </div>
            )}

            {!hasAnswered && currentConversation.options && (
              <div className="space-y-3">
                {currentConversation.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={hasAnswered || showFeedback}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left font-medium transition-all",
                      "bg-white dark:bg-slate-800 shadow-sm hover:shadow-md",
                      selectedOption === idx
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
                          selectedOption === idx
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-slate-300 dark:border-slate-500",
                        )}
                      >
                        {selectedOption === idx && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>

                      {/* Option text */}
                      <span className="text-sm text-slate-700 dark:text-slate-200">
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect
              ? currentConversation.options[currentConversation.correctIndex]
              : undefined
          }
          message={feedbackMessage}
          onContinue={handleContinue}
          continueLabel={
            currentIndex === conversations.length - 1 ? "Finish" : "Next"
          }
        />
      )}
    </PracticeGameLayout>
  );
}
