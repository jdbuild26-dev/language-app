"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic, RotateCcw, Square } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { fetchRepeatSentenceData, fetchVocabulary } from "@/services/vocabularyApi";
import { calculateSimilarity } from "@/utils/textComparison";
import { useTranslateText } from "@/hooks/useTranslateText";
import { usePracticeRecording } from "@/hooks/usePracticeRecording";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";

type Question = { id: string; french: string; english: string; limit: number };

function recordingLimit(value: unknown) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? Math.min(300, Math.max(5, seconds)) : 60;
}

export default function VocabularyRepeatPage({ mode }: { mode: "word" | "sentence" }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const generation = useRef(0);
  const evaluated = useRef(false);
  const submitting = useRef(false);
  const speech = useSpeechRecognition("fr");
  const recording = usePracticeRecording(questions[index]?.limit || 60, speech.stopListening);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (mode === "word") {
          const response = await fetchVocabulary({ limit: 100 });
          const words = (response.words || []) as Array<{ id: string; english: string; forms: Array<{ word: string }> }>;
          const mapped = words.filter((word) => word.forms?.[0]?.word).map((word) => ({ id: word.id, french: word.forms[0].word, english: word.english || "", limit: 60 }));
          if (active) setQuestions(mapped.sort(() => Math.random() - 0.5).slice(0, 20));
        } else {
          const response = await fetchRepeatSentenceData(undefined);
          const rows = (Array.isArray(response) ? response : response.data || []) as Array<Record<string, unknown>>;
          const mapped = rows.map((row) => ({
            id: String(row.id || row.ExerciseID || ""),
            french: String(row.completeSentence || row.CompleteSentence || row.Sentence || ""),
            english: String(row.completeSentenceEn || row.CompleteSentence_EN || row.Sentence_EN || ""),
            limit: recordingLimit(row.recordingLimitSeconds || row.RecordingLimitSeconds || row.timeLimit),
          })).filter((row) => row.french);
          if (active) setQuestions(mapped);
        }
      } catch {
        if (active) setError("Unable to load speaking questions.");
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [mode]);

  const question = questions[index];
  const translation = useTranslateText(question?.french || "", "fr", question?.english);

  const discard = () => {
    generation.current += 1;
    evaluated.current = false;
    submitting.current = false;
    speech.resetTranscript();
    recording.reset();
    audio.current?.pause();
    setPlaying(false);
  };

  const start = async () => {
    if (!question || recording.isStarting) return;
    discard();
    setError("");
    setFinalTranscript("");
    setFeedback(null);
    translation.reset();
    const request = generation.current;
    if (await recording.start() && request === generation.current) speech.startListening();
  };

  const replay = async () => {
    if (!audio.current) return;
    if (playing) { audio.current.pause(); audio.current.currentTime = 0; setPlaying(false); return; }
    audio.current.currentTime = 0;
    try { await audio.current.play(); setPlaying(true); }
    catch { setError("Unable to play this recording."); }
  };

  const submit = async () => {
    if (!question || !recording.audioUrl || recording.isRecording || feedback || evaluated.current || submitting.current) return;
    submitting.current = true;
    const request = generation.current;
    try {
      const capturedText = (await speech.stopAndReadTranscript()).trim();
      if (request !== generation.current) return;
      if (!capturedText) throw new Error("Speech could not be evaluated. This recording has not been scored.");
      const similarity = calculateSimilarity(capturedText, question.french);
      if (!Number.isFinite(similarity)) throw new Error("Evaluation failed");
      const correct = similarity >= (mode === "word" ? 0.7 : 0.75);
      evaluated.current = true;
      setError("");
      setFinalTranscript(capturedText);
      setFeedback(correct ? "correct" : "incorrect");
      if (correct) setScore((value) => value + 1);
    } catch (cause) {
      if (request === generation.current) setError(cause instanceof Error ? cause.message : "Speech evaluation failed. This recording has not been scored.");
    } finally { submitting.current = false; }
  };
  const next = () => {
    discard();
    setError("");
    setFinalTranscript("");
    setFeedback(null);
    translation.reset();
    if (index + 1 < questions.length) setIndex((value) => value + 1);
    else setComplete(true);
  };

  if (loading) return <div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!questions.length) return <div role="alert" className="flex min-h-dvh items-center justify-center p-8 text-center">{error || "No speaking questions are available."}</div>;

  return <PracticeGameLayout
    questionType={mode === "word" ? "Repeat Word" : "Repeat Sentence"}
    instructionFr={mode === "word" ? "Répétez le mot" : "Répétez la phrase"}
    instructionEn={mode === "word" ? "Repeat the word" : "Repeat the sentence"}
    showInstructionTranslateButton={Boolean(feedback)}
    progress={((index + 1) / questions.length) * 100}
    isGameOver={complete}
    score={score}
    totalQuestions={questions.length}
    onExit={() => { discard(); router.push("/vocabulary/practice"); }}
    onNext={feedback ? next : submit}
    onRestart={() => window.location.reload()}
    isSubmitEnabled={Boolean(recording.audioUrl) && !recording.isRecording}
    submitLabel={feedback ? index + 1 === questions.length ? "Finish" : "Continue" : "Submit"}
    showFeedback={Boolean(feedback)}
    preserveFooterHeightOnFeedback
    isCorrect={feedback === "correct"}
    feedbackMessage={feedback === "correct" ? "Well done" : finalTranscript ? "Try again" : "Speech could not be evaluated"}
    correctAnswer={feedback === "incorrect" ? question.french : null}
  >
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-8 text-center">
      <div className="practice-type-content-large flex w-full justify-center px-14 font-medium text-slate-900 dark:text-slate-100">
        <div className="min-w-0 max-w-full">
          <span className="block break-words" lang={feedback && translation.showTranslation || mode === "sentence" && !feedback && question.english ? "en" : "fr"}>{feedback ? translation.displayText : mode === "sentence" && question.english ? question.english : question.french}</span>
        </div>
      </div>
      <div className="grid grid-cols-[3.5rem_5rem_3.5rem] items-center gap-6">
        {feedback && <TranslateButton className="col-start-1 h-11 w-11 justify-self-center [&_svg]:h-6 [&_svg]:w-6" aria-label={translation.showTranslation ? "Show French" : "Show English"} aria-pressed={translation.showTranslation} isLoading={translation.isTranslating} onClick={translation.toggle} />}
        <button type="button" onClick={recording.isRecording ? () => void recording.stop() : start} disabled={recording.isStarting || Boolean(feedback)} aria-label={recording.isRecording ? "Stop recording" : "Start recording"} className="col-start-2 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300">
          {recording.isStarting ? <Loader2 className="h-8 w-8 animate-spin" /> : recording.isRecording ? <Square className="h-8 w-8" fill="currentColor" /> : <Mic className="h-9 w-9" />}
        </button>
        <button type="button" onClick={replay} disabled={!recording.audioUrl || recording.isRecording} aria-label={playing ? "Stop replay" : "Replay your recording"} className="col-start-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-400 text-white disabled:bg-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300">
          {playing ? <Square className="h-6 w-6" fill="currentColor" /> : <RotateCcw className="h-7 w-7" />}
        </button>
      </div>
      <div className="practice-type-feedback min-h-24 w-full space-y-2">
        {recording.isRecording && <p aria-live="polite" className="text-slate-600 dark:text-slate-300">Recording stops in {recording.remainingSeconds} seconds</p>}
        {(error || recording.error) && <p role="alert" className="text-red-700">{error || recording.error}</p>}
        {feedback && finalTranscript && <p className="text-slate-600 dark:text-slate-300">You said: {finalTranscript}</p>}
        {feedback && translation.error && <p role="status" className="text-red-700 dark:text-red-400">{translation.error}</p>}
      </div>
      {recording.audioUrl && <audio ref={audio} src={recording.audioUrl} onEnded={() => setPlaying(false)} />}
    </div>
  </PracticeGameLayout>;
}
