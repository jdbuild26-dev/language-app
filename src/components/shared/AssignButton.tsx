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

/**
 * A floating button that appears only for teachers to assign an exercise to their classes.
 */
export default function AssignButton({
  exerciseType,
  exerciseSlug,
  exerciseTitle,
  className = "",
}: AssignButtonProps) {
  const { role } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show for teachers
  // We check for 'teacher' role (case-insensitive)
  if (role?.toLowerCase() !== "teacher") return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 
          bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-full 
          shadow-lg shadow-sky-500/30 transition-all active:scale-95 
          group/assign border border-sky-400 opacity-0 group-hover:opacity-100 
          translate-y-[-4px] group-hover:translate-y-0 ${className}`}
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
    </>
  );
}
