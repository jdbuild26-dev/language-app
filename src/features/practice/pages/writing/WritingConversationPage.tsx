"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { MessageSquare, User, MessageCircle, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useWritingEvaluation } from "@/hooks/useWritingEvaluation";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";

export default function WritingConversationPage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const speakRef = useRef(speak);
  useEffect(() => { speakRef.current = speak; }, [speak]);

  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState<any>(null);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  const { isSubmitting, evaluate, analyzeConversation } = useWritingEvaluation();

  const currentExchange = conversation?.exchanges?.[currentTurnIndex];
  const totalExchanges = conversation?.exchanges?.length || 0;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: conversation?.timeLimitSeconds || 300,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !hasAnswered && currentExchange) {
        if (currentTurnIndex < totalExchanges - 1) setCurrentTurnIndex(p => p + 1);
        else setIsCompleted(true);
      }
    },
    isPaused: isCompleted || isLoading,
  });

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadMockCSV("practice/writing/writing_conversation.csv");
        const raw = Array.isArray(data) ? data : [];
        const items = raw.filter((item: any) => {
          const exchanges = item.content?.exchanges || item.exchanges;
          return Array.isArray(exchanges) && exchanges.length > 0 &&
            (item.Category === "main" || !item.Category);
        });
        if (items.length > 0) {
          const pick = items[Math.floor(Math.random() * items.length)];
          setConversation({
            title: pick.title || pick.title_en || "",
            scenario: pick.scenario || pick.scenario_en || "",
            timeLimitSeconds: pick.timeLimitSeconds || 300,
            exchanges: Array.isArray(pick.exchanges) ? pick.exchanges : [],
          });
        }
      } catch (e) {
        console.error("Error loading writing conversation:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Auto-play speaker audio on each turn
  useEffect(() => {
    if (!currentExchange || isCompleted || hasPlayedAudio) return;
    if (currentExchange.speakerAudio) {
      try { speakRef.current(currentExchange.speakerAudio, "fr-FR"); } catch {}
      setHasPlayedAudio(true);
    }
  }, [currentTurnIndex, currentExchange, isCompleted, hasPlayedAudio]);

  // Reset on turn change
  useEffect(() => {
    setUserInput("");
    setHasAnswered(false);
    setHasPlayedAudio(false);
    resetTimer();
  }, [currentTurnIndex, resetTimer]);

  // Final analysis
  useEffect(() => {
    if (isCompleted && conversationHistory.length > 0 && !finalAnalysis && !isAnalyzing) {
      setIsAnalyzing(true);
      analyzeConversation(conversationHistory).then((res: any) => {
        setFinalAnalysis({
          overall_score: res.score ?? res.overall_score ?? 0,
          cefr_level: res.cefr_level || "A1",
          vocab_diversity: res.vocab_diversity ?? 50,
          grammar_diversity: res.grammar_diversity ?? 50,
          executive_summary: res.overall_feedback || res.executive_summary || "",
          improved_version: res.improved_version || "",
          detailed_tweaks: (res.key_mistakes || []).map((m: any) => ({
            original: m.mistake || "",
            corrected: m.correction || "",
            explanation: m.explanation || "",
          })),
          professional_checks: res.professional_checks || {
            register: "informal", tone_appropriatness: true, politeness: true, task_fulfillment: true,
          },
          parameters: res.parameters,
        });
        setIsAnalyzing(false);
      });
    }
  }, [isCompleted, conversationHistory, finalAnalysis, isAnalyzing, analyzeConversation]);

  // Auto-scroll
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversationHistory]);

  const getWordCount = (t: string) => t.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentExchange || !userInput.trim() || isSubmitting || hasAnswered) return;

    const submitted = userInput.trim();
    setUserInput("");
    setHasAnswered(true);

    setConversationHistory(prev => [...prev, {
      speakerText: currentExchange.speakerText,
      userText: submitted,
      isEvaluating: true,
    }]);

    try {
      const result = await evaluate({
        task_type: "interactive",
        user_text: submitted,
        topic: conversation.scenario,
        reference: currentExchange.sampleAnswer || "",
        context: `Prompt: ${currentExchange.prompt || currentExchange.speakerText}`,
      });

      if (result) {
        if ((result.score ?? result.overall_score ?? 0) >= 70) setScore(p => p + 1);
        setConversationHistory(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          last.isEvaluating = false;
          last.wasCorrect = (result.score ?? result.overall_score ?? 0) >= 70;
          last.evaluation = result;
          return updated;
        });
        setTimeout(() => {
          if (currentTurnIndex < totalExchanges - 1) setCurrentTurnIndex(p => p + 1);
          else setIsCompleted(true);
        }, 2500);
      } else {
        setHasAnswered(false);
        setConversationHistory(prev => prev.slice(0, -1));
      }
    } catch {
      setHasAnswered(false);
      setConversationHistory(prev => prev.slice(0, -1));
    }
  }, [currentExchange, userInput, isSubmitting, hasAnswered, evaluate, conversation, currentTurnIndex, totalExchanges]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
    </div>
  );

  if (!conversation) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
      <Button onClick={handleExit} variant="outline" className="mt-4">Back</Button>
    </div>
  );

  const progress = totalExchanges > 0 ? ((currentTurnIndex + 1) / totalExchanges) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Writing Conversation"
        instructionFr="Répondez à la conversation par écrit"
        instructionEn="Respond to the conversation in writing"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={totalExchanges}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInput.trim().length >= 2 && !hasAnswered && !!currentExchange}
        showSubmitButton={!!currentExchange && !hasAnswered}
        submitLabel="Submit"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

            {/* LEFT: Conversation history */}
            <div className="flex flex-col space-y-4">
              {/* Context card */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Context</h3>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{conversation.title}</p>
                {conversation.scenario && (
                  <p className="text-xs text-slate-500 mt-2 border-t pt-2 border-slate-100 dark:border-slate-700">
                    {conversation.scenario}
                  </p>
                )}
              </div>

              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Conversation
              </h3>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4">
                {conversationHistory.map((turn, i) => (
                  <div key={i} className="space-y-3">
                    {/* Bot message */}
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
                    {/* User response + inline eval */}
                    {turn.userText && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm max-w-[85%]">
                          <p className="text-sm">{turn.userText}</p>
                        </div>
                        {turn.isEvaluating && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 italic mr-2 mt-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Evaluating...
                          </div>
                        )}
                        {turn.evaluation && (
                          <div className={cn(
                            "max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md shadow-sm text-sm border mt-1",
                            turn.wasCorrect
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/50"
                              : "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/50"
                          )}>
                            <p className="font-semibold mb-1 text-xs uppercase tracking-wider opacity-80">
                              {turn.wasCorrect ? "Great job!" : "Keep going!"}
                            </p>
                            <p className="text-sm mb-2 opacity-90">{turn.evaluation.feedback || turn.evaluation.executive_summary}</p>
                            {turn.evaluation.improved_version && (
                              <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg mt-2">
                                <p className="text-xs font-semibold mb-1 opacity-80">Better way to say it:</p>
                                <p className="text-sm italic">{turn.evaluation.improved_version}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Current bot message (typing indicator) */}
                {!hasAnswered && currentExchange && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                          <p className="text-sm text-slate-700 dark:text-slate-200">{currentExchange.speakerText}</p>
                        </div>
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

            {/* RIGHT: Writing input */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Your Response
              </h3>

              {currentExchange && !hasAnswered && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                  {/* Prompt */}
                  {currentExchange.prompt && (
                    <div className="w-full bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/50">
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        <span className="font-bold">Prompt: </span>{currentExchange.prompt}
                      </p>
                    </div>
                  )}

                  {/* Text input */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      placeholder="Type your response in French..."
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-2 text-base transition-all outline-none shadow-sm min-h-[180px] resize-none",
                        "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                        "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
                      )}
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">
                          {getWordCount(userInput)} / {currentExchange.minWords || 3} words minimum
                        </span>
                      </div>
                      {currentExchange.sampleAnswer && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">Example:</span> {currentExchange.sampleAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {!currentExchange && !isCompleted && (
                <div className="flex items-center justify-center h-[300px] text-slate-400 dark:text-slate-600 text-sm italic">
                  <p>Loading next turn...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Final overlay */}
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
                  Analyzing your conversation...
                </p>
              </div>
            ) : finalAnalysis ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <WritingFeedbackResult
                  evaluation={finalAnalysis}
                  mode="interactive"
                  userText={conversationHistory.filter(t => t.userText).map(t => t.userText).join(" | ")}
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
