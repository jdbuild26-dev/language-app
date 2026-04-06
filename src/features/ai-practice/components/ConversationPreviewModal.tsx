"use client";

import { Play } from "lucide-react";

interface Props {
  scenario: {
    title: string;
    level: string;
    objective?: string | null;
    icon?: string;
  };
  onStart: () => void;
  onClose: () => void;
}

const levelLabels: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Mastery",
};

export default function ConversationPreviewModal({ scenario, onStart, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#fdf8e8] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="bg-[#f5e9a0] px-6 py-4 rounded-t-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">💬</span>
            <h2 className="text-xl font-bold text-gray-800">Conversation practice</h2>
          </div>
          <p className="text-sm text-gray-600">
            In this lesson you will put your words into use in a roleplay practice.
          </p>
        </div>

        {/* Scenario card */}
        <div className="mx-6 my-5 bg-white rounded-xl shadow-sm p-4 flex gap-4 items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-2">
              {levelLabels[scenario.level] || scenario.level}: {scenario.title}
            </h3>
            {scenario.objective && (
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold">Goal:</span> {scenario.objective}
              </p>
            )}
          </div>
          {scenario.icon && (
            <div className="w-28 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-5xl">
              {scenario.icon}
            </div>
          )}
        </div>

        {/* Start button */}
        <div className="flex justify-center pb-6">
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-8 py-3 bg-[#f5c518] hover:bg-[#e6b800] text-gray-900 font-bold rounded-full shadow-md transition-colors text-base"
          >
            <Play className="w-4 h-4 fill-current" />
            Start conversation
          </button>
        </div>
      </div>
    </div>
  );
}
