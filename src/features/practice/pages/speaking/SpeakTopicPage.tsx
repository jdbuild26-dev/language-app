"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { normalizeTopicExercises, topicAvailability, type TopicQuestion } from "@/features/practice/lib/topicExercise";
import { useTopicEvaluation } from "@/features/practice/hooks/useTopicEvaluation";
import TopicFeedbackResult from "@/features/practice/components/TopicFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────



// ─── Component ────────────────────────────────────────────────────────────────

export default function SpeakTopicPage() {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;

  const [questions, setQuestions] = useState<TopicQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [submittedText, setSubmittedText] = useState("");

  const { isListening, transcript, startListening, stopListening, resetTranscript, stopAndReadTranscript, error: recordingError } = useSpeechRecognition();
  const { evaluation, isSubmitting, error, evaluate, resetEvaluation } = useTopicEvaluation();

  const [isFinalizingTranscript, setIsFinalizingTranscript] = useState(false);
  const busy = isSubmitting || isFinalizingTranscript;
  const currentQ = questions[currentIndex];

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
    exerciseType: "speak_topic",
    level: currentQ?.level,
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let obsolete = false;
    resetEvaluation();
    stopListening();
    resetTranscript();
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setIsCompleted(false);
    setShowFeedback(false);
    setIsLoading(true);
    (async () => {
      try {
        const data = await fetchPracticeData("speak_topic", {
          level: levelParam, learningLang: learningLang || "fr", knownLang: knownLang || "en", tag,
        });
        if (!obsolete) setQuestions(normalizeTopicExercises(data, "speak"));
      } catch (cause) {
        if (!obsolete) console.error("Topic load failed:", cause);
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
  const finalizing = useRef(false);
  const handleSubmit = async () => {
    if (showFeedback || busy || finalizing.current || !currentQ || !transcript.trim() || topicAvailability(currentQ)) return;
    const context = activeContext.current;
    finalizing.current = true;
    setIsFinalizingTranscript(true);
    try {
      const captured = await stopAndReadTranscript();
      if (activeContext.current !== context) return;
      setSubmittedText(captured);
      const result = await evaluate({ mode: "speak", exercise_id: currentQ.id, learner_response: captured });
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

  const missingContent = topicAvailability(currentQ);
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const mainInstruction = currentQ.main_instruction_fr || currentQ.main_instruction_en || "";
  const bullets = currentQ.topic_bullets_fr.length > 0 ? currentQ.topic_bullets_fr : currentQ.topic_bullets_en;
  const instructionBox = currentQ.instruction_box_en || currentQ.instruction_box_fr || "Speak about the topic";

  return (
    <>
      <PracticeGameLayout
        questionType="Speak About Topic"
        instructionFr="Parlez du sujet"
        instructionEn="Speak About Topic"
        localizedInstruction="Parlez du sujet"
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
        <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

          {/* ── Top card: main instruction + bullet points ── */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col gap-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {mainInstruction}
            </p>

            {bullets.length > 0 && (
              <>
                <hr className="border-slate-100 dark:border-slate-800" />
                <ul className="flex flex-col gap-2">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 dark:bg-sky-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* ── Bottom interaction: Mic & Transcript ── */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 flex flex-col items-center gap-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {instructionBox}
            </p>

            {/* Mic Button */}
            <div className="relative">
              <button
                onClick={() => isListening ? stopListening() : startListening()}
                disabled={showFeedback || !!evaluation || isSubmitting}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl disabled:opacity-50",
                  isListening
                    ? "bg-red-500 text-white animate-pulse scale-110 shadow-red-500/20"
                    : "bg-sky-500 text-white hover:bg-sky-600 hover:scale-105 shadow-sky-500/20"
                )}
              >
                {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
              
              {isListening && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    ENREGISTREMENT...
                  </span>
                </div>
              )}
            </div>

            {/* Transcript Display */}
            <div className="w-full min-h-[100px] mt-4 flex items-center justify-center p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
              {transcript ? (
                <p className="text-lg text-slate-800 dark:text-slate-200 font-medium italic text-center">
                  "{transcript}"
                </p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic text-sm">
                  Cliquez sur le micro et commencez à parler...
                </p>
              )}
            </div>
          </div>

          {missingContent && <p role="alert" className="text-sm text-amber-700 dark:text-amber-300">{missingContent}</p>}
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
          {recordingError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{recordingError}</p>}

          {/* ── AI Evaluation result ── */}
          {evaluation && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <TopicFeedbackResult
                evaluation={evaluation}
                userText={submittedText}
                onContinue={handleContinue}
              />
            </div>
          )}

        </div>
      </PracticeGameLayout>
    </>
  );
}
