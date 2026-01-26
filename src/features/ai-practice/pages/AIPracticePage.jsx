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

import GeneralModeContent from "../components/GeneralModeContent";
import MissionsContent from "../components/MissionsContent";
import ProfessionContent from "../components/ProfessionContent";

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
        <Route path="general" element={<GeneralModeContent />} />

        <Route path="*" element={<Navigate to="scenarios/chats" replace />} />
      </Routes>
    </div>
  );
}
