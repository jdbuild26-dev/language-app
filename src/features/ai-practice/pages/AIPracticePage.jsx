import { Routes, Route, Navigate } from "react-router-dom";
import {
  Sparkles,
  MessageCircle,
  Target,
  Briefcase,
  Settings,
} from "lucide-react";
import PageTabs from "@/components/ui/PageTabs";
import ChatsContent from "../components/ChatsContent";
import ChatPage from "./ChatPage";

// Placeholder content components
function MissionsContent() {
  return (
    <div className="text-gray-600 dark:text-slate-400">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Missions
      </h2>
      <p>Complete AI-guided missions to improve your French skills.</p>
    </div>
  );
}

function ProfessionContent() {
  return (
    <div className="text-gray-600 dark:text-slate-400">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Profession
      </h2>
      <p>
        Practice professional French conversations for various career fields.
      </p>
    </div>
  );
}

function GeneralContent() {
  return (
    <div className="text-gray-600 dark:text-slate-400">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        General Practice
      </h2>
      <p>
        General AI-powered practice sessions for everyday French conversations.
      </p>
    </div>
  );
}

// Tab configuration
const aiPracticeTabs = [
  {
    label: "Scenarios",
    path: "scenarios",
    icon: Sparkles,
    subTabs: [
      { label: "Chats", path: "chats", icon: MessageCircle },
      { label: "Missions", path: "missions", icon: Target },
      { label: "Profession", path: "profession", icon: Briefcase },
    ],
  },
  {
    label: "General",
    path: "general",
    icon: Settings,
  },
];

export default function AIPracticePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageTabs
        basePath="/ai-practice"
        defaultTab="scenarios"
        defaultSubTab="chats"
        tabs={aiPracticeTabs}
      />

      {/* Nested routes for tab content */}
      <Routes>
        <Route path="scenarios/chats" element={<ChatsContent />} />
        <Route path="scenarios/chats/:topicSlug/chat" element={<ChatPage />} />
        <Route path="scenarios/missions" element={<MissionsContent />} />
        <Route path="scenarios/profession" element={<ProfessionContent />} />
        <Route path="general" element={<GeneralContent />} />

        <Route path="*" element={<Navigate to="scenarios/chats" replace />} />
      </Routes>
    </div>
  );
}
