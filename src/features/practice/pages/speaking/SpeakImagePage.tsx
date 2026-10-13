"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { usePracticeRecording } from "@/hooks/usePracticeRecording";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import SpeakingRecordingControls from "@/features/practice/components/SpeakingRecordingControls";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useSpeakImageEvaluation } from "@/features/practice/hooks/useSpeakImageEvaluation";
import { normalizeSpeakImageExercises, speakImageAvailability, type SpeakImageQuestion } from "@/features/practice/lib/speakImageExercise";
import WriteImageFeedbackResult from "@/features/practice/components/WriteImageFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2, ImageIcon } from "lucide-react";
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

  const { transcript, startListening, stopListening, resetTranscript, stopAndReadTranscript, error: recordingError } = useSpeechRecognition();
  const { evaluation, isSubmitting, error, evaluate, resetEvaluation } = useSpeakImageEvaluation();

  const currentQ = questions[currentIndex];
  const recording = usePracticeRecording(60, stopListening);
  const resetRecording = recording.reset;
  const [submittedText, setSubmittedText] = useState("");
  const [isFinalizingTranscript, setIsFinalizingTranscript] = useState(false);
  const finalizing = useRef(false);
  const busy = isSubmitting || isFinalizingTranscript;
  const contextKey = JSON.stringify([learningLang, knownLang, levelParam, tag, currentIndex, currentQ?.id]);
  const activeContext = useRef(contextKey);
  activeContext.current = contextKey;

  const { timerString, resetTimer, isExpired } = useExerciseTimer({
    duration: currentQ?.timeLimitSeconds || 60,
    mode: "timer",
    onExpire: () => { void recording.stop(); if (!isCompleted && !showFeedback) void handleSubmit(); },
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
    resetRecording();
    if (currentQ && !isCompleted) {
      resetTranscript();
      setShowFeedback(false);
      resetTimer();
      resetEvaluation();
    }
  }, [currentIndex, currentQ, isCompleted, resetTimer, resetEvaluation, resetTranscript, resetRecording]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (showFeedback || busy || finalizing.current || !currentQ || !transcript.trim() || speakImageAvailability(currentQ)) return;
    const context = activeContext.current;
    finalizing.current = true;
    setIsFinalizingTranscript(true);
    try {
      const [, captured] = await Promise.all([recording.stop(), stopAndReadTranscript()]);
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
    recording.reset(); stopListening(); resetTranscript();
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
        disableContentScroll
      >
        <PracticeTwoPanel className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-slate-950 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-4 md:overflow-hidden md:p-4">
          <div className="flex min-h-[320px] min-w-0 items-center justify-center p-4 md:min-h-0">
            {currentQ.image_url ? <div className="relative aspect-square w-full max-w-[min(100%,calc(100dvh-15rem))] shrink-0 overflow-hidden rounded-xl">
              <Image src={currentQ.image_url} alt="Image to describe" fill unoptimized sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
            </div> : <div className="flex flex-col items-center gap-3 text-slate-400"><ImageIcon className="h-20 w-20" /><p>Image not yet uploaded</p></div>}
          </div>
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-6 py-8">
            {!evaluation ? <>
              <SpeakingRecordingControls recording={recording} startListening={startListening} resetTranscript={resetTranscript}
                disabled={showFeedback || busy || Boolean(missingContent) || (isExpired && !recording.isRecording)} />
              {(missingContent || error || recordingError) && <p role="alert" className="text-base text-red-600">{missingContent || error || recordingError}</p>}
            </> : <WriteImageFeedbackResult evaluation={evaluation} mode="speaking" userText={submittedText} onContinue={handleContinue} />}
          </div>
        </PracticeTwoPanel>
      </PracticeGameLayout>
    </>
  );
}
