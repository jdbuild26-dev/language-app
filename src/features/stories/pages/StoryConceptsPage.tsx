"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchStorySubtopicNotesForType, fetchStoryTopics, StoryTopic } from "@/services/storiesApi";

const STORY_CACHE_TIME = 10 * 60 * 1000;

const CEFR_LEVELS = ["A1", "A2", "B1", "B2"];
const STORY_TYPES = [
  { value: "dialogue" as const, label: "Dialogues" },
  { value: "monologue" as const, label: "Monologues" },
];

const TOPIC_COLOURS = [
  { bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-800", badge: "bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200", dot: "bg-sky-400" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200", dot: "bg-emerald-400" },
  { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", badge: "bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200", dot: "bg-violet-400" },
  { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200", dot: "bg-amber-400" },
  { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", badge: "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200", dot: "bg-rose-400" },
  { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", badge: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200", dot: "bg-orange-400" },
];

function TopicBlock({ topic, colourIdx, storyType, onPrefetchChapter }: { topic: StoryTopic; colourIdx: number; storyType: "dialogue" | "monologue"; onPrefetchChapter: (subtopicId: number, storyType: "dialogue" | "monologue") => void }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const c = TOPIC_COLOURS[colourIdx % TOPIC_COLOURS.length];

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} overflow-hidden transition-all duration-200`}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${c.dot} flex-shrink-0`} />
          <span className="text-base font-semibold text-slate-800 dark:text-white">
            {topic.name_en}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
            {topic.subtopics.length} chapter{topic.subtopics.length !== 1 ? "s" : ""}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0" />
        )}
      </button>

      {expanded && topic.subtopics.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {topic.subtopics.map((sub) => (
            <button
              key={sub.id}
              onClick={() => router.push(`/stories/learn/${sub.id}?type=${storyType}`)}
              onPointerEnter={() => onPrefetchChapter(sub.id, storyType)}
              onFocus={() => onPrefetchChapter(sub.id, storyType)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-sm transition-all duration-150 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {sub.name_en}
              {sub.notes_count > 0 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  ({sub.notes_count})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {expanded && topic.subtopics.length === 0 && (
        <p className="px-5 pb-4 text-sm text-slate-400 dark:text-slate-500 italic">
          No chapters yet.
        </p>
      )}
    </div>
  );
}

export default function StoryConceptsPage() {
  const [level, setLevel] = useState("A1");
  const [storyType, setStoryType] = useState<"dialogue" | "monologue">("dialogue");
  const { knownLang } = useLanguage();
  const queryClient = useQueryClient();
  const { data: topics = [], error, isPending } = useQuery({
    queryKey: ["story-topics", level, storyType],
    queryFn: () => fetchStoryTopics(level, storyType),
    staleTime: STORY_CACHE_TIME,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
  const alternateStoryType = storyType === "dialogue" ? "monologue" : "dialogue";

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["story-topics", level, alternateStoryType],
      queryFn: () => fetchStoryTopics(level, alternateStoryType),
      staleTime: STORY_CACHE_TIME,
    });
  }, [alternateStoryType, level, queryClient]);

  const prefetchChapter = useCallback((subtopicId: number, type: "dialogue" | "monologue") => {
    queryClient.prefetchQuery({
      queryKey: ["story-notes", subtopicId, knownLang, type],
      queryFn: () => fetchStorySubtopicNotesForType(subtopicId, knownLang, type),
      staleTime: STORY_CACHE_TIME,
    });
  }, [knownLang, queryClient]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Story Concepts
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select a level, then click any chapter to read its story.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {CEFR_LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                level === l
                  ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STORY_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setStoryType(type.value)}
            className={storyType === type.value
              ? "px-4 py-2 rounded-lg text-sm font-medium bg-sky-600 text-white shadow-sm"
              : "px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}
          >
            {type.label}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      )}

      {!isPending && error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {!isPending && !error && topics.length === 0 && (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            No {storyType} categories for {level} yet.
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Add topics in the admin panel to see them here.
          </p>
        </div>
      )}

      {!isPending && !error && topics.length > 0 && (
        <div className="space-y-4">
          {topics.map((topic, idx) => (
            <TopicBlock key={topic.id} topic={topic} colourIdx={idx} storyType={storyType} onPrefetchChapter={prefetchChapter} />
          ))}
        </div>
      )}
    </div>
  );
}
