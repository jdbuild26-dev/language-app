import { Link, useParams } from "react-router-dom";
import {
  BookmarkIcon,
  BookOpenIcon,
  ClockIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  LanguageIcon,
} from "@heroicons/react/24/outline";

// Hardcoded lesson data for each CEFR level (will come from backend)
const lessonData = {
  a1: [
    {
      id: 1,
      title: "People",
      words: ["mother", "father", "friend"],
      lessons: 8,
      wordCount: 120,
      time: "45m",
      progress: 3,
    },
    {
      id: 2,
      title: "Food",
      words: ["apple", "bread", "water"],
      lessons: 10,
      wordCount: 145,
      time: "1h 10m",
      progress: 0,
    },
    {
      id: 3,
      title: "Animals",
      words: ["dog", "cat", "bird"],
      lessons: 7,
      wordCount: 95,
      time: "38m",
      progress: 0,
    },
    {
      id: 4,
      title: "Colors",
      words: ["red", "blue", "green"],
      lessons: 5,
      wordCount: 60,
      time: "25m",
      progress: 0,
    },
    {
      id: 5,
      title: "Numbers",
      words: ["one", "two", "three"],
      lessons: 6,
      wordCount: 80,
      time: "32m",
      progress: 0,
    },
    {
      id: 6,
      title: "Family",
      words: ["sister", "brother", "baby"],
      lessons: 9,
      wordCount: 110,
      time: "50m",
      progress: 0,
    },
  ],
  a2: [
    {
      id: 1,
      title: "Travel",
      words: ["airport", "hotel", "ticket"],
      lessons: 12,
      wordCount: 180,
      time: "1h 30m",
      progress: 5,
    },
    {
      id: 2,
      title: "Shopping",
      words: ["price", "sale", "cash"],
      lessons: 10,
      wordCount: 155,
      time: "1h 5m",
      progress: 0,
    },
    {
      id: 3,
      title: "Weather",
      words: ["sunny", "rainy", "cloudy"],
      lessons: 8,
      wordCount: 100,
      time: "42m",
      progress: 0,
    },
    {
      id: 4,
      title: "Health",
      words: ["doctor", "medicine", "pain"],
      lessons: 11,
      wordCount: 165,
      time: "1h 15m",
      progress: 0,
    },
    {
      id: 5,
      title: "Work",
      words: ["office", "meeting", "boss"],
      lessons: 14,
      wordCount: 210,
      time: "1h 45m",
      progress: 0,
    },
    {
      id: 6,
      title: "Home",
      words: ["kitchen", "bedroom", "garden"],
      lessons: 9,
      wordCount: 130,
      time: "55m",
      progress: 0,
    },
  ],
  b1: [
    {
      id: 1,
      title: "Education",
      words: ["university", "degree", "exam"],
      lessons: 15,
      wordCount: 240,
      time: "2h",
      progress: 0,
    },
    {
      id: 2,
      title: "Technology",
      words: ["software", "device", "network"],
      lessons: 18,
      wordCount: 280,
      time: "2h 20m",
      progress: 0,
    },
    {
      id: 3,
      title: "Environment",
      words: ["pollution", "climate", "recycle"],
      lessons: 12,
      wordCount: 190,
      time: "1h 35m",
      progress: 0,
    },
    {
      id: 4,
      title: "Culture",
      words: ["tradition", "festival", "custom"],
      lessons: 10,
      wordCount: 160,
      time: "1h 20m",
      progress: 0,
    },
    {
      id: 5,
      title: "Media",
      words: ["newspaper", "broadcast", "article"],
      lessons: 11,
      wordCount: 175,
      time: "1h 28m",
      progress: 0,
    },
    {
      id: 6,
      title: "Sports",
      words: ["tournament", "athlete", "score"],
      lessons: 13,
      wordCount: 200,
      time: "1h 40m",
      progress: 0,
    },
  ],
  b2: [
    {
      id: 1,
      title: "Business",
      words: ["investment", "profit", "strategy"],
      lessons: 20,
      wordCount: 320,
      time: "2h 40m",
      progress: 0,
    },
    {
      id: 2,
      title: "Politics",
      words: ["democracy", "election", "policy"],
      lessons: 16,
      wordCount: 260,
      time: "2h 10m",
      progress: 0,
    },
    {
      id: 3,
      title: "Science",
      words: ["research", "experiment", "theory"],
      lessons: 18,
      wordCount: 290,
      time: "2h 25m",
      progress: 0,
    },
    {
      id: 4,
      title: "Art",
      words: ["exhibition", "sculpture", "canvas"],
      lessons: 12,
      wordCount: 195,
      time: "1h 38m",
      progress: 0,
    },
    {
      id: 5,
      title: "Law",
      words: ["court", "judge", "verdict"],
      lessons: 14,
      wordCount: 225,
      time: "1h 52m",
      progress: 0,
    },
    {
      id: 6,
      title: "Finance",
      words: ["mortgage", "interest", "loan"],
      lessons: 17,
      wordCount: 275,
      time: "2h 18m",
      progress: 0,
    },
  ],
  c1: [
    {
      id: 1,
      title: "Philosophy",
      words: ["ethics", "metaphysics", "logic"],
      lessons: 22,
      wordCount: 380,
      time: "3h 10m",
      progress: 0,
    },
    {
      id: 2,
      title: "Literature",
      words: ["narrative", "allegory", "prose"],
      lessons: 19,
      wordCount: 340,
      time: "2h 50m",
      progress: 0,
    },
    {
      id: 3,
      title: "Economics",
      words: ["inflation", "recession", "gdp"],
      lessons: 21,
      wordCount: 360,
      time: "3h",
      progress: 0,
    },
    {
      id: 4,
      title: "Psychology",
      words: ["cognition", "behavior", "therapy"],
      lessons: 18,
      wordCount: 310,
      time: "2h 35m",
      progress: 0,
    },
    {
      id: 5,
      title: "Medicine",
      words: ["diagnosis", "surgery", "symptom"],
      lessons: 24,
      wordCount: 420,
      time: "3h 30m",
      progress: 0,
    },
    {
      id: 6,
      title: "Architecture",
      words: ["facade", "blueprint", "column"],
      lessons: 15,
      wordCount: 265,
      time: "2h 12m",
      progress: 0,
    },
  ],
  c2: [
    {
      id: 1,
      title: "Diplomacy",
      words: ["treaty", "ambassador", "summit"],
      lessons: 25,
      wordCount: 450,
      time: "3h 45m",
      progress: 0,
    },
    {
      id: 2,
      title: "Jurisprudence",
      words: ["precedent", "statute", "litigation"],
      lessons: 23,
      wordCount: 410,
      time: "3h 25m",
      progress: 0,
    },
    {
      id: 3,
      title: "Linguistics",
      words: ["morphology", "syntax", "phonetics"],
      lessons: 20,
      wordCount: 370,
      time: "3h 5m",
      progress: 0,
    },
    {
      id: 4,
      title: "Astrophysics",
      words: ["quasar", "nebula", "relativity"],
      lessons: 18,
      wordCount: 330,
      time: "2h 45m",
      progress: 0,
    },
    {
      id: 5,
      title: "Genetics",
      words: ["chromosome", "mutation", "genome"],
      lessons: 22,
      wordCount: 395,
      time: "3h 18m",
      progress: 0,
    },
    {
      id: 6,
      title: "Neuroscience",
      words: ["synapse", "cortex", "neuron"],
      lessons: 24,
      wordCount: 430,
      time: "3h 35m",
      progress: 0,
    },
  ],
};

