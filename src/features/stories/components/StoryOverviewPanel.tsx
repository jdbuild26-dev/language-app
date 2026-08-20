"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Languages, Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { StoryNote } from "@/services/storiesApi";
import { StoryContentTab, StoryDisplayData } from "../types";

const STORY_IMAGES = [
  { src: "/images/kitchen.jpg", alt: "Kitchen interior" },
  { src: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=900", alt: "People talking at a café" },
  { src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=900", alt: "Travel landscape" },
];

interface StoryOverviewPanelProps {
  story: StoryDisplayData;
  notes: StoryNote[];
  activeNote: StoryNote | null;
  setActiveNote: (note: StoryNote) => void;
  activeTab: StoryContentTab;
  setActiveTab: (tab: StoryContentTab) => void;
  darkMode: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  speed: number;
  progress: number;
  elapsedTime: string;
  durationTime: string;
  audioSegments: Array<{ lineIndex: number; startPercentage: number; endPercentage: number }>;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSpeed: () => void;
  onSeek: (percentage: number) => void;
  hasContent: boolean;
  isMonologue: boolean;
  revealSequenceActive: boolean;
  onStartReveal: () => void;
  onPauseResume: () => void;
  onRestartReveal: () => void;
  onOpenImage: (image: { src: string; alt: string }) => void;
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
  isPaused,
  speed,
  progress,
  elapsedTime,
  durationTime,
  audioSegments,
  onPlayPause,
  onPrevious,
  onNext,
  onSpeed,
  onSeek,
  hasContent,
  isMonologue,
  revealSequenceActive,
  onStartReveal,
  onPauseResume,
  onRestartReveal,
  onOpenImage,
}: StoryOverviewPanelProps) {
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const seekPreviewRef = useRef<number | null>(null);
  const displayedProgress = seekPreview ?? progress;
  const contentLabel = isMonologue ? "monologue" : "conversation";
  const selectedImage = STORY_IMAGES[selectedImageIndex];

  useEffect(() => {
    if (seekPreviewRef.current === null) setSeekPreview(null);
  }, [progress]);

  const commitSeek = () => {
    const nextProgress = seekPreviewRef.current;
    if (nextProgress === null) return;
    seekPreviewRef.current = null;
    setSeekPreview(null);
    onSeek(nextProgress);
  };

  const showAdjacentImage = (direction: -1 | 1) => {
    setSelectedImageIndex((index) => (index + direction + STORY_IMAGES.length) % STORY_IMAGES.length);
  };

  return (
    <aside className={`w-full shrink-0 border-r lg:w-[clamp(280px,22vw,340px)] ${darkMode ? "border-[#32353a] bg-[#1d2025]" : "border-[#bfc8ca] bg-white"}`}>
      <div className="sticky top-[76px] flex max-h-[calc(100vh-76px)] flex-col overflow-y-auto px-[clamp(1rem,1.7vw,1.5rem)] py-[clamp(1rem,1.4vw,1.25rem)] max-lg:static max-lg:max-h-none max-lg:overflow-visible">
        <nav className="mb-5 flex items-center gap-4 border-b border-[#bfc8ca] pb-3 text-sm font-bold text-[#191c1d]">
          <button onClick={() => setActiveTab("story")} className={`pb-2 transition-colors active:scale-[0.98] ${activeTab === "story" ? "border-b-2 border-[#00333a] text-[#00333a]" : "text-[#191c1d] hover:text-[#00333a]"}`}>
            {isMonologue ? "Monologue" : "Conversation"}
          </button>
          <button onClick={() => setActiveTab("quiz")} className={`pb-2 transition-colors active:scale-[0.98] ${activeTab === "quiz" ? "border-b-2 border-[#00333a] text-[#00333a]" : "text-[#191c1d] hover:text-[#00333a]"}`}>
            Questions
          </button>
          <button disabled className="pb-2 text-[#b6b9ad]" title="Vocabulary will be added later">
            Vocabulary
          </button>
        </nav>

        <section className="mb-6" aria-label="Story image gallery">
          <div className="relative overflow-hidden rounded-xl">
            <button onClick={() => onOpenImage(selectedImage)} className="block w-full" aria-label={`View ${selectedImage.alt} in full size`}>
              <img src={selectedImage.src} alt={selectedImage.alt} className="h-[clamp(11rem,17vw,15.5rem)] w-full object-cover transition-transform duration-200 hover:scale-[1.02]" />
            </button>
          <button onClick={() => showAdjacentImage(-1)} className="absolute left-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#00333a] shadow-sm transition-[transform,background-color] duration-150 hover:scale-105 hover:bg-white active:scale-95" aria-label="Show previous image">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => showAdjacentImage(1)} className="absolute right-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#00333a] shadow-sm transition-[transform,background-color] duration-150 hover:scale-105 hover:bg-white active:scale-95" aria-label="Show next image">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-[#00333a] p-2 text-white shadow-md">
            <BookOpen className="h-5 w-5" />
          </div>
          </div>
        </section>

        <h2 className={`mb-3 text-[clamp(1.35rem,1.8vw,1.6rem)] font-bold leading-tight tracking-[-0.02em] ${darkMode ? "text-[#e1e2e9]" : "text-[#1b1c1b]"}`}>{story.title}</h2>
        <p className={`mb-6 text-[clamp(0.8rem,0.9vw,0.875rem)] font-semibold leading-6 ${darkMode ? "text-[#c6c6ca]" : "text-[#586170]"}`}>{story.description}</p>

        {hasContent && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {!revealSequenceActive ? (
              <>
                <button onClick={onStartReveal} className="story-primary-action inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2.5 text-xs font-bold transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.97]" aria-label={`Start ${contentLabel}`}>
                  <Play className="h-3.5 w-3.5 fill-current" /> {isMonologue ? "Start listening" : "Start conversation"}
                </button>
                <button onClick={() => window.dispatchEvent(new CustomEvent("story:translate-all"))} className="story-secondary-action inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2.5 text-xs font-bold transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]" aria-label={`Translate all ${contentLabel} sections`}>
                  <Languages className="h-3.5 w-3.5" /> Translate all
                </button>
              </>
            ) : (
              <>
                <button onClick={onPauseResume} className="story-primary-action inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2.5 text-xs font-bold transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.97]" aria-label={isPaused ? `Resume ${contentLabel}` : `Pause ${contentLabel}`}>
                  {isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />} {isPaused ? "Resume" : "Pause"}
                </button>
                <button onClick={onRestartReveal} className="story-secondary-action inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2.5 text-xs font-bold transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]" aria-label="Restart conversation">
                  <RotateCcw className="h-3.5 w-3.5" /> Restart
                </button>
                <button onClick={() => window.dispatchEvent(new CustomEvent("story:translate-all"))} className="story-secondary-action col-span-2 inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2.5 text-xs font-bold transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]" aria-label={`Translate all ${contentLabel} sections`}>
                  <Languages className="h-3.5 w-3.5" /> Translate all
                </button>
              </>
            )}
          </div>
        )}

        <div className={`w-full shrink-0 rounded-xl p-3 shadow-sm ${darkMode ? "bg-[#272a2f]" : "bg-white"}`}>
          <div className="mb-3 flex items-center justify-between">
            <div className="story-audio-control flex items-center gap-2.5">
              <button onClick={onPrevious} className="transition-transform active:scale-[0.94]" aria-label="Previous audio"><SkipBack className="h-4 w-4" /></button>
              <button onClick={onPlayPause} className="transition-transform active:scale-[0.94]" aria-label={isPaused ? "Resume audio" : isPlaying ? "Pause audio" : "Play audio"}>{isPlaying && !isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}</button>
              <button onClick={onNext} className="transition-transform active:scale-[0.94]" aria-label="Next audio"><SkipForward className="h-4 w-4" /></button>
            </div>
            <button onClick={onSpeed} className="story-audio-control min-w-8 text-right text-xs font-bold transition-transform active:scale-[0.94]" aria-label="Change audio speed">{speed}x</button>
          </div>
          <div className="group relative block h-4" role="group" aria-label="Audio progress">
            <span className="story-audio-track absolute inset-x-0 top-1.5 h-1.5 rounded-full" />
            <span className="story-audio-progress absolute left-0 top-1.5 h-1.5 rounded-full transition-[width] duration-150 ease-linear" style={{ width: `${displayedProgress}%` }} />
            {audioSegments.slice(1).map((segment) => (
              <span key={segment.lineIndex} className={`pointer-events-none absolute top-1.5 z-10 h-1.5 w-1.5 -translate-x-1/2 ${darkMode ? "bg-[#272a2f]" : "bg-white"}`} style={{ left: `${segment.startPercentage}%` }} />
            ))}
            <input type="range" min="0" max="100" step="0.1" value={displayedProgress} onChange={(event) => { const value = Number(event.target.value); seekPreviewRef.current = value; setSeekPreview(value); }} onPointerUp={commitSeek} onBlur={commitSeek} onKeyUp={(event) => { if (event.key.startsWith("Arrow") || event.key === "Home" || event.key === "End") commitSeek(); }} className="absolute inset-0 h-4 w-full cursor-pointer opacity-0" />
            <span className="story-audio-control pointer-events-none absolute top-0 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-current bg-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100" style={{ left: `${displayedProgress}%` }} />
          </div>
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
