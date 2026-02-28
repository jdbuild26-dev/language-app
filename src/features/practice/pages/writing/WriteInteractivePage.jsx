import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { MessageSquare, User, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useWritingEvaluation } from "../../hooks/useWritingEvaluation";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WriteInteractivePage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();
  const chatEndRef = useRef(null);

  // Use a ref for speak so the auto-advance effect doesn't re-run when voices load
  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

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

  // Score tracking
  const [score, setScore] = useState(0);

  // Overall completion
  const [isCompleted, setIsCompleted] = useState(false);

  // Final Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState(null);

  // Audio playback state
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  const { isSubmitting, evaluate, analyzeConversation } =
    useWritingEvaluation();

  const currentExchange = conversation?.exchanges[currentTurnIndex];
  const totalExchanges = conversation?.exchanges.length || 0;

  const timerDuration =
    conversation?.timeLimitSeconds || conversation?.TimeLimitSeconds || 300;

  const totalQuestions =
    conversation?.exchanges.filter((e) => e.isQuestion).length || 0;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !hasAnswered) {
        if (currentTurnIndex < totalExchanges - 1) {
          setCurrentTurnIndex((prev) => prev + 1);
        } else {
          setIsCompleted(true);
        }
      }
    },
    isPaused: isCompleted || isLoading,
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
      // Add speaker's message to history (without side effects inside updater)
      setConversationHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last?.speakerText !== currentExchange.speakerText) {
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

      // Play audio outside the state updater
      if (currentExchange.speakerAudio && !hasPlayedAudio) {
        try {
          speakRef.current(currentExchange.speakerAudio, "fr-FR");
        } catch (e) {
          console.warn("TTS failed, continuing without audio:", e);
        }
        setHasPlayedAudio(true);
      }

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
    totalExchanges,
    hasPlayedAudio,
    hasAnswered,
  ]);

  // Reset states when turn changes
  useEffect(() => {
    setUserInput("");
    setHasAnswered(false);
    resetTimer();
  }, [currentTurnIndex, resetTimer]);

  // Handle conversation completion analysis
  useEffect(() => {
    if (
      isCompleted &&
      conversationHistory.length > 0 &&
      !finalAnalysis &&
      !isAnalyzing
    ) {
      setIsAnalyzing(true);
      analyzeConversation(conversationHistory).then((res) => {
        setFinalAnalysis(res);
        setIsAnalyzing(false);
      });
    }
  }, [
    isCompleted,
    conversationHistory,
    finalAnalysis,
    isAnalyzing,
    analyzeConversation,
  ]);

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
      !currentExchange?.isQuestion ||
      !userInput.trim() ||
      isSubmitting ||
      hasAnswered
    )
      return;

    const submittedText = userInput.trim();
    setUserInput("");
    setHasAnswered(true);

    // Initial user history entry
    setConversationHistory((prev) => [
      ...prev,
      {
        speakerText: null,
        userText: submittedText,
        isEvaluating: true,
      },
    ]);

    try {
      const result = await evaluate({
        task_type: "interactive",
        user_text: submittedText,
        topic: conversation.scenario,
        reference: currentExchange.sampleAnswer,
        context: `Prompt: ${currentExchange.prompt}`,
      });

      if (result) {
        if (result.score >= 70) {
          setScore((prev) => prev + 1);
        }

        // Update history with evaluation
        setConversationHistory((prev) => {
          const newHistory = [...prev];
          const lastEntry = newHistory[newHistory.length - 1];
          lastEntry.isEvaluating = false;
          lastEntry.wasCorrect = result.score >= 70;
          lastEntry.evaluation = result;
          return newHistory;
        });

        // Delay before moving to next bot prompt so user can read the inline feedback
        setTimeout(() => {
          if (currentTurnIndex < totalExchanges - 1) {
            setCurrentTurnIndex((prev) => prev + 1);
          } else {
            setIsCompleted(true);
          }
        }, 3000);
      } else {
        alert("Failed to get evaluation. Please try again.");
        setHasAnswered(false);
        setConversationHistory((prev) => prev.slice(0, prev.length - 1));
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("An unexpected error occurred. Please try again.");
      setHasAnswered(false);
      setConversationHistory((prev) => prev.slice(0, prev.length - 1));
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
          !hasAnswered &&
          currentExchange?.isQuestion
        }
        showSubmitButton={currentExchange?.isQuestion && !hasAnswered}
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

                    {/* User's response and inline evaluation */}
                    {turn.userText && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm max-w-[85%]">
                          <p className="text-sm">{turn.userText}</p>
                        </div>
                        {turn.isEvaluating && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 italic mr-2 mt-1">
                            <Loader2 className="w-3 h-3 animate-spin" />{" "}
                            Evaluating...
                          </div>
                        )}
                        {turn.evaluation && (
                          <div
                            className={cn(
                              "max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md shadow-sm text-sm border mt-1",
                              turn.wasCorrect
                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/50"
                                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800/50",
                            )}
                          >
                            <p className="font-semibold mb-1 text-xs uppercase tracking-wider opacity-80">
                              {turn.wasCorrect
                                ? "Great job!"
                                : "Needs Improvement"}
                            </p>
                            <p className="text-sm mb-2 opacity-90">
                              {turn.evaluation.feedback}
                            </p>
                            <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg mt-2">
                              <p className="text-xs font-semibold mb-1 opacity-80">
                                Suggested way to say it:
                              </p>
                              <p className="text-sm italic">
                                {turn.evaluation.improved_version}
                              </p>
                            </div>
                          </div>
                        )}
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

              {currentExchange?.isQuestion && !hasAnswered && (
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
              {!currentExchange?.isQuestion && !isCompleted && (
                <div className="flex items-center justify-center h-[300px] text-slate-400 dark:text-slate-600 text-sm italic">
                  <p>Wait for your turn to respond...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Final Summary Overlay */}
      {isCompleted && (
        <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-900 flex flex-col items-center p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mt-10 space-y-6 mb-10">
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white">
              Conversation Complete!
            </h2>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="text-slate-500 dark:text-slate-400 text-center animate-pulse">
                  Analyzing your entire conversation...
                </p>
              </div>
            ) : finalAnalysis ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-2">
                    Overall Score
                  </span>
                  <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-emerald-500 bg-white dark:bg-slate-800 shadow-sm relative overflow-hidden">
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 z-10">
                      {finalAnalysis.score}%
                    </span>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-emerald-100 dark:bg-emerald-900/30"
                      style={{ height: `${finalAnalysis.score}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-500" />
                    Overall Feedback
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 bg-sky-50 dark:bg-sky-900/10 p-4 rounded-xl border border-sky-100 dark:border-sky-800/30">
                    {finalAnalysis.overall_feedback}
                  </p>
                </div>

                {finalAnalysis.key_mistakes?.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-red-500" />
                      Key Mistakes to Review
                    </h3>
                    <div className="space-y-3">
                      {finalAnalysis.key_mistakes.map((mistake, i) => (
                        <div
                          key={i}
                          className="bg-red-50 dark:bg-red-900/5 p-4 rounded-xl border border-red-100 dark:border-red-900/20"
                        >
                          <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                            <span className="font-semibold text-red-900 dark:text-red-200">
                              Mistake:
                            </span>{" "}
                            {mistake.mistake}
                          </p>
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800/30 flex items-start gap-2">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mt-0.5">
                              Correction:
                            </span>
                            <span className="text-sm text-emerald-800 dark:text-emerald-300">
                              {mistake.correction}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {finalAnalysis.suggestions?.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <Send className="w-4 h-4 text-purple-500" />
                      Suggestions for Improvement
                    </h3>
                    <ul className="space-y-2 bg-purple-50 dark:bg-purple-900/5 p-4 rounded-xl border border-purple-100 dark:border-purple-900/20">
                      {finalAnalysis.suggestions.map((sug, i) => (
                        <li
                          key={i}
                          className="text-sm text-purple-800 dark:text-purple-300 flex items-start gap-2"
                        >
                          <span className="text-purple-400 mt-1">•</span>
                          {sug}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={handleExit}
                  className="w-full mt-6 py-6 text-lg rounded-xl"
                  size="lg"
                >
                  Return to Dashboard
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
