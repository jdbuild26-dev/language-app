"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Volume2 } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { fetchMatchPairsData } from "@/services/vocabularyApi";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";

type Pair = { id: string; french: string; english: string };
type Side = "french" | "english";

/** A fixed number of visible slots draws from a larger, ordered pair queue. */
export default function RollingMatchPage({ mode = "words" }: { mode?: "words" | "audio" }) {
  const router = useRouter();
  const { speak } = useTextToSpeech();
  const visibleCount = mode === "audio" ? 6 : 4;
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [leftSlots, setLeftSlots] = useState<(Pair | null)[]>([]);
  const [rightSlots, setRightSlots] = useState<(Pair | null)[]>([]);
  const [nextIndex, setNextIndex] = useState(0);
  const pendingLeft = useRef<Pair[]>([]);
  const pendingRight = useRef<Pair[]>([]);
  const [selected, setSelected] = useState<{ side: Side; id: string } | null>(null);
  const [incorrect, setIncorrect] = useState<string[]>([]);
  const [matched, setMatched] = useState(0);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);

  useEffect(() => {
    let active = true;
    fetchMatchPairsData(undefined)
      .then((data: Pair[]) => {
        if (!active) return;
        const usable = data.filter((pair) => pair.id && pair.french && pair.english);
        if (!usable.length) throw new Error("No matching words are available.");
        const shuffled = [...usable].sort(() => Math.random() - 0.5);
        setPairs(shuffled);
        const initial = Array.from({ length: visibleCount }, (_, index) => shuffled[index] ?? null);
        setLeftSlots(initial);
        setRightSlots([...initial].sort(() => Math.random() - 0.5));
        setNextIndex(Math.min(visibleCount, shuffled.length));
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load matching words.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [visibleCount]);

  const choose = (side: Side, pair: Pair) => {
    if (locked.current) return;
    if (side === "french") speak(pair.french, "fr-FR");
    if (!selected || selected.side === side) {
      setSelected({ side, id: pair.id });
      return;
    }
    const samePair = selected.id === pair.id;
    setSelected(null);
    locked.current = true;
    if (!samePair) {
      setIncorrect([selected.id, pair.id]);
      timeout.current = setTimeout(() => { setIncorrect([]); locked.current = false; }, 650);
      return;
    }
    timeout.current = setTimeout(() => {
      let nextLeft: Pair | null = null;
      let nextRight: Pair | null = null;
      let advance = 0;
      if (pendingLeft.current.length && pendingRight.current.length) {
        nextLeft = pendingRight.current.shift() ?? null;
        nextRight = pendingLeft.current.shift() ?? null;
      } else {
        const anotherVisibleMatch = leftSlots.some((item) => item && item.id !== pair.id && rightSlots.some((other) => other?.id === item.id));
        if (anotherVisibleMatch && nextIndex + 1 < pairs.length) {
          nextLeft = pairs[nextIndex];
          nextRight = pairs[nextIndex + 1];
          pendingLeft.current.push(nextLeft);
          pendingRight.current.push(nextRight);
          advance = 2;
        } else if (nextIndex < pairs.length) {
          nextLeft = pairs[nextIndex];
          nextRight = nextLeft;
          advance = 1;
        }
      }
      setLeftSlots((current) => current.map((item) => item?.id === pair.id ? nextLeft : item));
      setRightSlots((current) => current.map((item) => item?.id === pair.id ? nextRight : item));
      if (advance) setNextIndex((value) => value + advance);
      setMatched((count) => {
        const updated = count + 1;
        if (updated === pairs.length) setComplete(true);
        return updated;
      });
      locked.current = false;
    }, 450);
  };

  if (loading) return <div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div role="alert" className="flex min-h-dvh items-center justify-center p-8 text-center text-red-700">{error}</div>;

  const renderSide = (side: Side) => (
    <div className="grid flex-1 gap-3" aria-label={side === "french" ? "French words" : "English words"}>
      {(side === "french" ? leftSlots : rightSlots).map((pair, index) => pair ? (
        <button
          key={`${side}-${pair.id}`}
          type="button"
          onClick={() => choose(side, pair)}
          aria-label={mode === "audio" && side === "french" ? `Play and select French word ${index + 1}` : undefined}
          aria-pressed={selected?.side === side && selected.id === pair.id}
          className={cn(
            "min-h-16 w-full rounded-xl border-2 bg-white px-5 py-3 text-center text-lg font-medium break-words transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-800",
            selected?.side === side && selected.id === pair.id ? "border-sky-500 bg-sky-50 text-sky-900" : "border-slate-200 dark:border-slate-700",
            incorrect.includes(pair.id) && "border-red-500 bg-red-50 text-red-800",
          )}
        >
          {mode === "audio" && side === "french" ? <Volume2 className="mx-auto h-6 w-6" aria-hidden="true" /> : side === "french" ? pair.french : pair.english}
        </button>
      ) : <div key={`${side}-empty-${index}`} className="min-h-16" aria-hidden="true" />)}
    </div>
  );

  return (
    <PracticeGameLayout
      questionType={mode === "audio" ? "Audio Match" : "Match the Words"}
      instructionFr="Associez les paires"
      instructionEn={mode === "audio" ? "Match each sound to its English word" : "Match each French word to its English word"}
      progress={pairs.length ? (matched / pairs.length) * 100 : 0}
      isGameOver={complete}
      score={matched}
      totalQuestions={pairs.length}
      onExit={() => router.push("/vocabulary/practice")}
      onRestart={() => window.location.reload()}
      showSubmitButton={false}
    >
      <div className="mx-auto flex w-full max-w-4xl gap-3 px-3 sm:gap-6">
        {renderSide("french")}
        {renderSide("english")}
      </div>
    </PracticeGameLayout>
  );
}
