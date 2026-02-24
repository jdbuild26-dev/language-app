import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  Highlighter,
  MessageSquare,
  Mic,
  Music,
  Image as ImageIcon,
  Keyboard,
  ListTodo,
  Volume2,
  Sparkles,
  FileText,
  RotateCcw,
  HelpCircle,
  Edit3,
  Mail,
  ClipboardList,
  Bot,
  Tags,
  TrendingUp,
} from "lucide-react";
import { useStudentProfile } from "@/hooks/useStudentProfile";

// Tab configuration
const tabs = [
  { id: "all", label: "ALL" },
  { id: "speaking", label: "SPEAKING" },
  { id: "writing", label: "WRITING" },
  { id: "reading", label: "READING" },
  { id: "listening", label: "LISTENING" },
];

// Practice activities with category mapping and styling
const practiceActivities = [
  // ========================================
  // READING Activities (G1-G10)
  // ========================================
  {
    id: "G1",
    name: "Translate the Sentence",
    typeSlug: "translate_bubbles",
    icon: CheckCircle2,
    desc: "Build sentences by selecting word bubbles",
    path: "/practice/reading/bubble-selection",
    category: "reading",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
    isLive: true,
  },
  {
    id: "G11",
    name: "Highlight the Sentence",
    typeSlug: "highlight_text",
    icon: Highlighter,
    desc: "Highlight specific text in the passage",
    path: "/practice/reading/highlight-text",
    category: "reading",
    color: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-200 dark:shadow-blue-900/20",
    isLive: true,
  },
  {
    id: "G12",
    name: "Diagram Labelling",
    typeSlug: "diagram_mapping",
    icon: Tags,
    desc: "Label items in the diagram",
    path: "/practice/reading/diagram-labelling",
    category: "reading",
    color: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-200 dark:shadow-pink-900/20",
    isLive: true,
  },
  {
    id: "G4",
    name: "Match Image to Description",
    typeSlug: "image_mcq",
    icon: ImageIcon,
    desc: "Select the matching description",
    path: "/practice/reading/image-mcq",
    category: "reading",
    color: "from-yellow-400 to-amber-500",
    shadow: "shadow-yellow-200 dark:shadow-yellow-900/20",
    isLive: true,
  },
  {
    id: "G13",
    name: "Match Description to Image",
    icon: ImageIcon,
    desc: "Match the description to the correct image",
    path: "/practice/reading/match-desc-to-image",
    category: "reading",
    color: "from-yellow-400 to-amber-500",
    shadow: "shadow-yellow-200 dark:shadow-yellow-900/20",
    isLive: true,
  },
  {
    id: "G14",
    name: "Image Labelling",
    icon: ImageIcon,
    desc: "Label parts of an image",
    path: "/practice/reading/image-labelling",
    category: "reading",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200 dark:shadow-emerald-900/20",
    isLive: true,
  },
  {
    id: "G5",
    name: "Reading Comprehension",
    typeSlug: "passage_mcq",
    icon: BookOpen,
    desc: "Read passages and answer questions",
    path: "/practice/reading/comprehension",
    category: "reading",
    color: "from-rose-400 to-red-500",
    shadow: "shadow-rose-200 dark:shadow-rose-900/20",
    isLive: true,
  },
  {
    id: "G15",
    name: "Complete the Passage",
    typeSlug: "complete_passage_dropdown",
    icon: BookOpen,
    desc: "Select the best sentence to complete",
    path: "/practice/reading/complete-passage",
    category: "reading",
    color: "from-violet-400 to-purple-500",
    shadow: "shadow-violet-200 dark:shadow-violet-900/20",
    isLive: true,
  },
  {
    id: "G7",
    name: "Fill in the Blanks Passage",
    icon: FileText,
    desc: "Fill in missing sentences",
    path: "/practice/reading/fill-blanks-passage",
    category: "reading",
    color: "from-sky-400 to-indigo-500",
    shadow: "shadow-sky-200 dark:shadow-sky-900/20",
    isLive: true,
  },
  {
    id: "G8",
    name: "Reorder Sentences",
    typeSlug: "reorder_sentences",
    icon: RotateCcw,
    desc: "Arrange sentences in order",
    path: "/practice/reading/reorder",
    category: "reading",
    color: "from-teal-400 to-cyan-500",
    shadow: "shadow-teal-200 dark:shadow-teal-900/20",
    isLive: true,
  },
  {
    id: "G9",
    name: "Identify Information",
    icon: HelpCircle,
    desc: "Evaluate statements from passages",
    path: "/practice/reading/true-false",
    category: "reading",
    color: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-200 dark:shadow-pink-900/20",
    isLive: true,
  },
  {
    id: "G10",
    name: "Running Conversation",
    icon: MessageSquare,
    desc: "Follow conversations and respond",
    path: "/practice/reading/conversation",
    category: "reading",
    color: "from-indigo-400 to-purple-500",
    shadow: "shadow-indigo-200 dark:shadow-indigo-900/20",
    isLive: true,
  },
  {
    id: "G17",
    name: "Summary Completion",
    icon: ListTodo,
    desc: "Complete the summary of a passage",
    path: "/practice/reading/summary-completion",
    category: "reading",
    color: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-200 dark:shadow-blue-900/20",
    isLive: true,
  },
  // ========================================
  // LISTENING Activities (E1-E7)
  // ========================================
  {
    id: "E1",
    name: "Listen and Select",
    icon: Volume2,
    desc: "Choose the correct answer",
    path: "/practice/listening/select",
    category: "listening",
    color: "from-purple-400 to-violet-500",
    shadow: "shadow-purple-200 dark:shadow-purple-900/20",
    isLive: true,
  },
  {
    id: "E2",
    name: "Listen and Type",
    typeSlug: "type_what_you_hear",
    icon: Keyboard,
    desc: "Type what you hear",
    path: "/practice/listening/type",
    category: "listening",
    color: "from-sky-400 to-indigo-500",
    shadow: "shadow-sky-200 dark:shadow-sky-900/20",
    isLive: true,
  },
  {
    id: "E3-NEW",
    name: "Audio Fill in the Blanks",
    icon: Edit3,
    desc: "Listen deeply and fill blanks",
    path: "/practice/listening/audio-fill-blanks-pro",
    category: "listening",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
    isLive: true,
  },
  {
    id: "E3-NEW-DROPDOWN",
    name: "Audio Fill in the Blanks 2",
    icon: Edit3,
    desc: "Listen deeply and fill blanks (Dropdown)",
    path: "/practice/listening/audio-fill-blanks-dropdown",
    category: "listening",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
    isLive: true,
  },
  {
    id: "E4-BUBBLE",
    name: "What do you hear?",
    icon: Volume2,
    desc: "Listen and build the sentence",
    path: "/practice/listening/bubble",
    category: "listening",
    color: "from-teal-400 to-emerald-500",
    shadow: "shadow-teal-200 dark:shadow-teal-900/20",
    isLive: true,
  },
  {
    id: "E5",
    name: "Listen and Order",
    icon: ListTodo,
    desc: "Arrange audio clips in order",
    path: "/practice/listening/order",
    category: "listening",
    color: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-200 dark:shadow-orange-900/20",
    isLive: true,
  },
  {
    id: "E6",
    name: "Passage Questions",
    icon: BookOpen,
    desc: "Listen to passages and answer",
    path: "/practice/listening/passage",
    category: "listening",
    color: "from-rose-400 to-red-500",
    shadow: "shadow-rose-200 dark:shadow-rose-900/20",
    isLive: true,
  },
  {
    id: "E7",
    name: "Interactive Listening",
    icon: MessageSquare,
    desc: "Follow audio conversations",
    path: "/practice/listening/interactive",
    category: "listening",
    color: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-200 dark:shadow-pink-900/20",
    isLive: true,
  },
  {
    id: "E8",
    name: "Listening Comprehension",
    icon: Volume2,
    desc: "Listen to scenarios and answer",
    path: "/practice/listening/comprehension",
    category: "listening",
    color: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-200 dark:shadow-blue-900/20",
    isLive: true,
  },
  {
    id: "E9",
    name: "Running Conversation",
    icon: MessageSquare,
    desc: "Listen and respond to conversations",
    path: "/practice/listening/conversation",
    category: "listening",
    color: "from-indigo-400 to-purple-500",
    shadow: "shadow-indigo-200 dark:shadow-indigo-900/20",
    isLive: true,
  },
  // ========================================
  // WRITING Activities (F1-F8)
  // ========================================
  {
    id: "F1",
    name: "Translate the Sentence",
    icon: Keyboard,
    desc: "Type translations of sentences",
    path: "/practice/writing/translate",
    category: "writing",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
    isLive: true,
  },
  {
    id: "F2",
    name: "Fix the Spelling",
    typeSlug: "correct_spelling",
    icon: CheckCircle2,
    desc: "Correct spelling mistakes",
    path: "/practice/writing/spelling",
    category: "writing",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200 dark:shadow-emerald-900/20",
    isLive: true,
  },
  {
    id: "F3",
    name: "Fill in the Blanks",
    icon: Edit3,
    desc: "Type missing words in passages",
    path: "/practice/writing/fill-blanks",
    category: "writing",
    color: "from-purple-400 to-violet-500",
    shadow: "shadow-purple-200 dark:shadow-purple-900/20",
    isLive: true,
  },
  {
    id: "F4",
    name: "Write About Topic",
    icon: FileText,
    desc: "Write an essay on a topic",
    path: "/practice/writing/topic",
    category: "writing",
    color: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-200 dark:shadow-orange-900/20",
    isLive: true,
  },
  {
    id: "F5",
    name: "Write About Image",
    icon: ImageIcon,
    desc: "Describe an image in writing",
    path: "/practice/writing/image",
    category: "writing",
    color: "from-rose-400 to-red-500",
    shadow: "shadow-rose-200 dark:shadow-rose-900/20",
    isLive: true,
  },
  {
    id: "F6",
    name: "Write Documents",
    icon: Mail,
    desc: "Write letters and emails",
    path: "/practice/writing/documents",
    category: "writing",
    color: "from-sky-400 to-indigo-500",
    shadow: "shadow-sky-200 dark:shadow-sky-900/20",
    isLive: true,
  },
  {
    id: "F7",
    name: "Fill the Form",
    icon: ClipboardList,
    desc: "Complete form fields correctly",
    path: "/practice/writing/form",
    category: "writing",
    color: "from-teal-400 to-cyan-500",
    shadow: "shadow-teal-200 dark:shadow-teal-900/20",
    isLive: true,
  },
  {
    id: "F8",
    name: "Interactive Writing",
    icon: Bot,
    desc: "AI-assisted writing practice",
    path: "/practice/writing/interactive",
    category: "writing",
    color: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-200 dark:shadow-pink-900/20",
    isLive: true,
  },
  {
    id: "F9",
    name: "Sentence Completion",
    icon: Edit3,
    desc: "Complete sentences logically",
    path: "/practice/writing/sentence-completion",
    category: "writing",
    color: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-200 dark:shadow-blue-900/20",
    isLive: true,
  },
  {
    id: "F10",
    name: "Write About Data",
    icon: TrendingUp,
    desc: "Analyse a graph or table",
    path: "/practice/writing/analysis",
    category: "writing",
    color: "from-rose-400 to-red-500",
    shadow: "shadow-rose-200 dark:shadow-rose-900/20",
    isLive: true,
  },
  // ========================================
  // SPEAKING Activities (H1-H4)
  // ========================================
  {
    id: "H1",
    name: "Translate by Speaking",
    icon: Mic,
    desc: "Speak the translation",
    path: "/practice/speaking/translate",
    category: "speaking",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
  },
  {
    id: "H2",
    name: "Speak About Topic",
    typeSlug: "speak_topic",
    icon: MessageSquare,
    desc: "Speak about a given topic",
    path: "/practice/speaking/topic",
    category: "speaking",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200 dark:shadow-emerald-900/20",
  },
  {
    id: "H3",
    name: "Speak About Image",
    icon: ImageIcon,
    desc: "Describe an image by speaking",
    path: "/practice/speaking/image",
    category: "speaking",
    color: "from-purple-400 to-violet-500",
    shadow: "shadow-purple-200 dark:shadow-purple-900/20",
  },
  {
    id: "H4",
    name: "Interactive Speaking",
    icon: Bot,
    desc: "AI conversation practice",
    path: "/practice/speaking/interactive",
    category: "speaking",
    color: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-200 dark:shadow-orange-900/20",
  },
];

