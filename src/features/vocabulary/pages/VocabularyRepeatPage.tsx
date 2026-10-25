"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic, RotateCcw, Square } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { fetchRepeatSentenceData, fetchVocabulary } from "@/services/vocabularyApi";
import { calculateSimilarity } from "@/utils/textComparison";
import { useTranslateText } from "@/hooks/useTranslateText";

type Question = { id: string; french: string; english: string; limit: number };
type SpeechEvent = { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: SpeechEvent) => void) | null; onend: (() => void) | null; onerror: ((event: { error: string }) => void) | null; start: () => void; stop: () => void };
type Capture = { status: "unavailable" | "listening" | "finished" | "error"; text: string; hasInterim: boolean };

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
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [remaining, setRemaining] = useState(60);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [playing, setPlaying] = useState(false);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef("");
  const generation = useRef(0);
  const capture = useRef<Capture>({ status: "unavailable", text: "", hasInterim: false });
  const evaluated = useRef(false);

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

  const release = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  };
  const discard = () => {
    generation.current += 1;
    capture.current = { status: "unavailable", text: "", hasInterim: false };
    evaluated.current = false;
    recognition.current?.stop();
    recognition.current = null;
    if (recorder.current?.state === "recording") recorder.current.stop();
    recorder.current = null;
    release();
    audio.current?.pause();
    setPlaying(false);
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = "";
    setAudioUrl("");
    setRecording(false);
  };
  useEffect(() => () => {
    generation.current += 1;
    recognition.current?.stop();
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
    if (timer.current) clearInterval(timer.current);
    audio.current?.pause();
    if (url.current) URL.revokeObjectURL(url.current);
  }, []);

  const stop = () => {
    if (recorder.current?.state === "recording") recorder.current.stop();
    try { recognition.current?.stop(); }
    catch { capture.current.status = "error"; }
    release();
    setRecording(false);
  };

  const start = async () => {
    if (!question || starting) return;
    discard();
    setError("");
    setTranscript("");
    setFeedback(null);
    translation.reset();
    setStarting(true);
    const request = generation.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Recording is unavailable on this device.");
      const recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (request !== generation.current) { recordingStream.getTracks().forEach((track) => track.stop()); return; }
      stream.current = recordingStream;
      const media = new MediaRecorder(recordingStream);
      recorder.current = media;
      const chunks: Blob[] = [];
      media.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      media.onstop = () => {
        release();
        if (request !== generation.current) return;
        const blob = new Blob(chunks, { type: media.mimeType || "audio/webm" });
        if (blob.size) { url.current = URL.createObjectURL(blob); setAudioUrl(url.current); }
        setRecording(false);
      };
      media.start();
      const browserWindow = window as typeof window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
      const SpeechRecognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const speech = new SpeechRecognition();
          speech.lang = "fr-FR";
          speech.continuous = true;
          speech.interimResults = true;
          capture.current.status = "listening";
          speech.onresult = (event) => {
            if (request !== generation.current || capture.current.status === "error") return;
            const results = Array.from(event.results);
            capture.current.text = results.filter(result => result.isFinal).map(result => result[0]?.transcript || "").join(" ").trim();
            capture.current.hasInterim = results.some(result => !result.isFinal);
            setTranscript(results.map(result => result[0]?.transcript || "").join(" ").trim());
          };
          speech.onerror = () => {
            if (request === generation.current) capture.current.status = "error";
          };
          speech.onend = () => {
            if (request !== generation.current || capture.current.status === "error") return;
            capture.current.status = capture.current.text && !capture.current.hasInterim ? "finished" : "error";
          };
          recognition.current = speech;
          speech.start();
        } catch { capture.current.status = "error"; /* Recorded audio remains available for replay. */ }
      }
      setRecording(true);
      const limit = question.limit;
      setRemaining(limit);
      const deadline = Date.now() + limit * 1000;
      timer.current = setInterval(() => {
        const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        setRemaining(left);
        if (left === 0) stop();
      }, 250);
    } catch (cause) {
      release();
      setError(cause instanceof Error ? cause.message : "Unable to start recording.");
    } finally { setStarting(false); }
  };

  const replay = async () => {
    if (!audio.current) return;
    if (playing) { audio.current.pause(); audio.current.currentTime = 0; setPlaying(false); return; }
    audio.current.currentTime = 0;
    try { await audio.current.play(); setPlaying(true); }
    catch { setError("Unable to play this recording."); }
  };

  const submit = () => {
    if (!question || !audioUrl || recording || feedback || evaluated.current) return;
    if (capture.current.status !== "finished" || !capture.current.text) {
      setError(capture.current.status === "listening"
        ? "Speech capture is still finishing. Try submitting again."
        : "Speech could not be evaluated. This recording has not been scored.");
      return;
    }
    try {
      const similarity = calculateSimilarity(capture.current.text, question.french);
      if (!Number.isFinite(similarity)) throw new Error("Evaluation failed");
      const correct = similarity >= (mode === "word" ? 0.7 : 0.75);
      evaluated.current = true;
      setError("");
      setFeedback(correct ? "correct" : "incorrect");
      if (correct) setScore((value) => value + 1);
    } catch { setError("Speech evaluation failed. This recording has not been scored. Try submitting again."); }
  };
  const next = () => {
    discard();
    setError("");
    setTranscript("");
    setFeedback(null);
    translation.reset();
    setRemaining(questions[index + 1]?.limit || 60);
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
    isSubmitEnabled={Boolean(audioUrl) && !recording}
    submitLabel={feedback ? index + 1 === questions.length ? "Finish" : "Continue" : "Submit"}
    showFeedback={Boolean(feedback)}
    preserveFooterHeightOnFeedback
    isCorrect={feedback === "correct"}
    feedbackMessage={feedback === "correct" ? "Well done" : transcript ? "Try again" : "Speech could not be evaluated"}
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
        <button type="button" onClick={recording ? stop : start} disabled={starting || Boolean(feedback)} aria-label={recording ? "Stop recording" : "Start recording"} className="col-start-2 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300">
          {starting ? <Loader2 className="h-8 w-8 animate-spin" /> : recording ? <Square className="h-8 w-8" fill="currentColor" /> : <Mic className="h-9 w-9" />}
        </button>
        <button type="button" onClick={replay} disabled={!audioUrl || recording} aria-label={playing ? "Stop replay" : "Replay your recording"} className="col-start-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-400 text-white disabled:bg-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300">
          {playing ? <Square className="h-6 w-6" fill="currentColor" /> : <RotateCcw className="h-7 w-7" />}
        </button>
      </div>
      <div className="practice-type-feedback min-h-24 w-full space-y-2">
        {recording && <p aria-live="polite" className="text-slate-600 dark:text-slate-300">Recording stops in {remaining} seconds</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {feedback && transcript && <p className="text-slate-600 dark:text-slate-300">You said: {transcript}</p>}
        {feedback && translation.error && <p role="status" className="text-red-700 dark:text-red-400">{translation.error}</p>}
      </div>
      {audioUrl && <audio ref={audio} src={audioUrl} onEnded={() => setPlaying(false)} />}
    </div>
  </PracticeGameLayout>;
}
