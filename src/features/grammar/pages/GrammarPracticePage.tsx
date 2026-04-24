"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle, Brain, Zap, Target, PenTool as Pen, Sparkles,
  Type, HelpCircle, LayoutGrid, RefreshCw, Link as LinkIcon,
  AlertTriangle, Bot, ChevronLeft, ChevronRight, BookOpen,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AssignButton from "@/components/shared/AssignButton";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────
interface GrammarTopic {
  id: number;
  slug: string;
  name_en: string;
  name_fr?: string;
  level_code: string;
  subtopics_count: number;
  is_active: boolean;
}

// ─── Exercise types (unchanged) ───────────────────────────────────────────────
const practiceExercises = [
  { id: "fill-blanks-options", title: "Fill in the Blanks", description: "Choose from options to fill in the blanks", icon: Pen, color: "from-blue-400 to-cyan-500", shadow: "shadow-blue-200 dark:shadow-blue-900/20", path: "/grammar/practice/fill-blanks-options", isLive: true },
  { id: "four-options", title: "Choose from 4 Options", description: "Select the correct answer from 4 choices", icon: Zap, color: "from-amber-400 to-orange-500", shadow: "shadow-amber-200 dark:shadow-amber-900/20", path: "/grammar/practice/four-options", isLive: true },
  { id: "two-options", title: "Choose from 2 Options", description: "Pick the right answer from 2 possibilities", icon: CheckCircle, color: "from-purple-400 to-indigo-500", shadow: "shadow-purple-200 dark:shadow-purple-900/20", path: "/grammar/practice/two-options", isLive: true },
  { id: "three-options", title: "Choose from 3 Options", description: "Select the correct option from 3 choices", icon: Target, color: "from-red-400 to-rose-500", shadow: "shadow-red-200 dark:shadow-rose-900/20", path: "/grammar/practice/three-options", isLive: true },
  { id: "fill-blanks", title: "Fill in Blanks (Input)", description: "Type the missing words with hints", icon: Type, color: "from-indigo-400 to-violet-500", shadow: "shadow-indigo-200 dark:shadow-indigo-900/20", path: "/grammar/practice/fill-blanks", isLive: true },
  { id: "fill-blanks-question", title: "Fill in Blanks (Question)", description: "Answer questions by filling blanks", icon: HelpCircle, color: "from-fuchsia-400 to-pink-500", shadow: "shadow-fuchsia-200 dark:shadow-pink-900/20", path: "/grammar/practice/fill-blanks-question", isLive: true },
  { id: "reorder-words", title: "Reorder Words", description: "Build sentences by reordering words", icon: LayoutGrid, color: "from-amber-400 to-orange-500", shadow: "shadow-amber-200 dark:shadow-amber-900/20", path: "/grammar/practice/reorder-words", isLive: true },
  { id: "transformation", title: "Sentence Transformation", description: "Rewrite sentences based on instructions", icon: RefreshCw, color: "from-teal-400 to-emerald-500", shadow: "shadow-teal-200 dark:shadow-emerald-900/20", path: "/grammar/practice/transformation", isLive: true },
  { id: "rewrite", title: "Rewrite – Type in", description: "Rewrite sentences based on instructions", icon: RefreshCw, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-200 dark:shadow-blue-900/20", path: "/grammar/practice/rewrite", isLive: true },
  { id: "combination", title: "Combine Sentences", description: "Join sentences using connectors", icon: LinkIcon, color: "from-cyan-400 to-sky-500", shadow: "shadow-cyan-200 dark:shadow-sky-900/20", path: "/grammar/practice/combination", isLive: true },
  { id: "find-error", title: "Find the Error", description: "Identify and correct grammar mistakes", icon: AlertTriangle, color: "from-rose-400 to-red-500", shadow: "shadow-rose-200 dark:shadow-red-900/20", path: "/grammar/practice/find-error", isLive: true },
  { id: "ai-check", title: "AI Grammar Check", description: "Get AI feedback on your writing", icon: Bot, color: "from-indigo-500 to-purple-600", shadow: "shadow-indigo-200 dark:shadow-purple-900/20", path: "/grammar/practice/ai-check", isLive: true },
];

// ─── Topic Chooser ────────────────────────────────────────────────────────────
function TopicChooser({ onSelect }: { onSelect: (topic: GrammarTopic | null) => void }) {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/grammar/topics`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setTopics((data.topics || []).filter((t: GrammarTopic) => t.is_active)); })
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
        {/* "All Topics" card */}
        <button
          onClick={() => onSelect(null)}
          className="group relative flex flex-col items-start gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-0.5 transition-all duration-200 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 text-white">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900 dark:text-white">All Topics</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Practice everything</p>
          </div>
          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

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
                  {topic.subtopics_count} subtopic{topic.subtopics_count !== 1 ? 's' : ''}
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
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null | undefined>(undefined);
  // undefined = not yet chosen, null = "All Topics", GrammarTopic = specific topic

  const handleCardClick = (path: string) => {
    // Pass topic slug as query param so exercise pages can filter by it
    const url = selectedTopic
      ? `${path}?topic=${selectedTopic.slug}`
      : path;
    router.push(url);
  };

  // Show topic chooser first
  if (selectedTopic === undefined) {
    return (
      <div className="space-y-8 pb-10">
        <TopicChooser
          onSelect={(topic) => {
            // If TopicChooser returns null (no topics / error), skip to exercise grid
            setSelectedTopic(topic === undefined ? null : topic);
          }}
        />
      </div>
    );
  }

  // Show exercise type grid (with back button if a topic was selected)
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedTopic(undefined)}
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
          {selectedTopic ? `${selectedTopic.name_en} — Practice` : 'Grammar Practice'}
        </h2>
        {selectedTopic?.name_fr && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTopic.name_fr}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {practiceExercises.map((exercise) => (
          <div key={exercise.id} onClick={() => handleCardClick(exercise.path)} className="group relative block cursor-pointer">
            <AssignButton exerciseType="grammar" exerciseSlug={exercise.id} exerciseTitle={exercise.title} />
            <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-10 transition-all duration-300 group-hover:opacity-20", exercise.color)} />
            <div className={cn("relative h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-5 backdrop-blur-sm transition-all duration-300", "hover:-translate-y-1 hover:shadow-lg", exercise.shadow)}>
              <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-30", exercise.color)} />
              <div className="flex items-center gap-4">
                <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", exercise.color)}>
                  <exercise.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-0.5">{exercise.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{exercise.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-1">0/6</p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  <Sparkles className="h-4 w-4 text-slate-400 opacity-50" />
                </div>
                {exercise.isLive && (
                  <div className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
