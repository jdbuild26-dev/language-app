"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { fetchTopicForLevel } from "@/services/aiPracticeApi";
import { useRouter } from "next/navigation";
import ConversationPreviewModal from "@/features/ai-practice/components/ConversationPreviewModal";

const CEFR_LEVELS = [
  { code: "A1", label: "A1 – Beginner", color: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700" },
  { code: "A2", label: "A2 – Elementary", color: "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700" },
  { code: "B1", label: "B1 – Intermediate", color: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700" },
  { code: "B2", label: "B2 – Upper Intermediate", color: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700" },

];

interface Props {
  topic: {
    slug: string;
    title: string;
    icon?: string;
    aiRole?: string;
    userRole?: string;
    formality?: string;
  };
  onClose: (e?: React.MouseEvent) => void;
}

export default function LevelSelectModal({ topic, onClose }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewScenario, setPreviewScenario] = useState<any>(null);
  const [pendingSlug, setPendingSlug] = useState<string>("");

  const handleStart = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopicForLevel(topic.slug, selected);
      const scenario = {
        title: data.topic,
        level: data.level,
        formality: topic.formality || "casual",
        mode: "chat",
        aiRole: data.ai_role || topic.aiRole || "Conversation Partner",
        userRole: data.user_role || topic.userRole || "Learner",
        aiPrompt: data.ai_prompt || "",
        objective: data.objective || null,
        icon: topic.icon,
      };
      sessionStorage.setItem("chatScenario", JSON.stringify(scenario));
      setPendingSlug(topic.slug);
      setPreviewScenario(scenario);
    } catch (e) {
      setError("Could not load the prompt for this level. Please try again.");
      setLoading(false);
    }
  };

  const handleConfirmStart = () => {
    router.push(`/ai-practice/scenarios/chats/${pendingSlug}/chat`);
  };

  if (previewScenario) {
    return (
      <ConversationPreviewModal
        scenario={previewScenario}
        onStart={handleConfirmStart}
        onClose={() => { setPreviewScenario(null); setLoading(false); }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { e.stopPropagation(); onClose(e); }}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(e); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          {topic.icon && <span className="text-3xl">{topic.icon}</span>}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {topic.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">Select your CEFR level to begin</p>
          </div>
        </div>

        {/* Level grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {CEFR_LEVELS.map((lvl) => (
            <button
              key={lvl.code}
              onClick={() => setSelected(lvl.code)}
              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                selected === lvl.code
                  ? `${lvl.color} border-current scale-[1.03] shadow-md`
                  : "bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-sky-400"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleStart}
          disabled={!selected || loading}
          className="w-full py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </>
          ) : (
            "Start Conversation"
          )}
        </button>
      </div>
    </div>
  );
}
