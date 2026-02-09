import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { MessageSquare, User, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useWritingEvaluation } from "../../hooks/useWritingEvaluation";
import WritingFeedbackResult from "../../components/WritingFeedbackResult";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WriteInteractivePage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();
  const chatEndRef = useRef(null);

  // Current turn/exchange index (0-based)
  const [conversation, setConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // User's input for current turn
  const [userInput, setUserInput] = useState("");

  // Whether user has submitted their answer for current turn
  const [hasAnswered, setHasAnswered] = useState(false);

  // Conversation history: array of {speakerText, userText, wasCorrect}
  const [conversationHistory, setConversationHistory] = useState([]);

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

  const { evaluation, isSubmitting, evaluate, resetEvaluation } =
    useWritingEvaluation();

  const currentExchange = conversation?.exchanges[currentTurnIndex];
  const totalExchanges = conversation?.exchanges.length || 0;

  const timerDuration = conversation?.timeLimitSeconds || 300;

  const totalQuestions =
    conversation?.exchanges.filter((e) => e.isQuestion).length || 0;

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

  // Load conversation data from CSV
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = await loadMockCSV(
          "practice/writing/writing_conversation.csv",
        );
        if (data && data.length > 0) {
          setConversation(data[0]);
        }
      } catch (error) {
        console.error("Error loading writing conversation:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversation();
  }, []);

  // Auto-advance for speaker turns and play audio
  useEffect(() => {
    if (!currentExchange || isCompleted) return;

    if (!currentExchange.isQuestion && !hasAnswered) {
      // Add speaker's message to history
      setConversationHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last?.speakerText !== currentExchange.speakerText) {
          if (currentExchange.speakerAudio && !hasPlayedAudio) {
            speak(currentExchange.speakerAudio, "fr-FR");
            setHasPlayedAudio(true);
          }
          return [
            ...prev,
            {
              speakerText: currentExchange.speakerText,
              userText: null,
            },
          ];
        }
        return prev;
      });

      // Auto-advance after delay
      const delay = 1500 + (currentExchange.speakerText?.length || 0) * 50;
      const timer = setTimeout(() => {
        if (currentTurnIndex < totalExchanges - 1) {
          setCurrentTurnIndex((prev) => prev + 1);
          setHasPlayedAudio(false);
        } else {
          setIsCompleted(true);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [
    currentTurnIndex,
    currentExchange,
    isCompleted,
    speak,
    totalExchanges,
    hasPlayedAudio,
    hasAnswered,
  ]);

  // Reset states when turn changes
  useEffect(() => {
    setUserInput("");
    setHasAnswered(false);
    setShowFeedback(false);
    resetTimer();
  }, [currentTurnIndex, resetTimer]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory, currentExchange]);

  const getWordCount = (text) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (
      showFeedback ||
      !currentExchange?.isQuestion ||
      !userInput.trim() ||
      isSubmitting ||
      hasAnswered
    )
      return;

    try {
      const result = await evaluate({
        task_type: "interactive",
        user_text: userInput,
        topic: conversation.scenario,
        reference: currentExchange.sampleAnswer,
        context: `Prompt: ${currentExchange.prompt}`,
      });

      if (result) {
        setIsCorrect(result.score >= 70);
        setFeedbackMessage(result.feedback);
        setShowFeedback(true);
        setHasAnswered(true);

        // Add user's response to conversation history
        setConversationHistory((prev) => [
          ...prev,
          {
            speakerText: null,
            userText: userInput,
            wasCorrect: result.score >= 70,
          },
        ]);

        if (result.score >= 70) {
          setScore((prev) => prev + 1);
        }
      } else {
        alert("Failed to get evaluation. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setUserInput("");
    resetEvaluation();

    if (currentTurnIndex < totalExchanges - 1) {
      setCurrentTurnIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
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
        isSubmitEnabled={
          userInput.trim().length >= 2 &&
          !showFeedback &&
          !hasAnswered &&
          currentExchange?.isQuestion
        }
        showSubmitButton={currentExchange?.isQuestion && !showFeedback}
        submitLabel="Submit"
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
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
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
                    {turn.speakerText && (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-2 max-w-[85%]">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-2xl rounded-tl-md shadow-sm">
                            <p className="text-sm">{turn.speakerText}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* User's response */}
                    {turn.userText && (
                      <div className="flex justify-end">
                        <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm max-w-[85%]">
                          <p className="text-sm">{turn.userText}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Current turn: Show typing indicator if NOT answered yet and speaker is "talking" */}
                {!hasAnswered &&
                  currentExchange &&
                  !currentExchange.isQuestion && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm flex items-center gap-3">
                          <MessageCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
                          <span className="text-sm text-slate-500 dark:text-slate-400 italic">
                            Typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Empty state */}
                {conversationHistory.length === 0 && !currentExchange && (
                  <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
                    <p className="text-sm">Conversation will appear here...</p>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* RIGHT COLUMN: Writing Input Area */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Your Response
              </h3>

              {currentExchange?.isQuestion && !hasAnswered && !showFeedback && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                  {/* Prompt Card */}
                  <div className="w-full bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/50">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      <span className="font-bold">Prompt: </span>
                      {currentExchange.prompt}
                    </p>
                  </div>

                  {/* Text Input */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your response in French..."
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-2 text-base transition-all outline-none shadow-sm min-h-[200px] resize-none",
                        "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                        "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
                      )}
                      autoFocus
                    />

                    {/* Word Count & Example */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">
                          {getWordCount(userInput)} /{" "}
                          {currentExchange.minWords || 5} words minimum
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Example:</span>{" "}
                          {currentExchange.sampleAnswer}
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Placeholder when waiting for user's turn */}
              {!currentExchange?.isQuestion &&
                !showFeedback &&
                !isCompleted && (
                  <div className="flex items-center justify-center h-[300px] text-slate-400 dark:text-slate-600 text-sm italic">
                    <p>Wait for your turn to respond...</p>
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
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentTurnIndex === totalExchanges - 1 ? "FINISH" : "CONTINUE"
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
