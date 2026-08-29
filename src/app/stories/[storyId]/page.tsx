"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStoryContent } from "@/services/storiesApi";
import { ChevronLeft } from "lucide-react";
import { StoryCardGridSkeleton } from "@/features/stories/components/StoryLoadingSkeleton";

export default function StoryPlayerPage() {
  const { storyId } = useParams<{ storyId: string }>() ?? {};
  const { content, loading, error, getStoryContent } = useStoryContent();

  useEffect(() => {
    if (storyId) {
      getStoryContent(storyId);
    }
  }, [storyId, getStoryContent]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto p-6 w-[90%]">
        <Link
          href="/stories"
          className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Stories
        </Link>

        {loading && (
          <div className="py-4"><StoryCardGridSkeleton count={3} /></div>
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
