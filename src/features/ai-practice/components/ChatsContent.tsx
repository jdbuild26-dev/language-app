"use client";

import { useEffect, useState } from "react";
import { Filter, Loader2, Search } from "lucide-react";
import ChatTopicCard from "@/features/ai-practice/components/ChatTopicCard";
import { fetchChatV2Topics } from "@/services/aiPracticeApi";
import { useLanguage } from "@/contexts/LanguageContext";

type ChatCardTopic = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  estimatedTime: string;
  messageCount: number;
  aiRole: string;
  userRole: string;
  formality: string;
  availableLevels: string[];
  isV2: true;
  rating: null;
};

const icons = ["☕", "🛒", "🏥", "✈️", "🏨", "📞", "🍽️", "🏦"];

export default function ChatsContent() {
  const { learningLang } = useLanguage();
  const [topics, setTopics] = useState<ChatCardTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadTopics() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchChatV2Topics(learningLang);
        if (!cancelled) {
          setTopics(result.topics.map((item, index) => ({
            id: item.exercise_id,
            slug: item.exercise_id,
            title: item.topic,
            description: `Practice with ${item.ai_role}.`,
            icon: icons[index % icons.length],
            difficulty: "beginner",
            estimatedTime: "5–10 min",
            messageCount: item.turn_limit,
            aiRole: item.ai_role,
            userRole: item.user_role,
            formality: "",
            availableLevels: item.levels,
            isV2: true,
            rating: null,
          })));
        }
      } catch {
        if (!cancelled) setError("Could not load AI Practice topics. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadTopics();
    return () => { cancelled = true; };
  }, [learningLang]);

  const filteredTopics = topics.filter((topic) => (
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  if (isLoading) return <div className="flex min-h-[40vh] items-center justify-center"><div className="text-center"><Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-sky-500" /><p className="text-gray-600 dark:text-slate-400">Loading AI Practice topics...</p></div></div>;
  if (error) return <div className="flex min-h-[40vh] items-center justify-center"><div className="text-center"><p className="mb-4 text-red-500">{error}</p><button onClick={() => window.location.reload()} className="rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600">Retry</button></div></div>;

  return <div>
    <div className="mb-6"><h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Conversation Topics</h2><p className="text-gray-500 dark:text-slate-400">Choose a topic to practise a conversation with AI.</p></div>
    <div className="relative mb-6"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search topics..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></div>
    {filteredTopics.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredTopics.map((topic) => <ChatTopicCard key={topic.id} topic={topic} />)}</div> : <div className="py-12 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800"><Filter className="h-8 w-8 text-gray-400" /></div><p className="text-gray-500 dark:text-slate-400">No AI Practice topics match your search.</p></div>}
  </div>;
}
