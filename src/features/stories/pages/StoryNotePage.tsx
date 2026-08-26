"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { fetchStoryNoteHtml, fetchStorySubtopicNotesForType, StoryNote } from "@/services/storiesApi";
import { FALLBACK_STORY_IMAGES, StoryImage, StoryOverviewPanel } from "../components/StoryOverviewPanel";
import { StoryQuizView } from "../components/StoryQuizView";
import { StoryReadingView } from "../components/StoryReadingView";
import { useStoryAudio } from "../hooks/useStoryAudio";
import { QuizQuestion, StoryContentTab } from "../types";
import { parseQuizFromHtml, parseStoryDisplayData } from "../utils/storyParsers";

const STORY_CACHE_TIME = 10 * 60 * 1000;

export default function StoryNotePage() {
  const params = useParams<{ subtopicId: string }>();
  const searchParams = useSearchParams();
  const subtopicId = params?.subtopicId;
  const requestedStoryType = searchParams?.get("type");
  const storyType = requestedStoryType === "monologue" ? "monologue" : requestedStoryType === "dialogue" ? "dialogue" : undefined;
  const router = useRouter();
  const { learningLang, knownLang } = useLanguage();

  const [activeNote, setActiveNote] = useState<StoryNote | null>(null);
  const [activeTab, setActiveTab] = useState<StoryContentTab>("story");
  const [revealSequenceActive, setRevealSequenceActive] = useState(false);
  const [revealRunId, setRevealRunId] = useState(0);
  const [quizProgress, setQuizProgress] = useState(0);
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string } | null>(null);

  const darkMode = false;
  const numericSubtopicId = Number(subtopicId);
  const canLoadNotes = Number.isFinite(numericSubtopicId) && numericSubtopicId > 0;
  const notesQuery = useQuery({
    queryKey: ["story-notes", numericSubtopicId, knownLang, storyType],
    queryFn: () => fetchStorySubtopicNotesForType(numericSubtopicId, knownLang, storyType),
    enabled: canLoadNotes,
    staleTime: STORY_CACHE_TIME,
    gcTime: 30 * 60 * 1000,
  });
  const notes = notesQuery.data ?? [];

  useEffect(() => {
    setActiveNote((current) => notes.find((note) => note.id === current?.id) ?? notes[0] ?? null);
  }, [notes]);

  const storyHtmlQuery = useQuery({
    queryKey: ["story-html", activeNote?.id, learningLang],
    queryFn: () => fetchStoryNoteHtml(activeNote!.id, learningLang),
    enabled: Boolean(activeNote?.id),
    staleTime: STORY_CACHE_TIME,
    gcTime: 30 * 60 * 1000,
  });
  const html = storyHtmlQuery.data ?? null;
  const quizQuestions = useMemo<QuizQuestion[]>(() => html ? parseQuizFromHtml(html) : [], [html]);

  useEffect(() => {
    setRevealSequenceActive(false);
    setRevealRunId(0);
    setQuizProgress(0);
    setActiveTab("story");
  }, [activeNote?.id, learningLang]);

  const error = notesQuery.error ?? storyHtmlQuery.error;
  const isLoading = notesQuery.isPending || (storyHtmlQuery.isPending && !html);
  const storyData = useMemo(() => html ? parseStoryDisplayData(html, activeNote) : null, [activeNote, html]);
  const storyImages = useMemo<StoryImage[]>(() => {
    const uploadedImages = storyData?.imageUrls.map((src, index) => ({ src, alt: `${storyData.title} image ${index + 1}` })) ?? [];
    return uploadedImages.length > 0 ? uploadedImages : FALLBACK_STORY_IMAGES;
  }, [storyData]);
  const expandedImageIndex = useMemo(() => Math.max(0, storyImages.findIndex((image) => image.src === expandedImage?.src)), [expandedImage, storyImages]);
  const showAdjacentExpandedImage = (direction: -1 | 1) => {
    const nextIndex = (expandedImageIndex + direction + storyImages.length) % storyImages.length;
    setExpandedImage(storyImages[nextIndex]);
  };
  const audio = useStoryAudio(storyData, activeNote?.id);
  const isMonologue = storyData ? !storyData.lines.some((line) => line.text) && storyData.monologueSections.some((section) => section.text) : false;
  const topProgress = activeTab === "quiz" ? quizProgress : audio.progress;
  const startConversationReveal = useCallback(() => {
    setRevealSequenceActive(true);
    setRevealRunId((value) => value + 1);
    audio.playFromStart();
  }, [audio.playFromStart]);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#101418] text-[#e1e2e9]" : "bg-[#fbf9f7] text-[#1b1c1b]"}`}>
      {isLoading && (
        <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-[#87986a]" /></div>
      )}

      {!isLoading && error && (
        <div className="mx-auto mt-10 flex max-w-3xl items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" /><span>{error.message}</span>
        </div>
      )}

      {!isLoading && !error && notes.length === 0 && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-[#76786d]">
          <BookOpen className="mb-4 h-10 w-10 opacity-50" />
          <p className="font-bold">No content available for this chapter yet.</p>
        </div>
      )}

      {!isLoading && !error && storyData && (
        <div className="relative min-h-screen">
          <header className={`sticky top-0 z-30 flex h-[76px] flex-col border-b ${darkMode ? "border-[#32353a] bg-[#101418]" : "border-[#e9e5df] bg-white"}`}>
            <div className="relative flex flex-1 items-center px-6">
              <div className="flex w-12 shrink-0 items-center">
                <img src="/favicon.svg" alt="" className="h-7 w-7" />
              </div>
              <div className="pointer-events-none absolute inset-x-24 flex items-center justify-center">
              <h1 className="story-page-heading pointer-events-auto max-w-[48vw] truncate text-center font-extrabold tracking-[-0.02em] text-[#00333a]">{storyData.title}</h1>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-3">
                <button onClick={() => router.push("/stories")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" title="Exit">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="h-[3px] w-full bg-slate-200">
              <div className="h-full bg-[#85bac3] transition-[width] duration-150 ease-linear" style={{ width: `${topProgress}%` }} />
            </div>
          </header>
          <div className="flex min-h-[calc(100vh-76px)] flex-col lg:flex-row">
            <StoryOverviewPanel
              story={storyData}
              notes={notes}
              activeNote={activeNote}
              setActiveNote={setActiveNote}
              activeTab={activeTab}
              setActiveTab={(tab) => { setExpandedImage(null); setActiveTab(tab); }}
              darkMode={darkMode}
              isPlaying={audio.isPlaying}
              isPaused={audio.isPaused}
              speed={audio.speed}
              progress={audio.progress}
              elapsedTime={audio.elapsedTime}
              durationTime={audio.durationTime}
              audioSegments={audio.audioSegments}
              onPlayPause={audio.handlePlayPause}
              onPrevious={() => audio.handleAudioStep(-1)}
              onNext={() => audio.handleAudioStep(1)}
              onSpeed={() => audio.setSpeedIndex((index) => (index + 1) % audio.speedCount)}
              onSeek={audio.seekAudio}
              hasContent={storyData.lines.some((line) => line.text) || storyData.monologueSections.some((section) => section.text)}
              isMonologue={isMonologue}
              revealSequenceActive={revealSequenceActive}
              onStartReveal={startConversationReveal}
              onRestartReveal={startConversationReveal}
              onShowFullConversation={() => setRevealSequenceActive(false)}
              images={storyImages}
              onOpenImage={setExpandedImage}
            />
            {activeTab === "story" ? (
              <StoryReadingView
                story={storyData}
                darkMode={darkMode}
                activeAudioIndex={audio.isPlaying ? audio.activeAudioLineIndex : null}
                onSpeakLine={audio.handleSpeakLine}
                revealSequenceActive={revealSequenceActive}
                revealRunId={revealRunId}
              />
            ) : (
              <StoryQuizView questions={quizQuestions} darkMode={darkMode} onProgressChange={setQuizProgress} />
            )}
            <Dialog open={Boolean(expandedImage)} onOpenChange={(open) => { if (!open) setExpandedImage(null); }}>
              <DialogContent onPointerDownOutside={() => setExpandedImage(null)} className="story-image-dialog relative max-w-none border-0 bg-transparent p-0 shadow-none [&>button]:right-3 [&>button]:top-3 [&>button]:z-10 [&>button]:inline-flex [&>button]:h-10 [&>button]:w-10 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-[#b9c5c7] [&>button]:bg-[#edf1f1] [&>button]:p-0 [&>button]:text-[#00333a] [&>button]:opacity-100 [&>button]:shadow-[0_6px_16px_rgba(0,0,0,0.2)] [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0 [&>button]:focus-visible:ring-2 [&>button]:focus-visible:ring-white [&>button>svg]:h-5 [&>button>svg]:w-5">
                <DialogTitle className="sr-only">{expandedImage?.alt ?? "Full-size story image"}</DialogTitle>
                <div className="pointer-events-none absolute inset-x-0 -top-6 flex justify-center gap-4" aria-label={`Image ${expandedImageIndex + 1} of ${storyImages.length}`}>
                  {storyImages.map((image, index) => <span key={image.src} className={`h-1.5 w-14 rounded-full ${index === expandedImageIndex ? "bg-[#00c9fc]" : "bg-white/75"}`} />)}
                </div>
                <div className="h-full w-full overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(0,31,36,0.28)]">
                  {expandedImage && <img src={expandedImage.src} alt={expandedImage.alt} className="h-full w-full object-cover" />}
                </div>
                {storyImages.length > 1 && <>
                  <div className="absolute left-[-5.5rem] top-1/2 -translate-y-1/2">
                    <button onClick={() => showAdjacentExpandedImage(-1)} className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-[transform,background-color,border-color] duration-150 ease-out hover:scale-105 hover:border-white/50 hover:bg-white/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Show previous image">
                      <ChevronLeft className="h-7 w-7 transition-transform duration-150 group-hover:-translate-x-0.5" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="absolute right-[-5.5rem] top-1/2 -translate-y-1/2">
                    <button onClick={() => showAdjacentExpandedImage(1)} className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-[transform,background-color,border-color] duration-150 ease-out hover:scale-105 hover:border-white/50 hover:bg-white/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Show next image">
                      <ChevronRight className="h-7 w-7 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2} />
                    </button>
                  </div>
                </>}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}
