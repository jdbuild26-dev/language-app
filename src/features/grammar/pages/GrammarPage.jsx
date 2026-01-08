import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useGrammarNotes } from "../../../services/grammarApi";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { cn } from "../../../lib/utils"; // Assuming cn exists, if not using standard template string

const GrammarPage = () => {
  const { notes, loading, error, getNotes } = useGrammarNotes();

  useEffect(() => {
    getNotes();
  }, [getNotes]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Grammar Notes</h1>
        <p className="text-slate-500 mt-2">
          Explore grammar topics and lessons.
        </p>
      </header>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          Error loading grammar notes: {error}
        </div>
      )}

      {!loading && !error && notes.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <p className="text-slate-500">No grammar notes found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Link
            key={note.id}
            to={`/grammar/${note.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 p-6 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {note.name.replace(".html", "")}
            </h3>

            <div className="mt-2 text-sm text-slate-400">
              Created: {new Date(note.createdTime).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GrammarPage;
