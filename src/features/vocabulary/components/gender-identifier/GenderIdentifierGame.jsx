import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, X, Check } from "lucide-react";

export default function GenderIdentifierGame({ initialWords, onComplete }) {
  const [queue, setQueue] = useState(initialWords);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [animState, setAnimState] = useState("idle");

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center fade-in w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white dark:bg-slate-800/80 backdrop-blur-md p-10 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 w-full"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-6 shadow-inner">
            <Sparkles className="w-10 h-10 text-sky-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Magnifique !
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            You've completed the gender identifier activity.
          </p>

          <div className="flex items-center justify-center gap-6 mb-10">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mb-2 shadow-sm border border-emerald-100 dark:border-emerald-800/50">
                <span className="font-bold text-2xl">{stats.correct}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Correct
              </span>
            </div>
            <div className="w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center mb-2 shadow-sm border border-rose-100 dark:border-rose-800/50">
                <span className="font-bold text-2xl">{stats.incorrect}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Incorrect
              </span>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg active:scale-[0.98]"
          >
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  const currentWord = queue[0];
  const total = initialWords.length;
  const currentIndex = total - queue.length + 1;

  const forms = currentWord.forms || [];
  const formWithGender = forms.find(
    (f) =>
      f.gender &&
      (f.gender.toLowerCase().includes("masculine") ||
        f.gender.toLowerCase().includes("feminine")),
  );

  const trueGenderInfo = formWithGender?.gender?.toLowerCase() || "";
  const isMasculine = trueGenderInfo.includes("masculine");
  const isFeminine = trueGenderInfo.includes("feminine");

  const wordDisplay = formWithGender ? formWithGender.word : currentWord.french;
  const englishMeaning = currentWord.english;

  const imageUrl =
    currentWord.image ||
    `https://ui-avatars.com/api/?name=${wordDisplay.charAt(0)}&background=random&size=200`;

  const handleGuess = (guessedGender) => {
    if (animState !== "idle") return;

    let isCorrect = false;
    if (guessedGender === "masculine" && isMasculine) isCorrect = true;
    if (guessedGender === "feminine" && isFeminine) isCorrect = true;

    if (!isMasculine && !isFeminine) isCorrect = true;

    if (isCorrect) {
      setStats((s) => ({ ...s, correct: s.correct + 1 }));
      setAnimState(
        guessedGender === "masculine"
          ? "correct-masculine"
          : "correct-feminine",
      );
    } else {
      setStats((s) => ({ ...s, incorrect: s.incorrect + 1 }));
      setAnimState("wrong");
    }
  };

  const onAnimationComplete = () => {
    if (animState === "wrong") {
      setAnimState("idle");
    } else if (animState.startsWith("correct")) {
      setAnimState("idle");
      setQueue((q) => q.slice(1));
    }
  };

  // Spring animations for a snappy, tactile feel
  const sharedSpring = {
    type: "spring",
    stiffness: 300,
    damping: 20,
  };

  const variants = {
    idle: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
    wrong: {
      x: [0, -15, 15, -10, 10, -5, 5, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    "correct-masculine": {
      x: -300,
      y: 50,
      rotate: -20,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.4, ease: "easeIn" },
    },
    "correct-feminine": {
      x: 300,
      y: 50,
      rotate: 20,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.4, ease: "easeIn" },
    },
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col pt-2 pb-8 relative z-10 min-h-[600px]">
      {/* Immersive Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-sky-500/5 dark:bg-sky-400/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Progress Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 shrink-0 font-sans tracking-tight">
          Cards:{" "}
          <span className="text-sky-500">
            {currentIndex}/{total}
          </span>
        </span>
        <div className="flex-1 flex gap-1 h-2 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
          {Array.from({ length: total }).map((_, i) => (
            <motion.div
              layout
              key={i}
              className={cn(
                "h-full flex-1 rounded-full",
                i < currentIndex - 1
                  ? "bg-slate-800 dark:bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                  : i === currentIndex - 1
                    ? "bg-sky-400 dark:bg-sky-400 animate-pulse"
                    : "bg-transparent",
              )}
            />
          ))}
        </div>
      </div>

      {/* Cards Stack */}
      <div className="relative w-full aspect-[3/4] sm:aspect-square md:aspect-[3/4] max-h-[480px] mx-auto mb-12 perspective-1000">
        <AnimatePresence>
          {queue
            .slice(0, 3)
            .reverse()
            .map((wordItem) => {
              const isTopCard = wordItem.id === currentWord.id;
              const stackIndex = queue.findIndex((w) => w.id === wordItem.id);
              if (stackIndex > 2) return null;

              // Visual styling based on state
              let bgClass = "bg-white dark:bg-slate-800";
              let borderClass =
                "border-slate-200/60 dark:border-slate-700/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]";

              if (isTopCard) {
                if (animState === "wrong") {
                  bgClass = "bg-[#fff5f5] dark:bg-[#3f1616]";
                  borderClass =
                    "border-red-500 dark:border-red-500 shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)]";
                } else if (animState === "correct-masculine") {
                  bgClass = "bg-[#f0f9ff] dark:bg-[#0c2e47]";
                  borderClass =
                    "border-sky-500 dark:border-sky-500 shadow-[0_0_40px_-10px_rgba(14,165,233,0.4)]";
                } else if (animState === "correct-feminine") {
                  bgClass = "bg-[#fff1f2] dark:bg-[#431424]";
                  borderClass =
                    "border-rose-500 dark:border-rose-500 shadow-[0_0_40px_-10px_rgba(244,63,94,0.4)]";
                }
              }

              return (
                <motion.div
                  layout
                  key={wordItem.id}
                  className={cn(
                    "absolute inset-0 rounded-[2.5rem] border-2 flex flex-col overflow-hidden will-change-transform origin-bottom backdrop-blur-xl transition-colors duration-300",
                    bgClass,
                    borderClass,
                  )}
                  initial={false}
                  animate={isTopCard ? animState : "idle"}
                  variants={isTopCard ? variants : {}}
                  onAnimationComplete={
                    isTopCard ? onAnimationComplete : undefined
                  }
                  style={{
                    zIndex: 3 - stackIndex,
                    translateY: isTopCard ? 0 : stackIndex * 18,
                    scale: isTopCard ? 1 : 1 - stackIndex * 0.05,
                    opacity: isTopCard ? 1 : 1 - stackIndex * 0.3,
                  }}
                  transition={
                    isTopCard && animState === "idle"
                      ? sharedSpring
                      : { duration: 0.3 }
                  }
                >
                  {/* Status Overlay icon */}
                  {isTopCard && animState !== "idle" && (
                    <div className="absolute top-6 right-6 z-20">
                      {animState === "wrong" && (
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg animate-bounce">
                          <X className="w-6 h-6" />
                        </div>
                      )}
                      {animState.startsWith("correct") && (
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
                          <Check className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Area - minimal height */}
                  <div className="h-2/5 md:h-1/2 p-4 relative overflow-hidden group">
                    <div className="w-full h-full rounded-3xl overflow-hidden shadow-inner border border-slate-100 dark:border-slate-700/50 relative bg-slate-100 dark:bg-slate-900">
                      <img
                        src={imageUrl}
                        alt={wordDisplay}
                        width={400}
                        height={400}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-center pb-4">
                        <span className="text-white text-sm font-medium tracking-wide">
                          {englishMeaning}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Word Area */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 bg-gradient-to-b from-transparent to-white/50 dark:to-slate-900/50">
                    <h3 className="text-4xl sm:text-5xl font-serif text-slate-800 dark:text-white capitalize tracking-tight px-4 text-center font-bold mb-3 drop-shadow-sm">
                      {wordDisplay}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 font-sans tracking-wide uppercase text-xs font-semibold">
                      Select Gender
                    </p>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 mt-auto">
        <button
          className={cn(
            "group py-5 px-6 rounded-3xl font-bold text-lg flex flex-col items-center justify-center gap-1 transition-transform active:scale-[0.96] shadow-md border-b-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30",
            "bg-gradient-to-br from-sky-400 to-blue-500 text-white border-blue-600 hover:from-sky-300 hover:to-blue-400",
            "dark:from-sky-600 dark:to-blue-700 dark:border-blue-900 dark:shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)]",
            animState !== "idle" && "opacity-50 pointer-events-none",
          )}
          onClick={() => handleGuess("masculine")}
          aria-label="Guess Masculine"
        >
          <span className="text-white drop-shadow-sm tracking-wide">
            Masculine
          </span>
          <span className="text-2xl drop-shadow-sm group-hover:-translate-y-1 transition-transform duration-300">
            ♂
          </span>
        </button>
        <button
          className={cn(
            "group py-5 px-6 rounded-3xl font-bold text-lg flex flex-col items-center justify-center gap-1 transition-transform active:scale-[0.96] shadow-md border-b-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/30",
            "bg-gradient-to-br from-pink-400 to-rose-500 text-white border-rose-600 hover:from-pink-300 hover:to-rose-400",
            "dark:from-rose-600 dark:to-pink-700 dark:border-pink-900 dark:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]",
            animState !== "idle" && "opacity-50 pointer-events-none",
          )}
          onClick={() => handleGuess("feminine")}
          aria-label="Guess Feminine"
        >
          <span className="text-white drop-shadow-sm tracking-wide">
            Feminine
          </span>
          <span className="text-2xl drop-shadow-sm group-hover:-translate-y-1 transition-transform duration-300">
            ♀
          </span>
        </button>
      </div>
    </div>
  );
}
