"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Languages, User, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useWritingEvaluation } from "@/hooks/useWritingEvaluation";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2 } from "lucide-react";
import { useTranslateText } from "@/hooks/useTranslateText";
import { Button } from "@/components/ui/button";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";

export default function WritingConversationPage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

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
  // Pre-shuffled MCQ options for the current exchange — shuffled once per turn, not on every render
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string; isCorrect: boolean }[]>([]);

  const { isSubmitting, evaluate, analyzeConversation } =
    useWritingEvaluation();

  const currentExchange = conversation?.exchanges?.[currentTurnIndex];
  const totalExchanges = conversation?.exchanges?.length || 0;
  const {
    displayText: promptDisplayText,
    isTranslating: isTranslatingP,
    toggle: toggleTranslate,
    reset: resetTranslate,
  } = useTranslateText(currentExchange?.prompt || "", "fr");
  useEffect(() => {
    resetTranslate();
  }, [currentTurnIndex, resetTranslate]);

  // Translate the current prompt text on demand
  const {
    displayText: promptDisplayText,
    isTranslating: isTranslatingP,
    toggle: toggleTranslate,
    reset: resetTranslate,
  } = useTranslateText(currentExchange?.prompt || currentExchange?.speakerText || "", "fr");

  const { timerString, resetTimer } = useExerciseTimer({
    duration: conversation?.timeLimitSeconds || 300,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !hasAnswered && currentExchange) {
        if (currentTurnIndex < totalExchanges - 1)
          setCurrentTurnIndex((p) => p + 1);
        else setIsCompleted(true);
      }
    },
    isPaused: isCompleted || isLoading,
  });

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPracticeData("writing_conversation");
        const raw = Array.isArray(data) ? data : [];
        // Accept both standard exchanges and MCQ-converted exchanges
        const items = raw.filter((item: any) => {
          const exchanges = item.content?.exchanges || item.exchanges;
          return Array.isArray(exchanges) && exchanges.length > 0;
        });
        if (items.length > 0) {
          // Merge ALL items' exchanges into one session so both RCG001 and RCG002
          // are played sequentially rather than picking one at random.
          const allExchanges = items.flatMap((item: any) =>
            Array.isArray(item.exchanges) ? item.exchanges : []
          );
          const first = items[0];
          setConversation({
            title: first.title || first.title_en || "",
            scenario: first.scenario || first.scenario_en || first["context_en"] || "",
            timeLimitSeconds: first.timeLimitSeconds || (first.Time ? parseInt(first.Time) : 300),
            exchanges: allExchanges,
            isMcqConversation: items.some((i: any) => i.isMcqConversation),
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
      try {
        speakRef.current(currentExchange.speakerAudio, "fr-FR");
      } catch (error) {
        console.warn("TTS playback failed:", error);
      }
      setHasPlayedAudio(true);
    }
  }, [currentTurnIndex, currentExchange, isCompleted, hasPlayedAudio]);

  // Reset on turn change — deps are only stable primitives/functions, NOT currentExchange
  // (currentExchange is a derived object that changes reference every render)
  useEffect(() => {
    setUserInput("");
    setHasAnswered(false);
    setHasPlayedAudio(false);
    resetTranslate();
    resetTimer();

    // Pre-shuffle MCQ options once for this turn
    const exchange = conversation?.exchanges?.[currentTurnIndex];
    if (exchange?.isMcq) {
      const opts: { text: string; isCorrect: boolean }[] = [
        { text: exchange.correctAnswer || exchange.sampleAnswer || "", isCorrect: true },
        ...((exchange.distractors || []) as any[]).map((d: any) => ({
          text: d.fr || d.en || "",
          isCorrect: false,
        })),
      ]
        .filter((o) => o.text)
        .sort(() => Math.random() - 0.5);
      setShuffledOptions(opts);
    } else {
      setShuffledOptions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurnIndex, conversation]);

  // Final analysis
  useEffect(() => {
    if (
      isCompleted &&
      conversationHistory.length > 0 &&
      !finalAnalysis &&
      !isAnalyzing
    ) {
      setIsAnalyzing(true);
      analyzeConversation(conversationHistory).then((res: any) => {
        setFinalAnalysis({
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
            explanation: m.explanation || "",
          })),
          professional_checks: res.professional_checks || {
            register: "informal",
            tone_appropriatness: true,
            politeness: true,
            task_fulfillment: true,
          },
          parameters: res.parameters,
        });
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

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory]);

  const getWordCount = (t: string) =>
    t
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!currentExchange || !userInput.trim() || isSubmitting || hasAnswered)
        return;

      const submitted = userInput.trim();
      setUserInput("");
      setHasAnswered(true);

      setConversationHistory((prev) => [
        ...prev,
        {
          speakerText: currentExchange.speakerText,
          userText: submitted,
          isEvaluating: true,
        },
      ]);

      try {
        const result = await evaluate({
          task_type: "interactive",
          user_text: submitted,
          topic: conversation.scenario,
          reference: currentExchange.sampleAnswer || "",
          context: `Prompt: ${promptDisplayText || currentExchange.speakerText}`,
        });

        if (result) {
          if ((result.score ?? result.overall_score ?? 0) >= 70)
            setScore((p) => p + 1);
          setConversationHistory((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            last.isEvaluating = false;
            last.wasCorrect = (result.score ?? result.overall_score ?? 0) >= 70;
            last.evaluation = result;
            return updated;
          });
          setTimeout(() => {
            if (currentTurnIndex < totalExchanges - 1)
              setCurrentTurnIndex((p) => p + 1);
            else setIsCompleted(true);
          }, 2500);
        } else {
          setHasAnswered(false);
          setConversationHistory((prev) => prev.slice(0, -1));
        }
      } catch {
        setHasAnswered(false);
        setConversationHistory((prev) => prev.slice(0, -1));
      }
    },
    [
      currentExchange,
      userInput,
      isSubmitting,
      hasAnswered,
      evaluate,
      conversation,
      currentTurnIndex,
      totalExchanges,
      promptDisplayText,
    ],
  );

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );

  if (!conversation)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <Button onClick={handleExit} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );

  const progress =
    totalExchanges > 0 ? ((currentTurnIndex + 1) / totalExchanges) * 100 : 0;

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
        isSubmitEnabled={
          userInput.trim().length >= 2 && !hasAnswered && !!currentExchange
        }
        showSubmitButton={!!currentExchange && !hasAnswered}
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
              {conversationHistory.map((turn, i) => (
                <div key={i} className="space-y-3">
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

              {!hasAnswered && currentExchange && (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-4 pr-11 py-3 rounded-2xl rounded-tl-sm shadow-sm text-slate-700 dark:text-slate-200 relative inline-block text-left w-fit max-w-[85%]">
                    <span className="text-[15px] leading-relaxed break-words">
                      {currentExchange.speakerText}
                    </span>
                    <button
                      onClick={() =>
                        speak(
                          currentExchange.speakerAudio ||
                            currentExchange.speakerText,
                          "fr-FR",
                        )
                      }
                      className="absolute top-2 right-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-emerald-500"
                      title="Replay audio"
                      type="button"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {conversationHistory.length === 0 && hasAnswered === false && (
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
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {conversation?.scenario || conversation?.title}
              </p>
            </div>

            {currentExchange && (
              <div className="px-4 py-5 animate-in fade-in slide-in-from-bottom-4 duration-500 border-b border-slate-100 dark:border-slate-700/50 mb-2">
                <h3 className="practice-reading-heading flex items-start gap-3 text-[15px] font-bold text-slate-800 dark:text-slate-200">
                  <button
                    type="button"
                    onClick={toggleTranslate}
                    disabled={isTranslatingP}
                    className="inline-flex items-center justify-center shrink-0 text-emerald-500 hover:text-emerald-600 disabled:opacity-60 transition-colors mt-0.5"
                  >
                    {isTranslatingP ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Languages className="w-5 h-5 shrink-0" />
                    )}
                  </button>
                  <span className="leading-relaxed">
                    {promptDisplayText ||
                      "Write the next reply in the conversation"}
                  </span>
                </h3>
              </div>
            )}

            {currentExchange && !hasAnswered && (
              <div className="px-4 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                {currentExchange.isMcq ? (
                  /* ── MCQ mode: options pre-shuffled once per turn ── */
                  <div className="space-y-3">
                    {shuffledOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setUserInput(opt.text)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-2xl border text-sm transition-all",
                          "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                          userInput === opt.text
                            ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-emerald-400",
                        )}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* ── Free-text mode ── */
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
                    <div className="flex flex-col gap-3">
                      <div className="  px-4 ">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {getWordCount(userInput)} /{" "}
                          {currentExchange.minWords || 3} words minimum
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
                  </form>
                )}
              </div>
            )}

            {!currentExchange && !isCompleted && (
              <div className="flex items-center justify-center h-[300px] text-slate-400 dark:text-slate-600 text-sm italic">
                <p>Loading next turn...</p>
              </div>
            )}
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
