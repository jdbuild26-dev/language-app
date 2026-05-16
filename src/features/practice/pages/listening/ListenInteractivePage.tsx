"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, User, Languages, Loader2, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConversationOption = { id: string | number; text: string; text_fr?: string; text_en?: string };
type ConversationExchange = {
  speaker?: string;
  speakerText: string;
  speakerText_en?: string;
  questionText?: string;
  questionText_en?: string;
  correctOptionId: string | number;
  options: ConversationOption[];
};
type ConversationData = {
  title?: string;
  title_fr?: string;
  title_en?: string;
  scenario?: string;
  context?: string;
  objectives?: string;
  level?: string;
  timeLimitSeconds?: number;
  exchanges: ConversationExchange[];
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListenInteractivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <ListenInteractiveContent />
    </Suspense>
  );
}

function ListenInteractiveContent() {
  const handleExit = usePracticeExit();
  const { learningLang = "fr" } = useLanguage();
  const { speak, isSpeaking, pause, resume, isPaused } = useTextToSpeech();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;

  // State
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [convIndex, setConvIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Current conversation turn
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [displayedHistory, setDisplayedHistory] = useState<any[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
  
  // Feedback states
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentConv = conversations[convIndex];
  const currentExchange = currentConv?.exchanges?.[currentTurnIndex];
  const { pick } = useQuestionLanguage(currentConv?.level);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPracticeData("listen_interactive", { tag });
        const raw = Array.isArray(data) ? data : [];
        const mapped: ConversationData[] = raw.map((item: any) => {
          const c = item.content || item;
          let exchanges = c.exchanges || [];
          if (typeof exchanges === 'string') {
            try { exchanges = JSON.parse(exchanges); } catch { exchanges = []; }
          }
          return {
            ...c,
            level: item.Level || item.level || "B1",
            exchanges: exchanges.map((ex: any) => ({
              ...ex,
              options: (ex.options || []).map((o: any) => ({
                id: o.id ?? 0,
                text: learningLang === 'fr' ? (o.text_fr || o.text || '') : (o.text_en || o.text || ''),
                text_fr: o.text_fr || o.text || '',
                text_en: o.text_en || '',
              }))
            }))
          };
        }).filter(c => c.exchanges.length > 0);
        setConversations(mapped);
      } catch (e) {
        console.error("ListenInteractive load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [tag, learningLang]);

  // Handle Auto-play of speaker line
  useEffect(() => {
    if (currentExchange && !showFeedback && !isCompleted && !isLoading) {
      // Small delay to let UI settle
      const timer = setTimeout(() => {
        speak(currentExchange.speakerText, "fr-FR");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentTurnIndex, convIndex, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedHistory, currentTurnIndex, showFeedback]);

  const totalQuestions = conversations.reduce((acc, c) => acc + c.exchanges.length, 0);

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: totalQuestions,
    exerciseType: "listen_interactive",
    level: currentConv?.level,
  });

  const { timerString } = useExerciseTimer({
    duration: currentConv?.timeLimitSeconds || 300,
    mode: "timer",
    onExpire: () => { if (!showFeedback && !isCompleted) handleSubmit(); },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOptionSelect = (id: string | number) => {
    if (showFeedback) return;
    const opt = currentExchange?.options.find(o => o.id === id);
    if (opt) speak(opt.text, "fr-FR");
    setSelectedOptionId(id);
  };

  const handleSubmit = () => {
    if (showFeedback || selectedOptionId === null || !currentExchange) return;

    const correct = selectedOptionId === currentExchange.correctOptionId;
    const selectedOpt = currentExchange.options.find(o => o.id === selectedOptionId);

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    if (correct) setScore(s => s + 1);

    // Add current turn to history for display
    setDisplayedHistory(prev => [
      ...prev,
      {
        speaker: currentExchange.speaker,
        speakerText: currentExchange.speakerText,
        userText: selectedOpt?.text || "",
        wasCorrect: correct
      }
    ]);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedOptionId(null);

    if (currentTurnIndex < currentConv.exchanges.length - 1) {
      setCurrentTurnIndex(i => i + 1);
    } else if (convIndex < conversations.length - 1) {
      setConvIndex(i => i + 1);
      setCurrentTurnIndex(0);
      setDisplayedHistory([]);
    } else {
      setIsCompleted(true);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
    </div>
  );

  if (conversations.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
      <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
    </div>
  );

  const progress = ((convIndex * 100) / conversations.length) + ((currentTurnIndex + 1) * 100 / (conversations.length * currentConv.exchanges.length));

  return (
    <>
      <PracticeGameLayout
        questionType="Listening Conversation"
        instructionFr="Écoutez et choisissez la bonne réponse"
        instructionEn="Listen to the audio and select the best response"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={totalQuestions}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOptionId !== null && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit Response"
        timerValue={timerString}
      >
        <div className="practice-reading-page-shell flex flex-col md:flex-row gap-4 p-4 mx-auto overflow-hidden flex-1 min-h-0 bg-slate-50/50 dark:bg-slate-950/50">
          
          {/* LEFT: Chat Window */}
          <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Dialogue</span>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isSpeaking ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live Audio</span>
              </div>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {displayedHistory.map((item, idx) => (
                <div key={idx} className="space-y-4">
                  {/* Speaker bubble */}
                  <div className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-1 border border-indigo-200 dark:border-indigo-800">
                      <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] relative group">
                      <p className="text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed">{item.speakerText}</p>
                      <button onClick={() => speak(item.speakerText, "fr-FR")} className="absolute -right-10 top-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* User response */}
                  <div className="flex justify-end animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className={cn("px-5 py-3 rounded-2xl rounded-br-sm shadow-sm max-w-[85%] text-white", item.wasCorrect ? "bg-emerald-600" : "bg-rose-600")}>
                      <p className="text-[15px]">{item.userText}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Current speaker message (if not answered) */}
              {!showFeedback && currentExchange && (
                <div className="flex items-start gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-indigo-200 dark:shadow-none">
                    {isSpeaking ? <Pause className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%]">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{currentExchange.speaker || "Speaker"}</span>
                          {isSpeaking && <div className="flex gap-0.5 items-end h-3"><div className="w-1 bg-indigo-400 animate-music-1 rounded-full" /><div className="w-1 bg-indigo-400 animate-music-2 rounded-full" /><div className="w-1 bg-indigo-400 animate-music-3 rounded-full" /></div>}
                       </div>
                       <p className="text-[15px] text-slate-800 dark:text-slate-100 font-medium leading-relaxed italic">
                        {isSpeaking ? "Listening to response..." : currentExchange.speakerText}
                       </p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* RIGHT: Interaction Panel */}
          <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-y-auto">
            {/* Context/Objective Card */}
            <div className="m-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Situation</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {currentConv.objectives || currentConv.scenario || currentConv.context || currentConv.title}
              </p>
            </div>

            {/* Question */}
            {!showFeedback && currentExchange && (
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800">
                <h3 className="flex items-start gap-3 text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
                  <Languages className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  {pick(currentExchange.questionText_en, currentExchange.questionText) || "How would you respond?"}
                </h3>
              </div>
            )}

            {/* Options */}
            {!showFeedback && currentExchange && (
              <div className="p-6">
                <PracticeOptions
                  options={currentExchange.options.map(o => o.text)}
                  selectedOption={selectedOptionId !== null ? currentExchange.options.findIndex(o => o.id === selectedOptionId) : null}
                  onSelect={(idx) => handleOptionSelect(currentExchange.options[idx].id)}
                  itemClassName="w-full bg-white dark:bg-slate-800 py-4 px-5 rounded-2xl text-left flex items-center gap-4 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-indigo-400 hover:shadow-md group"
                  renderLabel={(txt) => (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                        <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                      </div>
                      <span className="text-[15px] font-medium text-slate-700 dark:text-slate-200">{txt}</span>
                    </div>
                  )}
                />
              </div>
            )}

            {/* Empty space filler */}
            <div className="flex-1" />
          </div>

        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={!isCorrect ? currentExchange?.options.find(o => o.id === currentExchange.correctOptionId)?.text : null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={currentTurnIndex === currentConv.exchanges.length - 1 && convIndex === conversations.length - 1 ? "FINISH" : "CONTINUE"}
        />
      )}
      
      <style jsx global>{`
        @keyframes music-1 { 0%, 100% { height: 4px; } 50% { height: 12px; } }
        @keyframes music-2 { 0%, 100% { height: 8px; } 50% { height: 4px; } }
        @keyframes music-3 { 0%, 100% { height: 12px; } 50% { height: 6px; } }
        .animate-music-1 { animation: music-1 0.6s ease-in-out infinite; }
        .animate-music-2 { animation: music-2 0.7s ease-in-out infinite; }
        .animate-music-3 { animation: music-3 0.8s ease-in-out infinite; }
      `}</style>
    </>
  );
}
