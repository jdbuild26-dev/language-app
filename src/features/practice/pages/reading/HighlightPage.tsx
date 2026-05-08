"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Loader2, Volume2, Languages, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTranslateText } from "@/hooks/useTranslateText";

export default function HighlightPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const passageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fetch from the real backend using native fetch
        const response = await fetch("/api/practice/highlight_text");
        if (!response.ok) throw new Error("Failed to fetch exercises");
        const data = await response.json();
        setQuestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading exercises:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];
  const lLang = currentQuestion?.learning_lang || "fr";
  const kLang = currentQuestion?.known_lang || "en";
  
  const passage = currentQuestion?.content?.[`passage_${lLang}`] || "";
  const questionText = currentQuestion?.content?.[`question_${lLang}`] || "";
  const correctAnswer = currentQuestion?.evaluation?.[`correct_answer_${lLang}`] || "";
  const tolerance = currentQuestion?.evaluation?.acceptable_boundary || 10;
  const minChars = currentQuestion?.config?.minHighlightChars || 0;
  const maxChars = currentQuestion?.config?.maxHighlightChars || 2000;
  const isCaseSensitive = currentQuestion?.config?.caseSensitive || false;

  const timerDuration = currentQuestion?.config?.timeLimitSeconds || 360;

  // Translate question text (if user wants to see it in known lang)
  const { displayText: questionDisplayText, isTranslating: isTranslatingQ, toggle: toggleTranslate, reset: resetTranslate } = useTranslateText(questionText, kLang);

  useEffect(() => { resetTranslate(); }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

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
    isPaused: isCompleted || showFeedback || loading,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedText("");
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayAudio = () => {
    if (passage) {
      speak(passage, lLang === "fr" ? "fr-FR" : "en-US");
    }
  };

  const normalize = (str: string) => {
    let normalized = str.trim().replace(/[.,!?;:'"]/g, "");
    if (!isCaseSensitive) normalized = normalized.toLowerCase();
    return normalized;
  };

  const handleMouseUp = () => {
    if (showFeedback || isCompleted) return;
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString().trim();
      if (text) {
        setSelectedText(text);
      }
    }
  };

  const handleSubmit = () => {
    if (showFeedback || !selectedText) return;

    const sel = normalize(selectedText);
    const target = normalize(correctAnswer);

    // Validation: Min/Max characters
    if (selectedText.length < minChars) {
      setFeedbackMessage(`Your selection is too short. Please select at least ${minChars} characters.`);
      setIsCorrect(false);
      setShowFeedback(true);
      return;
    }
    if (selectedText.length > maxChars) {
      setFeedbackMessage(`Your selection is too long. Maximum allowed is ${maxChars} characters.`);
      setIsCorrect(false);
      setShowFeedback(true);
      return;
    }

    // Fuzzy Match:
    // 1. Check if one contains the other
    const isContained = sel.includes(target) || target.includes(sel);
    // 2. Check if the length difference is within the acceptable boundary (tolerance)
    const lengthDiff = Math.abs(sel.length - target.length);
    
    const correct = isContained && lengthDiff <= tolerance;

    setIsCorrect(correct);
    if (correct) {
      setFeedbackMessage("Excellent! You found the correct section.");
      setScore((prev) => prev + 1);
    } else {
      setFeedbackMessage("Not quite. Try to be more precise with your selection.");
    }
    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Highlight the Sentence"
        questionTypeFr="Surligner la phrase"
        questionTypeEn="Highlight the Sentence"
        localizedInstruction={currentQuestion?.content?.[`box_instructions_${lLang}`]}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        currentQuestionIndex={currentIndex}
        questionCounterValue={currentIndex + 1}
        isSubmitEnabled={!!selectedText || showFeedback}
        showSubmitButton={true}
        submitLabel={showFeedback ? (currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE") : "Submit Selection"}
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? correctAnswer : null}
        feedbackMessage={feedbackMessage}
        feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6 pb-[100px] flex-1 min-h-0">
          {/* Question Header */}
          <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 shadow-lg">
            <p className="text-lg md:text-xl text-white font-semibold text-center flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleTranslate}
                disabled={isTranslatingQ}
                className="inline-flex items-center justify-center shrink-0 text-blue-100 hover:text-white disabled:opacity-60 transition-colors"
              >
                {isTranslatingQ ? <Loader2 className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5" />}
              </button>
              <span>{questionDisplayText}</span>
            </p>
          </div>

          {/* Passage Area */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-8 mb-6 shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
             <div className="absolute top-4 right-4 text-slate-400 select-none">
                <MousePointer2 className="w-5 h-5 opacity-50" />
             </div>
             
             <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white border-b pb-2">
                {currentQuestion?.content?.[`title_${lLang}`] || "Passage"}
             </h3>

             <div 
                ref={passageRef}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleMouseUp}
                className="text-xl leading-relaxed text-slate-800 dark:text-slate-200 selection:bg-blue-200 selection:text-blue-900 cursor-text whitespace-pre-wrap select-text"
             >
                {passage}
             </div>

             {selectedText && !showFeedback && (
                <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                   <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Currently Selected:
                   </p>
                   <p className="text-slate-700 dark:text-slate-300 italic line-clamp-2">
                      "{selectedText}"
                   </p>
                </div>
             )}
          </div>

          {/* Audio Controls */}
          <button
            onClick={handlePlayAudio}
            disabled={isSpeaking}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-sm border",
              isSpeaking
                ? "bg-blue-100 text-blue-600 border-blue-200"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300",
            )}
          >
            <Volume2 className="w-5 h-5" />
            Listen to Passage
          </button>
        </div>
      </PracticeGameLayout>
    </>
  );
}
