"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  fetchStorySubtopicNotes,
  fetchStoryNoteHtml,
  StoryNote,
} from "@/services/storiesApi";

export default function StoryNotePage() {
  const params = useParams<{ subtopicId: string }>();
  const subtopicId = params?.subtopicId;
  const router = useRouter();
  const { knownLang } = useLanguage();

  const [notes, setNotes] = useState<StoryNote[]>([]);
  const [activeNote, setActiveNote] = useState<StoryNote | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    if (!subtopicId) return;
    setLoadingNotes(true);
    setError(null);
    try {
      let data = await fetchStorySubtopicNotes(Number(subtopicId), knownLang);
      if (data.length === 0) {
        data = await fetchStorySubtopicNotes(Number(subtopicId));
      }
      setNotes(data);
      if (data.length > 0) setActiveNote(data[0]);
    } catch (e: any) {
      setError(e.message ?? "Failed to load story");
    } finally {
      setLoadingNotes(false);
    }
  }, [subtopicId, knownLang]);

  const loadHtml = useCallback(async (note: StoryNote) => {
    setLoadingHtml(true);
    setHtml(null);
    try {
      const content = await fetchStoryNoteHtml(note.id);
      setHtml(content);
    } catch (e: any) {
      setError(e.message ?? "Failed to load story content");
    } finally {
      setLoadingHtml(false);
    }
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);
  useEffect(() => { if (activeNote) loadHtml(activeNote); }, [activeNote, loadHtml]);

  const isLoading = loadingNotes || loadingHtml;

  return (
    <div className="min-h-screen bg-[#f9f5f0] dark:bg-slate-950">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {notes.length > 1 && (
          <div className="flex gap-1 ml-4 overflow-x-auto">
            {notes.map((n, idx) => {
              const label = n.title
                ? n.title.length > 22
                  ? n.title.slice(0, 20) + "…"
                  : n.title
                : `Part ${idx + 1}`;
              return (
                <button
                  key={n.id}
                  onClick={() => setActiveNote(n)}
                  title={n.title ?? undefined}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeNote?.id === n.id
                      ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {activeNote?.title && (
          <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">
            {activeNote.title}
          </span>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && notes.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No content available for this chapter yet.
            </p>
          </div>
        )}

        {!isLoading && !error && html && (
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: extractBody(html) }}
          />
        )}
      </div>
    </div>
  );
}

function extractBody(fullHtml: string): string {
  const styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const styles = styleMatch ? `<style>${styleMatch[1]}</style>` : "";
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : fullHtml;
  return styles + body;
}
