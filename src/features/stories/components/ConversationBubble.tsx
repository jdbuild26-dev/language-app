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
    <article className="grid md:grid-cols-2 md:gap-8">
      <div className={cn("w-full max-w-[520px]", line.side === "right" ? "md:col-start-2 md:justify-self-end" : "md:col-start-1 md:justify-self-start")}>
        <div className={cn("rounded-xl border border-[#f0eeeb] px-4 py-3.5 transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out", isExpanded && "scale-[1.01] shadow-[0_14px_34px_rgba(120,113,108,0.1)]", line.side === "right" ? "bg-[#fbfaf7]" : "bg-white", isActive && "scale-[1.025] border-[#87986a]", darkMode && "border-[#45474a] bg-[#272a2f]")}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <button onClick={onToggleExpanded} className="flex min-w-0 items-center gap-2 text-left transition-colors hover:text-[#54643b]">
              <span className={cn("h-2 w-2 shrink-0 rounded-full bg-[#849967] transition-[transform,background-color] duration-150 ease-out", isActive && "scale-125 bg-[#54643b]")} />
              <span className="truncate text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#54643b]">{line.speaker || "Speaker"}</span>
              <span className="text-[11px] font-bold text-[#a4a79c]">{String(index + 1).padStart(2, "0")}</span>
            </button>
            <div className="flex shrink-0 items-center gap-1 text-[#b8b9b2]">
              <button onClick={() => onSpeakLine(index, line.text)} className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] hover:bg-[#f4f6ee] hover:text-[#54643b]", isActive && "bg-[#edf3e4] text-[#54643b]")} aria-label="Play line audio"><Volume2 className="h-3.5 w-3.5" /></button>
              <button onClick={onToggleTranslation} className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] hover:bg-[#f4f6ee] hover:text-[#54643b]" aria-label="Translate line"><Languages className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <button onClick={onToggleExpanded} className="w-full text-left">
            <p className="font-serif text-lg leading-7 text-[#1b1c1b]">{line.text}</p>
            {line.translation && isTranslationShown && <p className="mt-3 border-t border-[#dfe7d4] pt-3 text-base italic leading-7 text-[#54643b]">{line.translation}</p>}
          </button>
        </div>
      </div>
    </article>
  );
}
