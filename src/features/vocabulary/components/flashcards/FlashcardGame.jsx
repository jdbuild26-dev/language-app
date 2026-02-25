import { useState, useEffect } from "react";
import { useSpeechSynthesis } from "../../../../hooks/useSpeechSynthesis";
import { Volume2, ThumbsDown, ThumbsUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import LearningCard from "../lesson-learn/LearningCard";

export default function FlashcardGame({
  words,
  onComplete,
  onUpdateStats,
  currentIndex,
  total,
  user,
  settings,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  // Generate a transient session ID for this game instance
  const [sessionId] = useState(() => crypto.randomUUID());

  // We handle the first word in the queue
  const currentWord = words[0];
  const { speak, isSupported } = useSpeechSynthesis();

  // Reset flip state when word changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentWord]);

  // Handle auto-play audio based on settings
  useEffect(() => {
    if (!currentWord || !isSupported || !settings?.autoPlayAudio) return;

    // We only want to play audio if we're seeing the French side
    // (either frontSide is French and not flipped, or frontSide is English and flipped)
    const isShowingFrench =
      (settings.frontSide === "French" && !isFlipped) ||
      (settings.frontSide === "English" && isFlipped);

    if (isShowingFrench) {
      // Little delay to let the animation happen before speaking
      const timer = setTimeout(
        () => {
          const textToSpeak =
            currentWord.forms?.[0]?.word || currentWord.french;
          if (textToSpeak) speak(textToSpeak, "fr-FR");
        },
        isFlipped ? 300 : 0,
      );
      return () => clearTimeout(timer);
    }
  }, [currentWord, isFlipped, settings, isSupported, speak]);

  if (!currentWord) return null;

  const handleSpeak = (e, text) => {
    e.stopPropagation(); // Prevent flip
    if (isSupported) {
      speak(text, "fr-FR");
    }
  };

  const handleFlip = (e) => {
    if (e) e.stopPropagation();
    const newFlipState = !isFlipped;
    setIsFlipped(newFlipState);
  };

  // If backface-hidden is not working, we can use conditional z-index or visibility
  // But let's rely on the CSS classes we will add.

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4">
      {/* The Card Container */}
      <div
        className="relative w-full h-[650px] cursor-pointer group perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={cn(
            "relative w-full h-full duration-500 preserve-3d transition-transform",
            isFlipped ? "rotate-y-180" : "",
          )}
        >
          {/* Front Side (Target Word - French) */}
          <div
            className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <h2 className="text-6xl md:text-7xl font-bold text-slate-800 dark:text-white mb-8 px-4">
              {settings?.frontSide === "English"
                ? currentWord.english
                : currentWord.forms?.[0]?.word || currentWord.french}
            </h2>
          </div>

          {/* Back Side (Native + Details) */}
          <div
            className="absolute w-full h-full backface-hidden rotate-y-180 rounded-[2rem] overflow-y-auto no-scrollbar"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Render LearningCard directly. 
                LearningCard has its own styles (bg-white, shadow, etc.) which will act as the card face.
                We just need to make sure the user can interact with it. 
                Propagation handled in LearningCard buttons? No, we might need to stop propagation here if clicking back flips it.
                Actually, the container has onClick={handleFlip}. So clicking anywhere on back will flip.
                Interactive elements in LearningCard need e.stopPropagation().
                Most buttons in LearningCard do not have stopPropagation by default (except maybe specific ones).
                However, for now, let's just render it. The user interaction with buttons inside LearningCard needs to be verified.
             */}
            <div onClick={(e) => e.stopPropagation()}>
              <LearningCard word={currentWord} sessionId={sessionId} />
            </div>
          </div>
        </div>

        {/* Flip Button - Always Visible */}
        <div
          className={cn(
            "absolute bottom-6 right-6 transition-opacity duration-300 cursor-pointer z-20",
            "opacity-100 hover:scale-105 active:scale-95",
          )}
          onClick={handleFlip}
        >
          <div className="bg-sky-600/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md transition-transform border border-sky-500/50">
            {isFlipped ? "Flip Back" : "Flip"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-12 w-full max-w-md px-4 perspective-1000">
        {/* Wrong / Don't Know */}
        <div className="group relative">
          <button
            onClick={() => {
              onUpdateStats("unknown");
            }}
            className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-xl border-4 border-slate-50 dark:border-slate-700 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 hover:scale-110 active:scale-95 transition-all"
            aria-label="Don't recall"
          >
            <ThumbsDown className="w-8 h-8 fill-current" />
          </button>

          {/* Tooltip */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg">
            Don't recall
          </div>
        </div>

        {/* Need to see more (Middle Button) */}
        <div className="group relative">
          <button
            onClick={() => {
              onUpdateStats("know");
            }}
            className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-xl border-4 border-slate-50 dark:border-slate-700 flex items-center justify-center text-amber-500 hover:bg-amber-50 hover:border-amber-200 hover:scale-110 active:scale-95 transition-all"
            aria-label="Need to see more"
          >
            <ThumbsUp className="w-8 h-8 fill-current" />
          </button>

          {/* Tooltip */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg">
            Need to see more
          </div>
        </div>

        {/* Confident Button */}
        <div className="group relative">
          <button
            onClick={() => {
              onUpdateStats("mastered");
            }}
            className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-xl border-4 border-slate-50 dark:border-slate-700 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200 hover:scale-110 active:scale-95 transition-all"
            aria-label="Confident"
          >
            <ThumbsUp className="w-8 h-8 fill-current" />
          </button>

          {/* Tooltip */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg">
            Confident
          </div>
        </div>
      </div>
    </div>
  );
}
