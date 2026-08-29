"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Languages, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationBubble } from "./ConversationBubble";
import { StoryDisplayData } from "../types";

interface StoryReadingViewProps {
  story: StoryDisplayData;
  darkMode: boolean;
  activeAudioIndex: number | null;
  onSpeakLine: (index: number, text: string) => void;
  revealSequenceActive: boolean;
  revealRunId: number;
}

export function StoryReadingView({
  story,
  darkMode,
  activeAudioIndex,
  onSpeakLine,
  revealSequenceActive,
  revealRunId,
}: StoryReadingViewProps) {
  const [expandedLine, setExpandedLine] = useState<number | null>(null);
  const [shownTranslations, setShownTranslations] = useState<Record<number, boolean>>({});
  const [shownMonologueTranslations, setShownMonologueTranslations] = useState<Record<number, boolean>>({});
  const [revealedThrough, setRevealedThrough] = useState(-1);
  const onSpeakLineRef = useRef(onSpeakLine);
  const hasDialogue = story.lines.some((line) => line.text);

  useEffect(() => {
    onSpeakLineRef.current = onSpeakLine;
  }, [onSpeakLine]);

  const handleToggleExpanded = useCallback((index: number) => {
    setExpandedLine((value) => value === index ? null : index);
  }, []);
  const handleToggleTranslation = useCallback((index: number) => {
    setShownTranslations((current) => ({ ...current, [index]: !current[index] }));
  }, []);
  const handleSpeakLine = useCallback((index: number, text: string) => {
    onSpeakLineRef.current(index, text);
  }, []);

  useEffect(() => {
    if (activeAudioIndex !== null) setExpandedLine(activeAudioIndex);
  }, [activeAudioIndex]);

  useEffect(() => {
    setExpandedLine(null);
    setShownTranslations({});
    setShownMonologueTranslations({});
    setRevealedThrough(-1);
  }, [story]);

  useEffect(() => {
    setExpandedLine(null);
    setRevealedThrough(-1);
  }, [revealRunId]);

  useEffect(() => {
    if (activeAudioIndex !== null) {
      setRevealedThrough((current) => Math.max(current, activeAudioIndex));
    }
  }, [activeAudioIndex]);

  useEffect(() => {
    const handleTranslateAll = () => {
      if (!hasDialogue) {
        setShownMonologueTranslations((current) => {
          const allShown = story.monologueSections.length > 0 && story.monologueSections.every((section, index) => !section.translation || current[index]);
          return Object.fromEntries(story.monologueSections.map((section, index) => [index, Boolean(section.translation) && !allShown]));
        });
        return;
      }
      setShownTranslations((current) => {
        const allShown = story.lines.length > 0 && story.lines.every((line, index) => !line.translation || current[index]);
        return Object.fromEntries(story.lines.map((line, index) => [index, Boolean(line.translation) && !allShown]));
      });
    };
    window.addEventListener("story:translate-all", handleTranslateAll);
    return () => window.removeEventListener("story:translate-all", handleTranslateAll);
  }, [hasDialogue, story.lines, story.monologueSections]);

  return (
    <main className={`min-h-full min-w-0 flex-1 px-[clamp(1rem,3vw,2.5rem)] pb-[clamp(7rem,12vh,10rem)] pt-[clamp(1.5rem,3vw,2rem)] ${darkMode ? "bg-[#101418] text-[#e1e2e9]" : "bg-[var(--story-surface-hover)] text-[#191c1d]"}`}>
      <div className="w-full">
        {hasDialogue ? (
          <section className="w-full">
            <div className="space-y-3 md:space-y-[clamp(1rem,1.5vw,1.25rem)]">
              {story.lines.map((line, index) => (!revealSequenceActive || index <= revealedThrough) && (
                <ConversationBubble
                  key={`${line.speaker}-${index}`}
                  line={line}
                  index={index}
                  darkMode={darkMode}
                  isActive={activeAudioIndex === index}
                  isExpanded={expandedLine === index}
                  isTranslationShown={Boolean(shownTranslations[index])}
                  onToggleExpanded={handleToggleExpanded}
                  onSpeakLine={handleSpeakLine}
                  onToggleTranslation={handleToggleTranslation}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="w-full">
            <div className="w-full max-w-[74ch] space-y-6 md:space-y-7">
              {story.monologueSections.map((section, index) => (
                <article key={`${index}-${section.text.slice(0, 24)}`} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
                  <div className="mt-0.5 flex h-8 items-center gap-0.5">
                    <button onClick={() => onSpeakLine(index, section.text)} className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39cbe1] focus-visible:ring-offset-2", darkMode ? "border-[#667277] text-[#f3f4f6] hover:border-[#9cf1fc] hover:bg-[#263e43] hover:text-white focus-visible:ring-offset-[#101418]" : "border-[#879194] text-[#1b1c1b] hover:border-[#00333a] hover:bg-[#dff1f4] hover:text-[#00333a]", activeAudioIndex === index && (darkMode ? "border-[#9cf1fc] bg-[#263e43] text-white" : "border-[#00333a] bg-[#dff1f4] text-[#00333a]"))} aria-label={activeAudioIndex === index ? "Stop section audio" : "Play section audio"}>
                      <Volume2 className="h-4 w-4" />
                    </button>
                    {section.translation && (
                      <button onClick={() => setShownMonologueTranslations((current) => ({ ...current, [index]: !current[index] }))} className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39cbe1] focus-visible:ring-offset-2", darkMode ? "border-[#667277] text-[#f3f4f6] hover:border-[#9cf1fc] hover:bg-[#263e43] hover:text-white focus-visible:ring-offset-[#101418]" : "border-[#879194] text-[#1b1c1b] hover:border-[#00333a] hover:bg-[#dff1f4] hover:text-[#00333a]", shownMonologueTranslations[index] && (darkMode ? "border-[#9cf1fc] bg-[#263e43] text-[#9cf1fc]" : "border-[#176b8f] bg-[#dff1f4] text-[#176b8f]"))} aria-label={shownMonologueTranslations[index] ? "Hide section translation" : "Translate section"}>
                        <Languages className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <p className={`story-conversation-copy text-[clamp(1rem,1vw,1.0625rem)] leading-7 md:leading-[1.75] ${darkMode ? "text-[#e1e2e9]" : "text-[#1b1c1b]"}`}>{section.text}</p>
                    {section.translation && shownMonologueTranslations[index] && <p className={`story-conversation-copy story-translation-reveal mt-3 border-t pt-3 text-[clamp(0.9375rem,0.95vw,1rem)] italic leading-7 ${darkMode ? "border-[#3b4c52] text-[#9cf1fc]" : "border-[#dbe5e7] text-[#176b8f]"}`}>{section.translation}</p>}
                  </div>
                </article>
              ))}
              {story.monologueSections.length === 0 && <p className={`story-conversation-copy text-[clamp(0.95rem,1.1vw,1.1rem)] leading-7 ${darkMode ? "text-[#e1e2e9]" : "text-[#1b1c1b]"}`}>Story content is not available yet.</p>}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
