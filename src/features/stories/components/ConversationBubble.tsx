"use client";

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
  onToggleExpanded: () => void;
  onSpeakLine: (index: number, text: string) => void;
  onToggleTranslation: () => void;
}

export function ConversationBubble({
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
        <div className={cn("rounded-xl border border-[#dbe5e7] px-3 py-3 transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out md:px-[clamp(0.75rem,1.2vw,1rem)] md:py-[clamp(0.75rem,1.1vw,0.875rem)]", isTranslationShown && "md:rounded-b-none", isExpanded && "scale-[1.01] shadow-[0_14px_34px_rgba(0,51,58,0.1)]", line.side === "right" ? "bg-[#f8fcfd]" : "bg-white", isActive && "scale-[1.025] border-[#30666e]", darkMode && "border-[#45474a] bg-[#272a2f]")}>
          <div className="mb-2 flex items-center justify-between gap-3 md:mb-3">
            <button onClick={onToggleExpanded} className="flex min-w-0 items-center gap-2 text-left transition-colors hover:text-[#54643b]">
              <span className={cn("h-2 w-2 shrink-0 rounded-full bg-[#30666e] transition-[transform,background-color] duration-150 ease-out", isActive && "scale-125 bg-[#00333a]")} />
              <span className="truncate text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#00333a]">{line.speaker || "Speaker"}</span>
              <span className="text-[11px] font-bold text-[#a4a79c]">{String(index + 1).padStart(2, "0")}</span>
            </button>
            <div className="flex shrink-0 items-center gap-1 text-[#9aaeb1]">
              <button onClick={() => onSpeakLine(index, line.text)} className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] hover:bg-[#e5f7fa] hover:text-[#00333a]", isActive && "bg-[#d9f4f8] text-[#00333a]")} aria-label={isActive ? "Stop line audio" : "Play line audio"}><Volume2 className="h-3.5 w-3.5" /></button>
              {line.translation && <button onClick={onToggleTranslation} className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] hover:bg-[#e5f7fa] hover:text-[#00333a]", isTranslationShown && "bg-[#e5f7fa] text-[#176b8f]")} aria-label={isTranslationShown ? "Hide line translation" : "Translate line"}><Languages className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
          <button onClick={onToggleExpanded} className="w-full text-left">
            <p className="story-conversation-copy text-sm leading-[1.5] text-[#1b1c1b] md:text-[clamp(0.875rem,1vw,1rem)] md:leading-6">{line.text}</p>
            {line.translation && isTranslationShown && <p className="story-conversation-copy story-translation-reveal mt-2 border-t border-[#dbe5e7] pt-2.5 text-sm italic leading-[1.5] text-[#176b8f] md:hidden">{line.translation}</p>}
          </button>
        </div>
        {line.translation && isTranslationShown && (
          <p className={cn("story-conversation-copy story-translation-reveal pointer-events-auto absolute left-0 top-full z-10 hidden max-h-28 w-full overflow-y-auto rounded-b-xl border-x border-b border-[#dbe5e7] px-[clamp(0.75rem,1.2vw,1rem)] py-3 text-[clamp(0.875rem,1vw,1rem)] italic leading-6 text-[#176b8f] md:block", line.side === "right" ? "bg-[#f8fcfd]" : "bg-white", darkMode && "border-[#45474a] bg-[#272a2f]")}>
            {line.translation}
          </p>
        )}
      </div>
    </article>
  );
}
