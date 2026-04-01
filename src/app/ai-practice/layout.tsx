import { Sparkles, MessageCircle, Target, Briefcase, Settings } from "lucide-react";
import PageTabs from "@/components/ui/PageTabs";

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
  { label: "General", path: "general", icon: Settings },
];

export default function AIPracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageTabs
        basePath="/ai-practice"
        defaultTab="scenarios"
        defaultSubTab="chats"
        tabs={aiPracticeTabs}
      />
      <div className="mt-6">{children}</div>
    </div>
  );
}
