import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { MessageSquare, Volume2, AudioWaveform } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data (Sharing same structure for now, can be specialized later)
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    context: "At a café",
    messages: [
      {
        speaker: "A",
        text: "Bonjour! Qu'est-ce que vous désirez?",
        isBot: true,
      },
    ],
    currentPrompt: "You want to order a coffee with milk.",
    options: [
      "Un café au lait, s'il vous plaît.",
      "Je voudrais une pizza.",
      "L'addition, s'il vous plaît.",
      "Où sont les toilettes?",
    ],
    correctIndex: 0,
    nextMessage: { speaker: "A", text: "Très bien! Autre chose?", isBot: true },
    timeLimitSeconds: 30,
  },
  {
    id: 2,
    context: "Asking for directions",
    messages: [
      { speaker: "You", text: "Excusez-moi, où est la gare?", isBot: false },
      {
        speaker: "A",
        text: "La gare? C'est tout droit, puis à gauche.",
        isBot: true,
      },
    ],
    currentPrompt: "Thank the person for their help.",
    options: [
      "Je ne comprends pas.",
      "Merci beaucoup!",
      "C'est combien?",
      "Je suis perdu.",
    ],
    correctIndex: 1,
    nextMessage: { speaker: "A", text: "De rien! Bonne journée!", isBot: true },
    timeLimitSeconds: 30,
  },
  {
    id: 3,
    context: "Shopping for clothes",
    messages: [
      { speaker: "A", text: "Bonjour, je peux vous aider?", isBot: true },
      { speaker: "You", text: "Oui, je cherche une chemise.", isBot: false },
      { speaker: "A", text: "Quelle taille faites-vous?", isBot: true },
    ],
    currentPrompt: "Tell them you wear size medium.",
    options: [
      "Je fais du petit.",
      "Je fais du moyen.",
      "Combien ça coûte?",
      "Je n'aime pas cette couleur.",
    ],
    correctIndex: 1,
    nextMessage: {
      speaker: "A",
      text: "Voici les chemises en taille moyen.",
      isBot: true,
    },
    timeLimitSeconds: 30,
  },
  {
    id: 4,
    context: "At a restaurant",
    messages: [
      { speaker: "A", text: "Vous avez choisi?", isBot: true },
      {
        speaker: "You",
        text: "Oui, je voudrais le steak-frites.",
        isBot: false,
      },
      { speaker: "A", text: "Et comme boisson?", isBot: true },
    ],
    currentPrompt: "Order a glass of red wine.",
    options: [
      "Un verre de vin rouge, s'il vous plaît.",
      "Non merci, c'est tout.",
      "Je voudrais le menu.",
      "Où est la sortie?",
    ],
    correctIndex: 0,
    nextMessage: {
      speaker: "A",
      text: "Parfait, je vous apporte ça tout de suite.",
      isBot: true,
    },
    timeLimitSeconds: 30,
  },
  {
    id: 5,
    context: "At the hotel",
    messages: [
      { speaker: "A", text: "Bonsoir, bienvenue à l'hôtel.", isBot: true },
      { speaker: "You", text: "Bonsoir, j'ai une réservation.", isBot: false },
      { speaker: "A", text: "Votre nom, s'il vous plaît?", isBot: true },
    ],
    currentPrompt: "Give your name (Marie Dupont).",
    options: [
      "Je m'appelle Marie Dupont.",
      "Une chambre pour deux personnes.",
      "C'est combien la nuit?",
      "J'ai perdu ma clé.",
    ],
    correctIndex: 0,
    nextMessage: {
      speaker: "A",
      text: "Ah oui, vous avez la chambre 205.",
      isBot: true,
    },
    timeLimitSeconds: 30,
  },
];

export default function ListeningConversationPage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();

  const [conversations] = useState(MOCK_CONVERSATIONS);
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
    isPaused: isCompleted || showFeedback,
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
    // Play the option audio when selected
    speak(currentConversation.options[index], "fr-FR");
  };

  // Dedicated play button handler to prevent selection if needed (though requirement says click options -> play)
  const handleOptionPlay = (e, text) => {
    e.stopPropagation();
    speak(text, "fr-FR");
  };

  const handleSubmit = () => {
    if (showFeedback || selectedOption === null) return;

    const correct = selectedOption === currentConversation.correctIndex;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    // Add user's response (as TEXT) and next message to display
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

  const progress =
    conversations.length > 0
      ? ((currentIndex + 1) / conversations.length) * 100
      : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Listening Conversation" // Updated title
        instructionFr="Écoutez et choisissez la bonne réponse" // Updated instructions
        instructionEn="Listen to the audio options and select the correct response"
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
                      {/* Always Show play button for history messages */}
                      <button
                        onClick={() => handlePlayMessage(msg.text)}
                        className={cn(
                          "text-slate-400 hover:text-indigo-500",
                          !msg.isBot && "text-indigo-200 hover:text-white",
                        )}
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
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

          {/* Options (Audio Waveforms) */}
          {!showFeedback && (
            <div className="w-full space-y-2">
              {currentConversation?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full group relative p-4 rounded-xl border-[3px] text-left font-medium transition-all flex items-center gap-4 bg-white dark:bg-slate-800 shadow-sm",
                    // Default state
                    "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
                    // Selected
                    selectedOption === index &&
                      !showFeedback &&
                      "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
                  )}
                >
                  {/* Circle Indicator */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                      selectedOption === index
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-slate-300 dark:border-slate-500 hover:border-indigo-400",
                    )}
                  >
                    {selectedOption === index && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center items-center">
                    {/* Waveform SVG */}
                    <svg
                      width="200"
                      height="30"
                      viewBox="0 0 200 40"
                      className={cn(
                        "transition-colors",
                        selectedOption === index
                          ? "text-indigo-500"
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
                        y="15"
                        width="3"
                        height="10"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="76"
                        y="10"
                        width="3"
                        height="20"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="82"
                        y="5"
                        width="3"
                        height="30"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="88"
                        y="12"
                        width="3"
                        height="16"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="94"
                        y="18"
                        width="3"
                        height="4"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="100"
                        y="8"
                        width="3"
                        height="24"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="106"
                        y="14"
                        width="3"
                        height="12"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="112"
                        y="11"
                        width="3"
                        height="18"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="118"
                        y="16"
                        width="3"
                        height="8"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="124"
                        y="13"
                        width="3"
                        height="14"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="130"
                        y="15"
                        width="3"
                        height="10"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="136"
                        y="10"
                        width="3"
                        height="20"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="142"
                        y="5"
                        width="3"
                        height="30"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="148"
                        y="12"
                        width="3"
                        height="16"
                        fill="currentColor"
                        rx="1.5"
                      />
                      <rect
                        x="154"
                        y="18"
                        width="3"
                        height="4"
                        fill="currentColor"
                        rx="1.5"
                      />
                    </svg>
                  </div>
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
