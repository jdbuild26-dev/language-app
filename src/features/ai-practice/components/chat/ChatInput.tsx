"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Lightbulb, MoreVertical, BarChart2, FileDown, LogOut } from "lucide-react";
import AudioRecorder from "@/features/ai-practice/components/AudioRecorder";

interface ChatInputProps {
  onSend: (text: string) => void;
  onHint: () => Promise<string>;
  disabled?: boolean;
  onGetFeedback?: () => void;
  onDownloadTranscript?: () => void;
  onEndWithoutFeedback?: () => void;
  isLoadingReport?: boolean;
}

export default function ChatInput({
  onSend,
  onHint,
  disabled = false,
  onGetFeedback,
  onDownloadTranscript,
  onEndWithoutFeedback,
  isLoadingReport = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState("");
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  // Close menu on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMenu(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend?.(message);
      setMessage("");
    }
  };

  const handleHintClick = async () => {
    if (!showHint) {
      setIsLoadingHint(true);
      try {
        const hint = await onHint?.();
        setHintText(hint || "Je ne sais pas quoi dire...");
      } catch {
        setHintText("Je ne sais pas quoi dire...");
      } finally {
        setIsLoadingHint(false);
      }
    }
    setShowHint(!showHint);
  };

  const useHint = () => {
    setMessage(hintText);
    setShowHint(false);
  };

  const handleMenuAction = (action: () => void) => {
    setShowMenu(false);
    action();
  };

  return (
    <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {/* Hint Panel */}
        {showHint && (
          <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1">
                    Hint
                  </span>
                  {isLoadingHint ? (
                    <p className="text-sm text-amber-600 dark:text-amber-400 italic">
                      Generating hint...
                    </p>
                  ) : (
                    <p className="text-sm text-amber-800 dark:text-amber-300">{hintText}</p>
                  )}
                </div>
              </div>
              {!isLoadingHint && hintText && (
                <button
                  onClick={useHint}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                >
                  Use
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input Row */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Hint Button */}
          <button
            type="button"
            onClick={handleHintClick}
            className={`p-2.5 rounded-xl transition-colors ${
              showHint
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
            title="Get a hint"
          >
            <Lightbulb className="w-5 h-5" />
          </button>

          {/* Audio Recorder */}
          <AudioRecorder
            onRecordingComplete={(blob) => {
              console.log("Audio recorded:", blob);
            }}
            onTranscriptChange={(transcript) => {
              if (transcript) setMessage(transcript);
            }}
            disabled={disabled}
          />

          {/* Text Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={disabled ? "AI is thinking..." : "Type your message in French..."}
            disabled={disabled}
            className={`flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />

          {/* Send Button */}
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

          {/* 3-Dot Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu((v) => !v)}
              className={`p-2.5 rounded-xl transition-colors ${
                showMenu
                  ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
              title="More options"
              aria-haspopup="true"
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Popup Menu */}
            {showMenu && (
              <div
                className="absolute bottom-full right-0 mb-2 w-64 flex flex-col gap-2 p-2
                  bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                  rounded-2xl shadow-xl
                  animate-in slide-in-from-bottom-2 fade-in duration-150"
              >
                {/* Get feedback report */}
                <button
                  type="button"
                  onClick={() => handleMenuAction(onGetFeedback ?? (() => {}))}
                  disabled={isLoadingReport}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                    bg-sky-500 hover:bg-sky-600 active:bg-sky-700
                    text-white font-medium text-sm transition-colors
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <BarChart2 className="w-4 h-4 shrink-0" />
                  {isLoadingReport ? "Generating report..." : "Get my feedback report"}
                </button>

                {/* Download transcript */}
                <button
                  type="button"
                  onClick={() => handleMenuAction(onDownloadTranscript ?? (() => {}))}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                    bg-sky-700 hover:bg-sky-800 active:bg-sky-900
                    text-white font-medium text-sm transition-colors"
                >
                  <FileDown className="w-4 h-4 shrink-0" />
                  Download transcript (PDF)
                </button>

                {/* Divider */}
                <div className="h-px bg-gray-200 dark:bg-slate-700 mx-1" />

                {/* End without feedback */}
                <button
                  type="button"
                  onClick={() => handleMenuAction(onEndWithoutFeedback ?? (() => {}))}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                    bg-slate-700 hover:bg-slate-800 active:bg-slate-900
                    text-white font-medium text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  End the chat without feedback
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
