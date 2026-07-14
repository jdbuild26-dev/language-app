"use client";

/**
 * PR: Grammar Topic Chooser — Dynamic Topic Selection Screen
 *
 * FEATURE SUMMARY:
 * Adds a dynamic topic chooser screen before the grammar exercise type grid.
 * Topics are fetched live from the public backend API (/api/grammar/topics).
 *
 * CHANGES IN THIS FILE:
 * - Added `GrammarTopic` interface
 * - Added `TopicChooser` component — fetches topics from API, renders as a card grid
 *   with an "All Topics" option. Gracefully skips to exercise grid if API returns no topics.
 * - Updated `GrammarPracticePage` — shows `TopicChooser` first (selectedTopic === undefined),
 *   then the exercise type grid after a topic is selected.
 * - Selected topic slug is passed as `?topic=<slug>` query param when navigating to exercises,
 *   ready for exercise pages to filter by topic.
 *
 * API DEPENDENCY:
 * GET /api/grammar/topics
 * Returns: { topics: GrammarTopic[] }
 *
 * BRANCH: feature/grammar-topic-chooser
 * RELATED FILES: language-backend/app/routes/grammar.py
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────
interface GrammarSubtopic {
  id: number;
  slug: string;
  name_en: string;
  name_fr?: string | null;
  name_de?: string | null;
  name_es?: string | null;
  order_index: number;
  notes_count: number;
}

interface GrammarTopic {
  id: number;
  slug: string;
  name_en: string;
  name_fr?: string | null;
  name_de?: string | null;
  name_es?: string | null;
  learning_lang: string;
  level_code: string;
  order_index: number;
  subtopics: GrammarSubtopic[];
}

// ─── Topic Chooser ────────────────────────────────────────────────────────────
interface ExerciseLookupState {
  category: string;
  typeSlug?: string | null;
  exerciseCount: number;
  isLoading: boolean;
  error?: string | null;
}

interface GrammarPracticeMetadata {
  subtopic_id: number;
  subtopic_name: string;
  available: boolean;
  exercise_count: number;
  type_slug: string | null;
  category: string;
}

const GRAMMAR_PRACTICE_ROUTES: Record<string, string> = {
  four_options: "/grammar/practice/four-options",
  fill_blanks_options: "/grammar/practice/fill-blanks-options",
  grammar_reorder: "/grammar/practice/reorder-words",
  grammar_rewrite: "/grammar/practice/rewrite",
};

function TopicChooser({ onSelect }: { onSelect: (topic: GrammarTopic) => void }) {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/grammar/topics`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setTopics(data.topics || []); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // If no topics or error, skip chooser and go straight to exercises
  if (!loading && (error || topics.length === 0)) {
    return null; // caller will show exercise grid directly
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Choose a Topic</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a grammar topic to practice</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {topics.map((topic, i) => {
          const gradients = [
            "from-blue-400 to-cyan-500",
            "from-purple-400 to-indigo-500",
            "from-amber-400 to-orange-500",
            "from-teal-400 to-emerald-500",
            "from-rose-400 to-red-500",
            "from-fuchsia-400 to-pink-500",
            "from-cyan-400 to-sky-500",
            "from-indigo-400 to-violet-500",
          ];
          const gradient = gradients[i % gradients.length];
          return (
            <button
              key={topic.id}
              onClick={() => onSelect(topic)}
              className="group relative flex flex-col items-start gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-0.5 transition-all duration-200 text-left"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white", gradient)}>
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{topic.name_en}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {topic.subtopics.length} subtopic{topic.subtopics.length !== 1 ? 's' : ''}
                  {topic.name_fr && <span className="ml-1 opacity-60">· {topic.name_fr}</span>}
                </p>
              </div>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GrammarPracticePage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | undefined>(undefined);
  const [exerciseLookups, setExerciseLookups] = useState<Record<number, ExerciseLookupState>>({});

  const handleSubtopicClick = async (subtopic: GrammarSubtopic) => {
    setExerciseLookups((prev) => ({
      ...prev,
      [subtopic.id]: {
        category: prev[subtopic.id]?.category ?? `grammar_${subtopic.id}`,
        exerciseCount: prev[subtopic.id]?.exerciseCount ?? 0,
        typeSlug: prev[subtopic.id]?.typeSlug,
        isLoading: true,
        error: null,
      },
    }));

    try {
      const response = await fetch(`${API_URL}/api/grammar/subtopics/${subtopic.id}/practice`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("This lesson no longer exists.");
        }
        throw new Error("Could not check practice exercises right now.");
      }

      const data: GrammarPracticeMetadata = await response.json();
      const typeSlug = data.type_slug;

      setExerciseLookups((prev) => ({
        ...prev,
        [subtopic.id]: {
          category: data.category,
          typeSlug: data.type_slug,
          exerciseCount: data.exercise_count,
          isLoading: false,
          error: null,
        },
      }));

      if (!data.available) {
        return;
      }

      if (!typeSlug || !GRAMMAR_PRACTICE_ROUTES[typeSlug]) {
        setExerciseLookups((prev) => ({
          ...prev,
          [subtopic.id]: {
            category: data.category,
            typeSlug,
            exerciseCount: data.exercise_count,
            isLoading: false,
            error: "Unsupported grammar exercise type.",
          },
        }));
        return;
      }

      const params = new URLSearchParams({ tag: data.category });
      router.push(`${GRAMMAR_PRACTICE_ROUTES[typeSlug]}?${params.toString()}`);
    } catch (error) {
      setExerciseLookups((prev) => ({
        ...prev,
        [subtopic.id]: {
          category: prev[subtopic.id]?.category ?? `grammar_${subtopic.id}`,
          exerciseCount: 0,
          typeSlug: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Could not check practice exercises right now.",
        },
      }));
    }
  };

  // Show topic chooser first
  if (selectedTopic === undefined) {
    return (
      <div className="space-y-8 pb-10">
        <TopicChooser
          onSelect={(topic) => {
            setSelectedTopic(topic);
            setExerciseLookups({});
          }}
        />
      </div>
    );
  }

  const subtopics = selectedTopic.subtopics;

  // Show learner-facing exercise entries for the selected topic.
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedTopic(undefined);
              setExerciseLookups({});
            }}
            className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Topics
          </button>
          {selectedTopic && (
            <>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedTopic.name_en}</span>
            </>
          )}
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {selectedTopic.name_en}
        </h2>
        {selectedTopic?.name_fr && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTopic.name_fr}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subtopics.map((subtopic, index) => {
          const gradients = [
            "from-blue-400 to-cyan-500",
            "from-purple-400 to-indigo-500",
            "from-amber-400 to-orange-500",
            "from-teal-400 to-emerald-500",
            "from-rose-400 to-red-500",
            "from-fuchsia-400 to-pink-500",
            "from-cyan-400 to-sky-500",
            "from-indigo-400 to-violet-500",
          ];
          const gradient = gradients[index % gradients.length];
          const lookup = exerciseLookups[subtopic.id];

          return (
          <button
            key={subtopic.id}
            type="button"
            onClick={() => handleSubtopicClick(subtopic)}
            className="group relative block h-full w-full text-left"
          >
            <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-10 transition-all duration-300 group-hover:opacity-20", gradient)} />
            <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-30", gradient)} />
              <div className="flex items-start gap-4">
                <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", gradient)}>
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-0.5">{subtopic.name_en}</h3>
                  {subtopic.name_fr && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{subtopic.name_fr}</p>
                  )}
                  {lookup?.isLoading && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Checking practice exercises...
                    </p>
                  )}
                  {!lookup?.isLoading && lookup && lookup.exerciseCount === 0 && !lookup.error && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      No practice exercises have been created for this lesson yet.
                    </p>
                  )}
                  {!lookup?.isLoading && lookup?.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      {lookup.error}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <ChevronRight className="h-5 w-5 text-slate-400 opacity-60" />
                </div>
              </div>
            </div>
          </button>
          );
        })}
      </div>
    </div>
  );
}
