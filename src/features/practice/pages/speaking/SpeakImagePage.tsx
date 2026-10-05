"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useSpeakImageEvaluation } from "@/features/practice/hooks/useSpeakImageEvaluation";
import { normalizeSpeakImageExercises, speakImageAvailability, type SpeakImageQuestion } from "@/features/practice/lib/speakImageExercise";
import WriteImageFeedbackResult from "@/features/practice/components/WriteImageFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2, Mic, MicOff, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

export default function SpeakImagePage() {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;

  const [questions, setQuestions] = useState<SpeakImageQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const { isListening, transcript, startListening, stopListening, resetTranscript, stopAndReadTranscript, error: recordingError } = useSpeechRecognition();
  const { evaluation, isSubmitting, error, evaluate, resetEvaluation } = useSpeakImageEvaluation();

  const currentQ = questions[currentIndex];
  const [submittedText, setSubmittedText] = useState("");
  const [isFinalizingTranscript, setIsFinalizingTranscript] = useState(false);
  const finalizing = useRef(false);
  const busy = isSubmitting || isFinalizingTranscript;
  const contextKey = JSON.stringify([learningLang, knownLang, levelParam, tag, currentIndex, currentQ?.id]);
  const activeContext = useRef(contextKey);
  activeContext.current = contextKey;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentQ?.timeLimitSeconds || 60,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !showFeedback) handleSubmit(); },
    isPaused: isLoading || isCompleted || showFeedback || busy,
  });

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "speak_image",
    level: currentQ?.level,
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let obsolete = false;
    resetEvaluation(); stopListening(); resetTranscript();
    setQuestions([]); setCurrentIndex(0); setScore(0);
    setIsCompleted(false); setShowFeedback(false); setIsLoading(true);
    (async () => {
      try {
        const data = await fetchPracticeData("speak_image", {
          level: levelParam,
          learningLang: learningLang || "fr",
          knownLang: knownLang || "en",
          tag,
        });
        if (!obsolete) setQuestions(normalizeSpeakImageExercises(data));
      } catch (e) {
        console.error("SpeakImagePage load error:", e);
      } finally {
        if (!obsolete) setIsLoading(false);
      }
    })();
    return () => { obsolete = true; resetEvaluation(); };
  }, [levelParam, learningLang, knownLang, tag, resetEvaluation, stopListening, resetTranscript]);

  useEffect(() => {
    if (currentQ && !isCompleted) {
      resetTranscript();
      setShowFeedback(false);
      resetTimer();
      resetEvaluation();
    }
  }, [currentIndex, currentQ, isCompleted, resetTimer, resetEvaluation, resetTranscript]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (showFeedback || busy || finalizing.current || !currentQ || !transcript.trim() || speakImageAvailability(currentQ)) return;
    const context = activeContext.current;
    finalizing.current = true;
    setIsFinalizingTranscript(true);
    try {
      const captured = await stopAndReadTranscript();
      if (activeContext.current !== context) return;
      setSubmittedText(captured);
      const result = await evaluate({ exercise_id: currentQ.id, transcript: captured });
      if (result && activeContext.current === context) {
        setShowFeedback(true);
        if (result.overall_score >= 70) setScore(value => value + 1);
      }
    } catch {
      // The capture hook displays the recording error; never evaluate unfinished speech.
    } finally {
      finalizing.current = false;
      setIsFinalizingTranscript(false);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    resetEvaluation();
    if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
    else setIsCompleted(true);
  };

  // ── States ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="animate-spin text-sky-500 w-8 h-8" />
    </div>
  );

  if (questions.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
      <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
    </div>
  );

  const missingContent = speakImageAvailability(currentQ);
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const instructionLabel = currentQ.instruction_box_en || currentQ.instruction_box_fr;

  return (
    <>
      <PracticeGameLayout
        questionType="Speak About Image"
        instructionFr="Décrivez l'image"
        instructionEn="Speak About Image"
        localizedInstruction="Décrivez l'image"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={transcript.trim().length > 5 && !showFeedback && !busy && !evaluation && !missingContent}
        showSubmitButton={!showFeedback && !evaluation}
        submitLabel={busy ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
      >
        <div className="flex flex-col lg:flex-row w-full h-full min-h-0 bg-slate-50 dark:bg-slate-950">
          
          {/* LEFT — image */}
          <div className="flex items-center justify-center w-full lg:w-1/2 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {currentQ.image_url ? (
              <img
                src={currentQ.image_url}
                alt="Exercise image"
                className="max-w-full max-h-[380px] rounded-xl object-contain shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-600">
                <ImageIcon className="w-20 h-20" />
                <p className="text-sm">Image not yet uploaded</p>
              </div>
            )}
          </div>

          {/* RIGHT — interaction */}
          <div className="flex flex-col w-full lg:w-1/2 p-6 lg:p-10 bg-white dark:bg-slate-900 overflow-y-auto">
            {!evaluation ? (
              <div className="flex flex-col h-full items-center justify-center gap-8">
                {/* Instruction label */}
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  {instructionLabel}
                </p>

                {(error || recordingError || missingContent) && <p role="alert" className="text-sm text-red-600">{error || recordingError || missingContent}</p>}
                {/* Mic Button */}
                <div className="relative">
                  <button
                    onClick={() => isListening ? stopListening() : startListening()}
                    aria-label={isListening ? "Stop recording" : "Start recording"}
                    disabled={showFeedback || !!evaluation || busy || !!missingContent}
                    className={cn(
                      "w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl disabled:opacity-50",
                      isListening
                        ? "bg-red-500 text-white animate-pulse scale-110 shadow-red-500/20"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-600/20"
                    )}
                  >
                    {isListening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
                  </button>
                  
                  {isListening && (
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        ENREGISTREMENT...
                      </span>
                    </div>
                  )}
                </div>

                {/* Transcript Display */}
                <div className="w-full min-h-[120px] flex items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
                  {transcript ? (
                    <p className="text-xl text-slate-800 dark:text-slate-200 font-medium italic text-center leading-relaxed">
                      "{transcript}"
                    </p>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 italic text-sm text-center">
                      Cliquez sur le micro et décrivez ce que vous voyez...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* AI evaluation result */
              <div className="flex-1 overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
                <WriteImageFeedbackResult
                  evaluation={evaluation}
                  mode="speaking"
                  userText={submittedText}
                  onContinue={handleContinue}
                />
              </div>
            )}
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
