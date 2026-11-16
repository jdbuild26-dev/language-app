"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchVocabulary } from "@/services/vocabularyApi";
import GenderIdentifierGame, { type GenderCard } from "@/features/vocabulary/components/gender-identifier/GenderIdentifierGame";

type VocabularyEntry = {
  image?: string;
  english?: string;
  forms?: { word?: string; gender?: string }[];
};

const roundSize = 10;

export default function GenderIdentifierPage() {
  const router = useRouter();
  const [cards, setCards] = useState<GenderCard[]>([]);
  const [round, setRound] = useState(0);
  const [loadedRound, setLoadedRound] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWords() {
      try {
        const data = await fetchVocabulary();
        const entries = data?.words ?? data;
        const words: VocabularyEntry[] = Array.isArray(entries) ? entries : [];
        const available = words.flatMap((entry) => {
          const translation = entry.english?.trim();
          if (!translation) return [];

          return (entry.forms ?? []).flatMap(({ word, gender }) => {
            const text = word?.trim();
            const label = gender?.trim().toLowerCase().split(/\s+/)[0];
            if (!text || (label !== "masculine" && label !== "feminine")) return [];
            const card: GenderCard = { word: text, translation, gender: label, image: entry.image };
            return [card];
          });
        });

        if (active) {
          setCards(available.map((card) => ({ card, order: Math.random() }))
            .sort((a, b) => a.order - b.order)
            .slice(0, roundSize)
            .map(({ card }) => card));
        }
      } catch (error) {
        console.error("Failed to load vocabulary for Gender Identifier", error);
        if (active) setCards([]);
      } finally {
        if (active) setLoadedRound(round);
      }
    }

    void loadWords();
    return () => { active = false; };
  }, [round]);

  const handleBack = () => router.push("/vocabulary/lessons/activities");

  if (loadedRound !== round) {
    return (
      <div role="status" aria-label="Loading vocabulary" className="flex min-h-dvh items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-sky-500" aria-hidden="true" />
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-300">No bilingual gender-specific words are available.</p>
        <button type="button" onClick={handleBack} className="rounded-xl bg-blue-600 px-6 py-2 font-bold text-white">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <GenderIdentifierGame
      key={round}
      cards={cards}
      onExit={handleBack}
      onRestart={() => setRound((value) => value + 1)}
    />
  );
}
