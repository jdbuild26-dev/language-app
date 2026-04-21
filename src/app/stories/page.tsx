import StoriesLearnContent from "@/features/stories/components/StoriesLearnContent";
import StoryConceptsPage from "@/features/stories/pages/StoryConceptsPage";

export default function StoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      {/* DB-backed story concepts (topics → subtopics → notes) */}
      <StoryConceptsPage />

      {/* Divider */}
      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Legacy browse by level / grammar / theme */}
      <StoriesLearnContent />
    </div>
  );
}
