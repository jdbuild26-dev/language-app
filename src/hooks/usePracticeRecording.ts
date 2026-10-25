"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordingLevels } from "./recordingLevels";

/** Audio stays in memory and is discarded on reset or unmount. */
export function usePracticeRecording(limitSeconds: number, onStop: () => void) {
  const [isStarting, setIsStarting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(limitSeconds);
  const [error, setError] = useState<string | null>(null);
  const [soundLevel, setSoundLevel] = useState(0);
  const [frequencyBands, setFrequencyBands] = useState<number[]>([0, 0, 0, 0, 0]);
  const meter = useRef<{ context: AudioContext; source: MediaStreamAudioSourceNode; analyser: AnalyserNode; timer: ReturnType<typeof setInterval> } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const url = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const generation = useRef(0);
  const starting = useRef(false);
  const stopCallback = useRef(onStop);
  const stopPromise = useRef<Promise<void> | null>(null);
  const resolveStop = useRef<(() => void) | null>(null);

  useEffect(() => { stopCallback.current = onStop; }, [onStop]);

  const release = useCallback(() => {
    if (meter.current) {
      clearInterval(meter.current.timer);
      meter.current.source.disconnect();
      meter.current.analyser.disconnect();
      void meter.current.context.close().catch(() => {});
      meter.current = null;
    }
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
  }, []);

  const stop = useCallback((): Promise<void> => {
    const active = recorder.current;
    if (!active || active.state === "inactive") return stopPromise.current ?? Promise.resolve();
    if (stopPromise.current) return stopPromise.current;
    stopPromise.current = new Promise<void>(resolve => { resolveStop.current = resolve; });
    active.stop();
    stopCallback.current();
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    return stopPromise.current;
  }, []);

  const discard = useCallback(() => {
    generation.current += 1;
    starting.current = false;
    if (recorder.current) {
      recorder.current.ondataavailable = null;
      recorder.current.onstop = null;
      recorder.current.onerror = null;
      if (recorder.current.state !== "inactive") recorder.current.stop();
    }
    recorder.current = null;
    release();
    resolveStop.current?.();
    resolveStop.current = null;
    stopPromise.current = null;
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
  }, [release]);

  const reset = useCallback(() => {
    discard();
    setAudioUrl(null);
    setIsRecording(false);
    setIsStarting(false);
    setRemainingSeconds(limitSeconds);
    setError(null);
    setSoundLevel(0);
    setFrequencyBands([0, 0, 0, 0, 0]);
  }, [discard, limitSeconds]);

  const start = useCallback(async (): Promise<boolean> => {
    if (starting.current || recorder.current?.state === "recording") return false;
    reset();
    starting.current = true;
    setIsStarting(true);
    const request = generation.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Audio recording is not supported on this device.");
      }
      const capture = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (request !== generation.current) {
        capture.getTracks().forEach(track => track.stop());
        return false;
      }
      stream.current = capture;
      const active = new MediaRecorder(capture);
      recorder.current = active;
      const chunks: Blob[] = [];
      active.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      active.onstop = () => {
        release();
        if (request === generation.current) {
          const blob = new Blob(chunks, { type: active.mimeType || chunks[0]?.type || "audio/webm" });
          if (blob.size) {
            url.current = URL.createObjectURL(blob);
            setAudioUrl(url.current);
          }
          setIsRecording(false);
        }
        resolveStop.current?.();
        resolveStop.current = null;
        stopPromise.current = null;
      };
      active.onerror = () => {
        active.ondataavailable = null;
        active.onstop = null;
        active.onerror = null;
        if (active.state !== "inactive") active.stop();
        recorder.current = null;
        release();
        stopCallback.current();
        if (request === generation.current) {
          setError("Recording failed. Please record again.");
          setIsRecording(false);
        }
        resolveStop.current?.();
        resolveStop.current = null;
        stopPromise.current = null;
      };
      active.start();
      setIsRecording(true);
      // Meter the same stream being recorded; never send microphone audio to speakers.
      if (typeof AudioContext !== "undefined") {
        let context: AudioContext | null = null;
        try {
          context = new AudioContext();
          const source = context.createMediaStreamSource(capture);
          const analyser = context.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.7;
          source.connect(analyser);
          const wave = new Uint8Array(analyser.fftSize);
          const frequencies = new Uint8Array(analyser.frequencyBinCount);
          const meterTimer = setInterval(() => {
            if (active.state !== "recording" || request !== generation.current) return;
            analyser.getByteTimeDomainData(wave);
            analyser.getByteFrequencyData(frequencies);
            const levels = recordingLevels(wave, frequencies);
            setSoundLevel(levels.volume);
            setFrequencyBands(levels.bands);
          }, 80);
          meter.current = { context, source, analyser, timer: meterTimer };
          void context.resume().catch(() => {});
        } catch {
          void context?.close().catch(() => {});
          // Recording remains available if the device cannot provide a live meter.
        }
      }
      const deadline = Date.now() + limitSeconds * 1000;
      timer.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        setRemainingSeconds(remaining);
        if (!remaining) void stop();
      }, 200);
      return true;
    } catch (cause) {
      release();
      if (request === generation.current) {
        setError(cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Microphone access was denied. Allow access and try again."
          : cause instanceof Error ? cause.message : "Unable to start recording.");
      }
      return false;
    } finally {
      if (request === generation.current) { starting.current = false; setIsStarting(false); }
    }
  }, [limitSeconds, release, reset, stop]);

  useEffect(() => discard, [discard]);
  return { start, stop, reset, isStarting, isRecording, audioUrl, remainingSeconds, error, soundLevel, frequencyBands };
}
