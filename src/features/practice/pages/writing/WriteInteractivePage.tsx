"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Languages, User, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useWritingEvaluation } from "@/hooks/useWritingEvaluation";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { useTranslateText } from "@/hooks/useTranslateText";
import { Button } from "@/components/ui/button";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";

type InteractiveExchange = {
  isQuestion?: boolean;
  speakerText?: string;
  speakerAudio?: string;
  prompt?: string;
  sampleAnswer?: string;
  minWords?: number;
};

type InteractiveConversation = {
  title: string;
  scenario: string;
  timeLimitSeconds: number;
  TimeLimitSeconds?: number;
  exchanges: InteractiveExchange[];
};

type ConversationHistoryItem = {
  speakerText: string | null;
  userText: string | null;
  isEvaluating?: boolean;
  wasCorrect?: boolean;
  evaluation?: any;
};

export default function WriteInteractivePage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Use a ref for speak so the auto-advance effect doesn't re-run when voices load
  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  // Current turn/exchange index (0-based)
  const [conversation, setConversation] = useState<InteractiveConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // User's input for current turn
  const [userInput, setUserInput] = useState("");

  // Whether user has submitted their answer for current turn
  const [hasAnswered, setHasAnswered] = useState(false);

  // Conversation history: array of {speakerText, userText, wasCorrect}
  const [conversationHistory, setConversationHistory] = useState<
    ConversationHistoryItem[]
  >([]);

  // Score tracking
  const [score, setScore] = useState(0);

  // Overall completion
  const [isCompleted, setIsCompleted] = useState(false);

  // Final Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState<any>(null);

  // Audio playback state
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  const { isSubmitting, evaluate, analyzeConversation } =
    useWritingEvaluation();

  const currentExchange = conversation?.exchanges[currentTurnIndex];

  // Translate prompt per exchange
  const { displayText: promptDisplayText, isTranslating: isTranslatingP, toggle: toggleTranslate, reset: resetTranslate } = useTranslateText(currentExchange?.prompt || "", "fr");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { resetTranslate(); }, [currentTurnIndex]);
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

  // Load conversation data from backend (write_interactive slug)
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = await loadMockCSV("practice/writing/write_interactive.csv");
        const raw = Array.isArray(data) ? data : [];
        // Filter to main category, prefer new format (has exchanges array)
        const items = raw.filter((item: any) =>
          (item.exchanges || item.title || item.scenario) &&
          (item.Category === "main" || !item.Category)
        );
        if (items.length > 0) {
          // Pick a random exercise each session
          const pick = items[Math.floor(Math.random() * items.length)];
          // Normalise: backend spreads content flat into item
          const conv: InteractiveConversation = {
            title: pick.title || pick.scenario_title || pick.title_en || "",
            scenario: pick.scenario || pick.scenario_en || "",
            timeLimitSeconds: pick.timeLimitSeconds || pick.TimeLimitSeconds || 300,
            exchanges: Array.isArray(pick.exchanges) ? pick.exchanges : [],
          };
          setConversation(conv);
        }
      } catch (error) {
        console.error("Error loading interactive writing:", error);
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
              speakerText: currentExchange.speakerText ?? null,
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
      analyzeConversation(conversationHistory).then((res: any) => {
        // Normalize to EnhancedAnalysisData shape for WritingFeedbackResult
        const normalized = {
          overall_score: res.score ?? res.overall_score ?? 0,
          cefr_level: res.cefr_level || "A1",
          vocab_diversity: res.vocab_diversity ?? 50,
          grammar_diversity: res.grammar_diversity ?? 50,
          executive_summary: res.overall_feedback || res.executive_summary || "",
          improved_version: res.improved_version || "",
          detailed_tweaks: (res.key_mistakes || []).map((m: any) => ({
            original: m.mistake || "",
            corrected: m.correction || "",
            explanation: m.explanation || m.correction || "",
          })),
          professional_checks: res.professional_checks || {
            register: "informal",
            tone_appropriatness: true,
            politeness: true,
            task_fulfillment: true,
          },
          parameters: res.parameters,
        };
        setFinalAnalysis(normalized);
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

  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
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
        topic: conversation?.scenario ?? "",
        reference: currentExchange.sampleAnswer || "",
        context: `Prompt: ${promptDisplayText || ""}`,
      });

      if (result) {
        const resultScore = result.score ?? result.overall_score ?? 0;

        if (resultScore >= 70) {
          setScore((prev) => prev + 1);
        }

        // Update history with evaluation
        setConversationHistory((prev) => {
          const newHistory = [...prev];
          const lastEntry = newHistory[newHistory.length - 1];
          lastEntry.isEvaluating = false;
          lastEntry.wasCorrect = resultScore >= 70;
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
        onNext={() => {
          void handleSubmit();
        }}
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
        <div className="practice-reading-page-shell flex flex-col md:flex-row gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0">
          <div className="flex-1 min-h-0 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b-[2px] border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                Conversation
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide-until-hover p-4 space-y-4">
              {conversationHistory.map((turn, index) => (
                <div key={index} className="space-y-3">
                  {turn.speakerText && (
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                      </div>
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-4 pr-11 py-3 rounded-2xl rounded-tl-sm shadow-sm text-slate-700 dark:text-slate-200 relative inline-block text-left w-fit max-w-[85%]">
                        <span className="text-[15px] leading-relaxed break-words">
                          {turn.speakerText}
                        </span>
                        <button
                          onClick={() => speak(turn.speakerText, "fr-FR")}
                          className="absolute top-2 right-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-emerald-500"
                          title="Replay audio"
                          type="button"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {turn.userText && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-emerald-600 text-white pl-5 pr-12 py-3 rounded-2xl rounded-br-sm shadow-sm relative inline-block text-left w-fit max-w-[85%]">
                        <p className="text-[15px] leading-relaxed break-words">
                          {turn.userText}
                        </p>
                        <button
                          onClick={() => speak(turn.userText, "fr-FR")}
                          className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/90"
                          title="Replay audio"
                          type="button"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      {turn.isEvaluating && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 italic mr-2 mt-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Evaluating...
                        </div>
                      )}
                      {turn.evaluation && (
                        <div
                          className={cn(
                            "max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md shadow-sm text-sm border mt-1",
                            turn.wasCorrect
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/50"
                              : "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/50",
                          )}
                        >
                          <p className="font-semibold mb-1 text-xs uppercase tracking-wider opacity-80">
                            {turn.wasCorrect ? "Great job!" : "Keep going!"}
                          </p>
                          <p className="text-sm mb-2 opacity-90">
                            {turn.evaluation.feedback ||
                              turn.evaluation.executive_summary}
                          </p>
                          {turn.evaluation.improved_version && (
                            <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg mt-2">
                              <p className="text-xs font-semibold mb-1 opacity-80">
                                Better way to say it:
                              </p>
                              <p className="text-sm italic">
                                {turn.evaluation.improved_version}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {currentExchange?.isQuestion &&
                !hasAnswered &&
                userInput.trim().length > 0 && (
                  <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-emerald-600/90 text-white px-5 py-3 rounded-2xl rounded-br-sm shadow-sm inline-block text-left w-fit max-w-[85%] opacity-90">
                      <span className="text-[15px] leading-relaxed break-words">
                        {userInput}
                      </span>
                    </div>
                  </div>
                )}

              {conversationHistory.length === 0 && !currentExchange && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 py-10 opacity-70">
                  <p className="text-sm">Conversation will appear here...</p>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-y-auto">
            <div className="m-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-5 min-h-[6rem]">
              <p className="text-xs font-bold border-b-2 border-gray-200 dark:border-slate-600 pb-1 uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-2">
                Context
              </p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                {conversation?.scenario || conversation?.title}
              </p>
            </div>

            {currentExchange?.isQuestion && !hasAnswered && (
              <>
                <div className="px-4 py-5 animate-in fade-in slide-in-from-bottom-4 duration-500 border-b border-slate-100 dark:border-slate-700/50 mb-2">
                  <h3 className="practice-reading-heading flex items-start gap-3 text-[15px] font-bold text-slate-800 dark:text-slate-200">
                    <button type="button" onClick={toggleTranslate} disabled={isTranslatingP} className="inline-flex items-center justify-center shrink-0 text-emerald-500 hover:text-emerald-600 disabled:opacity-60 transition-colors mt-0.5">{isTranslatingP ? <Loader2 className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5 shrink-0" />}</button>
                    <span className="leading-relaxed">
                      {promptDisplayText ||
                        "Write the next reply in the conversation"}
                    </span>
                  </h3>
                </div>

                <div className="px-4 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your response in French..."
                      className={cn(
                        "w-full px-4 py-4 rounded-2xl border text-base transition-all outline-none shadow-sm min-h-[180px] resize-none",
                        "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                        "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
                      )}
                      autoFocus
                    />
                  </form>

                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="text-xs px-2 font-medium text-slate-500 dark:text-slate-400">
                        {getWordCount(userInput)} /{" "}
                        {currentExchange.minWords || 5} words minimum
                      </span>
                    </div>
                    {currentExchange.sampleAnswer && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                          Example Response
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {currentExchange.sampleAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {!currentExchange?.isQuestion && !isCompleted && (
              <div className="h-24 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-80">
                <Volume2 className="w-6 h-6 animate-pulse mb-3 text-emerald-500" />
                <div className="text-sm font-medium tracking-wide">
                  Listening...
                </div>
              </div>
            )}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Final Summary Overlay */}
      {isCompleted && (
        <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-900 flex flex-col items-center p-6 overflow-y-auto">
          <div className="w-full max-w-2xl mt-10 mb-10">
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <WritingFeedbackResult
                  evaluation={finalAnalysis}
                  mode="interactive"
                  userText={conversationHistory
                    .filter((t) => t.userText)
                    .map((t) => t.userText)
                    .join(" | ")}
                  onContinue={handleExit}
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
