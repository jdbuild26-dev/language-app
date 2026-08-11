"use client";

import { BookOpen, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { StoryNote } from "@/services/storiesApi";
import { StoryContentTab, StoryDisplayData } from "../types";

interface StoryOverviewPanelProps {
  story: StoryDisplayData;
  notes: StoryNote[];
  activeNote: StoryNote | null;
  setActiveNote: (note: StoryNote) => void;
  activeTab: StoryContentTab;
  setActiveTab: (tab: StoryContentTab) => void;
  darkMode: boolean;
  isPlaying: boolean;
  speed: number;
  progress: number;
  elapsedTime: string;
  durationTime: string;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSpeed: () => void;
  onSeek: (percentage: number) => void;
}

export function StoryOverviewPanel({
  story,
  notes,
  activeNote,
  setActiveNote,
  activeTab,
  setActiveTab,
  darkMode,
  isPlaying,
  speed,
  progress,
  elapsedTime,
  durationTime,
  onPlayPause,
  onPrevious,
  onNext,
  onSpeed,
  onSeek,
}: StoryOverviewPanelProps) {
  return (
    <aside className={`w-full shrink-0 border-r lg:w-[clamp(280px,22vw,340px)] ${darkMode ? "border-[#32353a] bg-[#1d2025]" : "border-[#e9e5df] bg-[#fbf9f6]"}`}>
      <div className="sticky top-[76px] flex max-h-[calc(100vh-76px)] flex-col overflow-y-auto px-[clamp(1rem,1.7vw,1.5rem)] py-[clamp(1rem,1.4vw,1.25rem)] max-lg:static max-lg:max-h-none max-lg:overflow-visible">
        <nav className="mb-5 flex items-center gap-4 border-b border-[#e9e5df] pb-3 text-sm font-bold text-[#252c3a]">
          <button onClick={() => setActiveTab("story")} className={`pb-2 transition-colors active:scale-[0.98] ${activeTab === "story" ? "border-b-2 border-[#54643b] text-[#54643b]" : "text-[#252c3a] hover:text-[#54643b]"}`}>
            Conversation
          </button>
          <button onClick={() => setActiveTab("quiz")} className={`pb-2 transition-colors active:scale-[0.98] ${activeTab === "quiz" ? "border-b-2 border-[#54643b] text-[#54643b]" : "text-[#252c3a] hover:text-[#54643b]"}`}>
            Questions
          </button>
          <button disabled className="pb-2 text-[#b6b9ad]" title="Vocabulary will be added later">
            Vocabulary
          </button>
        </nav>

        <div className="relative mb-6 overflow-hidden rounded-xl">
          <img src="/images/kitchen.jpg" alt="" className="h-[clamp(10rem,15vw,14rem)] w-full object-cover" />
          <div className="absolute bottom-3 right-3 rounded-md bg-[#54643b] p-2 text-white shadow-md">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {(story.tags.length ? story.tags : ["Daily Life", "Present Tense", "A1"]).map((tag) => (
            <span key={tag} className="rounded-full bg-[#f0f2ec] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#54643b]">{tag}</span>
          ))}
        </div>

        <h2 className={`mb-3 font-serif text-[clamp(1.75rem,2.2vw,1.875rem)] font-bold leading-tight ${darkMode ? "text-[#e1e2e9]" : "text-[#1b1c1b]"}`}>{story.title}</h2>
        <p className={`mb-6 text-[clamp(0.8rem,0.9vw,0.875rem)] font-semibold leading-6 ${darkMode ? "text-[#c6c6ca]" : "text-[#586170]"}`}>{story.description}</p>

        <div className={`w-full max-w-[260px] shrink-0 rounded-xl p-3 shadow-sm ${darkMode ? "bg-[#272a2f]" : "bg-white"}`}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#54643b]">
              <button onClick={onPrevious} className="transition-transform active:scale-[0.94]" aria-label="Previous audio"><SkipBack className="h-4 w-4" /></button>
              <button onClick={onPlayPause} className="transition-transform active:scale-[0.94]" aria-label={isPlaying ? "Pause audio" : "Play audio"}>{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}</button>
              <button onClick={onNext} className="transition-transform active:scale-[0.94]" aria-label="Next audio"><SkipForward className="h-4 w-4" /></button>
            </div>
            <button onClick={onSpeed} className="min-w-8 text-right text-xs font-bold text-[#54643b] transition-transform active:scale-[0.94]" aria-label="Change audio speed">{speed}x</button>
          </div>
          <label className="group relative block h-4 cursor-pointer" aria-label="Seek audio">
            <span className="absolute inset-x-0 top-1.5 h-1.5 rounded-full bg-[#e6e5e1]" />
            <span className="absolute left-0 top-1.5 h-1.5 rounded-full bg-[#54643b] transition-[width] duration-150 ease-linear" style={{ width: `${progress}%` }} />
            <input type="range" min="0" max="100" step="0.1" value={progress} onChange={(event) => onSeek(Number(event.target.value))} className="absolute inset-0 h-4 w-full cursor-pointer opacity-0" />
            <span className="pointer-events-none absolute top-0 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#54643b] bg-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100" style={{ left: `${progress}%` }} />
          </label>
          <div className="mt-2 flex justify-between text-[11px] font-bold text-[#8a9085]">
            <span>{elapsedTime}</span><span>{durationTime}</span>
          </div>
        </div>

        {notes.length > 1 && (
          <div className={`mt-6 rounded-2xl border p-4 ${darkMode ? "border-[#45474a] bg-[#272a2f]" : "border-[#e4e2e0] bg-white"}`}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#87986a]">Parts</p>
            <div className="space-y-2">
              {notes.map((note, index) => (
                <button key={note.id} onClick={() => setActiveNote(note)} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition ${activeNote?.id === note.id ? "bg-[#54643b] text-white" : darkMode ? "bg-[#1d2025] text-[#c6c6ca]" : "bg-[#f5f0ea] text-[#45483e]"}`}>
                  {note.title || `Part ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
