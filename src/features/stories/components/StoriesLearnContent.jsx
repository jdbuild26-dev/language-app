import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CarouselSection from "@/components/ui/CarouselSection";
import CarouselCard from "@/components/ui/CarouselCard";

// CEFR Level data for stories
const levelData = [
  {
    title: "A1 Beginner",
    subtitle: "Basic",
    level: "A1",
    to: "/stories/learn/by-level/a1",
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "A2 Elementary",
    subtitle: "Basic",
    level: "A2",
    to: "/stories/learn/by-level/a2",
    image:
      "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "B1 Intermediate",
    subtitle: "Independent",
    level: "B1",
    to: "/stories/learn/by-level/b1",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "B2 Upper Intermediate",
    subtitle: "Independent",
    level: "B2",
    to: "/stories/learn/by-level/b2",
    image:
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=500",
  },
];

// Grammar topics for stories
const grammarData = [
  {
    title: "Adjectives",
    subtitle: "Basic",
    to: "/stories/learn/by-grammar/adjectives",
    image:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Adverbs",
    subtitle: "Basic",
    to: "/stories/learn/by-grammar/adverbs",
    image:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Tenses",
    subtitle: "Independent",
    to: "/stories/learn/by-grammar/tenses",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Modal Verbs",
    subtitle: "Independent",
    to: "/stories/learn/by-grammar/modal-verbs",
    image:
      "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=500",
  },
];

// Themes for stories
const themeData = [
  {
    title: "Science",
    subtitle: "Basic",
    to: "/stories/learn/by-theme/science",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Engineering",
    subtitle: "Basic",
    to: "/stories/learn/by-theme/engineering",
    image:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Literature",
    subtitle: "Independent",
    to: "/stories/learn/by-theme/literature",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Daily Life",
    subtitle: "Basic",
    to: "/stories/learn/by-theme/daily-life",
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Travel",
    subtitle: "Basic",
    to: "/stories/learn/by-theme/travel",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=500",
  },
];

export default function StoriesLearnContent() {
  return (
    <div className="space-y-8 mt-4">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Stories & Scenarios
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
          Here, you can learn through stories that make the language natural and
          engaging. Each story helps you build vocabulary in real contexts
          rather than in isolation. You can explore words organized by grammar
          categories such as verbs, adjectives, and expressions, as well as by
          level from beginner to advanced.
        </p>
      </div>

      {/* Navigate by CEFR Level */}
      <CarouselSection
        title="Navigate by CEFR Level"
        description="Learning stories by level helps you read content suited to your ability, build confidence gradually, understand grammar in context, and naturally expand vocabulary as difficulty increases step by step."
        action={
          <Link
            to="/stories/learn/by-level"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-sky-400"
            aria-label="View all levels"
          >
            <ArrowRight className="h-6 w-6" />
          </Link>
        }
      >
        {levelData.map((item) => (
          <CarouselCard
            key={item.level}
            title={item.title}
            subtitle={item.subtitle}
            image={item.image}
            to={item.to}
          />
        ))}
      </CarouselSection>

      {/* Navigate by Grammar Topic */}
      <CarouselSection
        title="Navigate by Grammar Topic"
        description="Learning stories by level helps you read content suited to your ability, build confidence gradually, understand grammar in context, and naturally expand vocabulary as difficulty increases step by step."
        className="bg-sky-50 dark:bg-slate-800/50 border-sky-100 dark:border-slate-700"
        action={
          <Link
            to="/stories/learn/by-grammar"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-sky-400"
            aria-label="View all grammar topics"
          >
            <ArrowRight className="h-6 w-6" />
          </Link>
        }
      >
        {grammarData.map((item, index) => (
          <CarouselCard
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            image={item.image}
            to={item.to}
          />
        ))}
      </CarouselSection>

      {/* Navigate by Theme */}
      <CarouselSection
        title="Navigate by Theme"
        description="Learning stories by level helps you read content suited to your ability, build confidence gradually, understand grammar in context, and naturally expand vocabulary as difficulty increases step by step."
        action={
          <Link
            to="/stories/learn/by-theme"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-sky-400"
            aria-label="View all themes"
          >
            <ArrowRight className="h-6 w-6" />
          </Link>
        }
      >
        {themeData.map((item, index) => (
          <CarouselCard
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            image={item.image}
            to={item.to}
          />
        ))}
      </CarouselSection>
    </div>
  );
}
