"use client";

import { memo } from "react";
import { Languages, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoryLine } from "../types";

interface ConversationBubbleProps {
  line: StoryLine;
  index: number;
  darkMode: boolean;
  isActive: boolean;
  isExpanded: boolean;
  isTranslationShown: boolean;
  onToggleExpanded: (index: number) => void;
  onSpeakLine: (index: number, text: string) => void;
  onToggleTranslation: (index: number) => void;
}

export const ConversationBubble = memo(function ConversationBubble({
  line,
  index,
  darkMode,
  isActive,
  isExpanded,
  isTranslationShown,
  onToggleExpanded,
  onSpeakLine,
  onToggleTranslation,
}: ConversationBubbleProps) {
  return (
    <article className={cn("flex w-full md:grid md:grid-cols-2 md:gap-8", line.side === "right" ? "justify-end" : "justify-start")}>
      <div className={cn("relative w-[86%] max-w-[520px] md:w-full", line.side === "right" ? "md:col-start-2 md:justify-self-end" : "md:col-start-1 md:justify-self-start")}>
        <div className={cn("rounded-xl border border-[#dbe5e7] px-3 py-3 transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out md:px-[clamp(0.75rem,1.2vw,1rem)] md:py-[clamp(0.75rem,1.1vw,0.875rem)]", isTranslationShown && line.translation && "rounded-b-none border-b-0", isExpanded && "scale-[1.01] shadow-[0_14px_34px_rgba(0,51,58,0.1)]", line.side === "right" ? "bg-[#f8fcfd]" : "bg-white", isActive && "scale-[1.025] border-[#30666e]", darkMode && "border-[#45474a] bg-[#272a2f]")}>
          <div className="mb-2 flex items-center justify-between gap-3 md:mb-3">
            <button onClick={() => onToggleExpanded(index)} className="flex min-w-0 items-center gap-2 text-left transition-colors hover:text-[#54643b]">
              <span className={cn("h-2 w-2 shrink-0 rounded-full bg-[#30666e] transition-[transform,background-color] duration-150 ease-out", isActive && "scale-125 bg-[#22c55e]")} />
              <span className={cn("truncate text-[11px] font-extrabold uppercase tracking-[0.1em]", darkMode ? "text-[#baf5fd]" : "text-[#00333a]")}>{line.speaker || "Speaker"}</span>
              <span className={cn("text-[11px] font-bold", darkMode ? "text-[#92a1a5]" : "text-[#a4a79c]")}>{String(index + 1).padStart(2, "0")}</span>
            </button>
            <div className={cn("flex shrink-0 items-center gap-1", darkMode ? "text-[#aebfc3]" : "text-[#9aaeb1]")}>
              <button onClick={() => onSpeakLine(index, line.text)} className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96]", darkMode ? "hover:bg-[#314147] hover:text-[#baf5fd]" : "hover:bg-[#e5f7fa] hover:text-[#00333a]", isActive && (darkMode ? "bg-[#314147] text-[#baf5fd]" : "bg-[#d9f4f8] text-[#00333a]"))} aria-label={isActive ? "Stop line audio" : "Play line audio"}><Volume2 className="h-3.5 w-3.5" /></button>
              {line.translation && <button onClick={() => onToggleTranslation(index)} className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96]", darkMode ? "hover:bg-[#314147] hover:text-[#baf5fd]" : "hover:bg-[#e5f7fa] hover:text-[#00333a]", isTranslationShown && (darkMode ? "bg-[#314147] text-[#9cf1fc]" : "bg-[#e5f7fa] text-[#176b8f]"))} aria-label={isTranslationShown ? "Hide line translation" : "Translate line"}><Languages className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
          <button onClick={() => onToggleExpanded(index)} className="w-full text-left">
            <p className={cn("story-conversation-copy text-[0.9375rem] leading-6 md:text-base", darkMode ? "text-[#edf5f6]" : "text-[#1b1c1b]")}>{line.text}</p>
          </button>
        </div>
        {line.translation && isTranslationShown && (
          <div className={cn("story-conversation-translation-popover absolute inset-x-0 top-full z-20 rounded-b-xl border border-t-0 border-[#dbe5e7] bg-[#f8fcfd] px-3 pb-3 pt-2.5 shadow-[0_12px_24px_rgba(0,51,58,0.1)] md:px-[clamp(0.75rem,1.2vw,1rem)] md:pb-[clamp(0.75rem,1.1vw,0.875rem)]", darkMode && "border-[#45474a] bg-[#272a2f]")}>
            <p className={cn("story-conversation-copy text-sm italic leading-6 md:text-[0.9375rem]", darkMode ? "text-[#9cf1fc]" : "text-[#176b8f]")}>{line.translation}</p>
          </div>
        )}
      </div>
    </article>
  );
});
