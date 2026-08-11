"use client";

import { useEffect, useState } from "react";
import { Languages, Pause, Play, RotateCcw } from "lucide-react";
import { ConversationBubble } from "./ConversationBubble";
import { StoryDisplayData } from "../types";

interface StoryReadingViewProps {
  story: StoryDisplayData;
  darkMode: boolean;
  activeAudioIndex: number | null;
  onSpeakLine: (index: number, text: string) => void;
  isPlaying: boolean;
  onStartReveal: () => void;
  onPauseResume: () => void;
  onRestartReveal: () => void;
  revealSequenceActive: boolean;
  revealRunId: number;
}

export function StoryReadingView({
  story,
  darkMode,
  activeAudioIndex,
  onSpeakLine,
  isPlaying,
  onStartReveal,
  onPauseResume,
  onRestartReveal,
  revealSequenceActive,
  revealRunId,
}: StoryReadingViewProps) {
  const [showHeroTranslation, setShowHeroTranslation] = useState(false);
  const [expandedLine, setExpandedLine] = useState<number | null>(null);
  const [shownTranslations, setShownTranslations] = useState<Record<number, boolean>>({});
  const [revealedThrough, setRevealedThrough] = useState(-1);
  const hasDialogue = story.lines.some((line) => line.text);
  const allTranslationsShown = story.lines.length > 0 && story.lines.every((_, index) => shownTranslations[index]);

  useEffect(() => {
    if (activeAudioIndex !== null) setExpandedLine(activeAudioIndex);
  }, [activeAudioIndex]);

  useEffect(() => {
    setExpandedLine(null);
    setShownTranslations({});
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

  return (
    <main className={`min-h-full min-w-0 flex-1 px-[clamp(1rem,3vw,2.5rem)] py-[clamp(1.5rem,3vw,2rem)] ${darkMode ? "bg-[#101418] text-[#e1e2e9]" : "bg-[#fbfaf7] text-[#1b1c1b]"}`}>
      <div className="w-full">
        <section className="mb-7 flex flex-col gap-5 border-b border-[#e8e4dc] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b927b]">Read and listen</p>
            <h1 className="font-serif text-[clamp(2rem,2.8vw,2.75rem)] font-bold text-[#26301f]">Conversation <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#54643b]" /></h1>
            {story.lines.length > 0 && <p className="mt-2 text-[clamp(0.75rem,0.9vw,0.875rem)] font-medium text-[#76786d]">Tap a line to focus on it, listen, or reveal its translation.</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {hasDialogue && !revealSequenceActive && (
              <button onClick={onStartReveal} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#54643b] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[#43532e]" aria-label="Start conversation">
                <Play className="h-4 w-4 fill-current" /> Start conversation
              </button>
            )}
            {hasDialogue && revealSequenceActive && (
              <>
                <button onClick={onPauseResume} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#54643b] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[#43532e]" aria-label={isPlaying ? "Pause conversation" : "Resume conversation"}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />} {isPlaying ? "Pause" : "Resume"}
                </button>
                <button onClick={onRestartReveal} className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c6c8ba] bg-white px-4 py-2.5 text-sm font-bold text-[#54643b] shadow-sm transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[#f4f6ee]" aria-label="Restart conversation">
                  <RotateCcw className="h-4 w-4" /> Restart
                </button>
              </>
            )}
            <button onClick={() => setShownTranslations(Object.fromEntries(story.lines.map((_, index) => [index, !allTranslationsShown])))} className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c6c8ba] bg-white px-[clamp(0.75rem,1.2vw,1rem)] py-[clamp(0.5rem,0.8vw,0.625rem)] text-[clamp(0.75rem,0.9vw,0.875rem)] font-bold text-[#54643b] shadow-sm transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[#f4f6ee]"><Languages className="h-4 w-4" /> Translate all</button>
          </div>
        </section>

        {hasDialogue ? (
          <section className="w-full">
            <div className="space-y-[clamp(1rem,1.5vw,1.25rem)]">
              {story.lines.map((line, index) => (!revealSequenceActive || index <= revealedThrough) && (
                <ConversationBubble
                  key={`${line.speaker}-${index}`}
                  line={line}
                  index={index}
                  darkMode={darkMode}
                  isActive={activeAudioIndex === index}
                  isExpanded={expandedLine === index}
                  isTranslationShown={Boolean(shownTranslations[index])}
                  onToggleExpanded={() => setExpandedLine((value) => value === index ? null : index)}
                  onSpeakLine={onSpeakLine}
                  onToggleTranslation={() => setShownTranslations((prev) => ({ ...prev, [index]: !prev[index] }))}
                />
              ))}
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-[#54643b]">Monologue <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#54643b]" /></h1>
              {story.translatedMonologue && (
                <button onClick={() => setShowHeroTranslation((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-[#c6c8ba] bg-white px-5 py-2.5 text-sm font-bold text-[#54643b]"><Languages className="h-4 w-4" /> Translate</button>
              )}
            </div>
            <article className={`max-w-[760px] rounded-xl border px-6 py-5 font-serif text-xl leading-9 shadow-[0_10px_24px_rgba(120,113,108,0.06)] ${darkMode ? "border-[#45474a] bg-[#272a2f]" : "border-[#f0eeeb] bg-white"}`}>
              {(showHeroTranslation && story.translatedMonologue ? story.translatedMonologue : story.monologue) || "Story content is not available yet."}
            </article>
          </section>
        )}
      </div>
    </main>
  );
}
