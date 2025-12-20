import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CarouselSection from "@/components/ui/CarouselSection";
import CarouselCard from "@/components/ui/CarouselCard";

const levelData = [
  {
    title: "A1 Beginner",
    subtitle: "Basic",
    level: "A1",
    to: "/vocabulary/lessons/learn/a1",
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "A2 Elementary",
    subtitle: "Basic",
    level: "A2",
    to: "/vocabulary/lessons/learn/a2",
    image:
      "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "B1 Intermediate",
    subtitle: "Independent",
    level: "B1",
    to: "/vocabulary/lessons/learn/b1",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "B2 Upper Intermediate",
    subtitle: "Independent",
    level: "B2",
    to: "/vocabulary/lessons/learn/b2",
    image:
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "C1 Advanced",
    subtitle: "Proficient",
    level: "C1",
    to: "/vocabulary/lessons/learn/c1",
    image:
      "https://images.unsplash.com/photo-1550592704-6c76defa9985?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "C2 Mastery",
    subtitle: "Proficient",
    level: "C2",
    to: "/vocabulary/lessons/learn/c2",
    image:
      "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=500",
  },
];

const topicData = [
  {
    title: "Travel & Transportation",
    subtitle: "Explore",
    to: "/vocabulary/lessons/learn/topic/travel-and-transportation",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Work, Business & Economics",
    subtitle: "Explore",
    to: "/vocabulary/lessons/learn/topic/work-business-and-economics",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Food, Beverage & Sports",
    subtitle: "Explore",
    to: "/vocabulary/lessons/learn/topic/food-and-beverage-and-sports",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Body & Health",
    subtitle: "Explore",
    to: "/vocabulary/lessons/learn/topic/body-and-health",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=500",
  },
  {
    title: "Technology & Science",
    subtitle: "Explore",
    to: "/vocabulary/lessons/learn/topic/technology-and-science",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=500",
  },
];

export default function LearnContent() {
  const learningLanguage = "English";

  return (
    <div className="space-y-8 mt-4">
      {/* Level-Based Vocabulary Section */}
      <CarouselSection
        title={`Master Your Proficiency`}
        description={`Learn essential ${learningLanguage} vocabulary structured by CEFR levels, from beginner specific to advanced mastery.`}
        action={
          <Link
            to="/vocabulary/lessons/learn/level-based"
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

      {/* Topical Vocabulary Section */}
      <CarouselSection
        title="Explore by Topic"
        description="Expand your vocabulary with curated wordlists for every situation, from daily life to professional environments."
        className="bg-sky-50 dark:bg-slate-800/50 border-sky-100 dark:border-slate-700"
        action={
          <Link
            to="/vocabulary/lessons/learn/topics"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-sky-400"
            aria-label="View all topics"
          >
            <ArrowRight className="h-6 w-6" />
          </Link>
        }
      >
        {topicData.map((item, index) => (
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
