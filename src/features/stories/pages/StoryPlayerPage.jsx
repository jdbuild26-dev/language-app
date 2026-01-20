import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useStoryContent } from "../../../services/storiesApi";
import { Loader2, ChevronLeft } from "lucide-react";

export default function StoryPlayerPage() {
  const { storyId } = useParams();
  const { content, loading, error, getStoryContent } = useStoryContent();

  useEffect(() => {
    if (storyId) {
      getStoryContent(storyId);
    }
  }, [storyId, getStoryContent]);

  // Process content to strip html/body tags if present
  const processedContent = content
    ? (() => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        return doc.body.innerHTML;
      })()
    : "";

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto p-6 max-w-4xl">
        <Link
          to="/stories"
          className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Stories
        </Link>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            Error loading story: {error}
          </div>
        )}

        {content && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-140px)]">
            <iframe
              srcDoc={content}
              title="Story Player"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        )}
      </div>
    </div>
  );
}