export default function PracticePage() {
  const { profile } = useStudentProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive active tab from URL or default to "all"
  const tabFromUrl = searchParams.get("tab");
  const activeTab =
    tabFromUrl && tabs.some((t) => t.id === tabFromUrl) ? tabFromUrl : "all";

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleCardClick = (activity) => {
    if (activity.path) {
      if (activity.typeSlug) {
        const userLevel = profile?.level || "A1";
        const nextPath = encodeURIComponent(activity.path);
        navigate(`/practice/select-topic?type=${activity.typeSlug}&level=${userLevel}&next=${nextPath}`);
      } else {
        // Pass the current category as a query param so we can return to it
        navigate(`${activity.path}?from=${activity.category}`);
      }
    }
  };

  // Filter activities based on active tab
  const filteredActivities =
    activeTab === "all"
      ? practiceActivities
      : practiceActivities.filter(
        (activity) => activity.category === activeTab,
      );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Practice skills
          </h2>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "pb-3 text-sm font-semibold tracking-wide transition-colors relative",
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300",
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleCardClick(activity)}
              className="group relative block cursor-pointer"
            >
              {/* Background Gradient & Shape */}
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-10 transition-all duration-300 group-hover:opacity-20",
                  activity.color,
                )}
              />

              <div
                className={cn(
                  "relative h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-5 backdrop-blur-sm transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-lg",
                  activity.shadow,
                )}
              >
                {/* Decorative Circle */}
                <div
                  className={cn(
                    "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-30",
                    activity.color,
                  )}
                />

                <div className="flex items-center gap-4">
                  {/* Icon Container */}
                  <div
                    className={cn(
                      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                      activity.color,
                    )}
                  >
                    <activity.icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mb-0.5">
                      {activity.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                      {activity.desc}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-1">
                      0/6
                    </p>
                  </div>

                  {/* Sparkle hint on hover */}
                  <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <Sparkles className="h-4 w-4 text-slate-400 opacity-50" />
                  </div>

                  {/* Live Badge */}
                  {activity.isLive && (
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

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              No activities available for this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
