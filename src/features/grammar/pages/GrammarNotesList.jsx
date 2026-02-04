import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useGrammarNotes } from "../../../services/grammarApi";
import { Loader2, FileText, ExternalLink } from "lucide-react";

const GrammarNotesList = () => {
  const { notes, loading, error, getNotes } = useGrammarNotes();

  useEffect(() => {
    getNotes();
  }, [getNotes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        Error loading grammar notes: {error}
      </div>
    );
  }

  if (!loading && !error && notes.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <p className="text-slate-500">No grammar notes found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">
        Grammar Notes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Link
            key={note.id}
            to={`/grammar/lessons/${note.id}`}
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

export default GrammarNotesList;
