"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, BookOpen, Loader2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchStoryNoteHtml, fetchStorySubtopicNotes, getStoryNoteType, StoryNote } from "@/services/storiesApi";
import { StoryOverviewPanel } from "../components/StoryOverviewPanel";
import { StoryQuizView } from "../components/StoryQuizView";
import { StoryReadingView } from "../components/StoryReadingView";
import { useStoryAudio } from "../hooks/useStoryAudio";
import { QuizQuestion, StoryContentTab } from "../types";
import { parseQuizFromHtml, parseStoryDisplayData } from "../utils/storyParsers";

export default function StoryNotePage() {
  const params = useParams<{ subtopicId: string }>();
  const searchParams = useSearchParams();
  const subtopicId = params?.subtopicId;
  const requestedStoryType = searchParams?.get("type");
  const storyType = requestedStoryType === "monologue" ? "monologue" : requestedStoryType === "dialogue" ? "dialogue" : undefined;
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
  const [quizProgress, setQuizProgress] = useState(0);

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
      const filterByRequestedType = (notes: StoryNote[]) => storyType
        ? notes.filter((note) => getStoryNoteType(note) === storyType)
        : notes;
      let fetchedNotes = await fetchStorySubtopicNotes(Number(subtopicId), knownLangRef.current, storyType);
      let data = filterByRequestedType(fetchedNotes);
      if (data.length === 0) {
        fetchedNotes = await fetchStorySubtopicNotes(Number(subtopicId), undefined, storyType);
        data = filterByRequestedType(fetchedNotes);
      }
      if (storyType && data.length === 0) {
        const returnedType = fetchedNotes.map(getStoryNoteType).find(Boolean);
        if (returnedType) throw new Error(`This chapter contains a ${returnedType}, not a ${storyType}. Please choose a ${storyType} chapter.`);
      }
      setNotes(data);
      setActiveNote(data[0] ?? null);
    } catch (e: any) {
      setError(e.message ?? "Failed to load story");
    } finally {
      setLoadingNotes(false);
    }
  }, [storyType, subtopicId]);

  const loadHtml = useCallback(async (noteId: number) => {
    setLoadingHtml(true);
    setHtml(null);
    setQuizQuestions([]);
    setQuizProgress(0);
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
              setActiveTab={setActiveTab}
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
              onPauseResume={audio.handlePlayPause}
              onRestartReveal={startConversationReveal}
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
          </div>
        </div>
      )}
    </div>
  );
}
