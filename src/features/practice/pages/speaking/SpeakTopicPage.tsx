"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { usePracticeRecording } from "@/hooks/usePracticeRecording";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import SpeakingRecordingControls from "@/features/practice/components/SpeakingRecordingControls";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { normalizeTopicExercises, topicAvailability, type TopicQuestion } from "@/features/practice/lib/topicExercise";
import { useTopicEvaluation } from "@/features/practice/hooks/useTopicEvaluation";
import TopicFeedbackResult from "@/features/practice/components/TopicFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2 } from "lucide-react";
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

  const { transcript, startListening, stopListening, resetTranscript, stopAndReadTranscript, error: recordingError } = useSpeechRecognition();
  const { evaluation, isSubmitting, error, evaluate, resetEvaluation } = useTopicEvaluation();

  const [isFinalizingTranscript, setIsFinalizingTranscript] = useState(false);
  const busy = isSubmitting || isFinalizingTranscript;
  const currentQ = questions[currentIndex];
  const recording = usePracticeRecording(60, stopListening);
  const resetRecording = recording.reset;

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
    resetRecording();
    if (currentQ && !isCompleted) {
      resetTranscript();
      setShowFeedback(false);
      resetTimer();
      resetEvaluation();
    }
  }, [currentIndex, currentQ, isCompleted, resetTimer, resetEvaluation, resetTranscript, resetRecording]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const finalizing = useRef(false);
  const handleSubmit = async () => {
    if (showFeedback || busy || finalizing.current || !currentQ || !transcript.trim() || topicAvailability(currentQ)) return;
    const context = activeContext.current;
    finalizing.current = true;
    setIsFinalizingTranscript(true);
    try {
      const [, captured] = await Promise.all([recording.stop(), stopAndReadTranscript()]);
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

  const missingContent = topicAvailability(currentQ);
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const mainInstruction = currentQ.main_instruction_fr || currentQ.main_instruction_en || "";
  const bullets = currentQ.topic_bullets_fr.length > 0 ? currentQ.topic_bullets_fr : currentQ.topic_bullets_en;

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
        <PracticeTwoPanel className="bg-neutral-50 dark:bg-slate-950 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-4 md:p-4">
          <section className="min-h-[420px] rounded-3xl border-2 border-neutral-300 bg-white px-6 py-5 dark:border-slate-700 dark:bg-slate-900 lg:min-h-[520px]">
            <h2 className="text-[22px] font-medium lg:text-2xl">OBJECTIVE</h2>
            <hr className="mb-5 mt-3 border-neutral-300 dark:border-slate-700" />
            <p className="text-xl font-normal leading-relaxed text-slate-600 dark:text-slate-300 lg:text-[21px]">{mainInstruction}</p>
            {bullets.length > 0 && <ul className="mt-8 list-disc space-y-3 pl-5 text-xl font-normal leading-relaxed text-slate-600 marker:text-slate-400 dark:text-slate-300 lg:text-[21px]">
              {bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}
            </ul>}
          </section>
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-6 py-8">
            {!evaluation ? <>
              <SpeakingRecordingControls recording={recording} startListening={startListening} resetTranscript={resetTranscript}
                disabled={showFeedback || busy || Boolean(missingContent) || (isExpired && !recording.isRecording)} />
              {(missingContent || error || recordingError) && <p role="alert" className="text-base text-red-600">{missingContent || error || recordingError}</p>}
            </> : <TopicFeedbackResult evaluation={evaluation} userText={submittedText} onContinue={handleContinue} />}
          </div>
        </PracticeTwoPanel>
      </PracticeGameLayout>
    </>
  );
}
