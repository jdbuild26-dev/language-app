import { useState, useEffect } from "react";
import { useSpeechSynthesis } from "../../../../hooks/useSpeechSynthesis";
import { Volume2, X, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4">
      {/* The Card Container */}
      <div
        className="relative w-full aspect-[3/2] cursor-pointer group perspective-1000"
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
            className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-8 text-center"
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

            <p className="text-slate-400 text-lg md:text-xl font-medium">
              Question
            </p>
          </div>

          {/* Back Side (Native + Details) */}
          <div
            className="absolute w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col p-8"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Answer
                </h3>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-white">
                  {currentWord.english}
                </h2>
              </div>
              <button
                onClick={(e) => handleSpeak(e, currentWord.forms?.[0]?.word)}
                className="p-3 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center gap-6">
              {currentWord.forms?.map((form, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className={cn("text-xl font-medium", form.genderColor)}>
                    {form.gender}
                  </span>
                  <span className="text-2xl text-slate-700 dark:text-slate-200">
                    {form.word}
                  </span>
                </div>
              ))}

              {currentWord.exampleTarget && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-lg text-slate-700 dark:text-slate-200 mb-2">
                    {currentWord.exampleTarget}
                  </p>
                  <p className="text-slate-500 italic">
                    {currentWord.exampleNative}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flip Button - Now Clickable */}
      <div
        className={cn(
          "absolute bottom-[130px] right-[max(10%,2rem)] md:right-[max(20%,4rem)] transition-opacity duration-300 cursor-pointer z-10",
          isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={handleFlip}
      >
        <div className="bg-sky-600 text-white px-6 py-2 rounded-tl-2xl rounded-br-2xl font-bold shadow-lg transform rotate-[-5deg] hover:scale-105 transition-transform">
          Flip
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-12 w-full max-w-md justify-between px-4">
        {/* Wrong / Don't Know */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onUpdateStats("unknown")}
            className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-orange-500 hover:bg-orange-50 hover:border-orange-200 transition-all hover:-translate-y-1"
          >
            <X className="w-8 h-8" />
          </button>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Don't Know
          </span>
        </div>

        {/* Tick / Known */}
        <button
          onClick={() => onUpdateStats("know")}
          className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200 transition-all hover:-translate-y-1"
        >
          <Check className="w-8 h-8" />
        </button>

        {/* Mastered Button */}
        <button
          onClick={() => onUpdateStats("mastered")}
          className="h-16 px-8 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center justify-center text-white font-bold text-lg hover:bg-emerald-600 transition-all hover:-translate-y-1 ml-4 flex-1"
        >
          Mastered
        </button>
      </div>
    </div>
  );
}
