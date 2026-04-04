"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  Loader2, 
  Volume2, 
  Languages, 
  ArrowRight, 
  Sparkles, 
  History,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { cn } from "@/lib/utils";
import { loadMockCSV } from "@/utils/csvLoader";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export default function TranslateBySpeakingPage() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();

  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Interaction State
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [evaluation, setEvaluation] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && (window.SpeechRecognition || (window as any).webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = "fr-FR";
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setSpokenText(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMockCSV("practice/speaking/speak_translate.csv");
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching speaking data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpokenText("");
      setEvaluation(null);
      setShowFeedback(false);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!spokenText || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/practice/evaluate-speaking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "translate",
          transcript: spokenText,
          reference: currentQuestion?.Translation,
          context: `Translate the English sentence: "${currentQuestion?.Sentence}" into spoken French.`,
          level: "A1", // Default level
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate");
      const result = await response.json();
      setEvaluation(result);
      setShowFeedback(true);
      
      const finalScore = result.overall_score !== undefined ? result.overall_score : (result.is_correct ? 100 : 0);
      if (finalScore >= 70) {
        setScore((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setSpokenText("");
    setEvaluation(null);
    setShowFeedback(false);
    setIsListening(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <PracticeGameLayout
      questionType="Translate by Speaking"
      instructionFr="Traduisez la phrase à haute voix"
      instructionEn="Translate the sentence out loud"
      progress={progress}
      score={score}
      totalQuestions={questions.length}
      isGameOver={isGameOver}
      onExit={handleExit}
      onNext={showFeedback ? handleNext : handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={Boolean(spokenText) && !isSubmitting}
      showSubmitButton={!showFeedback}
      submitLabel={isSubmitting ? "Judging..." : "Submit Speech"}
    >
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-8">
        {/* Source Sentence Card */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-3xl p-8 mb-8 shadow-2xl border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest">
              <Languages className="w-3.5 h-3.5" />
              English Source
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              "{currentQuestion?.Sentence}"
            </h2>
            
            <div className="flex items-center justify-center gap-4 text-slate-400">
              <div className="h-px w-12 bg-slate-200 dark:bg-slate-700" />
              <Sparkles className="w-5 h-5 text-indigo-500/50" />
              <div className="h-px w-12 bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>

        {/* Interaction Zone */}
        <div className="w-full flex flex-col items-center gap-8 mb-8">
          <div className="relative">
            {/* Pulse rings for recording */}
            {isListening && (
              <>
                <motion.div 
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full bg-red-500"
                />
                <motion.div 
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                  className="absolute inset-0 rounded-full bg-red-400"
                />
              </>
            )}
            
            <button
              onClick={handleToggleListening}
              disabled={isSubmitting || !!evaluation}
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative z-10",
                isListening
                  ? "bg-red-500 text-white scale-110"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105",
                (isSubmitting || !!evaluation) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Mic className={cn("w-10 h-10", isListening && "animate-pulse")} />
            </button>
          </div>

          {/* Transcript display */}
          <div className={cn(
            "w-full p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-dashed transition-all duration-500 min-h-[120px] flex items-center justify-center text-center",
            isListening ? "border-indigo-400 bg-indigo-50/10" : "border-slate-200 dark:border-slate-700"
          )}>
            <AnimatePresence mode="wait">
              {spokenText ? (
                <motion.p 
                  key="spoken"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-medium text-slate-800 dark:text-slate-200 italic"
                >
                  "{spokenText}"
                </motion.p>
              ) : (
                <motion.p 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-slate-400 dark:text-slate-500 font-medium"
                >
                  {isListening ? "Speaking..." : "Tap to start speaking in French"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* AI Evaluation Result Overlay */}
        {evaluation && (
          <div className="w-full animate-in slide-in-from-bottom-8 duration-700">
            <WritingFeedbackResult evaluation={evaluation} mode="speaking" />
          </div>
        )}
      </div>
    </PracticeGameLayout>
  );
}
