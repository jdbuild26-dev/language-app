"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { GlobalAssignModal } from "@/features/teacher-dashboard/components/GlobalAssignModal";

interface AssignButtonProps {
  exerciseType: string;
  exerciseSlug: string;
  exerciseTitle: string;
  className?: string;
}

const stopAll = (e: React.SyntheticEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export default function AssignButton({
  exerciseType,
  exerciseSlug,
  exerciseTitle,
  className = "",
}: AssignButtonProps) {
  const { role } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (role?.toLowerCase() !== "teacher") return null;

  return (
    // Wrapper div intercepts ALL events so nothing leaks to the parent card
    <div
      className={`absolute top-3 right-3 z-30 ${className}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={stopAll}
      onMouseUp={stopAll}
      onPointerDown={stopAll}
      onPointerUp={stopAll}
      onTouchStart={stopAll}
      onTouchEnd={stopAll}
    >
      <button
        onClick={(e) => {
          stopAll(e);
          setIsModalOpen(true);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5
          bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-full
          shadow-lg shadow-sky-500/30 transition-all active:scale-95
          border border-sky-400 opacity-0 group-hover:opacity-100
          translate-y-[-4px] group-hover:translate-y-0"
        title={`Assign ${exerciseTitle}`}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Assign</span>
      </button>

      {isModalOpen && (
        <GlobalAssignModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          exerciseType={exerciseType}
          exerciseSlug={exerciseSlug}
          exerciseTitle={exerciseTitle}
        />
      )}
    </div>
  );
}
