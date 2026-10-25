"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import AudioWaveform from "@/components/ui/AudioWaveform";
import { fetchMatchPairsData } from "@/services/vocabularyApi";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";

import { completeMatch, createMatchBoard, type MatchBoard, type MatchPair as Pair } from "@/features/vocabulary/lib/rollingMatch";
type Side = "french" | "english";

/** Fixed slots draw independently from a shared pool, keeping matches available. */
export default function RollingMatchPage({ mode = "words", pairLimit = 30 }: { mode?: "words" | "audio"; pairLimit?: number }) {
  const router = useRouter();
  const { speak, cancel, isSpeaking } = useTextToSpeech();
  const visibleCount = mode === "audio" ? 6 : 4;
  const [board, setBoard] = useState<MatchBoard | null>(null);
  const pairs = board?.pairs ?? [];
  const leftSlots = board?.leftSlots ?? [];
  const rightSlots = board?.rightSlots ?? [];
  const matched = board?.matched ?? 0;
  const complete = !!board && matched === pairs.length;
  const [selected, setSelected] = useState<{ side: Side; id: string } | null>(null);
  const [playingPairId, setPlayingPairId] = useState<string | null>(null);
  const [incorrect, setIncorrect] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);

  useEffect(() => () => cancel(), [cancel]);

  useEffect(() => {
    let active = true;
    fetchMatchPairsData(undefined)
      .then((data: Pair[]) => {
        if (!active) return;
        setBoard(createMatchBoard(data, { visibleCount, pairLimit }));
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load matching words.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [visibleCount, pairLimit]);

  const choose = (side: Side, pair: Pair) => {
    if (locked.current || complete) return;
    if (mode === "words") {
      speak(side === "french" ? pair.french : pair.english, side === "french" ? "fr-FR" : "en-US", 1);
    }
    if (mode === "audio" && side === "french") {
      setPlayingPairId(pair.id);
      speak(pair.french, "fr-FR", 0.9, {
        onEnd: () => setPlayingPairId((current) => current === pair.id ? null : current),
        onError: () => setPlayingPairId((current) => current === pair.id ? null : current),
      });
    }
    if (mode === "audio" && side === "english") {
      setPlayingPairId(null);
      speak(pair.english, "en-US");
    }
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
      if (board) setBoard(completeMatch(board, pair.id));
      locked.current = false;
    }, 450);
  };

  if (loading) return <div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div role="alert" className="flex min-h-dvh items-center justify-center p-8 text-center text-red-700">{error}</div>;

  const renderSide = (side: Side) => (
    <div className="grid min-w-0 flex-1 gap-3" aria-label={side === "french" ? "French words" : "English words"}>
      {(side === "french" ? leftSlots : rightSlots).map((pair, index) => pair ? (
        <div key={`${side}-${pair.id}`} className="relative min-w-0">
        <button
          type="button"
          onClick={() => choose(side, pair)}
          aria-label={mode === "audio" && side === "french" ? `Play and select French word ${index + 1}` : undefined}
          aria-pressed={selected?.side === side && selected.id === pair.id}
          className={cn(
            "min-w-0 w-full rounded-xl border-2 border-solid bg-white text-center font-medium [overflow-wrap:anywhere] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-800",
            mode === "words" ? "min-h-24 px-12 py-6 text-[21px] leading-relaxed" : "min-h-16 px-5 py-3 text-lg",
            selected?.side === side && selected.id === pair.id ? "border-sky-500 bg-sky-50 text-sky-900" : "border-slate-200 dark:border-slate-700",
            incorrect.includes(pair.id) && "border-red-500 bg-red-50 text-red-800",
          )}
        >
          {mode === "audio" && side === "french"
            ? <AudioWaveform size="compact" patternKey={pair.id} isPlaying={isSpeaking && playingPairId === pair.id} decorative className="mx-auto w-36 max-w-full" />
            : side === "french" ? pair.french : pair.english}
        </button>
        </div>
      ) : <div key={`${side}-empty-${index}`} className={mode === "words" ? "min-h-24" : "min-h-16"} aria-hidden="true" />)}
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
      <div className={cn("flex w-full gap-3 px-3 pb-8 sm:gap-6 sm:px-6", mode === "words" ? "mx-auto mt-8 max-w-5xl sm:mt-10 lg:mt-12" : "m-auto max-w-4xl py-6 sm:py-8")}>
        {renderSide("french")}
        {renderSide("english")}
      </div>
    </PracticeGameLayout>
  );
}
