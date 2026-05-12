"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  fetchSubtopicNotes,
  fetchGrammarNoteHtml,
  GrammarNote,
} from "@/services/grammarApi";

export default function GrammarNotePage() {
  const params = useParams<{ noteId: string }>();
  const noteId = params?.noteId;
  const router = useRouter();
  const { knownLang } = useLanguage();

  const [notes, setNotes] = useState<GrammarNote[]>([]);
  const [activeNote, setActiveNote] = useState<GrammarNote | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: load notes for this subtopic
  const loadNotes = useCallback(async () => {
    if (!noteId) return;
    setLoadingNotes(true);
    setError(null);
    try {
      // Try to get the note in the user's known language first
      let data = await fetchSubtopicNotes(Number(noteId), knownLang);
      // Fallback: fetch all notes if none match known_lang
      if (data.length === 0) {
        data = await fetchSubtopicNotes(Number(noteId));
      }
      setNotes(data);
      if (data.length > 0) setActiveNote(data[0]);
    } catch (e: any) {
      setError(e.message ?? "Failed to load notes");
    } finally {
      setLoadingNotes(false);
    }
  }, [noteId, knownLang]);

  // Step 2: load HTML for the active note
  const loadHtml = useCallback(async (note: GrammarNote) => {
    setLoadingHtml(true);
    setHtml(null);
    try {
      const content = await fetchGrammarNoteHtml(note.id);
      setHtml(content);
    } catch (e: any) {
      setError(e.message ?? "Failed to load note content");
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

        {/* Note tabs — shown when multiple notes exist for this subtopic */}
        {notes.length > 1 && (
          <div className="flex gap-1 ml-4 overflow-x-auto">
            {notes.map((n, idx) => {
              // Use title if available, otherwise "Note 1", "Note 2", etc.
              const label = n.title
                ? n.title.length > 22
                  ? n.title.slice(0, 20) + "…"
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

        {activeNote?.title && (
          <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">
            {activeNote.title}
          </span>
        )}
      </div>

      {/* Content area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && notes.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No notes available for this subtopic yet.
            </p>
          </div>
        )}

        {/* Rendered HTML note — injected into the app shell */}
        {!isLoading && !error && html && (
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
            /*
             * The HTML from the backend is a full <!DOCTYPE html> page with its own
             * <style> block. We strip the outer shell and inject only the <body>
             * content so it inherits our app's container but keeps the note's styles.
             * dangerouslySetInnerHTML is intentional — content is authored by admins.
             */
            dangerouslySetInnerHTML={{ __html: extractBody(html) }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Extract the content inside <body>…</body> from a full HTML document,
 * and prepend the <style> block so note-specific styles still apply.
 *
 * All CSS rules in the compiled HTML are scoped to .grammar-note-root so they
 * don't bleed into the host app (no global * { margin:0 } resets, etc.).
 */
function extractBody(fullHtml: string): string {
  // Extract ALL <style> blocks from the document (may be in <head> or inline)
  const styleBlocks: string[] = [];
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch: RegExpExecArray | null;
  while ((styleMatch = styleRegex.exec(fullHtml)) !== null) {
    styleBlocks.push(styleMatch[1]);
  }
  const styles = styleBlocks.length > 0
    ? `<style>${styleBlocks.join("\n")}</style>`
    : "";

  // Extract <body> content
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : fullHtml;

  return styles + body;
}
