/**
 * usePracticeComplete
 *
 * Fires POST /api/progress/practice when a practice exercise completes
 * (isGameOver becomes true). Reads tag_slug from the URL automatically.
 *
 * Usage — call once per exercise page, pass the same isGameOver, score,
 * totalQuestions, and exerciseType that you pass to PracticeGameLayout:
 *
 *   usePracticeComplete({ isGameOver, score, totalQuestions, exerciseType: "highlight_text" });
 */

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UsePracticeCompleteOptions {
  isGameOver: boolean;
  score: number;
  totalQuestions: number;
  exerciseType: string;   // DB slug, e.g. "highlight_text"
  level?: string;         // override — otherwise read from data
}

export function usePracticeComplete({
  isGameOver,
  score,
  totalQuestions,
  exerciseType,
  level = "B1",
}: UsePracticeCompleteOptions) {
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const { learningLang = "fr" } = useLanguage() as { learningLang?: string };
  const hasFired = useRef(false);

  useEffect(() => {
    if (!isGameOver || hasFired.current) return;

    const tagSlug = searchParams?.get("tag");
    if (!tagSlug) return; // no tag — nothing to record

    hasFired.current = true;

    const fire = async () => {
      try {
        const token = await getToken();
        await fetch(`${API_URL}/api/progress/practice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            tag_slug:        tagSlug,
            exercise_type:   exerciseType,
            level:           level.toUpperCase(),
            score,
            total_questions: totalQuestions,
            lang_code:       learningLang,
          }),
        });
        console.log(`[progress] recorded practice: ${exerciseType} / ${tagSlug}`);
      } catch (err) {
        // Non-critical — don't surface to user
        console.warn("[progress] failed to record practice session:", err);
        hasFired.current = false; // allow retry on next render
      }
    };

    fire();
  }, [isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when exercise restarts
  useEffect(() => {
    if (!isGameOver) hasFired.current = false;
  }, [isGameOver]);
}
