"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  fetchGrammarNoteHtml,
  fetchGrammarSubtopicNotes,
  GrammarNote,
} from "@/services/grammarApi";

const GRAMMAR_CACHE_TIME = 10 * 60 * 1000;

export default function GrammarNotePage() {
  const params = useParams<{ noteId: string }>();
  const noteId = params?.noteId;
  const { knownLang } = useLanguage();

  const [activeNote, setActiveNote] = useState<GrammarNote | null>(null);
  const numericNoteId = Number(noteId);
  const canLoadNotes = Number.isFinite(numericNoteId) && numericNoteId > 0;
  const notesQuery = useQuery({
    queryKey: ["grammar-notes", numericNoteId, knownLang],
    queryFn: () => fetchGrammarSubtopicNotes(numericNoteId, knownLang),
    enabled: canLoadNotes,
    staleTime: GRAMMAR_CACHE_TIME,
    gcTime: 30 * 60 * 1000,
  });
  const notes = notesQuery.data ?? [];

  useEffect(() => {
    setActiveNote((current) => notes.find((note) => note.id === current?.id) ?? notes[0] ?? null);
  }, [notes]);

  const htmlQuery = useQuery({
    queryKey: ["grammar-note-html", activeNote?.id],
    queryFn: () => fetchGrammarNoteHtml(activeNote!.id),
    enabled: Boolean(activeNote?.id),
    staleTime: GRAMMAR_CACHE_TIME,
    gcTime: 30 * 60 * 1000,
  });
  const html = htmlQuery.data ?? null;
  const error = notesQuery.error ?? htmlQuery.error;
  const isLoading = notesQuery.isPending || (htmlQuery.isPending && !html);

  return (
    <div className="min-h-screen bg-[#f9f5f0] dark:bg-slate-950">
      {notes.length > 1 && (
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 overflow-x-auto">
          {notes.map((n, idx) => {
            const label = n.title
              ? n.title.length > 22
                ? n.title.slice(0, 20) + "..."
                : n.title
              : `Note ${idx + 1}`;
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

      <div className="w-full">
        {isLoading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error.message}</span>
          </div>
        )}

        {!isLoading && !error && notes.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No notes available for this subtopic yet.
            </p>
          </div>
        )}

        {!isLoading && !error && activeNote && (
          <iframe
            key={activeNote.id}
            title={activeNote.title ?? "Grammar lesson"}
            srcDoc={html ?? undefined}
            className="h-screen min-h-screen w-full border-0 bg-white dark:bg-slate-900"
          />
        )}
      </div>
    </div>
  );
}
