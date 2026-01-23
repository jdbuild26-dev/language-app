import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

export default function AudioRecorder({ onRecordingComplete, disabled }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onRecordingComplete(blob);
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access denied or not available.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center gap-2">
            {isRecording ? (
                <button
                    onClick={stopRecording}
                    className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all animate-pulse shadow-lg"
                    title="Stop Recording"
                >
                    <Square className="w-5 h-5 fill-current" />
                </button>
            ) : (
                <button
                    onClick={startRecording}
                    disabled={disabled}
                    className={`p-3 rounded-full transition-all shadow-sm ${disabled
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
