import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Single long conversation mock data
const LONG_CONVERSATION = {
  id: 1,
  context: "Arrival in Paris",
  // 5 minutes timer for a long conversation
  timeLimitSeconds: 300,
  exchanges: [
    // 1. Initial greeting
    {
      speaker: "Stranger",
      text: "Excusez-moi, est-ce que cette place est libre ?",
      isQuestion: false,
    },
    {
      speaker: "You",
      text: null,
      isQuestion: true,
      question: "The stranger asks if the seat is free. You answer:",
      options: [
        "Oui, bien sûr. Allez-y.",
        "Je ne sais pas.",
        "Il est midi.",
        "J'habite à Paris.",
      ],
      correctIndex: 0,
    },

    // 2. Introduction
    {
      speaker: "Stranger",
      text: "Merci beaucoup. Le train est très plein aujourd'hui, n'est-ce pas ?",
      isQuestion: false,
    },
    {
      speaker: "You",
      text: null,
      isQuestion: true,
      question: "Agree and say you are going to Paris:",
      options: [
        "Non, je déteste le train.",
        "Oui, c'est vrai. Je vais à Paris pour la première fois.",
        "Le ciel est bleu.",
        "Je mange une pomme.",
      ],
      correctIndex: 1,
    },

    // 3. Discussion about Paris
    {
      speaker: "Stranger",
      text: "Ah, Paris ! C'est une ville magnifique. Vous y allez pour le travail ou pour les vacances ?",
      isQuestion: false,
    },
    {
      speaker: "You",
      text: null,
      isQuestion: true,
      question: "Say you are on vacation:",
      options: [
        "Je travaille dans une banque.",
        "Je suis en vacances pour deux semaines.",
        "J'ai perdu mon billet.",
        "Mon frère s'appelle Paul.",
      ],
      correctIndex: 1,
    },

    // 4. Recommendation
    {
      speaker: "Stranger",
      text: "Super ! Vous devez absolument visiter le musée du Louvre. C'est incontournable.",
      isQuestion: false,
    },
    {
      speaker: "You",
      text: null,
      isQuestion: true,
      question: "Say that you plan to go there tomorrow:",
      options: [
        "J'aime le chocolat.",
        "Je ne comprends pas.",
        "C'est une bonne idée. Je compte y aller demain.",
        "Le train arrive dans 5 minutes.",
      ],
      correctIndex: 2,
    },

    // 5. Asking for advice
    {
      speaker: "Stranger",
      text: "Excellent choix. Et faites attention aux files d'attente, il y a souvent beaucoup de monde.",
      isQuestion: false,
    },
    {
      speaker: "You",
      text: null,
      isQuestion: true,
      question: "Ask if he knows a good restaurant nearby:",
      options: [
        "Connaissez-vous un bon restaurant dans le quartier ?",
        "Quelle heure est-il ?",
        "Je suis fatigué.",
        "Au revoir monsieur.",
      ],
      correctIndex: 0,
    },

    // 6. Restaurant suggestion
    {
      speaker: "Stranger",
      text: "Oui, il y a un petit bistrot juste derrière le musée, 'Le Petit Parisien'. La cuisine y est délicieuse et pas trop chère.",
      isQuestion: false,
    },
    {
      speaker: "You",
      text: null,
      isQuestion: true,
      question: "Thank him for the suggestion:",
      options: [
        "Je n'ai pas faim.",
        "Merci beaucoup pour le conseil !",
        "C'est trop loin.",
        "J'aime le café.",
      ],
      correctIndex: 1,
    },

    // 7. Arrival
    {
      speaker: "Stranger",
      text: "De rien ! Ah, nous arrivons à la Gare de Lyon. Bon séjour à Paris !",
      isQuestion: false,
    },
    {
      speaker: "You",
      text: null,
      isQuestion: true,
      question: "Say goodbye and wish him a good day:",
      options: [
        "Bonne nuit.",
        "Merci, bonne journée à vous aussi !",
        "Je reste dans le train.",
        "À lundi.",
      ],
      correctIndex: 1,
    },
  ],
};

export default function ListenInteractivePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
  const chatEndRef = useRef(null);

  // State
  const [conversation] = useState(LONG_CONVERSATION);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [displayedExchanges, setDisplayedExchanges] = useState([]);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  // Derived state
  const currentExchange = conversation.exchanges[currentExchangeIndex];
  const timerDuration = conversation.timeLimitSeconds;

  // Count total questions
  const totalQuestions = conversation.exchanges.filter(
    (e) => e.isQuestion,
  ).length;

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

      // Prevent duplicate adding if strict mode triggers twice (check last item)
      setDisplayedExchanges((prev) => {
        const last = prev[prev.length - 1];
        if (last !== currentExchange) {
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
        if (currentExchangeIndex < conversation.exchanges.length - 1) {
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
    conversation.exchanges.length,
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
    if (currentExchangeIndex < conversation.exchanges.length - 1) {
      setCurrentExchangeIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Calculate progress
  // Count how many questions we have passed so far
  const completedQuestions = conversation.exchanges
    .slice(0, currentExchangeIndex) // look at history
    .filter((e) => e.isQuestion).length;

  // If we just finished one (status feedback), count it?
  // Actually simpler: just use generic progress
  const progress =
    (Math.min(score + (showFeedback && isCorrect ? 0 : 0), totalQuestions) /
      totalQuestions) *
    100;
  // A better progress bar for 'linear' conversation:
  const progressLinear =
    (currentExchangeIndex / conversation.exchanges.length) * 100;

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
        <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-4 py-4 min-h-[600px]">
          {/* Context badge */}
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <MessageSquare className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {conversation.context}
            </span>
          </div>

          {/* Chat display - Scrollable Area */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 mb-4 overflow-y-auto">
            <div className="space-y-4">
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
                  {/* Avatar / Speaker Label could go here */}

                  <div
                    className={cn(
                      "max-w-[85%] px-5 py-3 rounded-2xl shadow-sm relative group",
                      exchange.speaker === "You"
                        ? "bg-pink-500 text-white rounded-br-sm"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm",
                    )}
                  >
                    <p className="text-[10px] opacity-70 mb-1 font-semibold uppercase tracking-wider">
                      {exchange.speaker}
                    </p>
                    <div className="flex items-start gap-3">
                      <p className="text-base leading-relaxed">
                        {exchange.text}
                      </p>
                      {exchange.speaker !== "You" && (
                        <button
                          onClick={() => handlePlayExchange(exchange.text)}
                          className="text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 mt-1"
                          title="Play audio"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Invisible element to scroll to */}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Question / Options Area (Fixed at bottom action area) */}
          <div className="shrink-0">
            {currentExchange?.isQuestion && !showFeedback && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            currentExchangeIndex === conversation.exchanges.length - 1
              ? "FINISH"
              : "CONTINUE"
          }
        />
      )}
    </>
  );
}
