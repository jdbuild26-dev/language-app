"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGrammarNoteContent } from "@/services/grammarApi";
import { Loader2, ChevronLeft } from "lucide-react";

const GrammarNotePage = () => {
  const { noteId } = useParams();
  const { content, loading, error, getNoteContent } = useGrammarNoteContent();

  useEffect(() => {
    if (noteId) {
      getNoteContent(noteId);
    }
  }, [noteId, getNoteContent]);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto p-6 max-w-4xl">
        <Link
          href="/grammar"
          className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Grammar Notes
        </Link>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
            Error loading content: {error}
          </div>
        )}

        {content && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div
              className="p-8 prose prose-indigo dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarNotePage;
