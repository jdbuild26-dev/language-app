"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, BookOpen, Loader2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchStoryNoteHtml, fetchStorySubtopicNotes, StoryNote } from "@/services/storiesApi";
import { StoryOverviewPanel } from "../components/StoryOverviewPanel";
import { StoryQuizView } from "../components/StoryQuizView";
import { StoryReadingView } from "../components/StoryReadingView";
import { useStoryAudio } from "../hooks/useStoryAudio";
import { QuizQuestion, StoryContentTab } from "../types";
import { parseQuizFromHtml, parseStoryDisplayData } from "../utils/storyParsers";

export default function StoryNotePage() {
  const params = useParams<{ subtopicId: string }>();
  const subtopicId = params?.subtopicId;
  const router = useRouter();
  const { learningLang, knownLang } = useLanguage();

  const [notes, setNotes] = useState<StoryNote[]>([]);
  const [activeNote, setActiveNote] = useState<StoryNote | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<StoryContentTab>("story");
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealSequenceActive, setRevealSequenceActive] = useState(false);
  const [revealRunId, setRevealRunId] = useState(0);

  const darkMode = false;
  const knownLangRef = useRef(knownLang);

  useEffect(() => {
    knownLangRef.current = knownLang;
  }, [knownLang]);

  const loadNotes = useCallback(async () => {
    if (!subtopicId) return;
    setLoadingNotes(true);
    setError(null);
    try {
      let data = await fetchStorySubtopicNotes(Number(subtopicId), knownLangRef.current);
      if (data.length === 0) data = await fetchStorySubtopicNotes(Number(subtopicId));
      setNotes(data);
      setActiveNote((prev) => prev ?? data[0] ?? null);
    } catch (e: any) {
      setError(e.message ?? "Failed to load story");
    } finally {
      setLoadingNotes(false);
    }
  }, [subtopicId]);

  const loadHtml = useCallback(async (noteId: number) => {
    setLoadingHtml(true);
    setHtml(null);
    setQuizQuestions([]);
    setActiveTab("story");
    try {
      const content = await fetchStoryNoteHtml(noteId, learningLang);
      setQuizQuestions(parseQuizFromHtml(content));
      setHtml(content);
    } catch (e: any) {
      setError(e.message ?? "Failed to load story content");
    } finally {
      setLoadingHtml(false);
    }
  }, [learningLang]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    if (activeNote?.id) loadHtml(activeNote.id);
  }, [activeNote?.id, loadHtml]);

  useEffect(() => {
    setRevealSequenceActive(false);
    setRevealRunId(0);
  }, [activeNote?.id]);

  const isLoading = loadingNotes || loadingHtml;
  const storyData = useMemo(() => html ? parseStoryDisplayData(html, activeNote) : null, [activeNote, html]);
  const audio = useStoryAudio(storyData, activeNote?.id);
  const startConversationReveal = useCallback(() => {
    setRevealSequenceActive(true);
    setRevealRunId((value) => value + 1);
    audio.playFromStart();
  }, [audio.playFromStart]);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#101418] text-[#e1e2e9]" : "bg-[#fbf9f7] text-[#1b1c1b]"}`}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap');
        html { scrollbar-gutter: stable; }
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      {isLoading && (
        <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-[#87986a]" /></div>
      )}

      {!isLoading && error && (
        <div className="mx-auto mt-10 flex max-w-3xl items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" /><span>{error}</span>
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
          <header className={`sticky top-0 z-10 flex h-[76px] flex-col border-b ${darkMode ? "border-[#32353a] bg-[#101418]" : "border-[#e9e5df] bg-white"}`}>
            <div className="relative flex flex-1 items-center px-6">
              <div className="flex w-12 shrink-0 items-center">
                <img src="/favicon.svg" alt="" className="h-7 w-7" />
              </div>
              <div className="pointer-events-none absolute inset-x-24 flex items-center justify-center">
                <h1 className="pointer-events-auto max-w-[48vw] truncate text-center font-serif text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold text-[#54643b]">{storyData.title}</h1>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-3">
                <button onClick={() => router.push("/stories")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" title="Exit">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="h-[3px] w-full bg-slate-200">
              <div className="h-full w-1/5 bg-[#2f73ff]" />
            </div>
          </header>
          <div className="flex min-h-[calc(100vh-76px)] flex-col lg:flex-row">
            <StoryOverviewPanel
              story={storyData}
              notes={notes}
              activeNote={activeNote}
              setActiveNote={setActiveNote}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              darkMode={darkMode}
              isPlaying={audio.isPlaying}
              speed={audio.speed}
              progress={audio.progress}
              elapsedTime={audio.elapsedTime}
              durationTime={audio.durationTime}
              onPlayPause={audio.handlePlayPause}
              onPrevious={() => audio.handleAudioStep(-1)}
              onNext={() => audio.handleAudioStep(1)}
              onSpeed={() => audio.setSpeedIndex((index) => (index + 1) % audio.speedCount)}
              onSeek={audio.seekAudio}
            />
            {activeTab === "story" ? (
              <StoryReadingView
                story={storyData}
                darkMode={darkMode}
                activeAudioIndex={audio.isPlaying ? audio.activeAudioLineIndex : null}
                onSpeakLine={audio.handleSpeakLine}
                isPlaying={audio.isPlaying}
                onStartReveal={startConversationReveal}
                onPauseResume={audio.handlePlayPause}
                onRestartReveal={startConversationReveal}
                revealSequenceActive={revealSequenceActive}
                revealRunId={revealRunId}
              />
            ) : (
              <StoryQuizView questions={quizQuestions} darkMode={darkMode} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
