"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  onTranscriptChange?: (transcript: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  disabled?: boolean;
  /** External signal to stop recording (e.g. after send) */
  shouldStop?: boolean;
}

export default function AudioRecorder({
  onRecordingComplete,
  onTranscriptChange,
  onRecordingStateChange,
  disabled,
  shouldStop,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Ref mirrors isRecording so effects/handlers always see the latest value
  const isRecordingRef = useRef(false);

  const { startListening, stopListening, transcript, resetTranscript } =
    useSpeechRecognition();

  // Only propagate transcript to parent while actively recording
  useEffect(() => {
    if (isRecordingRef.current && onTranscriptChange) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  // React to external stop signal (e.g. send button clicked)
  useEffect(() => {
    if (shouldStop && isRecordingRef.current) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete?.(blob);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();

      // Reset stale transcript before listening
      resetTranscript();
      isRecordingRef.current = true;
      setIsRecording(true);
      onRecordingStateChange?.(true);
      setRecordingTime(0);
      startListening();

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (!isRecordingRef.current) return;

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    stopListening();
    resetTranscript();

    isRecordingRef.current = false;
    setIsRecording(false);
    onRecordingStateChange?.(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <button
          onClick={stopRecording}
          className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all animate-pulse shadow-lg"
          title="Stop Recording"
        >
          <Square className="w-5 h-5 fill-current" />
        </button>
      ) : (
        <button
          onClick={startRecording}
          disabled={disabled}
          className={`p-2.5 rounded-xl transition-all shadow-sm ${
            disabled
              ? "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
              : "bg-sky-500 hover:bg-sky-600 text-white"
          }`}
          title="Start Recording"
        >
          <Mic className="w-5 h-5" />
        </button>
      )}

      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-mono animate-in fade-in slide-in-from-left-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {formatTime(recordingTime)}
        </div>
      )}
    </div>
  );
}
