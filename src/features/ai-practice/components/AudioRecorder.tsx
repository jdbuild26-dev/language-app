"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";

interface AudioRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  disabled?: boolean;
  shouldStop?: boolean;
}

/**
 * A simplified Voice-to-Text trigger.
 * Removed MediaRecorder (blobs) as the app only uses text transcripts.
 */
export default function AudioRecorder({
  onTranscriptChange,
  onRecordingStateChange,
  disabled,
  shouldStop,
}: AudioRecorderProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { 
    startListening, 
    stopListening, 
    transcript, 
    isListening, 
    resetTranscript 
  } = useSpeechRecognition();

  // Sync internal listening state with parent
  useEffect(() => {
    onRecordingStateChange?.(isListening);
    
    if (isListening) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening, onRecordingStateChange]);

  // Propagate transcript changes while active
  useEffect(() => {
    if (isListening) {
      onTranscriptChange(transcript);
    }
  }, [transcript, isListening, onTranscriptChange]);

  // Handle external stop signal (e.g. from Send button or manual typing)
  useEffect(() => {
    if (shouldStop && isListening) {
      stopListening();
    }
  }, [shouldStop, isListening, stopListening]);

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled}
        className={`p-2.5 rounded-xl transition-all shadow-sm ${
          isListening
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
            : disabled
            ? "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
            : "bg-sky-500 hover:bg-sky-600 text-white"
        }`}
        title={isListening ? "Stop Recording" : "Start Recording"}
      >
        {isListening ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
      </button>

      {isListening && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-mono animate-in fade-in slide-in-from-left-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {formatTime(recordingTime)}
        </div>
      )}
    </div>
  );
}
