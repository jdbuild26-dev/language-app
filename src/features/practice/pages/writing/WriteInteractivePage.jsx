import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Interactive Writing (chat-style) exercise
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    context: "Meeting a new friend",
    exchanges: [
      {
        speaker: "Friend",
        text: "Salut! Comment tu t'appelles?",
        isQuestion: false,
      },
      {
        speaker: "You",
        isQuestion: true,
        prompt: "Introduce yourself",
        sampleAnswer: "Je m'appelle [votre nom]. Et toi?",
        minWords: 3,
      },
      {
        speaker: "Friend",
        text: "Moi, c'est Sophie. Tu viens d'où?",
        isQuestion: false,
      },
      {
        speaker: "You",
        isQuestion: true,
        prompt: "Tell them where you're from",
        sampleAnswer: "Je viens de Paris. C'est une belle ville.",
        minWords: 3,
      },
    ],
    timeLimitSeconds: 180,
  },
  {
    id: 2,
    context: "At a café",
    exchanges: [
      {
        speaker: "Waiter",
        text: "Bonjour! Qu'est-ce que vous désirez?",
        isQuestion: false,
      },
      {
        speaker: "You",
        isQuestion: true,
        prompt: "Order a coffee and croissant",
        sampleAnswer: "Un café et un croissant, s'il vous plaît.",
        minWords: 4,
      },
      {
        speaker: "Waiter",
        text: "Bien sûr. Autre chose?",
        isQuestion: false,
      },
      {
        speaker: "You",
        isQuestion: true,
        prompt: "Ask for the bill",
        sampleAnswer: "Non merci. L'addition, s'il vous plaît.",
        minWords: 3,
      },
    ],
    timeLimitSeconds: 180,
  },
];

export default function WriteInteractivePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [currentConvIndex, setCurrentConvIndex] = useState(0);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [displayedExchanges, setDisplayedExchanges] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentConv = conversations[currentConvIndex];
  const currentExchange = currentConv?.exchanges[currentExchangeIndex];
  const timerDuration = currentConv?.timeLimitSeconds || 180;

  // Count total user responses needed
  const totalQuestions = conversations.reduce(
    (acc, conv) => acc + conv.exchanges.filter((e) => e.isQuestion).length,
    0,
  );

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
    isPaused: isCompleted || showFeedback,
  });

  useEffect(() => {
    if (currentConv && !isCompleted) {
      setDisplayedExchanges([]);
      setCurrentExchangeIndex(0);
      resetTimer();
    }
  }, [currentConvIndex, currentConv, isCompleted, resetTimer]);

  // Auto-advance through non-question exchanges
  useEffect(() => {
    if (currentExchange && !currentExchange.isQuestion && !showFeedback) {
      speak(currentExchange.text, "fr-FR");
      setDisplayedExchanges((prev) => [...prev, currentExchange]);

      const timer = setTimeout(() => {
        if (currentExchangeIndex < currentConv.exchanges.length - 1) {
          setCurrentExchangeIndex((prev) => prev + 1);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentExchangeIndex, currentExchange, showFeedback]);

  const handlePlayMessage = (text) => {
    speak(text, "fr-FR");
  };

  const getWordCount = (text) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleSubmit = () => {
    if (showFeedback || !currentExchange?.isQuestion) return;

    const wordCount = getWordCount(userInput);
    const meetsMinWords = wordCount >= (currentExchange.minWords || 2);

    setIsCorrect(meetsMinWords);
    setFeedbackMessage(
      meetsMinWords
        ? getFeedbackMessage(true)
        : `Try to write at least ${currentExchange.minWords} words.`,
    );
    setShowFeedback(true);

    // Add user's response to display
    setDisplayedExchanges((prev) => [
      ...prev,
      { speaker: "You", text: userInput, isQuestion: false },
    ]);

    if (meetsMinWords) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setUserInput("");

    // Move to next exchange
    if (currentExchangeIndex < currentConv.exchanges.length - 1) {
      setCurrentExchangeIndex((prev) => prev + 1);
    } else if (currentConvIndex < conversations.length - 1) {
      setCurrentConvIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Calculate progress
  let completedQuestions = 0;
  for (let i = 0; i < currentConvIndex; i++) {
    completedQuestions += conversations[i].exchanges.filter(
      (e) => e.isQuestion,
    ).length;
  }
  const currentConvQuestions =
    currentConv?.exchanges
      .slice(0, currentExchangeIndex + 1)
      .filter((e) => e.isQuestion).length || 0;
  completedQuestions += currentConvQuestions;
  const progress = (completedQuestions / totalQuestions) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Interactive Writing"
        instructionFr="Participez à la conversation"
        instructionEn="Participate in the conversation"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={totalQuestions}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={
          getWordCount(userInput) >= 2 &&
          !showFeedback &&
          currentExchange?.isQuestion
        }
        showSubmitButton={currentExchange?.isQuestion && !showFeedback}
        submitLabel="Send"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-4">
          {/* Context badge */}
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-lime-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {currentConv?.context}
            </span>
          </div>

          {/* Chat display */}
          <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 mb-4 max-h-48 overflow-y-auto">
            <div className="space-y-3">
              {displayedExchanges.map((exchange, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    exchange.speaker === "You"
                      ? "justify-end"
                      : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2 rounded-2xl",
                      exchange.speaker === "You"
                        ? "bg-lime-500 text-white rounded-br-md"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{exchange.text}</p>
                      {exchange.speaker !== "You" && (
                        <button
                          onClick={() => handlePlayMessage(exchange.text)}
                          className="text-slate-400 hover:text-lime-500"
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

          {/* Writing prompt */}
          {currentExchange?.isQuestion && !showFeedback && (
            <>
              <div className="w-full bg-lime-50 dark:bg-lime-900/20 rounded-xl p-3 mb-3 border border-lime-200 dark:border-lime-800">
                <p className="text-sm text-lime-700 dark:text-lime-300 text-center">
                  <span className="font-semibold">Your turn: </span>
                  {currentExchange.prompt}
                </p>
              </div>

              {/* Text input */}
              <div className="w-full flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your response in French..."
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl border-2 text-base",
                    "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                    "focus:outline-none focus:ring-2 border-slate-200 dark:border-slate-700 focus:border-lime-500 focus:ring-lime-200",
                  )}
                />
                <button
                  onClick={handleSubmit}
                  disabled={getWordCount(userInput) < 2}
                  className={cn(
                    "px-4 py-3 rounded-xl font-semibold transition-all",
                    getWordCount(userInput) >= 2
                      ? "bg-lime-500 text-white hover:bg-lime-600"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed",
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Sample hint */}
              <p className="text-xs text-slate-400 mt-2">
                Example: {currentExchange.sampleAnswer}
              </p>
            </>
          )}
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentExchange?.sampleAnswer : null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentConvIndex === conversations.length - 1 &&
            currentExchangeIndex === currentConv?.exchanges.length - 1
              ? "FINISH"
              : "CONTINUE"
          }
        />
      )}
    </>
  );
}
