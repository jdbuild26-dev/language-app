"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import AudioRecorder from "@/features/ai-practice/components/AudioRecorder";
import { useLanguage } from "@/contexts/LanguageContext";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
  hi: "Hindi",
  es: "Spanish",
};

interface ChatInputProps {
  onSend: (text: string) => void;
  onHint?: () => Promise<string>;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { learningLang } = useLanguage();
  const [isMicActive, setIsMicActive] = useState(false);
  const [shouldStopMic, setShouldStopMic] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSend(message.trim());
    setMessage("");
    if (isMicActive) setShouldStopMic(true);
  };

  const handleManualTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (isMicActive) setShouldStopMic(true);
  };

  return (
    <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {/* Input Row */}
        <div className="flex items-center gap-2">
          <AudioRecorder
            onTranscriptChange={setMessage}
            onRecordingStateChange={(active) => {
              setIsMicActive(active);
              if (!active) setShouldStopMic(false);
            }}
            shouldStop={shouldStopMic}
            disabled={disabled}
          />

          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={handleManualTyping}
              placeholder={disabled ? "AI is thinking..." : `Type your message in ${LANGUAGE_NAMES[learningLang] || learningLang.toUpperCase()}...`}
              disabled={disabled}
              className={`flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />

            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className={`p-2.5 rounded-xl transition-colors ${
                message.trim() && !disabled
                  ? "bg-sky-500 hover:bg-sky-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed"
              }`}
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Action Menu button — removed, options moved to End Session modal */}
        </div>
      </div>
    </div>
  );
}
