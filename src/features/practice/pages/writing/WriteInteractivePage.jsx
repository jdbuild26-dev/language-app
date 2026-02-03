import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useWritingEvaluation } from "../../hooks/useWritingEvaluation";
import WritingFeedbackResult from "../../components/WritingFeedbackResult";

// Single continuous conversation mock data for Interactive Writing
const LONG_CONVERSATION = {
  id: 1,
  context: "Planifier une sortie à Paris",
  timeLimitSeconds: 300,
  exchanges: [
    {
      speaker: "Marc",
      text: "Salut ! On se voit ce week-end pour explorer Paris ?",
      isQuestion: false,
    },
    {
      speaker: "You",
      isQuestion: true,
      prompt: "Accept the invitation and ask what time",
      sampleAnswer: "Salut Marc ! Oui, avec plaisir. À quelle heure ?",
      minWords: 5,
    },
    {
      speaker: "Marc",
      text: "Super ! Je pensais vers 14h. On pourrait aller voir l'exposition au Louvre.",
      isQuestion: false,
    },
    {
      speaker: "You",
      isQuestion: true,
      prompt: "Agree and suggest meeting in front of the museum",
      sampleAnswer: "C'est une excellente idée. On se retrouve devant le musée ?",
      minWords: 5,
    },
    {
      speaker: "Marc",
      text: "Parfait. Et après le musée, on pourrait prendre un café dans le quartier Latin.",
      isQuestion: false,
    },
    {
      speaker: "You",
      isQuestion: true,
      prompt: "Say you know a good café there",
      sampleAnswer: "D'accord, je connais un petit café très sympa là-bas.",
      minWords: 5,
    },
    {
      speaker: "Marc",
      text: "Génial ! J'ai hâte d'y être. À samedi alors !",
      isQuestion: false,
    },
    {
      speaker: "You",
      isQuestion: true,
      prompt: "Say goodbye and see you soon",
      sampleAnswer: "À samedi Marc, bonne journée !",
      minWords: 3,
    }
  ],
};

export default function WriteInteractivePage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
  const chatEndRef = useRef(null);

  const [conversation] = useState(LONG_CONVERSATION);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [displayedExchanges, setDisplayedExchanges] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const { evaluation, isSubmitting, evaluate, resetEvaluation } = useWritingEvaluation();

  const currentExchange = conversation.exchanges[currentExchangeIndex];
  const timerDuration = conversation.timeLimitSeconds;

  const totalQuestions = conversation.exchanges.filter((e) => e.isQuestion).length;

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

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedExchanges, currentExchange]);

  // Initial setup and auto-advance logic for statements
  useEffect(() => {
    if (!currentExchange || isCompleted) return;

    if (!currentExchange.isQuestion && !showFeedback) {
      // Add and speak Marc's message
      setDisplayedExchanges((prev) => {
        const last = prev[prev.length - 1];
        if (last !== currentExchange) {
          speak(currentExchange.text, "fr-FR");
          return [...prev, currentExchange];
        }
        return prev;
      });

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
  }, [currentExchangeIndex, currentExchange, showFeedback, isCompleted, speak]);

  const handlePlayMessage = (text) => {
    speak(text, "fr-FR");
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (showFeedback || !currentExchange?.isQuestion || !userInput.trim() || isSubmitting) return;

    const result = await evaluate({
      task_type: "interactive",
      user_text: userInput,
      topic: conversation.context,
      reference: currentExchange.sampleAnswer,
      context: `Participant: ${currentExchange.speaker}. Instruction for user: ${currentExchange.prompt}`
    });

    if (result) {
      setIsCorrect(result.score >= 70);
      setFeedbackMessage(result.feedback);
      setShowFeedback(true);

      // Add user's response to display
      setDisplayedExchanges((prev) => [
        ...prev,
        { speaker: "You", text: userInput, isQuestion: false },
      ]);

      if (result.score >= 70) {
        setScore((prev) => prev + 1);
      }
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setUserInput("");
    resetEvaluation();

    if (currentExchangeIndex < conversation.exchanges.length - 1) {
      setCurrentExchangeIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const progress = (currentExchangeIndex / conversation.exchanges.length) * 100;

  return (
    <>
      <PracticeGameLayout
        questionType="Interactive Writing"
        instructionFr="Répondez à la conversation par écrit"
        instructionEn="Respond to the conversation in writing"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={totalQuestions}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInput.trim().length >= 2 && !showFeedback && currentExchange?.isQuestion}
        showSubmitButton={currentExchange?.isQuestion && !showFeedback}
        submitLabel="Send"
        timerValue={timerString}
      >
        <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-4 py-4 min-h-[600px]">
          {/* Context badge */}
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {conversation.context}
            </span>
          </div>

          {/* Chat display - Scrollable Area */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-6 mb-6 overflow-y-auto shadow-inner border border-slate-200 dark:border-slate-800">
            <div className="space-y-6">
              {displayedExchanges.map((exchange, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                    exchange.speaker === "You" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-5 py-3 rounded-2xl shadow-sm relative group",
                      exchange.speaker === "You"
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm"
                    )}
                  >
                    <p className="text-[10px] opacity-70 mb-1 font-bold uppercase tracking-wider">
                      {exchange.speaker}
                    </p>
                    <div className="flex items-start gap-3">
                      <p className="text-base leading-relaxed">{exchange.text}</p>
                      {exchange.speaker !== "You" && (
                        <button
                          onClick={() => handlePlayMessage(exchange.text)}
                          className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 mt-1"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Interaction Area */}
          <div className="shrink-0">
            {currentExchange?.isQuestion && !showFeedback && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-full bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 mb-4 border border-emerald-100 dark:border-emerald-800/50">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 text-center">
                    <span className="font-bold">Prompt: </span>
                    {currentExchange.prompt}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your response in French..."
                    className={cn(
                      "flex-1 px-6 py-4 rounded-2xl border-2 text-base transition-all outline-none shadow-sm",
                      "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                      "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    )}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={userInput.trim().length < 2 || isSubmitting}
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95",
                      userInput.trim().length >= 2 && !isSubmitting
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <Send className={cn("w-6 h-6", isSubmitting && "animate-pulse")} />
                  </button>
                </form>

                <p className="text-xs text-slate-400 mt-4 text-center italic">
                  Example: {currentExchange.sampleAnswer}
                </p>
              </div>
            )}

            {!currentExchange?.isQuestion && !showFeedback && !isCompleted && (
              <div className="h-16 flex items-center justify-center text-slate-400 text-sm animate-pulse italic">
                {currentExchange?.speaker} is typing...
              </div>
            )}
          </div>
        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentExchangeIndex === conversation.exchanges.length - 1
              ? "FINISH"
              : "CONTINUE"
          }
        >
          {evaluation && (
            <div className="max-w-xl mx-auto mt-4 px-4 overflow-y-auto max-h-[40vh] custom-scrollbar">
              <WritingFeedbackResult evaluation={evaluation} />
            </div>
          )}
        </FeedbackBanner>
      )}
    </>
  );
}
