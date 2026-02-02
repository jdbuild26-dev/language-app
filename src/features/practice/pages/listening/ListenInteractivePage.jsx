import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Interactive Listening exercise
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    context: "At the bakery",
    exchanges: [
      {
        speaker: "Baker",
        text: "Bonjour! Qu'est-ce que je vous sers?",
        isQuestion: false,
      },
      {
        speaker: "You",
        text: null, // User responds
        isQuestion: true,
        question: "What would you like to buy?",
        options: [
          "Deux croissants, s'il vous plaît.",
          "Je cherche la gare.",
          "Il fait beau aujourd'hui.",
          "Je m'appelle Pierre.",
        ],
        correctIndex: 0,
      },
      {
        speaker: "Baker",
        text: "Très bien! Autre chose?",
        isQuestion: false,
      },
      {
        speaker: "You",
        text: null,
        isQuestion: true,
        question: "You also want a baguette",
        options: [
          "Non, merci. C'est tout.",
          "Une baguette aussi, s'il vous plaît.",
          "Où est la sortie?",
          "Je ne comprends pas.",
        ],
        correctIndex: 1,
      },
    ],
    timeLimitSeconds: 90,
  },
  {
    id: 2,
    context: "At the train station",
    exchanges: [
      {
        speaker: "Agent",
        text: "Bonjour, je peux vous aider?",
        isQuestion: false,
      },
      {
        speaker: "You",
        text: null,
        isQuestion: true,
        question: "You want a ticket to Paris",
        options: [
          "Je voudrais un billet pour Paris.",
          "Où sont les toilettes?",
          "J'ai faim.",
          "Il pleut dehors.",
        ],
        correctIndex: 0,
      },
      {
        speaker: "Agent",
        text: "Aller simple ou aller-retour?",
        isQuestion: false,
      },
      {
        speaker: "You",
        text: null,
        isQuestion: true,
        question: "You want a round-trip ticket",
        options: [
          "Aller simple, s'il vous plaît.",
          "Aller-retour, s'il vous plaît.",
          "C'est combien?",
          "Le train part à quelle heure?",
        ],
        correctIndex: 1,
      },
    ],
    timeLimitSeconds: 90,
  },
];

export default function ListenInteractivePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [currentConvIndex, setCurrentConvIndex] = useState(0);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [displayedExchanges, setDisplayedExchanges] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentConv = conversations[currentConvIndex];
  const currentExchange = currentConv?.exchanges[currentExchangeIndex];
  const timerDuration = currentConv?.timeLimitSeconds || 90;

  // Count total questions
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
      // Play audio and add to display
      speak(currentExchange.text, "fr-FR");
      setDisplayedExchanges((prev) => [...prev, currentExchange]);

      // After a delay, move to next exchange
      const timer = setTimeout(() => {
        if (currentExchangeIndex < currentConv.exchanges.length - 1) {
          setCurrentExchangeIndex((prev) => prev + 1);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentExchangeIndex, currentExchange, showFeedback]);

  const handlePlayExchange = (text) => {
    speak(text, "fr-FR");
  };

  const handleOptionSelect = (index) => {
    if (showFeedback) return;
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
  const currentConvQuestions = currentConv?.exchanges
    .slice(0, currentExchangeIndex + 1)
    .filter((e) => e.isQuestion).length;
  completedQuestions += currentConvQuestions || 0;
  const progress = (completedQuestions / totalQuestions) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Interactive Listening"
        instructionFr="Suivez la conversation et répondez"
        instructionEn="Follow the conversation and respond"
        progress={progress}
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
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-4">
          {/* Context badge */}
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-pink-500" />
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
                        ? "bg-pink-500 text-white rounded-br-md"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{exchange.text}</p>
                      {exchange.speaker !== "You" && (
                        <button
                          onClick={() => handlePlayExchange(exchange.text)}
                          className="text-slate-400 hover:text-pink-500"
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

          {/* Question prompt */}
          {currentExchange?.isQuestion && !showFeedback && (
            <>
              <div className="w-full bg-pink-50 dark:bg-pink-900/20 rounded-xl p-3 mb-4 border border-pink-200 dark:border-pink-800">
                <p className="text-sm text-pink-700 dark:text-pink-300 text-center">
                  <span className="font-semibold">Your turn: </span>
                  {currentExchange.question}
                </p>
              </div>

              {/* Options */}
              <div className="w-full space-y-2">
                {currentExchange.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className={cn(
                      "w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition-all duration-200 border-2",
                      selectedOption === index
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-pink-400",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
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
            currentConvIndex === conversations.length - 1 &&
            currentExchangeIndex === currentConv.exchanges.length - 1
              ? "FINISH"
              : "CONTINUE"
          }
        />
      )}
    </>
  );
}
