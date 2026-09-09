"use client";

import { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { fetchTopicForLevel, startChatV2Session } from "@/services/aiPracticeApi";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import ConversationPreviewModal from "@/features/ai-practice/components/ConversationPreviewModal";

const CEFR_LEVELS = [
  { code: "A1", label: "Beginner" },
  { code: "A2", label: "Elementary" },
  { code: "B1", label: "Intermediate" },
  { code: "B2", label: "Upper Intermediate" },
];

interface Props {
  topic: {
    slug: string;
    title: string;
    icon?: string;
    aiRole?: string;
    userRole?: string;
    formality?: string;
    isV2?: boolean;
    availableLevels?: string[];
  };
  onClose: (e?: React.MouseEvent) => void;
}

export default function LevelSelectModal({ topic, onClose }: Props) {
  const router = useRouter();
  const { learningLang, knownLang } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewScenario, setPreviewScenario] = useState<any>(null);
  const [pendingSlug, setPendingSlug] = useState<string>("");
  const [pendingSessionId, setPendingSessionId] = useState<string>("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose]);

  const handleStart = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      let scenario: Record<string, unknown>;
      let sessionId = "";
      if (topic.isV2) {
        const data = await startChatV2Session(topic.slug, selected, learningLang);
        sessionId = data.session_id;
        scenario = {
          title: data.scenario_title, titleEn: data.scenario_title_en, topic: data.topic, level: data.level, formality: "", mode: "chat",
          aiRole: data.ai_role, userRole: data.user_role, aiPrompt: "", learnerInstruction: data.scenario,
          instructionEn: data.instruction_en, icon: topic.icon, learning_lang: learningLang, known_lang: knownLang,
          sessionId: data.session_id, turnLimit: data.turn_limit, remainingTurns: data.remaining_turns,
        };
      } else {
        const data = await fetchTopicForLevel(topic.slug, selected);
        scenario = {
          title: data.topic, level: data.level, formality: topic.formality || "casual", mode: "chat",
          aiRole: data.ai_role || topic.aiRole || "Conversation Partner", userRole: data.user_role || topic.userRole || "Learner",
          aiPrompt: data.ai_prompt || "", objective: data.instruction || null, icon: topic.icon,
          learning_lang: learningLang, known_lang: knownLang,
        };
      }
      sessionStorage.setItem("chatScenario", JSON.stringify(scenario));
      setPendingSlug(topic.slug);
      setPendingSessionId(sessionId);
      setPreviewScenario(scenario);
    } catch (e) {
      setError("Could not load the prompt for this level. Please try again.");
      setLoading(false);
    }
  };

  const handleConfirmStart = () => {
    router.push(`/ai-practice/scenarios/chats/${pendingSlug}/chat${pendingSessionId ? `?session=${encodeURIComponent(pendingSessionId)}` : ""}`);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-[3px] p-4"
      onClick={(e) => { e.stopPropagation(); onClose(e); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-select-title"
        aria-describedby="level-select-description"
        className="relative w-full max-w-lg rounded-3xl border border-white/70 bg-white p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-800 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(e); }}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:hover:bg-slate-700 dark:hover:text-white sm:right-5 sm:top-5"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-10">
          <h2 id="level-select-title" className="text-xl font-bold leading-tight tracking-[-0.015em] text-slate-950 dark:text-white">
            {topic.title}
          </h2>
          <p id="level-select-description" className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-slate-400">
            Choose your CEFR level to begin the conversation.
          </p>
        </div>

        {/* Level grid */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CEFR_LEVELS.filter((lvl) => !topic.availableLevels || topic.availableLevels.includes(lvl.code)).map((lvl) => (
            <button
              key={lvl.code}
              onClick={() => setSelected(lvl.code)}
              aria-pressed={selected === lvl.code}
              className={`relative flex min-h-16 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
                selected === lvl.code
                  ? "border-sky-500 bg-sky-50 text-sky-950 shadow-[0_0_0_1px_rgba(14,165,233,0.22)] dark:border-sky-400 dark:bg-sky-950/35 dark:text-sky-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700/70"
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${selected === lvl.code ? "bg-sky-600 text-white dark:bg-sky-500" : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"}`}>
                {lvl.code}
              </span>
              <span className="min-w-0 text-sm font-semibold leading-5">{lvl.label}</span>
              {selected === lvl.code && (
                <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white dark:bg-sky-500" aria-hidden="true">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>

        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

        <button
          onClick={handleStart}
          disabled={!selected || loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-sky-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
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