// Level colors config
const levelColors = {
  a1: {
    bg: "bg-sky-500",
    text: "text-sky-500",
    progressBg: "bg-sky-100 dark:bg-sky-900/30",
    progressFill: "bg-sky-500",
  },
  a2: {
    bg: "bg-sky-400",
    text: "text-sky-400",
    progressBg: "bg-sky-100 dark:bg-sky-900/30",
    progressFill: "bg-sky-400",
  },
  b1: {
    bg: "bg-teal-500",
    text: "text-teal-500",
    progressBg: "bg-teal-100 dark:bg-teal-900/30",
    progressFill: "bg-teal-500",
  },
  b2: {
    bg: "bg-teal-400",
    text: "text-teal-400",
    progressBg: "bg-teal-100 dark:bg-teal-900/30",
    progressFill: "bg-teal-400",
  },
  c1: {
    bg: "bg-orange-500",
    text: "text-orange-500",
    progressBg: "bg-orange-100 dark:bg-orange-900/30",
    progressFill: "bg-orange-500",
  },
  c2: {
    bg: "bg-orange-400",
    text: "text-orange-400",
    progressBg: "bg-orange-100 dark:bg-orange-900/30",
    progressFill: "bg-orange-400",
  },
};

// Action button component
function ActionButton({ icon: Icon, label }) {
  return (
    <button
      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group"
      title={label}
    >
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors">
        <Icon className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
      </div>
    </button>
  );
}

// Lesson Card component
function LessonCard({ lesson, levelColor }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex flex-col">
      {/* Image and Bookmark */}
      <div className="relative mb-4">
        {/* Placeholder image */}
        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
        </div>
        {/* Bookmark */}
        <button className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-slate-700/80 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors">
          <BookmarkIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
        {lesson.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        Learn words like {lesson.words.join(", ")}
      </p>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`flex-1 h-1.5 ${levelColor.progressBg} rounded-full overflow-hidden`}
        >
          <div
            className={`h-full ${levelColor.progressFill} rounded-full transition-all`}
            style={{ width: `${lesson.progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 dark:text-slate-500 min-w-[28px] text-right">
          {lesson.progress}%
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mb-4 pb-4 border-b border-gray-100 dark:border-slate-700">
        <span className="flex items-center gap-1">
          <BookOpenIcon className="w-3.5 h-3.5" />
          {lesson.lessons} Lesson
        </span>
        <span className="flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeWidth="2" d="M12 6v6l4 2" />
          </svg>
          {lesson.wordCount} Words
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon className="w-3.5 h-3.5" />
          {lesson.time}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <ActionButton icon={RectangleStackIcon} label="Word Card" />
        <ActionButton icon={Squares2X2Icon} label="Flashcards" />
        <ActionButton icon={LanguageIcon} label="Match the pairs" />
        <ActionButton icon={BookOpenIcon} label="Spelling" />
      </div>
    </div>
  );
}

export default function CEFRLevelPage() {
  const { level } = useParams();
  const lessons = lessonData[level] || lessonData.a1;
  const colors = levelColors[level] || levelColors.a1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {level?.toUpperCase()} Level Wordlist
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Explore vocabulary lessons organized by topic. Each lesson includes
          interactive exercises to help you master new words.
        </p>
      </div>

      {/* Grid of Lesson Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} levelColor={colors} />
        ))}
      </div>
    </div>
  );
}
