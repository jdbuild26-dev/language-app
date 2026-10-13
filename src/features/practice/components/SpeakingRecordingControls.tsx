"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Volume2, Square } from "lucide-react";
import { usePracticeRecording } from "@/hooks/usePracticeRecording";

import RecordingActivity from "./RecordingActivity";

type Props = {
  recording: ReturnType<typeof usePracticeRecording>;
  startListening: () => void;
  resetTranscript: () => void;
  disabled: boolean;
};
export default function SpeakingRecordingControls({ recording, startListening, resetTranscript, disabled }: Props) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const player = audio.current; return () => { player?.pause(); }; }, [recording.audioUrl]);
  async function toggle() {
    setError(null);
    if (recording.isRecording) { await recording.stop(); return; }
    audio.current?.pause(); setPlaying(false); resetTranscript();
    if (await recording.start()) startListening();
  }
  async function replay() {
    const player = audio.current;
    if (!player) return;
    if (playing) { player.pause(); setPlaying(false); return; }
    player.currentTime = 0;
    try { await player.play(); setPlaying(true); }
    catch { setError("Unable to play this recording. Please try again."); }
  }
  return <div className="relative flex flex-col items-center gap-5">
    <div className="flex items-center gap-8">
      <button type="button" onClick={toggle} disabled={disabled || recording.isStarting}
        aria-label={recording.isRecording ? "Stop recording" : "Start recording"}
        style={recording.isRecording ? { boxShadow: "0 0 0 " + (4 + recording.soundLevel * 18) + "px rgb(59 130 246 / 18%)" } : undefined}
        className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-50">
        {recording.isStarting ? <Loader2 className="h-10 w-10 animate-spin" /> : recording.isRecording ? <Square className="h-10 w-10" fill="currentColor" /> : <Mic className="h-12 w-12" />}
      </button>
      <div className="relative flex items-center justify-center">
      <button type="button" onClick={replay} disabled={disabled || !recording.audioUrl || recording.isRecording || recording.isStarting}
        aria-label={playing ? "Stop replay" : "Replay your recording"}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-neutral-300">
        {playing ? <Square className="h-7 w-7" fill="currentColor" /> : <Volume2 className="h-8 w-8" />}
      </button>
      </div>
    </div>
    <div className="flex h-28 flex-col items-center gap-3">
      {recording.isRecording && <RecordingActivity level={recording.soundLevel} bands={recording.frequencyBands} />}
      {recording.isRecording && <p className="text-base text-slate-500" aria-live="polite">{recording.remainingSeconds}s remaining</p>}
    </div>
    {(error || recording.error) && <p role="alert" className="absolute top-full mt-3 text-center text-base text-red-600">{error || recording.error}</p>}
    {recording.audioUrl && <audio ref={audio} src={recording.audioUrl} onEnded={() => setPlaying(false)} onError={() => { setPlaying(false); setError("Unable to play this recording."); }} />}
  </div>;
}
