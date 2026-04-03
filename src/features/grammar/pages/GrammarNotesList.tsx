"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useGrammarNotes } from "@/services/grammarApi";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import AssignButton from "@/components/shared/AssignButton";

const GrammarNotesList = () => {
  const { notes, loading, error, getNotes } = useGrammarNotes();

  useEffect(() => {
    getNotes();
  }, [getNotes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
        Error loading grammar notes: {error}
      </div>
    );
  }

  if (!loading && !error && notes.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400">No grammar notes found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
        Grammar Notes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div key={note.id} className="relative group">
            <AssignButton 
               exerciseType="grammar"
               exerciseSlug={note.id}
               exerciseTitle={note.name.replace(".html", "")}
               className="top-3 right-3"
            />
            <Link
              href={`/grammar/lessons/${note.id}`}
              className="block bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 p-6 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <ExternalLink className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {note.name.replace(".html", "")}
              </h3>

              <div className="mt-2 text-sm text-slate-400 dark:text-slate-500">
                Created: {new Date(note.createdTime).toLocaleDateString()}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrammarNotesList;
