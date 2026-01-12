import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookType,
  CheckCircle2,
  Highlighter,
  MessageSquare,
  Mic,
  Music,
  Image as ImageIcon,
  Keyboard,
  ListTodo,
  Layers,
  Ear,
  Pencil,
  Volume2,
  GitMerge,
} from "lucide-react";

// Categorized Feature List
const practiceCategories = [
  {
    title: "Vocabulary",
    description: "Expand your word bank",
    icon: BookType,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    features: [
      {
        id: "a1",
        name: "Match the Pairs",
        icon: Layers,
        desc: "Match words with meanings",
        path: "match-pairs",
        status: "Live",
      },
      {
        id: "a2",
        name: "Choose from Options",
        icon: CheckCircle2,
        desc: "Select the correct answer",
        path: "choose-options",
        status: "Live",
      },
      {
        id: "a4",
        name: "Highlight the Word",
        icon: Highlighter,
        desc: "Find the word in context",
        path: "highlight-word",
        status: "Live",
      },
      {
        id: "a5",
        name: "Odd One Out",
        icon: ListTodo,
        desc: "Identify the unrelated word",
        path: "odd-one-out",
        status: "Live",
      },
      {
        id: "a6",
        name: "Group Words",
        icon: GitMerge, // Changed icon
        desc: "Sort words into categories", // Changed description
        path: "group-words", // Added path
        status: "Live", // Added status
      },
    ],
  },
  {
    title: "Listening",
    description: "Improve your comprehension",
    icon: Ear,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    features: [
      {
        id: "l1",
        name: "Match Pairs (Audio)",
        icon: Music,
        desc: "Match sounds to text",
      },
      {
        id: "b2",
        name: "Phonetics",
        icon: Volume2,
        desc: "Distinguish similar sounds",
      },
      {
        id: "b3",
        name: "Multiple Select",
        icon: CheckCircle2,
        desc: "Select all valid options",
      },
      {
        id: "b4",
        name: "Image Choice",
        icon: ImageIcon,
        desc: "Pick the image you hear",
      },
      {
        id: "b5",
        name: "Fill Blanks (Audio)",
        icon: Mic,
        desc: "Listen and complete",
      },
      {
        id: "b6",
        name: "Fill Blanks (Typing)",
        icon: Keyboard,
        desc: "Transcribe what you hear",
      },
    ],
  },
  {
    title: "Writing",
    description: "Perfect your spelling & grammar",
    icon: Pencil,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    features: [
      {
        id: "c1",
        name: "Fill in the Blank",
        icon: Keyboard,
        desc: "Complete the sentence",
        path: "fill-in-blank",
        status: "Live",
      },
      {
        id: "c2",
        name: "Correct Spelling",
        icon: CheckCircle2,
        desc: "Fix misspelled words",
        path: "correct-spelling",
        status: "Live",
      },
      {
        id: "c3",
        name: "Dictation (Image)",
        icon: ImageIcon,
        desc: "Name the object displayed",
      },
    ],
  },
  {
    title: "Speaking",
    description: "Practice pronunciation",
    icon: Mic,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    features: [
      {
        id: "d1",
        name: "Repeat Sentence",
        icon: Volume2,
        desc: "Speak the missing word",
      },
      {
        id: "d2",
        name: "What do you see?",
        icon: MessageSquare,
        desc: "Describe the image",
      },
    ],
  },
];

export default function PracticeContent() {
  const navigate = useNavigate();

  const handleCardClick = (feature) => {
    if (feature.path) {
      navigate(feature.path);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Practice Area
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Master the language with targeted exercises covering all core skills.
        </p>
      </div>

      {/* Categories */}
      {practiceCategories.map((category) => (
        <div key={category.title} className="space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-2">
            <div
              className={`p-2 rounded-lg ${category.bgColor} ${category.color}`}
            >
              <category.icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {category.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {category.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {category.features.map((feature) => (
              <div
                key={feature.id}
                onClick={() => handleCardClick(feature)}
                className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all text-left ${
                  feature.path
                    ? "cursor-pointer hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400"
                    : "cursor-default opacity-80"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div
                    className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${
                      feature.path
                        ? "group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        : ""
                    } text-gray-600 dark:text-gray-400 transition-colors`}
                  >
                    <feature.icon size={20} />
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-wide uppercase border px-2 py-0.5 rounded-full ${
                      feature.status === "Live"
                        ? "text-green-600 dark:text-green-400 border-green-200 bg-green-50 dark:bg-green-900/20"
                        : "text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    {feature.status || "Coming Soon"}
                  </span>
                </div>

                <h4
                  className={`font-semibold text-gray-900 dark:text-white mb-1 ${
                    feature.path
                      ? "group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      : ""
                  }`}
                >
                  {feature.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
