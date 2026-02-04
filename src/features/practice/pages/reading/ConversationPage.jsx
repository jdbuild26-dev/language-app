import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { MessageSquare, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";

// MOCK_CONVERSATIONS removed - migrated to CSV

export default function ConversationPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await loadMockCSV("practice/reading/conversation.csv");
        setConversations(data);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState([]);

  const currentConversation = conversations[currentIndex];
  const timerDuration = currentConversation?.timeLimitSeconds || 30;

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
    isPaused: isCompleted || showFeedback || loading,
  });

  useEffect(() => {
    if (currentConversation && !isCompleted) {
      setSelectedOption(null);
      setDisplayedMessages([...currentConversation.messages]);
      resetTimer();
    }
  }, [currentIndex, currentConversation, isCompleted, resetTimer]);

  const handlePlayMessage = (text) => {
    speak(text, "fr-FR");
  };

  const handleOptionSelect = (index) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (showFeedback || selectedOption === null) return;

    const correct = selectedOption === currentConversation.correctIndex;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    // Add user's response and next message to display
    setDisplayedMessages((prev) => [
      ...prev,
      {
        speaker: "You",
        text: currentConversation.options[selectedOption],
        isBot: false,
      },
      currentConversation.nextMessage,
    ]);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentIndex < conversations.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const progress =
    conversations.length > 0
      ? ((currentIndex + 1) / conversations.length) * 100
      : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Running Conversation"
        instructionFr="Choisissez la bonne réponse"
        instructionEn="Choose the appropriate response"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={conversations.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOption !== null && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Reply"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-4">
          {/* Context badge */}
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {currentConversation?.context}
            </span>
          </div>

          {/* Chat messages */}
          <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 mb-4 max-h-60 overflow-y-auto">
            <div className="space-y-3">
              {displayedMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    msg.isBot ? "justify-start" : "justify-end",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2 rounded-2xl",
                      msg.isBot
                        ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md"
                        : "bg-indigo-500 text-white rounded-br-md",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{msg.text}</p>
                      {msg.isBot && (
                        <button
                          onClick={() => handlePlayMessage(msg.text)}
                          className="text-slate-400 hover:text-indigo-500"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt */}
          {!showFeedback && (
            <div className="w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 mb-4 border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 text-center">
                <span className="font-semibold">Your turn: </span>
                {currentConversation?.currentPrompt}
              </p>
            </div>
          )}

          {/* Options */}
          {!showFeedback && (
            <div className="w-full space-y-2">
              {currentConversation?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition-all duration-200 border-2",
                    selectedOption === index
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect
              ? currentConversation.options[currentConversation.correctIndex]
              : null
          }
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentIndex + 1 === conversations.length ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
