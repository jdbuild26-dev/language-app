import { useState, useEffect } from "react";
import { useSpeechSynthesis } from "../../../../hooks/useSpeechSynthesis";
import { Volume2, X, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import LearningCard from "../lesson-learn/LearningCard";

export default function FlashcardGame({
  words,
  onComplete,
  onUpdateStats,
  currentIndex,
  total,
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  // We handle the first word in the queue
  const currentWord = words[0];
  const { speak, isSupported } = useSpeechSynthesis();

  // Reset flip state when word changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentWord]);

  if (!currentWord) return null;

  const handleSpeak = (e, text) => {
    e.stopPropagation(); // Prevent flip
    if (isSupported) {
      speak(text, "fr-FR");
    }
  };

  const handleFlip = (e) => {
    if (e) e.stopPropagation();
    setIsFlipped(!isFlipped);
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
            isFlipped ? "rotate-y-180" : ""
          )}
        >
          {/* Front Side (Target Word - French) */}
          <div
            className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Inline style backup for backface-visibility */}

            {/* Top Bar for Card */}
            <div className="absolute top-6 right-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Placeholder
                }}
                className="text-slate-300 hover:text-amber-400 transition-colors"
              >
                <Star className="w-6 h-6" />
              </button>
            </div>

            <h2 className="text-6xl md:text-7xl font-bold text-slate-800 dark:text-white mb-8">
              {currentWord.forms?.[0]?.word || currentWord.french}
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
              <LearningCard word={currentWord} />
            </div>
          </div>
        </div>

        {/* Flip Button - Always Visible */}
        <div
          className={cn(
            "absolute bottom-6 right-6 transition-opacity duration-300 cursor-pointer z-20",
            "opacity-100 hover:scale-105 active:scale-95"
          )}
          onClick={handleFlip}
        >
          <div className="bg-sky-600/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md transition-transform border border-sky-500/50">
            {isFlipped ? "Flip Back" : "Flip"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 mt-12 w-full max-w-md px-4">
        {/* Wrong / Don't Know */}
        <button
          onClick={() => onUpdateStats("unknown")}
          className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-xl border-4 border-slate-50 dark:border-slate-700 flex items-center justify-center text-orange-500 hover:bg-orange-50 hover:border-orange-200 hover:scale-110 active:scale-95 transition-all"
          aria-label="Don't Know"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Tick / Known */}
        <button
          onClick={() => onUpdateStats("know")}
          className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-xl border-4 border-slate-50 dark:border-slate-700 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200 hover:scale-110 active:scale-95 transition-all"
          aria-label="Know"
        >
          <Check className="w-8 h-8" />
        </button>

        {/* Mastered Button */}
        <button
          onClick={() => onUpdateStats("mastered")}
          className="h-16 px-6 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center justify-center text-white font-bold text-lg hover:bg-emerald-600 transition-all hover:-translate-y-1 active:scale-95"
        >
          Mastered
        </button>
      </div>
    </div>
  );
}
