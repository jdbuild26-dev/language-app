import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useGrammarNoteContent } from "../../../services/grammarApi";
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
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto p-6 max-w-4xl">
        <Link
          to="/grammar"
          className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Grammar Notes
        </Link>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            Error loading content: {error}
          </div>
        )}

        {content && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div
              className="p-8 prose prose-indigo max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarNotePage;
