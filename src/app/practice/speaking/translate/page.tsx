"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Loader2, Mic, Volume2, Square } from "lucide-react";
import { useSearchParams } from "next/navigation";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { usePracticeRecording } from "@/hooks/usePracticeRecording";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { fetchPracticeData } from "@/utils/practiceFetcher";

import RecordingActivity from "@/features/practice/components/RecordingActivity";

type Question = { sentence: string; answer: string; level: string };
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
function question(value: unknown): Question {
  const item = record(value);
  const content = { ...record(item.content), ...item };
  return {
    sentence: String(content.Sentence ?? content.sentence ?? content.sourceText ?? content.Question ?? ""),
    answer: String(content.Translation ?? content.translation ?? content.correctAnswer ?? content.Answer ?? ""),
    level: String(content.Level ?? content.level ?? "A1"),
  };
}

export default function TranslateBySpeakingPage() {
  return <Suspense fallback={<Loader2 className="m-auto animate-spin" />}><TranslateBySpeakingContent /></Suspense>;
}

function TranslateBySpeakingContent() {
  const exit = usePracticeExit();
  const params = useSearchParams();
  const tag = params?.get("tag") ?? undefined;
  const level = params?.get("level") ?? undefined;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<{ transcript: string; correct: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const request = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const speech = useSpeechRecognition();
  const current = questions[index];
  const recording = usePracticeRecording(60, speech.stopListening);
  const timer = useExerciseTimer({ duration: 360, mode: "timer", isPaused: loading || finished || submitting || Boolean(feedback), onExpire: () => { void recording.stop(); } });

  useEffect(() => {
    let cancelled = false;
    fetchPracticeData("speak_translate", { tag, level }).then((data: unknown[]) => {
      if (!cancelled) setQuestions(data.map(question).filter(item => item.sentence && item.answer));
    }).catch(() => { if (!cancelled) setMessage("Unable to load this exercise."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tag, level]);
  useEffect(() => () => { request.current?.abort(); audio.current?.pause(); }, []);

  async function toggleRecording() {
    if (busy.current || feedback || recording.isStarting) return;
    setMessage(null);
    if (recording.isRecording) {
      try { await Promise.all([recording.stop(), speech.stopAndReadTranscript()]); }
      catch (error) { setMessage(error instanceof Error ? error.message : "Please record again."); }
      return;
    }
    audio.current?.pause(); setPlaying(false);
    speech.resetTranscript();
    if (await recording.start()) speech.startListening();
  }
  async function replay() {
    const player = audio.current;
    if (!player) return;
    if (playing) { player.pause(); setPlaying(false); return; }
    player.currentTime = 0;
    try { await player.play(); setPlaying(true); }
    catch { setMessage("Unable to play this recording. Please try again."); }
  }
  async function submit() {
    if (busy.current || !current) return;
    busy.current = true; setSubmitting(true); setMessage(null);
    const controller = new AbortController(); request.current = controller;
    try {
      const [, transcript] = await Promise.all([recording.stop(), speech.stopAndReadTranscript()]);
      if (!transcript.trim()) throw new Error("Record your translation before submitting.");
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/practice/evaluate-speaking", {
        method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_type: "translate", transcript, reference: current.answer,
          context: 'Translate the English sentence: "' + current.sentence + '" into spoken French.', level: current.level }),
      });
      if (!response.ok) throw new Error("Unable to check your answer. Please try again.");
      const result = record(await response.json());
      if (typeof result.overall_score !== "number" && typeof result.is_correct !== "boolean") throw new Error("Unable to check your answer. Please try again.");
      const correct = typeof result.overall_score === "number" ? result.overall_score >= 70 : result.is_correct === true;
      if (!controller.signal.aborted) { setFeedback({ transcript, correct }); if (correct) setScore(value => value + 1); }
    } catch (error) {
      if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Unable to check your answer.");
    } finally { if (!controller.signal.aborted) { busy.current = false; setSubmitting(false); } }
  }
  function next() {
    audio.current?.pause(); setPlaying(false);
    recording.reset(); speech.stopListening(); speech.resetTranscript(); setFeedback(null); setMessage(null);
    if (index + 1 < questions.length) { setIndex(value => value + 1); timer.resetTimer(); }
    else setFinished(true);
  }
  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (!current) return <div className="flex min-h-screen flex-col items-center justify-center gap-4"><p>{message || "No content available."}</p><button onClick={exit}>Back</button></div>;
  return <PracticeGameLayout questionType="Translate by Speaking" instructionFr="Traduisez la phrase en français" instructionEn="Translate the sentence into French"
    progress={(index + 1) / questions.length * 100} currentQuestionIndex={index} totalQuestions={questions.length}
    score={score} isGameOver={finished} timerValue={timer.timerString} onExit={exit} onRestart={() => window.location.reload()}
    onNext={feedback ? next : submit} showSubmitButton isSubmitEnabled={Boolean(feedback) || (Boolean(speech.transcript.trim()) && !submitting && !recording.isStarting)}
    submitLabel={feedback ? "Continue" : submitting ? "Checking…" : "Submit Answer"}>
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-16 text-center lg:py-20">
      <p className="text-2xl font-medium leading-relaxed lg:text-3xl">{current.sentence}</p>
      {feedback && <>
        <p className="mt-3 text-2xl font-medium leading-relaxed text-green-600 lg:text-3xl">{current.answer}</p>
        <hr className="my-12 w-full border-neutral-300" />
        <p className={"text-2xl leading-relaxed lg:text-3xl " + (feedback.correct ? "text-green-600" : "text-red-600")}>{feedback.transcript}</p>
      </>}
      <div className={"flex items-center justify-center gap-8 " + (feedback ? "mt-10" : "mt-24")}>
        {!feedback && <button type="button" onClick={toggleRecording} disabled={submitting || recording.isStarting || timer.isExpired}
          aria-label={recording.isRecording ? "Stop recording" : "Record your translation"}
          style={recording.isRecording ? { boxShadow: "0 0 0 " + (4 + recording.soundLevel * 18) + "px rgb(59 130 246 / 18%)" } : undefined}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-50">
          {recording.isStarting ? <Loader2 className="h-10 w-10 animate-spin" /> : recording.isRecording ? <Square className="h-10 w-10" fill="currentColor" /> : <Mic className="h-12 w-12" />}
        </button>}
        <div className="relative flex items-center justify-center">
        <button type="button" onClick={replay} disabled={!recording.audioUrl || recording.isRecording || submitting} aria-label={playing ? "Stop replay" : "Replay your recording"}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-neutral-300">
          {playing ? <Square className="h-7 w-7" fill="currentColor" /> : <Volume2 className="h-8 w-8" />}
      </button>
      </div>
      </div>
      {!feedback && <div className="mt-6 h-14">{recording.isRecording && <RecordingActivity level={recording.soundLevel} bands={recording.frequencyBands} />}</div>}
      {!feedback && <p className="mt-5 text-base text-slate-500" aria-live="polite">{recording.isRecording ? recording.remainingSeconds + "s remaining" : "Recording limit: 60s"}</p>}
      {(message || recording.error || speech.error) && <p role="alert" className="mt-6 text-base text-red-600">{message || recording.error || speech.error}</p>}
      {recording.audioUrl && <audio ref={audio} src={recording.audioUrl} onEnded={() => setPlaying(false)} onError={() => { setPlaying(false); setMessage("Unable to play this recording."); }} />}
    </div>
  </PracticeGameLayout>;
}
