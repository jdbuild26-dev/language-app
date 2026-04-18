"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { MessageSquare, User, MessageCircle, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeakingEvaluation } from "@/hooks/useSpeakingEvaluation";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";

export default function SpeakInteractivePage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Keep speak in a ref so the auto-advance effect doesn't re-run when voices load
  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  // Conversation data
  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");

  // Whether user has submitted their answer for current turn
  const [hasAnswered, setHasAnswered] = useState(false);

  // Conversation history: array of {speakerText, userText, wasCorrect, evaluation}
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  // Score tracking
  const [score, setScore] = useState(0);

  // Overall completion
  const [isCompleted, setIsCompleted] = useState(false);

  // Final Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState<any>(null);

  // Audio playback state
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  const { isSubmitting, evaluate, analyzeConversation } = useSpeakingEvaluation();

  const currentExchange = conversation?.exchanges[currentTurnIndex];
  const totalExchanges = conversation?.exchanges.length || 0;
  const timerDuration = conversation?.timeLimitSeconds || 300;
  const totalQuestions =
    conversation?.exchanges.filter((e: any) => e.isQuestion).length || 0;

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

  // Initialise Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.lang = "fr-FR";
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results as any)
          .map((r: any) => r[0].transcript)
          .join("");
        setSpokenText(transcript);
      };

      rec.onend = () => setIsListening(false);
      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Load conversation data from backend (speak_interactive slug)
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = await loadMockCSV("practice/speaking/speak_interactive.csv");
        const raw = Array.isArray(data) ? data : [];
        const items = raw.filter(
          (item: any) =>
            (item.exchanges || item.title || item.scenario) &&
            (item.Category === "main" || !item.Category)
        );
        if (items.length > 0) {
          const pick = items[Math.floor(Math.random() * items.length)];
          const conv = {
            title: pick.title || pick.scenario_title || pick.title_en || "",
            scenario: pick.scenario || pick.scenario_en || "",
            timeLimitSeconds:
              pick.timeLimitSeconds || pick.TimeLimitSeconds || 300,
            exchanges: Array.isArray(pick.exchanges) ? pick.exchanges : [],
          };
          setConversation(conv);
        }
      } catch (error) {
        console.error("Error loading interactive speaking:", error);
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
      setConversationHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last?.speakerText !== currentExchange.speakerText) {
          return [
            ...prev,
            { speakerText: currentExchange.speakerText, userText: null },
          ];
        }
        return prev;
      });

      if (currentExchange.speakerAudio && !hasPlayedAudio) {
        try {
          speakRef.current(currentExchange.speakerAudio, "fr-FR");
        } catch (e) {
          console.warn("TTS failed, continuing without audio:", e);
        }
        setHasPlayedAudio(true);
      }

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
    setSpokenText("");
    setHasAnswered(false);
    setIsListening(false);
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
        const normalized = {
          overall_score: res.score ?? res.overall_score ?? 0,
          cefr_level: res.cefr_level || "A1",
          vocab_diversity: res.vocab_diversity ?? 50,
          grammar_diversity: res.grammar_diversity ?? 50,
          executive_summary:
            res.overall_feedback || res.executive_summary || "",
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
          pronunciation_tips: res.pronunciation_tips,
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

  const getWordCount = (text: string) =>
    text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpokenText("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (
      !currentExchange?.isQuestion ||
      !spokenText.trim() ||
      isSubmitting ||
      hasAnswered
    )
      return;

    // Stop recording if still active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const submittedText = spokenText.trim();
    setSpokenText("");
    setHasAnswered(true);

    setConversationHistory((prev) => [
      ...prev,
      { speakerText: null, userText: submittedText, isEvaluating: true },
    ]);

    try {
      const result = await evaluate({
        task_type: "interactive",
        transcript: submittedText,
        reference: currentExchange.sampleAnswer,
        context: `Prompt: ${currentExchange.prompt}. Scenario: ${conversation?.scenario || ""}`,
      });

      if (result) {
        const evalScore =
          result.overall_score !== undefined ? result.overall_score : 0;
        if (evalScore >= 70) {
          setScore((prev) => prev + 1);
        }

        setConversationHistory((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          last.isEvaluating = false;
          last.wasCorrect = evalScore >= 70;
          last.evaluation = result;
          return updated;
        });

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
  }, [
    currentExchange,
    spokenText,
    isSubmitting,
    hasAnswered,
    isListening,
    evaluate,
    conversation,
    currentTurnIndex,
    totalExchanges,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
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
        questionType="Interactive Speaking"
        instructionFr="Répondez à la conversation en parlant en français"
        instructionEn="Respond to the conversation by speaking in French"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={totalQuestions}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={
          spokenText.trim().length >= 2 &&
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
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
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
                {conversationHistory.map((turn, index) => (
                  <div key={index} className="space-y-3">
                    {/* Speaker's message */}
                    {turn.speakerText && (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-2 max-w-[85%]">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-2xl rounded-tl-md shadow-sm">
                            <p className="text-sm">{turn.speakerText}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* User's spoken response and inline evaluation */}
                    {turn.userText && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="bg-indigo-500 text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm max-w-[85%]">
                          <p className="text-sm italic">"{turn.userText}"</p>
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
                                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800/50"
                            )}
                          >
                            <p className="font-semibold mb-1 text-xs uppercase tracking-wider opacity-80">
                              {turn.wasCorrect ? "Great job!" : "Needs Improvement"}
                            </p>
                            <p className="text-sm mb-2 opacity-90">
                              {turn.evaluation.executive_summary ||
                                turn.evaluation.feedback}
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
                            {turn.evaluation.pronunciation_tip && (
                              <div className="mt-2 text-xs opacity-70">
                                🎙 {turn.evaluation.pronunciation_tip}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator while bot "speaks" */}
                {!hasAnswered &&
                  currentExchange &&
                  !currentExchange.isQuestion && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm flex items-center gap-3">
                          <MessageCircle className="w-4 h-4 text-indigo-500 animate-pulse" />
                          <span className="text-sm text-slate-500 dark:text-slate-400 italic">
                            Speaking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {conversationHistory.length === 0 && !currentExchange && (
                  <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
                    <p className="text-sm">Conversation will appear here...</p>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* RIGHT COLUMN: Speaking Input Area */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Your Response
              </h3>

              {currentExchange?.isQuestion && !hasAnswered && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                  {/* Prompt Card */}
                  <div className="w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800/50">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      <span className="font-bold">Prompt: </span>
                      {currentExchange.prompt}
                    </p>
                  </div>

                  {/* Microphone Button */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <button
                        onClick={handleToggleListening}
                        disabled={isSubmitting}
                        className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed",
                          isListening
                            ? "bg-red-500 text-white animate-pulse scale-110 shadow-red-500/30"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-600/30"
                        )}
                      >
                        <Mic
                          className={cn(
                            "w-8 h-8",
                            isListening && "animate-bounce"
                          )}
                        />
                      </button>
                      {isListening && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            LISTENING...
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                      {isListening
                        ? "Tap again to stop recording"
                        : "Tap the mic to start speaking"}
                    </p>
                  </div>

                  {/* Spoken Text Display */}
                  <div className="min-h-[100px] w-full bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-dashed border-slate-300 dark:border-slate-700">
                    {spokenText ? (
                      <p className="text-base text-slate-700 dark:text-slate-200 font-medium italic text-center">
                        "{spokenText}"
                      </p>
                    ) : (
                      <p className="text-slate-400 dark:text-slate-500 italic text-center text-sm py-4">
                        Your spoken words will appear here...
                      </p>
                    )}
                  </div>

                  {/* Word count & example */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        {getWordCount(spokenText)} /{" "}
                        {currentExchange.minWords || 3} words minimum
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold">Example:</span>{" "}
                        {currentExchange.sampleAnswer}
                      </p>
                    </div>
                  </div>
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
          <div className="w-full max-w-2xl mt-10 mb-10">
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">
              Conversation Complete!
            </h2>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-slate-500 dark:text-slate-400 text-center animate-pulse">
                  Analyzing your spoken conversation...
                </p>
              </div>
            ) : finalAnalysis ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <WritingFeedbackResult
                  evaluation={finalAnalysis}
                  mode="speaking"
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
