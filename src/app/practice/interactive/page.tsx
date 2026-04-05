"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Volume2, 
  Sparkles, 
  History,
  CheckCircle2,
  ChevronRight,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { cn } from "@/lib/utils";
import { loadMockCSV } from "@/utils/csvLoader";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { motion, AnimatePresence } from "framer-motion";

interface Exchange {
  turnId: number;
  speakerText?: string;
  speakerAudio?: string;
  isQuestion: boolean;
  prompt?: string;
  sampleAnswer?: string;
  minWords?: number;
}

export default function InteractivePracticePage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Game State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [userResponse, setUserResponse] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMockCSV("practice/writing/writing_conversation.csv") as any[];
        setQuestions(data);
        if (data.length > 0) {
          const firstExchanges = JSON.parse(typeof data[0].exchanges === 'string' ? data[0].exchanges : JSON.stringify(data[0].exchanges));
          setExchanges(firstExchanges);
        }
      } catch (error) {
        console.error("Error loading interactive data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationHistory, currentTurnIndex]);

  // Handle speaker turns automatically
  useEffect(() => {
    if (exchanges.length > 0 && currentTurnIndex < exchanges.length) {
      const currentTurn = exchanges[currentTurnIndex];
      if (!currentTurn.isQuestion) {
        // It's a bot turn
        const timer = setTimeout(() => {
          setConversationHistory(prev => [...prev, { 
            role: 'bot', 
            text: currentTurn.speakerText,
            audio: currentTurn.speakerAudio 
          }]);
          if (currentTurn.speakerAudio) {
            speak(currentTurn.speakerAudio, "fr-FR");
          }
          setCurrentTurnIndex(prev => prev + 1);
        }, 800);
        return () => clearTimeout(timer);
      }
    } else if (exchanges.length > 0 && currentTurnIndex === exchanges.length && !isCompleted && !evaluation) {
        // End of conversation reached
        handleAnalyzeConversation();
    }
  }, [currentTurnIndex, exchanges, isCompleted, evaluation]);

  const handleUserSubmit = () => {
    if (!userResponse.trim()) return;

    const currentTurn = exchanges[currentTurnIndex];
    setConversationHistory(prev => [...prev, { 
      role: 'user', 
      text: userResponse,
      prompt: currentTurn.prompt
    }]);
    
    setUserResponse("");
    setCurrentTurnIndex(prev => prev + 1);
  };

  const handleAnalyzeConversation = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/practice/analyze-writing-conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_history: conversationHistory.map(h => ({
            speakerText: h.role === 'bot' ? h.text : undefined,
            userText: h.role === 'user' ? h.text : undefined
          }))
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze");
      const result = await response.json();
      setEvaluation(result);
      setIsCompleted(true);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const currentTurn = exchanges[currentTurnIndex];
  const isUserTurn = currentTurn?.isQuestion;

  return (
    <PracticeGameLayout
      questionType="Interactive Practice"
      instructionFr="Participez à la conversation"
      instructionEn="Participate in the conversation"
      progress={isCompleted ? 100 : (currentTurnIndex / exchanges.length) * 100}
      score={0}
      totalQuestions={1}
      isGameOver={isCompleted && !!evaluation}
      onExit={handleExit}
      onNext={() => {}}
      onRestart={() => window.location.reload()}
      showSubmitButton={false}
    >
      <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 py-4 gap-6">
        {/* Chat History Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar min-h-[400px]"
        >
          <AnimatePresence initial={false}>
            {conversationHistory.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex items-start gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                  msg.role === 'user' ? "bg-indigo-600" : "bg-white dark:bg-slate-800"
                )}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-600" />}
                </div>
                
                <div className="space-y-1">
                  <div className={cn(
                    "p-4 rounded-3xl shadow-sm border",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-none" 
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-700 rounded-tl-none"
                  )}>
                    <p className="text-lg leading-relaxed">{msg.text}</p>
                    {msg.role === 'bot' && (
                      <button 
                        onClick={() => speak(msg.text, "fr-FR")}
                        className="mt-2 text-indigo-400 hover:text-indigo-600 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {msg.prompt && (
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                       Context: {msg.prompt}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* AI Typing Indicator */}
            {!isCompleted && !isUserTurn && exchanges[currentTurnIndex] && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex items-start gap-4"
               >
                 <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center animate-pulse">
                   <Bot className="w-5 h-5 text-indigo-400" />
                 </div>
                 <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    </div>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>

          {/* Final Evaluation Section */}
          {evaluation && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-8 border-t border-slate-200 dark:border-slate-800"
            >
              <div className="text-center mb-8">
                <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-600 text-white font-black px-6 py-2 rounded-full uppercase tracking-tighter mb-4 shadow-xl">
                   Conversation Complete
                </Badge>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Professional Review Performance</h3>
              </div>
              <WritingFeedbackResult 
                evaluation={evaluation} 
                mode="interactive" 
                onContinue={() => window.location.reload()}
              />
              
              <div className="flex justify-center mt-8 pb-8">
                <Button 
                  onClick={() => window.location.reload()}
                  className="rounded-2xl px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-lg shadow-2xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                >
                  <RefreshCcw className="w-6 h-6 mr-3" />
                  Practice Again
                </Button>
              </div>
            </motion.div>
          )}

          {isEvaluating && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Analyzing your conversation flow...</p>
            </div>
          )}
        </div>

        {/* Interaction Bar */}
        {!isCompleted && !isEvaluating && (
          <div className="w-full bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-700 space-y-4">
            {isUserTurn && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center gap-4 border border-indigo-100 dark:border-indigo-800">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 text-white">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Your Task</span>
                  <p className="text-sm text-indigo-900 dark:text-indigo-200 font-bold">{currentTurn.prompt}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <input
                type="text"
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && isUserTurn && handleUserSubmit()}
                placeholder={isUserTurn ? "Type your response in French..." : "Waiting for AI..."}
                disabled={!isUserTurn}
                className={cn(
                  "flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl h-14 px-6 text-lg placeholder-slate-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all",
                  !isUserTurn && "opacity-50"
                )}
              />
              <Button
                onClick={handleUserSubmit}
                disabled={!isUserTurn || !userResponse.trim()}
                className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:scale-110 active:scale-95"
              >
                <Send className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PracticeGameLayout>
  );
}
