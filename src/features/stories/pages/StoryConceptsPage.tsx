"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, Compass, Coffee, Landmark, MessagesSquare, Plane } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchStoryNoteHtml, fetchStorySubtopicNotesForType, fetchStoryTopics, StoryTopic } from "@/services/storiesApi";
import { StoryTopicSkeleton } from "../components/StoryLoadingSkeleton";

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

const CATEGORY_ICONS = [Compass, MessagesSquare, BriefcaseBusiness, Coffee, Plane, Landmark];
const CATEGORY_CARD_STYLES = [
  "from-sky-600 via-sky-500 to-cyan-400",
  "from-emerald-700 via-emerald-600 to-teal-400",
  "from-violet-700 via-violet-600 to-fuchsia-500",
  "from-amber-600 via-orange-500 to-rose-400",
  "from-rose-700 via-rose-600 to-pink-400",
  "from-indigo-700 via-blue-600 to-sky-400",
];

function CategoryCard({ topic, colourIdx, level, storyType, onOpen }: { topic: StoryTopic; colourIdx: number; level: string; storyType: "dialogue" | "monologue"; onOpen: () => void }) {
  const Icon = CATEGORY_ICONS[colourIdx % CATEGORY_ICONS.length];
  const surface = CATEGORY_CARD_STYLES[colourIdx % CATEGORY_CARD_STYLES.length];

  return (
    <button
      onClick={onOpen}
      className={`group relative min-h-40 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(15,23,42,0.2)] active:scale-[0.985] ${surface}`}
    >
      <div aria-hidden className="pointer-events-none absolute -bottom-14 -right-14 h-44 w-44 rounded-full border-[14px] border-white opacity-20" />
      <div aria-hidden className="pointer-events-none absolute -bottom-7 -right-7 h-28 w-28 rounded-full border-2 border-white opacity-30" />
      <div aria-hidden className="pointer-events-none absolute bottom-6 right-6 h-2 w-2 rounded-full bg-white/70" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/15 shadow-sm backdrop-blur-sm">
            <Icon className="h-4 w-4" />
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white shadow-sm backdrop-blur-sm transition-transform duration-150 ease-out group-hover:translate-x-0.5">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-auto pr-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">
            {level} · {storyType}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-bold leading-tight text-white">{topic.name_en}</h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/85">
            <span className="h-1.5 w-1.5 rounded-full bg-white/85" /> {topic.subtopics.length} {topic.subtopics.length === 1 ? "story" : "stories"} to explore
          </p>
        </div>
      </div>
    </button>
  );
}

function StoryCard({ topic, subtopic, colourIdx, storyType, onPrefetchChapter }: { topic: StoryTopic; subtopic: StoryTopic["subtopics"][number]; colourIdx: number; storyType: "dialogue" | "monologue"; onPrefetchChapter: (subtopicId: number, storyType: "dialogue" | "monologue") => void }) {
  const router = useRouter();
  const c = TOPIC_COLOURS[colourIdx % TOPIC_COLOURS.length];

  return (
    <button
      onClick={() => router.push(`/stories/learn/${subtopic.id}?type=${storyType}`)}
      onPointerEnter={() => onPrefetchChapter(subtopic.id, storyType)}
      onFocus={() => onPrefetchChapter(subtopic.id, storyType)}
      className={`group relative min-h-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-[transform,box-shadow,border-color] duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg active:scale-[0.985] dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 ${c.bg}`}
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${c.dot}`} />
      <BookOpen aria-hidden className="pointer-events-none absolute -bottom-5 -right-5 h-28 w-28 text-slate-900 opacity-[0.055] dark:text-white" />
      <div className="flex items-start justify-between gap-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${c.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} /> {topic.name_en}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition-transform duration-150 ease-out group-hover:translate-x-0.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
      <h3 className="relative mt-5 max-w-[85%] text-lg font-bold leading-tight text-slate-900 dark:text-white">{subtopic.name_en}</h3>
      <p className="relative mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
        <BookOpen className="h-3.5 w-3.5" /> {subtopic.notes_count || 0} {subtopic.notes_count === 1 ? "story" : "stories"} · Start learning
      </p>
    </button>
  );
}

export default function StoryConceptsPage() {
  const [level, setLevel] = useState("A1");
  const [storyType, setStoryType] = useState<"dialogue" | "monologue">("dialogue");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
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
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? null;

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["story-topics", level, alternateStoryType],
      queryFn: () => fetchStoryTopics(level, alternateStoryType),
      staleTime: STORY_CACHE_TIME,
    });
  }, [alternateStoryType, level, queryClient]);

  const prefetchChapter = useCallback((subtopicId: number, type: "dialogue" | "monologue") => {
    void queryClient.fetchQuery({
      queryKey: ["story-notes", subtopicId, knownLang, type],
      queryFn: () => fetchStorySubtopicNotesForType(subtopicId, knownLang, type),
      staleTime: STORY_CACHE_TIME,
    }).then((notes) => {
      const firstNote = notes[0];
      if (!firstNote) return;

      return queryClient.prefetchQuery({
        queryKey: ["story-html", firstNote.id, knownLang],
        queryFn: () => fetchStoryNoteHtml(firstNote.id, knownLang),
        staleTime: STORY_CACHE_TIME,
      });
    }).catch(() => {
      // Prefetching is opportunistic; the destination screen renders its own error state.
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
            {selectedTopic ? `Choose a story in ${selectedTopic.name_en}.` : "Choose a category, then select a story."}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {CEFR_LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => { setLevel(l); setSelectedTopicId(null); }}
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
            onClick={() => { setStoryType(type.value); setSelectedTopicId(null); }}
            className={storyType === type.value
              ? "px-4 py-2 rounded-lg text-sm font-medium bg-sky-600 text-white shadow-sm"
              : "px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}
          >
            {type.label}
          </button>
        ))}
      </div>

      {isPending && (
        <StoryTopicSkeleton />
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

      {!isPending && !error && topics.length > 0 && !selectedTopic && (
        <div className="grid max-w-[52rem] gap-4 sm:grid-cols-2">
          {topics.map((topic, idx) => (
            <CategoryCard key={topic.id} topic={topic} colourIdx={idx} level={level} storyType={storyType} onOpen={() => setSelectedTopicId(topic.id)} />
          ))}
        </div>
      )}

      {!isPending && !error && selectedTopic && (
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedTopicId(null)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-[background-color,border-color,transform] duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" /> Categories
              </button>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{selectedTopic.subtopics.length} {selectedTopic.subtopics.length === 1 ? "story" : "stories"}</p>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTopic.name_en}</h3>
          </div>
          {selectedTopic.subtopics.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {selectedTopic.subtopics.map((subtopic, idx) => (
                <StoryCard key={subtopic.id} topic={selectedTopic} subtopic={subtopic} colourIdx={idx} storyType={storyType} onPrefetchChapter={prefetchChapter} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No stories have been added to this category yet.</p>
          )}
        </section>
      )}
    </div>
  );
}
